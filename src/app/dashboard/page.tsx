'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { CURRENT_USER } from '@/lib/mockData';
import Icon from '@/components/ui/AppIcon';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByDepartment: Record<string, number>;
}

interface DepartmentStats {
  id: string;
  name: string;
  color: string;
  tasksCount: number;
  onTimeRate: number;
  teamMembers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 124,
    completedTasks: 87,
    overdueTasks: 5,
    tasksByStatus: {
      todo: 22,
      in_progress: 15,
      in_review: 8,
      completed: 87,
    },
    tasksByDepartment: {
      'marketing': 28,
      'seo': 22,
      'content': 20,
      'bd': 18,
      'designers': 20,
      'social-media': 16,
    },
  });

  const [departmentStats] = useState<DepartmentStats[]>([
    { id: '1', name: 'Marketing', color: '#EF4444', tasksCount: 28, onTimeRate: 92, teamMembers: 4 },
    { id: '2', name: 'SEO', color: '#F97316', tasksCount: 22, onTimeRate: 88, teamMembers: 3 },
    { id: '3', name: 'Content', color: '#EAB308', tasksCount: 20, onTimeRate: 95, teamMembers: 5 },
    { id: '4', name: 'BD', color: '#10B981', tasksCount: 18, onTimeRate: 85, teamMembers: 2 },
    { id: '5', name: 'Designers', color: '#3B82F6', tasksCount: 20, onTimeRate: 90, teamMembers: 3 },
    { id: '6', name: 'Social Media', color: '#8B5CF6', tasksCount: 16, onTimeRate: 89, teamMembers: 2 },
  ]);

  const completionRate = Math.round((stats.completedTasks / stats.totalTasks) * 100);
  const overallHealth = stats.overdueTasks === 0 ? 'Excellent' : stats.overdueTasks <= 3 ? 'Good' : 'Needs Attention';

  return (
    <AppLayout currentPath="/dashboard">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-800 text-slate-900 mb-2">Global Dashboard</h1>
          <p className="text-slate-600">Complete company overview and department performance metrics</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Tasks */}
          <MetricCard
            label="Total Tasks"
            value={stats.totalTasks}
            icon="CheckCircleIcon"
            color="bg-blue-50"
            trend="+12 this week"
          />

          {/* Completed */}
          <MetricCard
            label="Completed"
            value={stats.completedTasks}
            icon="CheckIcon"
            color="bg-green-50"
            subtext={`${completionRate}% completion rate`}
          />

          {/* Overdue */}
          <MetricCard
            label="Overdue Tasks"
            value={stats.overdueTasks}
            icon="ExclamationTriangleIcon"
            color={stats.overdueTasks > 0 ? 'bg-red-50' : 'bg-green-50'}
            trend="Needs attention"
          />

          {/* Company Health */}
          <MetricCard
            label="Overall Health"
            value={overallHealth}
            icon="SparklesIcon"
            color="bg-purple-50"
            valueClass="text-lg font-600 text-purple-700"
          />
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-700 text-slate-900 mb-4">Tasks by Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.tasksByStatus).map(([status, count]) => (
              <div key={status} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-600 text-slate-600 uppercase mb-1">
                  {status.replace('_', ' ')}
                </p>
                <p className="text-2xl font-800 text-slate-900">{count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Departments Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-700 text-slate-900 mb-4">Department Performance</h2>
          <div className="space-y-3">
            {departmentStats.map((dept) => (
              <div key={dept.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: dept.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-600 text-slate-900 text-sm">{dept.name}</h3>
                    <p className="text-xs text-slate-600">{dept.teamMembers} team members</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-lg font-700 text-slate-900">{dept.tasksCount}</p>
                    <p className="text-xs text-slate-600">tasks</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${dept.onTimeRate}%` }}
                      />
                    </div>
                    <span className="text-xs font-600 text-slate-600 ml-1">{dept.onTimeRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 p-6">
          <h2 className="text-lg font-700 text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-colors">
              <Icon name="PlusIcon" size={18} className="text-red-600" />
              <span className="text-sm font-600 text-slate-900">Create Project</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-colors">
              <Icon name="CheckCircleIcon" size={18} className="text-red-600" />
              <span className="text-sm font-600 text-slate-900">Assign Task</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-colors">
              <Icon name="UserGroupIcon" size={18} className="text-red-600" />
              <span className="text-sm font-600 text-slate-900">Add Team Member</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: string;
  subtext?: string;
  valueClass?: string;
}

function MetricCard({ label, value, icon, color, trend, subtext, valueClass }: MetricCardProps) {
  return (
    <div className={`${color} rounded-xl border border-slate-200 p-4`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-600 text-slate-600 uppercase">{label}</p>
        <Icon name={icon as Parameters<typeof Icon>[0]['name']} size={18} className="text-slate-600" />
      </div>
      <p className={valueClass || 'text-3xl font-800 text-slate-900'}>{value}</p>
      {subtext && <p className="text-xs text-slate-600 mt-1">{subtext}</p>}
      {trend && <p className="text-xs text-slate-600 mt-2">{trend}</p>}
    </div>
  );
}
