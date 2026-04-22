'use client';

import React from 'react';
import { MOCK_TEAMS, MOCK_PROJECTS, MOCK_TASKS, CURRENT_USER } from '@/lib/mockData';
import Icon from '@/components/ui/AppIcon';

export default function ReportingPage() {
  if (CURRENT_USER.role === 'agent') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Icon name="LockClosedIcon" size={48} className="text-slate-400 mb-3" />
        <h1 className="text-xl font-700 text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-500">Only Team Leaders and Admins can view reports.</p>
      </div>
    );
  }

  // Get relevant projects based on role
  const relevantProjects = CURRENT_USER.role === 'admin'
    ? MOCK_PROJECTS
    : MOCK_PROJECTS.filter(p => p.teamId === CURRENT_USER.teamId);

  // Calculate metrics
  const totalProjects = relevantProjects.length;
  const activeProjects = relevantProjects.filter(p => p.status === 'active').length;
  const totalTasks = relevantProjects.reduce((sum, p) => sum + p.taskCount, 0);
  const completedTasks = relevantProjects.reduce((sum, p) => sum + p.completedTaskCount, 0);
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overallBudgetUtilization = 72; // Mock value

  // High priority tasks
  const highPriorityTasks = MOCK_TASKS.filter(t => t.priority === 'critical' && !relevantProjects.find(p => p.id === t.projectId));

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-800 text-slate-900 mb-1">Reporting</h1>
          <p className="text-sm text-slate-600">Performance and financial metrics</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
              <p className="text-xs font-600 text-slate-600 uppercase mb-2">Total Projects</p>
              <p className="text-3xl font-800 text-slate-900 mb-2">{totalProjects}</p>
              <p className="text-xs text-slate-500">{activeProjects} active</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
              <p className="text-xs font-600 text-slate-600 uppercase mb-2">Overall Progress</p>
              <p className="text-3xl font-800 text-slate-900 mb-2">{overallProgress}%</p>
              <p className="text-xs text-slate-500">{completedTasks}/{totalTasks} tasks</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
              <p className="text-xs font-600 text-slate-600 uppercase mb-2">Team Members</p>
              <p className="text-3xl font-800 text-slate-900 mb-2">
                {CURRENT_USER.role === 'admin'
                  ? MOCK_TEAMS.reduce((sum, t) => sum + t.memberIds.length, 0)
                  : MOCK_TEAMS.find(t => t.id === CURRENT_USER.teamId)?.memberIds.length || 0}
              </p>
              <p className="text-xs text-slate-500">Active contributors</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
              <p className="text-xs font-600 text-slate-600 uppercase mb-2">Budget Utilization</p>
              <p className="text-3xl font-800 text-slate-900 mb-2">{overallBudgetUtilization}%</p>
              <p className="text-xs text-slate-500">Within budget</p>
            </div>
          </div>

          {/* Performance by Project */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
            <h2 className="text-lg font-700 text-slate-900 mb-4">Performance by Project</h2>
            <div className="space-y-3">
              {relevantProjects.map(project => (
                <div key={project.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-600 text-slate-900 truncate">{project.name}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {project.completedTaskCount}/{project.taskCount} tasks completed
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-2xl font-800 text-slate-900">
                      {project.taskCount > 0 ? Math.round((project.completedTaskCount / project.taskCount) * 100) : 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Performance */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
            <h2 className="text-lg font-700 text-slate-900 mb-4">Team Performance</h2>
            <div className="space-y-4">
              {(CURRENT_USER.role === 'admin' ? MOCK_TEAMS : MOCK_TEAMS.filter(t => t.id === CURRENT_USER.teamId)).map(team => {
                const teamProjects = MOCK_PROJECTS.filter(p => p.teamId === team.id);
                const teamTasks = teamProjects.reduce((sum, p) => sum + p.taskCount, 0);
                const teamCompletedTasks = teamProjects.reduce((sum, p) => sum + p.completedTaskCount, 0);
                const teamProgress = teamTasks > 0 ? Math.round((teamCompletedTasks / teamTasks) * 100) : 0;

                return (
                  <div key={team.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: team.color }}
                        >
                          <Icon name="UserGroupIcon" size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-600 text-slate-900">{team.name}</p>
                          <p className="text-xs text-slate-600">{team.memberIds.length} members • {teamProjects.length} projects</p>
                        </div>
                      </div>
                      <p className="text-2xl font-800 text-slate-900">{teamProgress}%</p>
                    </div>
                    <div className="w-full bg-slate-300 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${teamProgress}%`, backgroundColor: team.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Tasks Alert */}
          {highPriorityTasks.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Icon name="ExclamationTriangleIcon" size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-700 text-red-900 mb-2">Critical Tasks Requiring Attention</h3>
                  <p className="text-sm text-red-700 mb-3">{highPriorityTasks.length} critical priority tasks need review</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
