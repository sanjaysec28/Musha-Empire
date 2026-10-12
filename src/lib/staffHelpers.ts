/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StaffMetadata {
  bioText: string;
  schedule: {
    workingDays: string[]; // ['Monday', 'Tuesday', ...]
    startTime: string;     // e.g. '10:00'
    endTime: string;       // '18:00'
    lunchBreak: string;    // '13:00-14:00'
    weeklyOff: string[];   // ['Saturday', 'Sunday']
  };
  leaves: Array<{
    id: string;
    type: 'Sick Leave' | 'Vacation' | 'Emergency Leave' | 'Training';
    startDate: string;     // 'YYYY-MM-DD'
    endDate: string;       // 'YYYY-MM-DD'
  }>;
}

export function parseStaffBio(bio: string | null): StaffMetadata {
  const defaultMeta: StaffMetadata = {
    bioText: bio || '',
    schedule: {
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '',
      endTime: '',
      lunchBreak: '',
      weeklyOff: []
    },
    leaves: []
  };

  if (!bio) return defaultMeta;

  try {
    const trimmed = bio.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = JSON.parse(trimmed);
      return {
        bioText: parsed.bioText ?? (parsed.text || ''),
        schedule: parsed.schedule || defaultMeta.schedule,
        leaves: parsed.leaves || []
      };
    }
  } catch (e) {
    // Treat bio as plain text
  }

  return defaultMeta;
}

export function serializeStaffBio(meta: StaffMetadata): string {
  return JSON.stringify(meta);
}

export function isStaffOnLeave(leaves: Array<{ startDate: string; endDate: string }>, dateStr: string): boolean {
  if (!leaves || leaves.length === 0 || !dateStr) return false;
  
  // Parse dateStr to a simple date timestamp at midnight
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);
  const targetTime = targetDate.getTime();

  return leaves.some(leave => {
    const start = new Date(leave.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(leave.endDate);
    end.setHours(23, 59, 59, 999);
    return targetTime >= start.getTime() && targetTime <= end.getTime();
  });
}

export function parseTimeToMinutes(t: string): number {
  if (!t) return 0;
  let hours = 0;
  let minutes = 0;
  const match12 = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match12) {
    hours = parseInt(match12[1]);
    minutes = parseInt(match12[2]);
    const ampm = match12[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
  } else {
    const parts = t.split(':');
    hours = parseInt(parts[0]) || 0;
    minutes = parseInt(parts[1]) || 0;
  }
  return hours * 60 + minutes;
}

export function isStaffWorking(staffMeta: StaffMetadata, dateStr: string, timeStr?: string): boolean {
  if (!dateStr) return true;
  
  // Parse date to day of week
  const dateObj = new Date(dateStr);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[dateObj.getDay()];
  
  // 1. Check if the day is in workingDays
  const workingDays = staffMeta.schedule?.workingDays || [];
  if (!workingDays.includes(dayName)) {
    return false;
  }
  
  // 2. Check if the day is in weeklyOff
  const weeklyOff = staffMeta.schedule?.weeklyOff || [];
  if (weeklyOff.includes(dayName)) {
    return false;
  }
  
  // 3. If timeStr is provided, check if it falls within working hours and NOT during lunch break
  if (timeStr) {
    const timeVal = parseTimeToMinutes(timeStr);
    const startVal = staffMeta.schedule?.startTime ? parseTimeToMinutes(staffMeta.schedule.startTime) : null;
    const endVal = staffMeta.schedule?.endTime ? parseTimeToMinutes(staffMeta.schedule.endTime) : null;
    
    // Check main working hours range
    if (startVal !== null && endVal !== null) {
      if (timeVal < startVal || timeVal >= endVal) {
        return false;
      }
    }
    
    // Check lunch break
    const lunchBreakStr = staffMeta.schedule?.lunchBreak || '';
    if (lunchBreakStr && lunchBreakStr.includes('-')) {
      const parts = lunchBreakStr.split('-');
      const lunchStart = parseTimeToMinutes(parts[0]);
      const lunchEnd = parseTimeToMinutes(parts[1]);
      if (timeVal >= lunchStart && timeVal < lunchEnd) {
        return false;
      }
    }
  }
  
  return true;
}
