'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

interface Department {
  id: string;
  name: string;
  color: string;
  description: string;
  membersCount: number;
  projectsCount: number;
  budget: number;
}

export default function DepartmentSettingsPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([
    {
      id: '1',
      name: 'Marketing',
      color: '#EF4444',
      description: 'Paid ads, campaigns, and marketing strategy',
      membersCount: 4,
      projectsCount: 8,
      budget: 45000,
    },
    {
      id: '2',
      name: 'SEO',
      color: '#F97316',
      description: 'Search engine optimization and organic growth',
      membersCount: 3,
      projectsCount: 6,
      budget: 32000,
    },
    {
      id: '3',
      name: 'Content',
      color: '#EAB308',
      description: 'Blog writing, copywriting, and content creation',
      membersCount: 5,
      projectsCount: 5,
      budget: 28000,
    },
    {
      id: '4',
      name: 'BD',
      color: '#10B981',
      description: 'Business development and client acquisition',
      membersCount: 2,
      projectsCount: 4,
      budget: 20000,
    },
    {
      id: '5',
      name: 'Designers',
      color: '#3B82F6',
      description: 'UI/UX and graphic design',
      membersCount: 3,
      projectsCount: 3,
      budget: 25000,
    },
    {
      id: '6',
      name: 'Social Media',
      color: '#8B5CF6',
      description: 'Social media management and community engagement',
      membersCount: 2,
      projectsCount: 2,
      budget: 15000,
    },
  ]);

  return (
    <AppLayout currentPath="/admin/departments">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-800 text-slate-900 mb-2">Department Settings</h1>
            <p className="text-slate-600">Manage company departments and custom fields</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-600 transition-colors"
          >
            <Icon name="PlusIcon" size={18} />
            Add Department
          </button>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: dept.color }}
                  />
                  <h3 className="text-lg font-700 text-slate-900">{dept.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-slate-100 rounded transition-colors">
                    <Icon name="PencilIcon" size={16} className="text-slate-600" />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded transition-colors">
                    <Icon name="TrashIcon" size={16} className="text-red-600" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 mb-4">{dept.description}</p>

              {/* Stats */}
              <div className="space-y-3 mb-4 pb-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-600 text-slate-600">Team Members</span>
                  <span className="text-sm font-700 text-slate-900">{dept.membersCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-600 text-slate-600">Active Projects</span>
                  <span className="text-sm font-700 text-slate-900">{dept.projectsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-600 text-slate-600">Monthly Budget</span>
                  <span className="text-sm font-700 text-slate-900">${dept.budget.toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <button className="w-full py-2 px-4 border border-slate-300 rounded-lg font-600 text-slate-700 hover:bg-slate-50 transition-colors text-sm">
                Manage Members
              </button>
            </div>
          ))}
        </div>

        {/* Custom Fields Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-700 text-slate-900 mb-4 pb-4 border-b border-slate-200">Custom Fields</h2>
          <p className="text-slate-600 mb-4">Define custom fields for projects and tasks across your organization</p>

          <div className="space-y-4">
            {[
              { name: 'Client Type', type: 'Select', departments: 'All' },
              { name: 'ROI Target', type: 'Number', departments: 'Marketing, SEO' },
              { name: 'Deadline Phase', type: 'Select', departments: 'All' },
              { name: 'Budget Spent', type: 'Number', departments: 'Marketing, Designers' },
            ].map((field, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-600 text-slate-900">{field.name}</p>
                  <p className="text-xs text-slate-600">{field.type} • {field.departments}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-white rounded transition-colors">
                    <Icon name="PencilIcon" size={16} className="text-slate-600" />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded transition-colors">
                    <Icon name="TrashIcon" size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-4 flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg font-600 text-slate-700 hover:bg-slate-50 transition-colors">
            <Icon name="PlusIcon" size={18} />
            Add Custom Field
          </button>
        </div>

        {/* Add Department Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6">
              <h2 className="text-2xl font-800 text-slate-900 mb-4">Add New Department</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-600 text-slate-900 mb-2">Department Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-600 text-slate-900 mb-2">Description</label>
                  <textarea className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-600 text-slate-900 mb-2">Brand Color</label>
                  <div className="flex gap-2">
                    <input type="color" defaultValue="#EF4444" className="w-16 h-10 rounded-lg cursor-pointer" />
                    <input type="text" placeholder="#EF4444" className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-600 text-slate-900 mb-2">Monthly Budget</label>
                  <input type="number" placeholder="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-600 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-600 transition-colors"
                >
                  Create Department
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
