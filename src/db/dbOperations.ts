import { eq, desc, and, or } from 'drizzle-orm';
import { db, pool } from './index';
import * as schema from './schema';
import {
  User,
  Program,
  Department,
  Course,
  Subject,
  Student360Profile,
  Faculty,
  TimetableSlot,
  AttendanceSession,
  AttendanceRecord,
  LeaveRequest,
  AttendanceCorrectionRequest,
  StudentResult,
  ERPNotification,
  AuditLog,
  CollegeSettings,
  ATKTRecord,
  AcademicCalendarEvent,
  NoticeItem,
  DepartmentActivity,
  ChatConversation,
  ChatMessage,
  ImportHistoryLog,
  PromotionBatch,
  ClassTeacherAssignment,
  FacultySubjectAllocation,
} from '../types';

import {
  INITIAL_USERS,
  INITIAL_PROGRAMS,
  INITIAL_DEPARTMENTS,
  INITIAL_COURSES,
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  INITIAL_FACULTY,
  INITIAL_TIMETABLE,
  INITIAL_SESSIONS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_LEAVES,
  INITIAL_CORRECTIONS,
  INITIAL_RESULTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
  INITIAL_ATKT_RECORDS,
  INITIAL_ACADEMIC_EVENTS,
  INITIAL_NOTICES,
  INITIAL_DEPARTMENT_ACTIVITIES,
  INITIAL_CHAT_CONVERSATIONS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_IMPORT_LOGS,
  INITIAL_PROMOTION_HISTORY,
  INITIAL_CLASS_TEACHERS,
} from '../data/mockData';

// Helper to safely parse JSON strings or return fallback
function safeParse<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

// -------------------------------------------------------------
// NUMERIC PARSING & SCHEMA VALIDATION HELPERS
// -------------------------------------------------------------

/**
 * Safely parse a value into an integer.
 * Handles numbers, numeric strings, floats, null/undefined, and invalid strings.
 */
export function parseInteger(val: any, fallback = 0, fieldName?: string, recordContext?: any): number {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return fallback;
    return Math.round(val);
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '') return fallback;
    const num = Number(trimmed);
    if (isNaN(num) || !isFinite(num)) {
      console.warn(`[Schema Validation Warning] Failed to parse integer for field "${fieldName || 'unknown'}": "${val}" in record:`, recordContext || {});
      return fallback;
    }
    return Math.round(num);
  }
  return fallback;
}

/**
 * Safely parse a value into a float/double precision number.
 * Handles numbers, numeric strings (e.g., '82.5'), null/undefined, and invalid strings.
 */
export function parseFloatNum(val: any, fallback = 0, fieldName?: string, recordContext?: any): number {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return fallback;
    return val;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '') return fallback;
    const num = Number(trimmed);
    if (isNaN(num) || !isFinite(num)) {
      console.warn(`[Schema Validation Warning] Failed to parse float for field "${fieldName || 'unknown'}": "${val}" in record:`, recordContext || {});
      return fallback;
    }
    return num;
  }
  return fallback;
}

/**
 * Safely parse a nullable integer for optional fields.
 */
export function parseNullableInteger(val: any, fieldName?: string, recordContext?: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = typeof val === 'number' ? val : Number(String(val).trim());
  if (isNaN(num) || !isFinite(num)) {
    console.warn(`[Schema Validation Warning] Failed to parse nullable integer for field "${fieldName || 'unknown'}": "${val}" in record:`, recordContext || {});
    return null;
  }
  return Math.round(num);
}

/**
 * Safely parse a nullable float for optional fields.
 */
export function parseNullableFloat(val: any, fieldName?: string, recordContext?: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = typeof val === 'number' ? val : Number(String(val).trim());
  if (isNaN(num) || !isFinite(num)) {
    console.warn(`[Schema Validation Warning] Failed to parse nullable float for field "${fieldName || 'unknown'}": "${val}" in record:`, recordContext || {});
    return null;
  }
  return num;
}

/**
 * Safely parse a boolean value.
 */
export function parseBooleanVal(val: any, fallback = false): boolean {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const lower = val.trim().toLowerCase();
    if (lower === 'true' || lower === '1' || lower === 'yes') return true;
    if (lower === 'false' || lower === '0' || lower === 'no') return false;
  }
  if (typeof val === 'number') return val !== 0;
  return Boolean(val);
}

// -------------------------------------------------------------
// ENTITY SCHEMA VALIDATORS BEFORE DATABASE QUERIES
// -------------------------------------------------------------

export function validateDepartmentRecord(d: any) {
  return {
    id: String(d.id || `dept-${Date.now()}`),
    code: String(d.code || 'DEPT'),
    name: String(d.name || 'Department'),
    hodId: d.hodId ? String(d.hodId) : null,
    hodName: d.hodName ? String(d.hodName) : null,
    establishedYear: parseInteger(d.establishedYear, 2010, 'established_year', d),
    totalStudents: parseInteger(d.totalStudents, 0, 'total_students', d),
    totalFaculty: parseInteger(d.totalFaculty, 0, 'total_faculty', d),
    avgAttendancePct: parseFloatNum(d.avgAttendancePct, 0, 'avg_attendance_pct', d),
  };
}

export function validateProgramRecord(p: any) {
  return {
    id: String(p.id || `prog-${Date.now()}`),
    code: String(p.code || 'UG'),
    name: String(p.name || 'Undergraduate'),
    status: String(p.status || 'Active'),
    createdAt: p.createdAt ? String(p.createdAt) : new Date().toISOString(),
    updatedAt: p.updatedAt ? String(p.updatedAt) : new Date().toISOString(),
  };
}

export function validateCourseRecord(c: any) {
  return {
    id: String(c.id || `course-${Date.now()}`),
    programId: String(c.programId),
    programName: c.programName ? String(c.programName) : null,
    courseName: String(c.courseName || c.name || 'Course'),
    courseCode: String(c.courseCode || c.code || 'CRS'),
    durationYears: parseInteger(c.durationYears, 3, 'duration_years', c),
    totalSemesters: parseInteger(c.totalSemesters, 6, 'total_semesters', c),
    status: String(c.status || 'Active'),
    departmentId: c.departmentId ? String(c.departmentId) : null,
    code: c.code ? String(c.code) : String(c.courseCode || 'CRS'),
    name: c.name ? String(c.name) : String(c.courseName || 'Course'),
    createdAt: c.createdAt ? String(c.createdAt) : new Date().toISOString(),
    updatedAt: c.updatedAt ? String(c.updatedAt) : new Date().toISOString(),
  };
}

export function validateSubjectRecord(s: any) {
  return {
    id: String(s.id || `sub-${Date.now()}`),
    code: String(s.code || 'SUB'),
    name: String(s.name || 'Subject'),
    departmentId: String(s.departmentId),
    programId: s.programId ? String(s.programId) : null,
    programName: s.programName ? String(s.programName) : null,
    courseId: s.courseId ? String(s.courseId) : null,
    courseCode: s.courseCode ? String(s.courseCode) : null,
    semester: parseInteger(s.semester, 1, 'semester', s),
    type: String(s.type || 'Theory'),
    credits: parseInteger(s.credits, 0, 'credits', s),
    assignedFacultyId: s.assignedFacultyId ? String(s.assignedFacultyId) : null,
    assignedFacultyName: s.assignedFacultyName ? String(s.assignedFacultyName) : null,
    status: String(s.status || 'Active'),
  };
}

export function validateStudentRecord(st: any) {
  return mapStudentToSql(st);
}

export function validateFacultyRecord(fac: any) {
  return mapFacultyToSql(fac);
}

export function validateTimetableRecord(t: any) {
  return {
    id: String(t.id || `tt-${Date.now()}`),
    departmentId: String(t.departmentId),
    programId: t.programId ? String(t.programId) : null,
    programName: t.programName ? String(t.programName) : null,
    courseId: t.courseId ? String(t.courseId) : null,
    courseName: t.courseName ? String(t.courseName) : null,
    semester: parseInteger(t.semester, 1, 'semester', t),
    division: String(t.division || 'A'),
    day: String(t.day || 'Monday'),
    timeSlot: String(t.timeSlot || '09:00 AM - 10:00 AM'),
    subjectId: String(t.subjectId),
    subjectName: String(t.subjectName || 'Subject'),
    facultyId: String(t.facultyId),
    facultyName: String(t.facultyName || 'Faculty'),
    classroom: String(t.classroom || 'Room 101'),
    type: String(t.type || 'Lecture'),
  };
}

export function validateSessionRecord(s: any) {
  return {
    id: String(s.id || `sess-${Date.now()}`),
    date: String(s.date || new Date().toISOString().substring(0, 10)),
    departmentId: String(s.departmentId),
    programId: s.programId ? String(s.programId) : null,
    programName: s.programName ? String(s.programName) : null,
    courseId: s.courseId ? String(s.courseId) : null,
    courseName: s.courseName ? String(s.courseName) : null,
    semester: parseInteger(s.semester, 1, 'semester', s),
    division: String(s.division || 'A'),
    subjectId: String(s.subjectId),
    subjectName: String(s.subjectName || 'Subject'),
    facultyId: String(s.facultyId),
    facultyName: String(s.facultyName || 'Faculty'),
    sessionType: String(s.sessionType || 'Lecture'),
    timeSlot: String(s.timeSlot || '09:00 AM - 10:00 AM'),
    classroom: String(s.classroom || 'Room 101'),
    isLocked: parseBooleanVal(s.isLocked, false),
    totalStudents: parseInteger(s.totalStudents, 0, 'total_students', s),
    presentCount: parseInteger(s.presentCount, 0, 'present_count', s),
    absentCount: parseInteger(s.absentCount, 0, 'absent_count', s),
    lateCount: parseInteger(s.lateCount, 0, 'late_count', s),
    onLeaveCount: parseInteger(s.onLeaveCount, 0, 'on_leave_count', s),
  };
}

export function validateAttendanceRecord(r: any) {
  return {
    id: String(r.id || `att-${Date.now()}`),
    sessionId: String(r.sessionId),
    studentId: String(r.studentId),
    studentRoll: r.studentRoll ? String(r.studentRoll) : null,
    studentName: r.studentName ? String(r.studentName) : null,
    status: String(r.status || 'PRESENT'),
    remarks: r.remarks ? String(r.remarks) : null,
    markedAt: r.markedAt ? String(r.markedAt) : null,
    markedBy: r.markedBy ? String(r.markedBy) : null,
  };
}

export function validateLeaveRecord(l: any) {
  return {
    id: String(l.id || `leave-${Date.now()}`),
    applicantId: String(l.applicantId),
    applicantName: String(l.applicantName),
    applicantRole: String(l.applicantRole || 'Student'),
    applicantRollOrId: l.applicantRollOrId ? String(l.applicantRollOrId) : null,
    departmentId: l.departmentId ? String(l.departmentId) : null,
    leaveType: String(l.leaveType || 'Sick Leave'),
    startDate: String(l.startDate || new Date().toISOString().substring(0, 10)),
    endDate: String(l.endDate || new Date().toISOString().substring(0, 10)),
    totalDays: parseInteger(l.totalDays, 1, 'total_days', l),
    reason: l.reason ? String(l.reason) : null,
    medicalDocUrl: l.medicalDocUrl ? String(l.medicalDocUrl) : null,
    status: String(l.status || 'Pending'),
    facultyRemarks: l.facultyRemarks ? String(l.facultyRemarks) : null,
    hodRemarks: l.hodRemarks ? String(l.hodRemarks) : null,
    createdAt: l.createdAt ? String(l.createdAt) : null,
  };
}

export function validateResultRecord(res: any) {
  return {
    id: String(res.id || `res-${Date.now()}`),
    studentId: String(res.studentId),
    studentName: String(res.studentName),
    rollNumber: res.rollNumber ? String(res.rollNumber) : null,
    semester: parseInteger(res.semester, 1, 'semester', res),
    subjectId: res.subjectId ? String(res.subjectId) : null,
    subjectCode: res.subjectCode ? String(res.subjectCode) : null,
    subjectName: String(res.subjectName || 'Subject'),
    internalMarks: parseFloatNum(res.internalMarks, 0, 'internal_marks', res),
    externalMarks: parseFloatNum(res.externalMarks, 0, 'external_marks', res),
    totalMarks: parseFloatNum(res.totalMarks, 0, 'total_marks', res),
    grade: res.grade ? String(res.grade) : null,
    gpa: parseFloatNum(res.gpa, 0, 'gpa', res),
  };
}

export function validateAtktRecord(a: any) {
  return {
    id: String(a.id || `atkt-${Date.now()}`),
    studentId: String(a.studentId),
    studentName: String(a.studentName),
    rollNumber: a.rollNumber ? String(a.rollNumber) : null,
    prnNumber: a.prnNumber ? String(a.prnNumber) : null,
    course: a.course ? String(a.course) : null,
    departmentId: a.departmentId ? String(a.departmentId) : null,
    departmentName: a.departmentName ? String(a.departmentName) : null,
    semester: parseInteger(a.semester, 1, 'semester', a),
    subjectCode: a.subjectCode ? String(a.subjectCode) : null,
    subjectName: String(a.subjectName || 'Subject'),
    backlogType: a.backlogType ? String(a.backlogType) : null,
    originalInternalMarks: parseNullableFloat(a.originalInternalMarks, 'original_internal_marks', a),
    originalExternalMarks: parseNullableFloat(a.originalExternalMarks, 'original_external_marks', a),
    attemptsCount: parseInteger(a.attemptsCount, 1, 'attempts_count', a),
    status: String(a.status || 'Pending'),
    examFeePaid: parseBooleanVal(a.examFeePaid, false),
    examFeeAmount: parseFloatNum(a.examFeeAmount, 0, 'exam_fee_amount', a),
    reExamDate: a.reExamDate ? String(a.reExamDate) : null,
    reExamMarksObtained: parseNullableFloat(a.reExamMarksObtained, 're_exam_marks_obtained', a),
    clearedAt: a.clearedAt ? String(a.clearedAt) : null,
    remarks: a.remarks ? String(a.remarks) : null,
  };
}

export function validateAcademicEventRecord(evt: any) {
  return {
    id: String(evt.id || `evt-${Date.now()}`),
    title: String(evt.title || 'Event'),
    eventType: String(evt.eventType || 'Holiday'),
    category: String(evt.category || 'Academic'),
    startDate: String(evt.startDate || new Date().toISOString().substring(0, 10)),
    endDate: String(evt.endDate || evt.startDate || new Date().toISOString().substring(0, 10)),
    isNonWorkingDay: parseBooleanVal(evt.isNonWorkingDay, true),
    description: evt.description ? String(evt.description) : null,
    departmentId: evt.departmentId ? String(evt.departmentId) : null,
    departmentName: evt.departmentName ? String(evt.departmentName) : null,
    createdBy: String(evt.createdBy || 'Admin'),
    createdAt: evt.createdAt ? String(evt.createdAt) : new Date().toISOString().substring(0, 10),
  };
}

export function validateAuditLogRecord(log: any) {
  return {
    id: String(log.id || `log-${Date.now()}`),
    timestamp: String(log.timestamp || new Date().toISOString()),
    actorName: log.actorName ? String(log.actorName) : null,
    actorRole: log.actorRole ? String(log.actorRole) : null,
    action: String(log.action || 'ACTION'),
    category: String(log.category || 'SYSTEM'),
    details: String(log.details || ''),
    ipAddress: log.ipAddress ? String(log.ipAddress) : null,
  };
}

export function validateChatConversationRecord(conv: any) {
  return {
    id: String(conv.id || `conv-${Date.now()}`),
    participantId: String(conv.participantId),
    participantName: String(conv.participantName),
    participantRole: String(conv.participantRole),
    participantAvatar: conv.participantAvatar ? String(conv.participantAvatar) : null,
    participantStatus: conv.participantStatus ? String(conv.participantStatus) : 'Offline',
    lastMessage: conv.lastMessage ? String(conv.lastMessage) : null,
    lastMessageTime: conv.lastMessageTime ? String(conv.lastMessageTime) : null,
    unreadCount: parseInteger(conv.unreadCount, 0, 'unread_count', conv),
  };
}

export function validateChatMessageRecord(msg: any) {
  return {
    id: String(msg.id || `msg-${Date.now()}`),
    conversationId: String(msg.conversationId),
    senderId: String(msg.senderId),
    senderName: String(msg.senderName),
    senderRole: String(msg.senderRole),
    senderAvatar: msg.senderAvatar ? String(msg.senderAvatar) : null,
    text: String(msg.text || ''),
    attachmentUrl: msg.attachmentUrl ? String(msg.attachmentUrl) : null,
    attachmentType: msg.attachmentType ? String(msg.attachmentType) : null,
    createdAt: String(msg.createdAt || new Date().toISOString()),
    isRead: parseBooleanVal(msg.isRead, false),
  };
}

export function validateImportLogRecord(imp: any) {
  return {
    id: String(imp.id || `imp-${Date.now()}`),
    fileName: String(imp.fileName || 'import.csv'),
    uploadedAt: String(imp.uploadedAt || new Date().toISOString()),
    uploadedBy: String(imp.uploadedBy || 'Admin'),
    totalRecords: parseInteger(imp.totalRecords, 0, 'total_records', imp),
    importedCount: parseInteger(imp.importedCount, 0, 'imported_count', imp),
    updatedCount: parseInteger(imp.updatedCount, 0, 'updated_count', imp),
    skippedCount: parseInteger(imp.skippedCount, 0, 'skipped_count', imp),
    status: String(imp.status || 'Completed'),
  };
}

export function validatePromotionHistoryRecord(promo: any) {
  return {
    id: String(promo.id || `promo-${Date.now()}`),
    batchName: String(promo.batchName || 'Batch Promotion'),
    promotedAt: String(promo.promotedAt || new Date().toISOString()),
    promotedBy: String(promo.promotedBy || 'Admin'),
    program: String(promo.program || 'UG'),
    course: String(promo.course || 'Course'),
    fromSemester: parseInteger(promo.fromSemester, 1, 'from_semester', promo),
    toSemester: parseInteger(promo.toSemester, 2, 'to_semester', promo),
    totalStudentsPromoted: parseInteger(promo.totalStudentsPromoted, 0, 'total_students_promoted', promo),
    status: String(promo.status || 'Completed'),
    records: promo.records ? (typeof promo.records === 'string' ? promo.records : JSON.stringify(promo.records)) : null,
  };
}

export function validateClassTeacherRecord(ct: any) {
  return {
    id: String(ct.id || `ct-${Date.now()}`),
    departmentId: String(ct.departmentId),
    departmentName: String(ct.departmentName),
    courseId: String(ct.courseId),
    courseCode: String(ct.courseCode),
    courseName: String(ct.courseName),
    academicYear: String(ct.academicYear || '2025-2026'),
    semester: parseInteger(ct.semester, 1, 'semester', ct),
    division: String(ct.division || 'A'),
    classTeacherId: String(ct.classTeacherId),
    classTeacherName: String(ct.classTeacherName),
    assistantTeacherId: ct.assistantTeacherId ? String(ct.assistantTeacherId) : null,
    assistantTeacherName: ct.assistantTeacherName ? String(ct.assistantTeacherName) : null,
    classroom: String(ct.classroom || 'Room 101'),
    academicSession: String(ct.academicSession || '2025-2026'),
    assignedAt: String(ct.assignedAt || new Date().toISOString().substring(0, 10)),
    assignedBy: String(ct.assignedBy || 'Admin'),
  };
}

export function validateNoticeRecord(n: any) {
  return {
    id: String(n.id || `notice-${Date.now()}`),
    title: String(n.title || 'Notice'),
    content: String(n.content || ''),
    category: String(n.category || 'General'),
    publishedBy: n.publishedBy ? String(n.publishedBy) : null,
    publishedRole: n.publishedRole ? String(n.publishedRole) : null,
    createdAt: n.createdAt ? String(n.createdAt) : new Date().toISOString(),
    scheduledAt: n.scheduledAt ? String(n.scheduledAt) : null,
    isPinned: parseBooleanVal(n.isPinned, false),
    isArchived: parseBooleanVal(n.isArchived, false),
    targetProgram: n.targetProgram ? String(n.targetProgram) : null,
    targetCourse: n.targetCourse ? String(n.targetCourse) : null,
    targetAcademicYear: n.targetAcademicYear ? String(n.targetAcademicYear) : null,
    targetSemester: parseNullableInteger(n.targetSemester, 'target_semester', n),
    targetDivision: n.targetDivision ? String(n.targetDivision) : null,
    attachmentUrl: n.attachmentUrl ? String(n.attachmentUrl) : null,
    attachmentName: n.attachmentName ? String(n.attachmentName) : null,
    sentChannels: n.sentChannels ? (typeof n.sentChannels === 'string' ? n.sentChannels : JSON.stringify(n.sentChannels)) : null,
  };
}

export function validateDepartmentActivityRecord(da: any) {
  return {
    id: String(da.id || `act-${Date.now()}`),
    type: String(da.type || 'Workshop'),
    title: String(da.title || 'Activity'),
    date: String(da.date || new Date().toISOString().substring(0, 10)),
    organizer: da.organizer ? String(da.organizer) : null,
    roleOrPosition: da.roleOrPosition ? String(da.roleOrPosition) : null,
    description: da.description ? String(da.description) : null,
    photoUrl: da.photoUrl ? String(da.photoUrl) : null,
    certificateUrl: da.certificateUrl ? String(da.certificateUrl) : null,
    departmentId: da.departmentId ? String(da.departmentId) : null,
    departmentName: da.departmentName ? String(da.departmentName) : null,
    venue: da.venue ? String(da.venue) : null,
    speakerOrGuest: da.speakerOrGuest ? String(da.speakerOrGuest) : null,
    targetAudience: da.targetAudience ? String(da.targetAudience) : null,
    participantsCount: parseInteger(da.participantsCount, 0, 'participants_count', da),
    academicYear: da.academicYear ? String(da.academicYear) : null,
    status: da.status ? String(da.status) : 'Completed',
    keyOutcomes: da.keyOutcomes ? String(da.keyOutcomes) : null,
    studentParticipants: da.studentParticipants ? (typeof da.studentParticipants === 'string' ? da.studentParticipants : JSON.stringify(da.studentParticipants)) : null,
  };
}

// Transform PostgreSQL student row to Student360Profile
export function mapSqlToStudent(row: any): Student360Profile {
  return {
    id: row.id,
    studentId: row.studentId,
    rollNumber: row.rollNumber,
    fullName: row.fullName,
    gender: (row.gender as any) || 'Male',
    dob: row.dob || '',
    admissionDate: row.admissionDate || '',
    passportPhoto: row.passportPhoto || '',
    bloodGroup: row.bloodGroup || '',
    category: (row.category as any) || 'General',
    course: row.course || '',
    programId: row.programId || undefined,
    programName: row.programName || undefined,
    courseId: row.courseId || undefined,
    courseCode: row.courseCode || undefined,
    academicYearCode: row.academicYearCode || undefined,
    departmentId: row.departmentId || '',
    departmentName: row.departmentName || '',
    semester: parseInteger(row.semester, 1, 'semester', row),
    division: row.division || 'A',
    academicYear: row.academicYear || '',
    personalMobile: row.personalMobile || '',
    whatsappNumber: row.whatsappNumber || '',
    email: row.email || '',
    emergencyContact: row.emergencyContact || '',
    permanentAddress: row.permanentAddress || '',
    temporaryAddress: row.temporaryAddress || '',
    fatherName: row.fatherName || '',
    motherName: row.motherName || '',
    guardianName: row.guardianName || '',
    parentMobile: row.parentMobile || '',
    parentEmail: row.parentEmail || '',
    parentOccupation: row.parentOccupation || '',
    sscSchoolName: row.sscSchoolName || '',
    sscBoard: row.sscBoard || '',
    sscPassingYear: row.sscPassingYear || '',
    sscPercentage: parseFloatNum(row.sscPercentage, 0, 'ssc_percentage', row),
    hscCollegeName: row.hscCollegeName || '',
    hscBoard: row.hscBoard || '',
    hscStream: row.hscStream || '',
    hscPassingYear: row.hscPassingYear || '',
    hscPercentage: parseFloatNum(row.hscPercentage, 0, 'hsc_percentage', row),
    academicPerformance: safeParse(row.academicPerformance, []),
    sem1Gpa: parseFloatNum(row.sem1Gpa, 0, 'sem1_gpa', row),
    sem2Gpa: parseFloatNum(row.sem2Gpa, 0, 'sem2_gpa', row),
    sem3Gpa: parseFloatNum(row.sem3Gpa, 0, 'sem3_gpa', row),
    sem4Gpa: parseFloatNum(row.sem4Gpa, 0, 'sem4_gpa', row),
    sem5Gpa: parseNullableFloat(row.sem5Gpa, 'sem5_gpa', row) ?? undefined,
    sem6Gpa: parseNullableFloat(row.sem6Gpa, 'sem6_gpa', row) ?? undefined,
    overallCgpa: parseFloatNum(row.overallCgpa, 0, 'overall_cgpa', row),
    technicalSkills: safeParse(row.technicalSkills, []),
    programmingLanguages: safeParse(row.programmingLanguages, []),
    certifications: safeParse(row.certifications, []),
    internships: safeParse(row.internships, []),
    projects: safeParse(row.projects, []),
    sportsAndExtra: safeParse(row.sportsAndExtra, []),
    prnNumber: row.prnNumber || undefined,
    year: row.year || undefined,
    sscYear: row.sscYear || undefined,
    hscYear: row.hscYear || undefined,
    fatherMobile: row.fatherMobile || undefined,
    motherMobile: row.motherMobile || undefined,
    abcId: row.abcId || undefined,
    aadhaarNumber: row.aadhaarNumber || undefined,
    academicStatus: (row.academicStatus as any) || 'Active',
    batch: row.batch || undefined,
    annualIncome: row.annualIncome || undefined,
    totalLectures: parseInteger(row.totalLectures, 0, 'total_lectures', row),
    attendedLectures: parseInteger(row.attendedLectures, 0, 'attended_lectures', row),
    attendancePercentage: parseFloatNum(row.attendancePercentage, 0, 'attendance_percentage', row),
  };
}

// Transform Student360Profile to PostgreSQL schema payload
export function mapStudentToSql(st: Student360Profile): any {
  return {
    id: st.id,
    studentId: st.studentId,
    rollNumber: st.rollNumber,
    fullName: st.fullName,
    gender: st.gender || 'Male',
    dob: st.dob || '',
    admissionDate: st.admissionDate || '',
    passportPhoto: st.passportPhoto || '',
    bloodGroup: st.bloodGroup || '',
    category: st.category || 'General',
    course: st.course || '',
    programId: st.programId ? st.programId : null,
    programName: st.programName || null,
    courseId: st.courseId ? st.courseId : null,
    courseCode: st.courseCode || null,
    academicYearCode: st.academicYearCode || null,
    departmentId: st.departmentId ? st.departmentId : null,
    departmentName: st.departmentName || '',
    semester: parseInteger(st.semester, 1, 'semester', st),
    division: st.division || 'A',
    academicYear: st.academicYear || '',
    personalMobile: st.personalMobile || '',
    whatsappNumber: st.whatsappNumber || '',
    email: st.email || '',
    emergencyContact: st.emergencyContact || '',
    permanentAddress: st.permanentAddress || '',
    temporaryAddress: st.temporaryAddress || '',
    fatherName: st.fatherName || '',
    motherName: st.motherName || '',
    guardianName: st.guardianName || '',
    parentMobile: st.parentMobile || '',
    parentEmail: st.parentEmail || '',
    parentOccupation: st.parentOccupation || '',
    sscSchoolName: st.sscSchoolName || '',
    sscBoard: st.sscBoard || '',
    sscPassingYear: st.sscPassingYear || '',
    sscPercentage: parseFloatNum(st.sscPercentage, 0, 'ssc_percentage', st),
    hscCollegeName: st.hscCollegeName || '',
    hscBoard: st.hscBoard || '',
    hscStream: st.hscStream || '',
    hscPassingYear: st.hscPassingYear || '',
    hscPercentage: parseFloatNum(st.hscPercentage, 0, 'hsc_percentage', st),
    academicPerformance: JSON.stringify(st.academicPerformance || []),
    sem1Gpa: parseFloatNum(st.sem1Gpa, 0, 'sem1_gpa', st),
    sem2Gpa: parseFloatNum(st.sem2Gpa, 0, 'sem2_gpa', st),
    sem3Gpa: parseFloatNum(st.sem3Gpa, 0, 'sem3_gpa', st),
    sem4Gpa: parseFloatNum(st.sem4Gpa, 0, 'sem4_gpa', st),
    sem5Gpa: parseNullableFloat(st.sem5Gpa, 'sem5_gpa', st),
    sem6Gpa: parseNullableFloat(st.sem6Gpa, 'sem6_gpa', st),
    overallCgpa: parseFloatNum(st.overallCgpa, 0, 'overall_cgpa', st),
    technicalSkills: JSON.stringify(st.technicalSkills || []),
    programmingLanguages: JSON.stringify(st.programmingLanguages || []),
    certifications: JSON.stringify(st.certifications || []),
    internships: JSON.stringify(st.internships || []),
    projects: JSON.stringify(st.projects || []),
    sportsAndExtra: JSON.stringify(st.sportsAndExtra || []),
    prnNumber: st.prnNumber || null,
    year: st.year || null,
    sscYear: st.sscYear || null,
    hscYear: st.hscYear || null,
    fatherMobile: st.fatherMobile || null,
    motherMobile: st.motherMobile || null,
    abcId: st.abcId || null,
    aadhaarNumber: st.aadhaarNumber || null,
    academicStatus: st.academicStatus || 'Active',
    batch: st.batch || null,
    annualIncome: st.annualIncome || null,
    totalLectures: parseInteger(st.totalLectures, 0, 'total_lectures', st),
    attendedLectures: parseInteger(st.attendedLectures, 0, 'attended_lectures', st),
    attendancePercentage: parseFloatNum(st.attendancePercentage, 0, 'attendance_percentage', st),
  };
}

// Transform PostgreSQL faculty row to Faculty
export function mapSqlToFaculty(row: any): Faculty {
  return {
    id: row.id,
    facultyId: row.facultyId,
    fullName: row.fullName,
    email: row.email,
    mobile: row.mobile || '',
    departmentId: row.departmentId || '',
    departmentName: row.departmentName || '',
    designation: (row.designation as any) || 'Assistant Professor',
    qualification: row.qualification || '',
    experienceYears: parseInteger(row.experienceYears, 0, 'experience_years', row),
    photo: row.photo || '',
    allocatedSubjects: safeParse(row.allocatedSubjects, []),
    isClassTeacherOf: safeParse(row.isClassTeacherOf, undefined),
    weeklyWorkloadHours: parseFloatNum(row.weeklyWorkloadHours, 0, 'weekly_workload_hours', row),
    isActive: parseBooleanVal(row.isActive, true),
  };
}

export function mapFacultyToSql(fac: Faculty): any {
  return {
    id: fac.id,
    facultyId: fac.facultyId,
    fullName: fac.fullName,
    email: fac.email,
    mobile: fac.mobile || '',
    departmentId: fac.departmentId ? fac.departmentId : null,
    departmentName: fac.departmentName || '',
    designation: fac.designation || 'Assistant Professor',
    qualification: fac.qualification || '',
    experienceYears: parseInteger(fac.experienceYears, 0, 'experience_years', fac),
    photo: fac.photo || '',
    allocatedSubjects: JSON.stringify(fac.allocatedSubjects || []),
    isClassTeacherOf: fac.isClassTeacherOf ? JSON.stringify(fac.isClassTeacherOf) : null,
    weeklyWorkloadHours: parseFloatNum(fac.weeklyWorkloadHours, 0, 'weekly_workload_hours', fac),
    isActive: fac.isActive !== undefined ? parseBooleanVal(fac.isActive, true) : true,
  };
}

// -------------------------------------------------------------
// DATABASE INITIALIZATION & SEEDING
// -------------------------------------------------------------
export async function initializeDatabase(seedData?: any) {
  try {
    console.log('[Cloud SQL] Initializing and verifying SQL database tables...');

    // Execute raw DDL statements to guarantee that all PostgreSQL tables exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS programs (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active',
        created_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        hod_id TEXT,
        hod_name TEXT,
        established_year INTEGER,
        total_students INTEGER DEFAULT 0,
        total_faculty INTEGER DEFAULT 0,
        avg_attendance_pct DOUBLE PRECISION DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL,
        department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
        department_name TEXT,
        phone TEXT,
        avatar TEXT,
        password TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_login TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
        program_name TEXT,
        course_name TEXT NOT NULL,
        course_code TEXT NOT NULL,
        duration_years INTEGER DEFAULT 3,
        total_semesters INTEGER DEFAULT 6,
        status TEXT NOT NULL DEFAULT 'Active',
        department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
        code TEXT,
        name TEXT,
        created_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS faculty_list (
        id TEXT PRIMARY KEY,
        faculty_id TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        mobile TEXT,
        department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
        department_name TEXT,
        designation TEXT,
        qualification TEXT,
        experience_years INTEGER DEFAULT 0,
        photo TEXT,
        allocated_subjects TEXT,
        is_class_teacher_of TEXT,
        weekly_workload_hours DOUBLE PRECISION DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
        program_id TEXT REFERENCES programs(id) ON DELETE SET NULL,
        program_name TEXT,
        course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
        course_code TEXT,
        semester INTEGER NOT NULL,
        type TEXT NOT NULL,
        credits INTEGER NOT NULL,
        assigned_faculty_id TEXT REFERENCES faculty_list(id) ON DELETE SET NULL,
        assigned_faculty_name TEXT,
        status TEXT DEFAULT 'Active'
      );

      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        roll_number TEXT NOT NULL,
        full_name TEXT NOT NULL,
        gender TEXT,
        dob TEXT,
        admission_date TEXT,
        passport_photo TEXT,
        blood_group TEXT,
        category TEXT,
        course TEXT,
        program_id TEXT REFERENCES programs(id) ON DELETE SET NULL,
        program_name TEXT,
        course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
        course_code TEXT,
        academic_year_code TEXT,
        department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
        department_name TEXT,
        semester INTEGER NOT NULL,
        division TEXT NOT NULL,
        academic_year TEXT,
        personal_mobile TEXT,
        whatsapp_number TEXT,
        email TEXT,
        emergency_contact TEXT,
        permanent_address TEXT,
        temporary_address TEXT,
        father_name TEXT,
        mother_name TEXT,
        guardian_name TEXT,
        parent_mobile TEXT,
        parent_email TEXT,
        parent_occupation TEXT,
        ssc_school_name TEXT,
        ssc_board TEXT,
        ssc_passing_year TEXT,
        ssc_percentage DOUBLE PRECISION,
        hsc_college_name TEXT,
        hsc_board TEXT,
        hsc_stream TEXT,
        hsc_passing_year TEXT,
        hsc_percentage DOUBLE PRECISION,
        academic_performance TEXT,
        sem1_gpa DOUBLE PRECISION,
        sem2_gpa DOUBLE PRECISION,
        sem3_gpa DOUBLE PRECISION,
        sem4_gpa DOUBLE PRECISION,
        sem5_gpa DOUBLE PRECISION,
        sem6_gpa DOUBLE PRECISION,
        overall_cgpa DOUBLE PRECISION,
        technical_skills TEXT,
        programming_languages TEXT,
        certifications TEXT,
        internships TEXT,
        projects TEXT,
        sports_and_extra TEXT,
        prn_number TEXT,
        year TEXT,
        ssc_year TEXT,
        hsc_year TEXT,
        father_mobile TEXT,
        mother_mobile TEXT,
        abc_id TEXT,
        aadhaar_number TEXT,
        academic_status TEXT,
        batch TEXT,
        annual_income TEXT,
        total_lectures INTEGER DEFAULT 0,
        attended_lectures INTEGER DEFAULT 0,
        attendance_percentage DOUBLE PRECISION DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS timetable (
        id TEXT PRIMARY KEY,
        department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
        program_id TEXT REFERENCES programs(id) ON DELETE SET NULL,
        program_name TEXT,
        course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
        course_name TEXT,
        semester INTEGER NOT NULL,
        division TEXT NOT NULL,
        day TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        subject_name TEXT NOT NULL,
        faculty_id TEXT NOT NULL REFERENCES faculty_list(id) ON DELETE CASCADE,
        faculty_name TEXT NOT NULL,
        classroom TEXT NOT NULL,
        type TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
        program_id TEXT REFERENCES programs(id) ON DELETE SET NULL,
        program_name TEXT,
        course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
        course_name TEXT,
        semester INTEGER NOT NULL,
        division TEXT NOT NULL,
        subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        subject_name TEXT NOT NULL,
        faculty_id TEXT NOT NULL REFERENCES faculty_list(id) ON DELETE CASCADE,
        faculty_name TEXT NOT NULL,
        session_type TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        classroom TEXT NOT NULL,
        is_locked BOOLEAN NOT NULL DEFAULT false,
        total_students INTEGER DEFAULT 0,
        present_count INTEGER DEFAULT 0,
        absent_count INTEGER DEFAULT 0,
        late_count INTEGER DEFAULT 0,
        on_leave_count INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS attendance_records (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        student_roll TEXT,
        student_name TEXT,
        status TEXT NOT NULL,
        remarks TEXT,
        marked_at TEXT,
        marked_by TEXT
      );

      CREATE TABLE IF NOT EXISTS leaves (
        id TEXT PRIMARY KEY,
        applicant_id TEXT NOT NULL,
        applicant_name TEXT NOT NULL,
        applicant_role TEXT NOT NULL,
        applicant_roll_or_id TEXT,
        department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
        leave_type TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        total_days INTEGER DEFAULT 1,
        reason TEXT,
        medical_doc_url TEXT,
        status TEXT NOT NULL,
        faculty_remarks TEXT,
        hod_remarks TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS corrections (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        student_name TEXT NOT NULL,
        roll_number TEXT,
        department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
        date TEXT NOT NULL,
        subject_name TEXT NOT NULL,
        current_status TEXT NOT NULL,
        requested_status TEXT NOT NULL,
        reason TEXT,
        status TEXT NOT NULL,
        applied_at TEXT,
        reviewed_by TEXT,
        reviewed_at TEXT
      );

      CREATE TABLE IF NOT EXISTS results (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        student_name TEXT NOT NULL,
        roll_number TEXT,
        semester INTEGER NOT NULL,
        subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
        subject_code TEXT,
        subject_name TEXT NOT NULL,
        internal_marks DOUBLE PRECISION DEFAULT 0,
        external_marks DOUBLE PRECISION DEFAULT 0,
        total_marks DOUBLE PRECISION DEFAULT 0,
        grade TEXT,
        gpa DOUBLE PRECISION
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        role TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT false,
        created_at TEXT NOT NULL,
        action_url TEXT
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        actor_name TEXT,
        actor_role TEXT,
        action TEXT NOT NULL,
        category TEXT NOT NULL,
        details TEXT NOT NULL,
        ip_address TEXT
      );

      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS atkt_records (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        student_name TEXT NOT NULL,
        roll_number TEXT,
        prn_number TEXT,
        course TEXT,
        department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
        department_name TEXT,
        semester INTEGER NOT NULL,
        subject_code TEXT,
        subject_name TEXT NOT NULL,
        backlog_type TEXT,
        original_internal_marks DOUBLE PRECISION,
        original_external_marks DOUBLE PRECISION,
        attempts_count INTEGER DEFAULT 1,
        status TEXT NOT NULL,
        exam_fee_paid BOOLEAN DEFAULT false,
        exam_fee_amount DOUBLE PRECISION DEFAULT 0,
        re_exam_date TEXT,
        re_exam_marks_obtained DOUBLE PRECISION,
        cleared_at TEXT,
        remarks TEXT
      );

      CREATE TABLE IF NOT EXISTS academic_events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        event_type TEXT NOT NULL,
        category TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        is_non_working_day BOOLEAN NOT NULL DEFAULT true,
        description TEXT,
        department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
        department_name TEXT,
        created_by TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS notices (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        published_by TEXT,
        published_role TEXT,
        created_at TEXT,
        scheduled_at TEXT,
        is_pinned BOOLEAN DEFAULT false,
        is_archived BOOLEAN DEFAULT false,
        target_program TEXT,
        target_course TEXT,
        target_academic_year TEXT,
        target_semester INTEGER,
        target_division TEXT,
        attachment_url TEXT,
        attachment_name TEXT,
        sent_channels TEXT
      );

      CREATE TABLE IF NOT EXISTS department_activities (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        organizer TEXT,
        role_or_position TEXT,
        description TEXT,
        photo_url TEXT,
        certificate_url TEXT,
        department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
        department_name TEXT,
        venue TEXT,
        speaker_or_guest TEXT,
        target_audience TEXT,
        participants_count INTEGER DEFAULT 0,
        academic_year TEXT,
        status TEXT,
        key_outcomes TEXT,
        student_participants TEXT
      );

      CREATE TABLE IF NOT EXISTS chat_conversations (
        id TEXT PRIMARY KEY,
        participant_id TEXT NOT NULL,
        participant_name TEXT NOT NULL,
        participant_role TEXT NOT NULL,
        participant_avatar TEXT,
        participant_status TEXT DEFAULT 'Offline',
        last_message TEXT,
        last_message_time TEXT,
        unread_count INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
        sender_id TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        sender_role TEXT NOT NULL,
        sender_avatar TEXT,
        text TEXT NOT NULL,
        attachment_url TEXT,
        attachment_type TEXT,
        created_at TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS import_logs (
        id TEXT PRIMARY KEY,
        file_name TEXT NOT NULL,
        uploaded_at TEXT NOT NULL,
        uploaded_by TEXT NOT NULL,
        total_records INTEGER DEFAULT 0,
        imported_count INTEGER DEFAULT 0,
        updated_count INTEGER DEFAULT 0,
        skipped_count INTEGER DEFAULT 0,
        status TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS promotion_history (
        id TEXT PRIMARY KEY,
        batch_name TEXT NOT NULL,
        promoted_at TEXT NOT NULL,
        promoted_by TEXT NOT NULL,
        program TEXT NOT NULL,
        course TEXT NOT NULL,
        from_semester INTEGER NOT NULL,
        to_semester INTEGER NOT NULL,
        total_students_promoted INTEGER DEFAULT 0,
        status TEXT NOT NULL,
        records TEXT
      );

      CREATE TABLE IF NOT EXISTS class_teacher_assignments (
        id TEXT PRIMARY KEY,
        department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
        department_name TEXT NOT NULL,
        course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        course_code TEXT NOT NULL,
        course_name TEXT NOT NULL,
        academic_year TEXT NOT NULL,
        semester INTEGER NOT NULL,
        division TEXT NOT NULL,
        class_teacher_id TEXT NOT NULL REFERENCES faculty_list(id) ON DELETE CASCADE,
        class_teacher_name TEXT NOT NULL,
        assistant_teacher_id TEXT REFERENCES faculty_list(id) ON DELETE SET NULL,
        assistant_teacher_name TEXT,
        classroom TEXT NOT NULL,
        academic_session TEXT NOT NULL,
        assigned_at TEXT NOT NULL,
        assigned_by TEXT NOT NULL
      );

      DO $$
      BEGIN
        BEGIN
          ALTER TABLE departments ALTER COLUMN avg_attendance_pct TYPE DOUBLE PRECISION USING avg_attendance_pct::double precision;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        BEGIN
          ALTER TABLE students ALTER COLUMN ssc_percentage TYPE DOUBLE PRECISION USING ssc_percentage::double precision;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        BEGIN
          ALTER TABLE students ALTER COLUMN hsc_percentage TYPE DOUBLE PRECISION USING hsc_percentage::double precision;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        BEGIN
          ALTER TABLE students ALTER COLUMN sem1_gpa TYPE DOUBLE PRECISION USING sem1_gpa::double precision;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        BEGIN
          ALTER TABLE students ALTER COLUMN sem2_gpa TYPE DOUBLE PRECISION USING sem2_gpa::double precision;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        BEGIN
          ALTER TABLE students ALTER COLUMN sem3_gpa TYPE DOUBLE PRECISION USING sem3_gpa::double precision;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        BEGIN
          ALTER TABLE students ALTER COLUMN sem4_gpa TYPE DOUBLE PRECISION USING sem4_gpa::double precision;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        BEGIN
          ALTER TABLE students ALTER COLUMN sem5_gpa TYPE DOUBLE PRECISION USING sem5_gpa::double precision;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        BEGIN
          ALTER TABLE students ALTER COLUMN sem6_gpa TYPE DOUBLE PRECISION USING sem6_gpa::double precision;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        BEGIN
          ALTER TABLE students ALTER COLUMN overall_cgpa TYPE DOUBLE PRECISION USING overall_cgpa::double precision;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        BEGIN
          ALTER TABLE students ALTER COLUMN attendance_percentage TYPE DOUBLE PRECISION USING attendance_percentage::double precision;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
      END $$;
    `);

    // 1. Users
    try {
      const usersToInsert = (Array.isArray(seedData?.users) && seedData.users.length > 0) ? seedData.users : INITIAL_USERS;
      for (const u of usersToInsert) {
        try {
          await insertUser(u);
        } catch (uErr: any) {
          console.error(`[initializeDatabase users seed error] Failed for user ID "${u?.id}" (${u?.email}):`, {
            errorMessage: uErr?.message,
            errorCode: uErr?.code,
            errorDetail: uErr?.detail,
            failedRecordId: u?.id,
            tableName: 'users',
            parameters: { id: u?.id, email: u?.email, name: u?.name, role: u?.role, departmentId: u?.departmentId },
            rawRecord: u,
          });
        }
      }
    } catch (uErr) {
      console.error('[initializeDatabase users seed top-level]:', uErr);
    }

    // 2. Programs
    try {
      const progsToInsert = (Array.isArray(seedData?.programs) && seedData.programs.length > 0) ? seedData.programs : INITIAL_PROGRAMS;
      for (const p of progsToInsert) {
        try {
          const validated = validateProgramRecord(p);
          await db.insert(schema.programs).values(validated).onConflictDoNothing();
        } catch (pErr: any) {
          console.error(`[initializeDatabase programs seed error] Failed for program ID "${p?.id}" (${p?.code}):`, {
            errorMessage: pErr?.message,
            errorCode: pErr?.code,
            errorDetail: pErr?.detail,
            failedRecordId: p?.id,
            tableName: 'programs',
            parameters: { id: p?.id, code: p?.code, name: p?.name, status: p?.status },
            rawRecord: p,
          });
        }
      }
    } catch (pErr) {
      console.error('[initializeDatabase programs seed top-level]:', pErr);
    }

    // 3. Departments
    try {
      const deptsToInsert = (Array.isArray(seedData?.departments) && seedData.departments.length > 0) ? seedData.departments : INITIAL_DEPARTMENTS;
      for (const d of deptsToInsert) {
        try {
          const validated = validateDepartmentRecord(d);
          await db.insert(schema.departments).values(validated).onConflictDoNothing();
        } catch (dErr: any) {
          console.error(`[initializeDatabase departments seed error] Failed for department ID "${d?.id}" (${d?.code} - ${d?.name}):`, {
            errorMessage: dErr?.message,
            errorCode: dErr?.code,
            errorDetail: dErr?.detail,
            failedRecordId: d?.id,
            tableName: 'departments',
            parameters: {
              id: d?.id,
              code: d?.code,
              name: d?.name,
              establishedYear: d?.establishedYear,
              totalStudents: d?.totalStudents,
              totalFaculty: d?.totalFaculty,
              avgAttendancePct: d?.avgAttendancePct,
            },
            rawRecord: d,
          });
        }
      }
    } catch (dErr) {
      console.error('[initializeDatabase departments seed top-level]:', dErr);
    }

    // 4. Courses
    try {
      const coursesToInsert = (Array.isArray(seedData?.courses) && seedData.courses.length > 0) ? seedData.courses : INITIAL_COURSES;
      for (const c of coursesToInsert) {
        try {
          const validated = validateCourseRecord(c);
          await db.insert(schema.courses).values(validated).onConflictDoNothing();
        } catch (cErr: any) {
          console.error(`[initializeDatabase courses seed error] Failed for course ID "${c?.id}" (${c?.courseCode || c?.code}):`, {
            errorMessage: cErr?.message,
            errorCode: cErr?.code,
            errorDetail: cErr?.detail,
            failedRecordId: c?.id,
            tableName: 'courses',
            parameters: {
              id: c?.id,
              programId: c?.programId,
              courseName: c?.courseName,
              courseCode: c?.courseCode,
              durationYears: c?.durationYears,
              totalSemesters: c?.totalSemesters,
            },
            rawRecord: c,
          });
        }
      }
    } catch (cErr) {
      console.error('[initializeDatabase courses seed top-level]:', cErr);
    }

    // 5. Subjects
    try {
      const subjectsToInsert = (Array.isArray(seedData?.subjects) && seedData.subjects.length > 0) ? seedData.subjects : INITIAL_SUBJECTS;
      for (const s of subjectsToInsert) {
        try {
          const validated = validateSubjectRecord(s);
          await db.insert(schema.subjects).values(validated).onConflictDoNothing();
        } catch (sErr: any) {
          console.error(`[initializeDatabase subjects seed error] Failed for subject ID "${s?.id}" (${s?.code} - ${s?.name}):`, {
            errorMessage: sErr?.message,
            errorCode: sErr?.code,
            errorDetail: sErr?.detail,
            failedRecordId: s?.id,
            tableName: 'subjects',
            parameters: {
              id: s?.id,
              code: s?.code,
              name: s?.name,
              semester: s?.semester,
              credits: s?.credits,
              type: s?.type,
              departmentId: s?.departmentId,
            },
            rawRecord: s,
          });
        }
      }
    } catch (sErr) {
      console.error('[initializeDatabase subjects seed top-level]:', sErr);
    }

    // 6. Students
    try {
      const studentsToInsert = (Array.isArray(seedData?.students) && seedData.students.length > 0) ? seedData.students : INITIAL_STUDENTS;
      for (const st of studentsToInsert) {
        try {
          await upsertStudent(st);
        } catch (stErr: any) {
          console.error(`[initializeDatabase students seed error] Failed for student ID "${st?.id}" (${st?.studentId} - ${st?.fullName}):`, {
            errorMessage: stErr?.message,
            errorCode: stErr?.code,
            errorDetail: stErr?.detail,
            failedRecordId: st?.id,
            tableName: 'students',
            parameters: {
              id: st?.id,
              studentId: st?.studentId,
              rollNumber: st?.rollNumber,
              fullName: st?.fullName,
              semester: st?.semester,
              attendancePercentage: st?.attendancePercentage,
              sscPercentage: st?.sscPercentage,
              hscPercentage: st?.hscPercentage,
              sem1Gpa: st?.sem1Gpa,
              sem2Gpa: st?.sem2Gpa,
              overallCgpa: st?.overallCgpa,
            },
            rawRecord: st,
          });
        }
      }
    } catch (stErr) {
      console.error('[initializeDatabase students seed top-level]:', stErr);
    }

    // 7. Faculty
    try {
      const facToInsert = (Array.isArray(seedData?.facultyList) && seedData.facultyList.length > 0) ? seedData.facultyList : INITIAL_FACULTY;
      for (const f of facToInsert) {
        try {
          const validated = validateFacultyRecord(f);
          await db.insert(schema.facultyList).values(validated).onConflictDoNothing();
        } catch (fErr: any) {
          console.error(`[initializeDatabase faculty seed error] Failed for faculty ID "${f?.id}" (${f?.facultyId} - ${f?.fullName}):`, {
            errorMessage: fErr?.message,
            errorCode: fErr?.code,
            errorDetail: fErr?.detail,
            failedRecordId: f?.id,
            tableName: 'faculty_list',
            parameters: {
              id: f?.id,
              facultyId: f?.facultyId,
              fullName: f?.fullName,
              email: f?.email,
              experienceYears: f?.experienceYears,
              weeklyWorkloadHours: f?.weeklyWorkloadHours,
            },
            rawRecord: f,
          });
        }
      }
    } catch (fErr) {
      console.error('[initializeDatabase faculty seed top-level]:', fErr);
    }

    // 8. Timetable
    try {
      const existingTimetable = await db.select().from(schema.timetable);
      if (existingTimetable.length === 0) {
        const ttToInsert = (Array.isArray(seedData?.timetable) && seedData.timetable.length > 0) ? seedData.timetable : INITIAL_TIMETABLE;
        for (const t of ttToInsert) {
          try {
            const validated = validateTimetableRecord(t);
            await db.insert(schema.timetable).values(validated).onConflictDoNothing();
          } catch (ttErr: any) {
            console.error(`[initializeDatabase timetable seed error] Failed for timetable ID "${t?.id}" (${t?.subjectName} on ${t?.day} ${t?.timeSlot}):`, {
              errorMessage: ttErr?.message,
              errorCode: ttErr?.code,
              errorDetail: ttErr?.detail,
              failedRecordId: t?.id,
              tableName: 'timetable',
              parameters: {
                id: t?.id,
                semester: t?.semester,
                division: t?.division,
                day: t?.day,
                timeSlot: t?.timeSlot,
                subjectId: t?.subjectId,
                facultyId: t?.facultyId,
              },
              rawRecord: t,
            });
          }
        }
      }
    } catch (ttErr) {
      console.error('[initializeDatabase timetable seed top-level]:', ttErr);
    }

    // 9. Sessions & Attendance Records
    try {
      const existingSessions = await db.select().from(schema.sessions);
      if (existingSessions.length === 0) {
        const sessToInsert = (Array.isArray(seedData?.sessions) && seedData.sessions.length > 0) ? seedData.sessions : INITIAL_SESSIONS;
        for (const s of sessToInsert) {
          try {
            const validated = validateSessionRecord(s);
            await db.insert(schema.sessions).values(validated).onConflictDoNothing();
          } catch (sessErr: any) {
            console.error(`[initializeDatabase sessions seed error] Failed for session ID "${s?.id}" (${s?.subjectName} - ${s?.date}):`, {
              errorMessage: sessErr?.message,
              errorCode: sessErr?.code,
              errorDetail: sessErr?.detail,
              failedRecordId: s?.id,
              tableName: 'sessions',
              parameters: {
                id: s?.id,
                semester: s?.semester,
                totalStudents: s?.totalStudents,
                presentCount: s?.presentCount,
                absentCount: s?.absentCount,
                lateCount: s?.lateCount,
                onLeaveCount: s?.onLeaveCount,
              },
              rawRecord: s,
            });
          }
        }
      }
    } catch (sessErr) {
      console.error('[initializeDatabase sessions seed top-level]:', sessErr);
    }

    try {
      const existingAttRecs = await db.select().from(schema.attendanceRecords);
      if (existingAttRecs.length === 0) {
        const recsToInsert = (Array.isArray(seedData?.attendanceRecords) && seedData.attendanceRecords.length > 0) ? seedData.attendanceRecords : INITIAL_ATTENDANCE_RECORDS;
        for (const r of recsToInsert) {
          try {
            const validated = validateAttendanceRecord(r);
            await db.insert(schema.attendanceRecords).values(validated).onConflictDoNothing();
          } catch (attErr: any) {
            console.error(`[initializeDatabase attendanceRecords seed error] Failed for record ID "${r?.id}" (student: ${r?.studentName}):`, {
              errorMessage: attErr?.message,
              errorCode: attErr?.code,
              errorDetail: attErr?.detail,
              failedRecordId: r?.id,
              tableName: 'attendance_records',
              parameters: { id: r?.id, sessionId: r?.sessionId, studentId: r?.studentId, status: r?.status },
              rawRecord: r,
            });
          }
        }
      }
    } catch (attErr) {
      console.error('[initializeDatabase attendanceRecords seed top-level]:', attErr);
    }

    // 10. Leaves & Corrections
    try {
      const existingLeaves = await db.select().from(schema.leaves);
      if (existingLeaves.length === 0) {
        const leavesToInsert = (Array.isArray(seedData?.leaves) && seedData.leaves.length > 0) ? seedData.leaves : INITIAL_LEAVES;
        for (const l of leavesToInsert) {
          try {
            const validated = validateLeaveRecord(l);
            await db.insert(schema.leaves).values(validated).onConflictDoNothing();
          } catch (lErr: any) {
            console.error(`[initializeDatabase leaves seed error] Failed for leave ID "${l?.id}" (${l?.applicantName}):`, {
              errorMessage: lErr?.message,
              errorCode: lErr?.code,
              errorDetail: lErr?.detail,
              failedRecordId: l?.id,
              tableName: 'leaves',
              parameters: {
                id: l?.id,
                totalDays: l?.totalDays,
                leaveType: l?.leaveType,
                startDate: l?.startDate,
                endDate: l?.endDate,
              },
              rawRecord: l,
            });
          }
        }
      }
    } catch (lErr) {
      console.error('[initializeDatabase leaves seed top-level]:', lErr);
    }

    // 11. Results
    try {
      const existingResults = await db.select().from(schema.results);
      if (existingResults.length === 0) {
        const resultsToInsert = (Array.isArray(seedData?.results) && seedData.results.length > 0) ? seedData.results : INITIAL_RESULTS;
        for (const res of resultsToInsert) {
          try {
            const validated = validateResultRecord(res);
            await db.insert(schema.results).values(validated).onConflictDoNothing();
          } catch (rErr: any) {
            console.error(`[initializeDatabase results seed error] Failed for result ID "${res?.id}" (${res?.studentName} - ${res?.subjectName}):`, {
              errorMessage: rErr?.message,
              errorCode: rErr?.code,
              errorDetail: rErr?.detail,
              failedRecordId: res?.id,
              tableName: 'results',
              parameters: {
                id: res?.id,
                semester: res?.semester,
                internalMarks: res?.internalMarks,
                externalMarks: res?.externalMarks,
                totalMarks: res?.totalMarks,
                gpa: res?.gpa,
              },
              rawRecord: res,
            });
          }
        }
      }
    } catch (rErr) {
      console.error('[initializeDatabase results seed top-level]:', rErr);
    }

    // 12. Settings
    try {
      const existingSettings = await db.select().from(schema.settings).where(eq(schema.settings.id, 'college_settings'));
      if (existingSettings.length === 0) {
        const settingsToInsert = (seedData?.settings && seedData.settings.minimumAttendancePct) ? seedData.settings : INITIAL_SETTINGS;
        await db.insert(schema.settings).values({
          id: 'college_settings',
          data: JSON.stringify(settingsToInsert),
        }).onConflictDoNothing();
      }
    } catch (setErr: any) {
      console.error('[initializeDatabase settings seed error]:', {
        errorMessage: setErr?.message,
        errorCode: setErr?.code,
        errorDetail: setErr?.detail,
        tableName: 'settings',
      });
    }

    // 13. ATKT Records
    try {
      const existingAtkt = await db.select().from(schema.atktRecords);
      if (existingAtkt.length === 0) {
        const atktToInsert = (Array.isArray(seedData?.atktRecords) && seedData.atktRecords.length > 0) ? seedData.atktRecords : INITIAL_ATKT_RECORDS;
        for (const a of atktToInsert) {
          try {
            const validated = validateAtktRecord(a);
            await db.insert(schema.atktRecords).values(validated).onConflictDoNothing();
          } catch (atktErr: any) {
            console.error(`[initializeDatabase atktRecords seed error] Failed for ATKT record ID "${a?.id}" (${a?.studentName} - ${a?.subjectName}):`, {
              errorMessage: atktErr?.message,
              errorCode: atktErr?.code,
              errorDetail: atktErr?.detail,
              failedRecordId: a?.id,
              tableName: 'atkt_records',
              parameters: {
                id: a?.id,
                semester: a?.semester,
                originalInternalMarks: a?.originalInternalMarks,
                originalExternalMarks: a?.originalExternalMarks,
                attemptsCount: a?.attemptsCount,
                examFeeAmount: a?.examFeeAmount,
                reExamMarksObtained: a?.reExamMarksObtained,
              },
              rawRecord: a,
            });
          }
        }
      }
    } catch (atktErr) {
      console.error('[initializeDatabase atktRecords seed top-level]:', atktErr);
    }

    // 14. Academic Calendar Events
    try {
      const existingEvents = await db.select().from(schema.academicEvents);
      if (existingEvents.length === 0) {
        const eventsToInsert = (Array.isArray(seedData?.academicEvents) && seedData.academicEvents.length > 0) ? seedData.academicEvents : INITIAL_ACADEMIC_EVENTS;
        for (const evt of eventsToInsert) {
          try {
            const validated = validateAcademicEventRecord(evt);
            await db.insert(schema.academicEvents).values(validated).onConflictDoNothing();
          } catch (evtErr: any) {
            console.error(`[initializeDatabase academicEvents seed error] Failed for event ID "${evt?.id}" (${evt?.title}):`, {
              errorMessage: evtErr?.message,
              errorCode: evtErr?.code,
              errorDetail: evtErr?.detail,
              failedRecordId: evt?.id,
              tableName: 'academic_events',
              parameters: {
                id: evt?.id,
                startDate: evt?.startDate,
                endDate: evt?.endDate,
                isNonWorkingDay: evt?.isNonWorkingDay,
              },
              rawRecord: evt,
            });
          }
        }
      }
    } catch (evtErr) {
      console.error('[initializeDatabase academicEvents seed top-level]:', evtErr);
    }

    // 15. Audit Logs
    try {
      const existingLogs = await db.select().from(schema.auditLogs);
      if (existingLogs.length === 0) {
        const logsToInsert = (Array.isArray(seedData?.auditLogs) && seedData.auditLogs.length > 0) ? seedData.auditLogs : INITIAL_AUDIT_LOGS;
        for (const log of logsToInsert) {
          try {
            const validated = validateAuditLogRecord(log);
            await db.insert(schema.auditLogs).values(validated).onConflictDoNothing();
          } catch (logErr: any) {
            console.error(`[initializeDatabase auditLogs seed error] Failed for audit log ID "${log?.id}":`, {
              errorMessage: logErr?.message,
              errorCode: logErr?.code,
              errorDetail: logErr?.detail,
              failedRecordId: log?.id,
              tableName: 'audit_logs',
              parameters: { id: log?.id, timestamp: log?.timestamp, action: log?.action },
              rawRecord: log,
            });
          }
        }
      }
    } catch (logErr) {
      console.error('[initializeDatabase auditLogs seed top-level]:', logErr);
    }

    // 16. Chat Conversations & Messages
    try {
      const existingChatConvs = await db.select().from(schema.chatConversations);
      if (existingChatConvs.length === 0) {
        const convsToInsert = (Array.isArray(seedData?.chatConversations) && seedData.chatConversations.length > 0) ? seedData.chatConversations : INITIAL_CHAT_CONVERSATIONS;
        for (const conv of convsToInsert) {
          try {
            const validated = validateChatConversationRecord(conv);
            await db.insert(schema.chatConversations).values(validated).onConflictDoNothing();
          } catch (convErr: any) {
            console.error(`[initializeDatabase chatConversations seed error] Failed for conversation ID "${conv?.id}":`, {
              errorMessage: convErr?.message,
              errorCode: convErr?.code,
              errorDetail: convErr?.detail,
              failedRecordId: conv?.id,
              tableName: 'chat_conversations',
              parameters: { id: conv?.id, unreadCount: conv?.unreadCount },
              rawRecord: conv,
            });
          }
        }
      }
    } catch (convErr) {
      console.error('[initializeDatabase chatConversations seed top-level]:', convErr);
    }

    try {
      const existingChatMsgs = await db.select().from(schema.chatMessages);
      if (existingChatMsgs.length === 0) {
        let msgsToInsert: any[] = [];
        if (Array.isArray(seedData?.chatMessages) && seedData.chatMessages.length > 0) {
          msgsToInsert = seedData.chatMessages;
        } else if (seedData?.chatMessages && typeof seedData.chatMessages === 'object') {
          msgsToInsert = Object.values(seedData.chatMessages).flat();
        } else {
          msgsToInsert = Object.values(INITIAL_CHAT_MESSAGES).flat();
        }

        for (const msg of msgsToInsert) {
          try {
            const validated = validateChatMessageRecord(msg);
            await db.insert(schema.chatMessages).values(validated).onConflictDoNothing();
          } catch (msgErr: any) {
            console.error(`[initializeDatabase chatMessages seed error] Failed for message ID "${msg?.id}":`, {
              errorMessage: msgErr?.message,
              errorCode: msgErr?.code,
              errorDetail: msgErr?.detail,
              failedRecordId: msg?.id,
              tableName: 'chat_messages',
              parameters: { id: msg?.id, conversationId: msg?.conversationId, isRead: msg?.isRead },
              rawRecord: msg,
            });
          }
        }
      }
    } catch (msgErr) {
      console.error('[initializeDatabase chatMessages seed top-level]:', msgErr);
    }

    // 17. Import Logs
    try {
      const existingImportLogs = await db.select().from(schema.importLogs);
      if (existingImportLogs.length === 0) {
        const importsToInsert = (Array.isArray(seedData?.importLogs) && seedData.importLogs.length > 0) ? seedData.importLogs : INITIAL_IMPORT_LOGS;
        for (const imp of importsToInsert) {
          try {
            const validated = validateImportLogRecord(imp);
            await db.insert(schema.importLogs).values(validated).onConflictDoNothing();
          } catch (impErr: any) {
            console.error(`[initializeDatabase importLogs seed error] Failed for import log ID "${imp?.id}":`, {
              errorMessage: impErr?.message,
              errorCode: impErr?.code,
              errorDetail: impErr?.detail,
              failedRecordId: imp?.id,
              tableName: 'import_logs',
              parameters: {
                id: imp?.id,
                totalRecords: imp?.totalRecords,
                importedCount: imp?.importedCount,
                updatedCount: imp?.updatedCount,
                skippedCount: imp?.skippedCount,
              },
              rawRecord: imp,
            });
          }
        }
      }
    } catch (impErr) {
      console.error('[initializeDatabase importLogs seed top-level]:', impErr);
    }

    // 18. Promotion History
    try {
      const existingPromos = await db.select().from(schema.promotionHistory);
      if (existingPromos.length === 0) {
        const promosToInsert = (Array.isArray(seedData?.promotionHistory) && seedData.promotionHistory.length > 0) ? seedData.promotionHistory : INITIAL_PROMOTION_HISTORY;
        for (const promo of promosToInsert) {
          try {
            const validated = validatePromotionHistoryRecord(promo);
            await db.insert(schema.promotionHistory).values(validated).onConflictDoNothing();
          } catch (promoErr: any) {
            console.error(`[initializeDatabase promotionHistory seed error] Failed for promotion ID "${promo?.id}":`, {
              errorMessage: promoErr?.message,
              errorCode: promoErr?.code,
              errorDetail: promoErr?.detail,
              failedRecordId: promo?.id,
              tableName: 'promotion_history',
              parameters: {
                id: promo?.id,
                fromSemester: promo?.fromSemester,
                toSemester: promo?.toSemester,
                totalStudentsPromoted: promo?.totalStudentsPromoted,
              },
              rawRecord: promo,
            });
          }
        }
      }
    } catch (promoErr) {
      console.error('[initializeDatabase promotionHistory seed top-level]:', promoErr);
    }

    // 19. Class Teacher Assignments
    try {
      const existingClassTeachers = await db.select().from(schema.classTeacherAssignments);
      if (existingClassTeachers.length === 0) {
        const ctToInsert = (Array.isArray(seedData?.classTeachers) && seedData.classTeachers.length > 0) ? seedData.classTeachers : INITIAL_CLASS_TEACHERS;
        for (const ct of ctToInsert) {
          try {
            const validated = validateClassTeacherRecord(ct);
            await db.insert(schema.classTeacherAssignments).values(validated).onConflictDoNothing();
          } catch (ctErr: any) {
            console.error(`[initializeDatabase classTeacherAssignments seed error] Failed for assignment ID "${ct?.id}":`, {
              errorMessage: ctErr?.message,
              errorCode: ctErr?.code,
              errorDetail: ctErr?.detail,
              failedRecordId: ct?.id,
              tableName: 'class_teacher_assignments',
              parameters: {
                id: ct?.id,
                semester: ct?.semester,
                classTeacherId: ct?.classTeacherId,
              },
              rawRecord: ct,
            });
          }
        }
      }
    } catch (ctErr) {
      console.error('[initializeDatabase classTeacherAssignments seed top-level]:', ctErr);
    }

    // 20. Notices
    try {
      const existingNotices = await db.select().from(schema.notices);
      if (existingNotices.length === 0) {
        const noticesToInsert = (Array.isArray(seedData?.notices) && seedData.notices.length > 0) ? seedData.notices : INITIAL_NOTICES;
        for (const n of noticesToInsert) {
          try {
            const validated = validateNoticeRecord(n);
            await db.insert(schema.notices).values(validated).onConflictDoNothing();
          } catch (nErr: any) {
            console.error(`[initializeDatabase notices seed error] Failed for notice ID "${n?.id}":`, {
              errorMessage: nErr?.message,
              errorCode: nErr?.code,
              errorDetail: nErr?.detail,
              failedRecordId: n?.id,
              tableName: 'notices',
              parameters: {
                id: n?.id,
                targetSemester: n?.targetSemester,
                isPinned: n?.isPinned,
                isArchived: n?.isArchived,
              },
              rawRecord: n,
            });
          }
        }
      }
    } catch (nErr) {
      console.error('[initializeDatabase notices seed top-level]:', nErr);
    }

    // 21. Department Activities
    try {
      const existingActs = await db.select().from(schema.departmentActivities);
      if (existingActs.length === 0) {
        const actsToInsert = (Array.isArray(seedData?.departmentActivities) && seedData.departmentActivities.length > 0) ? seedData.departmentActivities : INITIAL_DEPARTMENT_ACTIVITIES;
        for (const da of actsToInsert) {
          try {
            const validated = validateDepartmentActivityRecord(da);
            await db.insert(schema.departmentActivities).values(validated).onConflictDoNothing();
          } catch (daErr: any) {
            console.error(`[initializeDatabase departmentActivities seed error] Failed for activity ID "${da?.id}":`, {
              errorMessage: daErr?.message,
              errorCode: daErr?.code,
              errorDetail: daErr?.detail,
              failedRecordId: da?.id,
              tableName: 'department_activities',
              parameters: {
                id: da?.id,
                participantsCount: da?.participantsCount,
              },
              rawRecord: da,
            });
          }
        }
      }
    } catch (daErr) {
      console.error('[initializeDatabase departmentActivities seed top-level]:', daErr);
    }

    console.log('[Cloud SQL] SQL Database tables initialized and ready.');
  } catch (err: any) {
    console.error('[Cloud SQL] Database initialization error details:', {
      errorMessage: err?.message,
      errorCode: err?.code,
      errorDetail: err?.detail,
      errorHint: err?.hint,
      errorPosition: err?.position,
      fullError: err,
    });
  }
}

// -------------------------------------------------------------
// USER OPERATIONS
// -------------------------------------------------------------
export async function getAllUsers(): Promise<User[]> {
  try {
    const rows = await db.select().from(schema.users);
    const existingEmails = new Set(rows.map((r) => r.email?.toLowerCase()));
    
    // Auto-sync students missing user credentials
    try {
      const studentRows = await db.select().from(schema.students);
      for (const st of studentRows) {
        const studentEmail = (st.email || `${st.rollNumber?.toLowerCase() || st.id}@cktcollege.edu.in`).toLowerCase();
        if (!existingEmails.has(studentEmail)) {
          const newUserVal = {
            id: `usr-${st.id}`,
            name: st.fullName || 'Student',
            email: studentEmail,
            role: 'Student',
            departmentId: st.departmentId || null,
            departmentName: st.departmentName || null,
            phone: st.personalMobile || st.whatsappNumber || null,
            avatar: st.passportPhoto || null,
            password: 'StudentPassword@123',
            isActive: true,
            createdAt: st.admissionDate || new Date().toISOString().substring(0, 10),
          };
          await db.insert(schema.users).values(newUserVal).onConflictDoNothing();
          existingEmails.add(studentEmail);
        }
      }
    } catch (sErr) {
      console.error('Error auto-syncing students to users:', sErr);
    }

    // Auto-sync faculty missing user credentials
    try {
      const facultyRows = await db.select().from(schema.facultyList);
      for (const fc of facultyRows) {
        const facultyEmail = (fc.email || `faculty.${fc.id}@cktcollege.edu.in`).toLowerCase();
        if (!existingEmails.has(facultyEmail)) {
          const newUserVal = {
            id: `usr-${fc.id}`,
            name: fc.fullName || 'Faculty Member',
            email: facultyEmail,
            role: 'Faculty',
            departmentId: fc.departmentId || null,
            departmentName: fc.departmentName || null,
            phone: fc.mobile || null,
            avatar: fc.photo || null,
            password: 'FacultyPassword@123',
            isActive: true,
            createdAt: new Date().toISOString().substring(0, 10),
          };
          await db.insert(schema.users).values(newUserVal).onConflictDoNothing();
          existingEmails.add(facultyEmail);
        }
      }
    } catch (fErr) {
      console.error('Error auto-syncing faculty to users:', fErr);
    }

    const updatedRows = await db.select().from(schema.users);
    return updatedRows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role as any,
      departmentId: r.departmentId || undefined,
      departmentName: r.departmentName || undefined,
      phone: r.phone || undefined,
      avatar: r.avatar || undefined,
      password: r.password || undefined,
      isActive: r.isActive,
      lastLogin: r.lastLogin || undefined,
      createdAt: r.createdAt || '',
    }));
  } catch (err) {
    console.error('SQL getAllUsers error:', err);
    return [];
  }
}

export async function insertUser(user: User): Promise<User> {
  let deptId = user.departmentId || null;
  if (deptId) {
    try {
      const deptExists = await db.select().from(schema.departments).where(eq(schema.departments.id, deptId));
      if (deptExists.length === 0) {
        deptId = null;
      }
    } catch {
      deptId = null;
    }
  }

  const payload = {
    id: user.id,
    name: user.name || 'User',
    email: user.email,
    role: user.role,
    departmentId: deptId,
    departmentName: user.departmentName || null,
    phone: user.phone || null,
    avatar: user.avatar || null,
    password: user.password || null,
    isActive: user.isActive !== undefined ? user.isActive : true,
    lastLogin: user.lastLogin || null,
    createdAt: user.createdAt || new Date().toISOString().substring(0, 10),
  };

  try {
    await db.insert(schema.users).values(payload).onConflictDoNothing();
  } catch (err: any) {
    try {
      await db.insert(schema.users).values({ ...payload, departmentId: null }).onConflictDoNothing();
    } catch (err2) {
      console.error(`[insertUser error for ${user.email}]:`, err2);
    }
  }
  return user;
}

export async function upsertUser(user: User): Promise<User> {
  try {
    const existing = await db.select().from(schema.users).where(
      or(
        eq(schema.users.id, user.id),
        eq(schema.users.email, user.email)
      )
    );
    if (existing.length > 0) {
      await updateUser(existing[0].id, user);
      return { ...existing[0], ...user } as User;
    } else {
      return await insertUser(user);
    }
  } catch (err: any) {
    console.error(`[upsertUser error for ${user.email}]:`, err);
    return await insertUser(user);
  }
}

export async function batchInsertUsers(usersList: User[]): Promise<User[]> {
  for (const u of usersList) {
    try {
      await upsertUser(u);
    } catch (err) {
      console.error('Error in batchInsertUsers:', err);
    }
  }
  return usersList;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.role !== undefined) updateData.role = updates.role;
  if (updates.departmentId !== undefined) {
    let deptId = updates.departmentId || null;
    if (deptId) {
      try {
        const deptExists = await db.select().from(schema.departments).where(eq(schema.departments.id, deptId));
        if (deptExists.length === 0) {
          deptId = null;
        }
      } catch {
        deptId = null;
      }
    }
    updateData.departmentId = deptId;
  }
  if (updates.departmentName !== undefined) updateData.departmentName = updates.departmentName;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
  if (updates.password !== undefined) updateData.password = updates.password;
  if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
  if (updates.lastLogin !== undefined) updateData.lastLogin = updates.lastLogin;

  try {
    await db.update(schema.users).set(updateData).where(eq(schema.users.id, id));
  } catch (err) {
    try {
      if (updateData.departmentId) updateData.departmentId = null;
      await db.update(schema.users).set(updateData).where(eq(schema.users.id, id));
    } catch (err2) {
      console.error('[updateUser error]:', err2);
    }
  }

  const rows = await db.select().from(schema.users).where(eq(schema.users.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role as any,
    departmentId: r.departmentId || undefined,
    departmentName: r.departmentName || undefined,
    phone: r.phone || undefined,
    avatar: r.avatar || undefined,
    password: r.password || undefined,
    isActive: r.isActive,
    lastLogin: r.lastLogin || undefined,
    createdAt: r.createdAt || '',
  };
}

export async function deleteUser(id: string): Promise<boolean> {
  await db.delete(schema.users).where(eq(schema.users.id, id));
  return true;
}

// -------------------------------------------------------------
// STUDENT OPERATIONS
// -------------------------------------------------------------
export async function getAllStudents(): Promise<Student360Profile[]> {
  try {
    const rows = await db.select().from(schema.students);
    if (!rows || rows.length === 0) {
      return [];
    }
    const mapped = rows
      .map((row) => {
        try {
          return mapSqlToStudent(row);
        } catch (mErr) {
          console.error('[getAllStudents map error]:', mErr);
          return null;
        }
      })
      .filter(Boolean) as Student360Profile[];
    return mapped;
  } catch (err) {
    console.error('SQL getAllStudents error:', err);
    return [];
  }
}

export async function getStudentById(id: string): Promise<Student360Profile | null> {
  if (!id) return null;
  const trimmedId = id.trim();
  try {
    // 1. Direct indexed match
    const rows = await db.select().from(schema.students).where(
      or(
        eq(schema.students.id, trimmedId),
        eq(schema.students.studentId, trimmedId),
        eq(schema.students.rollNumber, trimmedId),
        eq(schema.students.prnNumber, trimmedId),
        eq(schema.students.email, trimmedId)
      )
    );
    if (rows && rows.length > 0) {
      return mapSqlToStudent(rows[0]);
    }

    // 2. Case-insensitive query fallback
    const allRows = await db.select().from(schema.students);
    const normalized = trimmedId.toLowerCase();
    const foundRow = allRows.find(
      (r) =>
        (r.id && r.id.toLowerCase() === normalized) ||
        (r.studentId && r.studentId.toLowerCase() === normalized) ||
        (r.rollNumber && r.rollNumber.toLowerCase() === normalized) ||
        (r.prnNumber && r.prnNumber.toLowerCase() === normalized) ||
        (r.email && r.email.toLowerCase() === normalized)
    );
    if (foundRow) {
      return mapSqlToStudent(foundRow);
    }
    return null;
  } catch (err) {
    console.error(`getStudentById error for ${id}:`, err);
    return null;
  }
}

export async function insertStudent(st: Student360Profile): Promise<Student360Profile> {
  return await upsertStudent(st);
}

export async function batchInsertStudents(studentsList: Student360Profile[]): Promise<Student360Profile[]> {
  const results: Student360Profile[] = [];
  for (const st of studentsList) {
    try {
      const saved = await upsertStudent(st);
      results.push(saved);
    } catch (err) {
      console.error(`Error in batchInsertStudents for student ${st?.studentId || st?.id}:`, err);
    }
  }
  return results;
}

export async function upsertStudent(st: Student360Profile): Promise<Student360Profile> {
  try {
    const payload = mapStudentToSql(st);

    // Validate departmentId
    if (payload.departmentId) {
      try {
        const deptExists = await db.select().from(schema.departments).where(eq(schema.departments.id, payload.departmentId));
        if (deptExists.length === 0) {
          payload.departmentId = null;
        }
      } catch {
        payload.departmentId = null;
      }
    }

    // Validate programId
    if (payload.programId) {
      try {
        const progExists = await db.select().from(schema.programs).where(eq(schema.programs.id, payload.programId));
        if (progExists.length === 0) {
          payload.programId = null;
        }
      } catch {
        payload.programId = null;
      }
    }

    // Validate courseId
    if (payload.courseId) {
      try {
        const courseExists = await db.select().from(schema.courses).where(eq(schema.courses.id, payload.courseId));
        if (courseExists.length === 0) {
          payload.courseId = null;
        }
      } catch {
        payload.courseId = null;
      }
    }

    const existing = await db.select().from(schema.students).where(
      or(
        eq(schema.students.id, st.id),
        eq(schema.students.studentId, st.studentId)
      )
    );

    if (existing.length > 0) {
      await db.update(schema.students).set(payload).where(eq(schema.students.id, existing[0].id));
    } else {
      await db.insert(schema.students).values(payload);
    }
  } catch (err: any) {
    console.error(`[upsertStudent Error] Primary insert failed for student ${st.studentId} (${st.fullName}):`, err?.message || err);
    try {
      const safePayload = {
        ...mapStudentToSql(st),
        departmentId: null,
        courseId: null,
        programId: null,
      };
      const existing = await db.select().from(schema.students).where(
        or(
          eq(schema.students.id, st.id),
          eq(schema.students.studentId, st.studentId)
        )
      );
      if (existing.length > 0) {
        await db.update(schema.students).set(safePayload).where(eq(schema.students.id, existing[0].id));
      } else {
        await db.insert(schema.students).values(safePayload);
      }
      console.log(`[upsertStudent Retry Success] Saved student ${st.studentId} cleanly without FK constraints.`);
    } catch (retryErr: any) {
      console.error(`[upsertStudent Retry Failed] Could not save student ${st.studentId}:`, retryErr?.message || retryErr);
    }
  }
  return st;
}

export async function updateStudent(id: string, updates: Partial<Student360Profile>): Promise<Student360Profile | null> {
  const existing = await db.select().from(schema.students).where(or(eq(schema.students.id, id), eq(schema.students.studentId, id)));
  if (existing.length === 0) return null;
  const current = mapSqlToStudent(existing[0]);
  const merged: Student360Profile = { ...current, ...updates };
  await upsertStudent(merged);
  return merged;
}

export async function deleteStudent(id: string): Promise<boolean> {
  await db.delete(schema.students).where(or(eq(schema.students.id, id), eq(schema.students.studentId, id)));
  return true;
}

// -------------------------------------------------------------
// FACULTY OPERATIONS
// -------------------------------------------------------------
export function parseAllocationItem(item: any): { subjectId: string; division: string; divisions: string[] } {
  if (!item) return { subjectId: '', division: 'All Divisions', divisions: ['ALL'] };
  if (typeof item === 'object') {
    const subId = item.subjectId || item.id || '';
    const division = item.division || (item.divisions && item.divisions.length > 0 ? item.divisions.join(', ') : 'All Divisions');
    const divisions = item.divisions && item.divisions.length > 0 ? item.divisions : (item.division ? [item.division] : ['ALL']);
    return { subjectId: subId, division, divisions };
  }
  if (typeof item === 'string') {
    if (item.includes('::')) {
      const [subId, div] = item.split('::');
      return { subjectId: subId.trim(), division: div.trim(), divisions: [div.trim()] };
    }
    if (item.includes('#')) {
      const [subId, div] = item.split('#');
      return { subjectId: subId.trim(), division: div.trim(), divisions: [div.trim()] };
    }
    return { subjectId: item.trim(), division: 'All Divisions', divisions: ['ALL'] };
  }
  return { subjectId: String(item), division: 'All Divisions', divisions: ['ALL'] };
}

export async function getAllFaculty(): Promise<Faculty[]> {
  try {
    const rows = await db.select().from(schema.facultyList);
    const facultyList = rows.map(mapSqlToFaculty);

    // Fetch all subjects to join linked allocations
    const subjectRows = await db.select().from(schema.subjects);

    // Join subject details for each faculty member with division-specific mapping
    return facultyList.map((fac) => {
      const rawAllocations = fac.allocatedSubjects || [];
      const parsedAllocations = rawAllocations.map(parseAllocationItem);

      const currentAllocations: FacultySubjectAllocation[] = [];
      const processedSubIds = new Set<string>();

      for (const alloc of parsedAllocations) {
        if (!alloc.subjectId) continue;
        const matchedSub = subjectRows.find((s) => s.id === alloc.subjectId || s.code === alloc.subjectId);
        if (matchedSub) {
          processedSubIds.add(matchedSub.id);
          processedSubIds.add(matchedSub.code);
          currentAllocations.push({
            id: matchedSub.id,
            code: matchedSub.code,
            name: matchedSub.name,
            semester: Number(matchedSub.semester),
            credits: Number(matchedSub.credits),
            type: matchedSub.type,
            division: alloc.division || 'All Divisions',
            divisions: alloc.divisions || ['ALL'],
            courseCode: matchedSub.courseCode || undefined,
            departmentId: matchedSub.departmentId || undefined,
          });
        }
      }

      // Also include any subjects where assignedFacultyId matches this faculty
      for (const s of subjectRows) {
        if ((s.assignedFacultyId === fac.id || s.assignedFacultyId === fac.facultyId) && !processedSubIds.has(s.id)) {
          currentAllocations.push({
            id: s.id,
            code: s.code,
            name: s.name,
            semester: Number(s.semester),
            credits: Number(s.credits),
            type: s.type,
            division: 'All Divisions',
            divisions: ['ALL'],
            courseCode: s.courseCode || undefined,
            departmentId: s.departmentId || undefined,
          });
        }
      }

      return {
        ...fac,
        currentAllocations,
      };
    });
  } catch (err) {
    console.error('SQL getAllFaculty error:', err);
    return [];
  }
}

export async function insertFaculty(fac: Faculty): Promise<Faculty> {
  await db.insert(schema.facultyList).values(mapFacultyToSql(fac));
  return fac;
}

export async function updateFaculty(
  id: string,
  updates: Partial<Faculty> & { subjectIds?: string[] }
): Promise<Faculty | null> {
  try {
    const updatedRecord = await db.transaction(async (tx) => {
      const existing = await tx.select().from(schema.facultyList).where(eq(schema.facultyList.id, id));
      if (existing.length === 0) return null;
      const current = mapSqlToFaculty(existing[0]);

      // Normalize allocated subjects or subjectIds
      let allocatedList = updates.allocatedSubjects;
      if (updates.subjectIds !== undefined && allocatedList === undefined) {
        allocatedList = updates.subjectIds;
      }

      const merged: Faculty = {
        ...current,
        ...updates,
        allocatedSubjects: allocatedList !== undefined ? allocatedList : current.allocatedSubjects,
      };

      // 1. Transaction Step A: Clear existing subject associations for this specified faculty
      await tx
        .update(schema.subjects)
        .set({
          assignedFacultyId: null,
          assignedFacultyName: null,
        })
        .where(
          or(
            eq(schema.subjects.assignedFacultyId, id),
            eq(schema.subjects.assignedFacultyId, current.facultyId)
          )
        );

      // 2. Transaction Step B: Associate new subject records based on the array of subject IDs
      if (allocatedList !== undefined) {
        const rawAllocated = allocatedList || [];
        const newAllocatedIds = rawAllocated.map((item) => parseAllocationItem(item).subjectId);

        for (const subIdentifier of newAllocatedIds) {
          await tx
            .update(schema.subjects)
            .set({
              assignedFacultyId: id,
              assignedFacultyName: merged.fullName,
            })
            .where(
              or(
                eq(schema.subjects.id, subIdentifier),
                eq(schema.subjects.code, subIdentifier)
              )
            );
        }
      }

      // 3. Transaction Step C: Atomically update the faculty_list record with the latest profile & allocations
      await tx.update(schema.facultyList).set(mapFacultyToSql(merged)).where(eq(schema.facultyList.id, id));

      return merged;
    });

    if (!updatedRecord) return null;

    // Fetch and return the joined updated record with allocations
    const allUpdated = await getAllFaculty();
    return allUpdated.find((f) => f.id === id) || updatedRecord;
  } catch (err) {
    console.error(`Error in updateFaculty transaction for ${id}:`, err);
    throw err;
  }
}

export async function deleteFaculty(id: string): Promise<boolean> {
  await db.delete(schema.facultyList).where(eq(schema.facultyList.id, id));
  return true;
}

// -------------------------------------------------------------
// PROGRAMS, DEPARTMENTS, COURSES, SUBJECTS
// -------------------------------------------------------------
export async function getAllPrograms(): Promise<Program[]> {
  try {
    const rows = await db.select().from(schema.programs);
    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      status: r.status as any,
      createdAt: r.createdAt || undefined,
      updatedAt: r.updatedAt || undefined,
    }));
  } catch (err) {
    console.error('SQL getAllPrograms error:', err);
    return [];
  }
}

export async function insertProgram(p: Program): Promise<Program> {
  await db.insert(schema.programs).values({
    id: p.id,
    code: p.code,
    name: p.name,
    status: p.status || 'Active',
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
  });
  return p;
}

export async function updateProgram(id: string, updates: Partial<Program>): Promise<Program | null> {
  await db.update(schema.programs).set({
    ...updates,
    updatedAt: new Date().toISOString(),
  }).where(eq(schema.programs.id, id));
  const rows = await db.select().from(schema.programs).where(eq(schema.programs.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return { id: r.id, code: r.code, name: r.name, status: r.status as any, createdAt: r.createdAt || undefined, updatedAt: r.updatedAt || undefined };
}

export async function deleteProgram(id: string): Promise<boolean> {
  await db.delete(schema.programs).where(eq(schema.programs.id, id));
  return true;
}

export async function getAllDepartments(): Promise<Department[]> {
  try {
    const rows = await db.select().from(schema.departments);
    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      hodId: r.hodId || '',
      hodName: r.hodName || '',
      establishedYear: Number(r.establishedYear) || 2010,
      totalStudents: Number(r.totalStudents) || 0,
      totalFaculty: Number(r.totalFaculty) || 0,
      avgAttendancePct: Number(r.avgAttendancePct) || 0,
    }));
  } catch (err) {
    console.error('SQL getAllDepartments error:', err);
    return [];
  }
}

export async function insertDepartment(d: Department): Promise<Department> {
  const validated = validateDepartmentRecord(d);
  await db.insert(schema.departments).values(validated);
  return d;
}

export async function updateDepartment(id: string, updates: Partial<Department>): Promise<Department | null> {
  const payload: any = {};
  if (updates.code !== undefined) payload.code = updates.code;
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.hodId !== undefined) payload.hodId = updates.hodId || null;
  if (updates.hodName !== undefined) payload.hodName = updates.hodName || null;
  if (updates.establishedYear !== undefined) payload.establishedYear = parseInteger(updates.establishedYear, 2010, 'established_year');
  if (updates.totalStudents !== undefined) payload.totalStudents = parseInteger(updates.totalStudents, 0, 'total_students');
  if (updates.totalFaculty !== undefined) payload.totalFaculty = parseInteger(updates.totalFaculty, 0, 'total_faculty');
  if (updates.avgAttendancePct !== undefined) payload.avgAttendancePct = parseFloatNum(updates.avgAttendancePct, 0, 'avg_attendance_pct');

  await db.update(schema.departments).set(payload).where(eq(schema.departments.id, id));
  const rows = await db.select().from(schema.departments).where(eq(schema.departments.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    hodId: r.hodId || '',
    hodName: r.hodName || '',
    establishedYear: parseInteger(r.establishedYear, 2010, 'established_year'),
    totalStudents: parseInteger(r.totalStudents, 0, 'total_students'),
    totalFaculty: parseInteger(r.totalFaculty, 0, 'total_faculty'),
    avgAttendancePct: parseFloatNum(r.avgAttendancePct, 0, 'avg_attendance_pct'),
  };
}

export async function deleteDepartment(id: string): Promise<boolean> {
  await db.delete(schema.departments).where(eq(schema.departments.id, id));
  return true;
}

export async function getAllCourses(): Promise<Course[]> {
  try {
    const rows = await db.select().from(schema.courses);
    return rows.map((r) => ({
      id: r.id,
      programId: r.programId,
      programName: r.programName || undefined,
      courseName: r.courseName,
      courseCode: r.courseCode,
      durationYears: Number(r.durationYears) || 3,
      totalSemesters: Number(r.totalSemesters) || 6,
      status: r.status as any,
      departmentId: r.departmentId || undefined,
      code: r.code || r.courseCode,
      name: r.name || r.courseName,
      createdAt: r.createdAt || undefined,
      updatedAt: r.updatedAt || undefined,
    }));
  } catch (err) {
    console.error('SQL getAllCourses error:', err);
    return [];
  }
}

export async function insertCourse(c: Course): Promise<Course> {
  const validated = validateCourseRecord(c);
  await db.insert(schema.courses).values(validated);
  return c;
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
  const payload: any = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  if (updates.durationYears !== undefined) payload.durationYears = parseInteger(updates.durationYears, 3, 'duration_years');
  if (updates.totalSemesters !== undefined) payload.totalSemesters = parseInteger(updates.totalSemesters, 6, 'total_semesters');

  await db.update(schema.courses).set(payload).where(eq(schema.courses.id, id));
  const rows = await db.select().from(schema.courses).where(eq(schema.courses.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    programId: r.programId,
    programName: r.programName || undefined,
    courseName: r.courseName,
    courseCode: r.courseCode,
    durationYears: parseInteger(r.durationYears, 3, 'duration_years'),
    totalSemesters: parseInteger(r.totalSemesters, 6, 'total_semesters'),
    status: r.status as any,
    departmentId: r.departmentId || undefined,
    code: r.code || r.courseCode,
    name: r.name || r.courseName,
    createdAt: r.createdAt || undefined,
    updatedAt: r.updatedAt || undefined,
  };
}

export async function deleteCourse(id: string): Promise<boolean> {
  await db.delete(schema.courses).where(eq(schema.courses.id, id));
  return true;
}

export async function getAllSubjects(): Promise<Subject[]> {
  try {
    const rows = await db.select().from(schema.subjects);
    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      departmentId: r.departmentId,
      programId: r.programId || undefined,
      programName: r.programName || undefined,
      courseId: r.courseId || undefined,
      courseCode: r.courseCode || undefined,
      semester: parseInteger(r.semester, 1, 'semester'),
      type: r.type as any,
      credits: parseInteger(r.credits, 0, 'credits'),
      assignedFacultyId: r.assignedFacultyId || '',
      assignedFacultyName: r.assignedFacultyName || '',
      status: (r.status as any) || 'Active',
    }));
  } catch (err) {
    console.error('SQL getAllSubjects error:', err);
    return [];
  }
}

export async function insertSubject(s: Subject): Promise<Subject> {
  const validated = validateSubjectRecord(s);
  await db.insert(schema.subjects).values(validated);
  return s;
}

export async function updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | null> {
  const payload: any = { ...updates };
  if (updates.semester !== undefined) payload.semester = parseInteger(updates.semester, 1, 'semester');
  if (updates.credits !== undefined) payload.credits = parseInteger(updates.credits, 0, 'credits');

  await db.update(schema.subjects).set(payload).where(eq(schema.subjects.id, id));
  const rows = await db.select().from(schema.subjects).where(eq(schema.subjects.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    departmentId: r.departmentId,
    programId: r.programId || undefined,
    programName: r.programName || undefined,
    courseId: r.courseId || undefined,
    courseCode: r.courseCode || undefined,
    semester: parseInteger(r.semester, 1, 'semester'),
    type: r.type as any,
    credits: parseInteger(r.credits, 0, 'credits'),
    assignedFacultyId: r.assignedFacultyId || '',
    assignedFacultyName: r.assignedFacultyName || '',
    status: (r.status as any) || 'Active',
  };
}

export async function deleteSubject(id: string): Promise<boolean> {
  await db.delete(schema.subjects).where(eq(schema.subjects.id, id));
  return true;
}

// -------------------------------------------------------------
// TIMETABLE OPERATIONS
// -------------------------------------------------------------
export async function getAllTimetable(): Promise<TimetableSlot[]> {
  try {
    const rows = await db.select().from(schema.timetable);
    return rows.map((r) => ({
      id: r.id,
      departmentId: r.departmentId,
      programId: r.programId || undefined,
      programName: r.programName || undefined,
      courseId: r.courseId || undefined,
      courseName: r.courseName || undefined,
      semester: Number(r.semester),
      division: r.division,
      day: r.day as any,
      timeSlot: r.timeSlot,
      subjectId: r.subjectId,
      subjectName: r.subjectName,
      facultyId: r.facultyId,
      facultyName: r.facultyName,
      classroom: r.classroom,
      type: r.type as any,
    }));
  } catch (err) {
    console.error('SQL getAllTimetable error:', err);
    return [];
  }
}

export async function insertTimetable(t: TimetableSlot): Promise<TimetableSlot> {
  await db.insert(schema.timetable).values({
    id: t.id,
    departmentId: t.departmentId,
    programId: t.programId || null,
    programName: t.programName || null,
    courseId: t.courseId || null,
    courseName: t.courseName || null,
    semester: t.semester,
    division: t.division,
    day: t.day,
    timeSlot: t.timeSlot,
    subjectId: t.subjectId,
    subjectName: t.subjectName,
    facultyId: t.facultyId,
    facultyName: t.facultyName,
    classroom: t.classroom,
    type: t.type,
  });
  return t;
}

export async function deleteTimetable(id: string): Promise<boolean> {
  await db.delete(schema.timetable).where(eq(schema.timetable.id, id));
  return true;
}

export async function updateTimetable(id: string, updates: Partial<TimetableSlot>): Promise<TimetableSlot | null> {
  await db.update(schema.timetable).set(updates as any).where(eq(schema.timetable.id, id));
  const rows = await db.select().from(schema.timetable).where(eq(schema.timetable.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    departmentId: r.departmentId,
    programId: r.programId || undefined,
    programName: r.programName || undefined,
    courseId: r.courseId || undefined,
    courseName: r.courseName || undefined,
    semester: Number(r.semester),
    division: r.division,
    day: r.day as any,
    timeSlot: r.timeSlot,
    subjectId: r.subjectId,
    subjectName: r.subjectName,
    facultyId: r.facultyId,
    facultyName: r.facultyName,
    classroom: r.classroom,
    type: r.type as any,
  };
}

// -------------------------------------------------------------
// ATTENDANCE SESSIONS & RECORDS
// -------------------------------------------------------------
export async function getAllSessions(): Promise<AttendanceSession[]> {
  try {
    const rows = await db.select().from(schema.sessions);
    return rows.map((r) => ({
      id: r.id,
      date: r.date,
      departmentId: r.departmentId,
      programId: r.programId || undefined,
      programName: r.programName || undefined,
      courseId: r.courseId || undefined,
      courseName: r.courseName || undefined,
      semester: Number(r.semester),
      division: r.division,
      subjectId: r.subjectId,
      subjectName: r.subjectName,
      facultyId: r.facultyId,
      facultyName: r.facultyName,
      sessionType: r.sessionType as any,
      timeSlot: r.timeSlot,
      classroom: r.classroom,
      isLocked: Boolean(r.isLocked),
      totalStudents: Number(r.totalStudents) || 0,
      presentCount: Number(r.presentCount) || 0,
      absentCount: Number(r.absentCount) || 0,
      lateCount: Number(r.lateCount) || 0,
      onLeaveCount: Number(r.onLeaveCount) || 0,
    }));
  } catch (err) {
    console.error('SQL getAllSessions error:', err);
    return [];
  }
}

export async function getAllAttendanceRecords(sessionId?: string): Promise<AttendanceRecord[]> {
  try {
    const rows = sessionId
      ? await db.select().from(schema.attendanceRecords).where(eq(schema.attendanceRecords.sessionId, sessionId))
      : await db.select().from(schema.attendanceRecords);
    return rows.map((r) => ({
      id: r.id,
      sessionId: r.sessionId,
      studentId: r.studentId,
      studentRoll: r.studentRoll || '',
      studentName: r.studentName || '',
      status: r.status as any,
      remarks: r.remarks || undefined,
      markedAt: r.markedAt || '',
      markedBy: r.markedBy || '',
    }));
  } catch (err) {
    console.error('SQL getAllAttendanceRecords error:', err);
    return [];
  }
}

export async function upsertAttendanceSession(session: AttendanceSession, records: AttendanceRecord[]): Promise<void> {
  const existing = await db.select().from(schema.sessions).where(eq(schema.sessions.id, session.id));
  if (existing.length > 0) {
    await db.update(schema.sessions).set({
      date: session.date,
      departmentId: session.departmentId,
      programId: session.programId || null,
      programName: session.programName || null,
      courseId: session.courseId || null,
      courseName: session.courseName || null,
      semester: session.semester,
      division: session.division,
      subjectId: session.subjectId,
      subjectName: session.subjectName,
      facultyId: session.facultyId,
      facultyName: session.facultyName,
      sessionType: session.sessionType,
      timeSlot: session.timeSlot,
      classroom: session.classroom,
      isLocked: session.isLocked,
      totalStudents: session.totalStudents,
      presentCount: session.presentCount,
      absentCount: session.absentCount,
      lateCount: session.lateCount,
      onLeaveCount: session.onLeaveCount,
    }).where(eq(schema.sessions.id, session.id));
  } else {
    await db.insert(schema.sessions).values({
      id: session.id,
      date: session.date,
      departmentId: session.departmentId,
      programId: session.programId || null,
      programName: session.programName || null,
      courseId: session.courseId || null,
      courseName: session.courseName || null,
      semester: session.semester,
      division: session.division,
      subjectId: session.subjectId,
      subjectName: session.subjectName,
      facultyId: session.facultyId,
      facultyName: session.facultyName,
      sessionType: session.sessionType,
      timeSlot: session.timeSlot,
      classroom: session.classroom,
      isLocked: session.isLocked,
      totalStudents: session.totalStudents,
      presentCount: session.presentCount,
      absentCount: session.absentCount,
      lateCount: session.lateCount,
      onLeaveCount: session.onLeaveCount,
    });
  }

  // Clear existing attendance records for this session
  await db.delete(schema.attendanceRecords).where(eq(schema.attendanceRecords.sessionId, session.id));

  // Batch insert new attendance records
  for (const r of records) {
    await db.insert(schema.attendanceRecords).values({
      id: r.id,
      sessionId: r.sessionId,
      studentId: r.studentId,
      studentRoll: r.studentRoll || null,
      studentName: r.studentName || null,
      status: r.status,
      remarks: r.remarks || null,
      markedAt: r.markedAt || null,
      markedBy: r.markedBy || null,
    });
  }
}

// -------------------------------------------------------------
// LEAVES & CORRECTIONS
// -------------------------------------------------------------
export async function getAllLeaves(): Promise<LeaveRequest[]> {
  try {
    const rows = await db.select().from(schema.leaves).orderBy(desc(schema.leaves.createdAt));
    return rows.map((r) => ({
      id: r.id,
      applicantId: r.applicantId,
      applicantName: r.applicantName,
      applicantRole: r.applicantRole as any,
      applicantRollOrId: r.applicantRollOrId || '',
      departmentId: r.departmentId || '',
      leaveType: r.leaveType as any,
      startDate: r.startDate,
      endDate: r.endDate,
      totalDays: Number(r.totalDays) || 1,
      reason: r.reason || '',
      medicalDocUrl: r.medicalDocUrl || undefined,
      status: r.status as any,
      facultyRemarks: r.facultyRemarks || undefined,
      hodRemarks: r.hodRemarks || undefined,
      createdAt: r.createdAt || '',
    }));
  } catch (err) {
    console.error('SQL getAllLeaves error:', err);
    return [];
  }
}

export async function insertLeave(l: LeaveRequest): Promise<LeaveRequest> {
  await db.insert(schema.leaves).values({
    id: l.id,
    applicantId: l.applicantId,
    applicantName: l.applicantName,
    applicantRole: l.applicantRole,
    applicantRollOrId: l.applicantRollOrId || null,
    departmentId: l.departmentId || null,
    leaveType: l.leaveType,
    startDate: l.startDate,
    endDate: l.endDate,
    totalDays: l.totalDays || 1,
    reason: l.reason || null,
    medicalDocUrl: l.medicalDocUrl || null,
    status: l.status,
    facultyRemarks: l.facultyRemarks || null,
    hodRemarks: l.hodRemarks || null,
    createdAt: l.createdAt || new Date().toISOString(),
  });
  return l;
}

export async function updateLeave(id: string, updates: Partial<LeaveRequest>): Promise<LeaveRequest | null> {
  await db.update(schema.leaves).set(updates as any).where(eq(schema.leaves.id, id));
  const rows = await db.select().from(schema.leaves).where(eq(schema.leaves.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    applicantId: r.applicantId,
    applicantName: r.applicantName,
    applicantRole: r.applicantRole as any,
    applicantRollOrId: r.applicantRollOrId || '',
    departmentId: r.departmentId || '',
    leaveType: r.leaveType as any,
    startDate: r.startDate,
    endDate: r.endDate,
    totalDays: Number(r.totalDays) || 1,
    reason: r.reason || '',
    medicalDocUrl: r.medicalDocUrl || undefined,
    status: r.status as any,
    facultyRemarks: r.facultyRemarks || undefined,
    hodRemarks: r.hodRemarks || undefined,
    createdAt: r.createdAt || '',
  };
}

export async function deleteLeave(id: string): Promise<boolean> {
  await db.delete(schema.leaves).where(eq(schema.leaves.id, id));
  return true;
}

// -------------------------------------------------------------
// RESULTS
// -------------------------------------------------------------
export async function getAllResults(studentId?: string): Promise<StudentResult[]> {
  try {
    const rows = studentId
      ? await db.select().from(schema.results).where(eq(schema.results.studentId, studentId))
      : await db.select().from(schema.results);
    return rows.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.studentName,
      rollNumber: r.rollNumber || '',
      semester: Number(r.semester),
      subjectId: r.subjectId || '',
      subjectCode: r.subjectCode || '',
      subjectName: r.subjectName,
      internalMarks: Number(r.internalMarks) || 0,
      externalMarks: Number(r.externalMarks) || 0,
      totalMarks: Number(r.totalMarks) || 0,
      grade: r.grade || '',
      gpa: Number(r.gpa) || 0,
    }));
  } catch (err) {
    console.error('SQL getAllResults error:', err);
    return [];
  }
}

export async function insertResult(res: StudentResult): Promise<StudentResult> {
  await db.insert(schema.results).values({
    id: res.id,
    studentId: res.studentId,
    studentName: res.studentName,
    rollNumber: res.rollNumber || null,
    semester: res.semester,
    subjectId: res.subjectId || null,
    subjectCode: res.subjectCode || null,
    subjectName: res.subjectName,
    internalMarks: res.internalMarks || 0,
    externalMarks: res.externalMarks || 0,
    totalMarks: res.totalMarks || 0,
    grade: res.grade || null,
    gpa: res.gpa || 0,
  });
  return res;
}

export async function updateResult(id: string, updates: Partial<StudentResult>): Promise<StudentResult | null> {
  await db.update(schema.results).set(updates as any).where(eq(schema.results.id, id));
  const rows = await db.select().from(schema.results).where(eq(schema.results.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    studentId: r.studentId,
    studentName: r.studentName,
    rollNumber: r.rollNumber || '',
    semester: Number(r.semester),
    subjectId: r.subjectId || '',
    subjectCode: r.subjectCode || '',
    subjectName: r.subjectName,
    internalMarks: Number(r.internalMarks) || 0,
    externalMarks: Number(r.externalMarks) || 0,
    totalMarks: Number(r.totalMarks) || 0,
    grade: r.grade || '',
    gpa: Number(r.gpa) || 0,
  };
}

export async function deleteResult(id: string): Promise<boolean> {
  await db.delete(schema.results).where(eq(schema.results.id, id));
  return true;
}

// -------------------------------------------------------------
// CORRECTIONS
// -------------------------------------------------------------
export async function getAllCorrections(): Promise<AttendanceCorrectionRequest[]> {
  try {
    const rows = await db.select().from(schema.corrections);
    return rows.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.studentName,
      rollNumber: r.rollNumber || '',
      departmentId: r.departmentId || '',
      date: r.date,
      subjectName: r.subjectName,
      currentStatus: r.currentStatus as any,
      requestedStatus: r.requestedStatus as any,
      reason: r.reason || '',
      status: r.status as any,
      appliedAt: r.appliedAt || '',
      reviewedBy: r.reviewedBy || undefined,
      reviewedAt: r.reviewedAt || undefined,
    }));
  } catch (err) {
    console.error('SQL getAllCorrections error:', err);
    return [];
  }
}

export async function insertCorrection(c: AttendanceCorrectionRequest): Promise<AttendanceCorrectionRequest> {
  await db.insert(schema.corrections).values({
    id: c.id,
    studentId: c.studentId,
    studentName: c.studentName,
    rollNumber: c.rollNumber || null,
    departmentId: c.departmentId || null,
    date: c.date,
    subjectName: c.subjectName,
    currentStatus: c.currentStatus,
    requestedStatus: c.requestedStatus,
    reason: c.reason || null,
    status: c.status,
    appliedAt: c.appliedAt || new Date().toISOString(),
    reviewedBy: c.reviewedBy || null,
    reviewedAt: c.reviewedAt || null,
  });
  return c;
}

export async function updateCorrection(id: string, updates: Partial<AttendanceCorrectionRequest>): Promise<AttendanceCorrectionRequest | null> {
  await db.update(schema.corrections).set(updates as any).where(eq(schema.corrections.id, id));
  const rows = await db.select().from(schema.corrections).where(eq(schema.corrections.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    studentId: r.studentId,
    studentName: r.studentName,
    rollNumber: r.rollNumber || '',
    departmentId: r.departmentId || '',
    date: r.date,
    subjectName: r.subjectName,
    currentStatus: r.currentStatus as any,
    requestedStatus: r.requestedStatus as any,
    reason: r.reason || '',
    status: r.status as any,
    appliedAt: r.appliedAt || '',
    reviewedBy: r.reviewedBy || undefined,
    reviewedAt: r.reviewedAt || undefined,
  };
}

export async function deleteCorrection(id: string): Promise<boolean> {
  await db.delete(schema.corrections).where(eq(schema.corrections.id, id));
  return true;
}

// -------------------------------------------------------------
// NOTICES
// -------------------------------------------------------------
export async function getAllNotices(): Promise<NoticeItem[]> {
  try {
    const rows = await db.select().from(schema.notices).orderBy(desc(schema.notices.createdAt));
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      category: r.category as any,
      publishedBy: r.publishedBy || 'Admin',
      publishedRole: (r.publishedRole as any) || 'Admin',
      createdAt: r.createdAt || '',
      scheduledAt: r.scheduledAt || undefined,
      isPinned: Boolean(r.isPinned),
      isArchived: Boolean(r.isArchived),
      targetProgram: r.targetProgram || undefined,
      targetCourse: r.targetCourse || undefined,
      targetAcademicYear: r.targetAcademicYear || undefined,
      targetSemester: r.targetSemester ? Number(r.targetSemester) : undefined,
      targetDivision: r.targetDivision || undefined,
      attachmentUrl: r.attachmentUrl || undefined,
      attachmentName: r.attachmentName || undefined,
      sentChannels: safeParse<any>(r.sentChannels, ['In-App ERP Notice Board']),
    }));
  } catch (err) {
    console.error('SQL getAllNotices error:', err);
    return [];
  }
}

export async function insertNotice(n: NoticeItem): Promise<NoticeItem> {
  await db.insert(schema.notices).values({
    id: n.id,
    title: n.title,
    content: n.content,
    category: n.category,
    publishedBy: n.publishedBy || null,
    publishedRole: n.publishedRole || null,
    createdAt: n.createdAt || new Date().toISOString(),
    scheduledAt: n.scheduledAt || null,
    isPinned: n.isPinned || false,
    isArchived: n.isArchived || false,
    targetProgram: n.targetProgram || null,
    targetCourse: n.targetCourse || null,
    targetAcademicYear: n.targetAcademicYear || null,
    targetSemester: n.targetSemester || null,
    targetDivision: n.targetDivision || null,
    attachmentUrl: n.attachmentUrl || null,
    attachmentName: n.attachmentName || null,
    sentChannels: n.sentChannels ? JSON.stringify(n.sentChannels) : null,
  });
  return n;
}

export async function deleteNotice(id: string): Promise<boolean> {
  await db.delete(schema.notices).where(eq(schema.notices.id, id));
  return true;
}

export async function updateNotice(id: string, updates: Partial<NoticeItem>): Promise<NoticeItem | null> {
  const payload: any = { ...updates };
  if (updates.sentChannels) {
    payload.sentChannels = JSON.stringify(updates.sentChannels);
  }
  await db.update(schema.notices).set(payload).where(eq(schema.notices.id, id));
  const rows = await db.select().from(schema.notices).where(eq(schema.notices.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    title: r.title,
    content: r.content,
    category: r.category as any,
    publishedBy: r.publishedBy || 'Admin',
    publishedRole: (r.publishedRole as any) || 'Admin',
    createdAt: r.createdAt || '',
    scheduledAt: r.scheduledAt || undefined,
    isPinned: Boolean(r.isPinned),
    isArchived: Boolean(r.isArchived),
    targetProgram: r.targetProgram || undefined,
    targetCourse: r.targetCourse || undefined,
    targetAcademicYear: r.targetAcademicYear || undefined,
    targetSemester: r.targetSemester ? Number(r.targetSemester) : undefined,
    targetDivision: r.targetDivision || undefined,
    attachmentUrl: r.attachmentUrl || undefined,
    attachmentName: r.attachmentName || undefined,
    sentChannels: safeParse<any>(r.sentChannels, ['In-App ERP Notice Board']),
  };
}

// -------------------------------------------------------------
// DEPARTMENT ACTIVITIES
// -------------------------------------------------------------
export async function getAllDepartmentActivities(): Promise<DepartmentActivity[]> {
  try {
    const rows = await db.select().from(schema.departmentActivities);
    return rows.map((r) => ({
      id: r.id,
      type: r.type as any,
      title: r.title,
      date: r.date,
      organizer: r.organizer || '',
      roleOrPosition: r.roleOrPosition || '',
      description: r.description || '',
      photoUrl: r.photoUrl || undefined,
      certificateUrl: r.certificateUrl || undefined,
      departmentId: r.departmentId || '',
      departmentName: r.departmentName || '',
      venue: r.venue || undefined,
      speakerOrGuest: r.speakerOrGuest || undefined,
      targetAudience: r.targetAudience || undefined,
      participantsCount: Number(r.participantsCount) || 0,
      academicYear: r.academicYear || undefined,
      status: (r.status as any) || undefined,
      keyOutcomes: r.keyOutcomes || undefined,
      studentParticipants: safeParse<any>(r.studentParticipants, []),
    }));
  } catch (err) {
    console.error('SQL getAllDepartmentActivities error:', err);
    return [];
  }
}

export async function insertDepartmentActivity(a: DepartmentActivity): Promise<DepartmentActivity> {
  await db.insert(schema.departmentActivities).values({
    id: a.id,
    type: a.type,
    title: a.title,
    date: a.date,
    organizer: a.organizer || null,
    roleOrPosition: a.roleOrPosition || null,
    description: a.description || null,
    photoUrl: a.photoUrl || null,
    certificateUrl: a.certificateUrl || null,
    departmentId: a.departmentId || null,
    departmentName: a.departmentName || null,
    venue: a.venue || null,
    speakerOrGuest: a.speakerOrGuest || null,
    targetAudience: a.targetAudience || null,
    participantsCount: a.participantsCount || 0,
    academicYear: a.academicYear || null,
    status: a.status || null,
    keyOutcomes: a.keyOutcomes || null,
    studentParticipants: a.studentParticipants ? JSON.stringify(a.studentParticipants) : null,
  });
  return a;
}

export async function deleteDepartmentActivity(id: string): Promise<boolean> {
  await db.delete(schema.departmentActivities).where(eq(schema.departmentActivities.id, id));
  return true;
}

export async function updateDepartmentActivity(id: string, updates: Partial<DepartmentActivity>): Promise<DepartmentActivity | null> {
  const payload: any = { ...updates };
  if (updates.studentParticipants) {
    payload.studentParticipants = JSON.stringify(updates.studentParticipants);
  }
  await db.update(schema.departmentActivities).set(payload).where(eq(schema.departmentActivities.id, id));
  const rows = await db.select().from(schema.departmentActivities).where(eq(schema.departmentActivities.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    type: r.type as any,
    title: r.title,
    date: r.date,
    organizer: r.organizer || '',
    roleOrPosition: r.roleOrPosition || '',
    description: r.description || '',
    photoUrl: r.photoUrl || undefined,
    certificateUrl: r.certificateUrl || undefined,
    departmentId: r.departmentId || '',
    departmentName: r.departmentName || '',
    venue: r.venue || undefined,
    speakerOrGuest: r.speakerOrGuest || undefined,
    targetAudience: r.targetAudience || undefined,
    participantsCount: Number(r.participantsCount) || 0,
    academicYear: r.academicYear || undefined,
    status: (r.status as any) || undefined,
    keyOutcomes: r.keyOutcomes || undefined,
    studentParticipants: safeParse<any>(r.studentParticipants, []),
  };
}

// -------------------------------------------------------------
// SETTINGS
// -------------------------------------------------------------
export async function getSettings(): Promise<CollegeSettings> {
  try {
    const rows = await db.select().from(schema.settings).where(eq(schema.settings.id, 'college_settings'));
    if (rows.length > 0 && rows[0].data) {
      return JSON.parse(rows[0].data) as CollegeSettings;
    }
    return INITIAL_SETTINGS;
  } catch (err) {
    console.error('SQL getSettings error:', err);
    return INITIAL_SETTINGS;
  }
}

export async function saveSettings(st: CollegeSettings): Promise<CollegeSettings> {
  try {
    const existing = await db.select().from(schema.settings).where(eq(schema.settings.id, 'college_settings'));
    if (existing.length > 0) {
      await db.update(schema.settings).set({ data: JSON.stringify(st) }).where(eq(schema.settings.id, 'college_settings'));
    } else {
      await db.insert(schema.settings).values({ id: 'college_settings', data: JSON.stringify(st) });
    }
    return st;
  } catch (err) {
    console.error('SQL saveSettings error:', err);
    return st;
  }
}

// -------------------------------------------------------------
// ATKT RECORDS
// -------------------------------------------------------------
export async function getAllATKT(): Promise<ATKTRecord[]> {
  try {
    const rows = await db.select().from(schema.atktRecords);
    return rows.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.studentName,
      rollNumber: r.rollNumber || '',
      prnNumber: r.prnNumber || undefined,
      course: r.course || '',
      departmentId: r.departmentId || '',
      departmentName: r.departmentName || '',
      semester: Number(r.semester),
      subjectCode: r.subjectCode || '',
      subjectName: r.subjectName,
      backlogType: (r.backlogType as any) || 'Both',
      originalInternalMarks: r.originalInternalMarks !== null ? Number(r.originalInternalMarks) : undefined,
      originalExternalMarks: r.originalExternalMarks !== null ? Number(r.originalExternalMarks) : undefined,
      attemptsCount: Number(r.attemptsCount) || 1,
      status: r.status as any,
      examFeePaid: Boolean(r.examFeePaid),
      examFeeAmount: Number(r.examFeeAmount) || 0,
      reExamDate: r.reExamDate || undefined,
      reExamMarksObtained: r.reExamMarksObtained !== null ? Number(r.reExamMarksObtained) : undefined,
      clearedAt: r.clearedAt || undefined,
      remarks: r.remarks || undefined,
    }));
  } catch (err) {
    console.error('SQL getAllATKT error:', err);
    return [];
  }
}

export async function insertATKT(a: ATKTRecord): Promise<ATKTRecord> {
  await db.insert(schema.atktRecords).values({
    id: a.id,
    studentId: a.studentId,
    studentName: a.studentName,
    rollNumber: a.rollNumber || null,
    prnNumber: a.prnNumber || null,
    course: a.course || null,
    departmentId: a.departmentId || null,
    departmentName: a.departmentName || null,
    semester: a.semester,
    subjectCode: a.subjectCode || null,
    subjectName: a.subjectName,
    backlogType: a.backlogType || null,
    originalInternalMarks: a.originalInternalMarks ?? null,
    originalExternalMarks: a.originalExternalMarks ?? null,
    attemptsCount: a.attemptsCount || 1,
    status: a.status,
    examFeePaid: a.examFeePaid || false,
    examFeeAmount: a.examFeeAmount || 0,
    reExamDate: a.reExamDate || null,
    reExamMarksObtained: a.reExamMarksObtained ?? null,
    clearedAt: a.clearedAt || null,
    remarks: a.remarks || null,
  });
  return a;
}

export async function updateATKT(id: string, updates: Partial<ATKTRecord>): Promise<ATKTRecord | null> {
  await db.update(schema.atktRecords).set(updates as any).where(eq(schema.atktRecords.id, id));
  const rows = await db.select().from(schema.atktRecords).where(eq(schema.atktRecords.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    studentId: r.studentId,
    studentName: r.studentName,
    rollNumber: r.rollNumber || '',
    prnNumber: r.prnNumber || undefined,
    course: r.course || '',
    departmentId: r.departmentId || '',
    departmentName: r.departmentName || '',
    semester: Number(r.semester),
    subjectCode: r.subjectCode || '',
    subjectName: r.subjectName,
    backlogType: (r.backlogType as any) || 'Both',
    originalInternalMarks: r.originalInternalMarks !== null ? Number(r.originalInternalMarks) : undefined,
    originalExternalMarks: r.originalExternalMarks !== null ? Number(r.originalExternalMarks) : undefined,
    attemptsCount: Number(r.attemptsCount) || 1,
    status: r.status as any,
    examFeePaid: Boolean(r.examFeePaid),
    examFeeAmount: Number(r.examFeeAmount) || 0,
    reExamDate: r.reExamDate || undefined,
    reExamMarksObtained: r.reExamMarksObtained !== null ? Number(r.reExamMarksObtained) : undefined,
    clearedAt: r.clearedAt || undefined,
    remarks: r.remarks || undefined,
  };
}

export async function deleteATKT(id: string): Promise<boolean> {
  await db.delete(schema.atktRecords).where(eq(schema.atktRecords.id, id));
  return true;
}

// -------------------------------------------------------------
// ACADEMIC CALENDAR EVENTS
// -------------------------------------------------------------
export async function getAllAcademicEvents(): Promise<AcademicCalendarEvent[]> {
  try {
    const rows = await db.select().from(schema.academicEvents);
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      eventType: r.eventType as any,
      category: r.category as any,
      startDate: r.startDate,
      endDate: r.endDate,
      isNonWorkingDay: Boolean(r.isNonWorkingDay),
      description: r.description || undefined,
      departmentId: r.departmentId || undefined,
      departmentName: r.departmentName || undefined,
      createdBy: r.createdBy || undefined,
      createdAt: r.createdAt || undefined,
    }));
  } catch (err) {
    console.error('SQL getAllAcademicEvents error:', err);
    return [];
  }
}

export async function insertAcademicEvent(evt: AcademicCalendarEvent): Promise<AcademicCalendarEvent> {
  await db.insert(schema.academicEvents).values({
    id: evt.id,
    title: evt.title,
    eventType: evt.eventType,
    category: evt.category,
    startDate: evt.startDate,
    endDate: evt.endDate,
    isNonWorkingDay: evt.isNonWorkingDay !== undefined ? evt.isNonWorkingDay : true,
    description: evt.description || null,
    departmentId: evt.departmentId || null,
    departmentName: evt.departmentName || null,
    createdBy: evt.createdBy || null,
    createdAt: evt.createdAt || new Date().toISOString().substring(0, 10),
  });
  return evt;
}

export async function updateAcademicEvent(id: string, updates: Partial<AcademicCalendarEvent>): Promise<AcademicCalendarEvent | null> {
  await db.update(schema.academicEvents).set(updates as any).where(eq(schema.academicEvents.id, id));
  const rows = await db.select().from(schema.academicEvents).where(eq(schema.academicEvents.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    title: r.title,
    eventType: r.eventType as any,
    category: r.category as any,
    startDate: r.startDate,
    endDate: r.endDate,
    isNonWorkingDay: Boolean(r.isNonWorkingDay),
    description: r.description || undefined,
    departmentId: r.departmentId || undefined,
    departmentName: r.departmentName || undefined,
    createdBy: r.createdBy || undefined,
    createdAt: r.createdAt || undefined,
  };
}

export async function deleteAcademicEvent(id: string): Promise<boolean> {
  await db.delete(schema.academicEvents).where(eq(schema.academicEvents.id, id));
  return true;
}

// -------------------------------------------------------------
// NOTIFICATIONS & AUDIT LOGS
// -------------------------------------------------------------
export async function getAllNotifications(): Promise<ERPNotification[]> {
  try {
    const rows = await db.select().from(schema.notifications).orderBy(desc(schema.notifications.createdAt));
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId || undefined,
      role: (r.role as any) || undefined,
      title: r.title,
      message: r.message,
      type: r.type as any,
      isRead: Boolean(r.isRead),
      createdAt: r.createdAt,
      actionUrl: r.actionUrl || undefined,
    }));
  } catch (err) {
    console.error('SQL getAllNotifications error:', err);
    return [];
  }
}

export async function insertNotification(n: ERPNotification): Promise<ERPNotification> {
  await db.insert(schema.notifications).values({
    id: n.id,
    userId: n.userId || null,
    role: n.role || null,
    title: n.title,
    message: n.message,
    type: n.type,
    isRead: n.isRead || false,
    createdAt: n.createdAt,
    actionUrl: n.actionUrl || null,
  });
  return n;
}

export async function markNotificationRead(id: string): Promise<boolean> {
  await db.update(schema.notifications).set({ isRead: true }).where(eq(schema.notifications.id, id));
  return true;
}

export async function deleteNotification(id: string): Promise<boolean> {
  await db.delete(schema.notifications).where(eq(schema.notifications.id, id));
  return true;
}

export async function getAllAuditLogs(): Promise<AuditLog[]> {
  try {
    const rows = await db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.timestamp));
    return rows.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      actorName: r.actorName || '',
      actorRole: r.actorRole || '',
      action: r.action,
      category: r.category as any,
      details: r.details,
      ipAddress: r.ipAddress || '127.0.0.1',
    }));
  } catch (err) {
    console.error('SQL getAllAuditLogs error:', err);
    return [];
  }
}

export async function insertAuditLog(log: AuditLog): Promise<AuditLog> {
  try {
    await db.insert(schema.auditLogs).values({
      id: log.id,
      timestamp: log.timestamp,
      actorName: log.actorName || null,
      actorRole: log.actorRole || null,
      action: log.action,
      category: log.category,
      details: log.details,
      ipAddress: log.ipAddress || null,
    });
  } catch (err) {
    console.error('Failed to insert audit log in SQL:', err);
  }
  return log;
}

// -------------------------------------------------------------
// CHAT CONVERSATIONS & MESSAGES
// -------------------------------------------------------------
export async function getAllChatConversations(): Promise<ChatConversation[]> {
  try {
    const rows = await db.select().from(schema.chatConversations);
    if (rows.length === 0) {
      for (const conv of INITIAL_CHAT_CONVERSATIONS) {
        try {
          const validated = validateChatConversationRecord(conv);
          await db.insert(schema.chatConversations).values(validated).onConflictDoNothing();
        } catch (e) {}
      }
      const recheck = await db.select().from(schema.chatConversations);
      if (recheck.length > 0) {
        return recheck.map((r) => ({
          id: r.id,
          participantId: r.participantId,
          participantName: r.participantName,
          participantRole: r.participantRole as any,
          participantAvatar: r.participantAvatar || undefined,
          participantStatus: (r.participantStatus as any) || 'Offline',
          lastMessage: r.lastMessage || '',
          lastMessageTime: r.lastMessageTime || '',
          unreadCount: Number(r.unreadCount) || 0,
        }));
      }
    }

    return rows.map((r) => ({
      id: r.id,
      participantId: r.participantId,
      participantName: r.participantName,
      participantRole: r.participantRole as any,
      participantAvatar: r.participantAvatar || undefined,
      participantStatus: (r.participantStatus as any) || 'Offline',
      lastMessage: r.lastMessage || '',
      lastMessageTime: r.lastMessageTime || '',
      unreadCount: Number(r.unreadCount) || 0,
    }));
  } catch (err) {
    console.error('SQL getAllChatConversations error:', err);
    return [];
  }
}

export async function insertChatConversation(c: ChatConversation): Promise<ChatConversation> {
  const validated = validateChatConversationRecord(c);
  await db.insert(schema.chatConversations).values(validated).onConflictDoNothing();
  return c;
}

export async function updateChatConversation(id: string, updates: Partial<ChatConversation>): Promise<ChatConversation | null> {
  await db.update(schema.chatConversations).set(updates as any).where(eq(schema.chatConversations.id, id));
  const rows = await db.select().from(schema.chatConversations).where(eq(schema.chatConversations.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    participantId: r.participantId,
    participantName: r.participantName,
    participantRole: r.participantRole as any,
    participantAvatar: r.participantAvatar || undefined,
    participantStatus: (r.participantStatus as any) || 'Offline',
    lastMessage: r.lastMessage || '',
    lastMessageTime: r.lastMessageTime || '',
    unreadCount: Number(r.unreadCount) || 0,
  };
}

export async function deleteChatConversation(id: string): Promise<boolean> {
  await db.delete(schema.chatMessages).where(eq(schema.chatMessages.conversationId, id));
  await db.delete(schema.chatConversations).where(eq(schema.chatConversations.id, id));
  return true;
}

export async function getAllChatMessages(): Promise<Record<string, ChatMessage[]>> {
  try {
    const rows = await db.select().from(schema.chatMessages);
    if (rows.length === 0) {
      const initialFlat = Object.values(INITIAL_CHAT_MESSAGES).flat();
      for (const msg of initialFlat) {
        try {
          const validated = validateChatMessageRecord(msg);
          await db.insert(schema.chatMessages).values(validated).onConflictDoNothing();
        } catch (e) {}
      }
      const recheck = await db.select().from(schema.chatMessages);
      const result: Record<string, ChatMessage[]> = {};
      for (const r of recheck) {
        if (!result[r.conversationId]) {
          result[r.conversationId] = [];
        }
        result[r.conversationId].push({
          id: r.id,
          conversationId: r.conversationId,
          senderId: r.senderId,
          senderName: r.senderName,
          senderRole: r.senderRole as any,
          senderAvatar: r.senderAvatar || undefined,
          text: r.text,
          attachmentUrl: r.attachmentUrl || undefined,
          attachmentType: (r.attachmentType as any) || undefined,
          createdAt: r.createdAt,
          isRead: Boolean(r.isRead),
        });
      }
      return result;
    }

    const result: Record<string, ChatMessage[]> = {};
    for (const r of rows) {
      if (!result[r.conversationId]) {
        result[r.conversationId] = [];
      }
      result[r.conversationId].push({
        id: r.id,
        conversationId: r.conversationId,
        senderId: r.senderId,
        senderName: r.senderName,
        senderRole: r.senderRole as any,
        senderAvatar: r.senderAvatar || undefined,
        text: r.text,
        attachmentUrl: r.attachmentUrl || undefined,
        attachmentType: (r.attachmentType as any) || undefined,
        createdAt: r.createdAt,
        isRead: Boolean(r.isRead),
      });
    }
    return result;
  } catch (err) {
    console.error('SQL getAllChatMessages error:', err);
    return {};
  }
}

export async function insertChatMessage(msg: ChatMessage): Promise<ChatMessage> {
  // Ensure the parent conversation exists before inserting message to prevent foreign key violation
  try {
    const convRows = await db.select().from(schema.chatConversations).where(eq(schema.chatConversations.id, msg.conversationId));
    if (convRows.length === 0) {
      await db.insert(schema.chatConversations).values({
        id: msg.conversationId,
        participantId: msg.senderId,
        participantName: msg.senderName,
        participantRole: msg.senderRole,
        participantAvatar: msg.senderAvatar || null,
        participantStatus: 'Online',
        lastMessage: msg.text,
        lastMessageTime: msg.createdAt,
        unreadCount: 0,
      }).onConflictDoNothing();
    }
  } catch (convCheckErr) {
    console.error('Error ensuring parent conversation exists for chat message:', convCheckErr);
  }

  const validated = validateChatMessageRecord(msg);
  await db.insert(schema.chatMessages).values(validated);

  // Update last message on conversation
  try {
    await db.update(schema.chatConversations).set({
      lastMessage: msg.text,
      lastMessageTime: msg.createdAt,
    }).where(eq(schema.chatConversations.id, msg.conversationId));
  } catch (e) {}

  return msg;
}

export async function markChatConversationRead(conversationId: string): Promise<boolean> {
  await db.update(schema.chatMessages).set({ isRead: true }).where(eq(schema.chatMessages.conversationId, conversationId));
  await db.update(schema.chatConversations).set({ unreadCount: 0 }).where(eq(schema.chatConversations.id, conversationId));
  return true;
}

// -------------------------------------------------------------
// IMPORT HISTORY LOGS
// -------------------------------------------------------------
export async function getAllImportLogs(): Promise<ImportHistoryLog[]> {
  try {
    const rows = await db.select().from(schema.importLogs).orderBy(desc(schema.importLogs.uploadedAt));
    return rows.map((r) => ({
      id: r.id,
      fileName: r.fileName,
      uploadedAt: r.uploadedAt,
      uploadedBy: r.uploadedBy,
      totalRecords: Number(r.totalRecords) || 0,
      importedCount: Number(r.importedCount) || 0,
      updatedCount: Number(r.updatedCount) || 0,
      skippedCount: Number(r.skippedCount) || 0,
      status: r.status as any,
    }));
  } catch (err) {
    console.error('SQL getAllImportLogs error:', err);
    return [];
  }
}

export async function insertImportLog(log: ImportHistoryLog): Promise<ImportHistoryLog> {
  await db.insert(schema.importLogs).values({
    id: log.id,
    fileName: log.fileName,
    uploadedAt: log.uploadedAt,
    uploadedBy: log.uploadedBy,
    totalRecords: log.totalRecords || 0,
    importedCount: log.importedCount || 0,
    updatedCount: log.updatedCount || 0,
    skippedCount: log.skippedCount || 0,
    status: log.status,
  });
  return log;
}

// -------------------------------------------------------------
// PROMOTION HISTORY
// -------------------------------------------------------------
export async function getAllPromotionHistory(): Promise<PromotionBatch[]> {
  try {
    const rows = await db.select().from(schema.promotionHistory).orderBy(desc(schema.promotionHistory.promotedAt));
    return rows.map((r) => ({
      id: r.id,
      batchName: r.batchName,
      promotedAt: r.promotedAt,
      promotedBy: r.promotedBy,
      program: r.program,
      course: r.course,
      fromSemester: Number(r.fromSemester),
      toSemester: Number(r.toSemester),
      totalStudentsPromoted: Number(r.totalStudentsPromoted) || 0,
      status: r.status as any,
      records: safeParse<any>(r.records, []),
    }));
  } catch (err) {
    console.error('SQL getAllPromotionHistory error:', err);
    return [];
  }
}

export async function insertPromotionBatch(batch: PromotionBatch): Promise<PromotionBatch> {
  await db.insert(schema.promotionHistory).values({
    id: batch.id,
    batchName: batch.batchName,
    promotedAt: batch.promotedAt,
    promotedBy: batch.promotedBy,
    program: batch.program,
    course: batch.course,
    fromSemester: batch.fromSemester,
    toSemester: batch.toSemester,
    totalStudentsPromoted: batch.totalStudentsPromoted || 0,
    status: batch.status,
    records: batch.records ? JSON.stringify(batch.records) : null,
  });
  return batch;
}

// -------------------------------------------------------------
// CLASS TEACHER ASSIGNMENTS
// -------------------------------------------------------------
export async function getAllClassTeacherAssignments(): Promise<ClassTeacherAssignment[]> {
  try {
    const rows = await db.select().from(schema.classTeacherAssignments);
    return rows.map((r) => ({
      id: r.id,
      departmentId: r.departmentId,
      departmentName: r.departmentName,
      courseId: r.courseId,
      courseCode: r.courseCode,
      courseName: r.courseName,
      academicYear: r.academicYear,
      semester: Number(r.semester),
      division: r.division,
      classTeacherId: r.classTeacherId,
      classTeacherName: r.classTeacherName,
      assistantTeacherId: r.assistantTeacherId || undefined,
      assistantTeacherName: r.assistantTeacherName || undefined,
      classroom: r.classroom,
      academicSession: r.academicSession,
      assignedAt: r.assignedAt,
      assignedBy: r.assignedBy,
    }));
  } catch (err) {
    console.error('SQL getAllClassTeacherAssignments error:', err);
    return [];
  }
}

export async function insertClassTeacherAssignment(a: ClassTeacherAssignment): Promise<ClassTeacherAssignment> {
  await db.insert(schema.classTeacherAssignments).values({
    id: a.id,
    departmentId: a.departmentId,
    departmentName: a.departmentName,
    courseId: a.courseId,
    courseCode: a.courseCode,
    courseName: a.courseName,
    academicYear: a.academicYear,
    semester: a.semester,
    division: a.division,
    classTeacherId: a.classTeacherId,
    classTeacherName: a.classTeacherName,
    assistantTeacherId: a.assistantTeacherId || null,
    assistantTeacherName: a.assistantTeacherName || null,
    classroom: a.classroom,
    academicSession: a.academicSession,
    assignedAt: a.assignedAt,
    assignedBy: a.assignedBy,
  });
  return a;
}

export async function updateClassTeacherAssignment(id: string, updates: Partial<ClassTeacherAssignment>): Promise<ClassTeacherAssignment | null> {
  await db.update(schema.classTeacherAssignments).set(updates as any).where(eq(schema.classTeacherAssignments.id, id));
  const rows = await db.select().from(schema.classTeacherAssignments).where(eq(schema.classTeacherAssignments.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    departmentId: r.departmentId,
    departmentName: r.departmentName,
    courseId: r.courseId,
    courseCode: r.courseCode,
    courseName: r.courseName,
    academicYear: r.academicYear,
    semester: Number(r.semester),
    division: r.division,
    classTeacherId: r.classTeacherId,
    classTeacherName: r.classTeacherName,
    assistantTeacherId: r.assistantTeacherId || undefined,
    assistantTeacherName: r.assistantTeacherName || undefined,
    classroom: r.classroom,
    academicSession: r.academicSession,
    assignedAt: r.assignedAt,
    assignedBy: r.assignedBy,
  };
}

export async function deleteClassTeacherAssignment(id: string): Promise<boolean> {
  await db.delete(schema.classTeacherAssignments).where(eq(schema.classTeacherAssignments.id, id));
  return true;
}

// -------------------------------------------------------------
// RESET ALL SQL DATA
// -------------------------------------------------------------
export async function clearAllSqlData() {
  await db.delete(schema.attendanceRecords);
  await db.delete(schema.sessions);
  await db.delete(schema.corrections);
  await db.delete(schema.leaves);
  await db.delete(schema.results);
  await db.delete(schema.atktRecords);
  await db.delete(schema.academicEvents);
  await db.delete(schema.notices);
  await db.delete(schema.departmentActivities);
  await db.delete(schema.chatMessages);
  await db.delete(schema.chatConversations);
  await db.delete(schema.importLogs);
  await db.delete(schema.promotionHistory);
  await db.delete(schema.classTeacherAssignments);
  await db.delete(schema.timetable);
  await db.delete(schema.subjects);
  await db.delete(schema.courses);
  await db.delete(schema.students);
  await db.delete(schema.facultyList);
  await db.delete(schema.departments);
  await db.delete(schema.programs);
  await db.delete(schema.notifications);
  await db.delete(schema.auditLogs);
  await db.delete(schema.users);
  await db.delete(schema.settings);
}

