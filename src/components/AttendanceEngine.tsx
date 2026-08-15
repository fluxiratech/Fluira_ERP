import React, { useState, useEffect } from 'react';
import {
  Student360Profile,
  AttendanceSession,
  AttendanceStatus,
  Department,
  Program,
  Course,
  Subject,
  AttendanceCorrectionRequest,
  CollegeSettings,
  AcademicCalendarEvent,
} from '../types';
import {
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Lock,
  Search,
  Filter,
  FileSpreadsheet,
  RefreshCw,
  MessageSquare,
  Mail,
  Sliders,
  Layers,
  GraduationCap,
  Printer,
  FileText,
  Download,
} from 'lucide-react';
import { exportReportToPDF, exportReportToExcel, exportReportToCSV } from '../utils/reportExporter';
import { ExportReportModal } from './ExportReportModal';

interface AttendanceEngineProps {
  students: Student360Profile[];
  departments: Department[];
  programs?: Program[];
  courses?: Course[];
  subjects: Subject[];
  settings: CollegeSettings;
  academicEvents?: AcademicCalendarEvent[];
  userRole: string;
  userName: string;
  onRefreshData: () => void;
}

export const AttendanceEngine: React.FC<AttendanceEngineProps> = ({
  students,
  departments,
  programs = [
    { id: 'prog-ug', code: 'UG', name: 'UG', status: 'Active' },
    { id: 'prog-pg', code: 'PG', name: 'PG', status: 'Active' },
  ],
  courses = [
    { id: 'course-baf', programId: 'prog-ug', programName: 'UG', courseName: 'B.Com (Accounting & Finance)', courseCode: 'BAF', durationYears: 3, totalSemesters: 6, status: 'Active' },
    { id: 'course-mba', programId: 'prog-pg', programName: 'PG', courseName: 'M.Com Business Analytics', courseCode: 'MBA', durationYears: 2, totalSemesters: 4, status: 'Active' },
  ],
  subjects,
  settings,
  academicEvents = [],
  userRole,
  userName,
  onRefreshData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'mark' | 'defaulters' | 'corrections'>('mark');

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Filter States for Marking Attendance according to hierarchy:
  // Program -> Course -> Academic Year -> Semester -> Division -> Subject
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().substring(0, 10));

  // Check if selected date is a non-working day or academic event
  const matchedAcademicEvent = academicEvents.find(
    (e) => selectedDate >= e.startDate && selectedDate <= e.endDate
  );
  const isSunday = new Date(selectedDate).getDay() === 0;
  const isNonWorkingDay = isSunday || (matchedAcademicEvent ? matchedAcademicEvent.isNonWorkingDay : false);
  const nonWorkingReason = matchedAcademicEvent
    ? `${matchedAcademicEvent.title} (${matchedAcademicEvent.eventType})`
    : isSunday
    ? 'Sunday (Weekly Non-Working Day)'
    : '';
  const [selectedProgId, setSelectedProgId] = useState<string>('prog-ug');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('course-baf');
  const [selectedSem, setSelectedSem] = useState<number>(1);
  const [selectedDiv, setSelectedDiv] = useState<string>('A');
  const [selectedDept, setSelectedDept] = useState<string>(departments[0]?.id || 'dept-af');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [sessionType, setSessionType] = useState<'Lecture' | 'Practical' | 'Lab'>('Lecture');

  // Dynamic filter lists
  const availableCourses = courses.filter((c) => c.programId === selectedProgId);
  const selectedCourseObj = courses.find((c) => c.id === selectedCourseId);
  const maxSemesters = selectedCourseObj?.totalSemesters || (selectedProgId === 'prog-pg' ? 4 : 6);

  // Filter subjects for the chosen course/program & semester
  const availableSubjects = subjects.filter((sub) => {
    const matchProg = !sub.programId || sub.programId === selectedProgId;
    const matchCourse = !sub.courseId || sub.courseId === selectedCourseId;
    const matchSem = sub.semester === selectedSem;
    return matchProg && matchCourse && matchSem;
  });

  // Ensure selectedSubjectId stays valid
  useEffect(() => {
    if (availableSubjects.length > 0) {
      if (!availableSubjects.some((s) => s.id === selectedSubjectId)) {
        setSelectedSubjectId(availableSubjects[0].id);
      }
    } else if (subjects.length > 0) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [selectedProgId, selectedCourseId, selectedSem, subjects]);

  const handleProgramChange = (progId: string) => {
    setSelectedProgId(progId);
    const firstCourse = courses.find((c) => c.programId === progId);
    if (firstCourse) {
      setSelectedCourseId(firstCourse.id);
    }
    setSelectedSem(1);
  };

  // Student Marking Map { [studentId]: AttendanceStatus }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Defaulter Threshold State
  const [defaulterThreshold, setDefaulterThreshold] = useState<number>(settings.minimumAttendancePct || 75);
  const [alertSentNotice, setAlertSentNotice] = useState<string | null>(null);

  // Correction Requests State
  const [corrections, setCorrections] = useState<AttendanceCorrectionRequest[]>([]);

  useEffect(() => {
    fetch('/api/corrections')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCorrections(data);
      })
      .catch((err) => console.error('Error loading corrections from SQL:', err));
  }, []);

  // Filter active roster matching selected Department, Program/Course, Semester, Division
  const activeRoster = students.filter((s) => {
    const matchDept = !selectedDept || selectedDept === 'ALL' || s.departmentId === selectedDept || (s.departmentName && s.departmentName.includes(selectedDept));
    const matchProg = !s.programId || s.programId === selectedProgId || (selectedProgId === 'prog-ug' && s.course.includes('B.Com')) || (selectedProgId === 'prog-pg' && s.course.includes('M.Com'));
    const matchCourse = !s.courseId || s.courseId === selectedCourseId || s.course.includes(selectedCourseObj?.courseName || '');
    const matchSem = Number(s.semester) === Number(selectedSem);
    const matchDiv = !selectedDiv || s.division === selectedDiv;
    return matchDept && matchProg && matchSem && matchDiv;
  });

  const selectedSubObj = subjects.find((s) => s.id === selectedSubjectId);
  const exportHeaders = ['Roll Number', 'Student Name', 'Program & Course', 'Semester', 'Division', 'Attendance Status', 'Cumulative %'];
  const exportRows = activeRoster.map((s) => [
    s.rollNumber,
    s.fullName,
    s.departmentName,
    `Sem ${s.semester}`,
    s.division,
    attendanceMap[s.id] || 'PRESENT',
    `${s.attendancePercentage}%`,
  ]);

  const reportMetadata = {
    program: selectedProgId === 'prog-ug' ? 'B.Com Accounting & Finance' : 'M.Com Business Analytics',
    course: selectedCourseObj?.courseName || 'B.Com Accounting & Finance',
    academicYear: 'AY 2025-26',
    semester: `Semester ${selectedSem}`,
    division: `Division ${selectedDiv}`,
    subject: selectedSubObj ? `${selectedSubObj.code} - ${selectedSubObj.name}` : 'Financial Accounting',
    generatedBy: `${userName} (${userRole})`,
  };

  // Initialize attendance map when roster or subject changes
  useEffect(() => {
    const initialMap: Record<string, AttendanceStatus> = {};
    activeRoster.forEach((s) => {
      initialMap[s.id] = 'PRESENT'; // Default all to Present
    });
    setAttendanceMap(initialMap);
  }, [selectedDept, selectedSem, selectedDiv]);

  const setAllStatus = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    activeRoster.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleToggleStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    if (isNonWorkingDay) {
      alert(`Cannot save attendance on a non-working day or holiday: ${nonWorkingReason}`);
      return;
    }
    setIsSubmitting(true);
    setSuccessMessage(null);

    const activeSubject = subjects.find((s) => s.id === selectedSubjectId);

    const payloadRecords = activeRoster.map((s) => ({
      studentId: s.id,
      studentRoll: s.rollNumber,
      studentName: s.fullName,
      status: attendanceMap[s.id] || 'PRESENT',
    }));

    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `sess-${selectedDate}-${selectedSubjectId}-${selectedDiv}`,
          sessionDetails: {
            date: selectedDate,
            departmentId: selectedDept,
            semester: selectedSem,
            division: selectedDiv,
            subjectId: selectedSubjectId,
            subjectName: activeSubject?.name || 'Subject',
            facultyId: 'u-fac-patel',
            facultyName: userName,
            sessionType,
          },
          records: payloadRecords,
          markedBy: `${userName} (${userRole})`,
        }),
      });

      if (res.ok) {
        setSuccessMessage(`Attendance successfully marked for ${payloadRecords.length} students in ${activeSubject?.name || 'Subject'}!`);
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats calculation
  const totalRoster = activeRoster.length;
  const presentCount = Object.values(attendanceMap).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'ABSENT').length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === 'LATE').length;
  const leaveCount = Object.values(attendanceMap).filter((s) => s === 'ON_LEAVE').length;

  // Defaulters calculation
  const defaultersList = students.filter((s) => s.attendancePercentage < defaulterThreshold);

  const handleTriggerAlert = (type: 'WhatsApp' | 'Email', studentName: string) => {
    setAlertSentNotice(`Simulated ${type} Defaulter Alert sent successfully to ${studentName} and Parent!`);
    setTimeout(() => setAlertSentNotice(null), 4000);
  };

  const handleReviewCorrection = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setCorrections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus, reviewedBy: userName } : c))
    );
    try {
      await fetch(`/api/corrections/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reviewedBy: userName }),
      });
      onRefreshData();
    } catch (err) {
      console.error('Error updating correction in SQL:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Subtabs */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Attendance Engine & Defaulter Analytics</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time daily, lecture, and lab attendance marking with automated threshold calculations.
          </p>
        </div>

        {/* Subtab Toggle Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('mark')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'mark' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mark Attendance
          </button>
          <button
            onClick={() => setActiveSubTab('defaulters')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
              activeSubTab === 'defaulters' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Defaulter Analysis</span>
            {defaultersList.length > 0 && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-rose-500 text-white rounded-full">
                {defaultersList.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('corrections')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'corrections' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Correction Requests
          </button>
        </div>
      </div>

      {/* SUBTAB 1: MARK ATTENDANCE */}
      {activeSubTab === 'mark' && (
        <div className="space-y-6">
          
          {/* Filters Control Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Department</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
              >
                <option value="ALL">All Departments</option>
                <option value="Accounting & Finance">Accounting & Finance</option>
                <option value="Business Analytics">Business Analytics</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Program</label>
              <select
                value={selectedProgId}
                onChange={(e) => handleProgramChange(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
              >
                {availableCourses.map((c) => (
                  <option key={c.id} value={c.id}>{c.courseName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Semester</label>
              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
              >
                {Array.from({ length: maxSemesters }, (_, i) => i + 1).map((s) => {
                  let label = `Semester ${s}`;
                  if (selectedProgId === 'prog-ug') {
                    label = s <= 2 ? `FY (Sem ${s})` : s <= 4 ? `SY (Sem ${s})` : `TY (Sem ${s})`;
                  } else if (selectedProgId === 'prog-pg') {
                    label = s <= 2 ? `Part I (Sem ${s})` : `Part II (Sem ${s})`;
                  }
                  return (
                    <option key={s} value={s}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Division</label>
              <select
                value={selectedDiv}
                onChange={(e) => setSelectedDiv(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
              >
                {['A', 'B', 'C'].map((div) => (
                  <option key={div} value={div}>Division {div}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Session Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
              >
                {availableSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Type</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              >
                <option value="Lecture">Lecture</option>
                <option value="Practical">Practical</option>
                <option value="Lab">Lab Session</option>
              </select>
            </div>

            <div>
              <button
                onClick={() => setAllStatus('PRESENT')}
                className="w-full text-xs font-semibold px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
              >
                All Present
              </button>
            </div>
          </div>

          {/* Non-Working Day Warning Banner */}
          {isNonWorkingDay && (
            <div className="p-4 bg-rose-50 border-2 border-rose-200 text-rose-900 rounded-2xl text-xs font-semibold flex items-start space-x-3 shadow-sm animate-in fade-in">
              <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-rose-900 text-sm">Attendance Marking Blocked</h4>
                <p className="text-slate-700">
                  Selected date <strong>{selectedDate}</strong> is marked as a Non-Working Day / Holiday in the Academic Calendar ({nonWorkingReason}). Attendance marking is automatically disabled on official non-working days.
                </p>
              </div>
            </div>
          )}

          {/* Alert Success Banner */}
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick Roster Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Total Roster</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{totalRoster}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
              <p className="text-[10px] text-emerald-700 uppercase font-bold">Present</p>
              <p className="text-xl font-bold text-emerald-700 mt-1">{presentCount}</p>
            </div>
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-center">
              <p className="text-[10px] text-rose-700 uppercase font-bold">Absent</p>
              <p className="text-xl font-bold text-rose-700 mt-1">{absentCount}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
              <p className="text-[10px] text-amber-700 uppercase font-bold">Late</p>
              <p className="text-xl font-bold text-amber-700 mt-1">{lateCount}</p>
            </div>
            <div className="bg-sky-50 p-4 rounded-xl border border-sky-200 text-center">
              <p className="text-[10px] text-sky-700 uppercase font-bold">On Leave / OD</p>
              <p className="text-xl font-bold text-sky-700 mt-1">{leaveCount}</p>
            </div>
          </div>

          {/* Student Attendance Marking Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <span className="text-xs font-bold text-slate-700">
                Student Register Roster ({activeRoster.length} Enrolled)
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => exportReportToPDF({ title: 'OFFICIAL DAILY ATTENDANCE REGISTER REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-bold transition flex items-center gap-1"
                >
                  <Printer className="w-3 h-3" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => exportReportToExcel({ title: 'OFFICIAL DAILY ATTENDANCE REGISTER REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3 h-3" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={() => exportReportToCSV({ title: 'OFFICIAL DAILY ATTENDANCE REGISTER REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold transition flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded text-[11px] font-bold transition flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Export Config</span>
                </button>
                <button
                  onClick={() => setAllStatus('PRESENT')}
                  className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 hover:bg-emerald-100"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => setAllStatus('ABSENT')}
                  className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200 hover:bg-rose-100"
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/60 text-[11px] font-bold uppercase text-slate-600 border-b border-slate-200">
                    <th className="p-3 pl-4">Roll No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Current %</th>
                    <th className="p-3 text-center">Attendance Status Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {activeRoster.map((student) => {
                    const currentStatus = attendanceMap[student.id] || 'PRESENT';

                    return (
                      <tr key={student.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 pl-4 font-mono font-bold text-slate-800">{student.rollNumber}</td>
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={student.passportPhoto}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <p className="font-semibold text-slate-800">{student.fullName}</p>
                              <p className="text-[10px] text-slate-400">{student.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              student.attendancePercentage >= 75
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {student.attendancePercentage}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200 space-x-1">
                            <button
                              onClick={() => handleToggleStatus(student.id, 'PRESENT')}
                              className={`px-3 py-1 rounded-md font-bold text-xs transition ${
                                currentStatus === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-emerald-700'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleToggleStatus(student.id, 'ABSENT')}
                              className={`px-3 py-1 rounded-md font-bold text-xs transition ${
                                currentStatus === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-rose-700'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => handleToggleStatus(student.id, 'LATE')}
                              className={`px-3 py-1 rounded-md font-bold text-xs transition ${
                                currentStatus === 'LATE'
                                  ? 'bg-amber-500 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-amber-700'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              onClick={() => handleToggleStatus(student.id, 'ON_LEAVE')}
                              className={`px-3 py-1 rounded-md font-bold text-xs transition ${
                                currentStatus === 'ON_LEAVE'
                                  ? 'bg-sky-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-sky-700'
                              }`}
                            >
                              OD / Leave
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Save Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              {isNonWorkingDay ? (
                <div className="flex items-center space-x-2 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                  <Lock className="w-4 h-4 text-rose-600" />
                  <span>Attendance Locked for Non-Working Day ({nonWorkingReason})</span>
                </div>
              ) : (
                <span className="text-xs text-slate-500 font-medium">Ready to record attendance for {activeRoster.length} students</span>
              )}

              <button
                onClick={handleSaveAttendance}
                disabled={isSubmitting || isNonWorkingDay}
                className={`flex items-center space-x-2 px-6 py-2.5 text-xs font-bold rounded-xl shadow-md transition ${
                  isNonWorkingDay
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50'
                }`}
              >
                {isNonWorkingDay ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                <span>
                  {isNonWorkingDay
                    ? 'Attendance Blocked'
                    : isSubmitting
                    ? 'Saving Session...'
                    : 'Submit & Lock Attendance Record'}
                </span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 2: DEFAULTER ANALYSIS */}
      {activeSubTab === 'defaulters' && (
        <div className="space-y-6">
          
          {/* Threshold Filter Slider */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>Defaulter Cutoff Threshold Controls</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Filter students whose cumulative attendance falls below the specified percentage.
                </p>
              </div>

              <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-600">Threshold:</span>
                <span className="text-lg font-black text-rose-600">{defaulterThreshold}%</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-slate-500">50%</span>
              <input
                type="range"
                min="50"
                max="85"
                step="5"
                value={defaulterThreshold}
                onChange={(e) => setDefaulterThreshold(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-500">85%</span>
            </div>
          </div>

          {alertSentNotice && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{alertSentNotice}</span>
            </div>
          )}

          {/* Defaulters Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-rose-50/60 border-b border-rose-100 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span className="text-xs font-bold text-rose-900">
                  Defaulter List ({defaultersList.length} Students &lt; {defaulterThreshold}%)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-rose-700">
                Action Required: Mandatory Warning Notice
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/60 text-[11px] font-bold uppercase text-slate-600 border-b border-slate-200">
                    <th className="p-3 pl-4">Roll</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Department / Sem</th>
                    <th className="p-3">Lectures Held</th>
                    <th className="p-3">Attended</th>
                    <th className="p-3">Attendance %</th>
                    <th className="p-3 text-center">Automated Warning Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {defaultersList.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-50">
                      <td className="p-3 pl-4 font-mono font-bold text-slate-800">{stu.rollNumber}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <img src={stu.passportPhoto} className="w-7 h-7 rounded-full object-cover" alt="" />
                          <div>
                            <p className="font-semibold text-slate-800">{stu.fullName}</p>
                            <p className="text-[10px] text-slate-400">{stu.personalMobile}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-medium text-slate-600">{stu.departmentName} (Sem {stu.semester})</td>
                      <td className="p-3 text-slate-600">{stu.totalLectures}</td>
                      <td className="p-3 font-semibold text-slate-800">{stu.attendedLectures}</td>
                      <td className="p-3">
                        <span className="font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px]">
                          {stu.attendancePercentage}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="inline-flex space-x-2">
                          <button
                            onClick={() => handleTriggerAlert('WhatsApp', stu.fullName)}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded text-[11px] font-semibold flex items-center space-x-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp Alert</span>
                          </button>
                          <button
                            onClick={() => handleTriggerAlert('Email', stu.fullName)}
                            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded text-[11px] font-semibold flex items-center space-x-1"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email Notice</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {defaultersList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                        No students found below {defaulterThreshold}% attendance cutoff.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 3: CORRECTION REQUESTS */}
      {activeSubTab === 'corrections' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Pending Attendance Correction Requests</h3>
          <p className="text-xs text-slate-500">
            Review correction claims submitted by students due to scanner errors or verified medical duties.
          </p>

          <div className="space-y-3">
            {corrections.map((corr) => (
              <div key={corr.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 text-sm">{corr.studentName}</span>
                    <span className="text-xs text-slate-500 font-mono">({corr.rollNumber})</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      {corr.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Subject: <strong>{corr.subjectName}</strong> • Date: <strong>{corr.date}</strong> • Request: Change from <span className="text-rose-600 font-bold">{corr.currentStatus}</span> to <span className="text-emerald-600 font-bold">{corr.requestedStatus}</span>
                  </p>
                  <p className="text-xs text-slate-500 italic mt-1 bg-white p-2 rounded border border-slate-200">
                    "{corr.reason}"
                  </p>
                </div>

                {corr.status === 'PENDING' ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReviewCorrection(corr.id, 'APPROVED')}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                    >
                      Approve Correction
                    </button>
                    <button
                      onClick={() => handleReviewCorrection(corr.id, 'REJECTED')}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-600">Reviewed by {corr.reviewedBy}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="OFFICIAL DAILY ATTENDANCE REGISTER REPORT"
        headers={['Roll Number', 'Student Name', 'Program & Course', 'Semester', 'Division', 'Attendance Status', 'Cumulative %']}
        rows={activeRoster.map((s) => [
          s.rollNumber,
          s.fullName,
          s.departmentName,
          `Sem ${s.semester}`,
          s.division,
          attendanceMap[s.id] || 'PRESENT',
          `${s.attendancePercentage}%`,
        ])}
        defaultMetadata={{
          program: selectedProgId === 'prog-ug' ? 'B.Com Accounting & Finance' : 'M.Com Business Analytics',
          course: courses.find((c) => c.id === selectedCourseId)?.courseName || 'B.Com Accounting & Finance',
          academicYear: 'AY 2025-26',
          semester: `Semester ${selectedSem}`,
          division: `Division ${selectedDiv}`,
          subject: subjects.find((s) => s.id === selectedSubjectId)?.name || 'Financial Accounting',
          generatedBy: `${userName} (${userRole})`,
        }}
      />

    </div>
  );
};
