/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Unisex Salon — Firebase Cloud Functions
 */

import { onCall, CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {
  executeCreateBooking,
  executeCancelBooking,
  executeRescheduleBooking,
  CreateBookingInput,
  CancelBookingInput,
  RescheduleBookingInput
} from './booking';

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

/**
 * Callable Cloud Function: createBooking
 * Authoritative transactional slot reservation and booking creation.
 */
export const createBooking = onCall(
  { cors: true, region: 'us-central1' },
  async (request: CallableRequest<CreateBookingInput>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'AUTH_REQUIRED');
    }
    const uid = request.auth.uid;
    return await executeCreateBooking(db, uid, request.data);
  }
);

/**
 * Callable Cloud Function: cancelBooking
 * Authoritative cancellation and slot release.
 */
export const cancelBooking = onCall(
  { cors: true, region: 'us-central1' },
  async (request: CallableRequest<CancelBookingInput>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'AUTH_REQUIRED');
    }
    const uid = request.auth.uid;
    const isAdmin = request.auth.token.role === 'admin';
    return await executeCancelBooking(db, uid, request.data, isAdmin);
  }
);

/**
 * Callable Cloud Function: rescheduleBooking
 * Authoritative appointment reschedule with atomic slot exchange.
 */
export const rescheduleBooking = onCall(
  { cors: true, region: 'us-central1' },
  async (request: CallableRequest<RescheduleBookingInput>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'AUTH_REQUIRED');
    }
    const uid = request.auth.uid;
    const isAdmin = request.auth.token.role === 'admin';
    return await executeRescheduleBooking(db, uid, request.data, isAdmin);
  }
);
