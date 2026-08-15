import React, { useState } from 'react';
import { Student360Profile, Department, CollegeSettings } from '../types';
import {
  TrendingUp,
  AlertTriangle,
  Send,
  Download,
  Filter,
  Search,
  Users,
  CheckCircle2,
  Mail,
  Phone,
  Eye,
  FileSpreadsheet,
  Printer,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import { exportReportToPDF, exportReportToExcel, exportReportToCSV } from '../utils/reportExporter';
import { ExportReportModal } from './ExportReportModal';

interface DefaulterAnalyticsProps {
  students: Student360Profile[];
  departments: Department[];
  settings: CollegeSettings;
  onOpen360: (student: Student360Profile) => void;
}

export const DefaulterAnalytics: React.FC<DefaulterAnalyticsProps> = ({
  students,
  departments,
  settings,
  onOpen360,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedProgram, setSelectedProgram] = useState<string>('ALL');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [selectedSem, setSelectedSem] = useState<string>('ALL');
  const [selectedDiv, setSelectedDiv] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL' | 'MODERATE'>('ALL');
  const [search, setSearch] = useState<string>('');
  const [notifiedStudents, setNotifiedStudents] = useState<Set<string>>(new Set());
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const minPct = settings.minimumAttendancePct || 75;

  // Filter students
  const defaulters = students.filter((s) => {
    const isDefaulter = s.attendancePercentage < minPct;
    if (!isDefaulter) return false;

    const matchesDept = selectedDept === 'ALL' || s.departmentId === selectedDept || s.departmentName.includes(selectedDept);
    const matchesProgram = selectedProgram === 'ALL' || (s.programName && s.programName.toLowerCase().includes(selectedProgram.toLowerCase())) || (s.course && s.course.toLowerCase().includes(selectedProgram.toLowerCase()));
    const matchesCourse = selectedCourse === 'ALL' || (s.course && s.course.toLowerCase().includes(selectedCourse.toLowerCase()));
    const matchesSem = selectedSem === 'ALL' || String(s.semester) === selectedSem;
    const matchesDiv = selectedDiv === 'ALL' || s.division === selectedDiv;
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase());

    const isCritical = s.attendancePercentage < 60;
    const matchesRisk =
      riskFilter === 'ALL' ||
      (riskFilter === 'CRITICAL' && isCritical) ||
      (riskFilter === 'MODERATE' && !isCritical);

    return matchesDept && matchesProgram && matchesCourse && matchesSem && matchesDiv && matchesSearch && matchesRisk;
  });

  const headers = ['Roll Number', 'Full Name', 'Department & Course', 'Semester', 'Division', 'Attended / Total', 'Attendance %', 'Shortage', 'Parent Contact', 'Risk Status'];
  const rows = defaulters.map((s) => {
    const shortageLectures = Math.ceil((minPct / 100) * s.totalLectures - s.attendedLectures);
    return [
      s.rollNumber,
      s.fullName,
      s.departmentName,
      `Sem ${s.semester}`,
      s.division,
      `${s.attendedLectures} / ${s.totalLectures}`,
      `${s.attendancePercentage}%`,
      `-${shortageLectures > 0 ? shortageLectures : 0} Lectures`,
      s.fatherMobile || s.motherMobile || s.personalMobile || 'N/A',
      s.attendancePercentage < 60 ? 'Critical Risk (<60%)' : 'Moderate Defaulter',
    ];
  });

  const reportMetadata = {
    program: selectedDept === 'ALL' ? 'Department of Accounting & Finance' : selectedDept,
    course: 'B.Com Accounting & Finance / M.Com Business Analytics',
    academicYear: settings.academicYear || 'AY 2025-26',
    semester: selectedSem === 'ALL' ? 'All Semesters' : `Semester ${selectedSem}`,
    division: selectedDiv === 'ALL' ? 'All Divisions' : `Division ${selectedDiv}`,
    subject: 'All Subjects',
    generatedBy: 'HOD / Attendance Monitoring Committee',
  };

  const totalDefaultersCount = students.filter((s) => s.attendancePercentage < minPct).length;
  const criticalDefaultersCount = students.filter((s) => s.attendancePercentage < 60).length;
  const moderateDefaultersCount = students.filter(
    (s) => s.attendancePercentage >= 60 && s.attendancePercentage < minPct
  ).length;

  const handleSendNotice = (studentId: string, studentName: string) => {
    setNotifiedStudents((prev) => new Set(prev).add(studentId));
    setNoticeMessage(`Official attendance warning notice sent to ${studentName} and parents via Email & SMS.`);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  const handleSendAllNotices = () => {
    const newSet = new Set(notifiedStudents);
    defaulters.forEach((s) => newSet.add(s.id));
    setNotifiedStudents(newSet);
    setNoticeMessage(`Official attendance warning notices broadcasted to all ${defaulters.length} defaulter students & parents.`);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  const handleExportCSV = () => {
    let csv = 'Roll Number,Full Name,Department,Semester,Division,Attendance %,Attended,Total Lectures,Parent Mobile,Status\n';
    defaulters.forEach((s) => {
      csv += `${s.rollNumber},"${s.fullName}",${s.departmentName},${s.semester},${s.division},${s.attendancePercentage}%,${s.attendedLectures},${s.totalLectures},${s.fatherMobile || s.motherMobile || 'N/A'},${s.attendancePercentage < 60 ? 'Critical Risk' : 'Moderate Defaulter'}\n`;
    });
    const encoded = encodeURI('data:text/csv;charset=utf-8,' + csv);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `Defaulter_Analytics_Report_${new Date().toISOString().substring(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-rose-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded border border-rose-400/30 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Defaulter Analytics & Action Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Attendance Defaulter Matrix</h1>
          <p className="text-xs text-rose-200 mt-1">
            Real-time tracking of students below mandatory {minPct}% attendance threshold with parent alert tools.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSendAllNotices}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Send className="w-4 h-4" />
            <span>Broadcast Warnings ({defaulters.length})</span>
          </button>
          <button
            onClick={() => exportReportToPDF({ title: 'OFFICIAL ATTENDANCE DEFAULTER MATRIX REPORT', metadata: reportMetadata, headers, rows })}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            <Printer className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => exportReportToExcel({ title: 'OFFICIAL ATTENDANCE DEFAULTER MATRIX REPORT', metadata: reportMetadata, headers, rows })}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => exportReportToCSV({ title: 'OFFICIAL ATTENDANCE DEFAULTER MATRIX REPORT', metadata: reportMetadata, headers, rows })}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition"
          >
            <FileText className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition"
          >
            <Download className="w-4 h-4" />
            <span>Configure Export</span>
          </button>
        </div>
      </div>

      {noticeMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Defaulters (&lt;{minPct}%)</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalDefaultersCount}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Out of {students.length} enrolled students</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Critical Risk (&lt;60%)</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{criticalDefaultersCount}</h3>
            <p className="text-[10px] text-rose-500 font-semibold mt-0.5">Immediate Exam Debarment Risk</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Moderate Defaulters (60-74%)</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{moderateDefaultersCount}</h3>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Requires Medical/Parent Verification</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Notices Issued</p>
            <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{notifiedStudents.size}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Parent alerts dispatched</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            <Mail className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll no, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-bold">Program:</span>
            <select
              value={selectedProgram}
              onChange={(e) => {
                setSelectedProgram(e.target.value);
                setSelectedCourse('ALL');
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
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
            >
              <option value="ALL">All Courses</option>
              {(selectedProgram === 'ALL' || selectedProgram === 'Undergraduate') && (
                <option value="BAF">BAF</option>
              )}
              {(selectedProgram === 'ALL' || selectedProgram === 'Postgraduate') && (
                <option value="M.Com">M.Com</option>
              )}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-bold">Semester:</span>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
            >
              <option value="ALL">All Semesters</option>
              {(selectedCourse === 'M.Com' ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6]).map((sem) => (
                <option key={sem} value={String(sem)}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

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

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-bold">Risk Level:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical (&lt;60%)</option>
              <option value="MODERATE">Moderate (60-74%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Defaulter Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center font-bold text-xs text-slate-700">
          <span>Defaulter Student Directory ({defaulters.length} matches)</span>
          <span className="text-[11px] text-slate-500 font-normal">
            Threshold: &lt;{minPct}% Attendance
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b">
                <th className="p-3 pl-4">Roll No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Dept & Sem</th>
                <th className="p-3">Lectures</th>
                <th className="p-3">Attendance %</th>
                <th className="p-3">Shortage</th>
                <th className="p-3">Parent Mobile</th>
                <th className="p-3 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {defaulters.map((s) => {
                const isNotified = notifiedStudents.has(s.id);
                const shortageLectures = Math.ceil(
                  (minPct / 100) * s.totalLectures - s.attendedLectures
                );

                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 pl-4 font-mono font-bold text-slate-800">{s.rollNumber}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <img
                          src={s.passportPhoto}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{s.fullName}</p>
                          <p className="text-[10px] text-slate-500">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600">
                      {s.departmentName} (Sem {s.semester}-{s.division})
                    </td>
                    <td className="p-3 text-slate-600">
                      {s.attendedLectures} / {s.totalLectures}
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-black px-2 py-0.5 rounded text-xs ${
                          s.attendancePercentage < 60
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {s.attendancePercentage}%
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-rose-600">
                      -{shortageLectures > 0 ? shortageLectures : 0} Lectures
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {s.fatherMobile || s.motherMobile || s.personalMobile || 'N/A'}
                    </td>
                    <td className="p-3 text-right pr-4 space-x-2">
                      <button
                        onClick={() => onOpen360(s)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>360°</span>
                      </button>

                      <button
                        onClick={() => handleSendNotice(s.id, s.fullName)}
                        disabled={isNotified}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition ${
                          isNotified
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                        }`}
                      >
                        {isNotified ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Notice Sent</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Notice</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {defaulters.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No defaulter students found for selected criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">All filtered students meet the mandatory attendance criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="OFFICIAL ATTENDANCE DEFAULTER MATRIX REPORT"
        headers={headers}
        rows={rows}
        defaultMetadata={reportMetadata}
      />
    </div>
  );
};
