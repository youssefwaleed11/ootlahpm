'use client';
import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { getCommentsByTask, getUserById, CURRENT_USER, timeAgo, type Task, type Comment } from '@/lib/mockData';
import { toast } from 'sonner';

interface TaskChatPanelProps {
  task: Task;
  onClose: () => void;
}

export default function TaskChatPanel({ task, onClose }: TaskChatPanelProps) {
  const [comments, setComments] = useState<Comment[]>(getCommentsByTask(task.id));
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setComments(getCommentsByTask(task.id));
  }, [task.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSend = () => {
    if (!input.trim()) return;
    // BACKEND INTEGRATION: Supabase insert comment + real-time broadcast + Resend email to assignee/reporter
    const newComment: Comment = {
      id: `cmt-${Date.now()}`,
      taskId: task.id,
      userId: CURRENT_USER.id,
      content: input.trim(),
      createdAt: new Date().toISOString(),
      isEdited: false,
    };
    setComments(prev => [...prev, newComment]);
    setInput('');
    toast.success('Comment added');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-72 xl:w-80 bg-slate-50 border-l border-slate-200 flex flex-col h-full flex-shrink-0 slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <Icon name="ChatBubbleLeftIcon" size={16} className="text-brand-teal" />
          <h3 className="text-sm font-700 text-slate-800">Task Chat</h3>
          <span className="text-[10px] font-600 text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{comments.length}</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <Icon name="XMarkIcon" size={14} />
        </button>
      </div>

      {/* Task reference */}
      <div className="px-3 py-2 border-b border-slate-200 bg-white flex-shrink-0">
        <p className="text-[11px] text-slate-500 truncate">
          <span className="font-600 text-brand-orange">#{task.id.split('-')[1]}</span> {task.title}
        </p>
      </div>

      {/* Comments */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-3">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Icon name="ChatBubbleLeftEllipsisIcon" size={28} className="text-slate-300 mb-2" />
            <p className="text-xs text-slate-400 font-500">No comments yet</p>
            <p className="text-[11px] text-slate-400 mt-1">Start the conversation about this task</p>
          </div>
        ) : (
          comments.map(comment => {
            const user = getUserById(comment.userId);
            const isMe = comment.userId ===CURRENT_USER.id;
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
                  <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${isMe ? 'bg-brand-orange text-white rounded-tr-sm' : 'bg-white text-slate-700 rounded-tl-sm border border-slate-200 shadow-card'}`}>
                    {comment.content}
                  </div>
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

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-end gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus-within:ring-2 focus-within:ring-brand-teal/30 focus-within:border-brand-teal transition-all duration-150">
          <div className="w-5 h-5 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0 mb-0.5">
            <span className="text-white text-[9px] font-700">{CURRENT_USER.avatar}</span>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment..."
            rows={1}
            className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 resize-none focus:outline-none max-h-20 scrollbar-thin"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-1.5 rounded-lg bg-brand-teal text-white hover:bg-brand-teal-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-95 flex-shrink-0"
          >
            <Icon name="PaperAirplaneIcon" size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}