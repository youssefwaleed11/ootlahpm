'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { useTasks, Task } from '@/hooks/useTasks';
import { TaskPanel } from '@/components/TaskPanel';

export default function MyTasksPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
  });

  const { tasks, isLoading, error, createTask } = useTasks();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  // Show all demo tasks - filter by user if logged in, otherwise show all
  const myTasks = user ? tasks.filter((t) => t.assigned_to?.id === user?.id) : tasks;

  const filteredTasks = myTasks.filter((task) => {
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-600 transition-colors"
          >
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

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your tasks...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}

        {/* Tasks List */}
        {!isLoading && !error && (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`w-full text-left rounded-lg border p-4 transition-all hover:shadow-md ${getStatusColor(task.status)}`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    readOnly
                    className="w-5 h-5 mt-0.5 rounded accent-red-600"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3
                        className={`font-700 text-slate-900 ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}
                      >
                        {task.title}
                      </h3>
                      <span
                        className={`text-xs font-600 px-2 py-1 rounded border whitespace-nowrap ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      {task.project?.name || 'Untitled'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Icon name="CalendarIcon" size={14} />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 bg-slate-200 rounded text-slate-700 font-600`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-2 rounded flex-shrink-0">
                    <Icon name="ChevronRightIcon" size={18} className="text-slate-600" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Task Panel */}
        <TaskPanel task={selectedTask} onClose={() => setSelectedTask(null)} />

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <Icon name="CheckCircleIcon" size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-700 text-slate-600 mb-1">No tasks found</h3>
            <p className="text-slate-500">Create a new task to get started</p>
          </div>
        )}

        {/* Create Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-700 text-slate-900 mb-4">Create New Task</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-600 text-slate-900 mb-2">Task Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="e.g., Review marketing strategy"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-600 text-slate-900 mb-2">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Task details..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-600 text-slate-900 mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (newTask.title.trim()) {
                      try {
                        await createTask({
                          title: newTask.title,
                          description: newTask.description,
                          priority: newTask.priority,
                          status: 'todo',
                          project: { name: 'My Project' },
                        });
                        setNewTask({ title: '', description: '', priority: 'medium' });
                        setShowCreateModal(false);
                      } catch (err) {
                        console.error('[v0] Error creating task:', err);
                      }
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-600 hover:bg-red-700 transition-colors"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
