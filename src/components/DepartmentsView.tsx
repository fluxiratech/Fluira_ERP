import React, { useState } from 'react';
import { Department, Course, Subject, Role, Program, Faculty, AcademicYearItem, DepartmentActivity } from '../types';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Check,
  X,
  Layers,
  GraduationCap,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  Printer,
  FileSpreadsheet,
  FileText,
  Download,
  Calendar,
  Award,
} from 'lucide-react';
import { exportReportToPDF, exportReportToExcel, exportReportToCSV } from '../utils/reportExporter';
import { ExportReportModal } from './ExportReportModal';
import { DepartmentActivitiesView } from './DepartmentActivitiesView';
import { INITIAL_DEPARTMENT_ACTIVITIES } from '../data/mockData';

interface DepartmentsViewProps {
  departments: Department[];
  courses: Course[];
  subjects: Subject[];
  programs?: Program[];
  facultyList?: Faculty[];
  academicYears?: AcademicYearItem[];
  departmentActivities?: DepartmentActivity[];
  userRole?: Role;
  onAddSubject?: (newSub: Partial<Subject>) => void;
  onUpdateSubject?: (id: string, updated: Partial<Subject>) => void;
  onDeleteSubject?: (id: string) => void;
  onAddActivity?: (activity: DepartmentActivity) => void;
  onUpdateActivity?: (id: string, updated: DepartmentActivity) => void;
  onDeleteActivity?: (id: string) => void;
  onAddDepartment?: (dept: Department) => void;
  onUpdateDepartment?: (id: string, updated: Partial<Department>) => void;
  onDeleteDepartment?: (id: string) => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  departments: initialDepartments,
  courses: initialCourses,
  subjects: initialSubjects,
  programs = [],
  facultyList = [],
  departmentActivities = INITIAL_DEPARTMENT_ACTIVITIES,
  userRole = 'Admin',
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'CURRICULUM' | 'ACTIVITIES'>('CURRICULUM');
  const [deptList, setDeptList] = useState<Department[]>(initialDepartments);
  const [subjectList, setSubjectList] = useState<Subject[]>(initialSubjects);

  React.useEffect(() => {
    setDeptList(initialDepartments);
  }, [initialDepartments]);

  React.useEffect(() => {
    setSubjectList(initialSubjects);
  }, [initialSubjects]);

  // Program-wise & Hierarchy Filters
  const [selectedProgId, setSelectedProgId] = useState<string>('prog-ug');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('course-baf');
  const [selectedSemFilter, setSelectedSemFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Department Modal States
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptHod, setDeptHod] = useState('');
  const [deptEstd, setDeptEstd] = useState(2010);
  const [deptStudents, setDeptStudents] = useState(120);
  const [deptFaculty, setDeptFaculty] = useState(10);

  // Subject Modal States
  const [showSubModal, setShowSubModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subProgId, setSubProgId] = useState<string>('prog-ug');
  const [subCourseId, setSubCourseId] = useState<string>('course-baf');
  const [subSem, setSubSem] = useState<number>(1);
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subCredits, setSubCredits] = useState(4);
  const [subType, setSubType] = useState<'Theory' | 'Practical' | 'Lab' | 'Elective'>('Theory');
  const [subFacultyId, setSubFacultyId] = useState<string>(facultyList[0]?.id || 'u-fac-patel');
  const [subStatus, setSubStatus] = useState<'Active' | 'Inactive'>('Active');
  const [modalError, setModalError] = useState<string>('');
  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const canEdit = userRole === 'Admin' || userRole === 'HOD';

  // Available courses for selected Program filter
  const availableCoursesForFilter = initialCourses.filter((c) => selectedProgId === 'ALL' || c.programId === selectedProgId);

  // Program change handler for main filter
  const handleProgFilterChange = (progId: string) => {
    setSelectedProgId(progId);
    if (progId !== 'ALL') {
      const matchCourse = initialCourses.find((c) => c.programId === progId);
      if (matchCourse) setSelectedCourseId(matchCourse.id);
    } else {
      setSelectedCourseId('ALL');
    }
  };

  // Filtered subjects based on Program, Course, Semester & Search Query
  const filteredSubjects = subjectList.filter((s) => {
    const matchesProg = selectedProgId === 'ALL' || s.programId === selectedProgId || (selectedProgId === 'prog-ug' && !s.programId);
    const matchesCourse = selectedCourseId === 'ALL' || s.courseId === selectedCourseId || (selectedCourseId === 'course-baf' && s.courseCode === 'BAF');
    const matchesSem = selectedSemFilter === 'ALL' || String(s.semester) === selectedSemFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.assignedFacultyName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProg && matchesCourse && matchesSem && matchesSearch;
  });

  const exportHeaders = ['Subject Code', 'Subject Name', 'Program & Course', 'Semester', 'Credits', 'Type', 'Assigned Faculty', 'Status'];
  const exportRows = filteredSubjects.map((s) => [
    s.code,
    s.name,
    s.courseCode ? `${s.programName || 'UG'} - ${s.courseCode}` : 'B.Com Accounting & Finance',
    `Semester ${s.semester}`,
    s.credits,
    s.type || 'Theory',
    s.assignedFacultyName || 'Unassigned',
    s.status || 'Active',
  ]);

  const reportMetadata = {
    program: selectedProgId === 'ALL' ? 'Department of Accounting & Finance' : selectedProgId === 'prog-ug' ? 'B.Com (Accounting & Finance)' : 'M.Com Business Analytics',
    course: selectedCourseId === 'ALL' ? 'B.Com Accounting & Finance / M.Com Business Analytics' : selectedCourseId,
    academicYear: 'AY 2025-26',
    semester: selectedSemFilter === 'ALL' ? 'All Semesters' : `Semester ${selectedSemFilter}`,
    division: 'Div A / B / C',
    subject: 'All Subjects',
    generatedBy: 'Curriculum Committee / HOD',
  };

  // Program change handler inside Subject Modal
  const handleModalProgChange = (progId: string) => {
    setSubProgId(progId);
    const firstCourse = initialCourses.find((c) => c.programId === progId);
    if (firstCourse) setSubCourseId(firstCourse.id);
    setSubSem(1);
    setModalError('');
  };

  // Open Subject Add Modal
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubProgId(selectedProgId !== 'ALL' ? selectedProgId : 'prog-ug');
    setSubCourseId(selectedCourseId !== 'ALL' ? selectedCourseId : 'course-baf');
    setSubSem(selectedSemFilter !== 'ALL' ? Number(selectedSemFilter) : 1);
    setSubName('');
    setSubCode('');
    setSubCredits(4);
    setSubType('Theory');
    setSubFacultyId(facultyList[0]?.id || 'u-fac-patel');
    setSubStatus('Active');
    setModalError('');
    setShowSubModal(true);
  };

  // Open Subject Edit Modal
  const handleOpenEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setSubProgId(sub.programId || 'prog-ug');
    setSubCourseId(sub.courseId || 'course-baf');
    setSubSem(sub.semester || 1);
    setSubName(sub.name);
    setSubCode(sub.code);
    setSubCredits(sub.credits);
    setSubType(sub.type || 'Theory');
    setSubFacultyId(sub.assignedFacultyId || facultyList[0]?.id || 'u-fac-patel');
    setSubStatus(sub.status || 'Active');
    setModalError('');
    setShowSubModal(true);
  };

  // Toggle Subject Active Status
  const handleToggleSubjectStatus = (sub: Subject) => {
    const newStatus = sub.status === 'Inactive' ? 'Active' : 'Inactive';
    setSubjectList((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, status: newStatus } : s))
    );
    if (onUpdateSubject) {
      onUpdateSubject(sub.id, { status: newStatus });
    }
  };

  // Delete Subject
  const handleDeleteSubject = (subId: string) => {
    const sub = subjectList.find((s) => s.id === subId);
    if (confirm(`Are you sure you want to delete subject '${sub?.name}' (${sub?.code})?`)) {
      setSubjectList((prev) => prev.filter((s) => s.id !== subId));
      if (onDeleteSubject) {
        onDeleteSubject(subId);
      }
    }
  };

  // Save Subject with Duplicate Prevention
  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    const trimmedCode = subCode.trim().toUpperCase();
    const trimmedName = subName.trim();

    // Check duplicate by code or name within same Program & Course & Semester
    const duplicate = subjectList.find(
      (s) =>
        s.id !== (editingSubject?.id || '') &&
        (s.code.toUpperCase() === trimmedCode || s.name.toLowerCase() === trimmedName.toLowerCase()) &&
        s.programId === subProgId &&
        s.courseId === subCourseId &&
        Number(s.semester) === Number(subSem)
    );

    if (duplicate) {
      setModalError(
        `Duplicate Subject Conflict: '${duplicate.name}' (${duplicate.code}) already exists in Semester ${subSem}.`
      );
      return;
    }

    const assignedFacObj = facultyList.find((f) => f.id === subFacultyId);
    const assignedFacName = assignedFacObj?.fullName || 'Prof. Amit Patel';
    const courseObj = initialCourses.find((c) => c.id === subCourseId);
    const progObj = programs.find((p) => p.id === subProgId);

    if (editingSubject) {
      const updated: Subject = {
        ...editingSubject,
        name: trimmedName,
        code: trimmedCode,
        programId: subProgId,
        programName: progObj?.code || 'UG',
        courseId: subCourseId,
        courseCode: courseObj?.courseCode || 'BAF',
        semester: Number(subSem),
        credits: Number(subCredits),
        type: subType,
        assignedFacultyId: subFacultyId,
        assignedFacultyName: assignedFacName,
        status: subStatus,
      };

      setSubjectList((prev) => prev.map((s) => (s.id === editingSubject.id ? updated : s)));
      if (onUpdateSubject) {
        onUpdateSubject(editingSubject.id, updated);
      }
    } else {
      const newSub: Subject = {
        id: `sub-${Date.now()}`,
        name: trimmedName,
        code: trimmedCode,
        departmentId: 'dept-af',
        programId: subProgId,
        programName: progObj?.code || 'UG',
        courseId: subCourseId,
        courseCode: courseObj?.courseCode || 'BAF',
        semester: Number(subSem),
        credits: Number(subCredits),
        type: subType,
        assignedFacultyId: subFacultyId,
        assignedFacultyName: assignedFacName,
        status: subStatus,
      };

      setSubjectList((prev) => [...prev, newSub]);
      if (onAddSubject) {
        onAddSubject(newSub);
      }
    }

    setShowSubModal(false);
  };

  // Department Actions
  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptCode('');
    setDeptHod('Dr. Sunita Kulkarni');
    setDeptEstd(2015);
    setDeptStudents(120);
    setDeptFaculty(12);
    setShowDeptModal(true);
  };

  const handleOpenEditDept = (d: Department) => {
    setEditingDept(d);
    setDeptName(d.name);
    setDeptCode(d.code);
    setDeptHod(d.hodName);
    setDeptEstd(d.establishedYear);
    setDeptStudents(d.totalStudents);
    setDeptFaculty(d.totalFaculty);
    setShowDeptModal(true);
  };

  const handleDeleteDept = (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      setDeptList((prev) => prev.filter((d) => d.id !== id));
      if (onDeleteDepartment) onDeleteDepartment(id);
    }
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDept) {
      const updatedDept: Department = {
        ...editingDept,
        name: deptName,
        code: deptCode,
        hodName: deptHod,
        establishedYear: Number(deptEstd),
        totalStudents: Number(deptStudents),
        totalFaculty: Number(deptFaculty),
      };
      setDeptList((prev) =>
        prev.map((d) => (d.id === editingDept.id ? updatedDept : d))
      );
      if (onUpdateDepartment) onUpdateDepartment(editingDept.id, updatedDept);
    } else {
      const newDept: Department = {
        id: `dept-${Date.now()}`,
        name: deptName,
        code: deptCode,
        hodId: 'u-hod-cs',
        hodName: deptHod,
        establishedYear: Number(deptEstd),
        totalStudents: Number(deptStudents),
        totalFaculty: Number(deptFaculty),
        avgAttendancePct: 88,
      };
      setDeptList((prev) => [...prev, newDept]);
      if (onAddDepartment) onAddDepartment(newDept);
    }
    setShowDeptModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation Header */}
      <div className="bg-slate-900 p-2 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <button
            onClick={() => setActiveSubTab('CURRICULUM')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'CURRICULUM'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Curriculum & Syllabus</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ACTIVITIES')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'ACTIVITIES'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Department Activities & Events</span>
          </button>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAddSubject}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Curriculum Subject</span>
          </button>
        )}
      </div>

      {activeSubTab === 'ACTIVITIES' ? (
        <DepartmentActivitiesView
          activities={departmentActivities}
          departments={deptList}
          userRole={userRole}
          onAddActivity={onAddActivity}
          onUpdateActivity={onUpdateActivity}
          onDeleteActivity={onDeleteActivity}
        />
      ) : (
        <>
          {/* Top Banner */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Program-Wise Academic Curriculum & Subjects</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official syllabus structure for B.Com (Accounting & Finance) and M.Com Business Analytics with Program → Academic Year → Semester hierarchy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportReportToPDF({ title: 'OFFICIAL PROGRAM-WISE ACADEMIC CURRICULUM REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => exportReportToExcel({ title: 'OFFICIAL PROGRAM-WISE ACADEMIC CURRICULUM REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => exportReportToCSV({ title: 'OFFICIAL PROGRAM-WISE ACADEMIC CURRICULUM REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
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
          {canEdit && (
            <>
              <button
                onClick={handleOpenAddSubject}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subject</span>
              </button>
              <button
                onClick={handleOpenAddDept}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                <Building2 className="w-4 h-4" />
                <span>Manage Depts</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Program-Wise Filter Control Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-700">Program:</span>
            <select
              value={selectedProgId}
              onChange={(e) => handleProgFilterChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Programs</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-700">Course / Program:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Courses</option>
              {availableCoursesForFilter.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700">Semester:</span>
            <select
              value={selectedSemFilter}
              onChange={(e) => setSelectedSemFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6].map((sem) => (
                <option key={sem} value={String(sem)}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search subject or faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Program Curriculum Sections */}
      {programs
        .filter((p) => selectedProgId === 'ALL' || p.id === selectedProgId)
        .map((prog) => {
          const progCourses = initialCourses.filter((c) => c.programId === prog.id);

          return (
            <div key={prog.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Program Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-black text-sm">
                    {prog.code}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {prog.code === 'UG' ? 'Undergraduate Program (UG) – B.Com (Accounting & Finance)' : 'Postgraduate Program (PG) – M.Com Business Analytics'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {prog.code === 'UG' ? 'Duration: 3 Years | 6 Semesters | Academic Years: FY, SY, TY' : 'Duration: 2 Years | 4 Semesters | Academic Years: Part I, Part II'}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                  Official Syllabus Auto-Populated
                </span>
              </div>

              {/* Courses & Semesters under this Program */}
              {progCourses
                .filter((c) => selectedCourseId === 'ALL' || c.id === selectedCourseId)
                .map((course) => {
                  const maxSem = course.totalSemesters;
                  const semNumbers = Array.from({ length: maxSem }, (_, i) => i + 1).filter(
                    (s) => selectedSemFilter === 'ALL' || Number(selectedSemFilter) === s
                  );

                  return (
                    <div key={course.id} className="space-y-6">
                      {semNumbers.map((semNum) => {
                        const semSubjects = filteredSubjects.filter(
                          (s) => (s.programId === prog.id || (!s.programId && prog.id === 'prog-ug')) && (s.courseId === course.id || (!s.courseId && course.id === 'course-baf')) && Number(s.semester) === semNum
                        );

                        let academicYearLabel = '';
                        if (prog.code === 'UG') {
                          if (semNum <= 2) academicYearLabel = 'First Year (FY)';
                          else if (semNum <= 4) academicYearLabel = 'Second Year (SY)';
                          else academicYearLabel = 'Third Year (TY)';
                        } else {
                          if (semNum <= 2) academicYearLabel = 'Part I';
                          else academicYearLabel = 'Part II';
                        }

                        return (
                          <div key={`sem-${semNum}`} className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-md">
                                  {academicYearLabel}
                                </span>
                                <span className="text-xs font-bold text-slate-800">
                                  Semester {semNum} ({semSubjects.length} Subjects)
                                </span>
                              </div>
                              {canEdit && (
                                <button
                                  onClick={() => {
                                    setSubProgId(prog.id);
                                    setSubCourseId(course.id);
                                    setSubSem(semNum);
                                    handleOpenAddSubject();
                                  }}
                                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add Subject to Sem {semNum}</span>
                                </button>
                              )}
                            </div>

                            {/* Subjects Grid for this Semester */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {semSubjects.map((sub) => {
                                const isInactive = sub.status === 'Inactive';
                                return (
                                  <div
                                    key={sub.id}
                                    className={`p-3.5 bg-white rounded-xl border transition shadow-sm space-y-2 ${
                                      isInactive ? 'opacity-60 border-slate-300 bg-slate-100' : 'border-slate-200 hover:border-indigo-300'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                                          {sub.code}
                                        </span>
                                        <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
                                          {sub.name}
                                        </h4>
                                      </div>
                                      <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                          sub.type === 'Practical' || sub.type === 'Lab'
                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                            : sub.type === 'Elective'
                                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                                        }`}
                                      >
                                        {sub.type || 'Theory'}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-600">
                                      <div className="flex items-center space-x-1">
                                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="font-semibold text-slate-800 truncate max-w-[130px]">
                                          {sub.assignedFacultyName || 'Unassigned'}
                                        </span>
                                      </div>
                                      <span className="font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                        {sub.credits} Credits
                                      </span>
                                    </div>

                                    {/* Action Buttons */}
                                    {canEdit && (
                                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                                        <button
                                          onClick={() => handleToggleSubjectStatus(sub)}
                                          className={`flex items-center space-x-1 font-bold ${
                                            isInactive ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'
                                          }`}
                                          title="Click to Activate / Deactivate"
                                        >
                                          {isInactive ? <ToggleLeft className="w-4 h-4 text-slate-400" /> : <ToggleRight className="w-4 h-4 text-emerald-600" />}
                                          <span>{isInactive ? 'Inactive' : 'Active'}</span>
                                        </button>

                                        <div className="flex items-center space-x-1">
                                          <button
                                            onClick={() => handleOpenEditSubject(sub)}
                                            className="p-1 hover:bg-slate-100 text-slate-600 rounded transition"
                                            title="Edit Subject Details"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteSubject(sub.id)}
                                            className="p-1 hover:bg-rose-50 text-rose-600 rounded transition"
                                            title="Delete Subject"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {semSubjects.length === 0 && (
                                <div className="col-span-full py-4 text-center text-xs text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-200">
                                  No subjects assigned for Semester {semNum} yet.
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
            </div>
          );
        })}

      {/* Add / Edit Subject Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {editingSubject ? 'Edit Official Syllabus Subject' : 'Add New Curriculum Subject'}
                </h3>
              </div>
              <button onClick={() => setShowSubModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSubject} className="space-y-3 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Program *</label>
                  <select
                    value={subProgId}
                    onChange={(e) => handleModalProgChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Semester *</label>
                  <select
                    value={subSem}
                    onChange={(e) => setSubSem(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800"
                  >
                    {Array.from({ length: subProgId === 'prog-pg' ? 4 : 6 }, (_, i) => i + 1).map((s) => (
                      <option key={s} value={s}>
                        Semester {s} ({subProgId === 'prog-ug' ? (s <= 2 ? 'FY' : s <= 4 ? 'SY' : 'TY') : (s <= 2 ? 'Part I' : 'Part II')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Subject Full Title *</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Financial Accounting – I"
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Subject Code *</label>
                  <input
                    type="text"
                    required
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    placeholder="e.g. AF101"
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold uppercase text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Credits *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={subCredits}
                    onChange={(e) => setSubCredits(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Type *</label>
                  <select
                    value={subType}
                    onChange={(e) => setSubType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                    <option value="Lab">Lab</option>
                    <option value="Elective">Elective</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Assigned Faculty *</label>
                  <select
                    value={subFacultyId}
                    onChange={(e) => setSubFacultyId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800"
                  >
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.fullName} ({f.designation})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Subject Status *</label>
                  <select
                    value={subStatus}
                    onChange={(e) => setSubStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800"
                  >
                    <option value="Active">Active (In Syllabus)</option>
                    <option value="Inactive">Inactive (Deactivated)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {editingDept ? 'Edit Department Details' : 'Add New Academic Department'}
              </h3>
              <button onClick={() => setShowDeptModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="space-y-3 text-xs font-medium">
              <div>
                <label className="text-slate-700 block mb-1 font-bold">Department Name</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Department of Accounting & Finance"
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Department Code</label>
                  <input
                    type="text"
                    required
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    placeholder="e.g. AF"
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">HOD Name</label>
                  <input
                    type="text"
                    required
                    value={deptHod}
                    onChange={(e) => setDeptHod(e.target.value)}
                    placeholder="e.g. Dr. Sunita Kulkarni"
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Estd Year</label>
                  <input
                    type="number"
                    value={deptEstd}
                    onChange={(e) => setDeptEstd(Number(e.target.value))}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Total Students</label>
                  <input
                    type="number"
                    value={deptStudents}
                    onChange={(e) => setDeptStudents(Number(e.target.value))}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Faculty</label>
                  <input
                    type="number"
                    value={deptFaculty}
                    onChange={(e) => setDeptFaculty(Number(e.target.value))}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="OFFICIAL PROGRAM-WISE ACADEMIC CURRICULUM REPORT"
        headers={exportHeaders}
        rows={exportRows}
        defaultMetadata={reportMetadata}
      />
        </>
      )}
    </div>
  );
};
