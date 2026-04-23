'use client';
import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import {
  MOCK_TEAMS,
  MOCK_USERS,
  CURRENT_USER,
  getMessagesByChannel,
  getUserById,
  timeAgo,
} from '@/lib/mockData';
import type { Message } from '@/lib/mockData';

interface GlobalChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function GlobalChatSidebar({ open, onClose }: GlobalChatSidebarProps) {
  const [activeChannel, setActiveChannel] = useState('team-001');
  const [messages, setMessages] = useState<Message[]>(getMessagesByChannel('team-001'));
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(getMessagesByChannel(activeChannel));
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    // BACKEND INTEGRATION: Send message via Supabase real-time channel
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      channelId: activeChannel,
      userId: CURRENT_USER.id,
      content: input.trim(),
      createdAt: new Date().toISOString(),
      isRead: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onlineUsers = MOCK_USERS.filter((u) => u.isOnline);

  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-white border-l border-slate-200 shadow-panel flex flex-col z-40 transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Icon name="ChatBubbleLeftRightIcon" size={18} className="text-brand-teal" />
          <h2 className="text-sm font-700 text-slate-800">Team Chat</h2>
          <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            {onlineUsers.length} online
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <Icon name="XMarkIcon" size={16} />
        </button>
      </div>

      {/* Channel tabs */}
      <div className="flex border-b border-slate-200 flex-shrink-0">
        {MOCK_TEAMS.map((team) => {
          const unread = getMessagesByChannel(team.id).filter((m) => !m.isRead).length;
          return (
            <button
              key={`chan-${team.id}`}
              onClick={() => setActiveChannel(team.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-500 border-b-2 transition-colors duration-150 ${
                activeChannel === team.id
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="truncate">{team.name.split(' ')[0]}</span>
              {unread > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand-orange text-white text-[9px] font-700 flex items-center justify-center flex-shrink-0">
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Online members */}
      <div className="px-3 py-2 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1">
          {MOCK_USERS.filter((u) => u.teamId === activeChannel || u.isOnline)
            .slice(0, 8)
            .map((user) => (
              <div key={`online-${user.id}`} className="relative flex-shrink-0" title={user.name}>
                <div className="w-7 h-7 rounded-full bg-brand-orange/80 flex items-center justify-center">
                  <span className="text-white text-[10px] font-700">{user.avatar}</span>
                </div>
                {user.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Icon name="ChatBubbleLeftRightIcon" size={32} className="text-slate-300 mb-2" />
            <p className="text-sm text-slate-400 font-500">No messages yet</p>
            <p className="text-xs text-slate-400 mt-1">Start a conversation with your team</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const user = getUserById(msg.userId);
            const isMe = msg.userId === CURRENT_USER.id;
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const showAvatar = !prevMsg || prevMsg.userId !== msg.userId;

            return (
              <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                {showAvatar && !isMe ? (
                  <div className="w-7 h-7 rounded-full bg-brand-teal/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-[10px] font-700">{user?.avatar}</span>
                  </div>
                ) : !isMe ? (
                  <div className="w-7 flex-shrink-0" />
                ) : null}
                <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {showAvatar && !isMe && (
                    <span className="text-[10px] text-slate-500 font-500 mb-0.5 px-1">
                      {user?.name.split(' ')[0]}
                    </span>
                  )}
                  <div
                    className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-brand-orange text-white rounded-tr-sm'
                        : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                    {timeAgo(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 flex-shrink-0">
        <div className="flex items-end gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus-within:ring-2 focus-within:ring-brand-orange/30 focus-within:border-brand-orange transition-all duration-150">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message your team..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none max-h-24 scrollbar-thin"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-1.5 rounded-lg bg-brand-orange text-white hover:bg-brand-orange-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-95 flex-shrink-0"
          >
            <Icon name="PaperAirplaneIcon" size={14} />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 text-center">
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
