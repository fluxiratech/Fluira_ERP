import React, { useState } from 'react';
import {
  exportReportToPDF,
  exportReportToExcel,
  exportReportToCSV,
  COLLEGE_HEADER_DETAILS,
  JBSPS_LOGO_SVG,
  ExportMetadata,
} from '../utils/reportExporter';
import {
  X,
  FileSpreadsheet,
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Building2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  headers: string[];
  rows: (string | number)[][];
  defaultMetadata?: Partial<ExportMetadata>;
  filename?: string;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  title,
  headers,
  rows,
  defaultMetadata,
  filename,
}) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [program, setProgram] = useState(defaultMetadata?.program || 'Undergraduate (UG)');
  const [course, setCourse] = useState(defaultMetadata?.course || 'B.Com (Accounting & Finance)');
  const [academicYear, setAcademicYear] = useState(defaultMetadata?.academicYear || 'AY 2025-26');
  const [semester, setSemester] = useState(defaultMetadata?.semester || 'Semester III');
  const [division, setDivision] = useState(defaultMetadata?.division || 'Division A');
  const [subject, setSubject] = useState(defaultMetadata?.subject || 'All Subjects');
  const [generatedBy, setGeneratedBy] = useState(
    defaultMetadata?.generatedBy || 'Department Administrator'
  );

  if (!isOpen) return null;

  const handleExecuteExport = () => {
    const meta: ExportMetadata = {
      program,
      course,
      academicYear,
      semester,
      division,
      subject,
      generatedBy,
    };

    const exportPayload = {
      title,
      metadata: meta,
      headers,
      rows,
      filename,
    };

    if (exportFormat === 'pdf') {
      exportReportToPDF(exportPayload);
    } else if (exportFormat === 'excel') {
      exportReportToExcel(exportPayload);
    } else {
      exportReportToCSV(exportPayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex justify-between items-center border-b border-indigo-900">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Official Report Export Engine</h2>
              <p className="text-[11px] text-indigo-200">
                Automated College Header Injection • {rows.length} Data Records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* College Header Official Preview Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                Official Letterhead Header (Included on Top)
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">Center Aligned Header</span>
            </div>

            <div className="text-center space-y-1 pt-1">
              <div
                className="flex justify-center scale-90"
                dangerouslySetInnerHTML={{ __html: JBSPS_LOGO_SVG }}
              />
              <p className="text-[11px] font-black tracking-widest text-amber-800 uppercase">
                {COLLEGE_HEADER_DETAILS.institution}
              </p>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                {COLLEGE_HEADER_DETAILS.collegeName}
              </h3>
              <p className="text-[10px] font-extrabold text-indigo-900">
                {COLLEGE_HEADER_DETAILS.collegeType}
              </p>
              <p className="text-[9.5px] text-slate-600 font-semibold">
                {COLLEGE_HEADER_DETAILS.naac}
              </p>
              <p className="text-[9.5px] text-slate-600 font-semibold">
                {COLLEGE_HEADER_DETAILS.ugc} • {COLLEGE_HEADER_DETAILS.mumbaiAward}
              </p>
              <p className="text-[11px] font-bold text-indigo-600 uppercase pt-1">
                {COLLEGE_HEADER_DETAILS.department}
              </p>
            </div>
          </div>

          {/* Export Format Selection */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 block text-xs">Select Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setExportFormat('pdf')}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                  exportFormat === 'pdf'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-600/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <Printer className="w-5 h-5 text-indigo-600" />
                  {exportFormat === 'pdf' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <div>
                  <p className="font-bold text-xs">PDF Document</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">With footer & page numbers</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('excel')}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                  exportFormat === 'excel'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-600/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  {exportFormat === 'excel' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div>
                  <p className="font-bold text-xs">Excel Sheet (.xls)</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Merged header & freeze rows</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                  exportFormat === 'csv'
                    ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-600/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <FileText className="w-5 h-5 text-amber-600" />
                  {exportFormat === 'csv' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                </div>
                <div>
                  <p className="font-bold text-xs">CSV Data (.csv)</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Plain text header metadata</p>
                </div>
              </button>
            </div>
          </div>

          {/* Report Details Metadata Inputs */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-1">
              <span className="font-bold text-slate-800">Report Header Details & Metadata</span>
              <span className="text-[10px] text-slate-400">Appears below college header</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Program</label>
                <input
                  type="text"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Course</label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Semester</label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Division</label>
                <input
                  type="text"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="col-span-2">
                <label className="font-semibold text-slate-600 block mb-1">Generated By</label>
                <input
                  type="text"
                  value={generatedBy}
                  onChange={(e) => setGeneratedBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleExecuteExport}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Generate & Export Report ({exportFormat.toUpperCase()})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
