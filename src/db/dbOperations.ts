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
    semester: Number(row.semester) || 1,
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
    sscPercentage: Number(row.sscPercentage) || 0,
    hscCollegeName: row.hscCollegeName || '',
    hscBoard: row.hscBoard || '',
    hscStream: row.hscStream || '',
    hscPassingYear: row.hscPassingYear || '',
    hscPercentage: Number(row.hscPercentage) || 0,
    academicPerformance: safeParse(row.academicPerformance, []),
    sem1Gpa: Number(row.sem1Gpa) || 0,
    sem2Gpa: Number(row.sem2Gpa) || 0,
    sem3Gpa: Number(row.sem3Gpa) || 0,
    sem4Gpa: Number(row.sem4Gpa) || 0,
    sem5Gpa: row.sem5Gpa !== null ? Number(row.sem5Gpa) : undefined,
    sem6Gpa: row.sem6Gpa !== null ? Number(row.sem6Gpa) : undefined,
    overallCgpa: Number(row.overallCgpa) || 0,
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
    totalLectures: Number(row.totalLectures) || 0,
    attendedLectures: Number(row.attendedLectures) || 0,
    attendancePercentage: Number(row.attendancePercentage) || 0,
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
    programId: st.programId || null,
    programName: st.programName || null,
    courseId: st.courseId || null,
    courseCode: st.courseCode || null,
    academicYearCode: st.academicYearCode || null,
    departmentId: st.departmentId || '',
    departmentName: st.departmentName || '',
    semester: Number(st.semester) || 1,
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
    sscPercentage: st.sscPercentage || 0,
    hscCollegeName: st.hscCollegeName || '',
    hscBoard: st.hscBoard || '',
    hscStream: st.hscStream || '',
    hscPassingYear: st.hscPassingYear || '',
    hscPercentage: st.hscPercentage || 0,
    academicPerformance: JSON.stringify(st.academicPerformance || []),
    sem1Gpa: st.sem1Gpa || 0,
    sem2Gpa: st.sem2Gpa || 0,
    sem3Gpa: st.sem3Gpa || 0,
    sem4Gpa: st.sem4Gpa || 0,
    sem5Gpa: st.sem5Gpa ?? null,
    sem6Gpa: st.sem6Gpa ?? null,
    overallCgpa: st.overallCgpa || 0,
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
    totalLectures: st.totalLectures || 0,
    attendedLectures: st.attendedLectures || 0,
    attendancePercentage: st.attendancePercentage || 0,
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
    experienceYears: Number(row.experienceYears) || 0,
    photo: row.photo || '',
    allocatedSubjects: safeParse(row.allocatedSubjects, []),
    isClassTeacherOf: safeParse(row.isClassTeacherOf, undefined),
    weeklyWorkloadHours: Number(row.weeklyWorkloadHours) || 0,
    isActive: Boolean(row.isActive),
  };
}

export function mapFacultyToSql(fac: Faculty): any {
  return {
    id: fac.id,
    facultyId: fac.facultyId,
    fullName: fac.fullName,
    email: fac.email,
    mobile: fac.mobile || '',
    departmentId: fac.departmentId || '',
    departmentName: fac.departmentName || '',
    designation: fac.designation || 'Assistant Professor',
    qualification: fac.qualification || '',
    experienceYears: fac.experienceYears || 0,
    photo: fac.photo || '',
    allocatedSubjects: JSON.stringify(fac.allocatedSubjects || []),
    isClassTeacherOf: fac.isClassTeacherOf ? JSON.stringify(fac.isClassTeacherOf) : null,
    weeklyWorkloadHours: fac.weeklyWorkloadHours || 0,
    isActive: fac.isActive !== undefined ? fac.isActive : true,
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
    `);

    // 1. Users
    const existingUsers = await db.select().from(schema.users);
    if (existingUsers.length === 0) {
      const usersToInsert = (seedData?.users && seedData.users.length > 0) ? seedData.users : INITIAL_USERS;
      console.log(`[Cloud SQL] Seeding ${usersToInsert.length} initial users...`);
      for (const u of usersToInsert) {
        await db.insert(schema.users).values({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          departmentId: u.departmentId || null,
          departmentName: u.departmentName || null,
          phone: u.phone || null,
          avatar: u.avatar || null,
          password: u.password || null,
          isActive: u.isActive !== undefined ? u.isActive : true,
          lastLogin: u.lastLogin || null,
          createdAt: u.createdAt || new Date().toISOString().substring(0, 10),
        }).onConflictDoNothing();
      }
    }

    // 2. Programs
    const existingPrograms = await db.select().from(schema.programs);
    if (existingPrograms.length === 0) {
      const progsToInsert = (seedData?.programs && seedData.programs.length > 0) ? seedData.programs : INITIAL_PROGRAMS;
      for (const p of progsToInsert) {
        await db.insert(schema.programs).values({
          id: p.id,
          code: p.code,
          name: p.name,
          status: p.status || 'Active',
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
        }).onConflictDoNothing();
      }
    }

    // 3. Departments
    const existingDepts = await db.select().from(schema.departments);
    if (existingDepts.length === 0) {
      const deptsToInsert = (seedData?.departments && seedData.departments.length > 0) ? seedData.departments : INITIAL_DEPARTMENTS;
      for (const d of deptsToInsert) {
        await db.insert(schema.departments).values({
          id: d.id,
          code: d.code,
          name: d.name,
          hodId: d.hodId || null,
          hodName: d.hodName || null,
          establishedYear: d.establishedYear || 2010,
          totalStudents: d.totalStudents || 0,
          totalFaculty: d.totalFaculty || 0,
          avgAttendancePct: d.avgAttendancePct || 0,
        }).onConflictDoNothing();
      }
    }

    // 4. Courses
    const existingCourses = await db.select().from(schema.courses);
    if (existingCourses.length === 0) {
      const coursesToInsert = (seedData?.courses && seedData.courses.length > 0) ? seedData.courses : INITIAL_COURSES;
      for (const c of coursesToInsert) {
        await db.insert(schema.courses).values({
          id: c.id,
          programId: c.programId,
          programName: c.programName || null,
          courseName: c.courseName,
          courseCode: c.courseCode,
          durationYears: c.durationYears || 3,
          totalSemesters: c.totalSemesters || 6,
          status: c.status || 'Active',
          departmentId: c.departmentId || null,
          code: c.code || c.courseCode,
          name: c.name || c.courseName,
          createdAt: c.createdAt || new Date().toISOString(),
          updatedAt: c.updatedAt || new Date().toISOString(),
        }).onConflictDoNothing();
      }
    }

    // 5. Subjects
    const existingSubjects = await db.select().from(schema.subjects);
    if (existingSubjects.length === 0) {
      const subjectsToInsert = (seedData?.subjects && seedData.subjects.length > 0) ? seedData.subjects : INITIAL_SUBJECTS;
      for (const s of subjectsToInsert) {
        await db.insert(schema.subjects).values({
          id: s.id,
          code: s.code,
          name: s.name,
          departmentId: s.departmentId,
          programId: s.programId || null,
          programName: s.programName || null,
          courseId: s.courseId || null,
          courseCode: s.courseCode || null,
          semester: s.semester,
          type: s.type,
          credits: s.credits,
          assignedFacultyId: s.assignedFacultyId || null,
          assignedFacultyName: s.assignedFacultyName || null,
          status: s.status || 'Active',
        }).onConflictDoNothing();
      }
    }

    // 6. Students
    const existingStudents = await db.select().from(schema.students);
    if (existingStudents.length === 0) {
      const studentsToInsert = (seedData?.students && seedData.students.length > 0) ? seedData.students : INITIAL_STUDENTS;
      for (const st of studentsToInsert) {
        await db.insert(schema.students).values(mapStudentToSql(st)).onConflictDoNothing();
      }
    }

    // 7. Faculty
    const existingFac = await db.select().from(schema.facultyList);
    if (existingFac.length === 0) {
      const facToInsert = (seedData?.facultyList && seedData.facultyList.length > 0) ? seedData.facultyList : INITIAL_FACULTY;
      for (const f of facToInsert) {
        await db.insert(schema.facultyList).values(mapFacultyToSql(f)).onConflictDoNothing();
      }
    }

    // 8. Timetable
    const existingTimetable = await db.select().from(schema.timetable);
    if (existingTimetable.length === 0) {
      const ttToInsert = (seedData?.timetable && seedData.timetable.length > 0) ? seedData.timetable : INITIAL_TIMETABLE;
      for (const t of ttToInsert) {
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
        }).onConflictDoNothing();
      }
    }

    // 9. Sessions & Attendance Records
    const existingSessions = await db.select().from(schema.sessions);
    if (existingSessions.length === 0) {
      const sessToInsert = (seedData?.sessions && seedData.sessions.length > 0) ? seedData.sessions : INITIAL_SESSIONS;
      for (const s of sessToInsert) {
        await db.insert(schema.sessions).values({
          id: s.id,
          date: s.date,
          departmentId: s.departmentId,
          programId: s.programId || null,
          programName: s.programName || null,
          courseId: s.courseId || null,
          courseName: s.courseName || null,
          semester: s.semester,
          division: s.division,
          subjectId: s.subjectId,
          subjectName: s.subjectName,
          facultyId: s.facultyId,
          facultyName: s.facultyName,
          sessionType: s.sessionType,
          timeSlot: s.timeSlot,
          classroom: s.classroom,
          isLocked: s.isLocked || false,
          totalStudents: s.totalStudents || 0,
          presentCount: s.presentCount || 0,
          absentCount: s.absentCount || 0,
          lateCount: s.lateCount || 0,
          onLeaveCount: s.onLeaveCount || 0,
        }).onConflictDoNothing();
      }
    }

    const existingAttRecs = await db.select().from(schema.attendanceRecords);
    if (existingAttRecs.length === 0) {
      const recsToInsert = (seedData?.attendanceRecords && seedData.attendanceRecords.length > 0) ? seedData.attendanceRecords : INITIAL_ATTENDANCE_RECORDS;
      for (const r of recsToInsert) {
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
        }).onConflictDoNothing();
      }
    }

    // 10. Leaves & Corrections
    const existingLeaves = await db.select().from(schema.leaves);
    if (existingLeaves.length === 0) {
      const leavesToInsert = (seedData?.leaves && seedData.leaves.length > 0) ? seedData.leaves : INITIAL_LEAVES;
      for (const l of leavesToInsert) {
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
          createdAt: l.createdAt || null,
        }).onConflictDoNothing();
      }
    }

    // 11. Results
    const existingResults = await db.select().from(schema.results);
    if (existingResults.length === 0) {
      const resultsToInsert = (seedData?.results && seedData.results.length > 0) ? seedData.results : INITIAL_RESULTS;
      for (const res of resultsToInsert) {
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
        }).onConflictDoNothing();
      }
    }

    // 12. Settings
    const existingSettings = await db.select().from(schema.settings).where(eq(schema.settings.id, 'college_settings'));
    if (existingSettings.length === 0) {
      const settingsToInsert = (seedData?.settings && seedData.settings.minimumAttendancePct) ? seedData.settings : INITIAL_SETTINGS;
      await db.insert(schema.settings).values({
        id: 'college_settings',
        data: JSON.stringify(settingsToInsert),
      }).onConflictDoNothing();
    }

    // 13. ATKT Records
    const existingAtkt = await db.select().from(schema.atktRecords);
    if (existingAtkt.length === 0) {
      const atktToInsert = (seedData?.atktRecords && seedData.atktRecords.length > 0) ? seedData.atktRecords : INITIAL_ATKT_RECORDS;
      for (const a of atktToInsert) {
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
          originalInternalMarks: a.originalInternalMarks || null,
          originalExternalMarks: a.originalExternalMarks || null,
          attemptsCount: a.attemptsCount || 1,
          status: a.status,
          examFeePaid: a.examFeePaid || false,
          examFeeAmount: a.examFeeAmount || 0,
          reExamDate: a.reExamDate || null,
          reExamMarksObtained: a.reExamMarksObtained || null,
          clearedAt: a.clearedAt || null,
          remarks: a.remarks || null,
        }).onConflictDoNothing();
      }
    }

    // 14. Academic Calendar Events
    const existingEvents = await db.select().from(schema.academicEvents);
    if (existingEvents.length === 0) {
      const eventsToInsert = (seedData?.academicEvents && seedData.academicEvents.length > 0) ? seedData.academicEvents : INITIAL_ACADEMIC_EVENTS;
      for (const evt of eventsToInsert) {
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
          createdBy: evt.createdBy || 'Admin',
          createdAt: evt.createdAt || new Date().toISOString().substring(0, 10),
        }).onConflictDoNothing();
      }
    }

    // 15. Audit Logs
    const existingLogs = await db.select().from(schema.auditLogs);
    if (existingLogs.length === 0) {
      const logsToInsert = (seedData?.auditLogs && seedData.auditLogs.length > 0) ? seedData.auditLogs : INITIAL_AUDIT_LOGS;
      for (const log of logsToInsert) {
        await db.insert(schema.auditLogs).values({
          id: log.id,
          timestamp: log.timestamp,
          actorName: log.actorName || null,
          actorRole: log.actorRole || null,
          action: log.action,
          category: log.category,
          details: log.details,
          ipAddress: log.ipAddress || null,
        }).onConflictDoNothing();
      }
    }

    // 16. Chat Conversations & Messages
    const existingChatConvs = await db.select().from(schema.chatConversations);
    if (existingChatConvs.length === 0) {
      const convsToInsert = (seedData?.chatConversations && seedData.chatConversations.length > 0) ? seedData.chatConversations : INITIAL_CHAT_CONVERSATIONS;
      for (const conv of convsToInsert) {
        await db.insert(schema.chatConversations).values({
          id: conv.id,
          participantId: conv.participantId,
          participantName: conv.participantName,
          participantRole: conv.participantRole,
          participantAvatar: conv.participantAvatar || null,
          participantStatus: conv.participantStatus || 'Offline',
          lastMessage: conv.lastMessage || null,
          lastMessageTime: conv.lastMessageTime || null,
          unreadCount: conv.unreadCount || 0,
        }).onConflictDoNothing();
      }
    }

    const existingChatMsgs = await db.select().from(schema.chatMessages);
    if (existingChatMsgs.length === 0) {
      const msgsToInsert = (seedData?.chatMessages && seedData.chatMessages.length > 0) ? seedData.chatMessages : INITIAL_CHAT_MESSAGES;
      for (const msg of msgsToInsert) {
        await db.insert(schema.chatMessages).values({
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          senderName: msg.senderName,
          senderRole: msg.senderRole,
          senderAvatar: msg.senderAvatar || null,
          text: msg.text,
          attachmentUrl: msg.attachmentUrl || null,
          attachmentType: msg.attachmentType || null,
          createdAt: msg.createdAt,
          isRead: msg.isRead || false,
        }).onConflictDoNothing();
      }
    }

    // 17. Import Logs
    const existingImportLogs = await db.select().from(schema.importLogs);
    if (existingImportLogs.length === 0) {
      const importsToInsert = (seedData?.importLogs && seedData.importLogs.length > 0) ? seedData.importLogs : INITIAL_IMPORT_LOGS;
      for (const imp of importsToInsert) {
        await db.insert(schema.importLogs).values({
          id: imp.id,
          fileName: imp.fileName,
          uploadedAt: imp.uploadedAt,
          uploadedBy: imp.uploadedBy,
          totalRecords: imp.totalRecords || 0,
          importedCount: imp.importedCount || 0,
          updatedCount: imp.updatedCount || 0,
          skippedCount: imp.skippedCount || 0,
          status: imp.status,
        }).onConflictDoNothing();
      }
    }

    // 18. Promotion History
    const existingPromos = await db.select().from(schema.promotionHistory);
    if (existingPromos.length === 0) {
      const promosToInsert = (seedData?.promotionHistory && seedData.promotionHistory.length > 0) ? seedData.promotionHistory : INITIAL_PROMOTION_HISTORY;
      for (const promo of promosToInsert) {
        await db.insert(schema.promotionHistory).values({
          id: promo.id,
          batchName: promo.batchName,
          promotedAt: promo.promotedAt,
          promotedBy: promo.promotedBy,
          program: promo.program,
          course: promo.course,
          fromSemester: promo.fromSemester,
          toSemester: promo.toSemester,
          totalStudentsPromoted: promo.totalStudentsPromoted || 0,
          status: promo.status,
          records: promo.records ? JSON.stringify(promo.records) : null,
        }).onConflictDoNothing();
      }
    }

    // 19. Class Teacher Assignments
    const existingClassTeachers = await db.select().from(schema.classTeacherAssignments);
    if (existingClassTeachers.length === 0) {
      const ctToInsert = (seedData?.classTeachers && seedData.classTeachers.length > 0) ? seedData.classTeachers : INITIAL_CLASS_TEACHERS;
      for (const ct of ctToInsert) {
        await db.insert(schema.classTeacherAssignments).values({
          id: ct.id,
          departmentId: ct.departmentId,
          departmentName: ct.departmentName,
          courseId: ct.courseId,
          courseCode: ct.courseCode,
          courseName: ct.courseName,
          academicYear: ct.academicYear,
          semester: ct.semester,
          division: ct.division,
          classTeacherId: ct.classTeacherId,
          classTeacherName: ct.classTeacherName,
          assistantTeacherId: ct.assistantTeacherId || null,
          assistantTeacherName: ct.assistantTeacherName || null,
          classroom: ct.classroom,
          academicSession: ct.academicSession,
          assignedAt: ct.assignedAt,
          assignedBy: ct.assignedBy,
        }).onConflictDoNothing();
      }
    }

    console.log('[Cloud SQL] SQL Database tables initialized and ready.');
  } catch (err) {
    console.error('[Cloud SQL] Database initialization notice:', err);
  }
}

// -------------------------------------------------------------
// USER OPERATIONS
// -------------------------------------------------------------
export async function getAllUsers(): Promise<User[]> {
  try {
    const rows = await db.select().from(schema.users);
    return rows.map((r) => ({
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
    return INITIAL_USERS;
  }
}

export async function insertUser(user: User): Promise<User> {
  await db.insert(schema.users).values({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId || null,
    departmentName: user.departmentName || null,
    phone: user.phone || null,
    avatar: user.avatar || null,
    password: user.password || null,
    isActive: user.isActive !== undefined ? user.isActive : true,
    lastLogin: user.lastLogin || null,
    createdAt: user.createdAt || new Date().toISOString().substring(0, 10),
  });
  return user;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.role !== undefined) updateData.role = updates.role;
  if (updates.departmentId !== undefined) updateData.departmentId = updates.departmentId;
  if (updates.departmentName !== undefined) updateData.departmentName = updates.departmentName;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
  if (updates.password !== undefined) updateData.password = updates.password;
  if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
  if (updates.lastLogin !== undefined) updateData.lastLogin = updates.lastLogin;

  await db.update(schema.users).set(updateData).where(eq(schema.users.id, id));
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
    return rows.map(mapSqlToStudent);
  } catch (err) {
    console.error('SQL getAllStudents error:', err);
    return INITIAL_STUDENTS;
  }
}

export async function insertStudent(st: Student360Profile): Promise<Student360Profile> {
  await db.insert(schema.students).values(mapStudentToSql(st));
  return st;
}

export async function upsertStudent(st: Student360Profile): Promise<Student360Profile> {
  const existing = await db.select().from(schema.students).where(eq(schema.students.id, st.id));
  if (existing.length > 0) {
    await db.update(schema.students).set(mapStudentToSql(st)).where(eq(schema.students.id, st.id));
  } else {
    await db.insert(schema.students).values(mapStudentToSql(st));
  }
  return st;
}

export async function updateStudent(id: string, updates: Partial<Student360Profile>): Promise<Student360Profile | null> {
  const existing = await db.select().from(schema.students).where(or(eq(schema.students.id, id), eq(schema.students.studentId, id)));
  if (existing.length === 0) return null;
  const current = mapSqlToStudent(existing[0]);
  const merged: Student360Profile = { ...current, ...updates };
  await db.update(schema.students).set(mapStudentToSql(merged)).where(or(eq(schema.students.id, id), eq(schema.students.studentId, id)));
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
    return INITIAL_FACULTY;
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
    return INITIAL_PROGRAMS;
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
    return INITIAL_DEPARTMENTS;
  }
}

export async function insertDepartment(d: Department): Promise<Department> {
  await db.insert(schema.departments).values({
    id: d.id,
    code: d.code,
    name: d.name,
    hodId: d.hodId || null,
    hodName: d.hodName || null,
    establishedYear: d.establishedYear || 2010,
    totalStudents: d.totalStudents || 0,
    totalFaculty: d.totalFaculty || 0,
    avgAttendancePct: d.avgAttendancePct || 0,
  });
  return d;
}

export async function updateDepartment(id: string, updates: Partial<Department>): Promise<Department | null> {
  await db.update(schema.departments).set(updates as any).where(eq(schema.departments.id, id));
  const rows = await db.select().from(schema.departments).where(eq(schema.departments.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    hodId: r.hodId || '',
    hodName: r.hodName || '',
    establishedYear: Number(r.establishedYear) || 2010,
    totalStudents: Number(r.totalStudents) || 0,
    totalFaculty: Number(r.totalFaculty) || 0,
    avgAttendancePct: Number(r.avgAttendancePct) || 0,
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
    return INITIAL_COURSES;
  }
}

export async function insertCourse(c: Course): Promise<Course> {
  await db.insert(schema.courses).values({
    id: c.id,
    programId: c.programId,
    programName: c.programName || null,
    courseName: c.courseName,
    courseCode: c.courseCode,
    durationYears: c.durationYears || 3,
    totalSemesters: c.totalSemesters || 6,
    status: c.status || 'Active',
    departmentId: c.departmentId || null,
    code: c.code || c.courseCode,
    name: c.name || c.courseName,
    createdAt: c.createdAt || new Date().toISOString(),
    updatedAt: c.updatedAt || new Date().toISOString(),
  });
  return c;
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
  await db.update(schema.courses).set({
    ...updates,
    updatedAt: new Date().toISOString(),
  } as any).where(eq(schema.courses.id, id));
  const rows = await db.select().from(schema.courses).where(eq(schema.courses.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
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
      semester: Number(r.semester),
      type: r.type as any,
      credits: Number(r.credits),
      assignedFacultyId: r.assignedFacultyId || '',
      assignedFacultyName: r.assignedFacultyName || '',
      status: (r.status as any) || 'Active',
    }));
  } catch (err) {
    console.error('SQL getAllSubjects error:', err);
    return INITIAL_SUBJECTS;
  }
}

export async function insertSubject(s: Subject): Promise<Subject> {
  await db.insert(schema.subjects).values({
    id: s.id,
    code: s.code,
    name: s.name,
    departmentId: s.departmentId,
    programId: s.programId || null,
    programName: s.programName || null,
    courseId: s.courseId || null,
    courseCode: s.courseCode || null,
    semester: s.semester,
    type: s.type,
    credits: s.credits,
    assignedFacultyId: s.assignedFacultyId || null,
    assignedFacultyName: s.assignedFacultyName || null,
    status: s.status || 'Active',
  });
  return s;
}

export async function updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | null> {
  await db.update(schema.subjects).set(updates as any).where(eq(schema.subjects.id, id));
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
    semester: Number(r.semester),
    type: r.type as any,
    credits: Number(r.credits),
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
    return INITIAL_TIMETABLE;
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
    return INITIAL_SESSIONS;
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
    return INITIAL_ATTENDANCE_RECORDS;
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
    return INITIAL_LEAVES;
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
    return INITIAL_RESULTS;
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
    return INITIAL_CORRECTIONS;
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
    return INITIAL_NOTICES;
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
    return INITIAL_DEPARTMENT_ACTIVITIES;
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
    return INITIAL_ATKT_RECORDS;
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
    return INITIAL_ACADEMIC_EVENTS;
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
    return INITIAL_NOTIFICATIONS;
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
    return INITIAL_AUDIT_LOGS;
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
    return INITIAL_CHAT_CONVERSATIONS;
  }
}

export async function insertChatConversation(c: ChatConversation): Promise<ChatConversation> {
  await db.insert(schema.chatConversations).values({
    id: c.id,
    participantId: c.participantId,
    participantName: c.participantName,
    participantRole: c.participantRole,
    participantAvatar: c.participantAvatar || null,
    participantStatus: c.participantStatus || 'Offline',
    lastMessage: c.lastMessage || null,
    lastMessageTime: c.lastMessageTime || null,
    unreadCount: c.unreadCount || 0,
  });
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
    return INITIAL_CHAT_MESSAGES;
  }
}

export async function insertChatMessage(msg: ChatMessage): Promise<ChatMessage> {
  await db.insert(schema.chatMessages).values({
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderRole: msg.senderRole,
    senderAvatar: msg.senderAvatar || null,
    text: msg.text,
    attachmentUrl: msg.attachmentUrl || null,
    attachmentType: msg.attachmentType || null,
    createdAt: msg.createdAt,
    isRead: msg.isRead || false,
  });

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
    return INITIAL_IMPORT_LOGS;
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
    return INITIAL_PROMOTION_HISTORY;
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
    return INITIAL_CLASS_TEACHERS;
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

