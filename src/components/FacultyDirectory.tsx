import React, { useState, useEffect } from 'react';
import { Faculty, Department, Role, Course, Program, ClassTeacherAssignment } from '../types';
import { UserCog, Mail, Phone, BookOpen, Clock, Building2, Plus, Edit2, Trash2, Search, X, Printer, FileSpreadsheet, FileText, Download, UserCheck, Upload, User } from 'lucide-react';
import { exportReportToPDF, exportReportToExcel, exportReportToCSV } from '../utils/reportExporter';
import { convertFileToJPGDataUrl } from '../utils/imageUtils';
import { ExportReportModal } from './ExportReportModal';
import { ClassTeacherAssignModal } from './ClassTeacherAssignModal';
import { BulkUploadModule } from './BulkUploadModule';

interface FacultyDirectoryProps {
  facultyList: Faculty[];
  departments: Department[];
  courses?: Course[];
  programs?: Program[];
  subjects?: import('../types').Subject[];
  classTeacherAssignments?: ClassTeacherAssignment[];
  userRole?: Role;
  userName?: string;
  onAssignClassTeacher?: (assignment: ClassTeacherAssignment) => void;
  onDeleteClassTeacherAssignment?: (id: string) => void;
  onImportFacultySuccess?: (newFaculty: Partial<Faculty>[]) => void;
  onAddFaculty?: (fac: Faculty) => void;
  onUpdateFaculty?: (id: string, updated: Partial<Faculty>) => void;
  onDeleteFaculty?: (id: string) => void;
}

export const FacultyDirectory: React.FC<FacultyDirectoryProps> = ({
  facultyList: initialFaculty,
  departments,
  courses = [],
  programs = [],
  subjects = [],
  classTeacherAssignments = [],
  userRole = 'HOD',
  userName = 'Faculty User',
  onAssignClassTeacher,
  onDeleteClassTeacherAssignment,
  onImportFacultySuccess,
  onAddFaculty,
  onUpdateFaculty,
  onDeleteFaculty,
}) => {
  const [facList, setFacList] = useState<Faculty[]>(initialFaculty);

  useEffect(() => {
    setFacList(initialFaculty);
  }, [initialFaculty]);

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [showClassTeacherModal, setShowClassTeacherModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  // Form States
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-cs');
  const [qualification, setQualification] = useState('Ph.D. Computer Science');
  const [experienceYears, setExperienceYears] = useState(8);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('9876543210');
  const [weeklyWorkloadHours, setWeeklyWorkloadHours] = useState(16);
  const [photo, setPhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200');
  const [allocatedSubjects, setAllocatedSubjects] = useState<string[]>([]);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const canEdit = userRole === 'Admin' || userRole === 'HOD';

  const filtered = facList.filter((f) => {
    const matchesDept = selectedDept === 'ALL' || f.departmentId === selectedDept;
    const matchesSearch =
      f.fullName.toLowerCase().includes(search.toLowerCase()) ||
      f.departmentName.toLowerCase().includes(search.toLowerCase()) ||
      f.designation.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const exportHeaders = ['Faculty Name', 'Designation', 'Department', 'Qualification', 'Experience', 'Weekly Workload', 'Email', 'Mobile'];
  const exportRows = filtered.map((f) => [
    f.fullName,
    f.designation,
    f.departmentName,
    f.qualification,
    `${f.experienceYears} Years`,
    `${f.weeklyWorkloadHours} Hours/Week`,
    f.email,
    f.mobile,
  ]);

  const reportMetadata = {
    program: selectedDept === 'ALL' ? 'Department of Accounting & Finance' : selectedDept,
    course: 'B.Com Accounting & Finance / M.Com Business Analytics',
    academicYear: 'AY 2025-26',
    semester: 'All Semesters',
    division: 'Div A / B / C',
    subject: 'All Workloads',
    generatedBy: 'Principal / HOD Office',
  };

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setFullName('');
    setDesignation('Assistant Professor');
    setDepartmentId(departments[0]?.id || 'dept-cs');
    setQualification('Ph.D. Computer Engineering');
    setExperienceYears(6);
    setEmail('');
    setMobile('9876543210');
    setWeeklyWorkloadHours(16);
    setPhoto('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200');
    setAllocatedSubjects([]);
    setShowModal(true);
  };

  const handleOpenEdit = (fac: Faculty) => {
    setEditingFaculty(fac);
    setFullName(fac.fullName);
    setDesignation(fac.designation);
    setDepartmentId(fac.departmentId);
    setQualification(fac.qualification);
    setExperienceYears(fac.experienceYears);
    setEmail(fac.email);
    setMobile(fac.mobile);
    setWeeklyWorkloadHours(fac.weeklyWorkloadHours);
    setPhoto(fac.photo);
    setAllocatedSubjects(fac.allocatedSubjects || []);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this faculty member?')) {
      setFacList((prev) => prev.filter((f) => f.id !== id));
      if (onDeleteFaculty) onDeleteFaculty(id);
    }
  };

  const toggleSubjectAllocation = (subId: string) => {
    setAllocatedSubjects((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const deptObj = departments.find((d) => d.id === departmentId);
    const deptName = deptObj?.name || 'Computer Science';

    if (editingFaculty) {
      const updatedFac: Faculty = {
        ...editingFaculty,
        fullName,
        designation: designation as any,
        departmentId,
        departmentName: deptName,
        qualification,
        experienceYears: Number(experienceYears),
        email,
        mobile,
        weeklyWorkloadHours: Number(weeklyWorkloadHours),
        photo,
        allocatedSubjects: allocatedSubjects.length > 0 ? allocatedSubjects : editingFaculty.allocatedSubjects,
      };
      setFacList((prev) =>
        prev.map((f) => (f.id === editingFaculty.id ? updatedFac : f))
      );
      if (onUpdateFaculty) onUpdateFaculty(editingFaculty.id, updatedFac);
    } else {
      const newFac: Faculty = {
        id: `fac-${Date.now()}`,
        facultyId: `FAC${Math.floor(100 + Math.random() * 900)}`,
        fullName,
        designation: designation as any,
        departmentId,
        departmentName: deptName,
        qualification,
        experienceYears: Number(experienceYears),
        email,
        mobile,
        weeklyWorkloadHours: Number(weeklyWorkloadHours),
        photo: photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
        allocatedSubjects: allocatedSubjects.length > 0 ? allocatedSubjects : ['sub-af301'],
        isActive: true,
      };
      setFacList((prev) => [...prev, newFac]);
      if (onAddFaculty) onAddFaculty(newFac);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <UserCog className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Faculty & Academic Staff Directory</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Department allocation, subject workloads, designations, and academic profiles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportReportToPDF({ title: 'OFFICIAL FACULTY & ACADEMIC STAFF DIRECTORY REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => exportReportToExcel({ title: 'OFFICIAL FACULTY & ACADEMIC STAFF DIRECTORY REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => exportReportToCSV({ title: 'OFFICIAL FACULTY & ACADEMIC STAFF DIRECTORY REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
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
                onClick={() => setShowClassTeacherModal(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                <UserCheck className="w-4 h-4" />
                <span>Assign Class Teachers</span>
              </button>
              <button
                onClick={() => setShowBulkImportModal(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                <Upload className="w-4 h-4" />
                <span>Bulk Faculty CSV Import</span>
              </button>
              <button
                onClick={handleOpenAdd}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Faculty</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty by name, designation, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-bold">Department Filter:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
          >
            <option value="ALL">All Departments</option>
            <option value="Accounting & Finance">Accounting & Finance</option>
            <option value="Business Analytics">Business Analytics</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((fac) => (
          <div key={fac.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={fac.photo}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-100 shadow-sm"
                    alt=""
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{fac.fullName}</h3>
                    <p className="text-xs font-semibold text-indigo-600">{fac.designation}</p>
                    <p className="text-[11px] text-slate-500">{fac.departmentName}</p>
                  </div>
                </div>

                {canEdit && (
                  <div className="flex space-x-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(fac)}
                      className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-indigo-600 rounded-lg transition"
                      title="Edit Faculty"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(fac.id)}
                      className="p-1.5 bg-slate-100 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                      title="Delete Faculty"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <p className="flex items-center space-x-2">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Qualification: <strong>{fac.qualification}</strong>
                  </span>
                </p>
                <p className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Experience: <strong>{fac.experienceYears} Years</strong>
                  </span>
                </p>
                <p className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{fac.email}</span>
                </p>

                {/* Allocated Subjects Badge Section */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center space-x-1">
                    <BookOpen className="w-3 h-3 text-indigo-600" />
                    <span>Allocated Subjects ({fac.allocatedSubjects?.length || 0}):</span>
                  </span>
                  {fac.allocatedSubjects && fac.allocatedSubjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {fac.allocatedSubjects.map((subId) => {
                        const matchedSub = subjects.find((s) => s.id === subId || s.code === subId);
                        const label = matchedSub ? `${matchedSub.name} (${matchedSub.code})` : subId;
                        return (
                          <span
                            key={subId}
                            className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-medium text-indigo-700 max-w-[200px] truncate"
                            title={label}
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No subjects currently allocated.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
              <span className="font-semibold text-slate-700">Weekly Workload:</span>
              <span className="font-bold text-indigo-600">{fac.weeklyWorkloadHours} Hours / Week</span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-8 border text-center text-slate-400">
            No faculty members found for selected criteria.
          </div>
        )}
      </div>

      {/* Add / Edit Faculty Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {editingFaculty ? 'Edit Faculty Record' : 'Add New Faculty Member'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs font-medium">
              <div>
                <label className="text-slate-700 block mb-1 font-bold">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Verma"
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Designation</label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  >
                    {userRole === 'Admin' && (
                      <option value="Professor & HOD">Professor & HOD (Head of Department)</option>
                    )}
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Senior Lecturer">Senior Lecturer</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Qualification</label>
                  <input
                    type="text"
                    required
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. Ph.D. Data Science"
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Experience (Years)</label>
                  <input
                    type="number"
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="faculty@apextech.edu"
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Workload (Hrs/Wk)</label>
                  <input
                    type="number"
                    required
                    value={weeklyWorkloadHours}
                    onChange={(e) => setWeeklyWorkloadHours(Number(e.target.value))}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">
                  Allocated Subjects ({allocatedSubjects.length} selected)
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Select the subjects taught by this faculty member for timetable mapping and attendance tracking.
                </p>
                <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  {subjects.length > 0 ? (
                    subjects.map((sub) => {
                      const isSelected = allocatedSubjects.includes(sub.id);
                      return (
                        <div
                          key={sub.id}
                          onClick={() => toggleSubjectAllocation(sub.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs border ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold'
                              : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                            />
                            <span>{sub.name}</span>
                          </div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/80 border text-slate-500">
                            {sub.code}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[11px] text-slate-400 p-2 text-center">No subjects available.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Faculty Photograph (.jpg format only)</label>
                <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="shrink-0">
                    {photo ? (
                      <img
                        src={photo}
                        alt="Faculty Preview"
                        className="w-14 h-14 rounded-xl object-cover border-2 border-indigo-300 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-400">
                        <User className="w-7 h-7" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] text-slate-500 font-medium">Select a .jpg photograph for faculty profile.</p>
                    <label className="cursor-pointer px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition inline-flex items-center space-x-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose .JPG Photo File</span>
                      <input
                        type="file"
                        accept="image/jpeg,.jpg,.jpeg"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const jpgDataUrl = await convertFileToJPGDataUrl(file);
                              setPhoto(jpgDataUrl);
                            } catch (err) {
                              alert('Please select a valid .jpg file.');
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Save Faculty
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
        title="OFFICIAL FACULTY & ACADEMIC STAFF DIRECTORY REPORT"
        headers={exportHeaders}
        rows={exportRows}
        defaultMetadata={reportMetadata}
      />

      {/* Class Teacher Assignment Console Modal */}
      <ClassTeacherAssignModal
        isOpen={showClassTeacherModal}
        onClose={() => setShowClassTeacherModal(false)}
        facultyList={facList}
        courses={courses}
        programs={programs}
        classTeacherAssignments={classTeacherAssignments}
        userRole={userRole}
        userName={userName}
        onAssignClassTeacher={(assignment) => {
          if (onAssignClassTeacher) onAssignClassTeacher(assignment);
        }}
        onDeleteAssignment={(id) => {
          if (onDeleteClassTeacherAssignment) onDeleteClassTeacherAssignment(id);
        }}
      />

      {/* Bulk Faculty Import Modal */}
      {showBulkImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl p-6 space-y-4 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowBulkImportModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <BulkUploadModule
              importLogs={[]}
              onImportSuccess={() => {}}
              onImportFacultySuccess={(importedFacs) => {
                const fullFacs: Faculty[] = importedFacs.map((f, idx) => ({
                  id: `fac-bulk-${Date.now()}-${idx}`,
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
                setFacList((prev) => [...prev, ...fullFacs]);
                if (onImportFacultySuccess) {
                  onImportFacultySuccess(importedFacs);
                }
                setShowBulkImportModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
