'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

interface PortfolioProject {
  id: string;
  title: string;
  department: string;
  client: string;
  status: 'completed' | 'in_progress' | 'on_hold';
  completion: number;
  tags: string[];
  image?: string;
}

export default function PortfoliosPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const departments = [
    { id: 'all', name: 'All Departments', color: 'bg-slate-100' },
    { id: 'marketing', name: 'Marketing', color: 'bg-red-100' },
    { id: 'seo', name: 'SEO', color: 'bg-orange-100' },
    { id: 'content', name: 'Content', color: 'bg-yellow-100' },
    { id: 'bd', name: 'BD', color: 'bg-green-100' },
    { id: 'designers', name: 'Designers', color: 'bg-blue-100' },
    { id: 'social-media', name: 'Social Media', color: 'bg-purple-100' },
  ];

  const portfolios: PortfolioProject[] = [
    {
      id: '1',
      title: 'E-Commerce Campaign Q1',
      department: 'marketing',
      client: 'TechStore Inc',
      status: 'completed',
      completion: 100,
      tags: ['paid-ads', 'content', 'analytics'],
    },
    {
      id: '2',
      title: 'Blog Optimization Project',
      department: 'seo',
      client: 'DigitalBusiness Co',
      status: 'completed',
      completion: 100,
      tags: ['seo', 'content', 'analytics'],
    },
    {
      id: '3',
      title: 'Social Media Branding',
      department: 'social-media',
      client: 'Creative Agency',
      status: 'in_progress',
      completion: 65,
      tags: ['instagram', 'facebook', 'tiktok'],
    },
    {
      id: '4',
      title: 'Product Design System',
      department: 'designers',
      client: 'StartupXYZ',
      status: 'in_progress',
      completion: 45,
      tags: ['ui', 'ux', 'design'],
    },
    {
      id: '5',
      title: 'Sales Funnel Development',
      department: 'bd',
      client: 'B2B Solutions',
      status: 'in_progress',
      completion: 80,
      tags: ['sales', 'strategy', 'growth'],
    },
  ];

  const filteredPortfolios =
    selectedDepartment === 'all'
      ? portfolios
      : portfolios.filter((p) => p.department === selectedDepartment);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'in_progress':
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
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <AppLayout currentPath="/portfolios">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-800 text-slate-900 mb-2">Portfolios</h1>
            <p className="text-slate-600">
              Showcase of completed and ongoing projects by department
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-600 transition-colors">
            <Icon name="PlusIcon" size={18} />
            Add Project
          </button>
        </div>

        {/* Department Filter */}
        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDepartment(dept.id)}
              className={`px-4 py-2 rounded-lg font-600 text-sm transition-all ${
                selectedDepartment === dept.id
                  ? 'bg-red-600 text-white shadow-lg'
                  : `${dept.color} text-slate-700 hover:shadow`
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolios.map((project) => (
            <div
              key={project.id}
              className={`rounded-xl border p-6 transition-all hover:shadow-lg cursor-pointer ${getStatusColor(project.status)}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-700 text-slate-900 mb-1">{project.title}</h3>
                  <p className="text-sm text-slate-600">{project.client}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-600 whitespace-nowrap ${getStatusBadgeColor(project.status)}`}
                >
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-600 text-slate-600">Progress</span>
                  <span className="text-sm font-700 text-slate-900">{project.completion}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all"
                    style={{ width: `${project.completion}%` }}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs font-500 text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPortfolios.length === 0 && (
          <div className="text-center py-12">
            <Icon name="FolderOpenIcon" size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-700 text-slate-600 mb-1">No projects found</h3>
            <p className="text-slate-500">Create your first project to get started</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
