import React, { useState } from 'react';
import { Student360Profile, Department, AttendanceSession } from '../types';
import { FileSpreadsheet, Printer, Download, Filter, Search, FileText, Sparkles } from 'lucide-react';
import { COLLEGE_HEADER_DETAILS, JBSPS_LOGO_SVG, exportReportToPDF, exportReportToExcel, exportReportToCSV } from '../utils/reportExporter';
import { ExportReportModal } from './ExportReportModal';

interface ReportsExporterProps {
  students: Student360Profile[];
  departments: Department[];
  sessions: AttendanceSession[];
}

export const ReportsExporter: React.FC<ReportsExporterProps> = ({ students, departments, sessions }) => {
  const [reportType, setReportType] = useState<'defaulters' | 'daily' | 'monthly' | 'department'>('defaulters');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedProgram, setSelectedProgram] = useState<string>('ALL');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [selectedSem, setSelectedSem] = useState<string>('ALL');
  const [selectedDiv, setSelectedDiv] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeStudents = students.filter((s) => {
    const isDef = reportType === 'defaulters' ? s.attendancePercentage < 75 : true;
    if (!isDef) return false;

    const matchesDept = selectedDept === 'ALL' || s.departmentId === selectedDept || (s.departmentName && s.departmentName.includes(selectedDept));
    const matchesProgram = selectedProgram === 'ALL' || (s.programName && s.programName.toLowerCase().includes(selectedProgram.toLowerCase())) || (s.course && s.course.toLowerCase().includes(selectedProgram.toLowerCase()));
    const matchesCourse = selectedCourse === 'ALL' || (s.course && s.course.toLowerCase().includes(selectedCourse.toLowerCase())) || (selectedCourse === 'BAF' && s.course && (s.course.includes('BAF') || s.course.includes('B.Com')));
    const matchesSem = selectedSem === 'ALL' || String(s.semester) === selectedSem;
    const matchesDiv = selectedDiv === 'ALL' || s.division === selectedDiv;

    return matchesDept && matchesProgram && matchesCourse && matchesSem && matchesDiv;
  });

  const headers = ['Roll Number', 'Student Name', 'Program & Department', 'Semester', 'Total Lectures', 'Attended', 'Attendance %', 'Status'];
  const rows = activeStudents.map((stu) => [
    stu.rollNumber,
    stu.fullName,
    stu.departmentName,
    `Sem ${stu.semester}`,
    stu.totalLectures,
    stu.attendedLectures,
    `${stu.attendancePercentage}%`,
    stu.attendancePercentage >= 75 ? 'Satisfactory' : 'Defaulter Notice',
  ]);

  const reportTitle = reportType === 'defaulters' 
    ? 'OFFICIAL ATTENDANCE DEFAULTER REGISTER (<75%)' 
    : reportType === 'daily' 
    ? 'DAILY ATTENDANCE LOG REPORT'
    : reportType === 'monthly'
    ? 'MONTHLY MASTER ATTENDANCE SUMMARY'
    : 'DEPARTMENT-WISE ACADEMIC COMPARISON REPORT';

  const metadata = {
    program: selectedDept === 'prog-bcom-af' ? 'B.Com Accounting & Finance' : selectedDept === 'prog-mcom-ba' ? 'M.Com Business Analytics' : 'All Programs',
    course: 'Department of Accounting & Finance',
    academicYear: 'AY 2025-26',
    semester: 'All Semesters',
    division: 'Div A / B / C',
    subject: 'All Subjects',
    generatedBy: 'Admin (College Attendance ERP)',
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">ERP Reports & Export Engine</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate official printable attendance registers, monthly summary sheets, and defaulter reports with college header.
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => exportReportToPDF({ title: reportTitle, metadata, headers, rows })}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Export PDF / Print</span>
          </button>
          <button
            onClick={() => exportReportToExcel({ title: reportTitle, metadata, headers, rows })}
            className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => exportReportToCSV({ title: reportTitle, metadata, headers, rows })}
            className="flex items-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <FileText className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Configure Export</span>
          </button>
        </div>
      </div>

      {/* Options Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 text-xs font-medium">
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-bold">Report Type:</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
          >
            <option value="defaulters">Defaulters List (&lt;75%)</option>
            <option value="daily">Daily Attendance Register</option>
            <option value="monthly">Monthly Master Summary</option>
            <option value="department">Department-Wise Comparison</option>
          </select>
        </div>

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
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
          >
            <option value="ALL">All Programs</option>
            <option value="Undergraduate">Undergraduate</option>
            <option value="Postgraduate">Postgraduate</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
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

        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-bold">Semester:</span>
          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
          >
            <option value="ALL">All Semesters</option>
            {[1, 2, 3, 4, 5, 6].map((sem) => (
              <option key={sem} value={String(sem)}>Sem {sem}</option>
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
            <option value="ALL">All Divisions</option>
            {['A', 'B', 'C'].map((div) => (
              <option key={div} value={div}>Division {div}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Report Preview Card with Official Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        
        {/* Official College Header Banner */}
        <div className="text-center border-b pb-6 space-y-1">
          <div
            className="flex justify-center scale-90"
            dangerouslySetInnerHTML={{ __html: JBSPS_LOGO_SVG }}
          />
          <p className="text-xs font-black tracking-widest text-amber-800 uppercase">
            {COLLEGE_HEADER_DETAILS.institution}
          </p>
          <h2 className="text-lg font-black text-slate-900 uppercase">
            {COLLEGE_HEADER_DETAILS.collegeName}
          </h2>
          <p className="text-xs font-extrabold text-indigo-900">
            {COLLEGE_HEADER_DETAILS.collegeType}
          </p>
          <p className="text-[10px] text-slate-600 font-semibold">
            {COLLEGE_HEADER_DETAILS.naac}
          </p>
          <p className="text-[10px] text-slate-600 font-semibold">
            {COLLEGE_HEADER_DETAILS.ugc} • {COLLEGE_HEADER_DETAILS.mumbaiAward}
          </p>
          <p className="text-xs font-bold text-indigo-600 uppercase pt-1">
            {COLLEGE_HEADER_DETAILS.department}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/80 p-3 rounded-xl max-w-xl mx-auto text-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{reportTitle}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Program: {metadata.program} • Generated on: {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[10px] border-b">
                <th className="p-3 pl-4">Roll</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Program</th>
                <th className="p-3">Total Lectures</th>
                <th className="p-3">Attended</th>
                <th className="p-3">Percentage</th>
                <th className="p-3">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeStudents.map((stu) => (
                <tr key={stu.id} className="hover:bg-slate-50">
                  <td className="p-3 pl-4 font-mono font-bold text-slate-800">{stu.rollNumber}</td>
                  <td className="p-3 font-semibold text-slate-800">{stu.fullName}</td>
                  <td className="p-3 text-slate-600">{stu.departmentName} (Sem {stu.semester})</td>
                  <td className="p-3 text-slate-600">{stu.totalLectures}</td>
                  <td className="p-3 font-semibold text-slate-800">{stu.attendedLectures}</td>
                  <td className="p-3">
                    <span className={`font-bold ${stu.attendancePercentage >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {stu.attendancePercentage}%
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${stu.attendancePercentage >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {stu.attendancePercentage >= 75 ? 'Satisfactory' : 'Defaulter Notice'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Config Modal */}
      <ExportReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={reportTitle}
        headers={headers}
        rows={rows}
        defaultMetadata={metadata}
      />

    </div>
  );
};

