import React, { useState, useEffect } from 'react';
import {
  User,
  Role,
  Program,
  AcademicYearItem,
  Student360Profile,
  Faculty,
  Department,
  Course,
  Subject,
  TimetableSlot,
  AttendanceSession,
  LeaveRequest,
  ERPNotification,
  AuditLog,
  CollegeSettings,
  TimetableConflict,
  NoticeItem,
  ChatConversation,
  ChatMessage,
  ImportHistoryLog,
  PromotionBatch,
  ClassTeacherAssignment,
  DepartmentActivity,
  AcademicCalendarEvent,
} from './types';

import {
  INITIAL_USERS,
  INITIAL_PROGRAMS,
  INITIAL_DEPARTMENTS,
  INITIAL_COURSES,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  INITIAL_FACULTY,
  INITIAL_TIMETABLE,
  INITIAL_SESSIONS,
  INITIAL_LEAVES,
  INITIAL_RESULTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
  INITIAL_NOTICES,
  INITIAL_CHAT_CONVERSATIONS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_IMPORT_LOGS,
  INITIAL_PROMOTION_HISTORY,
  INITIAL_CLASS_TEACHERS,
  INITIAL_DEPARTMENT_ACTIVITIES,
  INITIAL_ACADEMIC_EVENTS,
} from './data/mockData';

import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { RoleDashboard } from './components/RoleDashboards/RoleDashboard';
import { Student360Directory } from './components/Student360Directory';
import { Student360Modal } from './components/Student360Modal';
import { AttendanceEngine } from './components/AttendanceEngine';
import { TimetableGrid } from './components/TimetableGrid';
import { AcademicCalendarView } from './components/AcademicCalendarView';
import { FacultyDirectory } from './components/FacultyDirectory';
import { DepartmentsView } from './components/DepartmentsView';
import { LeaveManagement } from './components/LeaveManagement';
import { ResultsMatrix } from './components/ResultsMatrix';
import { ReportsExporter } from './components/ReportsExporter';
import { AIAssistantModal } from './components/AIAssistantModal';
import { SettingsModal } from './components/SettingsModal';
import { AuditLogViewer } from './components/AuditLogViewer';
import { DefaulterAnalytics } from './components/DefaulterAnalytics';
import { BulkUploadModule } from './components/BulkUploadModule';
import { StudentPromotionWizard } from './components/StudentPromotionWizard';
import { NoticeBoard } from './components/NoticeBoard';
import { ChatModule } from './components/ChatModule';
import { NotificationCenter } from './components/NotificationCenter';
import { ATKTManagementModule } from './components/ATKTManagementModule';
import { AIExtendedModule } from './components/AIExtendedModule';
import { LoginPage } from './components/LoginPage';
import { ShieldAlert } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const localAuth = localStorage.getItem('ckt_is_authenticated');
      if (localAuth === 'true') return true;
      const sessionAuth = sessionStorage.getItem('ckt_is_authenticated');
      if (sessionAuth === 'true') return true;
    } catch (e) {}
    return false;
  });

  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const localUser = localStorage.getItem('ckt_auth_user');
      if (localUser) {
        const parsed = JSON.parse(localUser);
        if (parsed && parsed.id) return parsed;
      }
      const sessionUser = sessionStorage.getItem('ckt_auth_user');
      if (sessionUser) {
        const parsed = JSON.parse(sessionUser);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {}
    return INITIAL_USERS[0];
  });

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // ERP State Data (SQL Backend API is Single Source of Truth)
  const [programs, setPrograms] = useState<Program[]>(INITIAL_PROGRAMS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [academicYears, setAcademicYears] = useState<AcademicYearItem[]>(INITIAL_ACADEMIC_YEARS);
  const [students, setStudents] = useState<Student360Profile[]>(INITIAL_STUDENTS);
  const [facultyList, setFacultyList] = useState<Faculty[]>(INITIAL_FACULTY);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(INITIAL_TIMETABLE);
  const [conflicts, setConflicts] = useState<TimetableConflict[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>(INITIAL_SESSIONS);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [results, setResults] = useState(INITIAL_RESULTS);
  const [notifications, setNotifications] = useState<ERPNotification[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState<CollegeSettings>(INITIAL_SETTINGS);

  // New Feature States
  const [notices, setNotices] = useState<NoticeItem[]>(INITIAL_NOTICES);
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>(INITIAL_CHAT_CONVERSATIONS);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_CHAT_MESSAGES);
  const [importLogs, setImportLogs] = useState<ImportHistoryLog[]>(INITIAL_IMPORT_LOGS);
  const [promotionHistory, setPromotionHistory] = useState<PromotionBatch[]>(INITIAL_PROMOTION_HISTORY);
  const [classTeacherAssignments, setClassTeacherAssignments] = useState<ClassTeacherAssignment[]>(INITIAL_CLASS_TEACHERS);
  const [departmentActivities, setDepartmentActivities] = useState<DepartmentActivity[]>(INITIAL_DEPARTMENT_ACTIVITIES);
  const [academicEvents, setAcademicEvents] = useState<AcademicCalendarEvent[]>(INITIAL_ACADEMIC_EVENTS);

  // Modals state
  const [selected360Student, setSelected360Student] = useState<Student360Profile | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  // Load backend state on mount from Cloud SQL
  const refreshAllData = async () => {
    try {
      const [
        usrRes,
        progRes,
        crsRes,
        stuRes,
        facRes,
        depRes,
        subRes,
        ttRes,
        confRes,
        sessRes,
        leaveRes,
        resRes,
        noticesRes,
        actRes,
        logRes,
        notifRes,
        setRes,
        acadRes,
        chatConvRes,
        chatMsgRes,
        impLogRes,
        promoHistRes,
        classTeachRes,
      ] = await Promise.all([
        fetch('/api/users').then((r) => r.json()).catch(() => null),
        fetch('/api/programs').then((r) => r.json()).catch(() => null),
        fetch('/api/courses').then((r) => r.json()).catch(() => null),
        fetch('/api/students').then((r) => r.json()).catch(() => null),
        fetch('/api/faculty').then((r) => r.json()).catch(() => null),
        fetch('/api/departments').then((r) => r.json()).catch(() => null),
        fetch('/api/subjects').then((r) => r.json()).catch(() => null),
        fetch('/api/timetable').then((r) => r.json()).catch(() => null),
        fetch('/api/timetable/conflicts').then((r) => r.json()).catch(() => null),
        fetch('/api/attendance/sessions').then((r) => r.json()).catch(() => null),
        fetch('/api/leaves').then((r) => r.json()).catch(() => null),
        fetch('/api/results').then((r) => r.json()).catch(() => null),
        fetch('/api/notices').then((r) => r.json()).catch(() => null),
        fetch('/api/department-activities').then((r) => r.json()).catch(() => null),
        fetch('/api/audit-logs').then((r) => r.json()).catch(() => null),
        fetch('/api/notifications').then((r) => r.json()).catch(() => null),
        fetch('/api/settings').then((r) => r.json()).catch(() => null),
        fetch('/api/academic-calendar').then((r) => r.json()).catch(() => null),
        fetch('/api/chat/conversations').then((r) => r.json()).catch(() => null),
        fetch('/api/chat/messages').then((r) => r.json()).catch(() => null),
        fetch('/api/imports/logs').then((r) => r.json()).catch(() => null),
        fetch('/api/promotions/history').then((r) => r.json()).catch(() => null),
        fetch('/api/class-teachers').then((r) => r.json()).catch(() => null),
      ]);

      if (Array.isArray(usrRes) && usrRes.length > 0) setUsersList(usrRes);
      if (Array.isArray(progRes)) setPrograms(progRes);
      if (Array.isArray(crsRes)) setCourses(crsRes);
      if (Array.isArray(stuRes)) setStudents(stuRes);
      if (Array.isArray(facRes)) setFacultyList(facRes);
      if (Array.isArray(depRes)) setDepartments(depRes);
      if (Array.isArray(subRes)) setSubjects(subRes);
      if (Array.isArray(ttRes)) setTimetable(ttRes);
      if (Array.isArray(confRes)) setConflicts(confRes);
      if (Array.isArray(sessRes)) setSessions(sessRes);
      if (Array.isArray(leaveRes)) setLeaves(leaveRes);
      if (Array.isArray(resRes)) setResults(resRes);
      if (Array.isArray(noticesRes)) setNotices(noticesRes);
      if (Array.isArray(actRes)) setDepartmentActivities(actRes);
      if (Array.isArray(logRes)) setAuditLogs(logRes);
      if (Array.isArray(notifRes)) setNotifications(notifRes);
      if (setRes && setRes.minimumAttendancePct) setSettings(setRes);
      if (Array.isArray(acadRes)) setAcademicEvents(acadRes);
      if (Array.isArray(chatConvRes)) setChatConversations(chatConvRes);
      if (chatMsgRes && typeof chatMsgRes === 'object') setChatMessages(chatMsgRes);
      if (Array.isArray(impLogRes)) setImportLogs(impLogRes);
      if (Array.isArray(promoHistRes)) setPromotionHistory(promoHistRes);
      if (Array.isArray(classTeachRes)) setClassTeacherAssignments(classTeachRes);
    } catch (err) {
      console.log('Error refreshing data from SQL backend:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
    const timer = setInterval(() => {
      refreshAllData();
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Login Success Handler with Keep-Me-Logged-In support
  const handleLoginSuccess = (loggedUser: User, rememberMe: boolean = true) => {
    setCurrentUser(loggedUser);
    setIsAuthenticated(true);
    try {
      if (rememberMe) {
        localStorage.setItem('ckt_auth_user', JSON.stringify(loggedUser));
        localStorage.setItem('ckt_is_authenticated', 'true');
        localStorage.setItem('ckt_remember_me', 'true');
        sessionStorage.setItem('ckt_auth_user', JSON.stringify(loggedUser));
        sessionStorage.setItem('ckt_is_authenticated', 'true');
      } else {
        sessionStorage.setItem('ckt_auth_user', JSON.stringify(loggedUser));
        sessionStorage.setItem('ckt_is_authenticated', 'true');
        localStorage.removeItem('ckt_auth_user');
        localStorage.removeItem('ckt_is_authenticated');
        localStorage.setItem('ckt_remember_me', 'false');
      }
    } catch (e) {}
  };

  // Logout Handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('ckt_auth_user');
      localStorage.removeItem('ckt_is_authenticated');
      localStorage.removeItem('ckt_remember_me');
      sessionStorage.removeItem('ckt_auth_user');
      sessionStorage.removeItem('ckt_is_authenticated');
    } catch (e) {}
    setActiveTab('dashboard');
  };

  // Sync auth user changes when logged in
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      try {
        const remember = localStorage.getItem('ckt_remember_me') !== 'false';
        if (remember) {
          localStorage.setItem('ckt_auth_user', JSON.stringify(currentUser));
        } else {
          sessionStorage.setItem('ckt_auth_user', JSON.stringify(currentUser));
        }
      } catch (e) {}
    }
  }, [currentUser, isAuthenticated]);

  // Handle Role Switch
  const handleRoleChange = async (role: Role) => {
    const foundUser = usersList.find((u) => u.role === role) || {
      id: `u-${role.toLowerCase().replace(/\s+/g, '')}`,
      name: `User (${role})`,
      email: `${role.toLowerCase().replace(/\s+/g, '')}@cktcollege.edu.in`,
      role,
      phone: '+91 98000 00000',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isActive: true,
      createdAt: '2025-01-01',
    };

    setCurrentUser(foundUser as User);

    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: foundUser.email, role }),
      });
    } catch (e) {
      // Ignore offline error
    }
  };

  // Student Admission, Update, and Delete Handlers
  const handleAdmitStudent = async (newStudent: Partial<Student360Profile>) => {
    const ns = newStudent as any;
    const docId = newStudent.id || `stu-${Date.now()}`;
    const fullStudent: Student360Profile = {
      id: docId,
      studentId: newStudent.studentId || `STU${Date.now().toString().slice(-6)}`,
      fullName: newStudent.fullName || 'Student Name',
      rollNumber: newStudent.rollNumber || '01',
      departmentId: newStudent.departmentId || 'dept-af',
      departmentName: newStudent.departmentName || 'Department of Accounting & Finance',
      programId: newStudent.programId || 'prog-ug',
      course: newStudent.course || 'B.Com (Accounting & Finance)',
      courseId: newStudent.courseId || 'course-baf',
      academicYear: newStudent.academicYear || '2025-2026',
      semester: newStudent.semester || 1,
      division: newStudent.division || 'A',
      email: newStudent.email || `student.${Date.now()}@cktcollege.edu.in`,
      mobile: ns.mobile || '+91 98000 00000',
      gender: newStudent.gender || 'Male',
      dateOfBirth: ns.dateOfBirth || '2005-01-01',
      bloodGroup: newStudent.bloodGroup || 'O+',
      category: newStudent.category || 'OPEN',
      fatherName: newStudent.fatherName || 'Father Name',
      motherName: newStudent.motherName || 'Mother Name',
      parentMobile: newStudent.parentMobile || '+91 98000 00000',
      parentEmail: newStudent.parentEmail || 'parent@example.com',
      address: ns.address || 'Panvel, Navi Mumbai',
      attendancePercentage: 100,
      totalLectures: 0,
      attendedLectures: 0,
      sem1Gpa: 0, sem2Gpa: 0, sem3Gpa: 0, sem4Gpa: 0, sem5Gpa: 0, sem6Gpa: 0, overallCgpa: 0,
      sscPercentage: ns.sscPercentage || 85,
      hscPercentage: ns.hscPercentage || 85,
      technicalSkills: [], programmingLanguages: [], certifications: [], internships: [], projects: [], sportsAndExtra: [],
      ...(newStudent as any),
    };

    const studentUser: User = {
      id: `u-${fullStudent.id}`,
      name: fullStudent.fullName,
      email: fullStudent.email,
      role: 'Student',
      departmentId: fullStudent.departmentId,
      departmentName: fullStudent.departmentName,
      phone: (fullStudent as any).personalMobile || (fullStudent as any).mobile || ns.mobile || '+91 98000 00000',
      avatar: fullStudent.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      password: ns.password || 'StudentPassword@123',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setStudents((prev) => [fullStudent, ...prev.filter((s) => s.id !== fullStudent.id)]);
    setUsersList((prev) => [studentUser, ...prev.filter((u) => u.email.toLowerCase() !== studentUser.email.toLowerCase())]);

    try {
      await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullStudent),
      });
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentUser),
      });
    } catch (err) {
      console.error('Error admitting student:', err);
    }
  };

  const handleUpdateStudent = async (id: string, updatedStudent: Partial<Student360Profile>): Promise<void> => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? ({ ...s, ...updatedStudent } as Student360Profile) : s))
    );
    if (selected360Student?.id === id) {
      setSelected360Student((prev) => (prev ? ({ ...prev, ...updatedStudent } as Student360Profile) : null));
    }

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent),
      });
      if (!res.ok) {
        throw new Error(`Failed to update student: ${res.statusText}`);
      }
    } catch (err) {
      console.error('Error updating student profile in DB:', err);
      throw err;
    }
  };

  const handleDeleteStudent = async (id: string): Promise<void> => {
    setStudents((prev) => prev.filter((s) => s.id !== id && s.studentId !== id));
    if (selected360Student?.id === id || selected360Student?.studentId === id) {
      setSelected360Student(null);
    }
    // Also remove from user login list if exists
    setUsersList((prev) => prev.filter((u) => u.id !== `u-${id}` && u.linkedStudentId !== id));

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error(`Failed to delete student: ${res.statusText}`);
      }
    } catch (err) {
      console.error('Error deleting student from DB:', err);
      throw err;
    }
  };

  // Faculty Handlers
  const handleAddFaculty = async (newFac: Faculty) => {
    setFacultyList((prev) => [newFac, ...prev.filter((f) => f.id !== newFac.id)]);
    const facUser: User = {
      id: `u-${newFac.id}`,
      name: newFac.fullName,
      email: newFac.email,
      role: 'Faculty',
      departmentId: newFac.departmentId,
      departmentName: newFac.departmentName,
      phone: newFac.mobile,
      avatar: newFac.photo,
      password: 'FacultyPassword@123',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsersList((prev) => [facUser, ...prev.filter((u) => u.email.toLowerCase() !== facUser.email.toLowerCase())]);

    try {
      await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFac),
      });
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facUser),
      });
    } catch (err) {
      console.error('Error adding faculty:', err);
    }
  };

  const handleUpdateFaculty = async (id: string, updated: Partial<Faculty>) => {
    setFacultyList((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)));
    try {
      await fetch(`/api/faculty/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Error updating faculty:', err);
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    setFacultyList((prev) => prev.filter((f) => f.id !== id));
    try {
      await fetch(`/api/faculty/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting faculty:', err);
    }
  };

  // Department Handlers
  const handleAddDepartment = async (dept: Department) => {
    setDepartments((prev) => [...prev, dept]);
    try {
      await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dept),
      });
    } catch (err) {
      console.error('Error adding department:', err);
    }
  };

  const handleUpdateDepartment = async (id: string, updated: Partial<Department>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated } : d)));
    try {
      await fetch(`/api/departments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Error updating department:', err);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    try {
      await fetch(`/api/departments/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting department:', err);
    }
  };

  // Subject Handlers
  const handleAddSubject = async (newSub: Partial<Subject>) => {
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub),
      });
      if (res.ok) {
        refreshAllData();
      } else {
        const errJson = await res.json();
        alert(errJson.error || 'Failed to add subject');
      }
    } catch (err) {
      setSubjects((prev) => [...prev, { id: `sub-${Date.now()}`, ...(newSub as any) }]);
    }
  };

  const handleUpdateSubject = async (id: string, updated: Partial<Subject>) => {
    try {
      const res = await fetch(`/api/subjects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        refreshAllData();
      }
    } catch (err) {
      setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      refreshAllData();
    } catch (err) {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Timetable Handlers
  const handleAddSlot = async (newSlot: Partial<TimetableSlot>) => {
    try {
      await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlot),
      });
      refreshAllData();
    } catch (err) {
      setTimetable((prev) => [...prev, { id: `t-${Date.now()}`, ...(newSlot as any) }]);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      await fetch(`/api/timetable/${id}`, { method: 'DELETE' });
      refreshAllData();
    } catch (err) {
      setTimetable((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // Leave Handlers
  const handleApplyLeave = async (newLeave: Partial<LeaveRequest>) => {
    try {
      await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeave),
      });
      refreshAllData();
    } catch (err) {
      setLeaves((prev) => [{ id: `leave-${Date.now()}`, status: 'PENDING_FACULTY', createdAt: new Date().toISOString(), ...(newLeave as any) }]);
    }
  };

  const handleApproveLeave = async (id: string, remarks: string) => {
    try {
      await fetch(`/api/leaves/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerRole: currentUser.role, reviewerName: currentUser.name, remarks }),
      });
      refreshAllData();
    } catch (err) {
      setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'APPROVED' } : l)));
    }
  };

  const handleRejectLeave = async (id: string, remarks: string) => {
    try {
      await fetch(`/api/leaves/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerRole: currentUser.role, reviewerName: currentUser.name, remarks }),
      });
      refreshAllData();
    } catch (err) {
      setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'REJECTED' } : l)));
    }
  };

  // Save Settings
  const handleSaveSettings = async (updated: CollegeSettings) => {
    setSettings(updated);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      refreshAllData();
    } catch (e) {
      // Local fallback
    }
  };

  // Student 360 Update Handler
  const handleSaveStudent360 = async (updatedStudent: Student360Profile) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    if (selected360Student?.id === updatedStudent.id) {
      setSelected360Student(updatedStudent);
    }

    try {
      await fetch(`/api/students/${updatedStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent),
      });
    } catch (err) {
      console.error('Error saving student profile:', err);
    }
  };

  // Class Teacher Handlers
  const handleAssignClassTeacher = async (assignment: ClassTeacherAssignment) => {
    setClassTeacherAssignments((prev) => {
      const idx = prev.findIndex((a) => a.id === assignment.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = assignment;
        return copy;
      }
      return [assignment, ...prev];
    });

    // Update faculty object's isClassTeacherOf status
    setFacultyList((prev) =>
      prev.map((f) => {
        if (f.id === assignment.classTeacherId) {
          return {
            ...f,
            isClassTeacherOf: {
              departmentId: assignment.departmentId,
              courseId: assignment.courseId,
              courseCode: assignment.courseCode,
              academicYear: assignment.academicYear,
              semester: assignment.semester,
              division: assignment.division,
              classroom: assignment.classroom,
            },
          };
        }
        return f;
      })
    );

    try {
      await fetch('/api/class-teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment),
      });
      refreshAllData();
    } catch (err) {
      console.error('Error saving class teacher assignment to SQL:', err);
    }
  };

  const handleDeleteClassTeacherAssignment = async (id: string) => {
    setClassTeacherAssignments((prev) => prev.filter((a) => a.id !== id));
    try {
      await fetch(`/api/class-teachers/${id}`, { method: 'DELETE' });
      refreshAllData();
    } catch (err) {
      console.error('Error deleting class teacher assignment from SQL:', err);
    }
  };

  // Bulk Import Handler
  const handleImportStudentsBatch = async (newStudents: Partial<Student360Profile>[]) => {
    const formatted: Student360Profile[] = newStudents.map((s, idx) => ({
      id: `stu-imp-${Date.now()}-${idx}`,
      studentId: s.studentId || `STU${Date.now() + idx}`,
      fullName: s.fullName || 'Student',
      email: s.email || 'student@cktcollege.edu.in',
      personalMobile: s.personalMobile || '9820000000',
      whatsappNumber: s.whatsappNumber || '9820000000',
      departmentId: s.departmentId || 'dept-af',
      departmentName: s.departmentName || 'Department of Accounting & Finance',
      course: s.course || 'B.Com (Accounting & Finance)',
      academicYear: s.academicYear || 'TY',
      semester: s.semester || 5,
      division: s.division || 'A',
      rollNumber: s.rollNumber || `26BA0${idx + 1}`,
      gender: (s.gender as any) || 'Male',
      dob: s.dob || '2004-01-01',
      academicStatus: 'Active',
      admissionDate: s.admissionDate || '2024-06-01',
      bloodGroup: 'B+',
      category: 'General',
      fatherName: s.fatherName || 'Father',
      motherName: s.motherName || 'Mother',
      guardianName: s.guardianName || 'N/A',
      parentMobile: s.parentMobile || '9820000000',
      parentEmail: s.parentEmail || 'parent@gmail.com',
      parentOccupation: 'Service',
      emergencyContact: '+91 9820000000',
      temporaryAddress: 'Navi Mumbai, Maharashtra',
      permanentAddress: 'Navi Mumbai, Maharashtra',
      sscSchoolName: 'High School',
      sscBoard: 'CBSE',
      sscPassingYear: '2020',
      sscPercentage: 85,
      hscCollegeName: 'Junior College',
      hscBoard: 'HSC',
      hscStream: 'Commerce',
      hscPassingYear: '2022',
      hscPercentage: 82,
      sem1Gpa: 8.2,
      sem2Gpa: 8.4,
      sem3Gpa: 8.5,
      sem4Gpa: 8.6,
      overallCgpa: 8.4,
      technicalSkills: ['Tally Prime', 'Excel'],
      programmingLanguages: ['SQL'],
      certifications: [],
      internships: [],
      projects: [],
      sportsAndExtra: [],
      attendancePercentage: 100,
      totalLectures: 0,
      attendedLectures: 0,
      passportPhoto: s.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    }));

    setStudents((prev) => [...prev, ...formatted]);
    
    // Send batch to server API
    try {
      await fetch('/api/students/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formatted),
      });
    } catch (err) {
      console.error('Error batch saving students:', err);
    }

    // Log import
    const newLog: ImportHistoryLog = {
      id: `imp-${Date.now()}`,
      fileName: 'Student_Bulk_Import.csv',
      uploadedAt: new Date().toLocaleString(),
      uploadedBy: currentUser.name,
      totalRecords: formatted.length,
      importedCount: formatted.length,
      updatedCount: 0,
      skippedCount: 0,
      status: 'SUCCESS',
    };
    setImportLogs((prev) => [newLog, ...prev]);

    try {
      await fetch('/api/imports/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      refreshAllData();
    } catch (e) {}
  };

  const handleImportFacultyBatch = (importedFaculty: Partial<Faculty>[]) => {
    const newFacs: Faculty[] = importedFaculty.map((f, idx) => ({
      id: `fac-imported-${Date.now()}-${idx}`,
      facultyId: f.facultyId || `FAC${100 + idx}`,
      fullName: f.fullName || 'Faculty Member',
      email: f.email || 'faculty@cktcollege.edu.in',
      mobile: f.mobile || '+91 98200 00000',
      designation: (f.designation as any) || 'Assistant Professor',
      departmentId: f.departmentId || 'dept-af',
      departmentName: f.departmentName || 'Department of Accounting & Finance',
      qualification: f.qualification || 'M.Com, NET',
      experienceYears: f.experienceYears || 5,
      weeklyWorkloadHours: f.weeklyWorkloadHours || 16,
      photo: f.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      allocatedSubjects: f.allocatedSubjects || [],
      isActive: true,
    }));

    setFacultyList((prev) => [...prev, ...newFacs]);
    fetch('/api/faculty/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFacs),
    }).catch((err) => console.error('Error batch saving faculty:', err));

    const newUsers: User[] = newFacs.map((f) => ({
      id: f.id,
      name: f.fullName,
      email: f.email,
      role: 'Faculty',
      departmentId: f.departmentId,
      departmentName: f.departmentName,
      phone: f.mobile,
      avatar: f.photo,
      password: 'FacultyPassword@123',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    }));

    setUsersList((prev) => [...prev, ...newUsers]);
  };

  const handleImportSubjectsBatch = async (importedSubjects: Partial<Subject>[]) => {
    const newSubs: Subject[] = importedSubjects.map((s, idx) => ({
      id: `sub-imported-${Date.now()}-${idx}`,
      code: s.code || `SUB${100 + idx}`,
      name: s.name || 'Subject Name',
      departmentId: s.departmentId || 'dept-af',
      departmentName: s.departmentName || 'Department of Accounting & Finance',
      programId: s.programId || 'prog-ug',
      courseId: s.courseId || 'course-baf',
      semester: Number(s.semester) || 1,
      credits: Number(s.credits) || 4,
      type: s.type || 'Theory',
      assignedFacultyId: s.assignedFacultyId || 'fac-1',
      assignedFacultyName: s.assignedFacultyName || 'Faculty Instructor',
      status: 'Active',
      division: s.division || 'All Divisions',
    }));

    setSubjects((prev) => [...prev, ...newSubs]);
    for (const sub of newSubs) {
      try {
        await fetch('/api/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub),
        });
      } catch (err) {}
    }
  };

  const handleImportTimetableBatch = async (importedSlots: Partial<TimetableSlot>[]) => {
    const newSlots: TimetableSlot[] = importedSlots.map((ts, idx) => ({
      id: `slot-imported-${Date.now()}-${idx}`,
      day: ts.day || 'Monday',
      timeSlot: ts.timeSlot || '09:00 AM - 10:00 AM',
      subjectId: ts.subjectId || 'sub-1',
      subjectCode: ts.subjectCode || 'AF101',
      subjectName: ts.subjectName || 'Financial Accounting I',
      facultyId: ts.facultyId || 'fac-1',
      facultyName: ts.facultyName || 'Faculty Instructor',
      classroom: ts.classroom || 'Room 201',
      departmentId: ts.departmentId || 'dept-af',
      semester: Number(ts.semester) || 1,
      division: ts.division || 'A',
      type: ts.type || 'Lecture',
    }));

    setTimetable((prev) => [...prev, ...newSlots]);
    for (const slot of newSlots) {
      try {
        await fetch('/api/timetable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slot),
        });
      } catch (err) {}
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setUsersList((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    try {
      await fetch(`/api/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });
      refreshAllData();
    } catch (err) {
      console.error('Error updating user in SQL:', err);
    }
  };

  const handleAddUser = async (newUser: User) => {
    setUsersList((prev) => [...prev, newUser]);
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      refreshAllData();
    } catch (err) {
      console.error('Error creating user in SQL:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== userId));
    try {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      refreshAllData();
    } catch (err) {
      console.error('Error deleting user in SQL:', err);
    }
  };

  // Promotion Handler
  const handlePromoteStudentsBatch = async (
    promotedStudentIds: string[],
    targetYear: string,
    targetSem: number,
    targetDiv: string,
    course?: string,
    fromSem?: number
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (promotedStudentIds.includes(s.id)) {
          const isPassout = targetYear === 'Alumni' || targetSem > 6;
          const updated: Student360Profile = {
            ...s,
            academicYear: targetYear as any,
            semester: targetSem,
            division: targetDiv,
            academicStatus: isPassout ? 'Pass Out' : 'Active',
          };
          return updated;
        }
        return s;
      })
    );

    const fromSemesterValue = fromSem || (targetSem > 1 ? targetSem - 1 : 1);
    const courseValue = course || 'B.Com (Accounting & Finance)';

    const newBatch: PromotionBatch = {
      id: `pb-${Date.now()}`,
      batchName: `Promotion Batch: ${courseValue} (Sem ${fromSemesterValue} ➔ ${
        targetYear === 'Alumni' ? 'Pass Out / Alumni' : `${targetYear} Sem ${targetSem}`
      })`,
      promotedAt: new Date().toLocaleString(),
      promotedBy: currentUser.name,
      program: courseValue.includes('M.Com') ? 'PG' : 'UG',
      course: courseValue,
      fromSemester: fromSemesterValue,
      toSemester: targetSem,
      totalStudentsPromoted: promotedStudentIds.length,
      status: 'COMPLETED',
      records: [],
    };

    setPromotionHistory((prev) => [newBatch, ...prev]);

    try {
      await fetch('/api/students/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: promotedStudentIds, targetYear, targetSem, targetDiv }),
      });
      await fetch('/api/promotions/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBatch),
      });
      refreshAllData();
    } catch (e) {}
  };

  // Notice Handlers
  const handlePublishNotice = async (notice: NoticeItem) => {
    setNotices((prev) => [notice, ...prev]);
    try {
      await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notice),
      });
      refreshAllData();
    } catch (err) {
      console.error('Error publishing notice in SQL:', err);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      refreshAllData();
    } catch (err) {
      console.error('Error deleting notice in SQL:', err);
    }
  };

  // Chat Handlers
  const handleSendMessage = async (conversationId: string, text: string) => {
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
    };

    setChatMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    setChatConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: text,
              lastMessageTime: 'Just now',
            }
          : c
      )
    );

    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg),
      });
    } catch (err) {
      console.error('Error sending chat message to SQL:', err);
    }
  };

  // Academic Calendar Handlers
  const handleAddAcademicEvent = async (eventData: Omit<AcademicCalendarEvent, 'id'>) => {
    try {
      const res = await fetch('/api/academic-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (res.ok) {
        refreshAllData();
      } else {
        // Fallback local update
        const newEvt: AcademicCalendarEvent = {
          ...eventData,
          id: `evt-${Date.now()}`,
        };
        setAcademicEvents((prev) => [newEvt, ...prev]);
      }
    } catch (e) {
      const newEvt: AcademicCalendarEvent = {
        ...eventData,
        id: `evt-${Date.now()}`,
      };
      setAcademicEvents((prev) => [newEvt, ...prev]);
    }
  };

  const handleUpdateAcademicEvent = async (id: string, updated: Partial<AcademicCalendarEvent>) => {
    try {
      const res = await fetch(`/api/academic-calendar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        refreshAllData();
      } else {
        setAcademicEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
      }
    } catch (e) {
      setAcademicEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
    }
  };

  const handleDeleteAcademicEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/academic-calendar/${id}`, { method: 'DELETE' });
      if (res.ok) {
        refreshAllData();
      } else {
        setAcademicEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (e) {
      setAcademicEvents((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // Department Activity Handlers
  const handleAddDepartmentActivity = async (newAct: DepartmentActivity) => {
    setDepartmentActivities((prev) => [newAct, ...prev]);
    try {
      await fetch('/api/department-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAct),
      });
      refreshAllData();
    } catch (err) {
      console.error('Error adding department activity in SQL:', err);
    }
  };

  const handleUpdateDepartmentActivity = async (id: string, updated: DepartmentActivity) => {
    setDepartmentActivities((prev) => prev.map((a) => (a.id === id ? updated : a)));
    try {
      await fetch(`/api/department-activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      refreshAllData();
    } catch (err) {
      console.error('Error updating department activity in SQL:', err);
    }
  };

  const handleDeleteDepartmentActivity = async (id: string) => {
    setDepartmentActivities((prev) => prev.filter((a) => a.id !== id));
    try {
      await fetch(`/api/department-activities/${id}`, { method: 'DELETE' });
      refreshAllData();
    } catch (err) {
      console.error('Error deleting department activity in SQL:', err);
    }
  };

  const defaultersCount = students.filter((s) => s.attendancePercentage < settings.minimumAttendancePct).length;
  const pendingLeavesCount = leaves.filter((l) => l.status.startsWith('PENDING')).length;

  const studentUsers: User[] = students.map((s) => ({
    id: `u-${s.id}`,
    name: s.fullName,
    email: s.email,
    role: 'Student' as Role,
    departmentId: s.departmentId,
    departmentName: s.departmentName,
    phone: (s as any).mobile || (s as any).personalMobile || (s as any).parentMobile || '+91 98000 00000',
    avatar: s.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    password: 'StudentPassword@123',
    isActive: true,
    createdAt: '2025-01-01',
  }));

  const allUsersForSettings = [
    ...usersList,
    ...studentUsers.filter((su) => !usersList.some((u) => u.email?.toLowerCase() === su.email?.toLowerCase())),
  ];

  const userNotifications = notifications.filter((n) => {
    if (currentUser.role === 'Student') {
      if (n.role && n.role !== 'Student') return false;
      if (n.userId && n.userId !== currentUser.id && n.userId !== currentUser.linkedStudentId && n.userId !== 'u-stu-aarav') return false;
      return true;
    } else {
      if (n.role && n.role !== currentUser.role && n.role !== 'Admin') return false;
      if (n.userId && n.userId !== currentUser.id) return false;
      return true;
    }
  });

  const unreadNotifs = userNotifications.filter((n) => !n.isRead).length;

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={(loggedUser, remember) => handleLoginSuccess(loggedUser, remember ?? true)}
        usersList={usersList}
        onRegisterUser={handleAddUser}
      />
    );
  }

  return (
    <div className="w-full h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-800">
      
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'settings') setShowSettingsModal(true);
          else setActiveTab(tab);
        }}
        currentUser={currentUser}
        defaulterCount={defaultersCount}
        pendingLeavesCount={pendingLeavesCount}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
        
        {/* Top Navbar */}
        <Navbar
          currentUser={currentUser}
          onRoleChange={handleRoleChange}
          allUsers={INITIAL_USERS}
          onOpenAIAssistant={() => setShowAIAssistant(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          unreadNotifCount={unreadNotifs}
          onOpenNotifs={() => setShowNotifDrawer(!showNotifDrawer)}
          onLogout={handleLogout}
        />

        {/* Notifications Drawer */}
        {showNotifDrawer && (
          <div className="fixed top-20 right-8 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="text-xs font-bold text-slate-800">ERP System Notifications</h4>
              <button onClick={() => setShowNotifDrawer(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                Close
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
              {userNotifications.length > 0 ? (
                userNotifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-800">{n.title}</p>
                    <p className="text-[11px] text-slate-600">{n.message}</p>
                    <span className="text-[9px] text-slate-400 block">{n.createdAt}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-[11px] text-center py-4">No notifications to display.</p>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Main Area */}
        <div className="p-8 flex-1 flex flex-col gap-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <RoleDashboard
              currentUser={currentUser}
              students={students}
              departments={departments}
              programs={programs}
              courses={courses}
              facultyList={facultyList}
              subjects={subjects}
              timetable={timetable}
              sessions={sessions}
              leaves={leaves}
              settings={settings}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpen360={(stu) => setSelected360Student(stu)}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceEngine
              students={students}
              departments={departments}
              programs={programs}
              courses={courses}
              subjects={subjects}
              settings={settings}
              academicEvents={academicEvents}
              userRole={currentUser.role}
              userName={currentUser.name}
              onRefreshData={refreshAllData}
            />
          )}

          {activeTab === 'academic-calendar' && (
            <AcademicCalendarView
              events={academicEvents}
              departments={departments}
              currentUser={currentUser}
              onAddEvent={handleAddAcademicEvent}
              onUpdateEvent={handleUpdateAcademicEvent}
              onDeleteEvent={handleDeleteAcademicEvent}
            />
          )}

          {activeTab === 'students' && (
            <Student360Directory
              students={students}
              departments={departments}
              programs={programs}
              courses={courses}
              academicYears={academicYears}
              onOpen360={(stu) => setSelected360Student(stu)}
              onAdmitStudent={handleAdmitStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              userRole={currentUser.role}
              currentUser={currentUser}
            />
          )}

          {currentUser.role !== 'Student' && activeTab === 'faculty' && (
            <FacultyDirectory
              facultyList={facultyList}
              departments={departments}
              programs={programs}
              courses={courses}
              subjects={subjects}
              classTeacherAssignments={classTeacherAssignments}
              userRole={currentUser.role}
              userName={currentUser.name}
              onAssignClassTeacher={handleAssignClassTeacher}
              onDeleteClassTeacherAssignment={handleDeleteClassTeacherAssignment}
              onImportFacultySuccess={handleImportFacultyBatch}
              onAddFaculty={handleAddFaculty}
              onUpdateFaculty={handleUpdateFaculty}
              onDeleteFaculty={handleDeleteFaculty}
            />
          )}

          {activeTab === 'timetable' && (
            <TimetableGrid
              slots={timetable}
              conflicts={conflicts}
              departments={departments}
              programs={programs}
              courses={courses}
              subjects={subjects}
              facultyList={facultyList}
              academicEvents={academicEvents}
              onAddSlot={handleAddSlot}
              onDeleteSlot={handleDeleteSlot}
              userRole={currentUser.role}
            />
          )}

          {activeTab === 'departments' && (
            <DepartmentsView
              departments={departments}
              programs={programs}
              courses={courses}
              subjects={subjects}
              facultyList={facultyList}
              departmentActivities={departmentActivities}
              userRole={currentUser.role}
              onAddSubject={handleAddSubject}
              onUpdateSubject={handleUpdateSubject}
              onDeleteSubject={handleDeleteSubject}
              onAddActivity={handleAddDepartmentActivity}
              onUpdateActivity={handleUpdateDepartmentActivity}
              onDeleteActivity={handleDeleteDepartmentActivity}
              onAddDepartment={handleAddDepartment}
              onUpdateDepartment={handleUpdateDepartment}
              onDeleteDepartment={handleDeleteDepartment}
            />
          )}

          {activeTab === 'leaves' && (
            <LeaveManagement
              leaves={leaves}
              departments={departments}
              userRole={currentUser.role}
              userName={currentUser.name}
              onApplyLeave={handleApplyLeave}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
            />
          )}

          {activeTab === 'defaulter-analytics' && (
            <DefaulterAnalytics
              students={students}
              departments={departments}
              settings={settings}
              onOpen360={(stu) => setSelected360Student(stu)}
            />
          )}

          {activeTab === 'results' && (
            <ResultsMatrix
              results={results}
              students={students}
              departments={departments}
              userRole={currentUser.role}
              onRefreshData={refreshAllData}
            />
          )}

          {currentUser.role !== 'Student' && activeTab === 'reports' && (
            <ReportsExporter
              students={students}
              departments={departments}
              sessions={sessions}
            />
          )}

          {activeTab === 'bulk-upload' && (
            <BulkUploadModule
              onImportSuccess={handleImportStudentsBatch}
              onImportFacultySuccess={handleImportFacultyBatch}
              onImportSubjectsSuccess={handleImportSubjectsBatch}
              onImportTimetableSuccess={handleImportTimetableBatch}
              importLogs={importLogs}
            />
          )}

          {activeTab === 'student-promotion' && (
            <StudentPromotionWizard
              students={students}
              promotionHistory={promotionHistory}
              onPromoteStudents={handlePromoteStudentsBatch}
            />
          )}

          {activeTab === 'notices' && (
            <NoticeBoard
              notices={notices}
              userRole={currentUser.role}
              userName={currentUser.name}
              onPublishNotice={handlePublishNotice}
              onDeleteNotice={handleDeleteNotice}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationCenter
              notifications={notifications}
              userRole={currentUser.role}
              onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))}
              onClearNotifications={() => setNotifications([])}
            />
          )}

          {activeTab === 'chat' && (
            <ChatModule
              conversations={chatConversations}
              messages={chatMessages}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
            />
          )}

          {activeTab === 'atkt-management' && (
            <ATKTManagementModule
              departments={departments}
              students={students}
              userRole={currentUser.role}
            />
          )}

          {activeTab === 'ai-assistant' && (
            <AIExtendedModule
              students={students}
              departments={departments}
              settings={settings}
              userRole={currentUser.role}
            />
          )}

          {currentUser.role !== 'Student' && activeTab === 'audit-logs' && (
            <AuditLogViewer
              logs={auditLogs}
            />
          )}

          {currentUser.role === 'Student' && ['faculty', 'departments', 'reports', 'audit-logs'].includes(activeTab) && (
            <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-rose-900">Access Restricted (Student View-Only Portal)</h3>
              <p className="text-xs text-rose-700 max-w-md mx-auto">
                Students do not have administrative privileges to view institutional staff records, faculty rosters, administrative reports, or audit trails.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-md"
              >
                Return to My Student Dashboard
              </button>
            </div>
          )}

          {/* Footer Status Bar */}
          <footer className="flex items-center justify-between text-[11px] text-slate-400 font-medium uppercase tracking-widest shrink-0 border-t border-slate-200 pt-6 mt-auto">
            <div className="flex gap-6">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> API Status: Operational
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> DB Sync: Healthy
              </span>
            </div>
            <div>v2.5.0 Production Build • Institutional ERP Solution</div>
          </footer>
        </div>

      </main>

      {/* Modals & Overlays */}
      <Student360Modal
        student={selected360Student}
        onClose={() => setSelected360Student(null)}
        onSave={handleSaveStudent360}
        leaves={leaves}
        onApplyLeave={handleApplyLeave}
      />

      <AIAssistantModal
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        userRole={currentUser.role}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        userRole={currentUser.role}
        currentUser={currentUser}
        usersList={allUsersForSettings}
        onUpdateUser={handleUpdateUser}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onLogout={handleLogout}
      />

    </div>
  );
}
