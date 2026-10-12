/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Unisex Salon — Sanitized Public Availability Engine
 */

import { Transaction, DocumentReference, Firestore } from 'firebase-admin/firestore';

export interface PublicSlotDoc {
  date: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'unavailable' | 'blocked';
  updated_at: string;
}

/**
 * Updates public availability records in Firestore inside an active transaction.
 * Strictly sanitizes data: exposes ZERO customer IDs, booking IDs, staff IDs, or notes.
 */
export function setPublicSlotAvailabilityInTx(
  transaction: Transaction,
  db: Firestore,
  slotId: string,
  date: string,
  startTime: string,
  endTime: string,
  status: 'available' | 'unavailable' | 'blocked'
): void {
  const ref = db.collection('public_availability').doc(slotId);
  const data: PublicSlotDoc = {
    date,
    start_time: startTime,
    end_time: endTime,
    status,
    updated_at: new Date().toISOString()
  };
  transaction.set(ref, data, { merge: true });
}
