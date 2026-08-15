import React, { useState } from 'react';
import { NoticeItem, Role } from '../types';
import {
  Bell,
  Pin,
  Archive,
  Plus,
  Send,
  Paperclip,
  CheckCircle2,
  Search,
  Filter,
  Megaphone,
  UserCheck,
  FileText,
  MessageSquare,
  Mail,
  Trash2,
} from 'lucide-react';

interface NoticeBoardProps {
  notices: NoticeItem[];
  userRole: Role;
  userName: string;
  onPublishNotice: (notice: NoticeItem) => void;
  onDeleteNotice: (id: string) => void;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({
  notices,
  userRole,
  userName,
  onPublishNotice,
  onDeleteNotice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Notice form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoticeItem['category']>('General');
  const [isPinned, setIsPinned] = useState(false);
  const [targetProgram, setTargetProgram] = useState<string>('ALL');
  const [targetCourse, setTargetCourse] = useState<string>('ALL');
  const [sendInApp, setSendInApp] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendWhatsapp, setSendWhatsapp] = useState(true);
  const [attachmentName, setAttachmentName] = useState('');

  const canPublish = ['Admin', 'HOD', 'Faculty', 'Class Teacher'].includes(userRole);

  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || n.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert('Please fill in both title and content for the notice.');
      return;
    }

    const newNotice: NoticeItem = {
      id: `notice-${Date.now()}`,
      title,
      content,
      category,
      publishedBy: userName,
      publishedRole: userRole,
      createdAt: new Date().toLocaleString(),
      isPinned,
      isArchived: false,
      targetProgram: targetProgram === 'ALL' ? undefined : (targetProgram as any),
      targetCourse: targetCourse === 'ALL' ? undefined : targetCourse,
      attachmentName: attachmentName || undefined,
      sentChannels: {
        inApp: sendInApp,
        email: sendEmail,
        whatsapp: sendWhatsapp,
      },
    };

    onPublishNotice(newNotice);
    alert('Notice published and sent across selected notification channels!');
    setShowCreateModal(false);
    setTitle('');
    setContent('');
    setAttachmentName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Module Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Megaphone className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold">Notice & Announcement Board</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Publish official college notices, exam schedules, seminar invitations, and placement alerts with multi-channel broadcasting (WhatsApp, Email, In-App).
          </p>
        </div>

        {canPublish && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Notice</span>
          </button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search notices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['ALL', 'General', 'Exam', 'Event', 'Placement', 'Academic', 'Attendance'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notice Cards Feed */}
      <div className="space-y-4">
        {filteredNotices.map((n) => (
          <div
            key={n.id}
            className={`bg-white p-6 rounded-2xl border shadow-sm transition space-y-3 relative ${
              n.isPinned ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                {n.isPinned && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold flex items-center space-x-1">
                    <Pin className="w-3 h-3 fill-indigo-600" />
                    <span>PINNED</span>
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                  {n.category}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{n.createdAt}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>
                  Published by <strong className="text-slate-800">{n.publishedBy}</strong> ({n.publishedRole})
                </span>
                {canPublish && (
                  <button
                    onClick={() => onDeleteNotice(n.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900">{n.title}</h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{n.content}</p>

            {n.attachmentName && (
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-indigo-600">
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attachment: {n.attachmentName}</span>
              </div>
            )}

            {/* Delivery Channels Badge */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <div className="flex items-center space-x-3">
                <span>Broadcast via:</span>
                {n.sentChannels.inApp && (
                  <span className="text-indigo-600 font-bold flex items-center space-x-0.5">
                    <Bell className="w-3 h-3" /> <span>In-App</span>
                  </span>
                )}
                {n.sentChannels.email && (
                  <span className="text-sky-600 font-bold flex items-center space-x-0.5">
                    <Mail className="w-3 h-3" /> <span>Email</span>
                  </span>
                )}
                {n.sentChannels.whatsapp && (
                  <span className="text-emerald-600 font-bold flex items-center space-x-0.5">
                    <MessageSquare className="w-3 h-3" /> <span>WhatsApp</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Notice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Publish New Notice / Announcement</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Mid-Semester Examination Schedule - August 2026"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-semibold"
                  >
                    <option value="General">General</option>
                    <option value="Exam">Exam</option>
                    <option value="Event">Event</option>
                    <option value="Placement">Placement</option>
                    <option value="Academic">Academic</option>
                    <option value="Attendance">Attendance Alert</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pin Notice to Top</label>
                  <button
                    type="button"
                    onClick={() => setIsPinned(!isPinned)}
                    className={`w-full p-2.5 border rounded-xl font-bold transition flex items-center justify-center space-x-2 ${
                      isPinned ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <Pin className="w-4 h-4" />
                    <span>{isPinned ? 'Pinned Notice' : 'Standard Priority'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notice Content</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detailed announcement content..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Attachment File Name (Optional)</label>
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="e.g., Exam_Timetable_Aug_2026.pdf"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-medium"
                />
              </div>

              {/* Delivery Channels */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Delivery Broadcast Channels</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-700">
                    <input type="checkbox" checked={sendInApp} onChange={(e) => setSendInApp(e.target.checked)} />
                    <span>In-App</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-700">
                    <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-700">
                    <input type="checkbox" checked={sendWhatsapp} onChange={(e) => setSendWhatsapp(e.target.checked)} />
                    <span>WhatsApp</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                >
                  Publish Notice Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
