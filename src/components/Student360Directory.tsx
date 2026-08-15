import React, { useState } from 'react';
import { Student360Profile, Department, User, Program, Course, AcademicYearItem } from '../types';
import { Users, Search, Filter, Plus, Eye, AlertTriangle, Download, CheckCircle2, CreditCard, UserCheck, BookOpen, Award, Edit2, Trash2, X, Printer, Layers, GraduationCap, FileSpreadsheet, FileText } from 'lucide-react';
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
  onAdmitStudent: (newStudent: Partial<Student360Profile>) => void;
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
  userRole,
  currentUser,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [showAdmitModal, setShowAdmitModal] = useState(false);

  // If logged in as Student, render ONLY their own 360° Profile
  if (userRole === 'Student') {
    const myStudent = students.find((s) => s.id === currentUser?.linkedStudentId || s.email === currentUser?.email) || students[0];

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
              alt={myStudent.fullName}
            />
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{myStudent.fullName}</h2>
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">
                  VERIFIED ENROLLED STUDENT
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                PRN / Student ID: <span className="font-bold text-slate-800">{myStudent.studentId}</span> • Roll No: <span className="font-bold text-slate-800">{myStudent.rollNumber}</span>
              </p>
              <p className="text-xs text-slate-600">
                Course: <span className="font-semibold text-slate-800">{myStudent.course}</span> ({myStudent.departmentName}) • Sem {myStudent.semester}, Division {myStudent.division}
              </p>
              <div className="flex items-center gap-4 text-xs pt-1">
                <span className="text-indigo-600 font-bold">CGPA: {myStudent.overallCgpa || '8.80'}</span>
                <span className="text-emerald-600 font-bold">Attendance: {myStudent.attendancePercentage}%</span>
                <span className="text-slate-500">Academic Year: {myStudent.academicYear}</span>
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
                <div><span className="text-slate-500 block">Gender:</span><span className="font-bold text-slate-800">{myStudent.gender}</span></div>
                <div><span className="text-slate-500 block">DOB:</span><span className="font-bold text-slate-800">{myStudent.dob}</span></div>
                <div><span className="text-slate-500 block">Blood Group:</span><span className="font-bold text-slate-800">{myStudent.bloodGroup}</span></div>
                <div><span className="text-slate-500 block">Category:</span><span className="font-bold text-slate-800">{myStudent.category}</span></div>
                <div><span className="text-slate-500 block">Mobile:</span><span className="font-bold text-slate-800">{myStudent.personalMobile}</span></div>
                <div><span className="text-slate-500 block">Email:</span><span className="font-bold text-slate-800">{myStudent.email}</span></div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-indigo-950 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
                Parent & Guardian Information
              </h3>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div><span className="text-slate-500 block">Father Name:</span><span className="font-bold text-slate-800">{myStudent.fatherName || 'Rajesh Sharma'}</span></div>
                <div><span className="text-slate-500 block">Mother Name:</span><span className="font-bold text-slate-800">{myStudent.motherName || 'Sunita Sharma'}</span></div>
                <div><span className="text-slate-500 block">Parent Mobile:</span><span className="font-bold text-slate-800">{myStudent.parentMobile || '+91 98221 00112'}</span></div>
                <div><span className="text-slate-500 block">Parent Email:</span><span className="font-bold text-slate-800">{myStudent.parentEmail || 'parents@gmail.com'}</span></div>
              </div>
            </div>

            {/* SSC & HSC Academic Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-indigo-950 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
                SSC (Class 10) & HSC (Class 12) Qualifications
              </h3>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div><span className="text-slate-500 block">SSC Percentage:</span><span className="font-bold text-slate-800">{myStudent.sscPercentage || 88.4}% ({myStudent.sscYear || 2020})</span></div>
                <div><span className="text-slate-500 block">SSC Board:</span><span className="font-bold text-slate-800">{myStudent.sscBoard || 'Maharashtra State Board'}</span></div>
                <div><span className="text-slate-500 block">HSC Percentage:</span><span className="font-bold text-slate-800">{myStudent.hscPercentage || 85.2}% ({myStudent.hscYear || 2022})</span></div>
                <div><span className="text-slate-500 block">HSC Board:</span><span className="font-bold text-slate-800">{myStudent.hscBoard || 'Maharashtra State Board'}</span></div>
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
                    {(myStudent.programmingLanguages || ['Python', 'Java', 'C++', 'SQL', 'React']).map((s, idx) => {
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
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                        AWS Certified Cloud Practitioner
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

  // Form & Student State
  const [studentList, setStudentList] = useState<Student360Profile[]>(students);
  const [editingStudent, setEditingStudent] = useState<Student360Profile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCgpa, setEditCgpa] = useState<number>(8.5);

  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [admitProgId, setAdmitProgId] = useState<string>('prog-ug');
  const [admitCourseId, setAdmitCourseId] = useState<string>('course-baf');
  const [admitAyCode, setAdmitAyCode] = useState<string>('FY');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-af');
  const [semester, setSemester] = useState<number>(1);
  const [division, setDivision] = useState<string>('A');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');

  // Filter & Search States
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedProgFilter, setSelectedProgFilter] = useState<string>('ALL');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [selectedSemFilter, setSelectedSemFilter] = useState<string>('ALL');
  const [selectedDivFilter, setSelectedDivFilter] = useState<string>('ALL');

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const canEdit = userRole === 'Admin' || userRole === 'HOD';

  const availableCoursesForAdmit = courses.filter((c) => c.programId === admitProgId);
  const availableAcademicYearsForAdmit = academicYears.filter((ay) => ay.programId === admitProgId);

  const handleProgramChange = (progId: string) => {
    setAdmitProgId(progId);
    const firstCourse = courses.find((c) => c.programId === progId);
    if (firstCourse) setAdmitCourseId(firstCourse.id);
    const firstAy = academicYears.find((ay) => ay.programId === progId);
    if (firstAy) setAdmitAyCode(firstAy.code);
    setSemester(1);
  };

  const filtered = studentList.filter((s) => {
    const matchesDept = selectedDeptFilter === 'ALL' || s.departmentId === selectedDeptFilter || (s.departmentName && s.departmentName.toLowerCase().includes(selectedDeptFilter.toLowerCase()));
    const matchesProg = selectedProgFilter === 'ALL' || s.programId === selectedProgFilter || (selectedProgFilter === 'prog-ug' && s.course.includes('B.Com')) || (selectedProgFilter === 'prog-pg' && s.course.includes('M.Com')) || (s.programName && s.programName.toLowerCase().includes(selectedProgFilter.toLowerCase())) || (selectedProgFilter === 'Undergraduate' && s.course.includes('B.Com')) || (selectedProgFilter === 'Postgraduate' && s.course.includes('M.Com'));
    const matchesCourse = selectedCourseFilter === 'ALL' || s.courseId === selectedCourseFilter || s.course.toLowerCase().includes(selectedCourseFilter.toLowerCase()) || (selectedCourseFilter === 'BAF' && (s.course.includes('BAF') || s.course.includes('B.Com')));
    const matchesSem = selectedSemFilter === 'ALL' || String(s.semester) === selectedSemFilter;
    const matchesDiv = selectedDivFilter === 'ALL' || s.division === selectedDivFilter;
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase());
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

  const handleAdmitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const progObj = programs.find((p) => p.id === admitProgId);
    const courseObj = courses.find((c) => c.id === admitCourseId);
    const deptObj = departments.find((d) => d.id === departmentId) || departments[0];

    const courseTitle = courseObj?.courseName || (admitProgId === 'prog-pg' ? 'M.Com Business Analytics' : 'B.Com Accounting and Finance');

    const newStuObj: Student360Profile = {
      id: `stu-${Date.now()}`,
      studentId: `STU${Math.floor(100000 + Math.random() * 900000)}`,
      rollNumber,
      fullName,
      gender: 'Male',
      dob: '2004-01-01',
      admissionDate: new Date().toISOString().split('T')[0],
      passportPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      bloodGroup: 'O+',
      category: 'General',
      course: courseTitle,
      programId: admitProgId,
      programName: progObj?.code || 'UG',
      courseId: admitCourseId,
      courseCode: courseObj?.courseCode || 'BAF',
      academicYearCode: admitAyCode,
      departmentId: departmentId || 'dept-af',
      departmentName: deptObj?.name || 'Department of Accounting and Finance',
      semester,
      division,
      academicYear: '2024-2025',

      personalMobile: mobile,
      whatsappNumber: mobile,
      email,
      emergencyContact: '+91 98765 00000',
      permanentAddress: 'Mumbai, Maharashtra',
      temporaryAddress: 'Mumbai, Maharashtra',

      fatherName: 'Rajesh Sharma',
      motherName: 'Sunita Sharma',
      guardianName: 'N/A',
      parentMobile: '+91 98765 43210',
      parentEmail: 'parent@gmail.com',
      parentOccupation: 'Business',

      sscSchoolName: 'Apex High School',
      sscBoard: 'CBSE',
      sscPassingYear: '2020',
      sscPercentage: 91.2,

      hscCollegeName: 'Apex Junior College',
      hscBoard: 'HSC Board',
      hscStream: 'Commerce',
      hscPassingYear: '2022',
      hscPercentage: 88.5,

      sem1Gpa: 8.5,
      sem2Gpa: 8.7,
      sem3Gpa: 8.8,
      sem4Gpa: 8.9,
      overallCgpa: 8.6,

      totalLectures: 160,
      attendedLectures: 140,
      attendancePercentage: 88,

      technicalSkills: ['Financial Accounting', 'Excel', 'Tally Prime'],
      programmingLanguages: ['Excel VBA', 'SQL'],
      certifications: [{ title: 'GST Practitioner Certification', issuer: 'ICAI', year: '2024' }],
      internships: [],
      projects: [],
      sportsAndExtra: [],
    };
    setStudentList((prev) => [newStuObj, ...prev]);
    onAdmitStudent(newStuObj);
    setShowAdmitModal(false);
  };

  const handleOpenEdit = (s: Student360Profile) => {
    setEditingStudent(s);
    setFullName(s.fullName);
    setRollNumber(s.rollNumber);
    setDepartmentId(s.departmentId);
    setSemester(s.semester);
    setDivision(s.division);
    setMobile(s.personalMobile);
    setEmail(s.email);
    setEditCgpa(s.overallCgpa);
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    const deptObj = departments.find((d) => d.id === departmentId);
    setStudentList((prev) =>
      prev.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              fullName,
              rollNumber,
              departmentId,
              departmentName: deptObj?.name || s.departmentName,
              semester: Number(semester),
              division,
              personalMobile: mobile,
              email,
              overallCgpa: Number(editCgpa),
            }
          : s
      )
    );
    setShowEditModal(false);
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Are you sure you want to delete this student profile record?')) {
      setStudentList((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      
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
              <option value="Accounting & Finance">Accounting & Finance</option>
              <option value="Business Analytics">Business Analytics</option>
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
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
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
              {(selectedProgFilter === 'ALL' || selectedProgFilter === 'Undergraduate') && (
                <option value="BAF">BAF</option>
              )}
              {(selectedProgFilter === 'ALL' || selectedProgFilter === 'Postgraduate') && (
                <option value="M.Com">M.Com</option>
              )}
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
              {(selectedCourseFilter === 'M.Com' ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6]).map((sem) => (
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
          {filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-start space-x-4">
                <img src={s.passportPhoto} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-100 shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">{s.fullName}</span>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {s.rollNumber}
                      </span>
                      {canEdit && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1 hover:bg-slate-100 text-indigo-600 rounded transition"
                            title="Edit Student Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.id)}
                            className="p-1 hover:bg-rose-100 text-rose-600 rounded transition"
                            title="Delete Student Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-0.5">{s.course}</p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {s.departmentName} • Sem {s.semester}-{s.division}
                  </p>

                  <div className="flex items-center space-x-3 mt-2 text-[11px]">
                    <span>Att: <strong className={s.attendancePercentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}>{s.attendancePercentage}%</strong></span>
                    <span>CGPA: <strong className="text-indigo-600">{s.overallCgpa}</strong></span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onOpen360(s)}
                  className="py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>360° Profile</span>
                </button>
                <button
                  onClick={() => exportStudent360ToPDF(s)}
                  className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition"
                  title="Export Official Student 360° PDF Dossier"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
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

      {/* Comprehensive Student Profile Form Modals (Create & Edit) */}
      <StudentProfileFormModal
        isOpen={showAdmitModal}
        mode="create"
        departments={departments}
        programs={programs}
        courses={courses}
        onClose={() => setShowAdmitModal(false)}
        onSave={(newStudent) => {
          setStudentList((prev) => [newStudent, ...prev]);
          onAdmitStudent(newStudent);
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
        onSave={(updatedStudent) => {
          setStudentList((prev) =>
            prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
          );
          onAdmitStudent(updatedStudent);
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
