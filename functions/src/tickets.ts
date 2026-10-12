/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Unisex Salon — Authoritative Digital Ticket Engine
 */

/**
 * Generates an authoritative, secure unique ticket code.
 * Format: MSH-TK-XXXXXX (6 alphanumeric chars)
 */
export function generateTicketCode(): string {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(4);
    globalThis.crypto.getRandomValues(bytes);
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    return `MSH-TK-${hex.slice(0, 6)}`;
  }
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MSH-TK-${rand.padEnd(6, 'X')}`;
}

/**
 * Builds the canonical QR code payload string for ticket check-in.
 */
export function generateQrPayload(ticketCode: string, bookingId: string): string {
  const suffix = bookingId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
  return `${ticketCode}-${suffix}`;
}
