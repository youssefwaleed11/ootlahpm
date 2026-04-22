'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

interface Project {
  id: string;
  name: string;
  client: string;
  department: string;
  status: 'active' | 'completed' | 'on_hold';
  completion: number;
  tasksTotal: number;
  tasksCompleted: number;
  teamSize: number;
  startDate: string;
  endDate: string;
}

export default function MyProjectsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const projects: Project[] = [
    {
      id: '1',
      name: 'Q2 Marketing Campaign',
      client: 'TechStore Inc',
      department: 'marketing',
      status: 'active',
      completion: 65,
      tasksTotal: 28,
      tasksCompleted: 18,
      teamSize: 4,
      startDate: '2024-04-01',
      endDate: '2024-06-30',
    },
    {
      id: '2',
      name: 'Website SEO Optimization',
      client: 'Digital Agency',
      department: 'seo',
      status: 'active',
      completion: 45,
      tasksTotal: 22,
      tasksCompleted: 10,
      teamSize: 3,
      startDate: '2024-04-10',
      endDate: '2024-07-15',
    },
    {
      id: '3',
      name: 'Content Calendar 2024',
      client: 'Internal',
      department: 'content',
      status: 'active',
      completion: 80,
      tasksTotal: 30,
      tasksCompleted: 24,
      teamSize: 3,
      startDate: '2024-01-15',
      endDate: '2024-12-31',
    },
    {
      id: '4',
      name: 'Brand Refresh Project',
      client: 'Premium Client',
      department: 'designers',
      status: 'on_hold',
      completion: 30,
      tasksTotal: 15,
      tasksCompleted: 5,
      teamSize: 2,
      startDate: '2024-04-15',
      endDate: '2024-08-30',
    },
  ];

  const filteredProjects = filterStatus === 'all'
    ? projects
    : projects.filter(p => p.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'active':
        return 'bg-blue-50 border-blue-200';
      case 'on_hold':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      'marketing': 'text-red-600',
      'seo': 'text-orange-600',
      'content': 'text-yellow-600',
      'designers': 'text-blue-600',
      'bd': 'text-green-600',
      'social-media': 'text-purple-600',
    };
    return colors[dept] || 'text-slate-600';
  };

  return (
    <AppLayout currentPath="/my-projects">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-800 text-slate-900 mb-2">My Projects</h1>
            <p className="text-slate-600">Projects you&apos;re working on</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-600 transition-colors">
            <Icon name="PlusIcon" size={18} />
            New Project
          </button>
        </div>

        {/* Filter */}
        <div className="w-full md:w-64">
          <label className="block text-sm font-600 text-slate-900 mb-2">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Projects</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className={`rounded-xl border p-6 transition-all hover:shadow-lg cursor-pointer ${getStatusColor(project.status)}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-700 text-slate-900 mb-1">{project.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">{project.client}</p>
                  <p className={`text-xs font-600 ${getDepartmentColor(project.department)}`}>
                    {project.department.toUpperCase()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-600 whitespace-nowrap ${getStatusBadgeColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              {/* Tasks Progress */}
              <div className="mb-4 p-3 bg-white/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-600 text-slate-700">Tasks</span>
                  <span className="text-sm font-700 text-slate-900">
                    {project.tasksCompleted}/{project.tasksTotal}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all"
                    style={{ width: `${(project.tasksCompleted / project.tasksTotal) * 100}%` }}
                  />
                </div>
              </div>

              {/* Overall Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-600 text-slate-700">Overall Progress</span>
                  <span className="text-sm font-700 text-slate-900">{project.completion}%</span>
                </div>
                <div className="w-full h-3 bg-slate-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
                    style={{ width: `${project.completion}%` }}
                  />
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-white/30">
                <div className="flex items-center gap-1">
                  <Icon name="UserGroupIcon" size={14} />
                  <span>{project.teamSize} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="CalendarIcon" size={14} />
                  <span>{new Date(project.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Icon name="FolderOpenIcon" size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-700 text-slate-600 mb-1">No projects found</h3>
            <p className="text-slate-500">Create a new project to get started</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
