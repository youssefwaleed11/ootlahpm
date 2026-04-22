'use client';
import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { getCommentsByTask, getUserById, CURRENT_USER, MOCK_USERS, timeAgo, type Task, type Comment } from '@/lib/mockData';
import { toast } from 'sonner';

interface TaskChatPanelProps {
  task: Task;
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

function renderContent(content: string): React.ReactNode {
  const parts = content.split(/(@\w+)/g);
  return parts.map((part, i) =>
    part.startsWith('@')
      ? <span key={i} className="text-brand-orange font-600">{part}</span>
      : part
  );
}

export default function TaskChatPanel({ task, onClose }: TaskChatPanelProps) {
  const [comments, setComments] = useState<Comment[]>(getCommentsByTask(task.id));
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [attachment, setAttachment] = useState<AttachmentPreview | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setComments(getCommentsByTask(task.id));
  }, [task.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const filteredComments = searchQuery.trim()
    ? comments.filter(c => c.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : comments;

  const mentionUsers = MOCK_USERS.filter(u =>
    mentionQuery ? u.name.toLowerCase().includes(mentionQuery.toLowerCase()) : true
  ).slice(0, 5);

  const participants = [...new Set(comments.map(c => c.userId))].map(id => getUserById(id)).filter(Boolean);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    const atMatch = val.match(/@(\w*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
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
      setAttachment({ name: file.name, size: file.size, type: file.type, dataUrl: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSend = () => {
    if (!input.trim() && !attachment) return;
    const newComment: Comment = {
      id: `cmt-${Date.now()}`,
      taskId: task.id,
      userId: CURRENT_USER.id,
      content: input.trim(),
      createdAt: new Date().toISOString(),
      isEdited: false,
      attachment: attachment || undefined,
      mentions: (input.match(/@\w+/g) || []).map(m => m.slice(1)),
    };
    setComments(prev => [...prev, newComment]);
    setInput('');
    setAttachment(null);
    setShowMentions(false);
    toast.success('Comment added');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === 'Escape') setShowMentions(false);
  };

  return (
    <div className="w-72 xl:w-80 bg-slate-50 border-l border-slate-200 flex flex-col h-full flex-shrink-0 slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <Icon name="ChatBubbleLeftIcon" size={16} className="text-brand-teal" />
          <h3 className="text-sm font-700 text-slate-800">Task Discussion</h3>
          <span className="text-[10px] font-600 text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{comments.length}</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <Icon name="XMarkIcon" size={14} />
        </button>
      </div>

      {/* Task reference + participants */}
      <div className="px-3 py-2 border-b border-slate-200 bg-white flex-shrink-0">
        <p className="text-[11px] text-slate-500 truncate mb-1.5">
          <span className="font-600 text-brand-orange">#{task.id.split('-')[1]}</span> {task.title}
        </p>
        {participants.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">Participants:</span>
            <div className="flex -space-x-1">
              {participants.map(u => u && (
                <div key={u.id} className="w-5 h-5 rounded-full bg-brand-teal/80 border border-white flex items-center justify-center" title={u.name}>
                  <span className="text-white text-[8px] font-700">{u.avatar}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-slate-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-2 bg-slate-50 rounded-lg border border-slate-200 px-2.5 py-1.5">
          <Icon name="MagnifyingGlassIcon" size={12} className="text-slate-400 flex-shrink-0" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <Icon name="XMarkIcon" size={11} />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-[10px] text-slate-400 mt-1">{filteredComments.length} result{filteredComments.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Comments */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-3">
        {filteredComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Icon name="ChatBubbleLeftEllipsisIcon" size={28} className="text-slate-300 mb-2" />
            <p className="text-xs text-slate-400 font-500">{searchQuery ? 'No results found' : 'No comments yet'}</p>
          </div>
        ) : (
          filteredComments.map(comment => {
            const user = getUserById(comment.userId);
            const isMe = comment.userId === CURRENT_USER.id;
            return (
              <div key={comment.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                {!isMe && (
                  <div className="w-6 h-6 rounded-full bg-brand-teal/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-[9px] font-700">{user?.avatar}</span>
                  </div>
                )}
                <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <span className="text-[10px] text-slate-500 font-500 mb-0.5 px-1">{user?.name.split(' ')[0]}</span>
                  )}
                  {comment.content && (
                    <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${isMe ? 'bg-brand-orange text-white rounded-tr-sm' : 'bg-white text-slate-700 rounded-tl-sm border border-slate-200 shadow-card'}`}>
                      {searchQuery ? highlightText(comment.content, searchQuery) : renderContent(comment.content)}
                    </div>
                  )}
                  {comment.attachment && (
                    <div className={`mt-1 rounded-xl overflow-hidden border ${isMe ? 'border-brand-orange/30' : 'border-slate-200'}`}>
                      {comment.attachment.type.startsWith('image/') ? (
                        <img src={comment.attachment.dataUrl} alt={comment.attachment.name} className="max-w-[160px] max-h-[100px] object-cover" />
                      ) : (
                        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50">
                          <Icon name="DocumentIcon" size={14} className="text-brand-orange flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-600 text-slate-700 truncate">{comment.attachment.name}</p>
                            <p className="text-[9px] text-slate-400">{(comment.attachment.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <a href={comment.attachment.dataUrl} download={comment.attachment.name} className="text-[10px] text-brand-orange font-600">↓</a>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-0.5 px-1">
                    <span className="text-[9px] text-slate-400">{timeAgo(comment.createdAt)}</span>
                    {comment.isEdited && <span className="text-[9px] text-slate-400">(edited)</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Attachment preview */}
      {attachment && (
        <div className="px-3 py-2 border-t border-slate-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg border border-slate-200 px-2.5 py-1.5">
            {attachment.type.startsWith('image/') ? (
              <img src={attachment.dataUrl} alt={attachment.name} className="w-7 h-7 rounded object-cover flex-shrink-0" />
            ) : (
              <Icon name="DocumentIcon" size={14} className="text-brand-orange flex-shrink-0" />
            )}
            <p className="text-[11px] font-500 text-slate-700 flex-1 truncate">{attachment.name}</p>
            <button onClick={() => setAttachment(null)} className="text-slate-400 hover:text-red-500">
              <Icon name="XMarkIcon" size={12} />
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
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-5 h-5 rounded-full bg-brand-teal flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[8px] font-700">{user.avatar}</span>
              </div>
              <span className="text-xs font-500 text-slate-700">{user.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-end gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus-within:ring-2 focus-within:ring-brand-teal/30 focus-within:border-brand-teal transition-all duration-150">
          <div className="w-5 h-5 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0 mb-0.5">
            <span className="text-white text-[9px] font-700">{CURRENT_USER.avatar}</span>
          </div>
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment... (@ to mention)"
            rows={1}
            className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 resize-none focus:outline-none max-h-20 scrollbar-thin"
          />
          <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.xlsx" onChange={handleFileSelect} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="p-1 rounded text-slate-400 hover:text-brand-teal transition-colors flex-shrink-0" title="Attach">
            <Icon name="PaperClipIcon" size={12} />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() && !attachment}
            className="p-1.5 rounded-lg bg-brand-teal text-white hover:bg-brand-teal-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-95 flex-shrink-0"
          >
            <Icon name="PaperAirplaneIcon" size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}