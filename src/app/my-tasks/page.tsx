'use client';

import React, { useState } from 'react';
import { MOCK_TASKS, CURRENT_USER, getProjectById, getUserById } from '@/lib/mockData';
import Icon from '@/components/ui/AppIcon';

export default function MyTasksPage() {
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'done'>('all');

  // Filter tasks assigned to current user
  const userTasks = MOCK_TASKS.filter(task => task.assigneeId === CURRENT_USER.id);

  // Apply status filter
  let filteredTasks = userTasks;
  if (filter === 'done') {
    filteredTasks = userTasks.filter(t => t.status === 'done');
  } else if (filter === 'overdue') {
    const today = new Date();
    filteredTasks = userTasks.filter(t => new Date(t.dueDate) < today && t.status !== 'done');
  } else if (filter === 'today') {
    const today = new Date().toISOString().split('T')[0];
    filteredTasks = userTasks.filter(t => t.dueDate.startsWith(today) && t.status !== 'done');
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-slate-100 text-slate-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'in_review': return 'bg-amber-100 text-amber-700';
      case 'done': return 'bg-green-100 text-green-700';
      case 'backlog': return 'bg-gray-100 text-gray-700';
      case 'changes_requested': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-green-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-800 text-slate-900 mb-4">My Tasks</h1>
          
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'today', 'overdue', 'done'] as const).map(f => (
              <button
                key={`filter-${f}`}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-600 text-sm transition-colors ${
                  filter === f
                    ? 'bg-brand-orange text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.map(task => {
                const project = getProjectById(task.projectId);
                return (
                  <div
                    key={task.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-lg transition-shadow p-4 cursor-pointer hover:border-brand-orange/30"
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={task.status === 'done'}
                        className="w-5 h-5 rounded border-slate-300 mt-1 cursor-pointer"
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-600 text-slate-900 flex-1 ${task.status === 'done' ? 'line-through text-slate-500' : ''}`}>
                            {task.title}
                          </h3>
                          <span className={`text-xs font-600 px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>

                        {/* Task Meta */}
                        <div className="flex items-center gap-4 flex-wrap text-xs">
                          {project && (
                            <span className="text-slate-600">
                              <Icon name="FolderIcon" size={14} className="inline mr-1" />
                              {project.name}
                            </span>
                          )}

                          <span className={`font-600 ${getPriorityColor(task.priority)}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>

                          <span className="text-slate-600">
                            <Icon name="CalendarIcon" size={14} className="inline mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>

                          {task.commentCount > 0 && (
                            <span className="text-slate-600">
                              <Icon name="ChatBubbleLeftIcon" size={14} className="inline mr-1" />
                              {task.commentCount}
                            </span>
                          )}

                          {task.attachmentCount > 0 && (
                            <span className="text-slate-600">
                              <Icon name="PaperClipIcon" size={14} className="inline mr-1" />
                              {task.attachmentCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Priority Indicator */}
                      <div className={`w-1 h-full rounded-r-xl ${getPriorityColor(task.priority).replace('text-', 'bg-')}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="CheckCircleIcon" size={48} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-500">No tasks in this view</p>
              <p className="text-sm text-slate-500 mt-1">Great job! All caught up.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
