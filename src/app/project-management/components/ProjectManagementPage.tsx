'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import ProjectGrid from './ProjectGrid';
import CreateProjectModal from './CreateProjectModal';
import { MOCK_PROJECTS, CURRENT_USER, type Project } from '@/lib/mockData';
import Icon from '@/components/ui/AppIcon';

export default function ProjectManagementPage() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter: Only show projects where user is assigned or their team is assigned
  const userTeamId = CURRENT_USER.teamId;
  const myProjects = projects.filter(p => 
    p.teamId === userTeamId || 
    MOCK_PROJECTS.find(proj => proj.id === p.id)?.adminId === CURRENT_USER.id
  );

  const filtered = myProjects.filter(p => 
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = (project: Project) => {
    // BACKEND INTEGRATION: Supabase insert project + Resend email to team members
    setProjects(prev => [project, ...prev]);
    setCreateModalOpen(false);
  };

  const handleArchiveProject = (projectId: string) => {
    // BACKEND INTEGRATION: Supabase update project status to archived
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: 'archived' } : p));
  };

  const handleDeleteProject = (projectId: string) => {
    // BACKEND INTEGRATION: Supabase delete project + cascade tasks
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  return (
    <AppLayout currentPath="/project-management">
      <div className="space-y-5">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-700 text-slate-800 tracking-tight">My Projects</h1>
            <p className="text-sm text-slate-500 mt-0.5">Projects assigned to you and your team</p>
          </div>
          {CURRENT_USER.role !== 'agent' && (
            <button
              onClick={() => { setEditingProject(null); setCreateModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-600 rounded-lg transition-all duration-150 active:scale-95 shadow-sm"
            >
              <Icon name="PlusIcon" size={16} />
              New Project
            </button>
          )}
        </div>

        {/* Search */}
        {filtered.length > 0 && (
          <div className="relative">
            <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>
        )}

        {/* Project grid */}
        <ProjectGrid
          projects={filtered}
          onEdit={p => { setEditingProject(p); setCreateModalOpen(true); }}
          onArchive={handleArchiveProject}
          onDelete={handleDeleteProject}
        />
      </div>

      {/* Create Project Modal */}
      {createModalOpen && (
        <CreateProjectModal
          editingProject={editingProject}
          onClose={() => { setCreateModalOpen(false); setEditingProject(null); }}
          onCreate={handleCreateProject}
        />
      )}
    </AppLayout>
  );
}
