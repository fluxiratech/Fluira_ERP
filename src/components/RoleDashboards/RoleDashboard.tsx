import React from 'react';
import {
  User,
  Role,
  Student360Profile,
  Department,
  Program,
  Course,
  Faculty,
  Subject,
  TimetableSlot,
  AttendanceSession,
  LeaveRequest,
  CollegeSettings,
} from '../../types';
import { analyzeTimetableConflicts } from '../../utils/timetableConflictDetector';
import {
  Users,
  GraduationCap,
  Building2,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  ArrowUpRight,
  Send,
  MessageSquare,
  FileCheck2,
  TrendingUp,
  CreditCard,
  CalendarDays,
  BookOpen,
  UserCog,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface RoleDashboardProps {
  currentUser: User;
  students: Student360Profile[];
  departments: Department[];
  programs?: Program[];
  courses?: Course[];
  facultyList?: Faculty[];
  subjects?: Subject[];
  timetable: TimetableSlot[];
  sessions: AttendanceSession[];
  leaves: LeaveRequest[];
  settings: CollegeSettings;
  onNavigate: (tab: any) => void;
  onOpen360: (student: Student360Profile) => void;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({
  currentUser,
  students,
  departments,
  programs = [],
  courses = [],
  facultyList = [],
  subjects = [],
  timetable,
  sessions,
  leaves,
  settings,
  onNavigate,
  onOpen360,
}) => {
  const defaulters = students.filter((s) => s.attendancePercentage < settings.minimumAttendancePct);
  const totalStudents = students.length;
  const totalProgramsCount = programs.length;
  const totalCoursesCount = courses.length;
  const totalFacultyCount = facultyList.length;
  const totalSubjectsCount = subjects.length;
  const avgAttendance = students.length
    ? Number((students.reduce((acc, s) => acc + s.attendancePercentage, 0) / students.length).toFixed(1))
    : 0;

  // Real-time Timetable Conflict Analysis
  const timetableConflicts = analyzeTimetableConflicts(timetable);

  // Department Bar Chart Data
  const deptData = departments.map((d) => ({
    name: d.code,
    attendance: d.avgAttendancePct,
    students: d.totalStudents,
  }));

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  // Identify student for Student or Parent view
  const myStudent = students.find((s) => s.id === currentUser.linkedStudentId || s.email === currentUser.email) || students[0];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded border border-indigo-400/30">
              {currentUser.role === 'Admin' ? 'ADMIN DASHBOARD' : `${currentUser.role} Dashboard`}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            {currentUser.role === 'Admin' ? 'Welcome back, Department Administrator!' : `Welcome back, ${currentUser.name}!`}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Department of Accounting and Finance (B.Com Accounting and Finance & M.Com Business Analytics)
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10">
          <div className="text-right">
            <p className="text-[10px] text-slate-300 uppercase font-semibold">Min Attendance Cutoff</p>
            <p className="text-xl font-black text-amber-300">{settings.minimumAttendancePct}%</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid for Admin / HOD / Faculty */}
      {currentUser.role !== 'Student' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Programs</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalProgramsCount}</p>
              <p className="text-[10px] text-indigo-600 font-medium mt-1">UG & PG</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Courses</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalCoursesCount}</p>
              <p className="text-[10px] text-purple-600 font-medium mt-1">BAF & MBA</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Students</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalStudents}</p>
              <p className="text-[10px] text-emerald-600 font-medium mt-1">Active Enrolled</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Faculty</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalFacultyCount}</p>
              <p className="text-[10px] text-amber-600 font-medium mt-1">Staff Allocated</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <UserCog className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Subjects</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalSubjectsCount}</p>
              <p className="text-[10px] text-teal-600 font-medium mt-1">Curriculum Papers</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Attendance %</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{avgAttendance}%</p>
              <p className="text-[10px] text-emerald-600 font-medium mt-1">College Avg</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* ROLE SPECIFIC DASHBOARD VIEWS */}

      {/* 1. STUDENT VIEW */}
      {currentUser.role === 'Student' && myStudent && (
        <div className="space-y-6">
          {/* Student Profile Overview Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <img src={myStudent.passportPhoto} className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-200" alt="" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">{myStudent.fullName}</h3>
                <p className="text-xs text-slate-500">
                  Roll No: <span className="font-bold text-slate-800">{myStudent.rollNumber}</span> • {myStudent.course} (Sem {myStudent.semester}, Div {myStudent.division})
                </p>
                <div className="flex items-center space-x-3 mt-1 text-xs">
                  <span className="text-indigo-600 font-semibold">Overall CGPA: {myStudent.overallCgpa || '8.80'}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600">Academic Year: {myStudent.academicYear || settings.academicYear}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => onOpen360(myStudent)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center space-x-1.5 shadow-sm"
              >
                <CreditCard className="w-4 h-4" />
                <span>View Full 360° Profile & Digital ID</span>
              </button>
            </div>
          </div>

          {/* Student Specific 4 KPI Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attendance Percentage</p>
                <p className={`text-2xl font-black mt-1 ${myStudent.attendancePercentage >= settings.minimumAttendancePct ? 'text-indigo-600' : 'text-rose-600'}`}>
                  {myStudent.attendancePercentage}%
                </p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                  myStudent.attendancePercentage >= settings.minimumAttendancePct
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {myStudent.attendancePercentage >= settings.minimumAttendancePct ? 'Eligible for Exams' : 'Defaulter Warning'}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Present Days / Lectures</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{myStudent.attendedLectures ?? 0}</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">Conducted & Attended</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Absent Days / Lectures</p>
                <p className="text-2xl font-black text-rose-600 mt-1">
                  {Math.max(0, (myStudent.totalLectures ?? 0) - (myStudent.attendedLectures ?? 0))}
                </p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">Approved & Unexcused</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Lectures Conducted</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{myStudent.totalLectures ?? 0}</p>
                <p className="text-[11px] text-indigo-600 font-semibold mt-1">Current Sem Total</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subject Attendance Breakdown */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-sm font-bold text-slate-800">Subject-wise Attendance</h3>
                <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg">
                  Cutoff: {settings.minimumAttendancePct}%
                </span>
              </div>

              <div className="space-y-4 text-xs">
                {subjects.length > 0 ? (
                  subjects.map((s) => (
                    <div key={s.id} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{s.name} ({s.code})</span>
                        <span className={myStudent.attendancePercentage >= settings.minimumAttendancePct ? 'text-emerald-600 font-black' : 'text-rose-600 font-black'}>
                          {myStudent.attendancePercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full ${myStudent.attendancePercentage >= settings.minimumAttendancePct ? 'bg-indigo-600' : 'bg-rose-500'}`}
                          style={{ width: `${myStudent.attendancePercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Faculty: {s.assignedFacultyName || 'Assigned Professor'}</span>
                        <span>Required: {settings.minimumAttendancePct}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500 font-semibold text-xs">No subjects currently registered in curriculum.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Today's Schedule & Quick Links */}
            <div className="space-y-6">
              {/* Today's Schedule */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Today's & Upcoming Classes</h3>
                <div className="space-y-3 text-xs">
                  {timetable.length > 0 ? (
                    timetable.slice(0, 4).map((slot) => (
                      <div key={slot.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">{slot.subjectName}</p>
                          <p className="text-[11px] text-slate-500">{slot.facultyName} • {slot.classroom}</p>
                        </div>
                        <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded">{slot.timeSlot}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-slate-500 font-semibold text-xs">No timetable slots scheduled for today.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Links Nav */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-800">Quick Portal Navigation</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => onNavigate('students')}
                    className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-xl font-bold text-slate-700 flex flex-col items-center gap-1 transition text-center"
                  >
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span>My 360° Profile</span>
                  </button>
                  <button
                    onClick={() => onNavigate('timetable')}
                    className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-xl font-bold text-slate-700 flex flex-col items-center gap-1 transition text-center"
                  >
                    <CalendarDays className="w-4 h-4 text-indigo-600" />
                    <span>My Timetable</span>
                  </button>
                  <button
                    onClick={() => onNavigate('leaves')}
                    className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-xl font-bold text-slate-700 flex flex-col items-center gap-1 transition text-center"
                  >
                    <FileCheck2 className="w-4 h-4 text-indigo-600" />
                    <span>Leave Applications</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADMIN / HOD / FACULTY / CLASS TEACHER DASHBOARD VIEW */}
      {currentUser.role !== 'Student' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Department Comparison Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Department-wise Attendance Comparison</h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="attendance" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Executive Quick Actions</h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => onNavigate('attendance')}
                  className="w-full text-left p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition font-semibold text-xs flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Launch Bulk Attendance Marker</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('timetable')}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition font-semibold text-xs flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <span>Check Timetable Conflicts</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('leaves')}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition font-semibold text-xs flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <FileCheck2 className="w-4 h-4 text-slate-600" />
                    <span>Review Leave Applications ({leaves.filter((l) => l.status.startsWith('PENDING')).length})</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('reports')}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition font-semibold text-xs flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-slate-600" />
                    <span>Export Defaulter List to CSV</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Real-time Timetable Conflicts Detector Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4">
              <div className="flex items-center space-x-2.5">
                <div className={`p-2 rounded-xl ${timetableConflicts.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Real-Time Timetable Conflict Analysis</h3>
                  <p className="text-[11px] text-slate-500">Automated overlap detection for faculty double-booking & room collisions</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                  timetableConflicts.length > 0
                    ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {timetableConflicts.length > 0
                    ? `⚠️ ${timetableConflicts.length} Active Conflict(s) Detected`
                    : '✓ All Slots Validated (0 Conflicts)'}
                </span>

                <button
                  onClick={() => onNavigate('timetable')}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1"
                >
                  <span>Go to Timetable Grid</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {timetableConflicts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {timetableConflicts.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border bg-rose-50/60 border-rose-200 space-y-2.5 relative"
                  >
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-extrabold text-[10px] uppercase">
                        {c.reason === 'FACULTY_DOUBLE_BOOKED' ? '👤 Faculty Double Booked' : '🏫 Classroom Collision'}
                      </span>
                      <span className="font-mono text-slate-700 font-bold bg-white px-2 py-0.5 rounded border border-rose-200">
                        {c.slot1.day} • {c.slot1.timeSlot}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-rose-200/80">
                      <div className="bg-white p-2.5 rounded-lg border border-rose-200 space-y-1">
                        <p className="font-bold text-slate-900 text-[11px] truncate">{c.slot1.subjectName}</p>
                        <p className="text-[10px] text-indigo-600 font-semibold">
                          Div {c.slot1.division} • Sem {c.slot1.semester}
                        </p>
                        <p className="text-[10px] text-slate-500">Prof: {c.slot1.facultyName}</p>
                        <p className="text-[10px] text-slate-500">Room: {c.slot1.classroom}</p>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-rose-200 space-y-1">
                        <p className="font-bold text-slate-900 text-[11px] truncate">{c.slot2.subjectName}</p>
                        <p className="text-[10px] text-indigo-600 font-semibold">
                          Div {c.slot2.division} • Sem {c.slot2.semester}
                        </p>
                        <p className="text-[10px] text-slate-500">Prof: {c.slot2.facultyName}</p>
                        <p className="text-[10px] text-slate-500">Room: {c.slot2.classroom}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-emerald-950">Timetable Schedule Fully Validated</h4>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      No overlapping faculty assignments or room collisions found across all scheduled lectures.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('timetable')}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shrink-0"
                >
                  View Full Schedule
                </button>
              </div>
            )}
          </div>

          {/* Critical Defaulters Stream */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Critical Defaulter Roster (&lt;{settings.minimumAttendancePct}%)</h3>
              </div>
              <button
                onClick={() => onNavigate('attendance')}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                View All in Attendance Engine →
              </button>
            </div>

            {defaulters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {defaulters.map((d) => (
                  <div key={d.id} className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <img src={d.passportPhoto} className="w-10 h-10 rounded-full object-cover" alt="" />
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{d.fullName}</p>
                        <p className="text-[10px] text-slate-500">Roll: {d.rollNumber} • {d.departmentName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-rose-600">{d.attendancePercentage}%</span>
                      <button
                        onClick={() => onOpen360(d)}
                        className="block text-[10px] font-bold text-indigo-600 hover:underline mt-0.5"
                      >
                        360° Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-600 font-bold text-xs">No Defaulters Found</p>
                <p className="text-slate-400 text-[11px] mt-0.5">All enrolled students meet or exceed the mandatory {settings.minimumAttendancePct}% attendance threshold.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
