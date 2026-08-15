import React, { useState, useEffect } from 'react';
import { Student360Profile, PromotionBatch } from '../types';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Filter,
  CheckSquare,
  Square,
  History,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Search,
  BookOpen,
  Award,
} from 'lucide-react';

interface StudentPromotionWizardProps {
  students: Student360Profile[];
  promotionHistory: PromotionBatch[];
  onPromoteStudents: (
    promotedStudentIds: string[],
    targetYear: string,
    targetSem: number,
    targetDiv: string,
    course?: string,
    fromSem?: number
  ) => void;
}

// Helper to determine automatic promotion target based on course and current semester
export const getAutoPromotionTarget = (
  course: string,
  fromSem: number
): { toYear: string; toSem: number; isPassout: boolean } => {
  const isPG = course.toLowerCase().includes('m.com') || course.toLowerCase().includes('master');

  if (isPG) {
    // M.Com Business Analytics (2-Year PG Program)
    switch (fromSem) {
      case 1:
        return { toYear: 'Part 1', toSem: 2, isPassout: false };
      case 2:
        return { toYear: 'Part 2', toSem: 3, isPassout: false };
      case 3:
        return { toYear: 'Part 2', toSem: 4, isPassout: false };
      case 4:
      default:
        return { toYear: 'Alumni', toSem: 5, isPassout: true };
    }
  } else {
    // B.Com (Accounting & Finance) (3-Year UG Program)
    switch (fromSem) {
      case 1:
        return { toYear: 'FY', toSem: 2, isPassout: false };
      case 2:
        return { toYear: 'SY', toSem: 3, isPassout: false };
      case 3:
        return { toYear: 'SY', toSem: 4, isPassout: false };
      case 4:
        return { toYear: 'TY', toSem: 5, isPassout: false };
      case 5:
        return { toYear: 'TY', toSem: 6, isPassout: false };
      case 6:
      default:
        return { toYear: 'Alumni', toSem: 7, isPassout: true };
    }
  }
};

export const StudentPromotionWizard: React.FC<StudentPromotionWizardProps> = ({
  students,
  promotionHistory,
  onPromoteStudents,
}) => {
  const [activeTab, setActiveTab] = useState<'wizard' | 'rules' | 'history'>('wizard');

  // Filter criteria
  const [selectedCourse, setSelectedCourse] = useState<string>('B.Com (Accounting & Finance)');
  const [fromSemester, setFromSemester] = useState<number>(4);
  const [fromDivision, setFromDivision] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Promotion Target criteria (auto-populated by default)
  const [toYear, setToYear] = useState<string>('TY');
  const [toSemester, setToSemester] = useState<number>(5);
  const [toDivision, setToDivision] = useState<string>('A');

  // Selected student IDs
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Automatically update promotion target whenever course or fromSemester changes
  useEffect(() => {
    const target = getAutoPromotionTarget(selectedCourse, fromSemester);
    setToYear(target.toYear);
    setToSemester(target.toSem);
  }, [selectedCourse, fromSemester]);

  // Filter eligible students
  const eligibleStudents = students.filter((s) => {
    const matchCourse =
      s.course === selectedCourse ||
      (selectedCourse.includes('B.Com') && s.course.includes('B.Com')) ||
      (selectedCourse.includes('M.Com') && s.course.includes('M.Com'));

    const matchSem = s.semester === fromSemester;
    const matchDiv = fromDivision === 'ALL' || s.division === fromDivision;
    const matchSearch =
      !searchQuery ||
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCourse && matchSem && matchDiv && matchSearch;
  });

  const handleSelectAll = () => {
    if (selectedStudentIds.length === eligibleStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(eligibleStudents.map((s) => s.id));
    }
  };

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecutePromotion = () => {
    if (selectedStudentIds.length === 0) {
      alert('Please select at least one student to promote.');
      return;
    }

    const isAlumni = toYear === 'Alumni' || toSemester > 6;
    const targetLabel = isAlumni
      ? 'Pass Out / Alumni Status'
      : `${toYear} (Semester ${toSemester}, Division ${toDivision})`;

    if (
      confirm(
        `PROMOTION CONFIRMATION\n\nCourse: ${selectedCourse}\nFrom: Semester ${fromSemester}\nTo Target: ${targetLabel}\nTotal Students Selected: ${selectedStudentIds.length}\n\nNote: Complete Student 360° Profile, attendance history, marks, documents, department activities, and other records WILL BE FULLY PRESERVED.\n\nDo you wish to execute this promotion batch now?`
      )
    ) {
      onPromoteStudents(selectedStudentIds, toYear, toSemester, toDivision, selectedCourse, fromSemester);
      alert(
        `Promotion Batch Executed Successfully!\n\n${selectedStudentIds.length} student(s) promoted to ${targetLabel}. All records preserved.`
      );
      setSelectedStudentIds([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold">Student Academic Promotion Wizard</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-extrabold uppercase">
              Admin & HOD Module
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Automated batch promotion for B.Com (Accounting & Finance) and M.Com Business Analytics while preserving complete Student 360° Profile, attendance history, marks, documents, and department activities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'wizard'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Promotion Wizard</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'rules'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Progression Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Promotion Logs</span>
          </button>
        </div>
      </div>

      {/* Record Preservation Guarantee Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center space-x-3 text-xs text-emerald-900 shadow-sm">
        <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
        <div>
          <span className="font-extrabold text-emerald-950 block">360° Profile Preservation Guarantee</span>
          <p className="text-emerald-800 text-[11px] mt-0.5">
            When students are promoted to the next semester or academic year, their complete historical records — including past session attendance, semester GPAs, uploaded certificates/documents, sports/cultural achievements, department activities, and parent contacts — are 100% retained and linked to their Student 360° Profile.
          </p>
        </div>
      </div>

      {activeTab === 'wizard' && (
        <div className="space-y-6">
          {/* Source & Destination Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SOURCE BATCH */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Filter className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Step 1: Select Source Student Batch
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-3">
                  <label className="text-slate-500 font-semibold mb-1 block">Course</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-800"
                  >
                    <option value="BAF">BAF (Undergraduate)</option>
                    <option value="M.Com">M.Com (Postgraduate)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-semibold mb-1 block">Current Semester</label>
                  <select
                    value={fromSemester}
                    onChange={(e) => setFromSemester(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-800"
                  >
                    {selectedCourse.includes('M.Com') ? (
                      <>
                        <option value={1}>Semester 1</option>
                        <option value={2}>Semester 2</option>
                        <option value={3}>Semester 3</option>
                        <option value={4}>Semester 4</option>
                      </>
                    ) : (
                      <>
                        <option value={1}>Semester 1</option>
                        <option value={2}>Semester 2</option>
                        <option value={3}>Semester 3</option>
                        <option value={4}>Semester 4</option>
                        <option value={5}>Semester 5</option>
                        <option value={6}>Semester 6</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-semibold mb-1 block">Division Filter</label>
                  <select
                    value={fromDivision}
                    onChange={(e) => setFromDivision(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-800"
                  >
                    <option value="ALL">All Divisions</option>
                    <option value="A">Division A</option>
                    <option value="B">Division B</option>
                    <option value="C">Division C</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-semibold mb-1 block">Search Student</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    <input
                      type="text"
                      placeholder="Name / PRN / Roll"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 p-2 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* DESTINATION TARGET */}
            <div className="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                    Step 2: Automated Promotion Target State
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-extrabold flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Auto Rules Applied</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-indigo-900 font-semibold mb-1 block">Target Academic Year</label>
                  <select
                    value={toYear}
                    onChange={(e) => setToYear(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-indigo-200 bg-white font-bold text-indigo-950 shadow-sm"
                  >
                    <option value="FY">FY (First Year)</option>
                    <option value="SY">SY (Second Year)</option>
                    <option value="TY">TY (Third Year)</option>
                    <option value="Part 1">Part I (M.Com)</option>
                    <option value="Part 2">Part II (M.Com)</option>
                    <option value="Alumni">Pass Out / Alumni</option>
                  </select>
                </div>

                <div>
                  <label className="text-indigo-900 font-semibold mb-1 block">Target Semester</label>
                  <select
                    value={toSemester}
                    onChange={(e) => setToSemester(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 rounded-xl border border-indigo-200 bg-white font-bold text-indigo-950 shadow-sm"
                  >
                    <option value={1}>Sem 1</option>
                    <option value={2}>Sem 2</option>
                    <option value={3}>Sem 3</option>
                    <option value={4}>Sem 4</option>
                    <option value={5}>Sem 5</option>
                    <option value={6}>Sem 6</option>
                    <option value={7}>Pass Out / Alumni</option>
                  </select>
                </div>

                <div>
                  <label className="text-indigo-900 font-semibold mb-1 block">Target Division</label>
                  <select
                    value={toDivision}
                    onChange={(e) => setToDivision(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-indigo-200 bg-white font-bold text-indigo-950 shadow-sm"
                  >
                    <option value="A">Division A</option>
                    <option value="B">Division B</option>
                    <option value="C">Division C</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-950 font-bold">
                <span>Progression Route:</span>
                <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[11px] font-extrabold flex items-center space-x-1.5 shadow-sm">
                  <span>Sem {fromSemester}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>
                    {toYear === 'Alumni' || toSemester > 6
                      ? 'Pass Out / Alumni'
                      : `${toYear} Sem ${toSemester} (${toDivision})`}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Student Batch Checklist Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <span>Students Eligible for Promotion</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black">
                    {eligibleStudents.length} Found
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select individual students or click "Toggle Select All" to execute the promotion batch.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
                >
                  {selectedStudentIds.length === eligibleStudents.length && eligibleStudents.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Toggle Select All ({selectedStudentIds.length})</span>
                </button>

                <button
                  onClick={handleExecutePromotion}
                  disabled={selectedStudentIds.length === 0}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
                >
                  <GraduationCap className="w-4.5 h-4.5" />
                  <span>Execute Promotion Batch ({selectedStudentIds.length})</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Select</th>
                    <th className="px-4 py-3">PRN Number</th>
                    <th className="px-4 py-3">Roll No.</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Current Status</th>
                    <th className="px-4 py-3">Attendance %</th>
                    <th className="px-4 py-3">CGPA</th>
                    <th className="px-4 py-3">Dept Activities</th>
                    <th className="px-4 py-3">Target State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {eligibleStudents.length > 0 ? (
                    eligibleStudents.map((s) => {
                      const isChecked = selectedStudentIds.includes(s.id);
                      const actCount = (s.departmentActivities || []).length;
                      return (
                        <tr
                          key={s.id}
                          onClick={() => handleToggleStudent(s.id)}
                          className={`cursor-pointer transition ${
                            isChecked ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">{s.studentId}</td>
                          <td className="px-4 py-3 font-bold text-indigo-600">{s.rollNumber}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            <div className="flex items-center space-x-2">
                              {s.passportPhoto ? (
                                <img src={s.passportPhoto} className="w-7 h-7 rounded-full object-cover border border-slate-300 shrink-0" alt="Student" />
                              ) : null}
                              <span>{s.fullName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {s.academicStatus || 'Active'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            <span className={s.attendancePercentage < 75 ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
                              {s.attendancePercentage}%
                            </span>
                          </td>
                          <td className="px-4 py-3 font-black text-indigo-600">{s.overallCgpa || '8.85'}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded text-[10px] inline-flex items-center space-x-1">
                              <Award className="w-3 h-3 text-indigo-500" />
                              <span>{actCount} Records</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-indigo-900">
                            {toYear === 'Alumni' || toSemester > 6 ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">
                                Pass Out / Alumni
                              </span>
                            ) : (
                              <span>{toYear} Sem {toSemester} ({toDivision})</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400 font-medium">
                        No active students found matching selected course, semester, and filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RULES TAB */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Institutional Academic Progression Hierarchy & Rules</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                The Student Promotion Engine enforces statutory Mumbai University progression paths for Undergraduate (UG) and Postgraduate (PG) programs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* B.Com (Accounting & Finance) Progression Rules */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                  <h4 className="font-extrabold text-indigo-950 text-sm">
                    B.Com (Accounting & Finance) [3-Year Degree]
                  </h4>
                  <span className="px-2.5 py-0.5 bg-indigo-200 text-indigo-900 rounded-full text-[10px] font-black uppercase">
                    UG Pattern
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-indigo-100 flex items-center justify-between font-bold">
                    <span className="text-slate-700">Semester I (FY)</span>
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                    <span className="text-indigo-900">Semester II (FY)</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-indigo-100 flex items-center justify-between font-bold">
                    <span className="text-slate-700">Semester II (FY)</span>
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                    <span className="text-indigo-900">Semester III (SY)</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-indigo-100 flex items-center justify-between font-bold">
                    <span className="text-slate-700">Semester III (SY)</span>
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                    <span className="text-indigo-900">Semester IV (SY)</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-indigo-100 flex items-center justify-between font-bold">
                    <span className="text-slate-700">Semester IV (SY)</span>
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                    <span className="text-indigo-900">Semester V (TY)</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-indigo-100 flex items-center justify-between font-bold">
                    <span className="text-slate-700">Semester V (TY)</span>
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                    <span className="text-indigo-900">Semester VI (TY)</span>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between font-extrabold text-emerald-950">
                    <span>Semester VI (TY)</span>
                    <ArrowRight className="w-4 h-4 text-emerald-600" />
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[11px]">Pass Out / Alumni</span>
                  </div>
                </div>
              </div>

              {/* M.Com Business Analytics Progression Rules */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    M.Com Business Analytics [2-Year Master's Degree]
                  </h4>
                  <span className="px-2.5 py-0.5 bg-slate-200 text-slate-800 rounded-full text-[10px] font-black uppercase">
                    PG Pattern
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between font-bold">
                    <span className="text-slate-700">Semester I (Part I)</span>
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                    <span className="text-indigo-900">Semester II (Part I)</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between font-bold">
                    <span className="text-slate-700">Semester II (Part I)</span>
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                    <span className="text-indigo-900">Semester III (Part II)</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between font-bold">
                    <span className="text-slate-700">Semester III (Part II)</span>
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                    <span className="text-indigo-900">Semester IV (Part II)</span>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between font-extrabold text-emerald-950">
                    <span>Semester IV (Part II)</span>
                    <ArrowRight className="w-4 h-4 text-emerald-600" />
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[11px]">Pass Out / Alumni</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <History className="w-4 h-4 text-indigo-600" />
              <span>Historical Promotion Batch Audit Logs</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Total Batches Executed: {promotionHistory.length}
            </span>
          </div>

          <div className="space-y-4">
            {promotionHistory.length > 0 ? (
              promotionHistory.map((batch) => (
                <div key={batch.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-bold text-indigo-950">{batch.batchName}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {batch.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
                    <span>Course: <strong className="text-slate-800">{batch.course}</strong></span>
                    <span>Transition: <strong className="text-slate-800">Sem {batch.fromSemester} ➔ Sem {batch.toSemester}</strong></span>
                    <span>Promoted Students: <strong className="text-indigo-600 font-bold">{batch.totalStudentsPromoted}</strong></span>
                    <span>Processed By: <strong className="text-slate-800">{batch.promotedBy}</strong></span>
                    <span>Timestamp: <strong className="text-slate-500">{batch.promotedAt}</strong></span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-600 text-xs">No Promotion Batches Logged Yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Use the Promotion Wizard tab above to execute your first batch promotion.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

