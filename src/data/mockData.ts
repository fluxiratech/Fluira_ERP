import {
  User,
  Program,
  AcademicYearItem,
  Student360Profile,
  Faculty,
  Department,
  Course,
  Subject,
  TimetableSlot,
  AttendanceSession,
  AttendanceRecord,
  LeaveRequest,
  ERPNotification,
  AuditLog,
  CollegeSettings,
  NoticeItem,
  ChatConversation,
  ChatMessage,
  ImportHistoryLog,
  PromotionBatch,
  ClassTeacherAssignment,
  DepartmentActivity,
  ATKTRecord,
  StudentResult,
  AttendanceCorrectionRequest,
  AcademicCalendarEvent,
} from '../types';

export const INITIAL_SETTINGS: CollegeSettings = {
  academicYear: '2025-2026',
  minimumAttendancePct: 75,
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  collegeHolidays: [],
  lockPastAttendanceDays: 7,
  enableWhatsAppAlerts: true,
  enableEmailAlerts: true,
  collegeName: "JBSPS's CHANGU KANA THAKUR ARTS, COMMERCE & SCIENCE COLLEGE, NEW PANVEL (AUTONOMOUS)",
  collegeCode: 'CKT-AUT-01',
  principalName: 'Dr. S. K. Patil (Principal)',
};

export const INITIAL_ACADEMIC_YEARS: AcademicYearItem[] = [];

export const INITIAL_PROGRAMS: Program[] = [
  {
    id: 'prog-ug',
    code: 'UG',
    name: 'Undergraduate',
    status: 'Active',
  },
  {
    id: 'prog-pg',
    code: 'PG',
    name: 'Postgraduate',
    status: 'Active',
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-af',
    code: 'AF',
    name: 'Accounting & Finance',
    hodId: 'u-hod-af',
    hodName: 'Dr. A. R. Sharma (HOD)',
    establishedYear: 2010,
    totalStudents: 180,
    totalFaculty: 12,
    avgAttendancePct: 82.5,
  },
  {
    id: 'dept-ba',
    code: 'BA',
    name: 'Business Analytics',
    hodId: 'u-hod-ba',
    hodName: 'Prof. P. V. Kulkarni (HOD)',
    establishedYear: 2018,
    totalStudents: 120,
    totalFaculty: 8,
    avgAttendancePct: 85.0,
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-baf',
    programId: 'prog-ug',
    programName: 'Undergraduate',
    courseName: 'BAF',
    courseCode: 'BAF',
    durationYears: 3,
    totalSemesters: 6,
    status: 'Active',
    departmentId: 'dept-af',
  },
  {
    id: 'course-mcom',
    programId: 'prog-pg',
    programName: 'Postgraduate',
    courseName: 'M.Com',
    courseCode: 'M.Com',
    durationYears: 2,
    totalSemesters: 4,
    status: 'Active',
    departmentId: 'dept-ba',
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-af101',
    code: 'AF101',
    name: 'Financial Accounting I',
    departmentId: 'dept-af',
    programId: 'prog-ug',
    programName: 'Undergraduate',
    courseId: 'course-baf',
    courseCode: 'BAF',
    semester: 1,
    type: 'Theory',
    credits: 3,
    assignedFacultyId: 'f-1',
    assignedFacultyName: 'Dr. A. R. Sharma',
    status: 'Active',
  },
  {
    id: 'sub-af102',
    code: 'AF102',
    name: 'Cost Accounting I',
    departmentId: 'dept-af',
    programId: 'prog-ug',
    programName: 'Undergraduate',
    courseId: 'course-baf',
    courseCode: 'BAF',
    semester: 1,
    type: 'Theory',
    credits: 3,
    assignedFacultyId: 'f-1',
    assignedFacultyName: 'Dr. A. R. Sharma',
    status: 'Active',
  },
  {
    id: 'sub-ba201',
    code: 'BA201',
    name: 'Business Statistics & Analytics',
    departmentId: 'dept-ba',
    programId: 'prog-pg',
    programName: 'Postgraduate',
    courseId: 'course-mcom',
    courseCode: 'M.Com',
    semester: 1,
    type: 'Theory',
    credits: 4,
    assignedFacultyId: 'f-2',
    assignedFacultyName: 'Prof. P. V. Kulkarni',
    status: 'Active',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u-janvi',
    name: 'Janvi Vedak',
    email: 'janvivedak23@gmail.com',
    role: 'Admin',
    departmentId: 'dept-af',
    departmentName: 'Department of Accounting and Finance',
    phone: '+918828344385',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    password: 'Admin123JV',
    isActive: true,
    createdAt: new Date().toISOString().substring(0, 10),
  },
];

export const INITIAL_FACULTY: Faculty[] = [];

export const INITIAL_STUDENTS: Student360Profile[] = [];

export const INITIAL_TIMETABLE: TimetableSlot[] = [];

export const INITIAL_SESSIONS: AttendanceSession[] = [];

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [];

export const INITIAL_LEAVES: LeaveRequest[] = [];

export const INITIAL_CORRECTIONS: AttendanceCorrectionRequest[] = [];

export const INITIAL_RESULTS: StudentResult[] = [];

export const INITIAL_NOTIFICATIONS: ERPNotification[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_ATKT_RECORDS: ATKTRecord[] = [];

export const INITIAL_NOTICES: NoticeItem[] = [];

export const INITIAL_CHAT_CONVERSATIONS: ChatConversation[] = [];

export const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {};

export const INITIAL_IMPORT_LOGS: ImportHistoryLog[] = [];

export const INITIAL_PROMOTION_HISTORY: PromotionBatch[] = [];

export const INITIAL_CLASS_TEACHERS: ClassTeacherAssignment[] = [];

export const INITIAL_DEPARTMENT_ACTIVITIES: DepartmentActivity[] = [];

export const INITIAL_ACADEMIC_EVENTS: AcademicCalendarEvent[] = [];

