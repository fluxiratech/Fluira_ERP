import React, { useState, useEffect } from 'react';
import { Student360Profile, SubjectDetail, DepartmentActivity, LeaveRequest } from '../types';
import { exportStudent360ToPDF } from '../utils/reportExporter';
import { convertFileToJPGDataUrl } from '../utils/imageUtils';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Award,
  BookOpen,
  Briefcase,
  FileText,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Download,
  Building2,
  Printer,
  Edit2,
  Save,
  RotateCcw,
  FileCheck2,
  Plus,
  Calendar,
  Upload,
} from 'lucide-react';

interface Student360ModalProps {
  student: Student360Profile | null;
  onClose: () => void;
  onSave?: (updatedStudent: Student360Profile) => void;
  leaves?: LeaveRequest[];
  onApplyLeave?: (newLeave: Partial<LeaveRequest>) => void;
}

export const Student360Modal: React.FC<Student360ModalProps> = ({
  student,
  onClose,
  onSave,
  leaves = [],
  onApplyLeave,
}) => {
  if (!student) return null;

  const [activeTab, setActiveTab] = useState<
    'profile' | 'academic' | 'gpa' | 'subjects' | 'activities' | 'portfolio' | 'attendance' | 'idcard' | 'leaves'
  >('profile');

  // Leave Form State inside Modal
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState<'Medical' | 'Casual' | 'Academic/OD' | 'Duty Leave'>('Medical');
  const [leaveStartDate, setLeaveStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [leaveEndDate, setLeaveEndDate] = useState(new Date().toISOString().substring(0, 10));
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveMedicalDocUrl, setLeaveMedicalDocUrl] = useState('');

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Student360Profile>(student);
  const [editTab, setEditTab] = useState<'personal' | 'enrollment' | 'contact' | 'parents' | 'qualifications' | 'gpas' | 'skills'>('personal');
  const [editSkillsStr, setEditSkillsStr] = useState('');
  const [editLangsStr, setEditLangsStr] = useState('');

  // Synchronize state when student prop updates
  useEffect(() => {
    if (student) {
      setFormData(student);
      setEditSkillsStr((student.technicalSkills || []).join(', '));
      setEditLangsStr((student.programmingLanguages || []).join(', '));
    }
  }, [student]);

  const handleStartEditing = () => {
    setFormData({ ...student });
    setEditSkillsStr((student.technicalSkills || []).join(', '));
    setEditLangsStr((student.programmingLanguages || []).join(', '));
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const prn = formData.prnNumber || formData.studentId;
    const sscYr = formData.sscYear || formData.sscPassingYear;
    const hscYr = formData.hscYear || formData.hscPassingYear;
    const fMobile = formData.fatherMobile || formData.parentMobile;
    const yr = formData.year || formData.academicYear;

    const updatedStudent: Student360Profile = {
      ...formData,
      studentId: prn,
      prnNumber: prn,
      sscPassingYear: sscYr,
      sscYear: sscYr,
      hscPassingYear: hscYr,
      hscYear: hscYr,
      parentMobile: fMobile,
      fatherMobile: fMobile,
      year: yr,
      technicalSkills: editSkillsStr.split(/[,;]/).map(s => s.trim()).filter(Boolean),
      programmingLanguages: editLangsStr.split(/[,;]/).map(s => s.trim()).filter(Boolean),
    };

    if (onSave) {
      onSave(updatedStudent);
    }
    setIsEditing(false);
    alert('Student 360° Profile updated successfully!');
  };

  const getAttendanceColor = (pct: number) => {
    if (pct >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (pct >= 75) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const departmentActivities = (student.departmentActivities && student.departmentActivities.length > 0)
    ? student.departmentActivities
    : [
        {
          id: 'act-1',
          type: 'Research Projects' as const,
          title: 'Algorithmic Stock Trading & FinTech Machine Learning Model',
          date: '2026-03-15',
          organizer: 'Dept. of Accounting & Finance',
          roleOrPosition: 'Lead Student Researcher',
          description: 'Designed and presented a financial research project on predictive analytics in capital markets.',
          photoUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500',
        },
        {
          id: 'act-2',
          type: 'Seminars' as const,
          title: 'National Seminar on GST Return Filing & Corporate Tax Reforms',
          date: '2026-02-10',
          organizer: 'Internal Quality Assurance Cell (IQAC)',
          roleOrPosition: 'Delegate & Paper Presenter',
          description: 'Participated in a state-level seminar on recent GST amendments and tax compliance.',
        },
        {
          id: 'act-3',
          type: 'Internships' as const,
          title: 'Tax Analyst Internship at Deloitte Haskins & Sells',
          date: '2025-12-01',
          organizer: 'Corporate Placement Cell',
          roleOrPosition: 'Taxation Intern',
          description: 'Assisted senior audit associates with corporate tax filings, TDS reconciliation, and financial audit reports.',
        },
        {
          id: 'act-4',
          type: 'Achievements' as const,
          title: '1st Rank Holder in University Mock Stock Exchange Competition',
          date: '2025-11-20',
          organizer: 'Mumbai University Commerce Association',
          roleOrPosition: 'Champion / Gold Medalist',
          description: 'Secured first rank out of 180 participating colleges in portfolio optimization.',
        },
        {
          id: 'act-5',
          type: 'Awards' as const,
          title: 'Institutional Academic Excellence & Outstanding Leadership Award',
          date: '2025-10-15',
          organizer: 'Janardan Bhagat Shikshan Prasarak Sanstha',
          roleOrPosition: 'Awardee',
          description: 'Conferred highest student honor for maintaining 9.5+ CGPA and leading student council.',
        },
        {
          id: 'act-6',
          type: 'Competitions' as const,
          title: 'Inter-College Business Plan & FinTech Innovation Competition',
          date: '2025-09-05',
          organizer: 'CKT Entrepreneurship Cell',
          roleOrPosition: '1st Runner-Up',
          description: 'Pitched an AI-driven automated micro-invoicing platform for local MSME vendors.',
        },
        {
          id: 'act-7',
          type: 'Volunteer Activities' as const,
          title: 'NSS Financial Literacy & Digital Payment Security Drive',
          date: '2025-08-12',
          organizer: 'NSS Unit CKT College',
          roleOrPosition: 'Lead Student Volunteer',
          description: 'Educated over 350 rural villagers on UPI fraud prevention and digital banking safety.',
        },
        {
          id: 'act-8',
          type: 'Other' as const,
          title: 'Annual College Cultural & Commerce Fest Main Coordinator',
          date: '2025-07-25',
          organizer: 'Student Welfare Association',
          roleOrPosition: 'Event Head',
          description: 'Managed logistics, budgeting, and sponsorship drives for 2,500+ fest attendees.',
        },
      ];

  const sampleSubjects: SubjectDetail[] = student.registeredSubjectsDetails || [
    { subjectCode: 'AF401', subjectName: 'Financial Accounting – IV', facultyName: 'Prof. Amit Patel', credits: 4, attendancePct: 92, internalMarks: 36, externalMarks: 52, totalMarks: 88, grade: 'O' },
    { subjectCode: 'AF402', subjectName: 'Financial Management – I', facultyName: 'Prof. Priya Deshmukh', credits: 4, attendancePct: 86, internalMarks: 34, externalMarks: 48, totalMarks: 82, grade: 'A+' },
    { subjectCode: 'AF403', subjectName: 'Taxation – I (Direct Taxes)', facultyName: 'Dr. Sunita Kulkarni', credits: 3, attendancePct: 89, internalMarks: 32, externalMarks: 46, totalMarks: 78, grade: 'A' },
    { subjectCode: 'AF404', subjectName: 'Business Economics – II', facultyName: 'Prof. Amit Patel', credits: 3, attendancePct: 90, internalMarks: 35, externalMarks: 50, totalMarks: 85, grade: 'A+' },
    { subjectCode: 'AF405', subjectName: 'Auditing & Corporate Governance', facultyName: 'Prof. Priya Deshmukh', credits: 3, attendancePct: 84, internalMarks: 30, externalMarks: 44, totalMarks: 74, grade: 'B+' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <img
              src={student.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={student.fullName}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-xl shrink-0"
            />
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl font-bold text-white">{student.fullName}</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Roll: {student.rollNumber}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/20">
                  PRN: {student.studentId}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  student.academicStatus === 'Pass Out' || student.academicStatus === 'Alumni'
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-400/30'
                    : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                }`}>
                  Status: {student.academicStatus || 'Active'}
                </span>
              </div>

              <p className="text-sm text-slate-300 mt-1">
                {student.course} • {student.departmentName} (Sem {student.semester} - Div {student.division})
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-xs text-slate-300">
                <span>ABC ID: <strong className="text-white font-mono">{student.abcId || 'ABC-8921-3301-4490'}</strong></span>
                <span>Aadhaar: <strong className="text-white font-mono">{student.aadhaarNumber || '9821-4402-1198'}</strong></span>
                <span>Blood Group: <strong className="text-white">{student.bloodGroup}</strong></span>
                <span>Category: <strong className="text-white">{student.category}</strong></span>
              </div>
            </div>

            {/* Attendance Status, PDF Download & Edit Profile Button */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="text-center bg-white/10 p-3 rounded-xl border border-white/10 min-w-[130px]">
                <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Attendance</p>
                <p className={`text-2xl font-bold ${student.attendancePercentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {student.attendancePercentage}%
                </p>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  {student.attendedLectures} / {student.totalLectures} Lectures
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button
                    onClick={handleStartEditing}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold shadow-md transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Cancel Edit</span>
                  </button>
                )}

                <button
                  onClick={() => exportStudent360ToPDF(student)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* EDIT MODE FORM VIEW OR TABBED VIEW */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* Edit Sub-Header Navigation */}
            <div className="border-b border-slate-200 bg-white px-6 py-2 flex items-center space-x-2 overflow-x-auto shadow-sm">
              {[
                { id: 'personal', label: '1. Personal & Identity' },
                { id: 'enrollment', label: '2. Enrollment & Class' },
                { id: 'contact', label: '3. Contact & Address' },
                { id: 'parents', label: '4. Parents & Family' },
                { id: 'qualifications', label: '5. SSC & HSC Marks' },
                { id: 'gpas', label: '6. GPAs & CGPA' },
                { id: 'skills', label: '7. Skills & Languages' },
              ].map((tb) => (
                <button
                  key={tb.id}
                  type="button"
                  onClick={() => setEditTab(tb.id as any)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                    editTab === tb.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            {/* Form Fields Container */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              
              {/* TAB 1: Personal & Identity */}
              {editTab === 'personal' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Personal & Official Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Date of Birth (DOB)</label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Blood Group</label>
                      <input
                        type="text"
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. B+, O+, A+"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="General">General</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="EWS">EWS</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Academic Status</label>
                      <select
                        value={formData.academicStatus || 'Active'}
                        onChange={(e) => setFormData({ ...formData, academicStatus: e.target.value as any })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Pass Out">Pass Out</option>
                        <option value="Alumni">Alumni</option>
                        <option value="Dropout">Dropout</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">ABC ID (Academic Bank of Credits)</label>
                      <input
                        type="text"
                        value={formData.abcId || ''}
                        onChange={(e) => setFormData({ ...formData, abcId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. ABC-8921-3301-4490"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Aadhaar Card Number</label>
                      <input
                        type="text"
                        value={formData.aadhaarNumber || ''}
                        onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. 9821-4402-1198"
                      />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="font-bold text-slate-700 block mb-1">Passport Photo (.jpg format only)</label>
                      <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="shrink-0">
                          {formData.passportPhoto ? (
                            <img
                              src={formData.passportPhoto}
                              alt="Student Passport"
                              className="w-14 h-14 rounded-xl object-cover border-2 border-indigo-300 shadow-sm"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-400">
                              <User className="w-7 h-7" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-[11px] text-slate-500 font-medium">Select a .jpg photo from your computer or device.</p>
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
                                    setFormData({ ...formData, passportPhoto: jpgDataUrl });
                                  } catch (err) {
                                    alert('Please upload a valid .jpg file.');
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Enrollment & Class */}
              {editTab === 'enrollment' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Enrollment & Institutional Assignment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">PRN / Student ID</label>
                      <input
                        type="text"
                        required
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Roll Number</label>
                      <input
                        type="text"
                        required
                        value={formData.rollNumber}
                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Department Name</label>
                      <input
                        type="text"
                        required
                        value={formData.departmentName}
                        onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Degree Course</label>
                      <input
                        type="text"
                        required
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Academic Year</label>
                      <input
                        type="text"
                        required
                        value={formData.academicYear}
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. FY, SY, TY, Part I"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Semester Number</label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={8}
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Division / Section</label>
                      <input
                        type="text"
                        required
                        value={formData.division}
                        onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Admission Date</label>
                      <input
                        type="date"
                        value={formData.admissionDate}
                        onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Contact & Address */}
              {editTab === 'contact' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Student Contact & Residential Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Personal Mobile Number</label>
                      <input
                        type="text"
                        required
                        value={formData.personalMobile}
                        onChange={(e) => setFormData({ ...formData, personalMobile: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">WhatsApp Mobile Number</label>
                      <input
                        type="text"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Emergency Contact Number</label>
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Permanent Residential Address</label>
                      <textarea
                        rows={2}
                        value={formData.permanentAddress}
                        onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Temporary / Local Address</label>
                      <textarea
                        rows={2}
                        value={formData.temporaryAddress}
                        onChange={(e) => setFormData({ ...formData, temporaryAddress: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Parents & Family */}
              {editTab === 'parents' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Parent & Guardian Particulars</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Father's Full Name</label>
                      <input
                        type="text"
                        value={formData.fatherName}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Mother's Full Name</label>
                      <input
                        type="text"
                        value={formData.motherName}
                        onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Guardian Name (Optional)</label>
                      <input
                        type="text"
                        value={formData.guardianName || ''}
                        onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Parent Mobile Number</label>
                      <input
                        type="text"
                        value={formData.parentMobile}
                        onChange={(e) => setFormData({ ...formData, parentMobile: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Parent Email Address</label>
                      <input
                        type="email"
                        value={formData.parentEmail}
                        onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Father's Occupation</label>
                      <input
                        type="text"
                        value={formData.parentOccupation}
                        onChange={(e) => setFormData({ ...formData, parentOccupation: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Annual Family Income</label>
                      <input
                        type="text"
                        value={formData.annualIncome || ''}
                        onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. ₹ 6,50,000 / annum"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Qualifications */}
              {editTab === 'qualifications' && (
                <div className="space-y-4">
                  {/* SSC Details */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-indigo-700 border-b pb-2">Secondary School Certificate (SSC / 10th)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">SSC School Name</label>
                        <input
                          type="text"
                          value={formData.sscSchoolName}
                          onChange={(e) => setFormData({ ...formData, sscSchoolName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">SSC Board</label>
                        <input
                          type="text"
                          value={formData.sscBoard}
                          onChange={(e) => setFormData({ ...formData, sscBoard: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Passing Year</label>
                        <input
                          type="text"
                          value={formData.sscPassingYear}
                          onChange={(e) => setFormData({ ...formData, sscPassingYear: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">SSC Percentage (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.sscPercentage}
                          onChange={(e) => setFormData({ ...formData, sscPercentage: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl font-bold text-emerald-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* HSC Details */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-indigo-700 border-b pb-2">Higher Secondary Certificate (HSC / 12th)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">HSC College Name</label>
                        <input
                          type="text"
                          value={formData.hscCollegeName}
                          onChange={(e) => setFormData({ ...formData, hscCollegeName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">HSC Board</label>
                        <input
                          type="text"
                          value={formData.hscBoard}
                          onChange={(e) => setFormData({ ...formData, hscBoard: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Stream</label>
                        <input
                          type="text"
                          value={formData.hscStream}
                          onChange={(e) => setFormData({ ...formData, hscStream: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Passing Year</label>
                        <input
                          type="text"
                          value={formData.hscPassingYear}
                          onChange={(e) => setFormData({ ...formData, hscPassingYear: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">HSC Percentage (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.hscPercentage}
                          onChange={(e) => setFormData({ ...formData, hscPercentage: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl font-bold text-indigo-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: GPAs & Performance */}
              {editTab === 'gpas' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-2">College Semester SGPA & Overall CGPA Matrix</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sem 1 GPA</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.sem1Gpa}
                        onChange={(e) => setFormData({ ...formData, sem1Gpa: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sem 2 GPA</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.sem2Gpa}
                        onChange={(e) => setFormData({ ...formData, sem2Gpa: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sem 3 GPA</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.sem3Gpa}
                        onChange={(e) => setFormData({ ...formData, sem3Gpa: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sem 4 GPA</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.sem4Gpa}
                        onChange={(e) => setFormData({ ...formData, sem4Gpa: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sem 5 GPA</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.sem5Gpa || 0}
                        onChange={(e) => setFormData({ ...formData, sem5Gpa: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sem 6 GPA</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.sem6Gpa || 0}
                        onChange={(e) => setFormData({ ...formData, sem6Gpa: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-amber-800 block mb-1">Overall CGPA</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.overallCgpa}
                        onChange={(e) => setFormData({ ...formData, overallCgpa: Number(e.target.value) })}
                        className="w-full bg-amber-50 border border-amber-300 p-2 rounded-xl font-bold text-amber-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: Skills & Languages */}
              {editTab === 'skills' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Technical Skills & Programming Languages</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Technical Skills (Comma separated)</label>
                      <textarea
                        rows={2}
                        value={editSkillsStr}
                        onChange={(e) => setEditSkillsStr(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium"
                        placeholder="Tally Prime, Financial Analysis, Corporate Tax, Excel"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Programming Languages & Tools (Comma separated)</label>
                      <textarea
                        rows={2}
                        value={editLangsStr}
                        onChange={(e) => setEditLangsStr(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium"
                        placeholder="Python, SQL, R Analytics, Power BI"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Edit Mode Save Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-lg transition flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="border-b border-slate-200 bg-slate-50/80 px-6 flex items-center space-x-2 overflow-x-auto">
              {[
                { id: 'profile', label: 'Basic Info & Contact', icon: User },
                { id: 'academic', label: 'Previous Academics (SSC/HSC)', icon: BookOpen },
                { id: 'gpa', label: 'College Performance (GPA)', icon: Award },
                { id: 'subjects', label: 'Registered Subjects', icon: FileText },
                { id: 'activities', label: 'Department Activities', icon: Building2 },
                { id: 'portfolio', label: 'Portfolio & Skills', icon: Briefcase },
                { id: 'attendance', label: 'Attendance Analysis', icon: CheckCircle2 },
                { id: 'leaves', label: 'Leaves & OD Requests', icon: Calendar },
                { id: 'idcard', label: 'Digital ID Card', icon: CreditCard },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 px-4 text-xs font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-600 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: Profile & Contact */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Basic & Contact Information */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Basic & Contact Information</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">ABC ID:</span>
                    <span className="font-mono font-bold text-indigo-700">{student.abcId || 'ABC-8921-3301-4490'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Aadhaar Number:</span>
                    <span className="font-mono font-bold text-slate-800">{student.aadhaarNumber || '9821-4402-1198'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Date of Birth / Gender:</span>
                    <span className="font-semibold text-slate-800">{student.dob} ({student.gender})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Admission Date:</span>
                    <span className="font-semibold text-slate-800">{student.admissionDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Personal Mobile:</span>
                    <span className="font-semibold text-slate-800">{student.personalMobile}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">WhatsApp Number:</span>
                    <span className="font-semibold text-slate-800">{student.whatsappNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Email Address:</span>
                    <span className="font-semibold text-slate-800">{student.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Emergency Contact:</span>
                    <span className="font-semibold text-rose-600">{student.emergencyContact}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-500 block mb-1">Permanent Address:</span>
                    <p className="font-medium text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                      {student.permanentAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parent Details */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Parent & Guardian Details</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Father's Name:</span>
                    <span className="font-semibold text-slate-800">{student.fatherName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Mother's Name:</span>
                    <span className="font-semibold text-slate-800">{student.motherName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Guardian Name:</span>
                    <span className="font-semibold text-slate-800">{student.guardianName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Parent Mobile:</span>
                    <span className="font-semibold text-slate-800">{student.parentMobile}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Parent WhatsApp:</span>
                    <span className="font-semibold text-slate-800">{student.parentMobile}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Parent Email:</span>
                    <span className="font-semibold text-slate-800">{student.parentEmail}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Father's Occupation:</span>
                    <span className="font-semibold text-slate-800">{student.parentOccupation}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Annual Income:</span>
                    <span className="font-semibold text-slate-800">{student.annualIncome || '₹ 6,50,000 / annum'}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Academic History */}
          {activeTab === 'academic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SSC Details */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">SSC (10th Standard)</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    {student.sscPercentage}%
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">School Name:</span>
                    <span className="font-semibold text-slate-800">{student.sscSchoolName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Board:</span>
                    <span className="font-semibold text-slate-800">{student.sscBoard}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Passing Year:</span>
                    <span className="font-semibold text-slate-800">{student.sscPassingYear}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Seat Number:</span>
                    <span className="font-mono font-semibold text-slate-800">S202088190</span>
                  </div>
                </div>
              </div>

              {/* HSC Details */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">HSC / Junior College (12th)</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    {student.hscPercentage}%
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">College Name:</span>
                    <span className="font-semibold text-slate-800">{student.hscCollegeName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Board / Stream:</span>
                    <span className="font-semibold text-slate-800">{student.hscBoard} ({student.hscStream})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Passing Year:</span>
                    <span className="font-semibold text-slate-800">{student.hscPassingYear}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Seat Number:</span>
                    <span className="font-mono font-semibold text-slate-800">M202299104</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Academic Performance & GPA Matrix */}
          {activeTab === 'gpa' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-50 p-6 rounded-2xl border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-indigo-950">Academic Performance Matrix & Semester Breakdown</h3>
                  <p className="text-xs text-indigo-700 mt-1">SGPA, CGPA & Percentage for B.Com (Accounting & Finance) and M.Com Business Analytics</p>
                </div>
                <div className="flex items-center gap-4 bg-white/80 p-3 rounded-xl border border-indigo-100 shadow-sm">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Overall CGPA</p>
                    <p className="text-2xl font-black text-indigo-600">{student.overallCgpa || '9.08'}</p>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Course</p>
                    <p className="text-xs font-bold text-slate-800">{student.course}</p>
                  </div>
                </div>
              </div>

              {/* Semester Breakdown Tables */}
              <div className="space-y-4">
                {['FY', 'SY', 'TY', 'M.Com Part 1', 'M.Com Part 2'].map((prog) => {
                  const perfItems = (student.academicPerformance || []).filter((p) => p.program === prog);
                  const displayItems = perfItems.length > 0 ? perfItems : [
                    { semesterId: `${prog}-1`, program: prog as any, semesterNumber: 1, division: 'A', divisionOptions: ['A'], gpa: 8.8, percentage: 83.6, resultStatus: 'PASS' as const, academicYear: '2023-2024' },
                    { semesterId: `${prog}-2`, program: prog as any, semesterNumber: 2, division: 'A', divisionOptions: ['A'], gpa: 9.1, percentage: 86.4, resultStatus: 'PASS' as const, academicYear: '2023-2024' },
                  ];

                  return (
                    <div key={prog} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{prog} Academic Record</span>
                        <span className="text-[11px] font-semibold text-indigo-600">Grade Point Average (10.0 Scale)</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-semibold">
                            <tr>
                              <th className="px-4 py-2">Semester</th>
                              <th className="px-4 py-2">Division</th>
                              <th className="px-4 py-2">SGPA</th>
                              <th className="px-4 py-2">CGPA</th>
                              <th className="px-4 py-2">Percentage</th>
                              <th className="px-4 py-2">Result Status</th>
                              <th className="px-4 py-2">Academic Year</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {displayItems.map((item, idx) => (
                              <tr key={item.semesterId || idx} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3 font-semibold text-slate-800">
                                  Sem {item.semesterNumber}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-bold border border-slate-200">
                                    Div {item.division || 'A'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-bold text-indigo-600">
                                  {item.gpa > 0 ? item.gpa.toFixed(2) : '8.92'}
                                </td>
                                <td className="px-4 py-3 font-bold text-slate-800">
                                  {item.gpa > 0 ? (item.gpa - 0.05).toFixed(2) : '8.88'}
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-700">
                                  {item.percentage > 0 ? `${item.percentage}%` : '84.5%'}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                      item.resultStatus === 'PASS'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : item.resultStatus === 'FAIL'
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}
                                  >
                                    {item.resultStatus}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {item.academicYear || student.academicYear}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Subject Details & Marks */}
          {activeTab === 'subjects' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Enrolled Course Subjects & Marks Breakdown</h3>
                  <p className="text-[11px] text-slate-500">Semester {student.semester} • Internal (40) & External (60) Assessment Marks</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-800 rounded-lg">
                  Total Subjects: {sampleSubjects.length}
                </span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Subject Code</th>
                      <th className="px-4 py-3">Subject Name</th>
                      <th className="px-4 py-3">Faculty</th>
                      <th className="px-4 py-3">Credits</th>
                      <th className="px-4 py-3">Attendance %</th>
                      <th className="px-4 py-3">Internal (40)</th>
                      <th className="px-4 py-3">External (60)</th>
                      <th className="px-4 py-3">Total (100)</th>
                      <th className="px-4 py-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {sampleSubjects.map((sub) => (
                      <tr key={sub.subjectCode} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-indigo-600">{sub.subjectCode}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{sub.subjectName}</td>
                        <td className="px-4 py-3 text-slate-600">{sub.facultyName}</td>
                        <td className="px-4 py-3 font-semibold">{sub.credits}</td>
                        <td className="px-4 py-3 font-bold text-emerald-600">{sub.attendancePct}%</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{sub.internalMarks}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{sub.externalMarks}</td>
                        <td className="px-4 py-3 font-black text-slate-900">{sub.totalMarks}</td>
                        <td className="px-4 py-3 font-bold text-indigo-700">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">{sub.grade}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: Department Activities */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">Department Activities & Co-Curricular Involvement</h3>
                  <p className="text-[11px] text-indigo-700">Seminars, Workshops, Industrial Visits, Guest Lectures, Competitions, NSS/NCC, Sports, Placement Drives</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-indigo-600 text-white rounded-lg shadow-sm">
                  {departmentActivities.length} Records
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departmentActivities.map((act) => (
                  <div key={act.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase">
                          {act.type}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-1">{act.title}</h4>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 shrink-0">{act.date}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{act.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500">Role/Position: <strong className="text-slate-800">{act.roleOrPosition}</strong></span>
                      <span className="text-[11px] text-indigo-600 font-semibold">{act.organizer}</span>
                    </div>

                    {act.photoUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 h-28">
                        <img src={act.photoUrl} alt={act.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Skills & Portfolio */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">Technical Skills & Software Tools</h3>
                <div className="flex flex-wrap gap-2">
                  {(student.technicalSkills || ['Tally Prime', 'Advanced Excel', 'Financial Modeling', 'GST Return Filing', 'Power BI', 'SQL']).map((sk, idx) => (
                    <span key={`ts-${sk}-${idx}`} className="text-xs font-medium px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {typeof sk === 'string' ? sk : String(sk)}
                    </span>
                  ))}
                  {(student.programmingLanguages || ['Python for Finance', 'R Data Analytics', 'SQL', 'Excel VBA']).map((lang, idx) => (
                    <span key={`pl-${lang}-${idx}`} className="text-xs font-medium px-3 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-100">
                      {typeof lang === 'string' ? lang : String(lang)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase text-slate-700 mb-2">Projects & Internships</h4>
                  <div className="space-y-3">
                    {(student.projects || [
                      { title: 'Corporate Tax Planning & GST Audit Project', description: 'Comprehensive study on tax minimization strategies for MSMEs.', techStack: 'Tally Prime, Excel, Income Tax Portal' }
                    ]).map((p, idx) => (
                      <div key={`proj-${idx}`} className="bg-white p-3 rounded-lg border border-slate-200">
                        <p className="text-xs font-bold text-slate-800">{p.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{p.description}</p>
                        <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-2 inline-block">
                          {p.techStack}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase text-slate-700 mb-2">Certifications & Achievements</h4>
                  <div className="space-y-3">
                    {(student.certifications || [
                      { title: 'NISM Series V-A: Mutual Fund Distributors Certification', issuer: 'National Institute of Securities Markets', year: '2024' },
                      { title: 'Certificate in Financial Risk Analytics', issuer: 'NSE Academy', year: '2023' }
                    ]).map((c, idx) => {
                      const isObj = typeof c === 'object' && c !== null;
                      const title = isObj ? (c as any).title || 'Certificate' : String(c);
                      const issuer = isObj ? (c as any).issuer || '' : '';
                      const year = isObj ? (c as any).year || '' : '';

                      return (
                        <div key={`modal-cert-${idx}`} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{title}</p>
                            {issuer && <p className="text-[11px] text-slate-500">{issuer}</p>}
                          </div>
                          {year && <span className="text-xs font-semibold text-slate-600">{year}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Attendance Breakdown */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${getAttendanceColor(student.attendancePercentage)}`}>
                <div className="flex items-center space-x-3">
                  {student.attendancePercentage >= 75 ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold">
                      {student.attendancePercentage >= 75 ? 'Mandatory Attendance Compliance Satisfied' : 'Low Attendance Defaulter Warning (<75%)'}
                    </h4>
                    <p className="text-xs opacity-90">
                      {student.attendancePercentage >= 75
                        ? 'Eligible to sit for end-semester examinations.'
                        : 'Attendance is below mandatory threshold. Medical/OD certificates must be submitted to avoid hall ticket restriction.'}
                    </p>
                  </div>
                </div>
                <span className="text-xl font-bold">{student.attendancePercentage}%</span>
              </div>
            </div>
          )}

          {/* TAB 8: ID Card Generator Modal */}
          {activeTab === 'idcard' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-6">
              
              {/* Printable ID Card Container */}
              <div className="w-[340px] bg-gradient-to-b from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl shadow-2xl p-6 border-2 border-indigo-400/30 relative overflow-hidden">
                <div className="text-center border-b border-indigo-400/20 pb-3">
                  <div className="flex items-center justify-center space-x-2">
                    <Building2 className="w-5 h-5 text-indigo-300" />
                    <span className="text-sm font-bold tracking-wider">JBSPS CKT COLLEGE</span>
                  </div>
                  <p className="text-[10px] text-indigo-200">DEPT OF ACCOUNTING & FINANCE</p>
                </div>

                <div className="my-4 flex flex-col items-center">
                  <img
                    src={student.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                    alt={student.fullName}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-white/30 shadow-md"
                  />
                  <h3 className="text-base font-bold text-white mt-3">{student.fullName}</h3>
                  <p className="text-xs text-indigo-200">{student.course}</p>
                </div>

                <div className="bg-white/10 rounded-xl p-3 text-xs space-y-1.5 backdrop-blur-md">
                  <div className="flex justify-between">
                    <span className="text-indigo-200">PRN Number:</span>
                    <span className="font-mono font-bold text-white">{student.studentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-200">Roll Number:</span>
                    <span className="font-bold text-white">{student.rollNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-200">ABC ID:</span>
                    <span className="font-mono text-indigo-200">{student.abcId || 'ABC-8921-3301'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-200">Dept / Sem / Div:</span>
                    <span className="font-semibold text-white">{student.departmentName} (Sem {student.semester}-{student.division})</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-indigo-400/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <QrCode className="w-8 h-8 text-white/80" />
                    <span className="text-[9px] text-indigo-200 leading-tight">AUTHENTICATED ERP DIGITAL ID</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    ACTIVE STUDENT
                  </span>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Student ID Card</span>
              </button>

            </div>
          )}

          {/* TAB: Leaves & OD Requests */}
          {activeTab === 'leaves' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-indigo-900 to-slate-900 p-5 rounded-2xl text-white shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-white/10 rounded-xl border border-white/10">
                    <Calendar className="w-6 h-6 text-indigo-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Leave & OD Applications History</h3>
                    <p className="text-xs text-indigo-200">
                      View status of leave applications or submit new Medical/OD leave requests.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowApplyLeaveModal(!showApplyLeaveModal)}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showApplyLeaveModal ? 'Close Form' : 'Apply for Leave / OD'}</span>
                </button>
              </div>

              {/* Leave Application Form */}
              {showApplyLeaveModal && (
                <div className="bg-white p-6 rounded-2xl border-2 border-indigo-500/30 shadow-lg space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                      <FileCheck2 className="w-4 h-4 text-indigo-600" />
                      <span>Submit Leave / Duty Leave Request</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Applicant: {student.fullName} ({student.rollNumber})
                    </span>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!leaveReason.trim()) {
                        alert('Please provide a valid reason for leave.');
                        return;
                      }

                      const start = new Date(leaveStartDate);
                      const end = new Date(leaveEndDate);
                      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

                      if (onApplyLeave) {
                        onApplyLeave({
                          applicantId: student.id,
                          applicantName: student.fullName,
                          applicantRollOrId: student.rollNumber,
                          applicantRole: 'STUDENT',
                          departmentId: student.departmentId || 'dept-af',
                          departmentName: student.departmentName || 'Department of Accounting & Finance',
                          leaveType,
                          startDate: leaveStartDate,
                          endDate: leaveEndDate,
                          totalDays: days,
                          reason: leaveReason,
                          documentUrl: leaveMedicalDocUrl || undefined,
                          status: 'PENDING_FACULTY',
                          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                        });
                      }

                      alert('Leave application submitted successfully! Sent to Class Teacher for approval.');
                      setShowApplyLeaveModal(false);
                      setLeaveReason('');
                      setLeaveMedicalDocUrl('');
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Leave Category</label>
                        <select
                          value={leaveType}
                          onChange={(e) => setLeaveType(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-bold text-slate-900"
                        >
                          <option value="Medical">Medical Leave</option>
                          <option value="Casual">Casual Leave</option>
                          <option value="Academic/OD">Academic / On-Duty (OD)</option>
                          <option value="Duty Leave">Event / Sports Duty Leave</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                        <input
                          type="date"
                          value={leaveStartDate}
                          onChange={(e) => setLeaveStartDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-bold text-slate-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">End Date</label>
                        <input
                          type="date"
                          value={leaveEndDate}
                          onChange={(e) => setLeaveEndDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-bold text-slate-900"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Detailed Reason / Purpose</label>
                      <textarea
                        rows={2}
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        placeholder="State reason for leave, medical ailment, or event participation details..."
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium text-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Medical Certificate / OD Letter Link (Optional)
                      </label>
                      <input
                        type="url"
                        value={leaveMedicalDocUrl}
                        onChange={(e) => setLeaveMedicalDocUrl(e.target.value)}
                        placeholder="https://drive.google.com/doc/medical-cert.pdf or document URL"
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-mono text-slate-900"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowApplyLeaveModal(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit Leave Application</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Leave List */}
              {(() => {
                const studentLeaves = leaves.filter(
                  (l) =>
                    l.applicantRollOrId === student.rollNumber ||
                    l.applicantRollOrId === student.studentId ||
                    l.applicantName.toLowerCase() === student.fullName.toLowerCase() ||
                    l.applicantId === student.id
                );

                if (studentLeaves.length === 0) {
                  return (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
                      <Calendar className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="text-xs font-semibold">No leave applications recorded for this student yet.</p>
                      <p className="text-[11px] text-slate-400">
                        Click "Apply for Leave / OD" above to submit a new application.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-slate-100/80 border-b border-slate-200 font-bold text-xs text-slate-700">
                      Leave Records ({studentLeaves.length})
                    </div>
                    <div className="divide-y divide-slate-100 text-xs">
                      {studentLeaves.map((l) => (
                        <div key={l.id} className="p-4 hover:bg-slate-50/80 transition space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/50">
                                {l.leaveType}
                              </span>
                              <span className="font-bold text-slate-900">
                                {l.startDate} to {l.endDate} ({l.totalDays} {l.totalDays === 1 ? 'day' : 'days'})
                              </span>
                            </div>

                            <span
                              className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                                l.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : l.status === 'REJECTED'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {l.status === 'PENDING_FACULTY'
                                ? 'Pending Class Teacher'
                                : l.status === 'PENDING_HOD'
                                ? 'Pending HOD'
                                : l.status}
                            </span>
                          </div>

                          <p className="text-slate-600 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                            <strong>Reason:</strong> {l.reason}
                          </p>

                          {(l.facultyRemarks || l.hodRemarks) && (
                            <div className="text-[11px] text-slate-500 space-y-0.5 pl-1">
                              {l.facultyRemarks && (
                                <div>• <strong>Class Teacher Remarks:</strong> {l.facultyRemarks}</div>
                              )}
                              {l.hodRemarks && (
                                <div>• <strong>HOD Remarks:</strong> {l.hodRemarks}</div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

            </div>
          </>
        )}

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-300 transition"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
