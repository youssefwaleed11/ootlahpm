'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

interface Task {
  id: string;
  title: string;
  project: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'in_review' | 'completed';
  dueDate: string;
  department: string;
}

export default function MyTasksPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const tasks: Task[] = [
    {
      id: '1',
      title: 'Review Q2 Marketing Strategy',
      project: 'Marketing Campaign Q2',
      priority: 'high',
      status: 'in_progress',
      dueDate: '2024-04-25',
      department: 'marketing',
    },
    {
      id: '2',
      title: 'Create Blog Post on SEO Best Practices',
      project: 'Content Strategy 2024',
      priority: 'medium',
      status: 'todo',
      dueDate: '2024-04-28',
      department: 'content',
    },
    {
      id: '3',
      title: 'Analyze Competitor Keywords',
      project: 'SEO Optimization',
      priority: 'high',
      status: 'in_progress',
      dueDate: '2024-04-23',
      department: 'seo',
    },
    {
      id: '4',
      title: 'Design Social Media Graphics',
      project: 'Social Media Campaign',
      priority: 'medium',
      status: 'in_review',
      dueDate: '2024-04-26',
      department: 'designers',
    },
    {
      id: '5',
      title: 'Client Meeting Preparation',
      project: 'Client A - Brand Refresh',
      priority: 'critical',
      status: 'todo',
      dueDate: '2024-04-22',
      department: 'bd',
    },
    {
      id: '6',
      title: 'Instagram Content Calendar',
      project: 'Social Strategy Q2',
      priority: 'low',
      status: 'completed',
      dueDate: '2024-04-20',
      department: 'social-media',
    },
  ];

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'in_review':
        return 'bg-blue-50 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <AppLayout currentPath="/my-tasks">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-800 text-slate-900 mb-2">My Tasks</h1>
            <p className="text-slate-600">{filteredTasks.length} tasks assigned to you</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-600 transition-colors">
            <Icon name="PlusIcon" size={18} />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-600 text-slate-900 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-600 text-slate-900 mb-2">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className={`rounded-lg border p-4 transition-all hover:shadow-md cursor-pointer ${getStatusColor(task.status)}`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  className="w-5 h-5 mt-0.5 rounded accent-red-600"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className={`font-700 text-slate-900 ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                      {task.title}
                    </h3>
                    <span className={`text-xs font-600 px-2 py-1 rounded border whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{task.project}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Icon name="CalendarIcon" size={14} />
                      {new Date(task.dueDate).toLocaleDateString()}
                      {isOverdue(task.dueDate) && task.status !== 'completed' && (
                        <Icon name="ExclamationTriangleIcon" size={14} className="text-red-600 ml-1" />
                      )}
                    </span>
                    <span className={`px-2 py-0.5 bg-slate-200 rounded text-slate-700 font-600`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <button className="p-2 rounded hover:bg-white/50 transition-colors flex-shrink-0">
                  <Icon name="ChevronRightIcon" size={18} className="text-slate-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <Icon name="CheckCircleIcon" size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-700 text-slate-600 mb-1">No tasks found</h3>
            <p className="text-slate-500">Create a new task to get started</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
