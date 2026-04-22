'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import { MOCK_TEAMS, MOCK_USERS, MOCK_PROJECTS, CURRENT_USER, getMessagesByChannel, getUserById, timeAgo } from '@/lib/mockData';
import type { Message } from '@/lib/mockData';

interface GlobalChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

interface AttachmentPreview {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part}</mark>
      : part
  );
}

function renderMessageContent(content: string): React.ReactNode {
  const parts = content.split(/(@\w+)/g);
  return parts.map((part, i) =>
    part.startsWith('@')
      ? <span key={i} className="text-brand-orange font-600">{part}</span>
      : part
  );
}

export default function GlobalChatSidebar({ open, onClose }: GlobalChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<'teams' | 'projects'>('teams');
  const [activeChannel, setActiveChannel] = useState('team-001');
  const [activeProjectChannel, setActiveProjectChannel] = useState('proj-001');
  const [messages, setMessages] = useState<Message[]>(getMessagesByChannel('team-001'));
  const [projectMessages, setProjectMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [attachment, setAttachment] = useState<AttachmentPreview | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(getMessagesByChannel(activeChannel));
  }, [activeChannel]);

  useEffect(() => {
    setProjectMessages(getMessagesByChannel(activeProjectChannel));
  }, [activeProjectChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, projectMessages]);

  const currentMessages = activeTab === 'teams' ? messages : projectMessages;
  const setCurrentMessages = activeTab === 'teams' ? setMessages : setProjectMessages;

  const filteredMessages = searchQuery.trim()
    ? currentMessages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : currentMessages;

  const mentionUsers = MOCK_USERS.filter(u =>
    mentionQuery ? u.name.toLowerCase().includes(mentionQuery.toLowerCase()) : true
  ).slice(0, 6);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    const atMatch = val.match(/@(\w*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  const insertMention = (userName: string) => {
    const newInput = input.replace(/@\w*$/, `@${userName.replace(' ', '')} `);
    setInput(newInput);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachment({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: ev.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSend = () => {
    if (!input.trim() && !attachment) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      channelId: activeTab === 'teams' ? activeChannel : activeProjectChannel,
      userId: CURRENT_USER.id,
      content: input.trim(),
      createdAt: new Date().toISOString(),
      isRead: true,
      attachment: attachment || undefined,
      mentions: (input.match(/@\w+/g) || []).map(m => m.slice(1)),
    };
    setCurrentMessages(prev => [...prev, newMsg]);
    setInput('');
    setAttachment(null);
    setShowMentions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') setShowMentions(false);
  };

  const onlineUsers = MOCK_USERS.filter(u => u.isOnline);
  const visibleProjects = MOCK_PROJECTS.filter(p => p.status !== 'archived');

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
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <Icon name="XMarkIcon" size={16} />
        </button>
      </div>

      {/* Main tabs: Teams / Projects */}
      <div className="flex border-b border-slate-200 flex-shrink-0">
        <button
          onClick={() => setActiveTab('teams')}
          className={`flex-1 py-2.5 text-xs font-600 border-b-2 transition-colors ${activeTab === 'teams' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Teams
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex-1 py-2.5 text-xs font-600 border-b-2 transition-colors ${activeTab === 'projects' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Projects
        </button>
      </div>

      {/* Sub-channel tabs */}
      {activeTab === 'teams' ? (
        <div className="flex border-b border-slate-200 flex-shrink-0">
          {MOCK_TEAMS.map(team => {
            const unread = getMessagesByChannel(team.id).filter(m => !m.isRead).length;
            return (
              <button
                key={`chan-${team.id}`}
                onClick={() => setActiveChannel(team.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-500 border-b-2 transition-colors duration-150 ${activeChannel === team.id ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <span className="truncate">{team.name.split(' ')[0]}</span>
                {unread > 0 && (
                  <span className="w-4 h-4 rounded-full bg-brand-orange text-white text-[9px] font-700 flex items-center justify-center flex-shrink-0">{unread}</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex border-b border-slate-200 flex-shrink-0 overflow-x-auto scrollbar-thin">
          {visibleProjects.map(proj => (
            <button
              key={`proj-chan-${proj.id}`}
              onClick={() => setActiveProjectChannel(proj.id)}
              className={`flex-shrink-0 px-3 py-2 text-xs font-500 border-b-2 transition-colors ${activeProjectChannel === proj.id ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {proj.name.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      {/* Search bar */}
      <div className="px-3 py-2 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2 bg-slate-50 rounded-lg border border-slate-200 px-2.5 py-1.5">
          <Icon name="MagnifyingGlassIcon" size={13} className="text-slate-400 flex-shrink-0" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <Icon name="XMarkIcon" size={12} />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-[10px] text-slate-400 mt-1">{filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;</p>
        )}
      </div>

      {/* Online members */}
      <div className="px-3 py-2 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1">
          {MOCK_USERS.filter(u => u.isOnline).slice(0, 8).map(user => (
            <div key={`online-${user.id}`} className="relative flex-shrink-0" title={user.name}>
              <div className="w-7 h-7 rounded-full bg-brand-orange/80 flex items-center justify-center">
                <span className="text-white text-[10px] font-700">{user.avatar}</span>
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Icon name="ChatBubbleLeftRightIcon" size={32} className="text-slate-300 mb-2" />
            <p className="text-sm text-slate-400 font-500">{searchQuery ? 'No messages found' : 'No messages yet'}</p>
          </div>
        ) : (
          filteredMessages.map((msg, idx) => {
            const user = getUserById(msg.userId);
            const isMe = msg.userId === CURRENT_USER.id;
            const prevMsg = idx > 0 ? filteredMessages[idx - 1] : null;
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
                    <span className="text-[10px] text-slate-500 font-500 mb-0.5 px-1">{user?.name.split(' ')[0]}</span>
                  )}
                  {msg.content && (
                    <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${isMe ? 'bg-brand-orange text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                      {searchQuery ? highlightText(msg.content, searchQuery) : renderMessageContent(msg.content)}
                    </div>
                  )}
                  {msg.attachment && (
                    <div className={`mt-1 rounded-xl overflow-hidden border ${isMe ? 'border-brand-orange/30' : 'border-slate-200'}`}>
                      {msg.attachment.type.startsWith('image/') ? (
                        <img src={msg.attachment.dataUrl} alt={msg.attachment.name} className="max-w-[180px] max-h-[120px] object-cover" />
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50">
                          <Icon name="DocumentIcon" size={16} className="text-brand-orange flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-600 text-slate-700 truncate">{msg.attachment.name}</p>
                            <p className="text-[10px] text-slate-400">{(msg.attachment.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <a href={msg.attachment.dataUrl} download={msg.attachment.name} className="text-[10px] text-brand-orange font-600 hover:underline">Download</a>
                        </div>
                      )}
                    </div>
                  )}
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">{timeAgo(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment preview */}
      {attachment && (
        <div className="px-3 py-2 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg border border-slate-200 px-2.5 py-1.5">
            {attachment.type.startsWith('image/') ? (
              <img src={attachment.dataUrl} alt={attachment.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
            ) : (
              <Icon name="DocumentIcon" size={16} className="text-brand-orange flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-600 text-slate-700 truncate">{attachment.name}</p>
              <p className="text-[10px] text-slate-400">{(attachment.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => setAttachment(null)} className="text-slate-400 hover:text-red-500 transition-colors">
              <Icon name="XMarkIcon" size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Mention dropdown */}
      {showMentions && (
        <div className="mx-3 mb-1 bg-white rounded-xl border border-slate-200 shadow-modal overflow-hidden flex-shrink-0">
          {mentionUsers.map(user => (
            <button
              key={user.id}
              onClick={() => insertMention(user.name)}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-6 h-6 rounded-full bg-brand-teal flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[9px] font-700">{user.avatar}</span>
              </div>
              <span className="text-xs font-500 text-slate-700">{user.name}</span>
              {user.isOnline && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-slate-200 flex-shrink-0">
        <div className="flex items-end gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus-within:ring-2 focus-within:ring-brand-orange/30 focus-within:border-brand-orange transition-all duration-150">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Message your team... (@ to mention)"
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none max-h-24 scrollbar-thin"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xlsx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-orange hover:bg-slate-100 transition-colors flex-shrink-0"
            title="Attach file"
          >
            <Icon name="PaperClipIcon" size={14} />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() && !attachment}
            className="p-1.5 rounded-lg bg-brand-orange text-white hover:bg-brand-orange-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-95 flex-shrink-0"
          >
            <Icon name="PaperAirplaneIcon" size={14} />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 text-center">Enter to send · Shift+Enter for newline · @ to mention</p>
      </div>
    </div>
  );
}