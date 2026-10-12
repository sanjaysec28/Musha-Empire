/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Unisex Salon — Authoritative Client Functions Bridge
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, isFirebaseConfigured } from './firebase';
import { FirestoreBooking, FirestoreTicket } from '../types/firestore';

export interface CreateBookingData {
  serviceId: string;
  gender: string;
  bookingDate: string;
  startTime: string;
  notes?: string;
  idempotencyKey?: string;
}

export interface CancelBookingData {
  bookingId: string;
}

export interface RescheduleBookingData {
  bookingId: string;
  bookingDate: string;
  startTime: string;
}

export interface BookingResponse {
  success: boolean;
  booking: FirestoreBooking;
  ticket?: FirestoreTicket | null;
}

export const ERROR_MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: 'Please sign in or register to confirm your reservation.',
  SERVICE_UNAVAILABLE: 'This ritual is currently unavailable. Please select another ritual.',
  INVALID_SERVICE: 'The selected ritual is invalid or does not exist.',
  INVALID_GENDER: 'Please select a valid gender option (Men, Women, or Other).',
  INVALID_DATE: 'The selected appointment date is invalid or in the past.',
  SALON_CLOSED: 'The salon is closed on this date. Please select another date.',
  OUTSIDE_OPERATING_HOURS: 'The requested time falls outside our salon operating hours.',
  SLOT_UNAVAILABLE: 'This time slot is no longer available. Please choose another time.',
  BOOKING_NOT_FOUND: 'Booking record not found.',
  NOT_AUTHORIZED: 'You are not authorized to modify this booking.',
  ALREADY_CANCELLED: 'This booking has already been cancelled.',
  CANNOT_RESCHEDULE: 'This booking cannot be rescheduled.',
  SALON_TIMEZONE_UNCONFIGURED: 'The salon operational timezone is not configured. Please contact administration.',
  CLOUD_FUNCTION_UNAVAILABLE: "The trusted booking Cloud Function ('createBooking') is not deployed on project 'musha-ae73e'. Please deploy Cloud Functions to activate live reservations.",
  CLOUD_FUNCTION_CANCEL_UNAVAILABLE: "The trusted cancellation Cloud Function ('cancelBooking') is not deployed on project 'musha-ae73e'. Please deploy Cloud Functions to activate live cancellations.",
  CLOUD_FUNCTION_RESCHEDULE_UNAVAILABLE: "The trusted reschedule Cloud Function ('rescheduleBooking') is not deployed on project 'musha-ae73e'. Please deploy Cloud Functions to activate live rescheduling."
};

/**
 * Production environment guard:
 * Local transaction simulation is strictly allowed ONLY in development or when explicitly enabled for preview testing.
 * In a production deployment, all customer booking actions MUST route through trusted Firebase Cloud Functions.
 */
export function isPreviewFallbackAllowed(): boolean {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_ALLOW_PREVIEW_FALLBACK === 'true';
  }
  return true;
}

/**
 * Maps standard server error codes into friendly UI messages.
 */
export function mapBookingError(err: any): string {
  const code = String(err?.code || err?.details || err?.message || '');
  if (code.includes('CLOUD_FUNCTION_CANCEL_UNAVAILABLE')) {
    return "The trusted cancellation Cloud Function ('cancelBooking') is not deployed on project 'musha-ae73e'. Please deploy Cloud Functions to activate live cancellations.";
  }
  if (code.includes('CLOUD_FUNCTION_RESCHEDULE_UNAVAILABLE')) {
    return "The trusted reschedule Cloud Function ('rescheduleBooking') is not deployed on project 'musha-ae73e'. Please deploy Cloud Functions to activate live rescheduling.";
  }
  if (
    code.includes('CLOUD_FUNCTION_UNAVAILABLE') ||
    code.includes('not-found') ||
    code.includes('functions/not-found') ||
    code.includes('internal') ||
    code.includes('Failed to fetch') ||
    code.includes('preflight') ||
    code.includes('CORS')
  ) {
    return "The trusted booking Cloud Function ('createBooking') is not deployed on project 'musha-ae73e'. Please deploy Cloud Functions to activate live reservations.";
  }
  if (code.includes('permission-denied') || code.includes('permission_denied') || code.includes('Missing or insufficient permissions')) {
    return "Permission denied: Direct browser reservation writes are restricted by security rules. Bookings must be processed through trusted Cloud Functions.";
  }
  if (code.includes('unavailable') || code.includes('functions/unavailable')) {
    return "The booking Cloud Function service is temporarily unavailable. Please check backend deployment status and try again.";
  }
  for (const [key, msg] of Object.entries(ERROR_MESSAGES)) {
    if (code.includes(key)) {
      return msg;
    }
  }
  return err?.message || 'An unexpected issue occurred while processing your reservation. Please try again.';
}

/**
 * Client invocation for createBooking:
 * Directs through Firebase Callable Cloud Function (us-central1).
 */
export async function callCreateBooking(
  data: CreateBookingData,
  clientUser?: { uid?: string; id?: string; displayName?: string; email?: string } | null
): Promise<BookingResponse> {
  const uid = clientUser?.uid || clientUser?.id;
  if (!uid) {
    throw new Error('AUTH_REQUIRED');
  }

  // Live Firebase Functions invocation
  if (isFirebaseConfigured && app) {
    try {
      const functions = getFunctions(app, 'us-central1');
      const callable = httpsCallable<CreateBookingData, BookingResponse>(functions, 'createBooking');
      const result = await callable(data);
      if (result.data) {
        return result.data;
      }
    } catch (fnErr: any) {
      // If error is an authoritative business rule error from the server, throw it directly
      const errCode = fnErr?.details || fnErr?.message;
      if (errCode && ERROR_MESSAGES[errCode]) {
        throw new Error(errCode);
      }

      const errStr = String(fnErr?.code || fnErr?.message || '');
      if (
        errStr.includes('not-found') ||
        errStr.includes('functions/not-found') ||
        errStr.includes('unavailable') ||
        errStr.includes('internal') ||
        errStr.includes('INTERNAL') ||
        errStr.includes('Failed to fetch') ||
        errStr.includes('CORS') ||
        errStr.includes('preflight')
      ) {
        throw new Error('CLOUD_FUNCTION_UNAVAILABLE');
      }

      throw fnErr;
    }
  }

  // When Cloud Function is unavailable or Firebase is not configured, explain the dependency clearly
  throw new Error('CLOUD_FUNCTION_UNAVAILABLE');
}

/**
 * Client invocation for cancelBooking:
 * Calls Cloud Function (us-central1) with authoritative validation.
 */
export async function callCancelBooking(
  data: CancelBookingData,
  clientUid?: string
): Promise<{ success: boolean; bookingId: string; status: string }> {
  if (!clientUid) throw new Error('AUTH_REQUIRED');

  if (isFirebaseConfigured && app) {
    try {
      const functions = getFunctions(app, 'us-central1');
      const callable = httpsCallable<CancelBookingData, { success: boolean; bookingId: string; status: string }>(functions, 'cancelBooking');
      const result = await callable(data);
      if (result.data) return result.data;
    } catch (fnErr: any) {
      const errCode = fnErr?.details || fnErr?.message;
      if (errCode && ERROR_MESSAGES[errCode]) throw new Error(errCode);
      const errStr = String(fnErr?.code || fnErr?.message || '');
      if (
        errStr.includes('not-found') ||
        errStr.includes('functions/not-found') ||
        errStr.includes('unavailable') ||
        errStr.includes('internal') ||
        errStr.includes('INTERNAL') ||
        errStr.includes('Failed to fetch') ||
        errStr.includes('CORS') ||
        errStr.includes('preflight')
      ) {
        throw new Error('CLOUD_FUNCTION_CANCEL_UNAVAILABLE');
      }
      throw fnErr;
    }
  }

  throw new Error('CLOUD_FUNCTION_CANCEL_UNAVAILABLE');
}

/**
 * Client invocation for rescheduleBooking:
 * Calls Cloud Function (us-central1) with authoritative atomic slot exchange.
 */
export async function callRescheduleBooking(
  data: RescheduleBookingData,
  clientUid?: string
): Promise<BookingResponse> {
  if (!clientUid) throw new Error('AUTH_REQUIRED');

  if (isFirebaseConfigured && app) {
    try {
      const functions = getFunctions(app, 'us-central1');
      const callable = httpsCallable<RescheduleBookingData, BookingResponse>(functions, 'rescheduleBooking');
      const result = await callable(data);
      if (result.data) return result.data;
    } catch (fnErr: any) {
      const errCode = fnErr?.details || fnErr?.message;
      if (errCode && ERROR_MESSAGES[errCode]) throw new Error(errCode);
      const errStr = String(fnErr?.code || fnErr?.message || '');
      if (
        errStr.includes('not-found') ||
        errStr.includes('functions/not-found') ||
        errStr.includes('unavailable') ||
        errStr.includes('internal') ||
        errStr.includes('INTERNAL') ||
        errStr.includes('Failed to fetch') ||
        errStr.includes('CORS') ||
        errStr.includes('preflight')
      ) {
        throw new Error('CLOUD_FUNCTION_RESCHEDULE_UNAVAILABLE');
      }
      throw fnErr;
    }
  }

  throw new Error('CLOUD_FUNCTION_RESCHEDULE_UNAVAILABLE');
}
