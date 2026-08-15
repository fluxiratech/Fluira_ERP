import React from 'react';
import { Role, User } from '../types';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarDays,
  Building2,
  FileCheck2,
  Award,
  FileSpreadsheet,
  History,
  Settings,
  Bot,
  UserCog,
  TrendingUp,
  Bell,
  FileX2,
  Sparkles,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'students'
  | 'bulk-upload'
  | 'student-promotion'
  | 'faculty'
  | 'attendance'
  | 'academic-calendar'
  | 'timetable'
  | 'departments'
  | 'leaves'
  | 'results'
  | 'atkt-management'
  | 'reports'
  | 'notifications'
  | 'notices'
  | 'chat'
  | 'audit-logs'
  | 'settings'
  | 'ai-assistant'
  | 'defaulter-analytics';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: User;
  defaulterCount: number;
  pendingLeavesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  defaulterCount,
  pendingLeavesCount,
}) => {
  const allNavItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; roles: Role[] }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'HOD', 'Faculty', 'Class Teacher', 'Student'] },
    { id: 'students', label: currentUser.role === 'Student' ? 'Student 360° Profile' : 'Student Directory (360°)', icon: Users, roles: ['Admin', 'HOD', 'Faculty', 'Class Teacher', 'Student'] },
    { id: 'bulk-upload', label: 'Bulk Student CSV Upload', icon: FileSpreadsheet, roles: ['Admin', 'HOD'] },
    { id: 'student-promotion', label: 'Student Promotion Wizard', icon: TrendingUp, roles: ['Admin', 'HOD'] },
    { id: 'academic-calendar', label: 'Academic Calendar & Holidays', icon: CalendarDays, roles: ['Admin', 'HOD', 'Faculty', 'Class Teacher', 'Student'] },
    { id: 'timetable', label: currentUser.role === 'Student' ? 'Academic Timetable' : 'Timetable Management', icon: CalendarDays, roles: ['Admin', 'Faculty', 'Student'] },
    { id: 'attendance', label: currentUser.role === 'Class Teacher' ? 'Class Attendance' : 'Attendance Engine', icon: UserCheck, roles: ['Admin', 'HOD', 'Faculty', 'Class Teacher'] },
    { id: 'defaulter-analytics', label: 'Defaulter Analytics', icon: TrendingUp, roles: ['Admin', 'HOD', 'Faculty', 'Class Teacher'] },
    { id: 'reports', label: 'Reports & Analytics (PDF/Excel)', icon: FileSpreadsheet, roles: ['Admin', 'HOD', 'Faculty', 'Class Teacher'] },
    { id: 'notices', label: 'Notice & Announcement Board', icon: Bell, roles: ['Admin', 'HOD', 'Faculty', 'Class Teacher', 'Student'] },
    { id: 'notifications', label: 'Notification Hub', icon: Bell, badge: 2, roles: ['Admin', 'HOD', 'Faculty', 'Class Teacher', 'Student'] },
    { id: 'chat', label: 'In-App Direct Chat', icon: Bot, roles: ['Admin', 'HOD', 'Faculty', 'Class Teacher', 'Student'] },
    { id: 'faculty', label: 'Faculty Management', icon: UserCog, roles: ['Admin', 'HOD'] },
    { id: 'departments', label: currentUser.role === 'Student' ? 'Department Activities & Curriculum' : 'Department, Subjects & Activities', icon: Building2, roles: ['Admin', 'HOD', 'Faculty', 'Class Teacher', 'Student'] },
    { id: 'leaves', label: currentUser.role === 'Student' ? 'Leave Applications' : 'Leave Approvals', icon: FileCheck2, badge: currentUser.role === 'Student' ? undefined : (pendingLeavesCount > 0 ? pendingLeavesCount : undefined), roles: ['Admin', 'HOD', 'Faculty', 'Class Teacher', 'Student'] },
    { id: 'results', label: 'Results & CGPA', icon: Award, roles: ['Admin', 'HOD', 'Student'] },
    { id: 'atkt-management', label: 'Students ATKT / Backlog', icon: FileX2, roles: ['Admin', 'HOD', 'Faculty', 'Class Teacher', 'Student'] },
    { id: 'ai-assistant', label: 'AI Executive Suite', icon: Sparkles, roles: ['Admin', 'HOD', 'Faculty', 'Class Teacher'] },
    { id: 'audit-logs', label: 'Audit Logs', icon: History, roles: ['Admin'] },
    { id: 'settings', label: currentUser.role === 'Student' ? 'Settings' : 'ERP Settings', icon: Settings, roles: ['Admin', 'HOD', 'Student'] },
  ];

  const filteredNavItems = allNavItems.filter((item) => item.roles.includes(currentUser.role));

  return (
    <aside className="w-64 bg-slate-900 flex flex-col shrink-0 h-full border-r border-slate-800 text-slate-300">
      {/* Brand Header */}
      <div className="p-6 shrink-0">
        <div className="flex items-center gap-3 text-indigo-400 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/30">
            F
          </div>
          <span className="text-white font-extrabold tracking-wider">FLUXIRA ERP</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <div className="text-slate-500 text-[10px] uppercase font-semibold px-4 mb-2 tracking-widest">
          Main Menu
        </div>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-indigo-500 text-white'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Card at Bottom */}
      <div className="p-4 bg-slate-800/50 m-4 rounded-xl border border-slate-700/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-indigo-500 overflow-hidden shrink-0">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-white">{currentUser.name}</p>
            <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-tight">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

