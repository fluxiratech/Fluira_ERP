import React, { useState } from 'react';
import { LeaveRequest, Department } from '../types';
import {
  FileCheck2,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  User,
  Building2,
  Calendar,
  AlertCircle,
  Send,
  Printer,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { exportReportToPDF, exportReportToExcel, exportReportToCSV } from '../utils/reportExporter';
import { ExportReportModal } from './ExportReportModal';

interface LeaveManagementProps {
  leaves: LeaveRequest[];
  departments: Department[];
  userRole: string;
  userName: string;
  onApplyLeave: (newLeave: Partial<LeaveRequest>) => void;
  onApproveLeave: (id: string, remarks: string) => void;
  onRejectLeave: (id: string, remarks: string) => void;
}

export const LeaveManagement: React.FC<LeaveManagementProps> = ({
  leaves,
  departments,
  userRole,
  userName,
  onApplyLeave,
  onApproveLeave,
  onRejectLeave,
}) => {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [reviewModalLeave, setReviewModalLeave] = useState<LeaveRequest | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const displayedLeaves = leaves.filter((leave) => {
    if (userRole === 'Student') {
      const normUser = userName.toLowerCase().trim();
      const normApplicant = leave.applicantName.toLowerCase().trim();
      const normRoll = leave.applicantRollOrId.toLowerCase().trim();
      return (
        normApplicant === normUser ||
        normApplicant.includes(normUser) ||
        normUser.includes(normApplicant) ||
        normRoll === normUser
      );
    }
    return true;
  });

  const exportHeaders = ['Applicant Name', 'Roll / Faculty ID', 'Role', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status', 'Applied On'];
  const exportRows = displayedLeaves.map((l) => [
    l.applicantName,
    l.applicantRollOrId,
    l.applicantRole,
    l.leaveType,
    l.startDate,
    l.endDate,
    l.totalDays,
    l.reason,
    l.status,
    l.appliedDate || new Date().toISOString().split('T')[0],
  ]);

  const reportMetadata = {
    program: 'Department of Accounting & Finance',
    course: 'B.Com Accounting & Finance / M.Com Business Analytics',
    academicYear: 'AY 2025-26',
    semester: 'All Semesters',
    division: 'Div A / B / C',
    subject: 'Leave & Academic Duty Register',
    generatedBy: 'Discipline & Leave Sanctioning Authority',
  };

  // Form state
  const [leaveType, setLeaveType] = useState<'Medical' | 'Casual' | 'Academic/OD' | 'Duty Leave'>('Medical');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10));
  const [reason, setReason] = useState('');
  const [medicalDocUrl, setMedicalDocUrl] = useState('');

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyLeave({
      applicantName: userName,
      applicantRole: userRole === 'Student' ? 'STUDENT' : 'FACULTY',
      applicantRollOrId: userRole === 'Student' ? '24CS01' : 'FAC101',
      departmentId: 'dept-cs',
      leaveType,
      startDate,
      endDate,
      totalDays: 2,
      reason,
      medicalDocUrl: medicalDocUrl || undefined,
    });
    setShowApplyModal(false);
    setReason('');
  };

  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">APPROVED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">REJECTED</span>;
      case 'PENDING_FACULTY':
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">PENDING FACULTY</span>;
      case 'PENDING_HOD':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">PENDING HOD REVIEW</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileCheck2 className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">
              {userRole === 'Student' ? 'My Leave Applications & OD Requests' : 'Leave Management & OD Approvals'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {userRole === 'Student'
              ? 'Track, apply, and view status of your Medical and Academic On-Duty (OD) leave applications.'
              : 'Multi-tier leave application workflow for Students & Faculty with Medical Certificate attachments.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportReportToPDF({ title: 'OFFICIAL LEAVE & ACADEMIC DUTY (OD) REGISTER REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => exportReportToExcel({ title: 'OFFICIAL LEAVE & ACADEMIC DUTY (OD) REGISTER REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => exportReportToCSV({ title: 'OFFICIAL LEAVE & ACADEMIC DUTY (OD) REGISTER REPORT', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
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
            onClick={() => setShowApplyModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Leave / OD</span>
          </button>
        </div>
      </div>

      {/* Leave Requests Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
          {userRole === 'Student' ? 'My Leave & OD Applications' : 'Recent Leave & Academic Duty Requests'} ({displayedLeaves.length})
        </div>

        <div className="divide-y divide-slate-100">
          {displayedLeaves.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <FileCheck2 className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">No leave applications found for your account.</p>
              <p className="text-[11px] text-slate-400">Click "Apply for Leave / OD" above to submit a new leave application.</p>
            </div>
          ) : (
            displayedLeaves.map((leave) => (
              <div key={leave.id} className="p-5 hover:bg-slate-50/60 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{leave.applicantName}</span>
                    <span className="text-xs text-slate-500 font-mono">({leave.applicantRollOrId})</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {leave.leaveType}
                    </span>
                    {getStatusBadge(leave.status)}
                  </div>

                  <p className="text-xs text-slate-600">
                    Duration: <strong className="text-slate-800">{leave.startDate}</strong> to <strong className="text-slate-800">{leave.endDate}</strong> ({leave.totalDays} Days)
                  </p>

                  <p className="text-xs text-slate-500 bg-slate-100/70 p-2 rounded-lg border border-slate-200 max-w-2xl">
                    "{leave.reason}"
                  </p>

                  {leave.medicalDocUrl && (
                    <a
                      href={leave.medicalDocUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-indigo-600 font-semibold hover:underline mt-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Medical Certificate Attachment</span>
                    </a>
                  )}
                </div>

                {/* Review Buttons for Authorities */}
                {leave.status.startsWith('PENDING') && userRole !== 'Student' && (
                  <button
                    onClick={() => setReviewModalLeave(leave)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition shrink-0"
                  >
                    Review Request
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-3">Submit Leave Application</h3>

            <form onSubmit={handleApplySubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full bg-slate-50 border p-2 rounded-lg font-medium"
                >
                  <option value="Medical">Medical Leave (Requires Medical Certificate)</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Academic/OD">Academic Duty / OD (Hackathon / Sports / Seminar)</option>
                  <option value="Duty Leave">Duty Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border p-2 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border p-2 rounded-lg font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Leave</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain reason in detail..."
                  className="w-full bg-slate-50 border p-2 rounded-lg font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Document / Certificate URL (Optional)</label>
                <input
                  type="url"
                  value={medicalDocUrl}
                  onChange={(e) => setMedicalDocUrl(e.target.value)}
                  placeholder="https://example.com/certificate.pdf"
                  className="w-full bg-slate-50 border p-2 rounded-lg font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Request Modal */}
      {reviewModalLeave && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-3">Review Leave Application</h3>
            <p className="text-xs text-slate-600">
              Applicant: <strong>{reviewModalLeave.applicantName}</strong> ({reviewModalLeave.leaveType})
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Approval Remarks</label>
              <textarea
                rows={3}
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="Enter approval or rejection comments..."
                className="w-full bg-slate-50 border p-2 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  onRejectLeave(reviewModalLeave.id, reviewRemarks);
                  setReviewModalLeave(null);
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
              >
                Reject Leave
              </button>
              <button
                onClick={() => {
                  onApproveLeave(reviewModalLeave.id, reviewRemarks);
                  setReviewModalLeave(null);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
              >
                Approve Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="OFFICIAL LEAVE & ACADEMIC DUTY (OD) REGISTER REPORT"
        headers={exportHeaders}
        rows={exportRows}
        defaultMetadata={reportMetadata}
      />

    </div>
  );
};
