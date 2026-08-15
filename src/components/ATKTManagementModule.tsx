import React, { useState, useEffect } from 'react';
import { ATKTRecord, Department, Student360Profile } from '../types';
import {
  FileX2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  CreditCard,
  Ticket,
  Send,
  Download,
  Trash2,
  Edit,
  Sparkles,
  RefreshCw,
  X,
  FileText,
} from 'lucide-react';

interface ATKTManagementModuleProps {
  departments: Department[];
  students: Student360Profile[];
  userRole: string;
}

export const ATKTManagementModule: React.FC<ATKTManagementModuleProps> = ({
  departments,
  students,
  userRole,
}) => {
  const [records, setRecords] = useState<ATKTRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [progFilter, setProgFilter] = useState('ALL');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [semFilter, setSemFilter] = useState('ALL');
  const [divFilter, setDivFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAtktForAction, setSelectedAtktForAction] = useState<ATKTRecord | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [reExamMarksInput, setReExamMarksInput] = useState<number>(30);

  // Form State for Adding ATKT
  const [newStudentId, setNewStudentId] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('AF102');
  const [newSubjectName, setNewSubjectName] = useState('Cost Accounting - I');
  const [newSemester, setNewSemester] = useState(1);
  const [newBacklogType, setNewBacklogType] = useState<'Internal' | 'External' | 'Both'>('External');
  const [newOrigInternal, setNewOrigInternal] = useState(18);
  const [newOrigExternal, setNewOrigExternal] = useState(19);
  const [newRemarks, setNewRemarks] = useState('Failed end-sem theory paper');

  // Load ATKT records from API
  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        departmentId: deptFilter,
        semester: semFilter,
        status: statusFilter,
        search: searchQuery,
      }).toString();

      const res = await fetch(`/api/atkt?${query}`);
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch ATKT records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [deptFilter, semFilter, statusFilter, searchQuery]);

  // Actions
  const handleToggleFeePaid = async (item: ATKTRecord) => {
    try {
      const updatedStatus = item.status === 'PENDING_EXAM' ? 'REGISTERED' : item.status;
      const res = await fetch(`/api/atkt/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examFeePaid: !item.examFeePaid,
          status: updatedStatus,
        }),
      });
      if (res.ok) fetchRecords();
    } catch (err) {
      alert('Failed to update fee status.');
    }
  };

  const handleIssueHallTicket = async (item: ATKTRecord) => {
    try {
      const res = await fetch(`/api/atkt/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'HALL_TICKET_ISSUED',
          remarks: `Hall ticket issued for Re-exam on ${item.reExamDate || '2026-09-15'}`,
        }),
      });
      if (res.ok) {
        alert(`Hall ticket generated and issued to ${item.studentName}!`);
        fetchRecords();
      }
    } catch (err) {
      alert('Failed to issue hall ticket.');
    }
  };

  const handleClearBacklog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAtktForAction) return;

    try {
      const res = await fetch(`/api/atkt/${selectedAtktForAction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CLEARED',
          reExamMarksObtained: reExamMarksInput,
          clearedAt: new Date().toISOString().substring(0, 10),
          remarks: `Cleared in re-examination with ${reExamMarksInput} marks.`,
        }),
      });
      if (res.ok) {
        setShowClearModal(false);
        setSelectedAtktForAction(null);
        fetchRecords();
      }
    } catch (err) {
      alert('Failed to clear backlog.');
    }
  };

  const handleAddAtkt = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === newStudentId) || students[0];
    if (!student) return;

    try {
      const payload = {
        studentId: student.id,
        studentName: student.fullName,
        rollNumber: student.rollNumber,
        prnNumber: student.prnNumber || '202401640098' + Math.floor(Math.random() * 9000 + 1000),
        course: student.course,
        departmentId: student.departmentId,
        departmentName: student.departmentName,
        semester: newSemester,
        subjectCode: newSubjectCode,
        subjectName: newSubjectName,
        backlogType: newBacklogType,
        originalInternalMarks: newOrigInternal,
        originalExternalMarks: newOrigExternal,
        attemptsCount: 1,
        status: 'PENDING_EXAM',
        examFeePaid: false,
        examFeeAmount: 650,
        reExamDate: '2026-09-18',
        remarks: newRemarks,
      };

      const res = await fetch('/api/atkt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchRecords();
      }
    } catch (err) {
      alert('Failed to add ATKT entry.');
    }
  };

  const handleDeleteAtkt = async (id: string) => {
    if (!window.confirm('Delete this ATKT record?')) return;
    try {
      await fetch(`/api/atkt/${id}`, { method: 'DELETE' });
      fetchRecords();
    } catch (err) {
      alert('Failed to delete ATKT record.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Student Name', 'Roll Number', 'PRN', 'Course', 'Semester', 'Subject Code', 'Subject Name', 'Backlog Type', 'Fee Paid', 'Status', 'Re-Exam Date'];
    const rows = filteredRecords.map((r) => [
      `"${r.studentName}"`,
      r.rollNumber,
      r.prnNumber || '',
      `"${r.course}"`,
      r.semester,
      r.subjectCode,
      `"${r.subjectName}"`,
      r.backlogType,
      r.examFeePaid ? 'PAID' : 'UNPAID',
      r.status,
      r.reExamDate || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `atkt_backlog_report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Client-side additional filtering on records
  const filteredRecords = records.filter((r) => {
    const student = students.find((s) => s.id === r.studentId || s.fullName.toLowerCase() === r.studentName.toLowerCase());
    const matchesProg = progFilter === 'ALL' || (student && student.programName && student.programName.toLowerCase().includes(progFilter.toLowerCase())) || (r.course && r.course.toLowerCase().includes(progFilter.toLowerCase()));
    const matchesCourse = courseFilter === 'ALL' || (r.course && r.course.toLowerCase().includes(courseFilter.toLowerCase())) || (courseFilter === 'BAF' && r.course && (r.course.includes('BAF') || r.course.includes('B.Com')));
    const matchesDiv = divFilter === 'ALL' || (student && student.division === divFilter);
    return matchesProg && matchesCourse && matchesDiv;
  });

  // KPIs
  const activeBacklogs = filteredRecords.filter((r) => r.status !== 'CLEARED');
  const feePaidCount = filteredRecords.filter((r) => r.examFeePaid).length;
  const hallTicketCount = filteredRecords.filter((r) => r.status === 'HALL_TICKET_ISSUED').length;
  const clearedCount = filteredRecords.filter((r) => r.status === 'CLEARED').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
            <FileX2 className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Students ATKT & Backlog Management</h2>
            <p className="text-xs text-slate-300 mt-1">
              Track Allowed To Keep Term (ATKT) backlogs, exam fee payments, hall ticket issuance, and re-exam results.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl text-xs flex items-center space-x-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export ATKT List</span>
          </button>
          {(userRole === 'Admin' || userRole === 'HOD' || userRole === 'ExamCell') && (
            <button
              onClick={() => {
                if (students[0]) setNewStudentId(students[0].id);
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Log Backlog Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 font-semibold text-[11px]">Active ATKT Backlogs</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{activeBacklogs.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 font-semibold text-[11px]">Exam Fee Paid</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{feePaidCount} / {records.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 font-semibold text-[11px]">Hall Tickets Issued</p>
            <p className="text-xl font-extrabold text-indigo-600 mt-0.5">{hallTicketCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
            <Ticket className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 font-semibold text-[11px]">Cleared Re-Exams</p>
            <p className="text-xl font-extrabold text-blue-600 mt-0.5">{clearedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-700">Filters:</span>
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
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

          <select
            value={progFilter}
            onChange={(e) => setProgFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
          >
            <option value="ALL">All Programs</option>
            <option value="Undergraduate">Undergraduate</option>
            <option value="Postgraduate">Postgraduate</option>
          </select>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
          >
            <option value="ALL">All Courses</option>
            <option value="BAF">BAF</option>
            <option value="M.Com">M.Com</option>
          </select>

          <select
            value={semFilter}
            onChange={(e) => setSemFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
          >
            <option value="ALL">All Semesters</option>
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <option key={s} value={String(s)}>
                Sem {s}
              </option>
            ))}
          </select>

          <select
            value={divFilter}
            onChange={(e) => setDivFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
          >
            <option value="ALL">All Divisions</option>
            {['A', 'B', 'C'].map((div) => (
              <option key={div} value={div}>
                Division {div}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_EXAM">Pending Fee / Exam</option>
            <option value="REGISTERED">Registered (Fee Paid)</option>
            <option value="HALL_TICKET_ISSUED">Hall Ticket Issued</option>
            <option value="CLEARED">Cleared Backlog</option>
          </select>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, roll, or subject..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
          />
        </div>
      </div>

      {/* Backlog Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Student Details</th>
                <th className="p-3.5">Sem & Subject</th>
                <th className="p-3.5">Backlog Type</th>
                <th className="p-3.5">Attempts</th>
                <th className="p-3.5">Exam Fee (₹650)</th>
                <th className="p-3.5">Re-Exam Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-600 mb-2" />
                    <span>Loading ATKT Records...</span>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                    No ATKT backlog records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-semibold text-slate-900">
                      <div>{r.studentName}</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        Roll: {r.rollNumber} • PRN: {r.prnNumber || 'N/A'}
                      </div>
                      <div className="text-[10px] text-indigo-600 font-normal">{r.course}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">
                        [{r.subjectCode}] {r.subjectName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Semester {r.semester} • {r.departmentName}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.backlogType === 'Both'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : r.backlogType === 'External'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {r.backlogType} Backlog
                      </span>
                    </td>

                    <td className="p-3.5 font-bold text-slate-700">Attempt #{r.attemptsCount}</td>

                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleFeePaid(r)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center space-x-1 transition ${
                          r.examFeePaid
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                        }`}
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>{r.examFeePaid ? 'PAID (₹650)' : 'UNPAID'}</span>
                      </button>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          r.status === 'CLEARED'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : r.status === 'HALL_TICKET_ISSUED'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : r.status === 'REGISTERED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {r.status !== 'CLEARED' && (
                          <>
                            {r.examFeePaid && r.status !== 'HALL_TICKET_ISSUED' && (
                              <button
                                onClick={() => handleIssueHallTicket(r)}
                                title="Issue Hall Ticket"
                                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] flex items-center space-x-1"
                              >
                                <Ticket className="w-3 h-3" />
                                <span>Hall Ticket</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedAtktForAction(r);
                                setShowClearModal(true);
                              }}
                              title="Clear Backlog"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center space-x-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Clear</span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDeleteAtkt(r.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD ATKT ENTRY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <FileX2 className="w-4 h-4 text-rose-600" />
                <span>Log New Student ATKT Backlog</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAtkt} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Student</label>
                <select
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.rollNumber} - {s.course})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    placeholder="AF102"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={newSemester}
                    onChange={(e) => setNewSemester(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
                  >
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject Title</label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Cost Accounting - I"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Backlog Type</label>
                  <select
                    value={newBacklogType}
                    onChange={(e: any) => setNewBacklogType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
                  >
                    <option value="External">External</option>
                    <option value="Internal">Internal</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Internal Marks</label>
                  <input
                    type="number"
                    value={newOrigInternal}
                    onChange={(e) => setNewOrigInternal(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">External Marks</label>
                  <input
                    type="number"
                    value={newOrigExternal}
                    onChange={(e) => setNewOrigExternal(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks / Reason</label>
                <input
                  type="text"
                  value={newRemarks}
                  onChange={(e) => setNewRemarks(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Save ATKT Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CLEAR BACKLOG */}
      {showClearModal && selectedAtktForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Mark ATKT Backlog Cleared</span>
              </h3>
              <button onClick={() => setShowClearModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClearBacklog} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900">{selectedAtktForAction.studentName}</p>
                <p className="text-slate-500">
                  [{selectedAtktForAction.subjectCode}] {selectedAtktForAction.subjectName}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Re-Examination Marks Obtained</label>
                <input
                  type="number"
                  required
                  min={20}
                  max={100}
                  value={reExamMarksInput}
                  onChange={(e) => setReExamMarksInput(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Confirm Backlog Cleared
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
