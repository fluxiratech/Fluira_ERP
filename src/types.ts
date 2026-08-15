export type Role =
  | 'Admin'
  | 'HOD'
  | 'Faculty'
  | 'Class Teacher'
  | 'Student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  departmentName?: string;
  phone?: string;
  avatar?: string;
  password?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface CertItem {
  title: string;
  issuer: string;
  year: string;
}

export interface InternshipItem {
  company: string;
  role: string;
  duration: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  techStack: string;
  link?: string;
}

export interface ActivityItem {
  title: string;
  category: string;
  position: string;
}

export interface SemesterPerformance {
  semesterId: string;
  program: 'FY' | 'SY' | 'TY' | 'M.Com Part 1' | 'M.Com Part 2';
  semesterNumber: number;
  division: string;
  divisionOptions: string[];
  gpa: number;
  percentage: number;
  resultStatus: 'PASS' | 'FAIL' | 'ATKT' | 'AWAITING';
  academicYear: string;
}

export interface Student360Profile {
  id: string;
  studentId: string;
  rollNumber: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  admissionDate: string;
  passportPhoto: string;
  bloodGroup: string;
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  course: string;
  programId?: string;
  programName?: string;
  courseId?: string;
  courseCode?: string;
  academicYearCode?: string;
  departmentId: string;
  departmentName: string;
  semester: number;
  division: string;
  academicYear: string;
  
  // Contact
  personalMobile: string;
  whatsappNumber: string;
  email: string;
  emergencyContact: string;
  permanentAddress: string;
  temporaryAddress: string;
  
  // Parents
  fatherName: string;
  motherName: string;
  guardianName: string;
  parentMobile: string;
  parentEmail: string;
  parentOccupation: string;

  // SSC & HSC
  sscSchoolName: string;
  sscBoard: string;
  sscPassingYear: string;
  sscPercentage: number;
  
  hscCollegeName: string;
  hscBoard: string;
  hscStream: string;
  hscPassingYear: string;
  hscPercentage: number;

  // College Academic Performance (FY, SY, TY, M.Com Part 1, M.Com Part 2)
  academicPerformance?: SemesterPerformance[];

  // College GPA Matrix (Legacy/Summary)
  sem1Gpa: number;
  sem2Gpa: number;
  sem3Gpa: number;
  sem4Gpa: number;
  sem5Gpa?: number;
  sem6Gpa?: number;
  pgSem1Gpa?: number;
  pgSem2Gpa?: number;
  pgSem3Gpa?: number;
  pgSem4Gpa?: number;
  overallCgpa: number;

  // Skills & Portfolio
  technicalSkills: string[];
  programmingLanguages: string[];
  certifications: CertItem[];
  internships: InternshipItem[];
  projects: ProjectItem[];
  sportsAndExtra: ActivityItem[];
  resumeUrl?: string;
  certificatesUrls?: string[];

  // Enhanced Student 360 Information
  prnNumber?: string;
  year?: string;
  sscYear?: string;
  hscYear?: string;
  fatherMobile?: string;
  motherMobile?: string;
  abcId?: string;
  aadhaarNumber?: string;
  academicStatus?: 'Active' | 'Pass Out' | 'Alumni' | 'Dropout';
  batch?: string;
  annualIncome?: string;
  
  departmentActivities?: DepartmentActivity[];
  registeredSubjectsDetails?: SubjectDetail[];

  // Attendance metrics
  totalLectures: number;
  attendedLectures: number;
  attendancePercentage: number;
}

export interface DepartmentActivity {
  id: string;
  type:
    | 'Research Projects'
    | 'Seminars'
    | 'Internships'
    | 'Achievements'
    | 'Awards'
    | 'Competitions'
    | 'Volunteer Activities'
    | 'Other'
    | 'Seminar'
    | 'National Seminar'
    | 'Workshop'
    | 'Industrial Visit'
    | 'Guest Lecture'
    | 'Competition'
    | 'NSS/NCC Event'
    | 'Cultural Event'
    | 'Sports'
    | 'Placement Drive'
    | 'Research Project'
    | 'Internship'
    | 'Achievement'
    | 'Volunteer';
  title: string;
  date: string;
  organizer: string;
  roleOrPosition: string; // e.g., 'Participant', 'Winner', 'Organizer', 'Co-ordinator'
  description?: string;
  photoUrl?: string;
  certificateUrl?: string;
  departmentId?: string;
  departmentName?: string;
  venue?: string;
  speakerOrGuest?: string;
  targetAudience?: string;
  participantsCount?: number;
  academicYear?: string;
  status?: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  keyOutcomes?: string;
  studentParticipants?: string[];
}

export interface SubjectDetail {
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  credits: number;
  attendancePct: number;
  internalMarks: number; // Max 40
  externalMarks: number; // Max 60
  totalMarks: number;    // Max 100
  grade: string;
}

export interface ImportHistoryLog {
  id: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  totalRecords: number;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
}

export interface PromotionRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  prnNumber: string;
  course: string;
  previousYear: string;
  previousSemester: number;
  previousDivision: string;
  newYear: string;
  newSemester: number;
  newDivision: string;
  newStatus: 'Active' | 'Pass Out' | 'Alumni';
  promotedAt: string;
  promotedBy: string;
}

export interface PromotionBatch {
  id: string;
  batchName: string;
  promotedAt: string;
  promotedBy: string;
  program: string;
  course: string;
  fromSemester: number;
  toSemester: number;
  totalStudentsPromoted: number;
  status: 'COMPLETED' | 'ROLLED_BACK';
  records: PromotionRecord[];
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'Academic' | 'Exam' | 'Event' | 'Placement' | 'Emergency';
  publishedBy: string;
  publishedRole: Role;
  createdAt: string;
  scheduledAt?: string;
  isPinned: boolean;
  isArchived: boolean;
  targetProgram?: string;
  targetCourse?: string;
  targetAcademicYear?: string;
  targetSemester?: number;
  targetDivision?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  sentChannels: {
    inApp: boolean;
    email: boolean;
    whatsapp: boolean;
  };
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  senderAvatar?: string;
  text: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file';
  createdAt: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: Role;
  participantAvatar?: string;
  participantStatus: 'Online' | 'Offline' | 'Away';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface FacultySubjectAllocation {
  id: string;
  code: string;
  name: string;
  semester: number;
  credits: number;
  type: string;
  courseCode?: string;
  courseName?: string;
  departmentId?: string;
}

export interface Faculty {
  id: string;
  facultyId: string;
  fullName: string;
  email: string;
  mobile: string;
  departmentId: string;
  departmentName: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer';
  qualification: string;
  experienceYears: number;
  photo: string;
  allocatedSubjects: string[];
  currentAllocations?: FacultySubjectAllocation[];
  isClassTeacherOf?: {
    departmentId: string;
    courseId?: string;
    courseCode?: string;
    academicYear?: string;
    semester: number;
    division: string;
    classroom?: string;
  };
  weeklyWorkloadHours: number;
  isActive: boolean;
}

export interface ClassTeacherAssignment {
  id: string;
  departmentId: string;
  departmentName: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  academicYear: string; // 'FY', 'SY', 'TY', 'M.Com Part 1', 'M.Com Part 2'
  semester: number;
  division: string;
  classTeacherId: string;
  classTeacherName: string;
  assistantTeacherId?: string;
  assistantTeacherName?: string;
  classroom: string;
  academicSession: string; // '2025-2026'
  assignedAt: string;
  assignedBy: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  hodId: string;
  hodName: string;
  establishedYear: number;
  totalStudents: number;
  totalFaculty: number;
  avgAttendancePct: number;
}

export interface Program {
  id: string;
  code: string; // 'UG' | 'PG' | string
  name: string; // 'Undergraduate (UG)' | 'Postgraduate (PG)' | string
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicYearItem {
  id: string;
  code?: string; // 'FY', 'SY', 'TY', 'Part I', 'Part II'
  name?: string;
  courseId?: string;
  programId?: string;
  year?: string;
  isCurrent?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface Course {
  id: string;
  programId: string;
  programName?: string;
  courseName: string;
  courseCode: string;
  durationYears: number;
  totalSemesters: number;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
  // Backward compatibility
  departmentId?: string;
  code?: string;
  name?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  programId?: string;
  programName?: string;
  courseId?: string;
  courseCode?: string;
  semester: number;
  type: 'Theory' | 'Practical' | 'Lab' | 'Elective';
  credits: number;
  assignedFacultyId: string;
  assignedFacultyName: string;
  status?: 'Active' | 'Inactive';
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface TimetableSlot {
  id: string;
  departmentId: string;
  programId?: string;
  programName?: string;
  courseId?: string;
  courseName?: string;
  semester: number;
  division: string;
  day: DayOfWeek;
  timeSlot: string; // e.g. "09:00 AM - 10:00 AM"
  subjectId: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  classroom: string;
  type: 'Lecture' | 'Practical' | 'Lab';
}

export interface TimetableConflict {
  slot1: TimetableSlot;
  slot2: TimetableSlot;
  reason: 'FACULTY_DOUBLE_BOOKED' | 'CLASSROOM_COLLISION';
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE';

export interface AttendanceSession {
  id: string;
  date: string;
  departmentId: string;
  programId?: string;
  programName?: string;
  courseId?: string;
  courseName?: string;
  semester: number;
  division: string;
  subjectId: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  sessionType: 'Daily' | 'Lecture' | 'Practical' | 'Lab';
  timeSlot: string;
  classroom: string;
  isLocked: boolean;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  onLeaveCount: number;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentRoll: string;
  studentName: string;
  status: AttendanceStatus;
  remarks?: string;
  markedAt: string;
  markedBy: string;
}

export interface AttendanceCorrectionRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  departmentId: string;
  date: string;
  subjectName: string;
  currentStatus: AttendanceStatus;
  requestedStatus: AttendanceStatus;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface LeaveRequest {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantRole: 'STUDENT' | 'FACULTY';
  applicantRollOrId: string;
  departmentId: string;
  leaveType: 'Medical' | 'Casual' | 'Academic/OD' | 'Duty Leave';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  medicalDocUrl?: string;
  status: 'PENDING_FACULTY' | 'PENDING_HOD' | 'APPROVED' | 'REJECTED';
  facultyRemarks?: string;
  hodRemarks?: string;
  createdAt: string;
}

export interface StudentResult {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  semester: number;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  internalMarks: number; // Max 40
  externalMarks: number; // Max 60
  totalMarks: number; // Max 100
  grade: string;
  gpa: number;
}

export interface ERPNotification {
  id: string;
  userId?: string;
  role?: Role;
  title: string;
  message: string;
  type: 'LOW_ATTENDANCE' | 'LEAVE_STATUS' | 'TIMETABLE' | 'GENERAL' | 'ANNOUNCEMENT';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  category: 'LOGIN' | 'ATTENDANCE_CHANGE' | 'USER_MGMT' | 'LEAVE' | 'TIMETABLE' | 'SYSTEM';
  details: string;
  ipAddress: string;
}

export interface CollegeSettings {
  academicYear: string;
  minimumAttendancePct: number; // Default 75
  warningThresholdPct?: number; // e.g. 80
  criticalThresholdPct?: number; // e.g. 65
  minAttendancePercent?: number; // Backward compatibility
  warningThresholdPercent?: number;
  criticalThresholdPercent?: number;
  holidaysList?: string[];
  workingDays: string[];
  collegeHolidays: { id: string; date: string; name: string; type: 'Festival' | 'National' | 'Academic' }[];
  lockPastAttendanceDays: number; // Default 7
  enableWhatsAppAlerts: boolean;
  enableEmailAlerts: boolean;
  collegeName: string;
  collegeCode: string;
  principalName: string;

  // Backup & Restore Settings
  backupSchedule?: 'Disabled' | 'Daily' | 'Weekly' | 'Monthly';
  backupLastRun?: string;

  // Email SMTP Settings
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSenderEmail?: string;
  smtpSenderName?: string;
  smtpEnableTls?: boolean;

  // WhatsApp API Settings
  whatsappApiToken?: string;
  whatsappPhoneNumberId?: string;
  whatsappWabaId?: string;
  whatsappWebhookToken?: string;
  whatsappWebhookStatus?: 'Connected' | 'Disconnected' | 'Testing';

  // SMS Gateway Settings
  smsGatewayProvider?: 'Twilio' | 'MSG91' | 'DLT Portal' | 'Fast2SMS';
  smsApiKey?: string;
  smsSenderId?: string;
  smsDltEntityId?: string;
  smsHeaderId?: string;
}

export interface ATKTRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  prnNumber?: string;
  course: string;
  departmentId: string;
  departmentName: string;
  semester: number;
  subjectCode: string;
  subjectName: string;
  backlogType: 'Internal' | 'External' | 'Both';
  originalInternalMarks?: number;
  originalExternalMarks?: number;
  attemptsCount: number;
  status: 'PENDING_EXAM' | 'REGISTERED' | 'HALL_TICKET_ISSUED' | 'CLEARED' | 'FAILED_REEXAM';
  examFeePaid: boolean;
  examFeeAmount: number;
  reExamDate?: string;
  reExamMarksObtained?: number;
  clearedAt?: string;
  remarks?: string;
}

export type AcademicEventType = 'Holiday' | 'Exam Week' | 'Semester Event' | 'Non-Working Day';
export type AcademicEventCategory = 'National' | 'Festival' | 'Academic' | 'Examination' | 'Co-curricular' | 'Administrative' | 'Sports';

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  eventType: AcademicEventType;
  category: AcademicEventCategory;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isNonWorkingDay: boolean; // Controls whether attendance/classes are barred on these dates
  description?: string;
  departmentId?: string; // 'ALL' or specific dept id
  departmentName?: string; // 'All Departments' or specific name
  affectedPrograms?: string[]; // e.g. ['UG', 'PG']
  createdBy?: string;
  createdAt?: string;
}
