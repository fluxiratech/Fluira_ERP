import React, { useState, useEffect } from 'react';
import { TimetableSlot, TimetableConflict, Department, Program, Course, Subject, Faculty, DayOfWeek, AcademicCalendarEvent } from '../types';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  X,
  Building2,
  Layers,
  GraduationCap,
  Printer,
  FileSpreadsheet,
  FileText,
  Download,
  Lock,
  Sparkles,
} from 'lucide-react';
import { exportReportToPDF, exportReportToExcel, exportReportToCSV } from '../utils/reportExporter';
import { ExportReportModal } from './ExportReportModal';

interface TimetableGridProps {
  slots: TimetableSlot[];
  conflicts: TimetableConflict[];
  departments: Department[];
  programs?: Program[];
  courses?: Course[];
  subjects: Subject[];
  facultyList: Faculty[];
  academicEvents?: AcademicCalendarEvent[];
  onAddSlot: (newSlot: Partial<TimetableSlot>) => void;
  onDeleteSlot: (slotId: string) => void;
  userRole?: string;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  slots,
  conflicts,
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
  facultyList,
  academicEvents = [],
  onAddSlot,
  onDeleteSlot,
  userRole,
}) => {
  const [selectedProgId, setSelectedProgId] = useState<string>('prog-ug');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('course-baf');
  const [selectedDept, setSelectedDept] = useState<string>('dept-af');
  const [selectedSem, setSelectedSem] = useState<number>(1);
  const [selectedDiv, setSelectedDiv] = useState<string>('A');
  const [showAddModal, setShowAddModal] = useState(false);

  // Fixed Master Timetable State
  const [isFixedTimetable, setIsFixedTimetable] = useState<boolean>(() => {
    return localStorage.getItem('college_fixed_timetable_status') === 'true';
  });
  const [showLockNoticeModal, setShowLockNoticeModal] = useState(false);

  const toggleTimetableLock = (lock: boolean) => {
    setIsFixedTimetable(lock);
    localStorage.setItem('college_fixed_timetable_status', String(lock));
  };

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const availableCourses = courses.filter((c) => c.programId === selectedProgId);
  const selectedCourseObj = courses.find((c) => c.id === selectedCourseId);
  const maxSemesters = selectedCourseObj?.totalSemesters || (selectedProgId === 'prog-pg' ? 4 : 6);

  const exportHeaders = ['Day', 'Time Slot', 'Subject Code & Name', 'Faculty Instructor', 'Classroom / Venue', 'Semester & Division', 'Type'];
  const exportRows = slots.map((s) => [
    s.day,
    s.timeSlot,
    `${s.subjectCode} - ${s.subjectName}`,
    s.facultyName,
    s.classroom,
    `Sem ${s.semester} (Div ${s.division})`,
    s.type || 'Lecture',
  ]);

  const reportMetadata = {
    program: selectedProgId === 'prog-ug' ? 'B.Com (Accounting & Finance)' : 'M.Com Business Analytics',
    course: selectedCourseObj?.courseName || 'B.Com (Accounting & Finance)',
    academicYear: 'AY 2025-26',
    semester: `Semester ${selectedSem}`,
    division: `Division ${selectedDiv}`,
    subject: 'All Subjects',
    generatedBy: 'Timetable Committee / HOD',
  };

  const handleProgramChange = (progId: string) => {
    setSelectedProgId(progId);
    const firstCourse = courses.find((c) => c.programId === progId);
    if (firstCourse) setSelectedCourseId(firstCourse.id);
    setSelectedSem(1);
  };

  // New Slot Form State
  const [day, setDay] = useState<DayOfWeek>('Monday');
  const [timeSlot, setTimeSlot] = useState<string>('09:00 AM - 10:00 AM');
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || '');
  const [facultyId, setFacultyId] = useState<string>(facultyList[0]?.id || '');
  const [classroom, setClassroom] = useState<string>('Room 204');
  const [type, setType] = useState<'Lecture' | 'Practical' | 'Lab'>('Lecture');

  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const defaultTimeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:15 AM - 12:15 PM',
    '01:00 PM - 02:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
  ];

  const availableSubjectsForSlot = subjects.filter((sub) => {
    const matchProg = !sub.programId || sub.programId === selectedProgId || (selectedProgId === 'prog-ug' && sub.courseCode === 'BAF') || (selectedProgId === 'prog-pg' && sub.courseCode === 'MBA');
    const matchCourse = !sub.courseId || sub.courseId === selectedCourseId;
    const matchSem = Number(sub.semester) === Number(selectedSem);
    const matchStatus = sub.status !== 'Inactive';
    return matchProg && matchCourse && matchSem && matchStatus;
  });

  // Ensure default subjectId is valid when filters change
  useEffect(() => {
    if (availableSubjectsForSlot.length > 0) {
      if (!availableSubjectsForSlot.some((s) => s.id === subjectId)) {
        setSubjectId(availableSubjectsForSlot[0].id);
      }
    }
  }, [selectedProgId, selectedCourseId, selectedSem, subjects]);

  const filteredSlots = slots.filter((s) => {
    if (Number(s.semester) !== Number(selectedSem)) return false;
    if (!selectedDiv || selectedDiv === 'ALL' || s.division === 'ALL') return true;
    if (s.division === selectedDiv) return true;
    
    // Check overlapping combined divisions (e.g. slot has "A + B", filter is "A")
    const slotDivs = s.division.includes('+') ? s.division.split('+').map((d) => d.trim()) : [s.division];
    const filterDivs = selectedDiv.includes('+') ? selectedDiv.split('+').map((d) => d.trim()) : [selectedDiv];
    
    return slotDivs.some((sd) => filterDivs.includes(sd));
  });

  const timeSlots = Array.from(
    new Set([
      ...defaultTimeSlots,
      ...filteredSlots.map((s) => s.timeSlot),
    ])
  );

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = subjects.find((s) => s.id === subjectId);
    const fac = facultyList.find((f) => f.id === facultyId);

    onAddSlot({
      departmentId: selectedDept,
      semester: selectedSem,
      division: selectedDiv,
      day,
      timeSlot,
      subjectId,
      subjectName: sub?.name || 'Subject',
      facultyId,
      facultyName: fac?.fullName || 'Faculty',
      classroom,
      type,
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Academic Timetable & Conflict Detector</h1>
            {isFixedTimetable ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Lock className="w-3 h-3 text-emerald-700" />
                <span>FIXED MASTER TIMETABLE</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>EDITABLE / DRAFT</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Weekly timetable schedule builder with automatic faculty double-booking and room collision detection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Lock / Unlock Master Timetable Toggle */}
          {userRole !== 'Student' && (
            <button
              onClick={() => toggleTimetableLock(!isFixedTimetable)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border shadow-xs transition ${
                isFixedTimetable
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
              }`}
              title={isFixedTimetable ? 'Unlock Master Timetable to allow modifications' : 'Lock current weekly schedule as Fixed Master Timetable'}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isFixedTimetable ? 'Unlock to Edit' : 'Fix & Lock Master Timetable'}</span>
            </button>
          )}

          <button
            onClick={() => exportReportToPDF({ title: 'OFFICIAL ACADEMIC TIMETABLE SCHEDULE REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => exportReportToExcel({ title: 'OFFICIAL ACADEMIC TIMETABLE SCHEDULE REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => exportReportToCSV({ title: 'OFFICIAL ACADEMIC TIMETABLE SCHEDULE REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
            className="flex items-center space-x-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Config</span>
          </button>
          {userRole !== 'Student' && (
            <button
              onClick={() => {
                if (isFixedTimetable) {
                  setShowLockNoticeModal(true);
                } else {
                  setShowAddModal(true);
                }
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition ${
                isFixedTimetable
                  ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-pointer hover:bg-slate-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isFixedTimetable ? <Lock className="w-3.5 h-3.5 text-slate-500" /> : <Plus className="w-4 h-4" />}
              <span>Add Schedule Slot</span>
            </button>
          )}
        </div>
      </div>

      {/* College Fixed Timetable Banner Callout */}
      {isFixedTimetable ? (
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm border border-emerald-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-300">
                College Master Weekly Timetable: Fixed & Active
              </h4>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                The weekly timetable schedule is fixed for Semester {selectedSem} (Division {selectedDiv}). Slots are protected against accidental edits. Unlock anytime to adjust schedules or add slots.
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleTimetableLock(false)}
            className="px-3.5 py-1.5 bg-emerald-500/30 hover:bg-emerald-500/50 border border-emerald-400/40 text-emerald-100 rounded-xl text-xs font-bold transition shrink-0"
          >
            Unlock Timetable
          </button>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950">
                Timetable in Edit Mode
              </p>
              <p className="text-[11px] text-amber-800">
                You can add, modify, or delete timetable slots. Once complete, click <strong>"Fix & Lock Master Timetable"</strong> to finalize the college schedule.
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleTimetableLock(true)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0"
          >
            Fix & Lock Timetable
          </button>
        </div>
      )}

      {/* Academic Calendar Notice Bar */}
      {academicEvents.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm border border-indigo-800/50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-4 h-4 text-indigo-400" />
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-300">
                Academic Calendar Sync & Non-Working Days
              </h4>
            </div>
            <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-md font-bold">
              Integrated with Attendance Engine
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {academicEvents.slice(0, 4).map((evt) => (
              <div
                key={evt.id}
                className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 text-[11px] font-bold ${
                  evt.isNonWorkingDay
                    ? 'bg-rose-500/20 text-rose-200 border-rose-500/40'
                    : 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40'
                }`}
              >
                {evt.isNonWorkingDay && <Lock className="w-3 h-3 text-rose-400 shrink-0" />}
                <span>{evt.title} ({evt.startDate})</span>
                <span className="text-[9px] opacity-80">({evt.eventType})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conflict Alert Banner */}
      {conflicts.length > 0 ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
          <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>WARNING: {conflicts.length} Active Timetable Conflict(s) Detected!</span>
          </div>
          <div className="space-y-1 pl-7">
            {conflicts.map((c, idx) => (
              <p key={idx} className="text-xs text-rose-700">
                • <strong>{c.reason === 'FACULTY_DOUBLE_BOOKED' ? 'Faculty Double-Booking' : 'Classroom Collision'}</strong>: {c.slot1.facultyName} scheduled in both {c.slot1.classroom} and {c.slot2.classroom} on {c.slot1.day} at {c.slot1.timeSlot}.
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Timetable Schedule Validated: Zero faculty or room conflicts detected across all slots.</span>
        </div>
      )}

      {/* Filter Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 text-xs font-medium">
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-bold">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
          >
            <option value="ALL">All Departments</option>
            <option value="Accounting & Finance">Accounting & Finance</option>
            <option value="Business Analytics">Business Analytics</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-bold">Program:</span>
          <select
            value={selectedProgId}
            onChange={(e) => handleProgramChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-bold">Course:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
          >
            {availableCourses.map((c) => (
              <option key={c.id} value={c.id}>{c.courseName}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-bold">Semester:</span>
          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
          >
            {Array.from({ length: maxSemesters }, (_, i) => i + 1).map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-bold">Division:</span>
          <select
            value={selectedDiv}
            onChange={(e) => setSelectedDiv(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
          >
            <option value="A">Division A</option>
            <option value="B">Division B</option>
            <option value="C">Division C</option>
            <option value="A + B">Div A + Div B (Combined Lecture)</option>
            <option value="B + C">Div B + Div C (Combined Lecture)</option>
            <option value="ALL">All Divisions (Combined Roster)</option>
          </select>
        </div>
      </div>

      {/* Multi-Division Guidance Callout */}
      <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-3.5 flex items-start space-x-3 text-xs">
        <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-indigo-950">
            Support for 1 Faculty Teaching Multiple Divisions (Combined / Joint Lectures)
          </p>
          <p className="text-indigo-800 text-[11px]">
            If a faculty member delivers a lecture to 2 divisions simultaneously (e.g., Division A & Division B combined), assign the slot division as <strong>"Div A + Div B"</strong> or <strong>"ALL"</strong>. The conflict engine automatically permits this as a valid joint session, and the Attendance Engine will display students from both divisions on the roster.
          </p>
        </div>
      </div>

      {/* Timetable Grid Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
              <th className="p-3 border-b border-slate-800 w-32 text-center">Day / Time</th>
              {timeSlots.map((ts) => (
                <th key={ts} className="p-3 border-b border-slate-800 text-center font-mono">
                  {ts}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {days.map((d) => (
              <tr key={d} className="hover:bg-slate-50/60 transition">
                <td className="p-3 font-bold bg-slate-50 border-r border-slate-200 text-slate-800 text-center">
                  {d}
                </td>
                {timeSlots.map((ts) => {
                  const matchingSlot = filteredSlots.find((s) => s.day === d && s.timeSlot === ts);

                  return (
                    <td key={ts} className="p-2 border-r border-slate-200 align-top h-28 w-44">
                      {matchingSlot ? (
                        <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-2.5 rounded-xl border border-indigo-200 h-full flex flex-col justify-between relative group hover:shadow-md transition">
                          {userRole !== 'Student' && (
                            <button
                              onClick={() => {
                                if (isFixedTimetable) {
                                  setShowLockNoticeModal(true);
                                } else {
                                  if (confirm(`Delete slot for ${matchingSlot.subjectName} (${matchingSlot.day} ${matchingSlot.timeSlot})?`)) {
                                    onDeleteSlot(matchingSlot.id);
                                  }
                                }
                              }}
                              className="absolute top-1 right-1 p-1 text-slate-400 hover:text-rose-600 rounded bg-white/80 opacity-0 group-hover:opacity-100 transition"
                              title={isFixedTimetable ? 'Timetable Locked (Click to unlock)' : 'Delete Slot'}
                            >
                              {isFixedTimetable ? <Lock className="w-3 h-3 text-amber-600" /> : <Trash2 className="w-3 h-3" />}
                            </button>
                          )}

                          <div>
                            <p className="font-bold text-indigo-950 text-xs leading-snug">
                              {matchingSlot.subjectName}
                            </p>
                            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/80 px-1.5 py-0.2 rounded mt-1 inline-block">
                              {matchingSlot.type}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-600 space-y-0.5 mt-2">
                            <p className="flex items-center space-x-1 font-medium truncate">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{matchingSlot.facultyName}</span>
                            </p>
                            <p className="flex items-center space-x-1 font-semibold text-slate-700">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{matchingSlot.classroom}</span>
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            if (userRole === 'Student') return;
                            setDay(d);
                            setTimeSlot(ts);
                            if (isFixedTimetable) {
                              setShowLockNoticeModal(true);
                            } else {
                              setShowAddModal(true);
                            }
                          }}
                          className="h-full rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 text-[10px] font-medium hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 cursor-pointer transition p-1 text-center group"
                        >
                          <Plus className="w-3.5 h-3.5 mb-0.5 text-slate-300 group-hover:text-indigo-500" />
                          <span>Free Slot</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-bold text-slate-800">Add Timetable Schedule Slot</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Day of Week</label>
                <select value={day} onChange={(e) => setDay(e.target.value as any)} className="w-full bg-slate-50 border p-2 rounded-lg font-medium">
                  {days.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Time Slot (e.g. 09:00 AM - 10:00 AM)</label>
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  placeholder="e.g. 09:00 AM - 10:00 AM"
                  className="w-full bg-slate-50 border p-2 rounded-lg font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject</label>
                <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-lg font-medium">
                  {availableSubjectsForSlot.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                  ))}
                  {availableSubjectsForSlot.length === 0 && (
                    <option value="">No active subjects for this Program & Semester</option>
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Faculty</label>
                <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-lg font-medium">
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>{f.fullName} ({f.designation})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Classroom / Lab</label>
                  <input type="text" value={classroom} onChange={(e) => setClassroom(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-lg font-medium" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Slot Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full bg-slate-50 border p-2 rounded-lg font-medium">
                    <option value="Lecture">Lecture</option>
                    <option value="Practical">Practical</option>
                    <option value="Lab">Lab</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Add to Timetable</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lock Notice Modal */}
      {showLockNoticeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center space-x-3 text-amber-600 border-b pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Master Timetable Fixed / Locked</h3>
                <p className="text-xs text-slate-500">College Master Weekly Schedule is currently Active</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This weekly timetable is currently locked as the official Master Schedule to protect against accidental modifications or deletion of slots.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 font-medium space-y-1">
              <p className="font-bold text-amber-950">Need to make changes or add extra slots?</p>
              <p className="text-[11px] text-amber-800">
                Click <strong>"Unlock to Edit"</strong> below to temporarily switch the schedule to Edit Mode. You can lock it back anytime once your adjustments are complete.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowLockNoticeModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-xs transition"
              >
                Keep Fixed
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleTimetableLock(false);
                  setShowLockNoticeModal(false);
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Unlock & Add Slot</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="OFFICIAL ACADEMIC TIMETABLE SCHEDULE REPORT"
        headers={exportHeaders}
        rows={exportRows}
        defaultMetadata={reportMetadata}
      />

    </div>
  );
};
