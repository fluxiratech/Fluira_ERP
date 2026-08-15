import React, { useState } from 'react';
import { ChatConversation, ChatMessage, User } from '../types';
import {
  MessageSquare,
  Send,
  Search,
  Paperclip,
  CheckCheck,
  User as UserIcon,
  Bot,
  Circle,
} from 'lucide-react';

interface ChatModuleProps {
  conversations: ChatConversation[];
  messages: Record<string, ChatMessage[]>;
  currentUser: User;
  onSendMessage: (conversationId: string, text: string) => void;
}

export const ChatModule: React.FC<ChatModuleProps> = ({
  conversations,
  messages,
  currentUser,
  onSendMessage,
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string>(conversations[0]?.id || 'conv-1');
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];
  const currentMessages = messages[selectedConvId] || [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(selectedConvId, inputText.trim());
    setInputText('');
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.participantRole.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-[calc(100vh-180px)] flex overflow-hidden">
      
      {/* Left Conversations Sidebar */}
      <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">In-App ERP Messages</h2>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search faculty or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-200/60">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === selectedConvId;
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className={`w-full p-3 text-left flex items-start space-x-3 transition ${
                  isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-100/70'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={conv.participantAvatar}
                    alt={conv.participantName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <span
                    className={`w-3 h-3 rounded-full border-2 border-white absolute bottom-0 right-0 ${
                      conv.participantStatus === 'Online'
                        ? 'bg-emerald-500'
                        : conv.participantStatus === 'Away'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{conv.participantName}</h4>
                    <span className="text-[10px] text-slate-400 shrink-0">{conv.lastMessageTime}</span>
                  </div>
                  <p className="text-[10px] font-semibold text-indigo-600">{conv.participantRole}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage}</p>
                </div>

                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-indigo-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Chat Window */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-white">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-3">
              <img
                src={activeConv.participantAvatar}
                alt={activeConv.participantName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900">{activeConv.participantName}</h3>
                <div className="flex items-center space-x-2 text-[11px]">
                  <span className="font-semibold text-indigo-600">{activeConv.participantRole}</span>
                  <span className="text-slate-300">•</span>
                  <span
                    className={`font-medium ${
                      activeConv.participantStatus === 'Online' ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {activeConv.participantStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
            {currentMessages.map((msg) => {
              const isMe = msg.senderRole === currentUser.role || msg.senderName === currentUser.name;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center space-x-2 mb-1 text-[10px] text-slate-400">
                    <span className="font-bold text-slate-700">{msg.senderName}</span>
                    <span>•</span>
                    <span>{msg.createdAt}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl max-w-md text-xs font-medium leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white flex items-center space-x-3">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeConv.participantName}...`}
              className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center space-x-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>

        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
          Select a conversation to start chatting.
        </div>
      )}

    </div>
  );
};
