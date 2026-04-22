'use client';

import React, { useMemo } from 'react';
import { CURRENT_USER, MOCK_PROJECTS, MOCK_TASKS, MOCK_USERS } from '@/lib/mockData';
import StatCard from './StatCard';
import Icon from '@/components/ui/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AgentDashboard() {
  const myTasks = useMemo(() => {
    return MOCK_TASKS.filter(t => t.assigneeId === CURRENT_USER.id);
  }, []);

  const stats = useMemo(() => {
    const total = myTasks.length;
    const overdue = myTasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      return dueDate < new Date() && t.status !== 'done';
    }).length;
    const completed = myTasks.filter(t => t.status === 'done').length;
    const inProgress = myTasks.filter(t => t.status === 'in_progress').length;

    return { total, overdue, completed, inProgress };
  }, []);

  const tasksToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return myTasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate <= today && t.status !== 'done';
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, []);

  const myProjects = useMemo(() => {
    const projectIds = new Set(myTasks.map(t => t.projectId));
    return Array.from(projectIds).map(id => {
      const project = MOCK_PROJECTS.find(p => p.id === id);
      const projectTasks = myTasks.filter(t => t.projectId === id);
      return { project, taskCount: projectTasks.length };
    }).filter(p => p.project);
  }, []);

  const weeklyProgress = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      const completed = myTasks.filter(t => {
        const taskDate = new Date(t.updatedAt);
        taskDate.setHours(0, 0, 0, 0);
        return t.status === 'done' && taskDate.getTime() === date.getTime();
      }).length;
      data.push({ day: dayName, completed });
    }
    return data;
  }, []);

  return (
    <div className="w-full bg-brand-background p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {CURRENT_USER.name}. Here&apos;s your task overview.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="My Tasks"
          value={stats.total}
          icon="ClipboardDocumentListIcon"
          color="brand-orange"
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          icon="ExclamationTriangleIcon"
          color="red-500"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon="ArrowPathIcon"
          color="blue-500"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon="CheckCircleIcon"
          color="green-500"
        />
      </div>

      {/* My Tasks Today */}
      {tasksToday.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Tasks Due Today or Overdue</h2>
          <div className="space-y-3">
            {tasksToday.map(task => {
              const project = MOCK_PROJECTS.find(p => p.id === task.projectId);
              const dueDate = new Date(task.dueDate);
              const isOverdue = dueDate < new Date();
              return (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                  <div className={`w-1 h-12 rounded flex-shrink-0 ${isOverdue ? 'bg-red-500' : 'bg-brand-orange'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{project?.name}</p>
                    <p className={`text-xs mt-1 ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-brand-orange'}`}>
                      {isOverdue ? `Overdue by ${Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} days` : `Due: ${dueDate.toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <button className="px-3 py-1.5 bg-brand-orange text-white rounded text-sm font-medium hover:bg-opacity-90 transition-colors">
                      Start
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Projects */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">My Projects</h2>
          {myProjects.length > 0 ? (
            <div className="space-y-3">
              {myProjects.map(({ project, taskCount }) => (
                <div key={project?.id} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{project?.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{taskCount} tasks assigned</p>
                    </div>
                    <Icon name="ChevronRightIcon" size={16} className="text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6">No projects assigned yet</p>
          )}
        </div>

        {/* Personal Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Weekly Progress</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#ff6b35" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
