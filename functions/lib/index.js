"use strict";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Unisex Salon — Firebase Cloud Functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rescheduleBooking = exports.cancelBooking = exports.createBooking = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const booking_1 = require("./booking");
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
const db = (0, firestore_1.getFirestore)();
/**
 * Callable Cloud Function: createBooking
 * Authoritative transactional slot reservation and booking creation.
 */
exports.createBooking = (0, https_1.onCall)({ cors: true, region: 'us-central1' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'AUTH_REQUIRED');
    }
    const uid = request.auth.uid;
    return await (0, booking_1.executeCreateBooking)(db, uid, request.data);
});
/**
 * Callable Cloud Function: cancelBooking
 * Authoritative cancellation and slot release.
 */
exports.cancelBooking = (0, https_1.onCall)({ cors: true, region: 'us-central1' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'AUTH_REQUIRED');
    }
    const uid = request.auth.uid;
    const isAdmin = request.auth.token.role === 'admin';
    return await (0, booking_1.executeCancelBooking)(db, uid, request.data, isAdmin);
});
/**
 * Callable Cloud Function: rescheduleBooking
 * Authoritative appointment reschedule with atomic slot exchange.
 */
exports.rescheduleBooking = (0, https_1.onCall)({ cors: true, region: 'us-central1' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'AUTH_REQUIRED');
    }
    const uid = request.auth.uid;
    const isAdmin = request.auth.token.role === 'admin';
    return await (0, booking_1.executeRescheduleBooking)(db, uid, request.data, isAdmin);
});
//# sourceMappingURL=index.js.map