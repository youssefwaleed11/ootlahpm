'use client';

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CURRENT_USER, MOCK_TEAMS, MOCK_USERS, MOCK_PROJECTS } from '@/lib/mockData';
import Icon from '@/components/ui/AppIcon';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreate?: (task: any) => void;
}

interface TaskFormData {
  title: string;
  description: string;
  projectId: string;
  teamId: string;
  assigneeId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  status: 'backlog' | 'todo';
  tags: string;
  blockedBy: string;
}

export default function CreateTaskModal({ isOpen, onClose, onTaskCreate }: CreateTaskModalProps) {
  const { register, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm<TaskFormData>({
    defaultValues: {
      priority: 'medium',
      status: 'todo',
      teamId: CURRENT_USER.teamId,
    },
  });

  const selectedProjectId = watch('projectId');
  const selectedTeamId = watch('teamId');
  const isAgent = CURRENT_USER.role === 'agent';

  // Available projects
  const availableProjects = useMemo(() => {
    if (CURRENT_USER.role === 'admin') return MOCK_PROJECTS;
    return MOCK_PROJECTS.filter(p => p.teamId === CURRENT_USER.teamId);
  }, []);

  // Filter teams based on selected project
  const availableTeams = useMemo(() => {
    if (CURRENT_USER.role === 'admin') {
      if (selectedProjectId) {
        const project = MOCK_PROJECTS.find(p => p.id === selectedProjectId);
        return MOCK_TEAMS.filter(t => t.id === project?.teamId);
      }
      return MOCK_TEAMS;
    }
    return [MOCK_TEAMS.find(t => t.id === CURRENT_USER.teamId)].filter(Boolean);
  }, [selectedProjectId]);

  // Filter team members based on selected team
  const availableAgents = useMemo(() => {
    return MOCK_USERS.filter(u => 
      u.teamId === (selectedTeamId || CURRENT_USER.teamId) && u.role === 'agent'
    );
  }, [selectedTeamId]);

  const onSubmit = (data: TaskFormData) => {
    // Validation
    if (!data.title || data.title.length < 3) {
      toast.error('Task title must be at least 3 characters');
      return;
    }
    if (new Date(data.dueDate) < new Date()) {
      toast.error('Due date cannot be in the past');
      return;
    }

    const newTask = {
      id: `task-${Date.now()}`,
      title: data.title,
      description: data.description,
      projectId: data.projectId,
      teamId: data.teamId || CURRENT_USER.teamId,
      assigneeId: data.assigneeId,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
      reporterId: CURRENT_USER.id,
      startDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commentCount: 0,
      attachmentCount: 0,
      order: 0,
    };

    onTaskCreate?.(newTask);
    toast.success('Task created successfully');
    reset();
    onClose();
  };

  if (isAgent) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
          <div className="text-center py-8">
            <Icon name="LockClosedIcon" size={48} className="mx-auto mb-4 text-slate-400" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Task Creation Restricted</h2>
            <p className="text-muted-foreground">Task creation requires Team Leader or Admin access. Contact your team leader to create a task.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <input
              type="text"
              {...register('title', { required: true, minLength: 3 })}
              placeholder="Task title"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground placeholder-muted-foreground"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">Title is required (min 3 chars)</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              {...register('description')}
              placeholder="Task description"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground placeholder-muted-foreground resize-none"
            />
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Project *</label>
            <select
              {...register('projectId', { required: true })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground"
            >
              <option value="">Select a project</option>
              {availableProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Team - Only for Admin */}
            {CURRENT_USER.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Assign to Team</label>
                <select
                  {...register('teamId')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground"
                >
                  {availableTeams.map(t => (
                    <option key={t?.id} value={t?.id}>{t?.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Assign to Agent</label>
              <select
                {...register('assigneeId')}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground"
              >
                <option value="">Unassigned</option>
                {availableAgents.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Due Date</label>
              <input
                type="date"
                {...register('dueDate', { required: true })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground"
              />
            </div>
          </div>

          {/* Status - Only for Admin */}
          {CURRENT_USER.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Initial Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
              </select>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              {...register('tags')}
              placeholder="feature, bug, urgent"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground placeholder-muted-foreground"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-foreground font-medium hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-brand-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
