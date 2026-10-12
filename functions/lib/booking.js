"use strict";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Unisex Salon — Authoritative Atomic Booking Engine
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCreateBooking = executeCreateBooking;
exports.executeCancelBooking = executeCancelBooking;
exports.executeRescheduleBooking = executeRescheduleBooking;
const https_1 = require("firebase-functions/v2/https");
const crypto = __importStar(require("crypto"));
const validation_1 = require("./validation");
const tickets_1 = require("./tickets");
const availability_1 = require("./availability");
const catalog_1 = require("./catalog");
/**
 * Executes authoritative, transactional booking creation.
 * Guarantees zero partial reservations and strict race condition protection.
 */
async function executeCreateBooking(db, uid, data) {
    if (!uid) {
        throw new https_1.HttpsError('unauthenticated', 'AUTH_REQUIRED');
    }
    const { serviceId, gender: rawGender, bookingDate, startTime, notes, idempotencyKey } = data || {};
    if (!serviceId || !rawGender || !bookingDate || !startTime) {
        throw new https_1.HttpsError('invalid-argument', 'INVALID_SERVICE');
    }
    // 1. Gender Validation
    let gender;
    try {
        gender = (0, validation_1.validateGender)(rawGender);
    }
    catch {
        throw new https_1.HttpsError('invalid-argument', 'INVALID_GENDER');
    }
    // 2. Authoritative Operating Hours & Timezone (from Firestore settings/salon)
    let salonSnap = await db.collection('settings').doc('salon').get();
    if (!salonSnap.exists) {
        salonSnap = await db.collection('settings').doc('general').get();
    }
    if (!salonSnap.exists) {
        throw new https_1.HttpsError('failed-precondition', 'SALON_CLOSED');
    }
    const salonSettings = salonSnap.data() || {};
    const salonTimezone = salonSettings.timezone || salonSettings.time_zone;
    if (!salonTimezone || typeof salonTimezone !== 'string') {
        throw new https_1.HttpsError('failed-precondition', 'SALON_TIMEZONE_UNCONFIGURED');
    }
    // 3. Date Validation against authoritative configured salon timezone
    if (!(0, validation_1.isValidISODate)(bookingDate) || (0, validation_1.isDateInPast)(bookingDate, salonTimezone)) {
        throw new https_1.HttpsError('invalid-argument', 'INVALID_DATE');
    }
    // 4. Time Validation
    const startMin = (0, validation_1.parseTimeToMinutes)(startTime);
    if (startMin === null) {
        throw new https_1.HttpsError('invalid-argument', 'INVALID_DATE');
    }
    // 5. Authoritative Service Validation (from Firestore services/{serviceId} with canonical catalog fallback)
    const serviceRef = db.collection('services').doc(serviceId);
    const serviceSnap = await serviceRef.get();
    let serviceData = null;
    if (serviceSnap.exists) {
        serviceData = serviceSnap.data() || {};
    }
    else {
        // Check canonical salon catalog if document has not yet been seeded to Firestore
        const catalogItem = catalog_1.CANONICAL_SERVICES[serviceId];
        if (catalogItem) {
            serviceData = {
                id: serviceId,
                name: catalogItem.name,
                category: catalogItem.category,
                price: catalogItem.price,
                duration_minutes: catalogItem.duration_minutes,
                gender: catalogItem.gender || 'Other',
                is_active: catalogItem.is_active,
                description: catalogItem.description,
                created_at: new Date().toISOString()
            };
            // Auto-populate into Firestore asynchronously for permanent persistence
            serviceRef.set(serviceData).catch(e => {
                console.warn('Notice caching service to Firestore:', e);
            });
        }
    }
    if (!serviceData) {
        throw new https_1.HttpsError('not-found', 'INVALID_SERVICE');
    }
    const isActive = serviceData.is_active !== false && serviceData.isActive !== false;
    if (!isActive) {
        throw new https_1.HttpsError('failed-precondition', 'SERVICE_UNAVAILABLE');
    }
    const serviceName = serviceData.name || serviceData.title;
    const rawPrice = serviceData.price;
    const rawDuration = serviceData.duration_minutes ?? serviceData.durationMinutes;
    const price = typeof rawPrice === 'number'
        ? rawPrice
        : parseFloat(String(rawPrice || '0').replace(/[^0-9.]/g, ''));
    const duration = typeof rawDuration === 'number'
        ? rawDuration
        : parseInt(String(rawDuration || '0'), 10);
    if (isNaN(price) || price < 0 || !duration || duration <= 0) {
        throw new https_1.HttpsError('invalid-argument', 'INVALID_SERVICE');
    }
    const endMin = startMin + duration;
    const endTime = (0, validation_1.formatMinutesToTime)(endMin);
    // 6. Authoritative Operating Hours Validation against authoritative timezone
    const hoursList = salonSettings.opening_hours || salonSettings.openingHours;
    const hoursCheck = (0, validation_1.validateSalonOperatingHours)(hoursList, bookingDate, startMin, endMin, salonTimezone);
    if (!hoursCheck.valid) {
        throw new https_1.HttpsError('failed-precondition', hoursCheck.error || 'SALON_CLOSED');
    }
    // 7. Calculate required 30-minute slot intervals
    const requiredSlots = (0, validation_1.calculateRequiredSlots)(bookingDate, startMin, duration);
    // 7. Check idempotency if client supplied a key
    if (idempotencyKey) {
        const existingQ = await db.collection('bookings')
            .where('idempotency_key', '==', idempotencyKey)
            .where('customer_id', '==', uid)
            .limit(1)
            .get();
        if (!existingQ.empty) {
            const existingBooking = existingQ.docs[0].data();
            const existingTicketQ = await db.collection('tickets')
                .where('booking_id', '==', existingBooking.id)
                .limit(1)
                .get();
            const existingTicket = existingTicketQ.empty ? null : existingTicketQ.docs[0].data();
            return { success: true, booking: existingBooking, ticket: existingTicket };
        }
    }
    // 8. Execute Atomic Firestore Transaction
    return await db.runTransaction(async (transaction) => {
        // 8a. Read all required slot documents
        const slotRefs = requiredSlots.map(s => db.collection('slots').doc(s.slotId));
        const slotSnaps = await Promise.all(slotRefs.map(ref => transaction.get(ref)));
        // 8b. Verify availability for EVERY required slot
        for (let i = 0; i < slotSnaps.length; i++) {
            const snap = slotSnaps[i];
            if (snap.exists) {
                const slotData = snap.data();
                const st = String(slotData?.status || '').toLowerCase();
                if (st === 'booked' || st === 'unavailable' || st === 'blocked' || st === 'reserved') {
                    throw new https_1.HttpsError('failed-precondition', 'SLOT_UNAVAILABLE');
                }
            }
        }
        // 8c. Load customer profile from users/{uid} for authoritative ticket name
        const userRef = db.collection('users').doc(uid);
        const userSnap = await transaction.get(userRef);
        const userData = userSnap.exists ? userSnap.data() : null;
        const customerName = userData?.displayName || userData?.name || userData?.full_name || 'Valued Patron';
        // 8d. Generate IDs
        const bookingId = `bkg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
        const ticketId = `tkt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
        const ticketCode = (0, tickets_1.generateTicketCode)();
        const qrPayload = (0, tickets_1.generateQrPayload)(ticketCode, bookingId);
        const nowIso = new Date().toISOString();
        // 8e. Reserve all required internal slot documents atomically
        for (const s of requiredSlots) {
            const slotRef = db.collection('slots').doc(s.slotId);
            transaction.set(slotRef, {
                id: s.slotId,
                booking_date: bookingDate,
                start_time: s.startTime,
                end_time: s.endTime,
                status: 'booked',
                booking_id: bookingId,
                customer_id: uid,
                updated_at: nowIso,
                created_at: nowIso
            }, { merge: true });
            // Synchronize sanitized public availability
            (0, availability_1.setPublicSlotAvailabilityInTx)(transaction, db, s.slotId, bookingDate, s.startTime, s.endTime, 'unavailable');
        }
        // 8f. Create authoritative historical snapshot booking
        const bookingDoc = {
            id: bookingId,
            customer_id: uid,
            service_id: serviceId,
            service_name: serviceName,
            gender,
            booking_date: bookingDate,
            start_time: (0, validation_1.formatMinutesToTime)(startMin),
            end_time: endTime,
            duration_minutes: duration,
            price,
            status: 'confirmed',
            payment_status: 'pending',
            ticket_code: ticketCode,
            notes: notes ? String(notes).trim().slice(0, 500) : '',
            idempotency_key: idempotencyKey || null,
            created_at: nowIso,
            updated_at: nowIso
        };
        const bookingRef = db.collection('bookings').doc(bookingId);
        transaction.set(bookingRef, bookingDoc);
        // 8g. Create digital ticket
        const ticketDoc = {
            id: ticketId,
            booking_id: bookingId,
            customer_id: uid,
            ticket_code: ticketCode,
            customer_name: customerName,
            service_name: serviceName,
            gender,
            booking_date: bookingDate,
            start_time: (0, validation_1.formatMinutesToTime)(startMin),
            end_time: endTime,
            duration_minutes: duration,
            amount: price,
            booking_status: 'confirmed',
            qr_code_payload: qrPayload,
            created_at: nowIso,
            updated_at: nowIso
        };
        const ticketRef = db.collection('tickets').doc(ticketId);
        transaction.set(ticketRef, ticketDoc);
        return {
            success: true,
            booking: bookingDoc,
            ticket: ticketDoc
        };
    });
}
/**
 * Authoritative cancellation:
 * Verifies ownership, sets booking status to 'cancelled', releases slots, and cancels ticket.
 */
async function executeCancelBooking(db, uid, data, isAdmin = false) {
    if (!uid) {
        throw new https_1.HttpsError('unauthenticated', 'AUTH_REQUIRED');
    }
    const { bookingId } = data || {};
    if (!bookingId) {
        throw new https_1.HttpsError('invalid-argument', 'BOOKING_NOT_FOUND');
    }
    return await db.runTransaction(async (transaction) => {
        const bookingRef = db.collection('bookings').doc(bookingId);
        const bookingSnap = await transaction.get(bookingRef);
        if (!bookingSnap.exists) {
            throw new https_1.HttpsError('not-found', 'BOOKING_NOT_FOUND');
        }
        const bookingData = bookingSnap.data() || {};
        if (bookingData.customer_id !== uid && !isAdmin) {
            throw new https_1.HttpsError('permission-denied', 'NOT_AUTHORIZED');
        }
        if (bookingData.status === 'cancelled') {
            throw new https_1.HttpsError('failed-precondition', 'ALREADY_CANCELLED');
        }
        const nowIso = new Date().toISOString();
        // 1. Mark booking cancelled
        transaction.update(bookingRef, {
            status: 'cancelled',
            updated_at: nowIso
        });
        // 2. Release slots
        const bookingDate = bookingData.booking_date;
        const startMin = (0, validation_1.parseTimeToMinutes)(bookingData.start_time);
        const duration = bookingData.duration_minutes;
        if (bookingDate && startMin !== null && duration) {
            const requiredSlots = (0, validation_1.calculateRequiredSlots)(bookingDate, startMin, duration);
            for (const s of requiredSlots) {
                const slotRef = db.collection('slots').doc(s.slotId);
                transaction.set(slotRef, {
                    status: 'available',
                    booking_id: null,
                    customer_id: null,
                    updated_at: nowIso
                }, { merge: true });
                // Update sanitized public availability
                (0, availability_1.setPublicSlotAvailabilityInTx)(transaction, db, s.slotId, bookingDate, s.startTime, s.endTime, 'available');
            }
        }
        // 3. Mark ticket cancelled
        const ticketsQ = await db.collection('tickets').where('booking_id', '==', bookingId).limit(1).get();
        if (!ticketsQ.empty) {
            const ticketRef = ticketsQ.docs[0].ref;
            transaction.update(ticketRef, {
                booking_status: 'cancelled',
                updated_at: nowIso
            });
        }
        return {
            success: true,
            bookingId,
            status: 'cancelled'
        };
    });
}
/**
 * Authoritative reschedule:
 * Verifies ownership, validates new date & operating hours, validates new consecutive slots,
 * releases old slots, reserves new slots, and updates booking & ticket atomically.
 */
async function executeRescheduleBooking(db, uid, data, isAdmin = false) {
    if (!uid) {
        throw new https_1.HttpsError('unauthenticated', 'AUTH_REQUIRED');
    }
    const { bookingId, bookingDate: newDate, startTime: newStartTime } = data || {};
    if (!bookingId || !newDate || !newStartTime) {
        throw new https_1.HttpsError('invalid-argument', 'INVALID_DATE');
    }
    // Load salon operating hours & timezone
    let salonSnap = await db.collection('settings').doc('salon').get();
    if (!salonSnap.exists) {
        salonSnap = await db.collection('settings').doc('general').get();
    }
    if (!salonSnap.exists) {
        throw new https_1.HttpsError('failed-precondition', 'SALON_CLOSED');
    }
    const salonSettings = salonSnap.data() || {};
    const salonTimezone = salonSettings.timezone || salonSettings.time_zone;
    if (!salonTimezone || typeof salonTimezone !== 'string') {
        throw new https_1.HttpsError('failed-precondition', 'SALON_TIMEZONE_UNCONFIGURED');
    }
    if (!(0, validation_1.isValidISODate)(newDate) || (0, validation_1.isDateInPast)(newDate, salonTimezone)) {
        throw new https_1.HttpsError('invalid-argument', 'INVALID_DATE');
    }
    const newStartMin = (0, validation_1.parseTimeToMinutes)(newStartTime);
    if (newStartMin === null) {
        throw new https_1.HttpsError('invalid-argument', 'INVALID_DATE');
    }
    const hoursList = salonSettings.opening_hours || salonSettings.openingHours;
    return await db.runTransaction(async (transaction) => {
        const bookingRef = db.collection('bookings').doc(bookingId);
        const bookingSnap = await transaction.get(bookingRef);
        if (!bookingSnap.exists) {
            throw new https_1.HttpsError('not-found', 'BOOKING_NOT_FOUND');
        }
        const bookingData = bookingSnap.data() || {};
        if (bookingData.customer_id !== uid && !isAdmin) {
            throw new https_1.HttpsError('permission-denied', 'NOT_AUTHORIZED');
        }
        if (bookingData.status === 'cancelled') {
            throw new https_1.HttpsError('failed-precondition', 'CANNOT_RESCHEDULE');
        }
        const duration = bookingData.duration_minutes;
        const newEndMin = newStartMin + duration;
        const newEndTime = (0, validation_1.formatMinutesToTime)(newEndMin);
        // Validate operating hours for new window against authoritative salon timezone
        const hoursCheck = (0, validation_1.validateSalonOperatingHours)(hoursList, newDate, newStartMin, newEndMin, salonTimezone);
        if (!hoursCheck.valid) {
            throw new https_1.HttpsError('failed-precondition', hoursCheck.error || 'SALON_CLOSED');
        }
        // Calculate old slots to release
        const oldDate = bookingData.booking_date;
        const oldStartMin = (0, validation_1.parseTimeToMinutes)(bookingData.start_time);
        const oldSlots = (oldDate && oldStartMin !== null)
            ? (0, validation_1.calculateRequiredSlots)(oldDate, oldStartMin, duration)
            : [];
        // Calculate new slots to reserve
        const newSlots = (0, validation_1.calculateRequiredSlots)(newDate, newStartMin, duration);
        // Read all new slots
        const newSlotRefs = newSlots.map(s => db.collection('slots').doc(s.slotId));
        const newSlotSnaps = await Promise.all(newSlotRefs.map(ref => transaction.get(ref)));
        // Verify all new slots are available (or belong to this current booking)
        for (let i = 0; i < newSlotSnaps.length; i++) {
            const snap = newSlotSnaps[i];
            if (snap.exists) {
                const slotData = snap.data();
                const st = String(slotData?.status || '').toLowerCase();
                const ownerBookingId = slotData?.booking_id;
                if ((st === 'booked' || st === 'unavailable' || st === 'blocked' || st === 'reserved') &&
                    ownerBookingId !== bookingId) {
                    throw new https_1.HttpsError('failed-precondition', 'SLOT_UNAVAILABLE');
                }
            }
        }
        const nowIso = new Date().toISOString();
        // Release old slots that are not in new slots
        const newSlotIdSet = new Set(newSlots.map(s => s.slotId));
        for (const oldS of oldSlots) {
            if (!newSlotIdSet.has(oldS.slotId)) {
                const slotRef = db.collection('slots').doc(oldS.slotId);
                transaction.set(slotRef, {
                    status: 'available',
                    booking_id: null,
                    customer_id: null,
                    updated_at: nowIso
                }, { merge: true });
                (0, availability_1.setPublicSlotAvailabilityInTx)(transaction, db, oldS.slotId, oldS.slotId.split('_')[1], oldS.startTime, oldS.endTime, 'available');
            }
        }
        // Reserve new slots
        for (const newS of newSlots) {
            const slotRef = db.collection('slots').doc(newS.slotId);
            transaction.set(slotRef, {
                id: newS.slotId,
                booking_date: newDate,
                start_time: newS.startTime,
                end_time: newS.endTime,
                status: 'booked',
                booking_id: bookingId,
                customer_id: uid,
                updated_at: nowIso
            }, { merge: true });
            (0, availability_1.setPublicSlotAvailabilityInTx)(transaction, db, newS.slotId, newDate, newS.startTime, newS.endTime, 'unavailable');
        }
        // Update booking
        const updatedBooking = {
            ...bookingData,
            booking_date: newDate,
            start_time: (0, validation_1.formatMinutesToTime)(newStartMin),
            end_time: newEndTime,
            updated_at: nowIso
        };
        transaction.update(bookingRef, {
            booking_date: newDate,
            start_time: (0, validation_1.formatMinutesToTime)(newStartMin),
            end_time: newEndTime,
            updated_at: nowIso
        });
        // Update ticket
        const ticketsQ = await db.collection('tickets').where('booking_id', '==', bookingId).limit(1).get();
        let updatedTicket = null;
        if (!ticketsQ.empty) {
            const ticketRef = ticketsQ.docs[0].ref;
            updatedTicket = {
                ...ticketsQ.docs[0].data(),
                booking_date: newDate,
                start_time: (0, validation_1.formatMinutesToTime)(newStartMin),
                end_time: newEndTime,
                updated_at: nowIso
            };
            transaction.update(ticketRef, {
                booking_date: newDate,
                start_time: (0, validation_1.formatMinutesToTime)(newStartMin),
                end_time: newEndTime,
                updated_at: nowIso
            });
        }
        return {
            success: true,
            booking: updatedBooking,
            ticket: updatedTicket
        };
    });
}
//# sourceMappingURL=booking.js.map