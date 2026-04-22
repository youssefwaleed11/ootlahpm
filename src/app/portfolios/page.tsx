'use client';

import React from 'react';
import { MOCK_TEAMS, MOCK_PROJECTS, CURRENT_USER } from '@/lib/mockData';
import Icon from '@/components/ui/AppIcon';

export default function PortfoliosPage() {
  if (CURRENT_USER.role === 'agent') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Icon name="LockClosedIcon" size={48} className="text-slate-400 mb-3" />
        <h1 className="text-xl font-700 text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-500">Only Team Leaders and Admins can view portfolios.</p>
      </div>
    );
  }

  // Filter teams based on user role
  const visibleTeams = CURRENT_USER.role === 'admin' 
    ? MOCK_TEAMS 
    : MOCK_TEAMS.filter(t => t.leaderId === CURRENT_USER.id);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-800 text-slate-900 mb-1">Portfolios</h1>
          <p className="text-sm text-slate-600">Team project portfolios and performance overview</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visibleTeams.map(team => {
              const teamProjects = MOCK_PROJECTS.filter(p => team.projectIds.includes(p.id));
              const completedTasks = teamProjects.reduce((sum, p) => sum + p.completedTaskCount, 0);
              const totalTasks = teamProjects.reduce((sum, p) => sum + p.taskCount, 0);
              const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

              return (
                <div key={team.id} className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-slate-200" style={{ backgroundColor: team.color + '10' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-700 text-slate-900">{team.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">{teamProjects.length} projects</p>
                      </div>
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: team.color }}
                      >
                        <Icon name="FolderIcon" size={24} className="text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-6 border-b border-slate-200 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 font-600 mb-1">Completion Rate</p>
                      <p className="text-2xl font-800 text-slate-900">{completionRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-600 mb-1">Tasks</p>
                      <p className="text-2xl font-800 text-slate-900">{completedTasks}/{totalTasks}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="px-6 py-4">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${completionRate}%`, backgroundColor: team.color }}
                      />
                    </div>
                  </div>

                  {/* Projects List */}
                  <div className="p-6 space-y-3">
                    <p className="text-xs font-600 text-slate-700 uppercase">Projects</p>
                    {teamProjects.length > 0 ? (
                      teamProjects.map(project => (
                        <div key={project.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-500 text-slate-900 truncate">{project.name}</p>
                            <p className="text-xs text-slate-600">
                              {project.completedTaskCount}/{project.taskCount} tasks
                            </p>
                          </div>
                          <div className="ml-2">
                            <span className={`text-xs font-600 px-2 py-1 rounded-full ${
                              project.status === 'active' ? 'bg-green-100 text-green-700' :
                              project.status === 'on_hold' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {project.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">No projects yet</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {visibleTeams.length === 0 && (
            <div className="text-center py-12">
              <Icon name="FolderIcon" size={48} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-500">No portfolios available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
