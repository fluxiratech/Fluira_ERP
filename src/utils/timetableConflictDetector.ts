import { TimetableSlot, TimetableConflict } from '../types';

/**
 * Analyzes the full timetable and automatically identifies overlapping lectures
 * for faculty (faculty double-booking) or rooms (classroom collisions).
 */
export function analyzeTimetableConflicts(timetable: TimetableSlot[]): TimetableConflict[] {
  if (!timetable || timetable.length < 2) return [];

  const conflicts: TimetableConflict[] = [];
  const seenKeys = new Set<string>();

  for (let i = 0; i < timetable.length; i++) {
    for (let j = i + 1; j < timetable.length; j++) {
      const slot1 = timetable[i];
      const slot2 = timetable[j];

      // Must be on the same day
      if (slot1.day !== slot2.day) continue;

      // Check time overlap
      if (!areTimeSlotsOverlapping(slot1.timeSlot, slot2.timeSlot)) continue;

      // 1. Faculty Double-Booking Check
      if (
        slot1.facultyId &&
        slot2.facultyId &&
        slot1.facultyId === slot2.facultyId &&
        slot1.facultyId !== 'unassigned'
      ) {
        // If it's not the exact same slot entry
        const key = `faculty_${slot1.facultyId}_${slot1.day}_${slot1.timeSlot}_${[slot1.id, slot2.id].sort().join('_')}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          conflicts.push({
            slot1,
            slot2,
            reason: 'FACULTY_DOUBLE_BOOKED',
          });
        }
      }

      // 2. Classroom Collision Check
      if (
        slot1.classroom &&
        slot2.classroom &&
        slot1.classroom.trim().toLowerCase() === slot2.classroom.trim().toLowerCase() &&
        slot1.classroom.trim().toLowerCase() !== 'tbd' &&
        slot1.classroom.trim().toLowerCase() !== 'online'
      ) {
        const key = `room_${slot1.classroom}_${slot1.day}_${slot1.timeSlot}_${[slot1.id, slot2.id].sort().join('_')}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          conflicts.push({
            slot1,
            slot2,
            reason: 'CLASSROOM_COLLISION',
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Helper to parse time string like "07:50 AM", "12:10 PM", "12:10 AM" (noon context), "10:10 AM (Recess)" to minutes from midnight
 */
export function parseTimeToMinutes(timeStr: string, isEndSlot = false): number | null {
  try {
    const cleaned = timeStr.trim().toUpperCase();
    const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    let modifier = match[3];

    // Handle common user typo where 12:10 PM or 01:10 PM was written with AM after morning classes
    if (!modifier) {
      if (hours >= 7 && hours <= 11) modifier = 'AM';
      else if (hours === 12 || (hours >= 1 && hours <= 6)) modifier = 'PM';
    }

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) {
      // If preceded by a morning class (e.g. 11:10 AM - 12:10 AM), 12:10 is noon 12:10 PM
      if (isEndSlot) {
        hours = 12;
      } else {
        hours = 0;
      }
    }

    return hours * 60 + minutes;
  } catch {
    return null;
  }
}

/**
 * Helper to determine if two time slot strings overlap.
 * e.g. "07:50 AM - 08:50 AM" vs "08:50 AM - 09:50 AM"
 */
function areTimeSlotsOverlapping(ts1: string, ts2: string): boolean {
  if (!ts1 || !ts2) return false;
  if (ts1.trim().toLowerCase() === ts2.trim().toLowerCase()) return true;

  const parts1 = ts1.split('-');
  const parts2 = ts2.split('-');

  if (parts1.length !== 2 || parts2.length !== 2) return ts1.trim() === ts2.trim();

  const start1 = parseTimeToMinutes(parts1[0], false);
  const end1 = parseTimeToMinutes(parts1[1], true);
  const start2 = parseTimeToMinutes(parts2[0], false);
  const end2 = parseTimeToMinutes(parts2[1], true);

  if (start1 === null || end1 === null || start2 === null || end2 === null) {
    return ts1.trim() === ts2.trim();
  }

  // Interval overlap condition: max(start1, start2) < min(end1, end2)
  return Math.max(start1, start2) < Math.min(end1, end2);
}
