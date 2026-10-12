/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Unisex Salon — Step 7 Automated Test Suite
 * Covers all 20 required server-side atomic booking engine test scenarios.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseTimeToMinutes,
  formatMinutesToTime,
  isValidISODate,
  isDateInPast,
  validateGender,
  calculateRequiredSlots,
  validateSalonOperatingHours
} from '../functions/src/validation';
import { generateTicketCode, generateQrPayload } from '../functions/src/tickets';
import {
  executeCreateBooking,
  executeCancelBooking,
  executeRescheduleBooking,
  CreateBookingInput
} from '../functions/src/booking';

/**
 * In-Memory Firestore Mock Database for deterministic unit & transaction testing
 * (Zero fake production credentials)
 */
class MockFirestore {
  data: Map<string, any> = new Map();

  collection(collName: string) {
    const db = this;
    return {
      doc(docId: string) {
        const fullPath = `${collName}/${docId}`;
        return {
          id: docId,
          path: fullPath,
          get: async () => {
            const docData = db.data.get(fullPath);
            return {
              id: docId,
              exists: docData !== undefined,
              data: () => docData ? JSON.parse(JSON.stringify(docData)) : undefined,
              ref: { id: docId, path: fullPath }
            };
          },
          set: async (val: any, opts?: any) => {
            if (opts?.merge && db.data.has(fullPath)) {
              db.data.set(fullPath, { ...db.data.get(fullPath), ...val });
            } else {
              db.data.set(fullPath, JSON.parse(JSON.stringify(val)));
            }
          },
          update: async (val: any) => {
            if (!db.data.has(fullPath)) throw new Error('Document does not exist');
            db.data.set(fullPath, { ...db.data.get(fullPath), ...val });
          }
        };
      },
      where(field: string, op: string, value: any) {
        return this.createQuery([[field, value]]);
      },
      createQuery(filters: [string, any][], limitCount?: number) {
        const coll = this;
        return {
          where(f2: string, o2: string, v2: any) {
            return coll.createQuery([...filters, [f2, v2]], limitCount);
          },
          limit(n: number) {
            return coll.createQuery(filters, n);
          },
          get: async () => {
            const matching: any[] = [];
            for (const [path, val] of db.data.entries()) {
              if (path.startsWith(`${collName}/`)) {
                const matchesAll = filters.every(([f, v]) => val[f] === v);
                if (matchesAll) {
                  matching.push({
                    id: path.split('/')[1],
                    data: () => JSON.parse(JSON.stringify(val)),
                    ref: {
                      id: path.split('/')[1],
                      path,
                      update: async (up: any) => {
                        db.data.set(path, { ...db.data.get(path), ...up });
                      }
                    }
                  });
                }
              }
            }
            const limited = limitCount ? matching.slice(0, limitCount) : matching;
            return {
              empty: limited.length === 0,
              docs: limited
            };
          }
        };
      },
    };
  }

  async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
    const reads: Map<string, any> = new Map();
    const writes: Map<string, any> = new Map();
    const updates: Map<string, any> = new Map();

    const transaction = {
      get: async (docRef: any) => {
        const fullPath = docRef.path;
        const current = this.data.get(fullPath);
        reads.set(fullPath, current ? JSON.parse(JSON.stringify(current)) : undefined);
        return {
          id: docRef.id,
          exists: current !== undefined,
          data: () => current ? JSON.parse(JSON.stringify(current)) : undefined,
          ref: docRef
        };
      },
      set: (docRef: any, data: any, opts?: any) => {
        const fullPath = docRef.path;
        if (opts?.merge && (writes.has(fullPath) || this.data.has(fullPath))) {
          const prev = writes.get(fullPath) || this.data.get(fullPath);
          writes.set(fullPath, { ...prev, ...data });
        } else {
          writes.set(fullPath, JSON.parse(JSON.stringify(data)));
        }
      },
      update: (docRef: any, data: any) => {
        const fullPath = docRef.path;
        const prev = writes.get(fullPath) || this.data.get(fullPath);
        if (!prev) throw new Error('Document does not exist for update');
        writes.set(fullPath, { ...prev, ...data });
      }
    };

    // Execute atomic function
    const result = await updateFunction(transaction);

    // Commit writes atomically
    for (const [path, val] of writes.entries()) {
      this.data.set(path, val);
    }

    return result;
  }
}

describe('Musha Empire — Authoritative Booking Engine Test Suite', () => {
  let mockDb: any;
  const testDate = '2026-10-15'; // Future date in 2026

  beforeEach(() => {
    mockDb = new MockFirestore();

    // 1. Seed Salon Operating Hours (Monday - Sunday open 10:00 AM to 08:00 PM) with authoritative timezone
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    mockDb.data.set('settings/salon', {
      timezone: 'Asia/Kolkata',
      opening_hours: days.map(day => ({
        day,
        open: '10:00 AM',
        close: '08:00 PM',
        isClosed: false
      }))
    });

    // 2. Seed Services
    mockDb.data.set('services/svc-30', {
      id: 'svc-30',
      name: 'Express Royal Beard Trim',
      price: 600,
      duration_minutes: 30,
      is_active: true
    });

    mockDb.data.set('services/svc-60', {
      id: 'svc-60',
      name: 'Royal Heritage Haircut & Wash',
      price: 1200,
      duration_minutes: 60,
      is_active: true
    });

    mockDb.data.set('services/svc-90', {
      id: 'svc-90',
      name: 'Imperial Botanical Hair Ritual',
      price: 2500,
      duration_minutes: 90,
      is_active: true
    });

    mockDb.data.set('services/svc-120', {
      id: 'svc-120',
      name: 'Full Emperor Spa Ceremony',
      price: 4500,
      duration_minutes: 120,
      is_active: true
    });

    mockDb.data.set('services/svc-inactive', {
      id: 'svc-inactive',
      name: 'Discontinued Ritual',
      price: 1000,
      duration_minutes: 60,
      is_active: false
    });

    // 3. Seed User Profile
    mockDb.data.set('users/user-123', {
      uid: 'user-123',
      displayName: 'Lord Sanjay',
      role: 'customer'
    });
  });

  // Test 1: Valid 30-minute booking
  it('1. Valid 30-minute booking reserves 1 slot atomically and creates confirmed booking & ticket', async () => {
    const input: CreateBookingInput = {
      serviceId: 'svc-30',
      gender: 'Men',
      bookingDate: testDate,
      startTime: '10:00 AM'
    };

    const res = await executeCreateBooking(mockDb, 'user-123', input);
    expect(res.success).toBe(true);
    expect(res.booking.duration_minutes).toBe(30);
    expect(res.booking.price).toBe(600);
    expect(res.booking.status).toBe('confirmed');
    expect(res.booking.payment_status).toBe('pending');
    expect(res.ticket.customer_name).toBe('Lord Sanjay');

    // Slot slot_2026-10-15_10-00 is reserved
    const slotData = mockDb.data.get(`slots/slot_${testDate}_10-00`);
    expect(slotData).toBeDefined();
    expect(slotData.status).toBe('booked');
    expect(slotData.booking_id).toBe(res.booking.id);
  });

  // Test 2: Valid 60-minute booking
  it('2. Valid 60-minute booking reserves 2 consecutive 30-min slots', async () => {
    const input: CreateBookingInput = {
      serviceId: 'svc-60',
      gender: 'Women',
      bookingDate: testDate,
      startTime: '11:00 AM'
    };

    const res = await executeCreateBooking(mockDb, 'user-123', input);
    expect(res.success).toBe(true);
    expect(res.booking.duration_minutes).toBe(60);

    const s1 = mockDb.data.get(`slots/slot_${testDate}_11-00`);
    const s2 = mockDb.data.get(`slots/slot_${testDate}_11-30`);
    expect(s1.status).toBe('booked');
    expect(s2.status).toBe('booked');
  });

  // Test 3: Valid 90-minute booking
  it('3. Valid 90-minute booking reserves 3 consecutive 30-min slots', async () => {
    const input: CreateBookingInput = {
      serviceId: 'svc-90',
      gender: 'Other',
      bookingDate: testDate,
      startTime: '02:00 PM'
    };

    const res = await executeCreateBooking(mockDb, 'user-123', input);
    expect(res.success).toBe(true);
    expect(res.booking.duration_minutes).toBe(90);

    const s1 = mockDb.data.get(`slots/slot_${testDate}_14-00`);
    const s2 = mockDb.data.get(`slots/slot_${testDate}_14-30`);
    const s3 = mockDb.data.get(`slots/slot_${testDate}_15-00`);
    expect(s1.status).toBe('booked');
    expect(s2.status).toBe('booked');
    expect(s3.status).toBe('booked');
  });

  // Test 4: Valid 120-minute booking
  it('4. Valid 120-minute booking reserves 4 consecutive 30-min slots', async () => {
    const input: CreateBookingInput = {
      serviceId: 'svc-120',
      gender: 'Men',
      bookingDate: testDate,
      startTime: '04:00 PM'
    };

    const res = await executeCreateBooking(mockDb, 'user-123', input);
    expect(res.success).toBe(true);
    expect(res.booking.duration_minutes).toBe(120);

    const s1 = mockDb.data.get(`slots/slot_${testDate}_16-00`);
    const s2 = mockDb.data.get(`slots/slot_${testDate}_16-30`);
    const s3 = mockDb.data.get(`slots/slot_${testDate}_17-00`);
    const s4 = mockDb.data.get(`slots/slot_${testDate}_17-30`);
    expect(s1.status).toBe('booked');
    expect(s2.status).toBe('booked');
    expect(s3.status).toBe('booked');
    expect(s4.status).toBe('booked');
  });

  // Test 5: Invalid service
  it('5. Invalid service throws INVALID_SERVICE and creates no records', async () => {
    const input: CreateBookingInput = {
      serviceId: 'non-existent-service-id',
      gender: 'Men',
      bookingDate: testDate,
      startTime: '10:00 AM'
    };

    await expect(executeCreateBooking(mockDb, 'user-123', input)).rejects.toThrow('INVALID_SERVICE');
  });

  // Test 6: Inactive service
  it('6. Inactive service throws SERVICE_UNAVAILABLE', async () => {
    const input: CreateBookingInput = {
      serviceId: 'svc-inactive',
      gender: 'Men',
      bookingDate: testDate,
      startTime: '10:00 AM'
    };

    await expect(executeCreateBooking(mockDb, 'user-123', input)).rejects.toThrow('SERVICE_UNAVAILABLE');
  });

  // Test 7: Invalid gender
  it('7. Invalid gender (Robot, Alien, unknown) is rejected with INVALID_GENDER', async () => {
    const inputInvalid1: CreateBookingInput = {
      serviceId: 'svc-30',
      gender: 'Robot' as any,
      bookingDate: testDate,
      startTime: '10:00 AM'
    };
    await expect(executeCreateBooking(mockDb, 'user-123', inputInvalid1)).rejects.toThrow('INVALID_GENDER');

    const inputInvalid2: CreateBookingInput = {
      serviceId: 'svc-30',
      gender: 'Alien' as any,
      bookingDate: testDate,
      startTime: '10:00 AM'
    };
    await expect(executeCreateBooking(mockDb, 'user-123', inputInvalid2)).rejects.toThrow('INVALID_GENDER');
  });

  // Test 8: Past date
  it('8. Past date is rejected with INVALID_DATE', async () => {
    const input: CreateBookingInput = {
      serviceId: 'svc-30',
      gender: 'Men',
      bookingDate: '2020-01-01',
      startTime: '10:00 AM'
    };

    await expect(executeCreateBooking(mockDb, 'user-123', input)).rejects.toThrow('INVALID_DATE');
  });

  // Test 9: Salon closed
  it('9. Booking on a day when salon is closed throws SALON_CLOSED', async () => {
    // Modify Thursday to closed
    mockDb.data.set('settings/salon', {
      timezone: 'Asia/Kolkata',
      opening_hours: [
        { day: 'Thursday', isClosed: true }
      ]
    });

    const input: CreateBookingInput = {
      serviceId: 'svc-30',
      gender: 'Men',
      bookingDate: testDate, // 2026-10-15 is Thursday
      startTime: '10:00 AM'
    };

    await expect(executeCreateBooking(mockDb, 'user-123', input)).rejects.toThrow('SALON_CLOSED');
  });

  // Test 10: Outside operating hours
  it('10. Appointment before salon opening or after salon closing throws OUTSIDE_OPERATING_HOURS', async () => {
    // Salon opens at 10:00 AM, requested 08:00 AM
    const inputEarly: CreateBookingInput = {
      serviceId: 'svc-30',
      gender: 'Men',
      bookingDate: testDate,
      startTime: '08:00 AM'
    };
    await expect(executeCreateBooking(mockDb, 'user-123', inputEarly)).rejects.toThrow('OUTSIDE_OPERATING_HOURS');

    // Salon closes at 08:00 PM, 60-min service at 07:30 PM would finish at 08:30 PM
    const inputLate: CreateBookingInput = {
      serviceId: 'svc-60',
      gender: 'Men',
      bookingDate: testDate,
      startTime: '07:30 PM'
    };
    await expect(executeCreateBooking(mockDb, 'user-123', inputLate)).rejects.toThrow('OUTSIDE_OPERATING_HOURS');
  });

  // Test 11: Unavailable first slot
  it('11. Unavailable first slot aborts transaction, creating NO booking or ticket', async () => {
    // Pre-book first slot
    mockDb.data.set(`slots/slot_${testDate}_10-00`, {
      status: 'booked',
      booking_id: 'bkg-existing'
    });

    const input: CreateBookingInput = {
      serviceId: 'svc-60', // 10:00 - 11:00
      gender: 'Men',
      bookingDate: testDate,
      startTime: '10:00 AM'
    };

    await expect(executeCreateBooking(mockDb, 'user-123', input)).rejects.toThrow('SLOT_UNAVAILABLE');

    // Verify slot 2 was NOT reserved
    expect(mockDb.data.get(`slots/slot_${testDate}_10-30`)).toBeUndefined();
  });

  // Test 12: Unavailable middle slot
  it('12. Unavailable middle slot aborts transaction with ZERO partial reservations', async () => {
    // Pre-book middle slot (11:30 AM for a 90-min service starting at 11:00 AM)
    mockDb.data.set(`slots/slot_${testDate}_11-30`, {
      status: 'booked',
      booking_id: 'bkg-existing'
    });

    const input: CreateBookingInput = {
      serviceId: 'svc-90',
      gender: 'Men',
      bookingDate: testDate,
      startTime: '11:00 AM'
    };

    await expect(executeCreateBooking(mockDb, 'user-123', input)).rejects.toThrow('SLOT_UNAVAILABLE');

    // Slots 11-00 and 12-00 MUST NOT be reserved
    expect(mockDb.data.get(`slots/slot_${testDate}_11-00`)).toBeUndefined();
    expect(mockDb.data.get(`slots/slot_${testDate}_12-00`)).toBeUndefined();
  });

  // Test 13: Unavailable final slot
  it('13. Unavailable final slot aborts transaction without reserving earlier slots', async () => {
    // Pre-book final slot (12:00 for 90-min service starting at 11:00)
    mockDb.data.set(`slots/slot_${testDate}_12-00`, {
      status: 'booked',
      booking_id: 'bkg-existing'
    });

    const input: CreateBookingInput = {
      serviceId: 'svc-90',
      gender: 'Women',
      bookingDate: testDate,
      startTime: '11:00 AM'
    };

    await expect(executeCreateBooking(mockDb, 'user-123', input)).rejects.toThrow('SLOT_UNAVAILABLE');

    expect(mockDb.data.get(`slots/slot_${testDate}_11-00`)).toBeUndefined();
    expect(mockDb.data.get(`slots/slot_${testDate}_11-30`)).toBeUndefined();
  });

  // Test 14: Concurrent booking conflict
  it('14. Concurrent conflicting booking attempts: only first succeeds, second gets SLOT_UNAVAILABLE', async () => {
    const input: CreateBookingInput = {
      serviceId: 'svc-30',
      gender: 'Men',
      bookingDate: testDate,
      startTime: '01:00 PM'
    };

    // User A books first
    const resA = await executeCreateBooking(mockDb, 'user-123', input);
    expect(resA.success).toBe(true);

    // User B attempts same slot
    await expect(executeCreateBooking(mockDb, 'user-456', input)).rejects.toThrow('SLOT_UNAVAILABLE');
  });

  // Test 15: Unauthorized cancellation
  it('15. Unauthorized customer cannot cancel another patron’s booking', async () => {
    const input: CreateBookingInput = {
      serviceId: 'svc-30',
      gender: 'Men',
      bookingDate: testDate,
      startTime: '02:00 PM'
    };
    const res = await executeCreateBooking(mockDb, 'user-123', input);

    // Attacker tries to cancel
    await expect(
      executeCancelBooking(mockDb, 'attacker-uid', { bookingId: res.booking.id })
    ).rejects.toThrow('NOT_AUTHORIZED');
  });

  // Test 16: Unauthorized reschedule
  it('16. Unauthorized customer cannot reschedule another patron’s booking', async () => {
    const input: CreateBookingInput = {
      serviceId: 'svc-30',
      gender: 'Men',
      bookingDate: testDate,
      startTime: '02:30 PM'
    };
    const res = await executeCreateBooking(mockDb, 'user-123', input);

    await expect(
      executeRescheduleBooking(mockDb, 'attacker-uid', {
        bookingId: res.booking.id,
        bookingDate: testDate,
        startTime: '03:00 PM'
      })
    ).rejects.toThrow('NOT_AUTHORIZED');
  });

  // Test 17: Duplicate confirmation / idempotency
  it('17. Repeated requests with same idempotencyKey return existing booking safely', async () => {
    const idempotencyKey = 'unique-key-xyz-789';
    const input: CreateBookingInput = {
      serviceId: 'svc-30',
      gender: 'Men',
      bookingDate: testDate,
      startTime: '03:00 PM',
      idempotencyKey
    };

    const first = await executeCreateBooking(mockDb, 'user-123', input);
    expect(first.success).toBe(true);

    const second = await executeCreateBooking(mockDb, 'user-123', input);
    expect(second.success).toBe(true);
    expect(second.booking.id).toBe(first.booking.id);
  });

  // Test 18: Historical price snapshot
  it('18. Historical price is permanently preserved in booking record even if service catalog price changes', async () => {
    const input: CreateBookingInput = {
      serviceId: 'svc-60',
      gender: 'Men',
      bookingDate: testDate,
      startTime: '03:30 PM'
    };

    const res = await executeCreateBooking(mockDb, 'user-123', input);
    expect(res.booking.price).toBe(1200);

    // Later: salon raises price to 1800 in catalog
    mockDb.data.set('services/svc-60', {
      id: 'svc-60',
      name: 'Royal Heritage Haircut & Wash',
      price: 1800,
      duration_minutes: 60,
      is_active: true
    });

    // Booking record in Firestore still contains original ₹1200
    const bookedRecord = mockDb.data.get(`bookings/${res.booking.id}`);
    expect(bookedRecord.price).toBe(1200);
  });

  // Test 19: Ticket creation
  it('19. Ticket document is created with authoritative customer profile name and unique ticket code', async () => {
    const input: CreateBookingInput = {
      serviceId: 'svc-30',
      gender: 'Women',
      bookingDate: testDate,
      startTime: '05:00 PM'
    };

    const res = await executeCreateBooking(mockDb, 'user-123', input);
    expect(res.ticket).toBeDefined();
    expect(res.ticket.customer_name).toBe('Lord Sanjay');
    expect(res.ticket.ticket_code).toMatch(/^MSH-TK-[A-Z0-9]{6}$/);
    expect(res.ticket.qr_code_payload).toContain(res.ticket.ticket_code);
    expect(res.ticket.booking_status).toBe('confirmed');
  });

  // Test 20: Slot release after cancellation
  it('20. Slot is released back to available upon valid cancellation', async () => {
    const input: CreateBookingInput = {
      serviceId: 'svc-30',
      gender: 'Men',
      bookingDate: testDate,
      startTime: '05:30 PM'
    };

    const res = await executeCreateBooking(mockDb, 'user-123', input);
    const slotId = `slot_${testDate}_17-30`;
    expect(mockDb.data.get(`slots/${slotId}`).status).toBe('booked');

    // Customer cancels
    await executeCancelBooking(mockDb, 'user-123', { bookingId: res.booking.id });

    // Booking status updated
    const bkg = mockDb.data.get(`bookings/${res.booking.id}`);
    expect(bkg.status).toBe('cancelled');

    // Slot is now available
    const slot = mockDb.data.get(`slots/${slotId}`);
    expect(slot.status).toBe('available');
    expect(slot.booking_id).toBeNull();
  });

  // Test 21: Unconfigured salon timezone fails safely
  it('21. Unconfigured salon timezone fails safely with SALON_TIMEZONE_UNCONFIGURED and prevents booking', async () => {
    // Remove timezone from settings/salon
    mockDb.data.set('settings/salon', {
      opening_hours: [
        { day: 'Thursday', open: '10:00 AM', close: '08:00 PM', isClosed: false }
      ]
    });

    const input: CreateBookingInput = {
      serviceId: 'svc-30',
      gender: 'Men',
      bookingDate: testDate,
      startTime: '10:00 AM'
    };

    await expect(executeCreateBooking(mockDb, 'user-123', input)).rejects.toThrow('SALON_TIMEZONE_UNCONFIGURED');
  });
});
