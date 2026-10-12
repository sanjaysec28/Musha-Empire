"use strict";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Unisex Salon — Authoritative Server Validation Engine
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SALON_TIMEZONE = void 0;
exports.parseTimeToMinutes = parseTimeToMinutes;
exports.formatMinutesToTime = formatMinutesToTime;
exports.isValidISODate = isValidISODate;
exports.isDateInPast = isDateInPast;
exports.validateGender = validateGender;
exports.generateSlotId = generateSlotId;
exports.calculateRequiredSlots = calculateRequiredSlots;
exports.validateSalonOperatingHours = validateSalonOperatingHours;
/**
 * Salon operating timezone.
 * Documented business timezone: 'Asia/Kolkata' (IST, UTC+5:30).
 */
exports.SALON_TIMEZONE = 'Asia/Kolkata';
/**
 * Parses time string (e.g. "10:00 AM", "02:30 PM", "14:00") into minutes from midnight (0..1439).
 */
function parseTimeToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== 'string')
        return null;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (!match)
        return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3]?.toUpperCase();
    if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes >= 60)
        return null;
    if (ampm) {
        if (hours < 1 || hours > 12)
            return null;
        if (ampm === 'PM' && hours < 12)
            hours += 12;
        if (ampm === 'AM' && hours === 12)
            hours = 0;
    }
    else {
        if (hours < 0 || hours >= 24)
            return null;
    }
    return hours * 60 + minutes;
}
/**
 * Formats minutes from midnight into 12-hour AM/PM string (e.g. "10:00 AM").
 */
function formatMinutesToTime(totalMinutes) {
    const norm = ((totalMinutes % 1440) + 1440) % 1440;
    const h24 = Math.floor(norm / 60);
    const m = norm % 60;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    let h12 = h24 % 12;
    if (h12 === 0)
        h12 = 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}
/**
 * Validates strict YYYY-MM-DD date format and calendar validity.
 */
function isValidISODate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string')
        return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr))
        return false;
    const [y, m, d] = dateStr.split('-').map(Number);
    if (m < 1 || m > 12 || d < 1 || d > 31)
        return false;
    const check = new Date(Date.UTC(y, m - 1, d));
    return (check.getUTCFullYear() === y &&
        check.getUTCMonth() === m - 1 &&
        check.getUTCDate() === d);
}
/**
 * Checks whether an ISO date (YYYY-MM-DD) is strictly in the past relative to the authoritative salon timezone.
 * Requires an explicit salon timezone; never silently assumes or invents a timezone.
 */
function isDateInPast(dateStr, timezone) {
    if (!isValidISODate(dateStr))
        return true;
    if (!timezone || typeof timezone !== 'string') {
        throw new Error('SALON_TIMEZONE_UNCONFIGURED');
    }
    // Compute current date in the authoritative salon timezone
    const now = new Date();
    const options = {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    // Format returns YYYY-MM-DD reliably with en-CA
    const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(now);
    const y = parts.find(p => p.type === 'year')?.value;
    const m = parts.find(p => p.type === 'month')?.value;
    const d = parts.find(p => p.type === 'day')?.value;
    const todayStr = `${y}-${m}-${d}`;
    return dateStr < todayStr;
}
/**
 * Strict Gender Validation:
 * Accepts 'Men', 'Women', 'Boy', 'Girl', 'Third Gender', and 'Other'.
 */
function validateGender(gender) {
    if (typeof gender !== 'string') {
        throw new Error('INVALID_GENDER');
    }
    const clean = gender.trim();
    const allowed = ['Men', 'Women', 'Boy', 'Girl', 'Third Gender', 'Other'];
    if (allowed.includes(clean)) {
        return clean;
    }
    throw new Error('INVALID_GENDER');
}
/**
 * Generates deterministic slot document identity.
 * Example: slot_2026-10-05_10-00, slot_2026-10-05_10-30
 */
function generateSlotId(dateStr, minutesFromMidnight) {
    const norm = ((minutesFromMidnight % 1440) + 1440) % 1440;
    const h24 = Math.floor(norm / 60);
    const m = norm % 60;
    const timeCode = `${String(h24).padStart(2, '0')}-${String(m).padStart(2, '0')}`;
    return `slot_${dateStr}_${timeCode}`;
}
/**
 * Calculates consecutive 30-minute slot intervals required for a booking.
 * Correctly handles non-multiples of 30 (e.g. 45 min, 75 min) by reserving
 * whole 30-minute chair time blocks (Math.ceil(duration / 30) * 30).
 */
function calculateRequiredSlots(dateStr, startMinutes, durationMinutes) {
    if (durationMinutes <= 0) {
        throw new Error('UNSUPPORTED_DURATION');
    }
    const effectiveDuration = Math.ceil(durationMinutes / 30) * 30;
    const slotCount = effectiveDuration / 30;
    const slots = [];
    for (let i = 0; i < slotCount; i++) {
        const sMin = startMinutes + i * 30;
        const eMin = sMin + 30;
        slots.push({
            slotId: generateSlotId(dateStr, sMin),
            startMinutes: sMin,
            endMinutes: eMin,
            startTime: formatMinutesToTime(sMin),
            endTime: formatMinutesToTime(eMin)
        });
    }
    return slots;
}
/**
 * Validates requested reservation window against real salon operating hours from Firestore settings/salon.
 * Never invents or assumes default hours.
 */
function validateSalonOperatingHours(hoursList, dateStr, startMinutes, endMinutes, timezone) {
    if (!timezone || typeof timezone !== 'string') {
        return { valid: false, error: 'SALON_TIMEZONE_UNCONFIGURED' };
    }
    if (!hoursList || !Array.isArray(hoursList) || hoursList.length === 0) {
        return { valid: false, error: 'SALON_CLOSED' };
    }
    // Get day of week for dateStr in the authoritative salon timezone
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: timezone }).format(dateObj);
    const found = hoursList.find(h => h.day && h.day.toLowerCase() === dayName.toLowerCase());
    if (!found || found.isClosed || !found.open || !found.close) {
        return { valid: false, error: 'SALON_CLOSED' };
    }
    const openMin = parseTimeToMinutes(found.open);
    const closeMin = parseTimeToMinutes(found.close);
    if (openMin === null || closeMin === null || closeMin <= openMin) {
        return { valid: false, error: 'SALON_CLOSED' };
    }
    if (startMinutes < openMin || endMinutes > closeMin) {
        return { valid: false, error: 'OUTSIDE_OPERATING_HOURS' };
    }
    return { valid: true };
}
//# sourceMappingURL=validation.js.map