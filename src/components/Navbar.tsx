import React from 'react';
import { User, Role } from '../types';
import {
  Bell,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onRoleChange?: (role: Role) => void;
  allUsers?: User[];
  onOpenAIAssistant?: () => void;
  onOpenSettings: () => void;
  unreadNotifCount: number;
  onOpenNotifs: () => void;
  onLogout?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenSettings,
  unreadNotifCount,
  onOpenNotifs,
  onLogout,
  isSidebarCollapsed = false,
  onToggleSidebar,
}) => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-30">
      {/* Title & Toggle */}
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
            title={isSidebarCollapsed ? 'Expand Side Menu' : 'Collapse Side Menu'}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        )}
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Dashboard</h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          onClick={onOpenNotifs}
          className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
          title="ERP System Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Log Out Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition shadow-sm"
            title="Log out of ERP Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
};

