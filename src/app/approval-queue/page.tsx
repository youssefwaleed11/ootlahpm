'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import {
  CURRENT_USER, MOCK_TASKS, MOCK_PROJECTS, MOCK_TEAMS, getUserById,
  getProjectById, formatDate, type Task
} from '@/lib/mockData';
import { toast } from 'sonner';

function getInReviewTasks(): Task[] {
  const user = CURRENT_USER;
  if (user.role === 'admin') {
    return MOCK_TASKS.filter(t => t.status === 'in_review');
  }
  if (user.role === 'team_leader') {
    const team = MOCK_TEAMS.find(t => t.leaderId === user.id);
    if (!team) return [];
    return MOCK_TASKS.filter(t => t.status === 'in_review' && t.teamId === team.id);
  }
  return [];
}

interface RequestChangesModalProps {
  task: Task;
  onConfirm: (comment: string) => void;
  onCancel: () => void;
}

function RequestChangesModal({ task, onConfirm, onCancel }: RequestChangesModalProps) {
  const [comment, setComment] = useState('');
  const valid = comment.trim().length >= 10;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Icon name="ArrowUturnLeftIcon" size={18} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-700 text-slate-800">Request Changes</h3>
            <p className="text-xs text-slate-500 truncate max-w-xs">{task.title}</p>
          </div>
        </div>
        <textarea
          autoFocus
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Describe what changes are needed (min 10 characters)..."
          rows={4}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange resize-none scrollbar-thin mb-1"
        />
        {comment.trim().length > 0 && !valid && (
          <p className="text-xs text-red-500 mb-3">Minimum 10 characters required ({comment.trim().length}/10)</p>
        )}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => { if (valid) onConfirm(comment.trim()); }}
            disabled={!valid}
            className="flex-1 py-2.5 bg-amber-500 text-white text-sm font-600 rounded-xl hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send Request
          </button>
          <button onClick={onCancel} className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-sm font-600 rounded-xl hover:bg-slate-200 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critical', className: 'bg-red-100 text-red-600' },
};

export default function ApprovalQueuePage() {
  const [tasks, setTasks] = useState<Task[]>(getInReviewTasks());
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [requestChangesTask, setRequestChangesTask] = useState<Task | null>(null);
  const [filterProject, setFilterProject] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const role = CURRENT_USER.role;
  if (role === 'agent') {
    return (
      <AppLayout currentPath="/approval-queue">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Icon name="ShieldExclamationIcon" size={48} className="text-slate-300 mb-4" />
          <h2 className="text-xl font-700 text-slate-700 mb-2">Access Restricted</h2>
          <p className="text-slate-500">Approval Queue is only accessible to Team Leaders and Admins.</p>
        </div>
      </AppLayout>
    );
  }

  const projects = MOCK_PROJECTS.filter(p => tasks.some(t => t.projectId === p.id));
  const assignees = [...new Set(tasks.map(t => t.assigneeId).filter(Boolean))].map(id => getUserById(id!)).filter(Boolean);

  const filtered = tasks.filter(t => {
    if (filterProject && t.projectId !== filterProject) return false;
    if (filterAssignee && t.assigneeId !== filterAssignee) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  const handleApprove = (task: Task) => {
    setRemovingIds(prev => new Set([...prev, task.id]));
    setTimeout(() => {
      setTasks(prev => prev.filter(t => t.id !== task.id));
      setRemovingIds(prev => { const s = new Set(prev); s.delete(task.id); return s; });
      toast.success('Task approved and marked as done');
    }, 400);
  };

  const handleRequestChanges = (task: Task) => {
    setRequestChangesTask(task);
  };

  const handleConfirmChanges = (comment: string) => {
    if (!requestChangesTask) return;
    setRemovingIds(prev => new Set([...prev, requestChangesTask.id]));
    setTimeout(() => {
      setTasks(prev => prev.filter(t => t.id !== requestChangesTask.id));
      setRemovingIds(prev => { const s = new Set(prev); s.delete(requestChangesTask.id); return s; });
      toast.success('Changes requested — agent has been notified');
    }, 400);
    setRequestChangesTask(null);
  };

  return (
    <AppLayout currentPath="/approval-queue">
      {requestChangesTask && (
        <RequestChangesModal
          task={requestChangesTask}
          onConfirm={handleConfirmChanges}
          onCancel={() => setRequestChangesTask(null)}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-800 text-slate-800">Approval Queue</h1>
            <span className="bg-amber-100 text-amber-700 text-sm font-700 px-3 py-1 rounded-full">
              {tasks.length} pending
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 bg-white rounded-2xl border border-slate-200 shadow-card p-4">
          <select
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
          >
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            value={filterAssignee}
            onChange={e => setFilterAssignee(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
          >
            <option value="">All Assignees</option>
            {assignees.map(u => u && <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
          >
            <option value="">All Priorities</option>
            {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          {(filterProject || filterAssignee || filterPriority) && (
            <button
              onClick={() => { setFilterProject(''); setFilterAssignee(''); setFilterPriority(''); }}
              className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Icon name="XMarkIcon" size={14} />
              Clear filters
            </button>
          )}
        </div>

        {/* Task list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-200 shadow-card">
            <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-4">
              <Icon name="CheckCircleIcon" size={32} className="text-brand-orange" />
            </div>
            <h3 className="text-lg font-700 text-slate-700 mb-2">All caught up!</h3>
            <p className="text-slate-500 text-sm">No tasks pending review.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(task => {
              const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
              const project = getProjectById(task.projectId);
              const isRemoving = removingIds.has(task.id);

              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-2xl border border-slate-200 shadow-card p-4 transition-all duration-400 ${isRemoving ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Project dot */}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: project?.priority === 'critical' ? '#ef4444' : project?.priority === 'high' ? '#F97316' : '#0D9488' }}
                      title={project?.name}
                    />

                    {/* Task info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-700 text-slate-800 truncate">{task.title}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-[11px] text-slate-500">{project?.name}</span>
                        <span className="text-[11px] text-slate-400">·</span>
                        <span className="text-[11px] text-slate-500">Submitted {formatDate(task.updatedAt)}</span>
                      </div>
                    </div>

                    {/* Assignee */}
                    {assignee && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-7 h-7 rounded-full bg-brand-teal flex items-center justify-center">
                          <span className="text-white text-[10px] font-700">{assignee.avatar}</span>
                        </div>
                        <span className="text-xs text-slate-600 font-500 hidden sm:block">{assignee.name}</span>
                      </div>
                    )}

                    {/* Priority */}
                    <span className={`text-[11px] font-600 px-2 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_CONFIG[task.priority].className}`}>
                      {PRIORITY_CONFIG[task.priority].label}
                    </span>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(task)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-600 rounded-xl hover:bg-emerald-600 transition-colors active:scale-95"
                      >
                        <Icon name="CheckIcon" size={12} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRequestChanges(task)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-600 rounded-xl hover:bg-amber-200 transition-colors active:scale-95"
                      >
                        <Icon name="ArrowUturnLeftIcon" size={12} />
                        Changes
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
