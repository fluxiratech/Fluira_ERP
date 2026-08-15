import React, { useState, useMemo } from 'react';
import { AcademicCalendarEvent, AcademicEventType, AcademicEventCategory, Department, Role, User } from '../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  CalendarDays,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  GraduationCap,
  Megaphone,
  BookOpen,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { exportReportToPDF, exportReportToExcel, exportReportToCSV } from '../utils/reportExporter';
import { ExportReportModal } from './ExportReportModal';

interface AcademicCalendarViewProps {
  events: AcademicCalendarEvent[];
  departments: Department[];
  currentUser: User;
  onAddEvent: (event: Omit<AcademicCalendarEvent, 'id'>) => Promise<void>;
  onUpdateEvent: (id: string, event: Partial<AcademicCalendarEvent>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
}

export const AcademicCalendarView: React.FC<AcademicCalendarViewProps> = ({
  events,
  departments,
  currentUser,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'month' | 'list' | 'nonworking'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');

  // Month navigation state
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 1)); // Default August 2026

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicCalendarEvent | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    eventType: AcademicEventType;
    category: AcademicEventCategory;
    startDate: string;
    endDate: string;
    isNonWorkingDay: boolean;
    description: string;
    departmentId: string;
    affectedPrograms: string[];
  }>({
    title: '',
    eventType: 'Holiday',
    category: 'Festival',
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date().toISOString().substring(0, 10),
    isNonWorkingDay: true,
    description: '',
    departmentId: 'ALL',
    affectedPrograms: ['UG', 'PG'],
  });

  const canManage = currentUser.role === 'Admin' || currentUser.role === 'HOD';

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.createdBy && e.createdBy.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = selectedType === 'ALL' || e.eventType === selectedType;
      const matchesCat = selectedCategory === 'ALL' || e.category === selectedCategory;
      const matchesDept = selectedDeptId === 'ALL' || !e.departmentId || e.departmentId === 'ALL' || e.departmentId === selectedDeptId;

      return matchesSearch && matchesType && matchesCat && matchesDept;
    });
  }, [events, searchQuery, selectedType, selectedCategory, selectedDeptId]);

  // Calendar Stats
  const holidayCount = events.filter((e) => e.eventType === 'Holiday').length;
  const examWeekCount = events.filter((e) => e.eventType === 'Exam Week').length;
  const semesterEventCount = events.filter((e) => e.eventType === 'Semester Event').length;
  const nonWorkingDaysCount = events.filter((e) => e.isNonWorkingDay).length;

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar Grid Days Calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isSunday: boolean }[] = [];

    // Previous month padding days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, daysInPrevMonth - i);
      const dateStr = prevDate.toISOString().substring(0, 10);
      days.push({
        dateStr,
        dayNum: daysInPrevMonth - i,
        isCurrentMonth: false,
        isSunday: prevDate.getDay() === 0,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const currDate = new Date(year, month, d);
      // Format as YYYY-MM-DD
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isSunday: currDate.getDay() === 0,
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = nextDate.toISOString().substring(0, 10);
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
        isSunday: nextDate.getDay() === 0,
      });
    }

    return days;
  }, [year, month]);

  // Handle Event Create/Edit Modal
  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      eventType: 'Holiday',
      category: 'Festival',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date().toISOString().substring(0, 10),
      isNonWorkingDay: true,
      description: '',
      departmentId: 'ALL',
      affectedPrograms: ['UG', 'PG'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (evt: AcademicCalendarEvent) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      eventType: evt.eventType,
      category: evt.category,
      startDate: evt.startDate,
      endDate: evt.endDate,
      isNonWorkingDay: evt.isNonWorkingDay,
      description: evt.description || '',
      departmentId: evt.departmentId || 'ALL',
      affectedPrograms: evt.affectedPrograms || ['UG', 'PG'],
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const deptObj = departments.find((d) => d.id === formData.departmentId);
    const departmentName = formData.departmentId === 'ALL' ? 'All Departments' : deptObj?.name || 'Department';

    if (editingEvent) {
      await onUpdateEvent(editingEvent.id, {
        ...formData,
        departmentName,
      });
    } else {
      await onAddEvent({
        ...formData,
        departmentName,
        createdBy: currentUser.name,
        createdAt: new Date().toISOString().substring(0, 10),
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this academic calendar event?')) {
      await onDeleteEvent(id);
    }
  };

  // Badge Color Mapper
  const getTypeBadgeColor = (type: AcademicEventType, isNonWorking: boolean) => {
    switch (type) {
      case 'Holiday':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Exam Week':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Semester Event':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Non-Working Day':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  const exportHeaders = [
    'Event Title',
    'Event Type',
    'Category',
    'Start Date',
    'End Date',
    'Non-Working Day',
    'Department Scope',
    'Description',
    'Created By',
  ];

  const exportRows = filteredEvents.map((e) => [
    e.title,
    e.eventType,
    e.category,
    e.startDate,
    e.endDate,
    e.isNonWorkingDay ? 'YES (Attendance Locked)' : 'NO (Regular Classes)',
    e.departmentName || 'All Departments',
    e.description || '',
    e.createdBy || 'Admin',
  ]);

  const reportMetadata = {
    program: 'All Academic Programs (UG & PG)',
    course: 'Institutional Academic Calendar',
    academicYear: 'AY 2025-26 / 2026-27',
    semester: 'Annual Calendar',
    division: 'All Divisions',
    subject: 'Academic Schedule & Holidays',
    generatedBy: `${currentUser.name} (${currentUser.role})`,
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Academic Calendar & Event Schedule</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage holidays, exam weeks, and semester events. Non-working days automatically lock attendance marking.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Schedule</span>
          </button>

          {canManage && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Mark Holiday / Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Analytics Counter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Official Holidays</p>
            <p className="text-xl font-extrabold text-slate-900">{holidayCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Exam Schedules</p>
            <p className="text-xl font-extrabold text-slate-900">{examWeekCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Semester Events</p>
            <p className="text-xl font-extrabold text-slate-900">{semesterEventCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Non-Working Events</p>
            <p className="text-xl font-extrabold text-rose-600">{nonWorkingDaysCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Tab Navigation */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Subtab Toggle Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('month')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Month Grid View</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>List & Timeline ({filteredEvents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('nonworking')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'nonworking' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-rose-600" />
              <span>Attendance Locked Days</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event title, exam, or keyword..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs font-semibold">
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Event Type Filter</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl"
            >
              <option value="ALL">All Event Types</option>
              <option value="Holiday">Official Holidays</option>
              <option value="Exam Week">Exam Weeks</option>
              <option value="Semester Event">Semester Events & Fests</option>
              <option value="Non-Working Day">Non-Working Days</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Category Filter</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl"
            >
              <option value="ALL">All Categories</option>
              <option value="National">National Holidays</option>
              <option value="Festival">Festivals</option>
              <option value="Academic">Academic Schedule</option>
              <option value="Examination">Examinations</option>
              <option value="Co-curricular">Co-curricular / Cultural</option>
              <option value="Sports">Sports Meet</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Department Scope</label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl"
            >
              <option value="ALL">All Departments (Institutional)</option>
              <option value="Accounting & Finance">Accounting & Finance</option>
              <option value="Business Analytics">Business Analytics</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TAB 1: MONTH GRID VIEW */}
      {activeTab === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          
          {/* Month Navigation Bar */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-bold text-slate-900">
                {monthNames[month]} {year}
              </h2>
              <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-200">
                Academic Year 2026
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(2026, 7, 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
              >
                Today (Aug 2026)
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold text-slate-600 uppercase tracking-wider pb-1">
            <div className="text-rose-600">Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div className="text-slate-500">Sat</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((cell, idx) => {
              // Find events on this date
              const dateEvents = filteredEvents.filter((e) => cell.dateStr >= e.startDate && cell.dateStr <= e.endDate);
              const isNonWorkingCell = cell.isSunday || dateEvents.some((e) => e.isNonWorkingDay);

              return (
                <div
                  key={idx}
                  className={`min-h-[100px] p-2 rounded-xl border transition flex flex-col justify-between ${
                    cell.isCurrentMonth
                      ? isNonWorkingCell
                        ? 'bg-rose-50/40 border-rose-200'
                        : 'bg-slate-50/50 border-slate-200 hover:border-indigo-300'
                      : 'bg-slate-100/40 border-slate-200/50 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold ${
                        cell.isSunday
                          ? 'text-rose-600 font-black'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {cell.isSunday && cell.isCurrentMonth && (
                      <span className="text-[9px] font-bold text-rose-500 uppercase">Sunday</span>
                    )}
                  </div>

                  {/* Event Badges list */}
                  <div className="space-y-1 my-1 overflow-y-auto max-h-[70px] text-[10px]">
                    {dateEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => canManage && handleOpenEditModal(evt)}
                        title={`${evt.title} (${evt.eventType})${evt.isNonWorkingDay ? ' - Attendance Locked' : ''}`}
                        className={`p-1 rounded-md font-bold truncate border cursor-pointer transition hover:scale-[1.02] flex items-center space-x-1 ${getTypeBadgeColor(
                          evt.eventType,
                          evt.isNonWorkingDay
                        )}`}
                      >
                        {evt.isNonWorkingDay && <Lock className="w-2.5 h-2.5 text-rose-600 shrink-0" />}
                        <span className="truncate">{evt.title}</span>
                      </div>
                    ))}
                  </div>

                  {cell.isCurrentMonth && isNonWorkingCell && dateEvents.length === 0 && cell.isSunday && (
                    <div className="text-[9px] text-rose-500 font-semibold flex items-center space-x-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Non-Working</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: LIST & TIMELINE VIEW */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Academic Schedule List ({filteredEvents.length} Events)</h3>
            <span className="text-xs text-slate-500">Sorted chronologically</span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <CalendarDays className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-sm">No academic calendar events match your current filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black border ${getTypeBadgeColor(
                        evt.eventType,
                        evt.isNonWorkingDay
                      )}`}
                    >
                      {evt.isNonWorkingDay ? <Lock className="w-5 h-5 text-rose-600" /> : <CalendarIcon className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900 text-sm">{evt.title}</h4>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${getTypeBadgeColor(
                            evt.eventType,
                            evt.isNonWorkingDay
                          )}`}
                        >
                          {evt.eventType}
                        </span>
                        {evt.isNonWorkingDay && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-600 text-white rounded-md flex items-center space-x-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Attendance Locked</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 font-medium">{evt.description || 'No detailed description provided.'}</p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1 font-semibold">
                        <span className="flex items-center space-x-1 text-indigo-600">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {evt.startDate} {evt.startDate !== evt.endDate ? `to ${evt.endDate}` : ''}
                          </span>
                        </span>
                        <span>•</span>
                        <span>Category: {evt.category}</span>
                        <span>•</span>
                        <span>Scope: {evt.departmentName || 'All Departments'}</span>
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(evt)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                        title="Edit Event"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(evt.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: NON-WORKING DAYS / ATTENDANCE LOCKED DAYS SUMMARY */}
      {activeTab === 'nonworking' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b pb-3">
            <Lock className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Non-Working Days & Attendance Locking Registry
            </h3>
          </div>

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Automated Attendance Enforcement Rule:</p>
              <p>
                Any date listed below is marked as a non-working day or official holiday. The system automatically disables attendance marking in the <strong>Attendance Engine</strong> on these dates to preserve academic records and prevent accidental marking.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {events
              .filter((e) => e.isNonWorkingDay)
              .map((evt) => (
                <div key={evt.id} className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs">{evt.title}</h4>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-200 text-rose-800 rounded-md">
                        {evt.eventType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{evt.description}</p>
                    <p className="text-[10px] text-rose-700 font-extrabold mt-1">
                      Locked Period: {evt.startDate} {evt.startDate !== evt.endDate ? `to ${evt.endDate}` : ''}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingEvent ? 'Edit Academic Event' : 'Add New Academic Event / Holiday'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Event Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Independence Day, Mid-Term Exam, Ganesh Chaturthi"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Event Type</label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value as AcademicEventType })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="Holiday">Holiday</option>
                    <option value="Exam Week">Exam Week</option>
                    <option value="Semester Event">Semester Event</option>
                    <option value="Non-Working Day">Non-Working Day</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as AcademicEventCategory })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="Festival">Festival</option>
                    <option value="National">National Holiday</option>
                    <option value="Academic">Academic Schedule</option>
                    <option value="Examination">Examination</option>
                    <option value="Co-curricular">Co-curricular / Fest</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Checkbox: Is Non-Working Day */}
              <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="chkNonWorking"
                  checked={formData.isNonWorkingDay}
                  onChange={(e) => setFormData({ ...formData, isNonWorkingDay: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="chkNonWorking" className="text-xs font-bold text-rose-900 cursor-pointer">
                  Mark as Non-Working Day (Automatically blocks attendance marking & regular classes)
                </label>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department Scope</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold"
                >
                  <option value="ALL">All Departments (Institutional)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Event Details</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide details or instructions for faculty and students..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow"
                >
                  {editingEvent ? 'Update Event' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        reportTitle="Academic Calendar & Event Schedule Report"
        headers={exportHeaders}
        data={exportRows}
        metadata={reportMetadata}
      />
    </div>
  );
};
