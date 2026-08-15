import { pgTable, text, boolean, integer, doublePrecision } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull(),
  departmentId: text('department_id').references(() => departments.id, { onDelete: 'set null' }),
  departmentName: text('department_name'),
  phone: text('phone'),
  avatar: text('avatar'),
  password: text('password'),
  isActive: boolean('is_active').default(true).notNull(),
  lastLogin: text('last_login'),
  createdAt: text('created_at'),
});

export const programs = pgTable('programs', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  status: text('status').default('Active').notNull(),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

export const departments = pgTable('departments', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  hodId: text('hod_id').references(() => users.id, { onDelete: 'set null' }),
  hodName: text('hod_name'),
  establishedYear: integer('established_year'),
  totalStudents: integer('total_students').default(0),
  totalFaculty: integer('total_faculty').default(0),
  avgAttendancePct: doublePrecision('avg_attendance_pct').default(0),
});

export const courses = pgTable('courses', {
  id: text('id').primaryKey(),
  programId: text('program_id').notNull().references(() => programs.id, { onDelete: 'cascade' }),
  programName: text('program_name'),
  courseName: text('course_name').notNull(),
  courseCode: text('course_code').notNull(),
  durationYears: integer('duration_years').default(3),
  totalSemesters: integer('total_semesters').default(6),
  status: text('status').default('Active').notNull(),
  departmentId: text('department_id').references(() => departments.id, { onDelete: 'set null' }),
  code: text('code'),
  name: text('name'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

export const facultyList = pgTable('faculty_list', {
  id: text('id').primaryKey(),
  facultyId: text('faculty_id').notNull(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  mobile: text('mobile'),
  departmentId: text('department_id').references(() => departments.id, { onDelete: 'set null' }),
  departmentName: text('department_name'),
  designation: text('designation'),
  qualification: text('qualification'),
  experienceYears: integer('experience_years').default(0),
  photo: text('photo'),
  allocatedSubjects: text('allocated_subjects'), // JSON string
  isClassTeacherOf: text('is_class_teacher_of'), // JSON string
  weeklyWorkloadHours: doublePrecision('weekly_workload_hours').default(0),
  isActive: boolean('is_active').default(true).notNull(),
});

export const subjects = pgTable('subjects', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  departmentId: text('department_id').notNull().references(() => departments.id, { onDelete: 'cascade' }),
  programId: text('program_id').references(() => programs.id, { onDelete: 'set null' }),
  programName: text('program_name'),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'set null' }),
  courseCode: text('course_code'),
  semester: integer('semester').notNull(),
  type: text('type').notNull(),
  credits: integer('credits').notNull(),
  assignedFacultyId: text('assigned_faculty_id').references(() => facultyList.id, { onDelete: 'set null' }),
  assignedFacultyName: text('assigned_faculty_name'),
  status: text('status').default('Active'),
});

export const students = pgTable('students', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  rollNumber: text('roll_number').notNull(),
  fullName: text('full_name').notNull(),
  gender: text('gender'),
  dob: text('dob'),
  admissionDate: text('admission_date'),
  passportPhoto: text('passport_photo'),
  bloodGroup: text('blood_group'),
  category: text('category'),
  course: text('course'),
  programId: text('program_id').references(() => programs.id, { onDelete: 'set null' }),
  programName: text('program_name'),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'set null' }),
  courseCode: text('course_code'),
  academicYearCode: text('academic_year_code'),
  departmentId: text('department_id').references(() => departments.id, { onDelete: 'set null' }),
  departmentName: text('department_name'),
  semester: integer('semester').notNull(),
  division: text('division').notNull(),
  academicYear: text('academic_year'),
  personalMobile: text('personal_mobile'),
  whatsappNumber: text('whatsapp_number'),
  email: text('email'),
  emergencyContact: text('emergency_contact'),
  permanentAddress: text('permanent_address'),
  temporaryAddress: text('temporary_address'),
  fatherName: text('father_name'),
  motherName: text('mother_name'),
  guardianName: text('guardian_name'),
  parentMobile: text('parent_mobile'),
  parentEmail: text('parent_email'),
  parentOccupation: text('parent_occupation'),
  sscSchoolName: text('ssc_school_name'),
  sscBoard: text('ssc_board'),
  sscPassingYear: text('ssc_passing_year'),
  sscPercentage: doublePrecision('ssc_percentage'),
  hscCollegeName: text('hsc_college_name'),
  hscBoard: text('hsc_board'),
  hscStream: text('hsc_stream'),
  hscPassingYear: text('hsc_passing_year'),
  hscPercentage: doublePrecision('hsc_percentage'),
  academicPerformance: text('academic_performance'), // JSON string
  sem1Gpa: doublePrecision('sem1_gpa'),
  sem2Gpa: doublePrecision('sem2_gpa'),
  sem3Gpa: doublePrecision('sem3_gpa'),
  sem4Gpa: doublePrecision('sem4_gpa'),
  sem5Gpa: doublePrecision('sem5_gpa'),
  sem6Gpa: doublePrecision('sem6_gpa'),
  overallCgpa: doublePrecision('overall_cgpa'),
  technicalSkills: text('technical_skills'), // JSON string
  programmingLanguages: text('programming_languages'), // JSON string
  certifications: text('certifications'), // JSON string
  internships: text('internships'), // JSON string
  projects: text('projects'), // JSON string
  sportsAndExtra: text('sports_and_extra'), // JSON string
  prnNumber: text('prn_number'),
  year: text('year'),
  sscYear: text('ssc_year'),
  hscYear: text('hsc_year'),
  fatherMobile: text('father_mobile'),
  motherMobile: text('mother_mobile'),
  abcId: text('abc_id'),
  aadhaarNumber: text('aadhaar_number'),
  academicStatus: text('academic_status'),
  batch: text('batch'),
  annualIncome: text('annual_income'),
  totalLectures: integer('total_lectures').default(0),
  attendedLectures: integer('attended_lectures').default(0),
  attendancePercentage: doublePrecision('attendance_percentage').default(0),
});

export const timetable = pgTable('timetable', {
  id: text('id').primaryKey(),
  departmentId: text('department_id').notNull().references(() => departments.id, { onDelete: 'cascade' }),
  programId: text('program_id').references(() => programs.id, { onDelete: 'set null' }),
  programName: text('program_name'),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'set null' }),
  courseName: text('course_name'),
  semester: integer('semester').notNull(),
  division: text('division').notNull(),
  day: text('day').notNull(),
  timeSlot: text('time_slot').notNull(),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  subjectName: text('subject_name').notNull(),
  facultyId: text('faculty_id').notNull().references(() => facultyList.id, { onDelete: 'cascade' }),
  facultyName: text('faculty_name').notNull(),
  classroom: text('classroom').notNull(),
  type: text('type').notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  departmentId: text('department_id').notNull().references(() => departments.id, { onDelete: 'cascade' }),
  programId: text('program_id').references(() => programs.id, { onDelete: 'set null' }),
  programName: text('program_name'),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'set null' }),
  courseName: text('course_name'),
  semester: integer('semester').notNull(),
  division: text('division').notNull(),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  subjectName: text('subject_name').notNull(),
  facultyId: text('faculty_id').notNull().references(() => facultyList.id, { onDelete: 'cascade' }),
  facultyName: text('faculty_name').notNull(),
  sessionType: text('session_type').notNull(),
  timeSlot: text('time_slot').notNull(),
  classroom: text('classroom').notNull(),
  isLocked: boolean('is_locked').default(false).notNull(),
  totalStudents: integer('total_students').default(0),
  presentCount: integer('present_count').default(0),
  absentCount: integer('absent_count').default(0),
  lateCount: integer('late_count').default(0),
  onLeaveCount: integer('on_leave_count').default(0),
});

export const attendanceRecords = pgTable('attendance_records', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  studentRoll: text('student_roll'),
  studentName: text('student_name'),
  status: text('status').notNull(),
  remarks: text('remarks'),
  markedAt: text('marked_at'),
  markedBy: text('marked_by'),
});

export const leaves = pgTable('leaves', {
  id: text('id').primaryKey(),
  applicantId: text('applicant_id').notNull(),
  applicantName: text('applicant_name').notNull(),
  applicantRole: text('applicant_role').notNull(),
  applicantRollOrId: text('applicant_roll_or_id'),
  departmentId: text('department_id').references(() => departments.id, { onDelete: 'set null' }),
  leaveType: text('leave_type').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  totalDays: integer('total_days').default(1),
  reason: text('reason'),
  medicalDocUrl: text('medical_doc_url'),
  status: text('status').notNull(),
  facultyRemarks: text('faculty_remarks'),
  hodRemarks: text('hod_remarks'),
  createdAt: text('created_at'),
});

export const corrections = pgTable('corrections', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  studentName: text('student_name').notNull(),
  rollNumber: text('roll_number'),
  departmentId: text('department_id').references(() => departments.id, { onDelete: 'set null' }),
  date: text('date').notNull(),
  subjectName: text('subject_name').notNull(),
  currentStatus: text('current_status').notNull(),
  requestedStatus: text('requested_status').notNull(),
  reason: text('reason'),
  status: text('status').notNull(),
  appliedAt: text('applied_at'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: text('reviewed_at'),
});

export const results = pgTable('results', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  studentName: text('student_name').notNull(),
  rollNumber: text('roll_number'),
  semester: integer('semester').notNull(),
  subjectId: text('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
  subjectCode: text('subject_code'),
  subjectName: text('subject_name').notNull(),
  internalMarks: doublePrecision('internal_marks').default(0),
  externalMarks: doublePrecision('external_marks').default(0),
  totalMarks: doublePrecision('total_marks').default(0),
  grade: text('grade'),
  gpa: doublePrecision('gpa'),
});

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  role: text('role'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  actionUrl: text('action_url'),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  actorName: text('actor_name'),
  actorRole: text('actor_role'),
  action: text('action').notNull(),
  category: text('category').notNull(),
  details: text('details').notNull(),
  ipAddress: text('ip_address'),
});

export const settings = pgTable('settings', {
  id: text('id').primaryKey(),
  data: text('data').notNull(), // JSON payload
});

export const atktRecords = pgTable('atkt_records', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  studentName: text('student_name').notNull(),
  rollNumber: text('roll_number'),
  prnNumber: text('prn_number'),
  course: text('course'),
  departmentId: text('department_id').references(() => departments.id, { onDelete: 'set null' }),
  departmentName: text('department_name'),
  semester: integer('semester').notNull(),
  subjectCode: text('subject_code'),
  subjectName: text('subject_name').notNull(),
  backlogType: text('backlog_type'),
  originalInternalMarks: doublePrecision('original_internal_marks'),
  originalExternalMarks: doublePrecision('original_external_marks'),
  attemptsCount: integer('attempts_count').default(1),
  status: text('status').notNull(),
  examFeePaid: boolean('exam_fee_paid').default(false),
  examFeeAmount: doublePrecision('exam_fee_amount').default(0),
  reExamDate: text('re_exam_date'),
  reExamMarksObtained: doublePrecision('re_exam_marks_obtained'),
  clearedAt: text('cleared_at'),
  remarks: text('remarks'),
});

export const academicEvents = pgTable('academic_events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  eventType: text('event_type').notNull(),
  category: text('category').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  isNonWorkingDay: boolean('is_non_working_day').default(true).notNull(),
  description: text('description'),
  departmentId: text('department_id').references(() => departments.id, { onDelete: 'set null' }),
  departmentName: text('department_name'),
  createdBy: text('created_by'),
  createdAt: text('created_at'),
});

export const notices = pgTable('notices', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  publishedBy: text('published_by'),
  publishedRole: text('published_role'),
  createdAt: text('created_at'),
  scheduledAt: text('scheduled_at'),
  isPinned: boolean('is_pinned').default(false),
  isArchived: boolean('is_archived').default(false),
  targetProgram: text('target_program'),
  targetCourse: text('target_course'),
  targetAcademicYear: text('target_academic_year'),
  targetSemester: integer('target_semester'),
  targetDivision: text('target_division'),
  attachmentUrl: text('attachment_url'),
  attachmentName: text('attachment_name'),
  sentChannels: text('sent_channels'), // JSON
});

export const departmentActivities = pgTable('department_activities', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  organizer: text('organizer'),
  roleOrPosition: text('role_or_position'),
  description: text('description'),
  photoUrl: text('photo_url'),
  certificateUrl: text('certificate_url'),
  departmentId: text('department_id').references(() => departments.id, { onDelete: 'set null' }),
  departmentName: text('department_name'),
  venue: text('venue'),
  speakerOrGuest: text('speaker_or_guest'),
  targetAudience: text('target_audience'),
  participantsCount: integer('participants_count').default(0),
  academicYear: text('academic_year'),
  status: text('status'),
  keyOutcomes: text('key_outcomes'),
  studentParticipants: text('student_participants'), // JSON
});

export const chatConversations = pgTable('chat_conversations', {
  id: text('id').primaryKey(),
  participantId: text('participant_id').notNull(),
  participantName: text('participant_name').notNull(),
  participantRole: text('participant_role').notNull(),
  participantAvatar: text('participant_avatar'),
  participantStatus: text('participant_status').default('Offline'),
  lastMessage: text('last_message'),
  lastMessageTime: text('last_message_time'),
  unreadCount: integer('unread_count').default(0),
});

export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => chatConversations.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull(),
  senderName: text('sender_name').notNull(),
  senderRole: text('sender_role').notNull(),
  senderAvatar: text('sender_avatar'),
  text: text('text').notNull(),
  attachmentUrl: text('attachment_url'),
  attachmentType: text('attachment_type'),
  createdAt: text('created_at').notNull(),
  isRead: boolean('is_read').default(false),
});

export const importLogs = pgTable('import_logs', {
  id: text('id').primaryKey(),
  fileName: text('file_name').notNull(),
  uploadedAt: text('uploaded_at').notNull(),
  uploadedBy: text('uploaded_by').notNull(),
  totalRecords: integer('total_records').default(0),
  importedCount: integer('imported_count').default(0),
  updatedCount: integer('updated_count').default(0),
  skippedCount: integer('skipped_count').default(0),
  status: text('status').notNull(),
});

export const promotionHistory = pgTable('promotion_history', {
  id: text('id').primaryKey(),
  batchName: text('batch_name').notNull(),
  promotedAt: text('promoted_at').notNull(),
  promotedBy: text('promoted_by').notNull(),
  program: text('program').notNull(),
  course: text('course').notNull(),
  fromSemester: integer('from_semester').notNull(),
  toSemester: integer('to_semester').notNull(),
  totalStudentsPromoted: integer('total_students_promoted').default(0),
  status: text('status').notNull(),
  records: text('records'), // JSON stringified PromotionRecord[]
});

export const classTeacherAssignments = pgTable('class_teacher_assignments', {
  id: text('id').primaryKey(),
  departmentId: text('department_id').notNull().references(() => departments.id, { onDelete: 'cascade' }),
  departmentName: text('department_name').notNull(),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  courseCode: text('course_code').notNull(),
  courseName: text('course_name').notNull(),
  academicYear: text('academic_year').notNull(),
  semester: integer('semester').notNull(),
  division: text('division').notNull(),
  classTeacherId: text('class_teacher_id').notNull().references(() => facultyList.id, { onDelete: 'cascade' }),
  classTeacherName: text('class_teacher_name').notNull(),
  assistantTeacherId: text('assistant_teacher_id').references(() => facultyList.id, { onDelete: 'set null' }),
  assistantTeacherName: text('assistant_teacher_name'),
  classroom: text('classroom').notNull(),
  academicSession: text('academic_session').notNull(),
  assignedAt: text('assigned_at').notNull(),
  assignedBy: text('assigned_by').notNull(),
});

// -------------------------------------------------------------
// DRIZZLE RELATIONS DEFINITIONS
// -------------------------------------------------------------

export const usersRelations = relations(users, ({ one, many }) => ({
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  notifications: many(notifications),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  hod: one(users, {
    fields: [departments.hodId],
    references: [users.id],
  }),
  courses: many(courses),
  subjects: many(subjects),
  faculty: many(facultyList),
  students: many(students),
  activities: many(departmentActivities),
  classTeachers: many(classTeacherAssignments),
}));

export const programsRelations = relations(programs, ({ many }) => ({
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  program: one(programs, {
    fields: [courses.programId],
    references: [programs.id],
  }),
  department: one(departments, {
    fields: [courses.departmentId],
    references: [departments.id],
  }),
  subjects: many(subjects),
  students: many(students),
}));

export const facultyListRelations = relations(facultyList, ({ one, many }) => ({
  department: one(departments, {
    fields: [facultyList.departmentId],
    references: [departments.id],
  }),
  assignedSubjects: many(subjects),
  timetableSlots: many(timetable),
  sessions: many(sessions),
  classTeacherRoles: many(classTeacherAssignments),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  department: one(departments, {
    fields: [subjects.departmentId],
    references: [departments.id],
  }),
  course: one(courses, {
    fields: [subjects.courseId],
    references: [courses.id],
  }),
  assignedFaculty: one(facultyList, {
    fields: [subjects.assignedFacultyId],
    references: [facultyList.id],
  }),
  timetableSlots: many(timetable),
  sessions: many(sessions),
  results: many(results),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  department: one(departments, {
    fields: [students.departmentId],
    references: [departments.id],
  }),
  course: one(courses, {
    fields: [students.courseId],
    references: [courses.id],
  }),
  attendanceRecords: many(attendanceRecords),
  corrections: many(corrections),
  results: many(results),
  atktRecords: many(atktRecords),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  department: one(departments, {
    fields: [sessions.departmentId],
    references: [departments.id],
  }),
  subject: one(subjects, {
    fields: [sessions.subjectId],
    references: [subjects.id],
  }),
  faculty: one(facultyList, {
    fields: [sessions.facultyId],
    references: [facultyList.id],
  }),
  records: many(attendanceRecords),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({ one }) => ({
  session: one(sessions, {
    fields: [attendanceRecords.sessionId],
    references: [sessions.id],
  }),
  student: one(students, {
    fields: [attendanceRecords.studentId],
    references: [students.id],
  }),
}));

export const chatConversationsRelations = relations(chatConversations, ({ many }) => ({
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
}));

export const classTeacherAssignmentsRelations = relations(classTeacherAssignments, ({ one }) => ({
  department: one(departments, {
    fields: [classTeacherAssignments.departmentId],
    references: [departments.id],
  }),
  course: one(courses, {
    fields: [classTeacherAssignments.courseId],
    references: [courses.id],
  }),
  classTeacher: one(facultyList, {
    fields: [classTeacherAssignments.classTeacherId],
    references: [facultyList.id],
  }),
  assistantTeacher: one(facultyList, {
    fields: [classTeacherAssignments.assistantTeacherId],
    references: [facultyList.id],
  }),
}));


