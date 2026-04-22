'use client';
import React, { useState, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import {
  CURRENT_USER, MOCK_PROJECTS, MOCK_TEAMS, MOCK_USERS, MOCK_TASKS,
  type Task, type TaskStatus
} from '@/lib/mockData';
import { toast } from 'sonner';

interface CreateTaskModalProps {
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
  defaultProjectId?: string;
}

export default function CreateTaskModal({ onClose, onTaskCreated, defaultProjectId }: CreateTaskModalProps) {
  const role = CURRENT_USER.role;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [teamId, setTeamId] = useState(role === 'team_leader' ? (MOCK_TEAMS.find(t => t.leaderId === CURRENT_USER.id)?.id || '') : '');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [tags, setTags] = useState('');
  const [blockedBy, setBlockedBy] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (role === 'agent') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in">
        <div className="bg-white rounded-2xl shadow-modal w-full max-w-md p-8 text-center">
          <Icon name="ShieldExclamationIcon" size={40} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-700 text-slate-700 mb-2">Access Restricted</h3>
          <p className="text-sm text-slate-500 mb-4">Task creation requires Team Leader or Admin access.</p>
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-600 rounded-xl hover:bg-slate-200 transition-colors">Close</button>
        </div>
      </div>
    );
  }

  const availableProjects = role === 'admin'
    ? MOCK_PROJECTS.filter(p => p.status !== 'archived')
    : MOCK_PROJECTS.filter(p => {
        const myTeam = MOCK_TEAMS.find(t => t.leaderId === CURRENT_USER.id);
        return myTeam && p.teamId === myTeam.id && p.status !== 'archived';
      });

  const availableTeams = useMemo(() => {
    if (role === 'team_leader') return MOCK_TEAMS.filter(t => t.leaderId === CURRENT_USER.id);
    if (!projectId) return MOCK_TEAMS;
    const project = MOCK_PROJECTS.find(p => p.id === projectId);
    return project ? MOCK_TEAMS.filter(t => t.id === project.teamId) : MOCK_TEAMS;
  }, [projectId, role]);

  const availableAgents = useMemo(() => {
    if (!teamId) return MOCK_USERS.filter(u => u.role === 'agent');
    const team = MOCK_TEAMS.find(t => t.id === teamId);
    if (!team) return [];
    return MOCK_USERS.filter(u => u.role === 'agent' && team.memberIds.includes(u.id));
  }, [teamId]);

  const availableBlockingTasks = useMemo(() => {
    if (!projectId) return [];
    return MOCK_TASKS.filter(t => t.projectId === projectId);
  }, [projectId]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) errs.title = 'Title must be at least 3 characters';
    if (!projectId) errs.projectId = 'Please select a project';
    if (dueDate && new Date(dueDate) < new Date('2026-04-21')) errs.dueDate = 'Due date cannot be in the past';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      projectId,
      teamId: teamId || undefined,
      assigneeId: assigneeId || undefined,
      reporterId: CURRENT_USER.id,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      attachmentCount: 0,
      commentCount: 0,
      order: 999,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blockedBy: blockedBy ? [blockedBy] : undefined,
    };

    onTaskCreated(newTask);
    toast.success('Task created successfully');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center">
              <Icon name="PlusIcon" size={16} className="text-brand-orange" />
            </div>
            <h2 className="text-base font-700 text-slate-800">Create New Task</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <Icon name="XMarkIcon" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-600 text-slate-700 mb-1.5">Title <span className="text-red-500">*</span></label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all ${errors.title ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-600 text-slate-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the task..."
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange resize-none scrollbar-thin transition-all"
            />
          </div>

          {/* Project */}
          <div>
            <label className="block text-xs font-600 text-slate-700 mb-1.5">Project <span className="text-red-500">*</span></label>
            <select
              value={projectId}
              onChange={e => { setProjectId(e.target.value); setTeamId(''); setAssigneeId(''); }}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all ${errors.projectId ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
            >
              <option value="">Select a project...</option>
              {availableProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.projectId && <p className="text-red-500 text-xs mt-1">{errors.projectId}</p>}
          </div>

          {/* Team (admin only) */}
          {role === 'admin' && (
            <div>
              <label className="block text-xs font-600 text-slate-700 mb-1.5">Assign to Team</label>
              <select
                value={teamId}
                onChange={e => { setTeamId(e.target.value); setAssigneeId(''); }}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
              >
                <option value="">Select a team...</option>
                {availableTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}

          {/* Assign to Agent */}
          <div>
            <label className="block text-xs font-600 text-slate-700 mb-1.5">Assign to Agent</label>
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
            >
              <option value="">Unassigned</option>
              {availableAgents.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          {/* Priority + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-slate-700 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Task['priority'])}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-slate-700 mb-1.5">Initial Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
              >
                {role === 'admin' && <option value="backlog">Backlog</option>}
                <option value="todo">To Do</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-600 text-slate-700 mb-1.5">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all ${errors.dueDate ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
            />
            {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-600 text-slate-700 mb-1.5">Tags <span className="text-slate-400 font-400">(comma-separated)</span></label>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="design, frontend, urgent..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
            />
          </div>

          {/* Blocked by */}
          {projectId && availableBlockingTasks.length > 0 && (
            <div>
              <label className="block text-xs font-600 text-slate-700 mb-1.5">Blocked by task</label>
              <select
                value={blockedBy}
                onChange={e => setBlockedBy(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
              >
                <option value="">None</option>
                {availableBlockingTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
              {blockedBy && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Icon name="LockClosedIcon" size={11} />
                  This task will be locked until the blocking task is approved
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-brand-orange text-white text-sm font-600 rounded-xl hover:bg-brand-orange-dark transition-colors active:scale-[0.98]"
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-sm font-600 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
