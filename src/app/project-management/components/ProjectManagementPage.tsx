'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import ProjectStatsRow from './ProjectStatsRow';
import ProjectFilters from './ProjectFilters';
import ProjectGrid from './ProjectGrid';
import CreateProjectModal from './CreateProjectModal';
import TeamManagementPanel from './TeamManagementPanel';
import InviteUserModal from './InviteUserModal';
import { MOCK_PROJECTS, type Project } from '@/lib/mockData';

export default function ProjectManagementPage() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [statusFilter, setStatusFilter] = useState<'all' | Project['status']>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [teamPanelOpen, setTeamPanelOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const filtered = projects.filter(p => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchTeam = teamFilter === 'all' || p.teamId === teamFilter;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchTeam && matchSearch;
  });

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
            <h1 className="text-2xl font-700 text-slate-800 tracking-tight">Projects</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your workspace projects, teams, and progress</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setInviteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white text-slate-600 text-sm font-500 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 active:scale-95"
            >
              <Icon name="UserPlusIcon" size={16} />
              Invite User
            </button>
            <button
              onClick={() => setTeamPanelOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white text-slate-600 text-sm font-500 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 active:scale-95"
            >
              <Icon name="UserGroupIcon" size={16} />
              Manage Teams
            </button>
            <button
              onClick={() => { setEditingProject(null); setCreateModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-600 rounded-lg transition-all duration-150 active:scale-95 shadow-sm"
            >
              <Icon name="PlusIcon" size={16} />
              New Project
            </button>
          </div>
        </div>

        {/* Stats row */}
        <ProjectStatsRow projects={projects} />

        {/* Filters */}
        <ProjectFilters
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          teamFilter={teamFilter}
          onTeamFilter={setTeamFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalCount={filtered.length}
        />

        {/* Project grid */}
        <ProjectGrid
          projects={filtered}
          onEdit={p => { setEditingProject(p); setCreateModalOpen(true); }}
          onArchive={handleArchiveProject}
          onDelete={handleDeleteProject}
        />
      </div>

      {/* Modals & panels */}
      {createModalOpen && (
        <CreateProjectModal
          editingProject={editingProject}
          onClose={() => { setCreateModalOpen(false); setEditingProject(null); }}
          onCreate={handleCreateProject}
        />
      )}
      {teamPanelOpen && (
        <TeamManagementPanel onClose={() => setTeamPanelOpen(false)} />
      )}
      {inviteModalOpen && (
        <InviteUserModal onClose={() => setInviteModalOpen(false)} />
      )}
    </AppLayout>
  );
}

// Local Icon import for this file
function Icon({ name, size = 16, className = '' }: { name: string; size?: number; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    UserPlusIcon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={size} height={size} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
      </svg>
    ),
  };
  // Fall through to AppIcon for unknown icons
  return icons[name] ? <>{icons[name]}</> : null;
}