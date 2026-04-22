'use client';

import React, { useMemo, useState } from 'react';
import { CURRENT_USER, MOCK_TASKS, MOCK_PROJECTS, MOCK_USERS } from '@/lib/mockData';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';

interface PendingTask {
  taskId: string;
  title: string;
  projectName: string;
  projectColor: string;
  assigneeName: string;
  assigneeAvatar: string;
  priority: string;
  submittedDate: string;
  daysWaiting: number;
}

export default function ApprovalQueueContent() {
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>(() => {
    const tasks = MOCK_TASKS.filter(t => t.status === 'in_review' && (
      CURRENT_USER.role === 'admin' || t.teamId === CURRENT_USER.teamId
    ));

    return tasks.map(task => {
      const project = MOCK_PROJECTS.find(p => p.id === task.projectId);
      const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
      const submittedDate = new Date(task.updatedAt);
      const daysWaiting = Math.floor((Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        taskId: task.id,
        title: task.title,
        projectName: project?.name || 'Unknown Project',
        projectColor: project?.tags[0] || 'bg-blue-500',
        assigneeName: assignee?.name || 'Unassigned',
        assigneeAvatar: assignee?.avatar || '?',
        priority: task.priority,
        submittedDate: submittedDate.toLocaleDateString(),
        daysWaiting,
      };
    });
  });

  const [filters, setFilters] = useState({
    project: 'all',
    assignee: 'all',
    priority: 'all',
  });

  const filteredTasks = useMemo(() => {
    return pendingTasks.filter(task => {
      if (filters.project !== 'all' && task.projectName !== filters.project) return false;
      if (filters.assignee !== 'all' && task.assigneeName !== filters.assignee) return false;
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      return true;
    });
  }, [pendingTasks, filters]);

  const projectNames = useMemo(() => [...new Set(pendingTasks.map(t => t.projectName))], [pendingTasks]);
  const assigneeNames = useMemo(() => [...new Set(pendingTasks.map(t => t.assigneeName))], [pendingTasks]);

  const handleApprove = (taskId: string) => {
    setPendingTasks(prev => prev.filter(t => t.taskId !== taskId));
    toast.success('Task approved and marked as done');
  };

  const handleRequestChanges = (taskId: string) => {
    setPendingTasks(prev => prev.filter(t => t.taskId !== taskId));
    toast.success('Changes requested — agent has been notified');
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-slate-600 bg-slate-100',
      medium: 'text-amber-700 bg-amber-100',
      high: 'text-orange-700 bg-orange-100',
      critical: 'text-red-600 bg-red-100',
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="w-full bg-brand-background p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Approval Queue</h1>
            <p className="text-muted-foreground mt-1">Manage pending task approvals</p>
          </div>
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-foreground">{pendingTasks.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <select
            value={filters.project}
            onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground text-sm"
          >
            <option value="all">All Projects</option>
            {projectNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <select
            value={filters.assignee}
            onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground text-sm"
          >
            <option value="all">All Assignees</option>
            {assigneeNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          {Object.values(filters).some(f => f !== 'all') && (
            <button
              onClick={() => setFilters({ project: 'all', assignee: 'all', priority: 'all' })}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-foreground text-sm hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <div
              key={task.taskId}
              className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Task Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-brand-orange flex-shrink-0" />
                    <h3 className="font-semibold text-foreground">{task.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Project: {task.projectName}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                        {task.assigneeAvatar}
                      </div>
                      <span>{task.assigneeName}</span>
                    </div>
                    <span>Submitted: {task.submittedDate} ({task.daysWaiting} days)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(task.taskId)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600 transition-colors flex items-center gap-1.5"
                  >
                    <Icon name="CheckIcon" size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRequestChanges(task.taskId)}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium text-sm hover:bg-amber-600 transition-colors flex items-center gap-1.5"
                  >
                    <Icon name="ArrowUturnLeftIcon" size={16} />
                    Changes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mb-4">
            <Icon name="CheckCircleIcon" size={32} className="text-brand-orange" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-1">All caught up!</h2>
          <p className="text-muted-foreground">No tasks pending review.</p>
        </div>
      )}
    </div>
  );
}
