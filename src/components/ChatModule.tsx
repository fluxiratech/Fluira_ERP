import React, { useState, useRef, useEffect } from 'react';
import { ChatConversation, ChatMessage, User, Role, Faculty, Student360Profile } from '../types';
import {
  MessageSquare,
  Send,
  Search,
  Paperclip,
  CheckCheck,
  User as UserIcon,
  Plus,
  Trash2,
  Phone,
  Video,
  MoreVertical,
  X,
  FileText,
  Image as ImageIcon,
  Check,
  Sparkles,
  Users,
  GraduationCap,
  Briefcase,
  Shield,
} from 'lucide-react';

interface ChatModuleProps {
  conversations: ChatConversation[];
  messages: Record<string, ChatMessage[]>;
  currentUser: User;
  onSendMessage: (conversationId: string, text: string, attachmentUrl?: string, attachmentType?: 'image' | 'file') => void;
  onStartConversation?: (participant: { id: string; name: string; role: Role; avatar?: string }) => Promise<string> | void;
  onDeleteConversation?: (conversationId: string) => void;
  onMarkRead?: (conversationId: string) => void;
  facultyList?: Faculty[];
  students?: Student360Profile[];
  usersList?: User[];
}

export const ChatModule: React.FC<ChatModuleProps> = ({
  conversations,
  messages,
  currentUser,
  onSendMessage,
  onStartConversation,
  onDeleteConversation,
  onMarkRead,
  facultyList = [],
  students = [],
  usersList = [],
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string>(() => conversations[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<'ALL' | 'FACULTY' | 'STUDENTS' | 'ADMIN'>('ALL');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryRoleTab, setDirectoryRoleTab] = useState<'ALL' | 'FACULTY' | 'STUDENTS' | 'ADMIN'>('ALL');
  const [pendingAttachment, setPendingAttachment] = useState<{ url: string; name: string; type: 'image' | 'file' } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto select first conversation if none selected
  useEffect(() => {
    if (!selectedConvId && conversations.length > 0) {
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, selectedConvId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConvId]);

  // Mark conversation read on selection
  useEffect(() => {
    if (selectedConvId && onMarkRead) {
      onMarkRead(selectedConvId);
    }
  }, [selectedConvId, onMarkRead]);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || (conversations.length > 0 ? conversations[0] : null);
  const currentMessages = selectedConvId && messages[selectedConvId] ? messages[selectedConvId] : [];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !pendingAttachment) return;
    if (!selectedConvId) return;

    onSendMessage(
      selectedConvId,
      inputText.trim() || (pendingAttachment ? `Sent attachment: ${pendingAttachment.name}` : ''),
      pendingAttachment?.url,
      pendingAttachment?.type
    );

    setInputText('');
    setPendingAttachment(null);
  };

  const handleQuickReply = (text: string) => {
    if (!selectedConvId) return;
    onSendMessage(selectedConvId, text);
  };

  const handleSelectDirectoryContact = async (contact: { id: string; name: string; role: Role; avatar?: string }) => {
    setShowNewChatModal(false);
    if (onStartConversation) {
      const convId = await onStartConversation(contact);
      if (convId) {
        setSelectedConvId(convId);
      }
    }
  };

  const handleAttachMockFile = (type: 'image' | 'file') => {
    if (type === 'image') {
      setPendingAttachment({
        url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600',
        name: 'Assignment_Notes.jpg',
        type: 'image',
      });
    } else {
      setPendingAttachment({
        url: '#',
        name: 'Semester_Syllabus_Plan.pdf',
        type: 'file',
      });
    }
  };

  // Build searchable directory contacts for new chat modal
  const directoryContacts: Array<{ id: string; name: string; role: Role; subtitle: string; avatar?: string }> = [];

  // Add Faculty
  facultyList.forEach((f) => {
    if (f.email !== currentUser.email && f.fullName !== currentUser.name) {
      directoryContacts.push({
        id: f.id,
        name: f.fullName,
        role: (f.designation?.includes('HOD') ? 'HOD' : 'Faculty') as Role,
        subtitle: `${f.designation || 'Faculty'} • ${f.departmentName || 'Dept of A&F'}`,
        avatar: f.photo,
      });
    }
  });

  // Add Students
  students.forEach((s) => {
    if (s.email !== currentUser.email && s.fullName !== currentUser.name) {
      directoryContacts.push({
        id: s.id,
        name: s.fullName,
        role: 'Student' as Role,
        subtitle: `Roll #${s.rollNumber} • ${s.course || 'BAF'} (Sem ${s.semester})`,
        avatar: s.passportPhoto,
      });
    }
  });

  // Add other users from usersList if not already included
  usersList.forEach((u) => {
    if (
      u.email !== currentUser.email &&
      !directoryContacts.some((c) => c.name.toLowerCase() === u.name.toLowerCase())
    ) {
      directoryContacts.push({
        id: u.id,
        name: u.name,
        role: u.role,
        subtitle: `${u.role} • ${u.departmentName || 'Institutional Staff'}`,
        avatar: u.avatar,
      });
    }
  });

  const filteredDirectory = directoryContacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(directorySearch.toLowerCase()) ||
      c.role.toLowerCase().includes(directorySearch.toLowerCase());

    if (!matchesSearch) return false;
    if (directoryRoleTab === 'ALL') return true;
    if (directoryRoleTab === 'FACULTY') return c.role === 'Faculty' || c.role === 'Class Teacher';
    if (directoryRoleTab === 'STUDENTS') return c.role === 'Student';
    if (directoryRoleTab === 'ADMIN') return c.role === 'Admin' || c.role === 'HOD';
    return true;
  });

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.participantRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeFilterTab === 'ALL') return true;
    if (activeFilterTab === 'FACULTY') return c.participantRole === 'Faculty' || c.participantRole === 'Class Teacher';
    if (activeFilterTab === 'STUDENTS') return c.participantRole === 'Student';
    if (activeFilterTab === 'ADMIN') return c.participantRole === 'Admin' || c.participantRole === 'HOD';
    return true;
  });

  const quickReplies = [
    'Acknowledged, thank you.',
    'Please share the updated report.',
    'Could you confirm your availability for a meeting?',
    'Please review the pending leave application.',
    'Attendance has been updated for today.',
  ];

  return (
    <div id="erp-chat-module" className="bg-white rounded-2xl border border-slate-200 shadow-sm h-[calc(100vh-170px)] min-h-[550px] flex overflow-hidden">
      
      {/* Left Conversations Sidebar */}
      <div className="w-84 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 leading-none">ERP Messenger</h2>
                <span className="text-[10px] text-slate-400 font-medium">Internal Academic Chat</span>
              </div>
            </div>

            <button
              id="btn-new-chat"
              onClick={() => {
                setDirectorySearch('');
                setShowNewChatModal(true);
              }}
              title="Start New Conversation"
              className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition flex items-center space-x-1 text-[11px] font-semibold px-2.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="input-chat-search"
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold text-slate-600">
            <button
              onClick={() => setActiveFilterTab('ALL')}
              className={`flex-1 py-1 rounded-md transition ${activeFilterTab === 'ALL' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'}`}
            >
              All ({conversations.length})
            </button>
            <button
              onClick={() => setActiveFilterTab('FACULTY')}
              className={`flex-1 py-1 rounded-md transition ${activeFilterTab === 'FACULTY' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'}`}
            >
              Faculty
            </button>
            <button
              onClick={() => setActiveFilterTab('STUDENTS')}
              className={`flex-1 py-1 rounded-md transition ${activeFilterTab === 'STUDENTS' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'}`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveFilterTab('ADMIN')}
              className={`flex-1 py-1 rounded-md transition ${activeFilterTab === 'ADMIN' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'}`}
            >
              HOD/Admin
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200/60">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              const unread = conv.unreadCount || 0;
              return (
                <button
                  key={conv.id}
                  id={`chat-conv-${conv.id}`}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full p-3.5 text-left flex items-start space-x-3 transition relative ${
                    isSelected ? 'bg-indigo-50/90 border-l-4 border-indigo-600' : 'hover:bg-slate-100/70 bg-white'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={conv.participantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={conv.participantName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span
                      className={`w-2.5 h-2.5 rounded-full border-2 border-white absolute bottom-0 right-0 ${
                        conv.participantStatus === 'Online'
                          ? 'bg-emerald-500 ring-2 ring-emerald-100'
                          : conv.participantStatus === 'Away'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate pr-1">{conv.participantName}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">{conv.lastMessageTime || ''}</span>
                    </div>

                    <div className="flex items-center space-x-1 mb-1">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm ${
                          conv.participantRole === 'HOD'
                            ? 'bg-purple-100 text-purple-700'
                            : conv.participantRole === 'Faculty' || conv.participantRole === 'Teacher'
                            ? 'bg-indigo-100 text-indigo-700'
                            : conv.participantRole === 'Admin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {conv.participantRole}
                      </span>
                    </div>

                    <p className={`text-xs truncate ${unread > 0 ? 'font-bold text-slate-900' : 'text-slate-500 font-medium'}`}>
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>

                  {unread > 0 && (
                    <span className="w-4.5 h-4.5 bg-indigo-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center shrink-0 self-center">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">No conversations found</p>
              <p className="text-[11px] text-slate-400">Click &quot;New Chat&quot; to message any faculty or student.</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
              >
                + Browse College Directory
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Chat Window */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          
          {/* Active Chat Header */}
          <div className="p-3.5 px-6 border-b border-slate-200 flex items-center justify-between bg-white shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={activeConv.participantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={activeConv.participantName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <span
                  className={`w-2.5 h-2.5 rounded-full border-2 border-white absolute bottom-0 right-0 ${
                    activeConv.participantStatus === 'Online'
                      ? 'bg-emerald-500 ring-2 ring-emerald-100'
                      : activeConv.participantStatus === 'Away'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900">{activeConv.participantName}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeConv.participantRole === 'HOD'
                        ? 'bg-purple-100 text-purple-700'
                        : activeConv.participantRole === 'Faculty' || activeConv.participantRole === 'Teacher'
                        ? 'bg-indigo-100 text-indigo-700'
                        : activeConv.participantRole === 'Admin'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {activeConv.participantRole}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{activeConv.participantStatus || 'Online'} • C.K. Thakur Empowered Autonomous ERP</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              {onDeleteConversation && (
                <button
                  id="btn-delete-conv"
                  onClick={() => {
                    if (confirm(`Delete conversation with ${activeConv.participantName}?`)) {
                      onDeleteConversation(activeConv.id);
                    }
                  }}
                  title="Delete Conversation"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            {/* Encryption notice banner */}
            <div className="text-center my-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 border border-slate-200/80 rounded-full text-[10px] font-semibold text-slate-500">
                <Shield className="w-3 h-3 text-slate-400" />
                <span>End-to-end encrypted C.K. Thakur ERP Academic Messaging</span>
              </span>
            </div>

            {currentMessages.length > 0 ? (
              currentMessages.map((msg, index) => {
                const isMe = msg.senderRole === currentUser.role || msg.senderName === currentUser.name || msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id || index}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center space-x-2 mb-1 text-[10px] text-slate-400">
                      <span className="font-bold text-slate-700">{isMe ? 'You' : msg.senderName}</span>
                      <span>•</span>
                      <span>{msg.createdAt}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-xs font-medium'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs font-medium'
                      }`}
                    >
                      {msg.attachmentUrl && (
                        <div className="mb-2">
                          {msg.attachmentType === 'image' ? (
                            <img
                              src={msg.attachmentUrl}
                              alt="Attachment"
                              className="rounded-lg max-h-48 w-auto object-cover border border-slate-200/40"
                            />
                          ) : (
                            <div className={`p-2.5 rounded-lg flex items-center space-x-2 ${isMe ? 'bg-indigo-700/50 text-white' : 'bg-slate-100 text-slate-800'}`}>
                              <FileText className="w-4 h-4 shrink-0" />
                              <span className="text-[11px] font-medium truncate">Document Attachment</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div>{msg.text}</div>
                    </div>

                    {isMe && (
                      <div className="flex items-center space-x-1 mt-0.5 text-[10px] text-indigo-600 font-semibold">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Delivered</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Start the conversation</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Send a message, share academic files, or select one of the quick suggestions below.
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-6 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">Quick:</span>
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickReply(reply)}
                className="text-[11px] font-medium px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 rounded-full shrink-0 transition shadow-2xs"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Pending Attachment Preview */}
          {pendingAttachment && (
            <div className="px-6 py-2 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-900">
                <Paperclip className="w-4 h-4 text-indigo-600" />
                <span>Ready to send: {pendingAttachment.name}</span>
              </div>
              <button
                onClick={() => setPendingAttachment(null)}
                className="p-1 hover:bg-indigo-100 text-indigo-700 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-4 px-6 border-t border-slate-200 bg-white flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => handleAttachMockFile('image')}
                title="Attach Image"
                className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleAttachMockFile('file')}
                title="Attach Document / Syllabus"
                className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>

            <input
              id="input-chat-message"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeConv.participantName}... (Press Enter to send)`}
              className="flex-1 p-2.5 px-4 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />

            <button
              id="btn-send-message"
              type="submit"
              disabled={!inputText.trim() && !pendingAttachment}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs shadow-md transition flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-slate-50/50">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Select a conversation or start a new chat</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            You can message faculty members, class teachers, students, or institutional administrators across C.K. Thakur College.
          </p>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Academic Chat</span>
          </button>
        </div>
      )}

      {/* Directory Modal for New Chat */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Start New Academic Chat</h3>
                  <p className="text-[11px] text-slate-500">Select a faculty member, staff, or student from the directory</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search & Filters */}
            <div className="p-4 px-6 border-b border-slate-100 space-y-3 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name, department, role, or roll number..."
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  autoFocus
                />
              </div>

              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold text-slate-600">
                <button
                  onClick={() => setDirectoryRoleTab('ALL')}
                  className={`flex-1 py-1 rounded-md transition ${directoryRoleTab === 'ALL' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'}`}
                >
                  All ({directoryContacts.length})
                </button>
                <button
                  onClick={() => setDirectoryRoleTab('FACULTY')}
                  className={`flex-1 py-1 rounded-md transition ${directoryRoleTab === 'FACULTY' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'}`}
                >
                  Faculty & Mentors
                </button>
                <button
                  onClick={() => setDirectoryRoleTab('STUDENTS')}
                  className={`flex-1 py-1 rounded-md transition ${directoryRoleTab === 'STUDENTS' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'}`}
                >
                  Students
                </button>
                <button
                  onClick={() => setDirectoryRoleTab('ADMIN')}
                  className={`flex-1 py-1 rounded-md transition ${directoryRoleTab === 'ADMIN' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'}`}
                >
                  HOD & Admin
                </button>
              </div>
            </div>

            {/* Contacts Directory List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-2">
              {filteredDirectory.length > 0 ? (
                filteredDirectory.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleSelectDirectoryContact(contact)}
                    className="w-full p-3 px-4 text-left flex items-center justify-between rounded-xl hover:bg-indigo-50/70 transition group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={contact.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={contact.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 truncate">{contact.name}</h4>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm ${
                              contact.role === 'HOD'
                                ? 'bg-purple-100 text-purple-700'
                                : contact.role === 'Faculty' || contact.role === 'Class Teacher'
                                ? 'bg-indigo-100 text-indigo-700'
                                : contact.role === 'Admin'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {contact.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{contact.subtitle}</p>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition px-2.5 py-1 bg-indigo-50 rounded-lg">
                      Message →
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No matching contacts found in directory.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 px-6 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
