import React, { useState } from 'react';
import { Faculty, Course, Program, ClassTeacherAssignment, Role } from '../types';
import {
  UserCheck,
  X,
  Plus,
  Check,
  Building2,
  GraduationCap,
  Sparkles,
  Search,
  BookOpen,
  UserPlus,
  ShieldCheck,
  Trash2,
  Edit2,
  Calendar,
} from 'lucide-react';

interface ClassTeacherAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  facultyList: Faculty[];
  courses: Course[];
  programs?: Program[];
  classTeacherAssignments: ClassTeacherAssignment[];
  userRole?: Role;
  userName?: string;
  onAssignClassTeacher: (assignment: ClassTeacherAssignment) => void;
  onDeleteAssignment?: (id: string) => void;
}

export const ClassTeacherAssignModal: React.FC<ClassTeacherAssignModalProps> = ({
  isOpen,
  onClose,
  facultyList,
  courses,
  programs = [
    { id: 'prog-ug', code: 'UG', name: 'Undergraduate (UG)', status: 'Active' },
    { id: 'prog-pg', code: 'PG', name: 'Postgraduate (PG)', status: 'Active' },
  ],
  classTeacherAssignments,
  userRole = 'Admin',
  userName = 'Admin User',
  onAssignClassTeacher,
  onDeleteAssignment,
}) => {
  if (!isOpen) return null;

  const [showAssignForm, setShowAssignForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ClassTeacherAssignment | null>(null);

  // Form State
  const [selectedProgId, setSelectedProgId] = useState<string>(programs[0]?.id || 'prog-ug');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'course-baf');
  const [selectedSem, setSelectedSem] = useState<number>(1);
  const [selectedDivision, setSelectedDivision] = useState<string>('A');
  const [selectedClassTeacherId, setSelectedClassTeacherId] = useState<string>(facultyList[0]?.id || '');
  const [selectedAssistantTeacherId, setSelectedAssistantTeacherId] = useState<string>('');
  const [classroom, setClassroom] = useState<string>('Room 204');
  const [academicSession, setAcademicSession] = useState<string>('2025-2026');
  const [formError, setFormError] = useState<string>('');

  // Search/Filter for Table
  const [searchQuery, setSearchQuery] = useState('');

  const canEdit = userRole === 'Admin' || userRole === 'HOD';

  const availableCourses = courses.filter((c) => !selectedProgId || c.programId === selectedProgId);

  const handleOpenNewForm = () => {
    setEditingAssignment(null);
    setSelectedProgId('prog-ug');
    setSelectedCourseId(courses[0]?.id || 'course-baf');
    setSelectedSem(1);
    setSelectedDivision('A');
    setSelectedClassTeacherId(facultyList[0]?.id || '');
    setSelectedAssistantTeacherId('');
    setClassroom('Room 204');
    setAcademicSession('2025-2026');
    setFormError('');
    setShowAssignForm(true);
  };

  const handleEdit = (assignment: ClassTeacherAssignment) => {
    setEditingAssignment(assignment);
    const crs = courses.find((c) => c.id === assignment.courseId || c.courseCode === assignment.courseCode);
    if (crs) {
      setSelectedProgId(crs.programId);
      setSelectedCourseId(crs.id);
    }
    setSelectedSem(assignment.semester);
    setSelectedDivision(assignment.division);
    setSelectedClassTeacherId(assignment.classTeacherId);
    setSelectedAssistantTeacherId(assignment.assistantTeacherId || '');
    setClassroom(assignment.classroom || 'Room 204');
    setAcademicSession(assignment.academicSession || '2025-2026');
    setFormError('');
    setShowAssignForm(true);
  };

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedClassTeacherId) {
      setFormError('Please select a Class Teacher faculty member.');
      return;
    }

    const crsObj = courses.find((c) => c.id === selectedCourseId) || courses[0];
    const mainFacObj = facultyList.find((f) => f.id === selectedClassTeacherId);
    const asstFacObj = facultyList.find((f) => f.id === selectedAssistantTeacherId);

    // Compute academic year label
    let academicYearLabel = 'FY';
    if (crsObj.courseCode === 'MBA') {
      academicYearLabel = selectedSem <= 2 ? 'M.Com Part 1' : 'M.Com Part 2';
    } else {
      if (selectedSem <= 2) academicYearLabel = 'FY';
      else if (selectedSem <= 4) academicYearLabel = 'SY';
      else academicYearLabel = 'TY';
    }

    const newAssignment: ClassTeacherAssignment = {
      id: editingAssignment ? editingAssignment.id : `ct-${Date.now()}`,
      departmentId: crsObj.departmentId || mainFacObj?.departmentId || 'dept-af',
      departmentName: mainFacObj?.departmentName || 'Department of Accounting & Finance',
      courseId: crsObj.id,
      courseCode: crsObj.courseCode,
      courseName: crsObj.courseName,
      academicYear: academicYearLabel,
      semester: Number(selectedSem),
      division: selectedDivision,
      classTeacherId: mainFacObj?.id || selectedClassTeacherId,
      classTeacherName: mainFacObj?.fullName || 'Assigned Faculty',
      assistantTeacherId: asstFacObj?.id || undefined,
      assistantTeacherName: asstFacObj?.fullName || undefined,
      classroom,
      academicSession,
      assignedAt: new Date().toISOString().substring(0, 10),
      assignedBy: `${userName} (${userRole})`,
    };

    onAssignClassTeacher(newAssignment);
    setShowAssignForm(false);
  };

  const filteredAssignments = classTeacherAssignments.filter((a) => {
    const query = searchQuery.toLowerCase();
    return (
      a.classTeacherName.toLowerCase().includes(query) ||
      a.courseName.toLowerCase().includes(query) ||
      a.courseCode.toLowerCase().includes(query) ||
      `sem ${a.semester}`.includes(query) ||
      `div ${a.division}`.toLowerCase().includes(query) ||
      a.classroom.toLowerCase().includes(query)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-indigo-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600/30 rounded-xl border border-indigo-400/20">
              <UserCheck className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Assign Class Teachers (HOD / Admin Console)</h2>
              <p className="text-xs text-indigo-200">
                Allocate Class Teachers and Co-Teachers for every division and semester class.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search class, division, teacher..."
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {canEdit && (
              <button
                onClick={handleOpenNewForm}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Assign Class Teacher</span>
              </button>
            )}
          </div>

          {/* Form Drawer / Expandable View */}
          {showAssignForm && (
            <div className="bg-white rounded-2xl p-6 border-2 border-indigo-500/30 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    {editingAssignment ? 'Edit Class Teacher Assignment' : 'Assign Class Teacher for a Class'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAssignForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Cancel
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmitAssignment} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Academic Program</label>
                    <select
                      value={selectedProgId}
                      onChange={(e) => {
                        setSelectedProgId(e.target.value);
                        const matched = courses.find((c) => c.programId === e.target.value);
                        if (matched) setSelectedCourseId(matched.id);
                      }}
                      className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl font-semibold"
                    >
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Course / Program</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl font-semibold"
                    >
                      {availableCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.courseName} ({c.courseCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Semester & Division</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={selectedSem}
                        onChange={(e) => setSelectedSem(Number(e.target.value))}
                        className="bg-slate-50 border border-slate-300 p-2 rounded-xl font-semibold"
                      >
                        {[1, 2, 3, 4, 5, 6].map((s) => (
                          <option key={s} value={s}>
                            Sem {s}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedDivision}
                        onChange={(e) => setSelectedDivision(e.target.value)}
                        className="bg-slate-50 border border-slate-300 p-2 rounded-xl font-semibold"
                      >
                        {['A', 'B', 'C'].map((d) => (
                          <option key={d} value={d}>
                            Division {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Class Teacher (Primary) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedClassTeacherId}
                      onChange={(e) => setSelectedClassTeacherId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl font-semibold text-slate-900"
                      required
                    >
                      {facultyList.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.fullName} — {f.designation} ({f.departmentName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Assistant Class Teacher (Optional)
                    </label>
                    <select
                      value={selectedAssistantTeacherId}
                      onChange={(e) => setSelectedAssistantTeacherId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl font-semibold text-slate-900"
                    >
                      <option value="">-- None --</option>
                      {facultyList
                        .filter((f) => f.id !== selectedClassTeacherId)
                        .map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.fullName} — {f.designation}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Classroom / Location</label>
                    <input
                      type="text"
                      value={classroom}
                      onChange={(e) => setClassroom(e.target.value)}
                      placeholder="e.g. Room 204, Lab 4"
                      className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Academic Session</label>
                    <input
                      type="text"
                      value={academicSession}
                      onChange={(e) => setAcademicSession(e.target.value)}
                      placeholder="e.g. 2025-2026"
                      className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignForm(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md flex items-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Class Teacher Assignment</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Roster Matrix Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-700">
                Current Class Teacher Assignments ({filteredAssignments.length})
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                AY 2025-26
              </span>
            </div>

            {filteredAssignments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <UserCheck className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">No Class Teacher assignments found.</p>
                {canEdit && (
                  <button
                    onClick={handleOpenNewForm}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    Click here to assign a Class Teacher
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Class & Division</th>
                      <th className="py-3 px-4">Class Teacher (Primary)</th>
                      <th className="py-3 px-4">Assistant Teacher</th>
                      <th className="py-3 px-4">Classroom</th>
                      <th className="py-3 px-4">Assigned By</th>
                      {canEdit && <th className="py-3 px-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredAssignments.map((a) => (
                      <tr key={a.id} className="hover:bg-indigo-50/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{a.courseName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {a.academicYear} • Sem {a.semester} — <span className="text-indigo-600 font-bold">Div {a.division}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
                              {a.classTeacherName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{a.classTeacherName}</div>
                              <div className="text-[10px] text-slate-500">Class In-Charge</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {a.assistantTeacherName ? (
                            <span className="text-slate-800 font-semibold">{a.assistantTeacherName}</span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold border border-slate-200">
                            {a.classroom}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          <div>{a.assignedBy}</div>
                          <div className="text-[10px] text-slate-400">{a.assignedAt}</div>
                        </td>

                        {canEdit && (
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleEdit(a)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit Assignment"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {onDeleteAssignment && (
                              <button
                                onClick={() => {
                                  if (confirm(`Remove Class Teacher assignment for ${a.courseCode} Sem ${a.semester} Div ${a.division}?`)) {
                                    onDeleteAssignment(a.id);
                                  }
                                }}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Assignment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            Class Teachers automatically gain class attendance management & leave sanctioning permissions.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            Close Console
          </button>
        </div>

      </div>
    </div>
  );
};
