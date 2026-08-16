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
 * Helper to determine if two time slot strings overlap.
 * e.g. "09:00 AM - 10:00 AM" vs "09:00 AM - 10:00 AM"
 */
function areTimeSlotsOverlapping(ts1: string, ts2: string): boolean {
  if (!ts1 || !ts2) return false;
  if (ts1.trim() === ts2.trim()) return true;

  const parseMinutes = (timeStr: string): number | null => {
    try {
      const cleaned = timeStr.trim().toUpperCase();
      const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
      if (!match) return null;

      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const modifier = match[3];

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      return hours * 60 + minutes;
    } catch {
      return null;
    }
  };

  const parts1 = ts1.split('-');
  const parts2 = ts2.split('-');

  if (parts1.length !== 2 || parts2.length !== 2) return ts1.trim() === ts2.trim();

  const start1 = parseMinutes(parts1[0]);
  const end1 = parseMinutes(parts1[1]);
  const start2 = parseMinutes(parts2[0]);
  const end2 = parseMinutes(parts2[1]);

  if (start1 === null || end1 === null || start2 === null || end2 === null) {
    return ts1.trim() === ts2.trim();
  }

  // Interval overlap condition: max(start1, start2) < min(end1, end2)
  return Math.max(start1, start2) < Math.min(end1, end2);
}
