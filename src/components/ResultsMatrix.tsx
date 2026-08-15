import React, { useState } from 'react';
import { StudentResult, Student360Profile, Role, Department } from '../types';
import {
  Award,
  Printer,
  Download,
  BookOpen,
  CheckCircle2,
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  X,
} from 'lucide-react';

interface ResultsMatrixProps {
  results: StudentResult[];
  students: Student360Profile[];
  departments?: Department[];
  userRole?: Role;
  onRefreshData?: () => void;
}

export const ResultsMatrix: React.FC<ResultsMatrixProps> = ({
  results: initialResults,
  students,
  departments = [],
  userRole = 'HOD',
  onRefreshData,
}) => {
  const [resultList, setResultList] = useState<StudentResult[]>(initialResults);

  React.useEffect(() => {
    setResultList(initialResults);
  }, [initialResults]);

  // Search & Filter state
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedProgram, setSelectedProgram] = useState<string>('ALL');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [selectedSem, setSelectedSem] = useState<string>('3');
  const [selectedDiv, setSelectedDiv] = useState<string>('ALL');
  const [searchRollNo, setSearchRollNo] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'stu-24cs01');

  // Modal State for HOD Edit / Add
  const [showModal, setShowModal] = useState(false);
  const [editingResult, setEditingResult] = useState<StudentResult | null>(null);
  const [subCode, setSubCode] = useState('CS301');
  const [subName, setSubName] = useState('Data Structures & Algorithms');
  const [semVal, setSemVal] = useState(3);
  const [internalMarks, setInternalMarks] = useState(34);
  const [externalMarks, setExternalMarks] = useState(52);
  const [grade, setGrade] = useState('A+');
  const [gpaPoints, setGpaPoints] = useState(9.0);

  const canEdit = userRole === 'Admin' || userRole === 'HOD';

  // Filter students based on Department, Program, Course, Semester, Division
  const filteredStudents = students.filter((s) => {
    const matchesDept = selectedDept === 'ALL' || s.departmentId === selectedDept || (s.departmentName && s.departmentName.includes(selectedDept));
    const matchesProgram = selectedProgram === 'ALL' || (s.programName && s.programName.toLowerCase().includes(selectedProgram.toLowerCase())) || (s.course && s.course.toLowerCase().includes(selectedProgram.toLowerCase()));
    const matchesCourse = selectedCourse === 'ALL' || (s.course && s.course.toLowerCase().includes(selectedCourse.toLowerCase())) || (selectedCourse === 'BAF' && s.course && (s.course.includes('BAF') || s.course.includes('B.Com')));
    const matchesSem = selectedSem === 'ALL' || String(s.semester) === selectedSem;
    const matchesDiv = selectedDiv === 'ALL' || s.division === selectedDiv;

    const matchesRoll =
      searchRollNo === '' ||
      s.rollNumber.toLowerCase().includes(searchRollNo.toLowerCase()) ||
      s.fullName.toLowerCase().includes(searchRollNo.toLowerCase());

    return matchesDept && matchesProgram && matchesCourse && matchesSem && matchesDiv && matchesRoll;
  });

  const selectedStudent =
    filteredStudents.find((s) => s.id === selectedStudentId) || filteredStudents[0] || students[0];

  const studentResults = resultList.filter(
    (r) =>
      r.studentId === selectedStudent?.id &&
      (selectedSem === 'ALL' || String(r.semester) === selectedSem)
  );

  const handleOpenAdd = () => {
    setEditingResult(null);
    setSubCode('CS305');
    setSubName('Database Management Systems');
    setSemVal(Number(selectedSem === 'ALL' ? 3 : selectedSem));
    setInternalMarks(32);
    setExternalMarks(48);
    setGrade('A');
    setGpaPoints(8.5);
    setShowModal(true);
  };

  const handleOpenEdit = (res: StudentResult) => {
    setEditingResult(res);
    setSubCode(res.subjectCode);
    setSubName(res.subjectName);
    setSemVal(res.semester);
    setInternalMarks(res.internalMarks);
    setExternalMarks(res.externalMarks);
    setGrade(res.grade);
    setGpaPoints(res.gpa);
    setShowModal(true);
  };

  const handleDeleteResult = async (id: string) => {
    if (confirm('Delete this examination result record?')) {
      setResultList((prev) => prev.filter((r) => r.id !== id));
      try {
        await fetch(`/api/results/${id}`, { method: 'DELETE' });
        onRefreshData?.();
      } catch (err) {
        console.error('Error deleting result in SQL:', err);
      }
    }
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(internalMarks) + Number(externalMarks);

    if (editingResult) {
      const updatedPayload = {
        subjectCode: subCode,
        subjectName: subName,
        semester: Number(semVal),
        internalMarks: Number(internalMarks),
        externalMarks: Number(externalMarks),
        totalMarks: total,
        grade,
        gpa: Number(gpaPoints),
      };

      setResultList((prev) =>
        prev.map((r) =>
          r.id === editingResult.id
            ? {
                ...r,
                ...updatedPayload,
              }
            : r
        )
      );

      setShowModal(false);

      try {
        await fetch(`/api/results/${editingResult.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPayload),
        });
        onRefreshData?.();
      } catch (err) {
        console.error('Error updating result in SQL:', err);
      }
    } else {
      const newRes: StudentResult = {
        id: `res-${Date.now()}`,
        studentId: selectedStudent?.id || 'stu-24cs01',
        studentName: selectedStudent?.fullName || 'Aarav Sharma',
        rollNumber: selectedStudent?.rollNumber || '24CS01',
        subjectId: 'sub-af301',
        subjectCode: subCode,
        subjectName: subName,
        semester: Number(semVal),
        internalMarks: Number(internalMarks),
        externalMarks: Number(externalMarks),
        totalMarks: total,
        grade,
        gpa: Number(gpaPoints),
      };

      setResultList((prev) => [...prev, newRes]);
      setShowModal(false);

      try {
        await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRes),
        });
        onRefreshData?.();
      } catch (err) {
        console.error('Error adding result in SQL:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Academic Results & CGPA Matrix</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Internal marks (out of 40), External theory marks (out of 60), SGPA and CGPA matrix search.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Enter Marks / Result</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Grade Sheet</span>
          </button>
        </div>
      </div>

      {/* Multi-Option Search & Filter Bar (Year, Sem, Div, Roll No) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          <span>Matrix Search Options (Year, Semester, Division, Roll No / Student)</span>
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
          {/* Roll No / Search Input */}
          <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Roll No or Student Name..."
              value={searchRollNo}
              onChange={(e) => setSearchRollNo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl focus:outline-none"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center space-x-1.5">
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
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Program Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-bold">Program:</span>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
            >
              <option value="ALL">All Programs</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>

          {/* Course Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-bold">Course:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
            >
              <option value="ALL">All Courses</option>
              <option value="BAF">BAF</option>
              <option value="M.Com">M.Com</option>
            </select>
          </div>

          {/* Semester Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-bold">Semester:</span>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6].map((sem) => (
                <option key={sem} value={String(sem)}>
                  Sem {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Division Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-bold">Division:</span>
            <select
              value={selectedDiv}
              onChange={(e) => setSelectedDiv(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
            >
              <option value="ALL">All Divisions</option>
              {['A', 'B', 'C'].map((div) => (
                <option key={div} value={div}>
                  Division {div}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Student Dropdown */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-bold">Student:</span>
            <select
              value={selectedStudent?.id || ''}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-indigo-700"
            >
              {filteredStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.rollNumber} - {s.fullName} (Div {s.division})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CGPA Summary Card */}
      {selectedStudent && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              Overall CGPA Matrix & Transcript
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">{selectedStudent.fullName}</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Roll No: <strong className="text-indigo-300">{selectedStudent.rollNumber}</strong> • Course: {selectedStudent.course} • Sem {selectedStudent.semester}-{selectedStudent.division}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
            <div className="text-center px-2">
              <p className="text-[10px] text-slate-300 uppercase">Sem 1</p>
              <p className="text-lg font-bold">{selectedStudent.sem1Gpa}</p>
            </div>
            <div className="text-center border-l border-white/20 pl-4 pr-2">
              <p className="text-[10px] text-slate-300 uppercase">Sem 2</p>
              <p className="text-lg font-bold">{selectedStudent.sem2Gpa}</p>
            </div>
            <div className="text-center border-l border-white/20 pl-4 pr-2">
              <p className="text-[10px] text-slate-300 uppercase">Sem 3</p>
              <p className="text-lg font-bold">{selectedStudent.sem3Gpa}</p>
            </div>
            <div className="text-center border-l border-white/20 pl-4">
              <p className="text-[10px] text-slate-300 uppercase">Overall CGPA</p>
              <p className="text-2xl font-black text-amber-300">{selectedStudent.overallCgpa}</p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Subject Marks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center font-bold text-xs text-slate-700">
          <span>
            {selectedSem === 'ALL' ? 'All Semesters' : `Semester ${selectedSem}`} Examination Grade Sheet
          </span>
          <span className="text-slate-500 font-semibold">{studentResults.length} Subject Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b">
                <th className="p-3 pl-4">Subject Code</th>
                <th className="p-3">Subject Name</th>
                <th className="p-3">Semester</th>
                <th className="p-3">Internal (40)</th>
                <th className="p-3">External (60)</th>
                <th className="p-3">Total (100)</th>
                <th className="p-3">Grade</th>
                <th className="p-3">GPA Points</th>
                {canEdit && <th className="p-3 text-right pr-4">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentResults.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 pl-4 font-mono font-bold text-slate-800">{r.subjectCode}</td>
                  <td className="p-3 font-semibold text-slate-800">{r.subjectName}</td>
                  <td className="p-3 text-slate-600">Sem {r.semester}</td>
                  <td className="p-3 text-slate-600">{r.internalMarks}</td>
                  <td className="p-3 text-slate-600">{r.externalMarks}</td>
                  <td className="p-3 font-extrabold text-slate-900">{r.totalMarks}</td>
                  <td className="p-3">
                    <span className="font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {r.grade}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-800">{r.gpa}</td>
                  {canEdit && (
                    <td className="p-3 text-right pr-4 space-x-1">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition"
                        title="Edit Marks"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteResult(r.id)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                        title="Delete Result Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {studentResults.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No examination results recorded for selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Enter / Edit Marks */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {editingResult ? 'Edit Examination Marks' : 'Enter New Subject Result'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="space-y-3 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Semester</label>
                  <input
                    type="number"
                    required
                    value={semVal}
                    onChange={(e) => setSemVal(Number(e.target.value))}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Subject Name</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Internal Marks (Out of 40)</label>
                  <input
                    type="number"
                    max={40}
                    required
                    value={internalMarks}
                    onChange={(e) => setInternalMarks(Number(e.target.value))}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">External Marks (Out of 60)</label>
                  <input
                    type="number"
                    max={60}
                    required
                    value={externalMarks}
                    onChange={(e) => setExternalMarks(Number(e.target.value))}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Grade Awarded</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  >
                    <option value="O">O (Outstanding)</option>
                    <option value="A+">A+ (Excellent)</option>
                    <option value="A">A (Very Good)</option>
                    <option value="B+">B+ (Good)</option>
                    <option value="B">B (Above Average)</option>
                    <option value="C">C (Average)</option>
                    <option value="F">F (Fail)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">GPA Points</label>
                  <input
                    type="number"
                    step="0.1"
                    max={10}
                    required
                    value={gpaPoints}
                    onChange={(e) => setGpaPoints(Number(e.target.value))}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
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
                  Save Result Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
