import React, { useState, useEffect } from 'react';
import { Student360Profile, Department, User, Program, Course, AcademicYearItem } from '../types';
import { Users, Search, Filter, Plus, Eye, AlertTriangle, Download, CheckCircle2, CreditCard, UserCheck, BookOpen, Award, Edit2, Trash2, X, Printer, Layers, GraduationCap, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { exportReportToPDF, exportReportToExcel, exportReportToCSV, exportStudent360ToPDF } from '../utils/reportExporter';
import { ExportReportModal } from './ExportReportModal';
import { StudentProfileFormModal } from './StudentProfileFormModal';

interface Student360DirectoryProps {
  students: Student360Profile[];
  departments: Department[];
  programs?: Program[];
  courses?: Course[];
  academicYears?: AcademicYearItem[];
  onOpen360: (student: Student360Profile) => void;
  onAdmitStudent: (newStudent: Partial<Student360Profile>) => void | Promise<void>;
  onUpdateStudent?: (id: string, updatedStudent: Partial<Student360Profile>) => void | Promise<void>;
  onDeleteStudent?: (id: string) => void | Promise<void>;
  userRole?: string;
  currentUser?: User;
}

export const Student360Directory: React.FC<Student360DirectoryProps> = ({
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
  academicYears = [
    { id: 'ay-ug-fy', code: 'FY', name: 'First Year (FY)', courseId: 'course-baf', programId: 'prog-ug' },
    { id: 'ay-ug-sy', code: 'SY', name: 'Second Year (SY)', courseId: 'course-baf', programId: 'prog-ug' },
    { id: 'ay-ug-ty', code: 'TY', name: 'Third Year (TY)', courseId: 'course-baf', programId: 'prog-ug' },
    { id: 'ay-pg-p1', code: 'Part I', name: 'Part I', courseId: 'course-mba', programId: 'prog-pg' },
    { id: 'ay-pg-p2', code: 'Part II', name: 'Part II', courseId: 'course-mba', programId: 'prog-pg' },
  ],
  onOpen360,
  onAdmitStudent,
  onUpdateStudent,
  onDeleteStudent,
  userRole,
  currentUser,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [showAdmitModal, setShowAdmitModal] = useState(false);

  // Synchronize state when students prop changes
  const [studentList, setStudentList] = useState<Student360Profile[]>(students);
  useEffect(() => {
    setStudentList(students);
  }, [students]);

  const [editingStudent, setEditingStudent] = useState<Student360Profile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Deletion Confirmation Dialog State
  const [studentToDelete, setStudentToDelete] = useState<Student360Profile | null>(null);

  // Loading States for Async API feedback
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // If logged in as Student, render ONLY their own 360° Profile
  if (userRole === 'Student') {
    const userEmail = (currentUser?.email || '').toLowerCase();
    const linkedId = currentUser?.linkedStudentId;
    const myStudent =
      studentList.find(
        (s) =>
          (linkedId && (s.id === linkedId || s.studentId === linkedId)) ||
          (s.email && s.email.toLowerCase() === userEmail) ||
          (currentUser?.id && (s.studentId === currentUser.id || s.id === currentUser.id))
      ) || studentList[0];

    if (!myStudent) {
      return (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">No Student Profile Linked</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your account ({currentUser?.email}) is not currently linked to an active student record in the college database. Please contact the HOD Office or Department Administrator to register your profile.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl font-bold text-slate-900">My Student 360° Profile</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Read-only view of your personal, academic, parent, SSC/HSC, CGPA matrix, and certifications record.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportStudent360ToPDF(myStudent)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              <Download className="w-4 h-4" />
              <span>Download 360° PDF</span>
            </button>

            <button
              onClick={() => onOpen360(myStudent)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              <CreditCard className="w-4 h-4" />
              <span>Open Full Digital ID & 360 Card</span>
            </button>
          </div>
        </div>

        {/* Student Profile Card Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 border-b border-slate-100 pb-6">
            <img
              src={myStudent.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-50 border border-slate-200 shadow-sm"
              alt={myStudent.fullName || 'Student'}
            />
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{myStudent.fullName || 'Student Profile'}</h2>
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">
                  VERIFIED ENROLLED STUDENT
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                PRN / Student ID: <span className="font-bold text-slate-800">{myStudent.studentId || myStudent.id}</span> • Roll No: <span className="font-bold text-slate-800">{myStudent.rollNumber || 'N/A'}</span>
              </p>
              <p className="text-xs text-slate-600">
                Course: <span className="font-semibold text-slate-800">{myStudent.course || 'Degree Program'}</span> ({myStudent.departmentName || 'Department'}) • Sem {myStudent.semester || 1}, Division {myStudent.division || 'A'}
              </p>
              <div className="flex items-center gap-4 text-xs pt-1">
                <span className="text-indigo-600 font-bold">CGPA: {myStudent.overallCgpa || 'N/A'}</span>
                <span className="text-emerald-600 font-bold">Attendance: {myStudent.attendancePercentage ?? 100}%</span>
                <span className="text-slate-500">Academic Year: {myStudent.academicYear || 'Current Year'}</span>
              </div>
            </div>
          </div>

          {/* Detailed Read Only Tab Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Personal & Contact */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-indigo-950 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
                Personal & Contact Details
              </h3>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div><span className="text-slate-500 block">Gender:</span><span className="font-bold text-slate-800">{myStudent.gender || 'N/A'}</span></div>
                <div><span className="text-slate-500 block">DOB:</span><span className="font-bold text-slate-800">{myStudent.dob || 'N/A'}</span></div>
                <div><span className="text-slate-500 block">Blood Group:</span><span className="font-bold text-slate-800">{myStudent.bloodGroup || 'N/A'}</span></div>
                <div><span className="text-slate-500 block">Category:</span><span className="font-bold text-slate-800">{myStudent.category || 'General'}</span></div>
                <div><span className="text-slate-500 block">Mobile:</span><span className="font-bold text-slate-800">{myStudent.personalMobile || 'N/A'}</span></div>
                <div><span className="text-slate-500 block">Email:</span><span className="font-bold text-slate-800">{myStudent.email || 'N/A'}</span></div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-indigo-950 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
                Parent & Guardian Information
              </h3>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div><span className="text-slate-500 block">Father Name:</span><span className="font-bold text-slate-800">{myStudent.fatherName || 'N/A'}</span></div>
                <div><span className="text-slate-500 block">Mother Name:</span><span className="font-bold text-slate-800">{myStudent.motherName || 'N/A'}</span></div>
                <div><span className="text-slate-500 block">Parent Mobile:</span><span className="font-bold text-slate-800">{myStudent.parentMobile || myStudent.fatherMobile || 'N/A'}</span></div>
                <div><span className="text-slate-500 block">Parent Email:</span><span className="font-bold text-slate-800">{myStudent.parentEmail || 'N/A'}</span></div>
              </div>
            </div>

            {/* SSC & HSC Academic Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-indigo-950 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
                SSC (Class 10) & HSC (Class 12) Qualifications
              </h3>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div><span className="text-slate-500 block">SSC Percentage:</span><span className="font-bold text-slate-800">{myStudent.sscPercentage || 'N/A'}% ({myStudent.sscYear || myStudent.sscPassingYear || 'N/A'})</span></div>
                <div><span className="text-slate-500 block">SSC Board:</span><span className="font-bold text-slate-800">{myStudent.sscBoard || 'N/A'}</span></div>
                <div><span className="text-slate-500 block">HSC Percentage:</span><span className="font-bold text-slate-800">{myStudent.hscPercentage || 'N/A'}% ({myStudent.hscYear || myStudent.hscPassingYear || 'N/A'})</span></div>
                <div><span className="text-slate-500 block">HSC Board:</span><span className="font-bold text-slate-800">{myStudent.hscBoard || 'N/A'}</span></div>
              </div>
            </div>

            {/* Skills & Certifications */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-indigo-950 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
                Technical Skills & Verified Certifications
              </h3>
              <div className="space-y-2 pt-1">
                <div>
                  <span className="text-slate-500 block mb-1">Skills & Programming:</span>
                  <div className="flex flex-wrap gap-1">
                    {(myStudent.programmingLanguages || ['Python', 'Java', 'SQL']).map((s, idx) => {
                      const name = typeof s === 'string' ? s : String(s);
                      return (
                        <span key={`lang-${name}-${idx}`} className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold text-[10px] rounded">
                          {name}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Certifications:</span>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(myStudent.certifications) && myStudent.certifications.length > 0 ? (
                      myStudent.certifications.map((c, idx) => {
                        const isObj = typeof c === 'object' && c !== null;
                        const displayTitle = isObj ? (c as any).title || 'Certificate' : String(c);
                        const displayIssuer = isObj && (c as any).issuer ? ` (${(c as any).issuer})` : '';
                        return (
                          <span key={`cert-${idx}`} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                            {displayTitle}{displayIssuer}
                          </span>
                        );
                      })
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-medium text-[10px] rounded">
                        No certifications recorded
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter & Search States
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedProgFilter, setSelectedProgFilter] = useState<string>('ALL');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [selectedSemFilter, setSelectedSemFilter] = useState<string>('ALL');
  const [selectedDivFilter, setSelectedDivFilter] = useState<string>('ALL');

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const canEdit = userRole === 'Admin' || userRole === 'HOD';

  // Dynamic Options for Filters
  const deptOptions = Array.from(
    new Set([
      ...departments.map((d) => d.name),
      ...studentList.map((s) => s.departmentName).filter(Boolean),
    ])
  );

  const progOptions = Array.from(
    new Set([
      ...programs.map((p) => p.name),
      ...studentList.map((s) => s.programName).filter(Boolean),
      'Undergraduate',
      'Postgraduate',
    ])
  );

  const courseOptions = Array.from(
    new Set([
      ...courses.map((c) => c.courseName),
      ...studentList.map((s) => s.course).filter(Boolean),
    ])
  );

  const filtered = (studentList || []).filter((s) => {
    if (!s) return false;

    const fullName = (s.fullName || '').toLowerCase();
    const rollNumber = (s.rollNumber || '').toLowerCase();
    const studentId = (s.studentId || s.id || '').toLowerCase();
    const deptName = (s.departmentName || '').toLowerCase();
    const deptId = (s.departmentId || '').toLowerCase();
    const courseName = (s.course || '').toLowerCase();
    const courseId = (s.courseId || '').toLowerCase();
    const progName = (s.programName || '').toLowerCase();
    const progId = (s.programId || '').toLowerCase();
    const semStr = String(s.semester ?? 1);
    const divStr = (s.division || 'A').toUpperCase();

    // Department Match
    let matchesDept = selectedDeptFilter === 'ALL';
    if (!matchesDept) {
      const dTarget = selectedDeptFilter.toLowerCase();
      matchesDept =
        deptId === dTarget ||
        deptName.includes(dTarget) ||
        dTarget.includes(deptName);
    }

    // Program Match
    let matchesProg = selectedProgFilter === 'ALL';
    if (!matchesProg) {
      const pTarget = selectedProgFilter.toLowerCase();
      matchesProg =
        progId === pTarget ||
        progName.includes(pTarget) ||
        pTarget.includes(progName) ||
        courseName.includes(pTarget) ||
        (pTarget.includes('undergrad') && (courseName.includes('b.') || courseName.includes('bcom') || courseName.includes('bachelor') || progId.includes('ug') || progName.includes('ug'))) ||
        (pTarget.includes('postgrad') && (courseName.includes('m.') || courseName.includes('mcom') || courseName.includes('master') || progId.includes('pg') || progName.includes('pg')));
    }

    // Course Match
    let matchesCourse = selectedCourseFilter === 'ALL';
    if (!matchesCourse) {
      const cTarget = selectedCourseFilter.toLowerCase();
      matchesCourse =
        courseId === cTarget ||
        courseName.includes(cTarget) ||
        cTarget.includes(courseName);
    }

    // Semester Match
    const matchesSem = selectedSemFilter === 'ALL' || semStr === selectedSemFilter;

    // Division Match
    const matchesDiv = selectedDivFilter === 'ALL' || divStr === selectedDivFilter.toUpperCase();

    // Search Match
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      fullName.includes(q) ||
      rollNumber.includes(q) ||
      studentId.includes(q) ||
      courseName.includes(q) ||
      deptName.includes(q);

    return matchesDept && matchesProg && matchesCourse && matchesSem && matchesDiv && matchesSearch;
  });

  const exportHeaders = ['Student ID', 'Roll Number', 'Full Name', 'Course & Program', 'Semester', 'Division', 'Attendance %', 'CGPA', 'Mobile', 'Parent Contact'];
  const exportRows = filtered.map((s) => [
    s.studentId,
    s.rollNumber,
    s.fullName,
    s.course,
    `Sem ${s.semester}`,
    s.division,
    `${s.attendancePercentage}%`,
    s.overallCgpa || '8.50',
    s.personalMobile || 'N/A',
    s.fatherMobile || s.motherMobile || s.parentMobile || 'N/A',
  ]);

  const reportMetadata = {
    program: selectedProgFilter === 'ALL' ? 'Department of Accounting & Finance' : selectedProgFilter === 'prog-ug' ? 'Undergraduate (UG)' : 'Postgraduate (PG)',
    course: selectedCourseFilter === 'ALL' ? 'B.Com Accounting & Finance / M.Com Business Analytics' : selectedCourseFilter,
    academicYear: 'AY 2025-26',
    semester: selectedSemFilter === 'ALL' ? 'All Semesters' : `Semester ${selectedSemFilter}`,
    division: 'Div A / B / C',
    subject: 'All Subjects',
    generatedBy: 'Admin / Student Affairs Section',
  };

  const handleOpenEdit = (s: Student360Profile) => {
    setEditingStudent(s);
    setShowEditModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    const target = studentToDelete;
    setActionLoadingId(target.id);
    
    try {
      if (onDeleteStudent) {
        await onDeleteStudent(target.id);
      }
      setStudentList((prev) => prev.filter((s) => s.id !== target.id && s.studentId !== target.id));
      setFeedbackMessage({ type: 'success', text: `Student ${target.fullName} (${target.rollNumber}) deleted successfully from database.` });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: `Failed to delete student: ${err.message || 'Server error'}` });
    } finally {
      setActionLoadingId(null);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Notification Banner */}
      {feedbackMessage && (
        <div className={`p-4 rounded-2xl border flex items-center space-x-3 transition-all ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs font-semibold">{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="ml-auto p-1 hover:bg-black/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Student 360° Profile Directory</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete academic, GPA matrix, skills, attendance, contact, and family records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportReportToPDF({ title: 'OFFICIAL STUDENT 360° DIRECTORY ROSTER REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => exportReportToExcel({ title: 'OFFICIAL STUDENT 360° DIRECTORY ROSTER REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => exportReportToCSV({ title: 'OFFICIAL STUDENT 360° DIRECTORY ROSTER REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
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
          <button
            onClick={() => setShowAdmitModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Student Admission</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center space-x-3 w-full md:w-auto flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-bold">Department:</span>
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
            >
              <option value="ALL">All Departments</option>
              {deptOptions.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-bold">Program:</span>
            <select
              value={selectedProgFilter}
              onChange={(e) => {
                setSelectedProgFilter(e.target.value);
                setSelectedCourseFilter('ALL');
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
            >
              <option value="ALL">All Programs</option>
              {progOptions.map((prog) => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-bold">Course:</span>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
            >
              <option value="ALL">All Courses</option>
              {courseOptions.map((crs) => (
                <option key={crs} value={crs}>{crs}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-bold">Semester:</span>
            <select
              value={selectedSemFilter}
              onChange={(e) => setSelectedSemFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={String(sem)}>Semester {sem}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-bold">Division:</span>
            <select
              value={selectedDivFilter}
              onChange={(e) => setSelectedDivFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
            >
              <option value="ALL">All Divisions</option>
              {['A', 'B', 'C'].map((div) => (
                <option key={div} value={div}>Division {div}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student Cards Roster */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => {
            const isItemLoading = actionLoadingId === s.id;
            return (
              <div key={s.id} className="relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between space-y-4">
                {isItemLoading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-xs rounded-2xl z-10 flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                    <span className="text-xs font-bold text-slate-700">Updating database...</span>
                  </div>
                )}

                <div className="flex items-start space-x-4">
                  <img
                    src={s.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-100 shrink-0"
                    alt={s.fullName || 'Student'}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">{s.fullName || 'Unnamed Student'}</span>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {s.rollNumber || 'N/A'}
                        </span>
                        {canEdit && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleOpenEdit(s)}
                              disabled={isItemLoading}
                              className="p-1 hover:bg-slate-100 text-indigo-600 rounded transition disabled:opacity-50"
                              title="Edit Student Profile"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setStudentToDelete(s)}
                              disabled={isItemLoading}
                              className="p-1 hover:bg-rose-100 text-rose-600 rounded transition disabled:opacity-50"
                              title="Delete Student Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5">{s.course || 'Degree Program'}</p>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {s.departmentName || 'Department'} • Sem {s.semester || 1}-{s.division || 'A'}
                    </p>

                    <div className="flex items-center space-x-3 mt-2 text-[11px]">
                      <span>
                        Att:{' '}
                        <strong className={(s.attendancePercentage ?? 100) >= 75 ? 'text-emerald-600' : 'text-rose-600'}>
                          {s.attendancePercentage ?? 100}%
                        </strong>
                      </span>
                      <span>
                        CGPA: <strong className="text-indigo-600">{s.overallCgpa || 'N/A'}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onOpen360(s)}
                    disabled={isItemLoading}
                    className="py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition shadow-sm disabled:opacity-50"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>360° Profile</span>
                  </button>
                  <button
                    onClick={() => exportStudent360ToPDF(s)}
                    disabled={isItemLoading}
                    className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition disabled:opacity-50"
                    title="Export Official Student 360° PDF Dossier"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Student Records Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            There are currently no students registered in the database. You can admit individual students or use the Bulk Upload tool to import students via CSV.
          </p>
          {canEdit && (
            <button
              onClick={() => setShowAdmitModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Admit First Student</span>
            </button>
          )}
        </div>
      )}

      {/* Confirmation Dialog for Deleting Student */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">Confirm Student Deletion</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete the student profile for <strong className="text-slate-800">{studentToDelete.fullName}</strong> ({studentToDelete.rollNumber})?
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Student ID:</span>
                <span className="font-mono font-bold text-slate-700">{studentToDelete.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Course & Sem:</span>
                <span className="font-semibold text-slate-700">{studentToDelete.course} (Sem {studentToDelete.semester}-{studentToDelete.division})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="text-slate-700">{studentToDelete.departmentName}</span>
              </div>
            </div>

            <p className="text-[11px] text-rose-600 font-medium">
              ⚠️ This will permanently remove the student's records from the database.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setStudentToDelete(null)}
                disabled={actionLoadingId !== null}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoadingId !== null}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
              >
                {actionLoadingId === studentToDelete.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting from DB...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Student Profile Form Modals (Create & Edit) */}
      <StudentProfileFormModal
        isOpen={showAdmitModal}
        mode="create"
        departments={departments}
        programs={programs}
        courses={courses}
        onClose={() => setShowAdmitModal(false)}
        onSave={async (newStudent) => {
          setIsUpdating(true);
          try {
            await onAdmitStudent(newStudent);
            setStudentList((prev) => [newStudent, ...prev]);
            setFeedbackMessage({ type: 'success', text: `New student ${newStudent.fullName} admitted and stored in PostgreSQL.` });
            setShowAdmitModal(false);
          } catch (err: any) {
            setFeedbackMessage({ type: 'error', text: `Error admitting student: ${err.message || 'Server error'}` });
          } finally {
            setIsUpdating(false);
          }
        }}
      />

      <StudentProfileFormModal
        isOpen={showEditModal}
        mode="edit"
        initialData={editingStudent || undefined}
        departments={departments}
        programs={programs}
        courses={courses}
        onClose={() => {
          setShowEditModal(false);
          setEditingStudent(null);
        }}
        onSave={async (updatedStudent) => {
          setIsUpdating(true);
          try {
            if (onUpdateStudent) {
              await onUpdateStudent(updatedStudent.id, updatedStudent);
            } else {
              await onAdmitStudent(updatedStudent);
            }
            setStudentList((prev) =>
              prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
            );
            setFeedbackMessage({ type: 'success', text: `Student ${updatedStudent.fullName} profile updated in PostgreSQL database.` });
            setShowEditModal(false);
            setEditingStudent(null);
          } catch (err: any) {
            setFeedbackMessage({ type: 'error', text: `Failed to update student: ${err.message || 'Server error'}` });
          } finally {
            setIsUpdating(false);
          }
        }}
      />

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="OFFICIAL STUDENT 360° DIRECTORY ROSTER REPORT"
        headers={exportHeaders}
        rows={exportRows}
        defaultMetadata={reportMetadata}
      />

    </div>
  );
};
