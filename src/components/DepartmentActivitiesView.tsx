import React, { useState } from 'react';
import { DepartmentActivity, Department, Role } from '../types';
import { convertFileToJPGDataUrl } from '../utils/imageUtils';
import {
  Calendar,
  Award,
  Users,
  MapPin,
  UserCheck,
  Plus,
  Search,
  Filter,
  Printer,
  FileSpreadsheet,
  FileText,
  Download,
  Building2,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Sparkles,
  FileCheck2,
  Briefcase,
  Upload,
  GraduationCap,
  Megaphone,
} from 'lucide-react';
import { exportReportToPDF, exportReportToExcel, exportReportToCSV } from '../utils/reportExporter';
import { ExportReportModal } from './ExportReportModal';

interface DepartmentActivitiesViewProps {
  activities: DepartmentActivity[];
  departments: Department[];
  userRole?: Role;
  onAddActivity?: (activity: DepartmentActivity) => void;
  onUpdateActivity?: (id: string, updated: DepartmentActivity) => void;
  onDeleteActivity?: (id: string) => void;
}

export const DepartmentActivitiesView: React.FC<DepartmentActivitiesViewProps> = ({
  activities: initialActivities,
  departments,
  userRole = 'Admin',
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
}) => {
  const [activitiesList, setActivitiesList] = useState<DepartmentActivity[]>(initialActivities);

  // Filters
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingActivity, setEditingActivity] = useState<DepartmentActivity | null>(null);
  const [viewingDetailActivity, setViewingDetailActivity] = useState<DepartmentActivity | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<Partial<DepartmentActivity>>({
    title: '',
    type: 'Workshop',
    date: new Date().toISOString().substring(0, 10),
    organizer: 'Department of Accounting & Finance',
    venue: 'Main College Auditorium',
    speakerOrGuest: '',
    roleOrPosition: 'Organizer',
    targetAudience: 'All BAF & M.Com Students',
    participantsCount: 50,
    academicYear: 'AY 2025-26',
    status: 'Completed',
    description: '',
    keyOutcomes: '',
    photoUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
    certificateUrl: '',
    departmentId: departments[0]?.id || 'dept-af',
    departmentName: departments[0]?.name || 'Department of Accounting and Finance',
  });

  const canEdit = userRole === 'Admin' || userRole === 'HOD' || userRole === 'Faculty';

  // Filtered List
  const filteredActivities = activitiesList.filter((act) => {
    const matchesDept = selectedDeptId === 'ALL' || act.departmentId === selectedDeptId || (!act.departmentId && selectedDeptId === 'dept-af');
    const matchesType = selectedType === 'ALL' || act.type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || (act.status || 'Completed') === selectedStatus;
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.speakerOrGuest && act.speakerOrGuest.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (act.description && act.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesType && matchesStatus && matchesSearch;
  });

  // Category counts
  const totalCount = filteredActivities.length;
  const totalParticipants = filteredActivities.reduce((sum, a) => sum + (a.participantsCount || 0), 0);
  const completedCount = filteredActivities.filter((a) => (a.status || 'Completed') === 'Completed').length;
  const upcomingCount = filteredActivities.filter((a) => a.status === 'Upcoming').length;

  const activityTypesList = [
    'Seminar',
    'National Seminar',
    'Workshop',
    'Industrial Visit',
    'Guest Lecture',
    'Competition',
    'NSS/NCC Event',
    'Cultural Event',
    'Sports',
    'Placement Drive',
    'Research Project',
    'Internship',
    'Achievement',
    'Volunteer',
  ];

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingActivity(null);
    setFormData({
      title: '',
      type: 'Workshop',
      date: new Date().toISOString().substring(0, 10),
      organizer: 'Department of Accounting & Finance',
      venue: 'Main College Auditorium',
      speakerOrGuest: '',
      roleOrPosition: 'Organizer',
      targetAudience: 'All BAF & M.Com Students',
      participantsCount: 50,
      academicYear: 'AY 2025-26',
      status: 'Completed',
      description: '',
      keyOutcomes: '',
      photoUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
      certificateUrl: '',
      departmentId: departments[0]?.id || 'dept-af',
      departmentName: departments[0]?.name || 'Department of Accounting and Finance',
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (act: DepartmentActivity) => {
    setEditingActivity(act);
    setFormData({ ...act });
    setShowModal(true);
  };

  // Delete
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this department activity log?')) {
      setActivitiesList((prev) => prev.filter((a) => a.id !== id));
      if (onDeleteActivity) onDeleteActivity(id);
    }
  };

  // Save Form
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert('Activity Title is required.');
      return;
    }

    const deptObj = departments.find((d) => d.id === formData.departmentId);

    if (editingActivity) {
      const updated: DepartmentActivity = {
        ...editingActivity,
        ...(formData as DepartmentActivity),
        departmentName: deptObj?.name || formData.departmentName || 'Department of Accounting and Finance',
      };
      setActivitiesList((prev) => prev.map((a) => (a.id === editingActivity.id ? updated : a)));
      if (onUpdateActivity) onUpdateActivity(editingActivity.id, updated);
    } else {
      const newAct: DepartmentActivity = {
        id: `act-${Date.now()}`,
        title: formData.title || 'Department Workshop',
        type: (formData.type as any) || 'Workshop',
        date: formData.date || new Date().toISOString().substring(0, 10),
        organizer: formData.organizer || 'Department of Accounting & Finance',
        roleOrPosition: formData.roleOrPosition || 'Organizer',
        venue: formData.venue || 'Main Auditorium',
        speakerOrGuest: formData.speakerOrGuest || '',
        targetAudience: formData.targetAudience || 'All BAF Students',
        participantsCount: Number(formData.participantsCount) || 50,
        academicYear: formData.academicYear || 'AY 2025-26',
        status: (formData.status as any) || 'Completed',
        description: formData.description || '',
        keyOutcomes: formData.keyOutcomes || '',
        photoUrl: formData.photoUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
        certificateUrl: formData.certificateUrl || '',
        departmentId: formData.departmentId || 'dept-af',
        departmentName: deptObj?.name || 'Department of Accounting and Finance',
      };
      setActivitiesList((prev) => [newAct, ...prev]);
      if (onAddActivity) onAddActivity(newAct);
    }

    setShowModal(false);
  };

  // Exporter Headers
  const exportHeaders = ['Activity Title', 'Type', 'Date', 'Department', 'Venue', 'Speaker / Chief Guest', 'Participants Count', 'Status'];
  const exportRows = filteredActivities.map((a) => [
    a.title,
    a.type,
    a.date,
    a.departmentName || 'Dept of Accounting & Finance',
    a.venue || 'College Auditorium',
    a.speakerOrGuest || 'Internal Faculty',
    a.participantsCount || 0,
    a.status || 'Completed',
  ]);

  const reportMetadata = {
    program: 'Department Activities & Events Register',
    course: selectedDeptId === 'ALL' ? 'All College Departments' : 'Dept of Accounting & Finance',
    academicYear: 'AY 2025-26',
    semester: 'All Semesters',
    division: 'Div A / B / C',
    subject: 'Co-Curricular & Extra-Curricular Activities',
    generatedBy: 'Department HOD / Event Co-ordinator',
  };

  return (
    <div className="space-y-6">
      
      {/* Banner & Actions Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Department Activities & Co-Curricular Events Hub</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Log, track, and export academic seminars, workshops, industrial visits, guest lectures, research projects, placement drives, and student achievements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportReportToPDF({ title: 'OFFICIAL DEPARTMENT ACTIVITIES & EVENTS LOG', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => exportReportToExcel({ title: 'OFFICIAL DEPARTMENT ACTIVITIES & EVENTS LOG', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => exportReportToCSV({ title: 'OFFICIAL DEPARTMENT ACTIVITIES & EVENTS LOG', metadata: reportMetadata, headers: exportHeaders, rows: exportRows })}
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
            <button
              onClick={handleOpenAdd}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Activity</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Activities</span>
            <span className="text-xl font-black text-slate-900">{totalCount} Events</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Impacted</span>
            <span className="text-xl font-black text-slate-900">{totalParticipants} Participants</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Completed</span>
            <span className="text-xl font-black text-slate-900">{completedCount} Events</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Upcoming / Ongoing</span>
            <span className="text-xl font-black text-slate-900">{upcomingCount} Events</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-700">Department:</span>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
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
            <Filter className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-700">Category:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Event Categories</option>
              {activityTypesList.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search activity, guest, venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Activity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((act) => {
          return (
            <div
              key={act.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
            >
              {/* Photo Banner */}
              <div className="relative h-44 bg-slate-900 overflow-hidden">
                <img
                  src={act.photoUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'}
                  alt={act.title}
                  className="w-full h-full object-cover opacity-85 hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  <span className="px-2.5 py-1 bg-indigo-600/90 text-white font-extrabold text-[10px] rounded-lg backdrop-blur-sm uppercase tracking-wide">
                    {act.type}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg backdrop-blur-sm ${
                    act.status === 'Upcoming'
                      ? 'bg-amber-500/90 text-white'
                      : act.status === 'Ongoing'
                      ? 'bg-blue-600/90 text-white'
                      : 'bg-emerald-600/90 text-white'
                  }`}>
                    {act.status || 'Completed'}
                  </span>
                </div>

                <div className="absolute bottom-2 right-3 text-white text-[11px] font-bold bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-indigo-300" />
                  <span>{act.date}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug">
                    {act.title}
                  </h3>
                  <p className="text-xs text-indigo-600 font-bold mt-1">
                    {act.departmentName || 'Department of Accounting & Finance'}
                  </p>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3">
                    {act.description}
                  </p>
                </div>

                {/* Key Attributes */}
                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  {act.speakerOrGuest && (
                    <div className="flex items-start space-x-2">
                      <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span className="font-semibold text-slate-800 line-clamp-1">
                        Guest: <span className="text-slate-700 font-medium">{act.speakerOrGuest}</span>
                      </span>
                    </div>
                  )}

                  {act.venue && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="line-clamp-1 font-medium text-slate-700">{act.venue}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-slate-700 flex items-center space-x-1">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Audience: {act.targetAudience || 'BAF Students'}</span>
                    </span>

                    <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-extrabold text-[11px] rounded-md">
                      {act.participantsCount || 0} Attended
                    </span>
                  </div>
                </div>

                {/* Key Outcomes */}
                {act.keyOutcomes && (
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-700 space-y-0.5">
                    <span className="font-bold text-indigo-900 block">Key Outcomes:</span>
                    <p className="line-clamp-2 italic">{act.keyOutcomes}</p>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
                  <button
                    onClick={() => setViewingDetailActivity(act)}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <span>Full Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  {canEdit && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(act)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                        title="Edit Activity"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(act.id)}
                        className="p-1.5 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Delete Activity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredActivities.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No department activities found matching selected criteria.</p>
            <p className="text-xs text-slate-400">Try adjusting your category, department, or search query.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Activity Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <span>{editingActivity ? 'Edit Department Activity Record' : 'Log New Department Activity'}</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs font-medium overflow-y-auto flex-1 bg-slate-50">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Event / Activity Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. National Seminar on AI & Data Analytics in Financial Auditing"
                  className="w-full bg-white border border-slate-300 p-2.5 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Category / Type *</label>
                  <select
                    value={formData.type || 'Workshop'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 p-2.5 rounded-xl font-bold text-slate-800"
                  >
                    {activityTypesList.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Department *</label>
                  <select
                    value={formData.departmentId || ''}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full bg-white border border-slate-300 p-2.5 rounded-xl font-bold text-slate-800"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Date of Event *</label>
                  <input
                    type="date"
                    required
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-white border border-slate-300 p-2.5 rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Speaker / Chief Guest</label>
                  <input
                    type="text"
                    value={formData.speakerOrGuest || ''}
                    onChange={(e) => setFormData({ ...formData, speakerOrGuest: e.target.value })}
                    placeholder="e.g. CA Rajesh Varma (Deloitte India)"
                    className="w-full bg-white border border-slate-300 p-2.5 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Venue / Location</label>
                  <input
                    type="text"
                    value={formData.venue || ''}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Auditorium Hall A / Bombay Stock Exchange"
                    className="w-full bg-white border border-slate-300 p-2.5 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Target Audience</label>
                  <input
                    type="text"
                    value={formData.targetAudience || ''}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="e.g. TY BAF & M.Com Students"
                    className="w-full bg-white border border-slate-300 p-2.5 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Participants Count</label>
                  <input
                    type="number"
                    value={formData.participantsCount || 0}
                    onChange={(e) => setFormData({ ...formData, participantsCount: Number(e.target.value) })}
                    placeholder="120"
                    className="w-full bg-white border border-slate-300 p-2.5 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Event Status</label>
                  <select
                    value={formData.status || 'Completed'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 p-2.5 rounded-xl font-bold"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Organizer / Association</label>
                <input
                  type="text"
                  value={formData.organizer || ''}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  placeholder="e.g. Department of Accounting & Finance in association with ICAI"
                  className="w-full bg-white border border-slate-300 p-2.5 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Activity Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed background and summary of the department activity..."
                  className="w-full bg-white border border-slate-300 p-2.5 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Key Outcomes & Impact Highlights</label>
                <textarea
                  rows={2}
                  value={formData.keyOutcomes || ''}
                  onChange={(e) => setFormData({ ...formData, keyOutcomes: e.target.value })}
                  placeholder="Key takeaways, certifications issued, industry skills acquired..."
                  className="w-full bg-white border border-slate-300 p-2.5 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Event / Banner Photo (.jpg format only)</label>
                  <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-300">
                    {formData.photoUrl && (
                      <img src={formData.photoUrl} alt="Banner" className="w-10 h-10 rounded-lg object-cover border shrink-0" />
                    )}
                    <label className="cursor-pointer px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition inline-flex items-center space-x-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose .JPG Photo</span>
                      <input
                        type="file"
                        accept="image/jpeg,.jpg,.jpeg"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const jpgDataUrl = await convertFileToJPGDataUrl(file);
                              setFormData({ ...formData, photoUrl: jpgDataUrl });
                            } catch (err) {
                              alert('Please upload a valid .jpg image.');
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Report / Certificate Document URL</label>
                  <input
                    type="text"
                    value={formData.certificateUrl || ''}
                    onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })}
                    placeholder="https://example.com/certificates/report.pdf"
                    className="w-full bg-white border border-slate-300 p-2.5 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  {editingActivity ? 'Update Activity' : 'Save Department Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Detail Modal */}
      {viewingDetailActivity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 font-extrabold text-[10px] rounded-md uppercase">
                  {viewingDetailActivity.type}
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  {viewingDetailActivity.title}
                </h2>
              </div>
              <button
                onClick={() => setViewingDetailActivity(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <img
                src={viewingDetailActivity.photoUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'}
                alt={viewingDetailActivity.title}
                className="w-full h-48 object-cover rounded-xl"
              />

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="font-bold text-slate-500 block">Date & Venue:</span>
                  <span className="font-extrabold text-slate-800">{viewingDetailActivity.date} | {viewingDetailActivity.venue || 'College Campus'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">Organizer:</span>
                  <span className="font-extrabold text-slate-800">{viewingDetailActivity.organizer}</span>
                </div>
              </div>

              {viewingDetailActivity.speakerOrGuest && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <span className="font-bold text-indigo-900 block">Key Speaker / Chief Guest:</span>
                  <span className="font-medium text-slate-800">{viewingDetailActivity.speakerOrGuest}</span>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-800 block mb-1">Description:</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                  {viewingDetailActivity.description || 'No detailed summary provided.'}
                </p>
              </div>

              {viewingDetailActivity.keyOutcomes && (
                <div>
                  <span className="font-bold text-slate-800 block mb-1">Outcomes & Highlights:</span>
                  <p className="text-slate-600 leading-relaxed bg-emerald-50/60 p-3 border border-emerald-100 rounded-xl">
                    {viewingDetailActivity.keyOutcomes}
                  </p>
                </div>
              )}

              {viewingDetailActivity.studentParticipants && viewingDetailActivity.studentParticipants.length > 0 && (
                <div>
                  <span className="font-bold text-slate-800 block mb-1">Featured Student Participants:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingDetailActivity.studentParticipants.map((sp, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg border text-[11px]">
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setViewingDetailActivity(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        reportTitle="OFFICIAL DEPARTMENT ACTIVITIES & EVENTS REGISTER"
        metadata={reportMetadata}
        headers={exportHeaders}
        rows={exportRows}
      />

    </div>
  );
};
