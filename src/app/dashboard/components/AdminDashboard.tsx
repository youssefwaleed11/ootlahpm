'use client';

import React, { useMemo } from 'react';
import { MOCK_PROJECTS, MOCK_TASKS, MOCK_USERS, MOCK_TEAMS } from '@/lib/mockData';
import StatCard from './StatCard';
import ProjectOverviewCard from './ProjectOverviewCard';
import Icon from '@/components/ui/AppIcon';

export default function AdminDashboard() {
  const stats = useMemo(() => {
    const totalTasks = MOCK_TASKS.length;
    const overdueTasks = MOCK_TASKS.filter(t => {
      const dueDate = new Date(t.dueDate);
      return dueDate < new Date() && t.status !== 'done';
    }).length;
    const activeProjects = MOCK_PROJECTS.filter(p => p.status === 'active').length;
    const totalMembers = MOCK_USERS.length;

    return { totalTasks, overdueTasks, activeProjects, totalMembers };
  }, []);

  const teamPerformance = useMemo(() => {
    return MOCK_TEAMS.map(team => {
      const teamTasks = MOCK_TASKS.filter(t => t.teamId === team.id);
      const completedTasks = teamTasks.filter(t => t.status === 'done').length;
      const completionRate = teamTasks.length > 0 ? Math.round((completedTasks / teamTasks.length) * 100) : 0;
      return {
        ...team,
        totalTasks: teamTasks.length,
        completedTasks,
        completionRate,
      };
    });
  }, []);

  const recentActivity = useMemo(() => {
    // Mock recent activity - in production this would come from an activity log
    return [
      { id: '1', action: 'Task created', entity: 'Dashboard Redesign', user: 'Layla Al-Rashidi', timestamp: new Date(Date.now() - 1800000) },
      { id: '2', action: 'Task approved', entity: 'Mobile App Navigation', user: 'Omar Khalid', timestamp: new Date(Date.now() - 3600000) },
      { id: '3', action: 'Project started', entity: 'Q2 Platform Upgrade', user: 'Layla Al-Rashidi', timestamp: new Date(Date.now() - 7200000) },
      { id: '4', action: 'Task completed', entity: 'API Documentation', user: 'Tariq Mansour', timestamp: new Date(Date.now() - 10800000) },
      { id: '5', action: 'User invited', entity: 'Marketing Team', user: 'Layla Al-Rashidi', timestamp: new Date(Date.now() - 14400000) },
    ];
  }, []);

  const overdueAlerts = useMemo(() => {
    return MOCK_TASKS.filter(t => {
      const dueDate = new Date(t.dueDate);
      return dueDate < new Date() && t.status !== 'done';
    }).slice(0, 10).map(task => {
      const project = MOCK_PROJECTS.find(p => p.id === task.projectId);
      const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
      const dueDate = new Date(task.dueDate);
      const daysOverdue = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return { task, project, assignee, daysOverdue };
    });
  }, []);

  return (
    <div className="w-full bg-brand-background p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, Layla. Here&apos;s your organization overview.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={stats.totalTasks}
          icon="ClipboardDocumentListIcon"
          color="brand-orange"
        />
        <StatCard
          label="Overdue Tasks"
          value={stats.overdueTasks}
          icon="ExclamationTriangleIcon"
          color="red-500"
        />
        <StatCard
          label="Active Projects"
          value={stats.activeProjects}
          icon="FolderIcon"
          color="blue-500"
        />
        <StatCard
          label="Team Members"
          value={stats.totalMembers}
          icon="UserGroupIcon"
          color="green-500"
        />
      </div>

      {/* Projects Overview */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">All Projects Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_PROJECTS.map(project => (
            <ProjectOverviewCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      {/* Department Performance */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Department Performance</h2>
        <div className="space-y-4">
          {teamPerformance.map(team => (
            <div key={team.id} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-foreground">{team.name}</p>
                <p className="text-sm text-muted-foreground">{team.totalTasks} tasks</p>
              </div>
              <div className="w-40">
                <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-orange rounded-full transition-all"
                    style={{ width: `${team.completionRate}%` }}
                  />
                </div>
              </div>
              <p className="text-sm font-medium text-foreground w-12 text-right">{team.completionRate}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map(activity => (
            <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-slate-700 last:border-0 last:pb-0">
              <div className="w-2 h-2 rounded-full bg-brand-orange mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium text-brand-orange">{activity.entity}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overdue Alerts */}
      {overdueAlerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4">Overdue Alerts</h2>
          <div className="space-y-3">
            {overdueAlerts.map(({ task, project, assignee, daysOverdue }) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{task.title}</p>
                  <p className="text-sm text-muted-foreground">{project?.name}</p>
                  {assignee && (
                    <p className="text-xs text-muted-foreground mt-1">Assigned to {assignee.name}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">{daysOverdue} days overdue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
