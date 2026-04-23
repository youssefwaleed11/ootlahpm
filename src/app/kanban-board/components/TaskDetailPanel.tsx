'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { getUserById, getTeamById, formatDate, isOverdue, MOCK_USERS, type Task } from '@/lib/mockData';
import { toast } from 'sonner';

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onOpenChat: () => void;
  chatOpen: boolean;
}

const PRIORITY_CONFIG = {
  low: { label: 'Low', className: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critical', className: 'bg-red-100 text-red-600' },
};

const STATUS_CONFIG = {
  todo: { label: 'To Do', className: 'bg-slate-100 text-slate-600' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  in_review: { label: 'In Review', className: 'bg-amber-100 text-amber-700' },
  done: { label: 'Done', className: 'bg-emerald-100 text-emerald-700' },
};

export default function TaskDetailPanel({ task, onClose, onUpdate, onOpenChat, chatOpen }: TaskDetailPanelProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title);
  const [descValue, setDescValue] = useState(task.description);
  const [statusDropOpen, setStatusDropOpen] = useState(false);
  const [priorityDropOpen, setPriorityDropOpen] = useState(false);
  const [assigneeDropOpen, setAssigneeDropOpen] = useState(false);

  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
  const reporter = getUserById(task.reporterId);
  const team = task.teamId ? getTeamById(task.teamId) : null;
  const overdue = isOverdue(task.dueDate) && task.status !== 'done';

  const handleTitleSave = () => {
    if (titleValue.trim()) {
      onUpdate({ ...task, title: titleValue.trim() });
      toast.success('Task title updated');
    }
    setEditingTitle(false);
  };

  const handleDescSave = () => {
    onUpdate({ ...task, description: descValue });
    toast.success('Task description updated');
    setEditingDesc(false);
  };

  const handleStatusChange = (status: Task['status']) => {
    onUpdate({ ...task, status });
    setStatusDropOpen(false);
    toast.success(`Status changed to ${STATUS_CONFIG[status].label}`);
  };

  const handlePriorityChange = (priority: Task['priority']) => {
    onUpdate({ ...task, priority });
    setPriorityDropOpen(false);
    toast.success(`Priority set to ${PRIORITY_CONFIG[priority].label}`);
  };

  const handleAssigneeChange = (userId: string) => {
    // BACKEND INTEGRATION: Supabase update task + Resend email notification to new assignee
    onUpdate({ ...task, assigneeId: userId });
    setAssigneeDropOpen(false);
    const user = getUserById(userId);
    toast.success(`Assigned to ${user?.name}`);
  };

  return (
    <div className="w-80 xl:w-96 bg-white flex flex-col h-full overflow-hidden flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-600 text-slate-400 font-mono">#{task.id.split('-')[1]}</span>
          <span className={`text-[11px] font-600 px-2 py-0.5 rounded-full ${overdue ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
            {overdue ? 'Overdue' : 'On track'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenChat}
            className={`p-1.5 rounded-lg transition-colors duration-150 ${chatOpen ? 'bg-brand-teal/10 text-brand-teal' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
            title="Task chat"
          >
            <Icon name="ChatBubbleLeftIcon" size={16} />
          </button>
          <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <Icon name="EllipsisHorizontalIcon" size={16} />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <Icon name="XMarkIcon" size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            {editingTitle ? (
              <div>
                <input
                  autoFocus
                  value={titleValue}
                  onChange={e => setTitleValue(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') setEditingTitle(false); }}
                  className="w-full text-base font-700 text-slate-800 bg-slate-50 border border-brand-orange/50 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                />
              </div>
            ) : (
              <h2
                onClick={() => setEditingTitle(true)}
                className="text-base font-700 text-slate-800 leading-snug cursor-text hover:text-brand-orange transition-colors duration-150 group"
              >
                {task.title}
                <Icon name="PencilSquareIcon" size={12} className="inline ml-1 text-slate-300 group-hover:text-brand-orange/60 transition-colors" />
              </h2>
            )}
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-2">
            {/* Status */}
            <div className="relative">
              <p className="text-[10px] font-600 text-slate-400 uppercase tracking-wider mb-1">Status</p>
              <button
                onClick={() => setStatusDropOpen(!statusDropOpen)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-600 border border-transparent hover:border-slate-200 transition-all duration-150 ${STATUS_CONFIG[task.status].className}`}
              >
                {STATUS_CONFIG[task.status].label}
                <Icon name="ChevronDownIcon" size={12} />
              </button>
              {statusDropOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg border border-slate-200 shadow-card z-20 overflow-hidden fade-in">
                  {(Object.keys(STATUS_CONFIG) as Task['status'][]).map(s => (
                    <button
                      key={`status-opt-${s}`}
                      onClick={() => handleStatusChange(s)}
                      className={`w-full text-left px-2.5 py-1.5 text-xs font-600 hover:bg-slate-50 transition-colors ${STATUS_CONFIG[s].className.split(' ').slice(0, 1).join(' ')} hover:opacity-80`}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="relative">
              <p className="text-[10px] font-600 text-slate-400 uppercase tracking-wider mb-1">Priority</p>
              <button
                onClick={() => setPriorityDropOpen(!priorityDropOpen)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-600 border border-transparent hover:border-slate-200 transition-all duration-150 ${PRIORITY_CONFIG[task.priority].className}`}
              >
                {PRIORITY_CONFIG[task.priority].label}
                <Icon name="ChevronDownIcon" size={12} />
              </button>
              {priorityDropOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg border border-slate-200 shadow-card z-20 overflow-hidden fade-in">
                  {(Object.keys(PRIORITY_CONFIG) as Task['priority'][]).map(p => (
                    <button
                      key={`prio-opt-${p}`}
                      onClick={() => handlePriorityChange(p)}
                      className={`w-full text-left px-2.5 py-1.5 text-xs font-600 hover:opacity-80 transition-colors ${PRIORITY_CONFIG[p].className}`}
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div className="relative">
            <p className="text-[10px] font-600 text-slate-400 uppercase tracking-wider mb-1.5">Assignee</p>
            <button
              onClick={() => setAssigneeDropOpen(!assigneeDropOpen)}
              className="w-full flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 hover:border-brand-orange/40 transition-all duration-150 group"
            >
              {assignee ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-brand-teal flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-700">{assignee.avatar}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-600 text-slate-700">{assignee.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{assignee.role.replace('_', ' ')}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <Icon name="UserIcon" size={12} className="text-slate-400" />
                  </div>
                  <span className="text-xs text-slate-400">Unassigned</span>
                </>
              )}
              <Icon name="ChevronDownIcon" size={12} className="text-slate-400 ml-auto" />
            </button>
            {assigneeDropOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-modal z-20 overflow-hidden fade-in">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-[10px] font-600 text-slate-500 uppercase tracking-wider">Assign to</p>
                </div>
                {MOCK_USERS.map(user => (
                  <button
                    key={`assign-${user.id}`}
                    onClick={() => handleAssigneeChange(user.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors text-left ${task.assigneeId === user.id ? 'bg-orange-50' : ''}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-teal/80 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[10px] font-700">{user.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-600 text-slate-700 truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                    {user.isOnline && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />}
                    {task.assigneeId === user.id && <Icon name="CheckIcon" size={12} className="text-brand-orange flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] font-600 text-slate-400 uppercase tracking-wider mb-1.5">Start Date</p>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                <Icon name="CalendarIcon" size={12} className="text-slate-400" />
                <span className="text-xs text-slate-600 font-tabular">{formatDate(task.startDate)}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-600 text-slate-400 uppercase tracking-wider mb-1.5">Due Date</p>
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${overdue ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                <Icon name="CalendarDaysIcon" size={12} className={overdue ? 'text-red-400' : 'text-slate-400'} />
                <span className={`text-xs font-tabular ${overdue ? 'text-red-600 font-600' : 'text-slate-600'}`}>{formatDate(task.dueDate)}</span>
              </div>
            </div>
          </div>

          {/* Team */}
          {team && (
            <div>
              <p className="text-[10px] font-600 text-slate-400 uppercase tracking-wider mb-1.5">Team</p>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: team.color }}>
                  <Icon name="UserGroupIcon" size={10} className="text-white" />
                </div>
                <span className="text-xs font-600 text-slate-700">{team.name}</span>
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div>
              <p className="text-[10px] font-600 text-slate-400 uppercase tracking-wider mb-1.5">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map(tag => (
                  <span key={`detail-tag-${task.id}-${tag}`} className="text-[11px] font-500 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-[10px] font-600 text-slate-400 uppercase tracking-wider mb-1.5">Description</p>
            {editingDesc ? (
              <div>
                <textarea
                  autoFocus
                  value={descValue}
                  onChange={e => setDescValue(e.target.value)}
                  rows={4}
                  className="w-full text-sm text-slate-700 bg-slate-50 border border-brand-orange/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 resize-none scrollbar-thin"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleDescSave}
                    className="px-3 py-1 bg-brand-orange text-white text-xs font-600 rounded-lg hover:bg-brand-orange-dark transition-colors active:scale-95"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setDescValue(task.description); setEditingDesc(false); }}
                    className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-600 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setEditingDesc(true)}
                className="text-sm text-slate-600 leading-relaxed cursor-text hover:bg-slate-50 rounded-lg p-2 -mx-2 transition-colors duration-150 group"
              >
                {task.description || <span className="text-slate-400 italic">Add a description...</span>}
                <Icon name="PencilSquareIcon" size={10} className="inline ml-1 text-slate-300 group-hover:text-brand-orange/60 transition-colors" />
              </div>
            )}
          </div>

          {/* Reporter */}
          <div>
            <p className="text-[10px] font-600 text-slate-400 uppercase tracking-wider mb-1.5">Reporter</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center">
                <span className="text-white text-[10px] font-700">{reporter?.avatar}</span>
              </div>
              <span className="text-xs text-slate-600 font-500">{reporter?.name}</span>
            </div>
          </div>

          {/* Meta */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Created {formatDate(task.createdAt)}</span>
              <span>Updated {formatDate(task.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}