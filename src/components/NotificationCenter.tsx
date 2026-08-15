import React, { useState } from 'react';
import { ERPNotification, Role } from '../types';
import {
  Bell,
  CheckCheck,
  Filter,
  MessageSquare,
  Mail,
  AlertCircle,
  Calendar,
  FileText,
  Trash2,
  Send,
  KeyRound,
  Server,
  BookOpen,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface NotificationCenterProps {
  notifications: ERPNotification[];
  userRole: Role;
  onMarkAllRead: () => void;
  onClearNotifications: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  userRole,
  onMarkAllRead,
  onClearNotifications,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  // SMTP Dispatch & Password Reset Form State
  const [emailTab, setEmailTab] = useState<'dispatch' | 'reset' | 'guide'>('dispatch');
  const [recipient, setRecipient] = useState('student@cktcollege.edu.in');
  const [subject, setSubject] = useState('Official Notice from CKT College ERP');
  const [templateType, setTemplateType] = useState('Attendance Defaulter Warning');
  const [emailBody, setEmailBody] = useState('Dear Student,\n\nThis is an official communication regarding your attendance and academic standing at Changu Kana Thakur College.\n\nRegards,\nCollege Administration');
  const [isSending, setIsSending] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setDispatchStatus(null);
    try {
      const res = await fetch('/api/admin/send-official-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, subject, body: emailBody, templateType })
      });
      const data = await res.json();
      if (data.success) {
        setDispatchStatus({ success: true, message: data.message });
      } else {
        setDispatchStatus({ success: false, message: data.error || 'Failed to dispatch email.' });
      }
    } catch (err: any) {
      setDispatchStatus({ success: false, message: 'Network error while dispatching email.' });
    } finally {
      setIsSending(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);
    if (!resetEmail) {
      setResetStatus({ success: false, message: 'Please enter a registered email address.' });
      return;
    }
    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (data.success) {
        setResetStatus({ success: true, message: data.message });
      } else {
        setResetStatus({ success: false, message: data.error || 'User not found.' });
      }
    } catch (err: any) {
      setResetStatus({ success: false, message: 'Failed to request password reset.' });
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold">Centralized ERP Notification Hub & SMTP Gateway</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Real-time status updates, password resets, and official institutional email dispatch via backend SMTP relays.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onMarkAllRead}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>

          <button
            onClick={onClearNotifications}
            className="px-4 py-2 bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/30 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* SMTP Email Dispatch & Password Reset Control Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">SMTP Relay & Email Dispatch Console</h3>
          </div>
          
          <div className="flex items-center space-x-2 bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setEmailTab('dispatch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                emailTab === 'dispatch' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Official Email
            </button>
            <button
              onClick={() => setEmailTab('reset')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                emailTab === 'reset' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Password Reset
            </button>
            <button
              onClick={() => setEmailTab('guide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                emailTab === 'guide' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SMTP Guide
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Note explaining why browser-only direct SMTP fails */}
          <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
            <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">Why couldn't you send emails directly from the browser?</span>
              Web browsers block direct TCP connections to SMTP ports (e.g., 587 or 465) due to CORS and security policies. All email transmissions in this app are safely proxied through our secure Node.js backend server (`server.ts`) which connects to your configured SMTP relay (SendGrid, Nodemailer, Office365, or AWS SES).
            </div>
          </div>

          {emailTab === 'dispatch' && (
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Email Address</label>
                  <input
                    type="email"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    placeholder="student@cktcollege.edu.in"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Communication Template / Type</label>
                  <select
                    value={templateType}
                    onChange={(e) => {
                      setTemplateType(e.target.value);
                      if (e.target.value.includes('Attendance')) {
                        setSubject('Attendance Defaulter Warning - CKT College');
                      } else if (e.target.value.includes('Exam')) {
                        setSubject('Semester Examination Schedule Notice');
                      } else {
                        setSubject('Official Notice from CKT College Administration');
                      }
                    }}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                  >
                    <option value="Attendance Defaulter Warning">Attendance Defaulter Warning</option>
                    <option value="Exam Schedule Notice">Exam Schedule Notice</option>
                    <option value="Fee Due Reminder">Fee Due Reminder</option>
                    <option value="General Administration Notice">General Administration Notice</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Body Content</label>
                <textarea
                  rows={4}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Dispatching via SMTP...' : 'Send Official Email'}</span>
                </button>

                {dispatchStatus && (
                  <div className={`text-xs font-bold flex items-center space-x-1.5 ${dispatchStatus.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {dispatchStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{dispatchStatus.message}</span>
                  </div>
                )}
              </div>
            </form>
          )}

          {emailTab === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Registered User Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="admin@cktcollege.edu.in or student email"
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Send Reset Link</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Triggers an automated password reset secure token email sent to the user's inbox via the configured SMTP server.
                </p>
              </div>

              {resetStatus && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${resetStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                  {resetStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                  <span>{resetStatus.message}</span>
                </div>
              )}
            </form>
          )}

          {emailTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Configuring Real Mail Relay Providers (SendGrid & Nodemailer)</span>
                </h4>
                <p>
                  To enable live production email delivery in your deployment, configure your environment variables in <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[11px]">.env.example</code> and connect your Node.js backend (`server.ts`) to an SMTP relay service:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="font-bold text-indigo-600 block text-xs">Option A: SendGrid Mail API / SMTP</span>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[10px] font-mono overflow-x-auto">
{`SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key`}
                  </pre>
                  <p className="text-[11px] text-slate-500">
                    Industry standard transactional mail relay with high inbox deliverability.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="font-bold text-indigo-600 block text-xs">Option B: Nodemailer with Gmail SMTP / Office 365</span>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[10px] font-mono overflow-x-auto">
{`import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});`}
                  </pre>
                  <p className="text-[11px] text-slate-500">
                    Perfect for institutional Microsoft 365 or Google Workspace relays.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
        {['ALL', 'ATTENDANCE_ALERT', 'LEAVE_STATUS', 'NOTICE_ALERT', 'EXAM_ASSIGNMENT', 'EVENT'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterType === t
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition shadow-sm space-y-2 ${
                !n.isRead ? 'bg-indigo-50/40 border-indigo-200' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      n.type === 'ATTENDANCE_ALERT'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : n.type === 'LEAVE_STATUS'
                        ? 'bg-sky-100 text-sky-800 border border-sky-200'
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    }`}
                  >
                    {n.type.replace(/_/g, ' ')}
                  </span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  )}
                </div>

                <span className="text-[11px] text-slate-400 font-medium">{n.createdAt}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

              <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <div className="flex items-center space-x-3">
                  <span>Delivered via:</span>
                  <span className="text-indigo-600 font-bold flex items-center space-x-0.5">
                    <Bell className="w-3 h-3" /> <span>In-App</span>
                  </span>
                  <span className="text-emerald-600 font-bold flex items-center space-x-0.5">
                    <MessageSquare className="w-3 h-3" /> <span>WhatsApp Sent</span>
                  </span>
                  <span className="text-sky-600 font-bold flex items-center space-x-0.5">
                    <Mail className="w-3 h-3" /> <span>Email Dispatched</span>
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 font-medium text-xs">
            No notifications found matching selected filter.
          </div>
        )}
      </div>

    </div>
  );
};
