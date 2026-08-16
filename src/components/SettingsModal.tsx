import React, { useState } from 'react';
import { CollegeSettings, User, Role } from '../types';
import { convertFileToJPGDataUrl } from '../utils/imageUtils';
import {
  Settings,
  Save,
  CheckCircle2,
  X,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Users,
  Key,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  Search,
  Edit2,
  Trash2,
  Building2,
  Lock,
  Phone,
  Mail,
  UserCheck,
  Database,
  Download,
  Upload,
  Send,
  Smartphone,
  MessageSquare,
  Server,
  RefreshCw,
  FileText,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CollegeSettings;
  onSaveSettings: (updated: CollegeSettings) => void;
  userRole?: string;
  currentUser?: User;
  onLogout?: () => void;
  usersList?: User[];
  onUpdateUser?: (user: User) => void;
  onAddUser?: (user: User) => void;
  onDeleteUser?: (id: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  userRole,
  currentUser,
  onLogout,
  usersList = [],
  onUpdateUser,
  onAddUser,
  onDeleteUser,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'settings' | 'users'>('settings');
  const [sysSubTab, setSysSubTab] = useState<'general' | 'backup' | 'email' | 'whatsapp' | 'sms'>('general');
  const [form, setForm] = useState<CollegeSettings>({
    smtpHost: 'smtp.office365.com',
    smtpPort: 587,
    smtpSenderEmail: 'noreply@cktcollege.edu.in',
    smtpSenderName: "CKT College Autonomous ERP",
    smtpEnableTls: true,
    whatsappPhoneNumberId: '102938475612345',
    whatsappWabaId: 'WABA-9823-4567',
    whatsappWebhookStatus: 'Connected',
    smsGatewayProvider: 'DLT Portal',
    smsSenderId: 'CKTCOL',
    smsDltEntityId: '11012345600000',
    backupSchedule: 'Daily',
    ...settings,
  });
  const [newHoliday, setNewHoliday] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  // System Admin Test Status States
  const [testEmailInput, setTestEmailInput] = useState('admin@cktcollege.edu.in');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');

  const [testPhoneWhatsApp, setTestPhoneWhatsApp] = useState('+91 98200 44556');
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [whatsAppMsg, setWhatsAppMsg] = useState('');

  const [testPhoneSms, setTestPhoneSms] = useState('+91 98200 44556');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsMsg, setSmsMsg] = useState('');

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // User Edit Form State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editRole, setEditRole] = useState<Role>('Faculty');
  const [editDeptName, setEditDeptName] = useState('Department of Accounting & Finance');
  const [editPhone, setEditPhone] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const holidaysList = form.holidaysList || [
    '2026-08-15: Independence Day',
    '2026-09-02: Ganesh Chaturthi',
    '2026-10-02: Gandhi Jayanti',
    '2026-11-01: Diwali Festival',
  ];

  const handleTestEmail = async () => {
    setIsSendingEmail(true);
    setEmailMsg('');
    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmailInput }),
      });
      const data = await res.json();
      setEmailMsg(data.message || 'Test email sent!');
    } catch (err: any) {
      setEmailMsg('Failed to send test email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleTestWhatsApp = async () => {
    setIsSendingWhatsApp(true);
    setWhatsAppMsg('');
    try {
      const res = await fetch('/api/admin/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhoneWhatsApp }),
      });
      const data = await res.json();
      setWhatsAppMsg(data.message || 'Test WhatsApp sent!');
    } catch (err: any) {
      setWhatsAppMsg('Failed to send test WhatsApp.');
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleTestSms = async () => {
    setIsSendingSms(true);
    setSmsMsg('');
    try {
      const res = await fetch('/api/admin/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhoneSms }),
      });
      const data = await res.json();
      setSmsMsg(data.message || 'Test SMS sent!');
    } catch (err: any) {
      setSmsMsg('Failed to send test SMS.');
    } finally {
      setIsSendingSms(false);
    }
  };

  const handleExportBackup = () => {
    window.open('/api/admin/backup/export', '_blank');
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Are you sure you want to restore ERP database state from this backup file? Existing data will be updated.')) {
      return;
    }

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });
      const data = await res.json();
      if (data.success) {
        alert('ERP System database restored successfully! The application will refresh.');
        window.location.reload();
      } else {
        alert(data.error || 'Database restore failed.');
      }
    } catch (err: any) {
      alert('Invalid backup JSON file: ' + err.message);
    }
  };


  const canManageAllUsers = userRole === 'Admin' || userRole === 'HOD';
  const isStudent = userRole === 'Student' || currentUser?.role === 'Student';

  React.useEffect(() => {
    if (isOpen && currentUser) {
      setEditName(currentUser.name || '');
      setEditEmail(currentUser.email || '');
      setEditPassword(currentUser.password || 'StudentPassword@123');
      setEditAvatar(currentUser.avatar || '');
      setEditPhone(currentUser.phone || '');
    }
  }, [isOpen, currentUser]);

  const handleSaveStudentSelf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      name: editName.trim() || currentUser.name,
      email: editEmail.trim() || currentUser.email,
      password: editPassword,
      avatar: editAvatar || currentUser.avatar,
      phone: editPhone,
    };
    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1200);
  };

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
  ];

  const handleAddHoliday = () => {
    if (!newHoliday.trim()) return;
    const updatedHolidays = [...holidaysList, newHoliday.trim()];
    setForm({ ...form, holidaysList: updatedHolidays });
    setNewHoliday('');
  };

  const handleRemoveHoliday = (index: number) => {
    const updatedHolidays = holidaysList.filter((_, i) => i !== index);
    setForm({ ...form, holidaysList: updatedHolidays });
  };

  const handleSubmitSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({ ...form, holidaysList });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1500);
  };

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setEditName('');
    setEditEmail('');
    setEditPassword('Default@123');
    setEditAvatar(avatarPresets[0]);
    // Admin defaults to adding HOD, HOD defaults to adding Faculty
    setEditRole(userRole === 'Admin' ? 'HOD' : 'Faculty');
    setEditDeptName('Department of Accounting & Finance');
    setEditPhone('+91 98200 12345');
    setEditIsActive(true);
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPassword(u.password || 'User@123');
    setEditAvatar(u.avatar || avatarPresets[0]);
    setEditRole(u.role);
    setEditDeptName(u.departmentName || 'Department of Accounting & Finance');
    setEditPhone(u.phone || '');
    setEditIsActive(u.isActive);
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      alert('Please enter a valid Name and Email address.');
      return;
    }

    if (editingUser) {
      const updated: User = {
        ...editingUser,
        name: editName.trim(),
        email: editEmail.trim(),
        password: editPassword,
        avatar: editAvatar,
        role: editRole,
        departmentName: editDeptName,
        phone: editPhone,
        isActive: editIsActive,
      };
      if (onUpdateUser) onUpdateUser(updated);
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: editName.trim(),
        email: editEmail.trim(),
        password: editPassword,
        avatar: editAvatar,
        role: editRole,
        departmentName: editDeptName,
        departmentId: 'dept-af',
        phone: editPhone,
        isActive: editIsActive,
        createdAt: new Date().toISOString().split('T')[0],
      };
      if (onAddUser) onAddUser(newUser);
    }

    setShowUserModal(false);
    alert('User account details updated successfully!');
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.departmentName && u.departmentName.toLowerCase().includes(userSearch.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const toggleShowPassword = (userId: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              {isStudent ? <UserIcon className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isStudent ? 'My Profile & Credentials' : 'ERP Settings & User Management'}
              </h3>
              <p className="text-xs text-slate-500">
                {isStudent
                  ? 'Manage your personal profile details, upload your passport photo (.jpg), or switch account.'
                  : 'Configure institution rules or edit User Credentials (Name, Email, Password, Pic).'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isStudent ? (
              <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow flex items-center space-x-1.5">
                <UserIcon className="w-3.5 h-3.5" />
                <span>My Profile Details</span>
              </span>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    activeTab === 'settings' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>System Settings</span>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    activeTab === 'users' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>User Credentials ({usersList.length})</span>
                </button>
              </>
            )}
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {savedNotice && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {isStudent ? (
          <form onSubmit={handleSaveStudentSelf} className="space-y-5 text-xs">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4 flex items-center space-x-4">
              <div className="shrink-0">
                {editAvatar ? (
                  <img
                    src={editAvatar}
                    alt={editName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-indigo-300 flex items-center justify-center text-slate-400">
                    <UserIcon className="w-8 h-8 text-indigo-600" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{currentUser?.name || 'Student Account'}</h4>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold">Student</span>
                  <span>•</span>
                  <span>{currentUser?.departmentName || 'Department of Accounting & Finance'}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  As a Student, you are authorized to edit your personal profile details and upload your passport photo (.jpg format). System settings and other user accounts are restricted.
                </p>
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-800">Student Profile Photo (.jpg format only)</label>
              <div className="flex items-center space-x-3">
                <label className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition inline-flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
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
                          setEditAvatar(jpgDataUrl);
                        } catch (err) {
                          alert('Please upload a valid .jpg file.');
                        }
                      }
                    }}
                  />
                </label>
                <span className="text-[11px] text-slate-500 font-medium">Upload a valid .jpg/.jpeg image file from your computer or camera.</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Password</label>
                <div className="relative">
                  <input
                    type={showPasswordMap['self'] ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-3.5 py-2 pr-10 bg-white border border-slate-300 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword('self')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswordMap['self'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onLogout) onLogout();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center space-x-2 shadow-sm transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout / Switch User</span>
              </button>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save My Details</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <>
            {/* TAB 1: SYSTEM SETTINGS */}
            {activeTab === 'settings' && (
          <form onSubmit={handleSubmitSettings} className="space-y-4 text-xs">
            {/* System Sub-Navigation Pills */}
            <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSysSubTab('general')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 whitespace-nowrap transition ${
                  sysSubTab === 'general' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>General Rules</span>
              </button>
              <button
                type="button"
                onClick={() => setSysSubTab('backup')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 whitespace-nowrap transition ${
                  sysSubTab === 'backup' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Backup & Restore</span>
              </button>
              <button
                type="button"
                onClick={() => setSysSubTab('email')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 whitespace-nowrap transition ${
                  sysSubTab === 'email' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Settings</span>
              </button>
              <button
                type="button"
                onClick={() => setSysSubTab('whatsapp')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 whitespace-nowrap transition ${
                  sysSubTab === 'whatsapp' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp API</span>
              </button>
              <button
                type="button"
                onClick={() => setSysSubTab('sms')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 whitespace-nowrap transition ${
                  sysSubTab === 'sms' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>SMS Gateway</span>
              </button>
            </div>

            {/* SUB-SECTION 1: GENERAL RULES */}
            {sysSubTab === 'general' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">College Institution Name</label>
                    <input
                      type="text"
                      value={form.collegeName}
                      onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
                    <input
                      type="text"
                      value={form.academicYear}
                      onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Minimum Mandatory Attendance (%)</label>
                    <input
                      type="number"
                      value={form.minimumAttendancePct || form.minAttendancePercent || 75}
                      onChange={(e) => setForm({ ...form, minimumAttendancePct: Number(e.target.value), minAttendancePercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Warning Threshold (%)</label>
                    <input
                      type="number"
                      value={form.warningThresholdPct || form.warningThresholdPercent || 80}
                      onChange={(e) => setForm({ ...form, warningThresholdPct: Number(e.target.value), warningThresholdPercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Critical Defaulter Level (%)</label>
                    <input
                      type="number"
                      value={form.criticalThresholdPct || form.criticalThresholdPercent || 65}
                      onChange={(e) => setForm({ ...form, criticalThresholdPct: Number(e.target.value), criticalThresholdPercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block font-bold text-slate-700 mb-1.5">Official College Holidays List</label>
                  <div className="space-y-2 mb-3 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {holidaysList.map((h, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-slate-200">
                        <span className="font-mono text-slate-700">{h}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHoliday(idx)}
                          className="text-rose-500 hover:text-rose-700 font-bold text-[11px]"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 2026-12-25: Christmas Day"
                      value={newHoliday}
                      onChange={(e) => setNewHoliday(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddHoliday}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl"
                    >
                      Add Holiday
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-SECTION 2: BACKUP & RESTORE */}
            {sysSubTab === 'backup' && (
              <div className="space-y-4">
                <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 flex items-start space-x-3">
                  <Database className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-indigo-950 text-xs">Database Backup & Disaster Recovery Point</h4>
                    <p className="text-[11px] text-indigo-800 leading-relaxed mt-0.5">
                      Generate timestamped JSON database snapshots of all college records (students, faculty, attendance, leaves, timetable, ATKT records, results).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
                    <div className="flex items-center space-x-2 text-slate-900 font-bold">
                      <Download className="w-4 h-4 text-emerald-600" />
                      <span>Export System Data Snapshot</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Download instant full JSON backup dump of all live tables.
                    </p>
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download JSON Backup Dump</span>
                    </button>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
                    <div className="flex items-center space-x-2 text-slate-900 font-bold">
                      <Upload className="w-4 h-4 text-indigo-600" />
                      <span>Restore System State</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Upload a previously exported JSON backup file to restore system state.
                    </p>
                    <label className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition shadow-sm">
                      <Upload className="w-4 h-4" />
                      <span>Upload & Restore Backup JSON</span>
                      <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <label className="block font-bold text-slate-800">Auto Backup Schedule</label>
                  <select
                    value={form.backupSchedule || 'Daily'}
                    onChange={(e: any) => setForm({ ...form, backupSchedule: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Disabled">Disabled (Manual Only)</option>
                    <option value="Daily">Daily at Midnight (00:00 IST)</option>
                    <option value="Weekly">Weekly (Every Sunday 02:00 IST)</option>
                    <option value="Monthly">Monthly (1st of every month)</option>
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Automated snapshots are saved to secure encrypted server storage and emailed to institutional admins.
                  </p>
                </div>
              </div>
            )}

            {/* SUB-SECTION 3: EMAIL SETTINGS */}
            {sysSubTab === 'email' && (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span>SMTP Gateway Configuration (Office365 / Gmail / Custom SMTP)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">SMTP Host Server</label>
                      <input
                        type="text"
                        value={form.smtpHost || ''}
                        onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
                        placeholder="e.g. smtp.office365.com"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">SMTP Port</label>
                      <input
                        type="number"
                        value={form.smtpPort || 587}
                        onChange={(e) => setForm({ ...form, smtpPort: Number(e.target.value) })}
                        placeholder="587"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Sender Email Address</label>
                      <input
                        type="email"
                        value={form.smtpSenderEmail || ''}
                        onChange={(e) => setForm({ ...form, smtpSenderEmail: e.target.value })}
                        placeholder="noreply@cktcollege.edu.in"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Sender Display Name</label>
                      <input
                        type="text"
                        value={form.smtpSenderName || ''}
                        onChange={(e) => setForm({ ...form, smtpSenderName: e.target.value })}
                        placeholder="CKT Autonomous ERP"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="tlsCheck"
                      checked={form.smtpEnableTls ?? true}
                      onChange={(e) => setForm({ ...form, smtpEnableTls: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="tlsCheck" className="text-xs text-slate-700 font-semibold cursor-pointer">
                      Enable TLS / SSL Secure Handshake Encryption
                    </label>
                  </div>
                </div>

                {/* Test Email Trigger */}
                <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-2">
                  <label className="block font-bold text-indigo-950">Send Test Email</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={testEmailInput}
                      onChange={(e) => setTestEmailInput(e.target.value)}
                      placeholder="Enter recipient email"
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleTestEmail}
                      disabled={isSendingEmail}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isSendingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Send Test Email</span>
                    </button>
                  </div>
                  {emailMsg && (
                    <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      {emailMsg}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-SECTION 4: WHATSAPP API SETTINGS */}
            {sysSubTab === 'whatsapp' && (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>Meta WhatsApp Business Cloud API Settings</span>
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Status: {form.whatsappWebhookStatus || 'Connected'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Phone Number ID</label>
                      <input
                        type="text"
                        value={form.whatsappPhoneNumberId || ''}
                        onChange={(e) => setForm({ ...form, whatsappPhoneNumberId: e.target.value })}
                        placeholder="102938475612345"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">WhatsApp Business Account (WABA) ID</label>
                      <input
                        type="text"
                        value={form.whatsappWabaId || ''}
                        onChange={(e) => setForm({ ...form, whatsappWabaId: e.target.value })}
                        placeholder="WABA-9823-4567"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Permanent Meta Access Token</label>
                    <input
                      type="password"
                      value={form.whatsappApiToken || 'EAAG92837498234892374829374'}
                      onChange={(e) => setForm({ ...form, whatsappApiToken: e.target.value })}
                      placeholder="EAAG..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-800 text-xs"
                    />
                  </div>
                </div>

                {/* Test WhatsApp Trigger */}
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
                  <label className="block font-bold text-emerald-950">Send Test WhatsApp Alert</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testPhoneWhatsApp}
                      onChange={(e) => setTestPhoneWhatsApp(e.target.value)}
                      placeholder="+91 98200 00000"
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleTestWhatsApp}
                      disabled={isSendingWhatsApp}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isSendingWhatsApp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Send WhatsApp Test</span>
                    </button>
                  </div>
                  {whatsAppMsg && (
                    <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 p-2 rounded-lg border border-emerald-300">
                      {whatsAppMsg}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-SECTION 5: SMS GATEWAY */}
            {sysSubTab === 'sms' && (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    <span>SMS Gateway & DLT Portal Configuration</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">SMS Vendor Provider</label>
                      <select
                        value={form.smsGatewayProvider || 'DLT Portal'}
                        onChange={(e: any) => setForm({ ...form, smsGatewayProvider: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                      >
                        <option value="DLT Portal">Government DLT Portal</option>
                        <option value="MSG91">MSG91 India</option>
                        <option value="Twilio">Twilio SMS</option>
                        <option value="Fast2SMS">Fast2SMS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Sender ID (Header)</label>
                      <input
                        type="text"
                        value={form.smsSenderId || 'CKTCOL'}
                        onChange={(e) => setForm({ ...form, smsSenderId: e.target.value })}
                        placeholder="e.g. CKTCOL"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 uppercase"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">DLT Entity ID</label>
                      <input
                        type="text"
                        value={form.smsDltEntityId || ''}
                        onChange={(e) => setForm({ ...form, smsDltEntityId: e.target.value })}
                        placeholder="11012345600000"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">API Secret Key / Auth Token</label>
                      <input
                        type="password"
                        value={form.smsApiKey || 'sms_api_key_sample_98234'}
                        onChange={(e) => setForm({ ...form, smsApiKey: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-800 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Test SMS Trigger */}
                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-2">
                  <label className="block font-bold text-purple-950">Send Test SMS Message</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testPhoneSms}
                      onChange={(e) => setTestPhoneSms(e.target.value)}
                      placeholder="+91 98200 00000"
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleTestSms}
                      disabled={isSendingSms}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isSendingSms ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Send Test SMS</span>
                    </button>
                  </div>
                  {smsMsg && (
                    <div className="text-[11px] font-semibold text-purple-900 bg-purple-100 p-2 rounded-lg border border-purple-200">
                      {smsMsg}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onLogout) onLogout();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center space-x-2 shadow-sm transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout / Switch User</span>
              </button>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: USER MANAGEMENT & CREDENTIALS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user by Name, Email, PRN, or Department..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-slate-200/70 p-1 rounded-xl text-[11px] font-bold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setRoleFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg transition ${roleFilter === 'ALL' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:text-slate-900'}`}
                  >
                    All Users ({usersList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter('Faculty')}
                    className={`px-2.5 py-1 rounded-lg transition ${roleFilter === 'Faculty' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:text-slate-900'}`}
                  >
                    Faculty ({usersList.filter(u => u.role === 'Faculty').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter('Student')}
                    className={`px-2.5 py-1 rounded-lg transition ${roleFilter === 'Student' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:text-slate-900'}`}
                  >
                    Students ({usersList.filter(u => u.role === 'Student').length})
                  </button>
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="ALL">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="HOD">HOD</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Class Teacher">Class Teacher</option>
                  <option value="Student">Student</option>
                </select>

                {canManageAllUsers && (
                  <button
                    onClick={handleOpenAddUser}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add User</span>
                  </button>
                )}
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-[50vh]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Profile Pic & Name</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Password (P.W)</th>
                    <th className="px-4 py-3">Role & Dept</th>
                    <th className="px-4 py-3">Mobile Phone</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredUsers.map((u) => {
                    const isVisible = !!showPasswordMap[u.id];
                    const maskedPw = u.password ? (isVisible ? u.password : '••••••••') : '••••••••';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={u.avatar || avatarPresets[0]}
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-300 shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = avatarPresets[0];
                              }}
                            />
                            <div>
                              <div className="font-bold text-slate-900">{u.name}</div>
                              <span className="text-[10px] text-slate-500 font-mono">{u.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 font-mono text-indigo-600 font-semibold">{u.email}</td>

                        <td className="px-4 py-3">
                          <div className="inline-flex items-center space-x-2 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-mono text-[11px]">
                            <span>{maskedPw}</span>
                            <button
                              type="button"
                              onClick={() => toggleShowPassword(u.id)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === 'Admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'HOD'
                                ? 'bg-amber-100 text-amber-800'
                                : u.role === 'Faculty'
                                ? 'bg-blue-100 text-blue-800'
                                : u.role === 'Class Teacher'
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.role === 'Student'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {u.role}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5">{u.departmentName || 'General'}</div>
                        </td>

                        <td className="px-4 py-3 text-slate-600">{u.phone || 'N/A'}</td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit User Details (Name, Email, PW, Pic)"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {canManageAllUsers && onDeleteUser && u.id !== currentUser?.id && (
                              <button
                                onClick={() => {
                                  if (confirm(`Delete account for ${u.name}?`)) onDeleteUser(u.id);
                                }}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    )}

      </div>

      {/* EDIT / ADD USER MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingUser ? `Edit Account: ${editingUser.name}` : 'Create New System User'}
                </h3>
              </div>
              <button onClick={() => setShowUserModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              {/* Profile Pic Selector (.jpg upload only) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Profile Photo (.jpg format only)</label>
                <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="shrink-0">
                    {editAvatar ? (
                      <img
                        src={editAvatar}
                        alt="Profile Preview"
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500 shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-400">
                        <UserIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] text-slate-500 font-medium">Select a .jpg image from your device for Admin, HOD, Faculty, or Student accounts.</p>
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
                              setEditAvatar(jpgDataUrl);
                            } catch (err) {
                              alert('Failed to process image. Please upload a valid .jpg file.');
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Dr. Sunita Kulkarni"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="e.g. sunita@cktcollege.edu.in"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Password & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password (P.W)</label>
                  <input
                    type="text"
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-indigo-700 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 98200 44556"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">User Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {userRole === 'Admin' ? (
                      <>
                        <option value="HOD">HOD (Head of Department)</option>
                        <option value="Faculty">Faculty Member</option>
                        <option value="Class Teacher">Class Teacher</option>
                        <option value="Student">Student</option>
                        <option value="Admin">Admin (System Administrator)</option>
                      </>
                    ) : (
                      <>
                        <option value="Faculty">Faculty Member</option>
                        <option value="Class Teacher">Class Teacher</option>
                        <option value="Student">Student</option>
                      </>
                    )}
                  </select>
                  {userRole === 'Admin' ? (
                    <span className="text-[10px] text-indigo-600 font-semibold mt-1 block">
                      ★ Admin Privilege: You can create HOD, Faculty, Class Teacher, and Student accounts.
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
                      ★ HOD Privilege: You can create Faculty, Class Teacher, and Student accounts.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editDeptName}
                    onChange={(e) => setEditDeptName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Account Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
