'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';
import type { Project } from '@/lib/mockData';

interface ProjectStatsRowProps {
  projects: Project[];
}

export default function ProjectStatsRow({ projects }: ProjectStatsRowProps) {
  const active = projects.filter(p => p.status === 'active').length;
  const onHold = projects.filter(p => p.status === 'on_hold').length;
  const archived = projects.filter(p => p.status === 'archived').length;
  const totalTasks = projects.reduce((sum, p) => sum + p.taskCount, 0);
  const completedTasks = projects.reduce((sum, p) => sum + p.completedTaskCount, 0);
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const criticalProjects = projects.filter(p => p.priority === 'critical' && p.status === 'active').length;

  const stats = [
    {
      id: 'stat-active',
      label: 'Active Projects',
      value: active,
      icon: 'FolderOpenIcon',
      color: 'text-brand-teal',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
      trend: '+2 this month',
      trendUp: true,
    },
    {
      id: 'stat-tasks',
      label: 'Total Tasks',
      value: totalTasks,
      icon: 'ClipboardDocumentListIcon',
      color: 'text-brand-orange',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      trend: `${completedTasks} completed`,
      trendUp: true,
    },
    {
      id: 'stat-progress',
      label: 'Avg. Completion',
      value: `${overallProgress}%`,
      icon: 'ChartBarIcon',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      trend: 'Across all projects',
      trendUp: overallProgress >= 50,
    },
    {
      id: 'stat-critical',
      label: 'Critical Priority',
      value: criticalProjects,
      icon: 'ExclamationTriangleIcon',
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
      trend: criticalProjects > 0 ? 'Needs attention' : 'All clear',
      trendUp: criticalProjects === 0,
    },
    {
      id: 'stat-hold',
      label: 'On Hold',
      value: onHold,
      icon: 'PauseCircleIcon',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      trend: `${archived} archived`,
      trendUp: onHold === 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map(stat => (
        <div key={stat.id} className={`bg-white rounded-xl border ${stat.border} shadow-card p-4`}>
          <div className="flex items-start justify-between mb-3">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <Icon name={stat.icon as Parameters<typeof Icon>[0]['name']} size={18} className={stat.color} />
            </div>
          </div>
          <p className="text-2xl font-700 text-slate-800 font-tabular">{stat.value}</p>
          <p className="text-xs font-600 text-slate-500 mt-0.5">{stat.label}</p>
          <p className={`text-[10px] font-500 mt-1.5 ${stat.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
            {stat.trend}
          </p>
        </div>
      ))}
    </div>
  );
}