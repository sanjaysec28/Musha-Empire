"use strict";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Unisex Salon — Sanitized Public Availability Engine
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPublicSlotAvailabilityInTx = setPublicSlotAvailabilityInTx;
/**
 * Updates public availability records in Firestore inside an active transaction.
 * Strictly sanitizes data: exposes ZERO customer IDs, booking IDs, staff IDs, or notes.
 */
function setPublicSlotAvailabilityInTx(transaction, db, slotId, date, startTime, endTime, status) {
    const ref = db.collection('public_availability').doc(slotId);
    const data = {
        date,
        start_time: startTime,
        end_time: endTime,
        status,
        updated_at: new Date().toISOString()
    };
    transaction.set(ref, data, { merge: true });
}
//# sourceMappingURL=availability.js.map