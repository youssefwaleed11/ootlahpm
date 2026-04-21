'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { getUserById, getTeamById, formatDate, isOverdue, type Project } from '@/lib/mockData';
import { toast } from 'sonner';
import Link from 'next/link';

interface ProjectGridProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onArchive: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

const STATUS_CONFIG = {
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700' },
  on_hold: { label: 'On Hold', className: 'bg-amber-100 text-amber-700' },
  archived: { label: 'Archived', className: 'bg-slate-100 text-slate-500' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', className: 'text-slate-500', dot: 'bg-slate-400' },
  medium: { label: 'Medium', className: 'text-amber-600', dot: 'bg-amber-500' },
  high: { label: 'High', className: 'text-orange-600', dot: 'bg-orange-500' },
  critical: { label: 'Critical', className: 'text-red-600', dot: 'bg-red-500' },
};

export default function ProjectGrid({ projects, onEdit, onArchive, onDelete }: ProjectGridProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Icon name="FolderOpenIcon" size={28} className="text-slate-400" />
        </div>
        <h3 className="text-base font-600 text-slate-700 mb-1">No projects found</h3>
        <p className="text-sm text-slate-400 max-w-xs">Projects you create will appear here. Try adjusting your filters or create a new project.</p>
      </div>
    );
  }

  const handleDelete = (projectId: string) => {
    onDelete(projectId);
    setConfirmDelete(null);
    setMenuOpen(null);
    toast.success('Project deleted');
  };

  const handleArchive = (projectId: string) => {
    onArchive(projectId);
    setMenuOpen(null);
    toast.success('Project archived');
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
        {projects.map(project => {
          const team = getTeamById(project.teamId);
          const admin = getUserById(project.adminId);
          const overdue = isOverdue(project.dueDate) && project.status === 'active';
          const priority = PRIORITY_CONFIG[project.priority];
          const status = STATUS_CONFIG[project.status];
          const isMenuOpen = menuOpen === project.id;

          return (
            <div
              key={project.id}
              className={`bg-white rounded-2xl border shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden group ${
                overdue ? 'border-red-200' : 'border-slate-200 hover:border-brand-orange/30'
              }`}
            >
              {/* Top accent bar */}
              <div
                className="h-1 w-full"
                style={{
                  background: project.status === 'archived' ?'#e2e8f0'
                    : project.priority === 'critical' ?'linear-gradient(90deg, #ef4444, #f97316)'
                    : `linear-gradient(90deg, ${team?.color || '#F97316'}, ${team?.color || '#0D9488'}88)`
                }}
              />

              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-700 px-2 py-0.5 rounded-full ${status.className}`}>
                        {status.label}
                      </span>
                      <span className={`flex items-center gap-1 text-[10px] font-600 ${priority.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                        {priority.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-700 text-slate-800 leading-snug truncate group-hover:text-brand-orange transition-colors duration-150">
                      {project.name}
                    </h3>
                  </div>

                  {/* Actions menu */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setMenuOpen(isMenuOpen ? null : project.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Icon name="EllipsisHorizontalIcon" size={16} />
                    </button>
                    {isMenuOpen && (
                      <div className="absolute right-0 top-8 w-44 bg-white rounded-xl border border-slate-200 shadow-modal z-20 overflow-hidden fade-in">
                        <button
                          onClick={() => { onEdit(project); setMenuOpen(null); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-500 text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <Icon name="PencilSquareIcon" size={14} className="text-slate-400" />
                          Edit Project
                        </button>
                        <Link
                          href="/kanban-board"
                          onClick={() => setMenuOpen(null)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-500 text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <Icon name="ViewColumnsIcon" size={14} className="text-slate-400" />
                          Open Kanban
                        </Link>
                        <button
                          onClick={() => handleArchive(project.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-500 text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <Icon name="ArchiveBoxIcon" size={14} className="text-slate-400" />
                          Archive
                        </button>
                        <div className="h-px bg-slate-100 my-0.5" />
                        <button
                          onClick={() => { setConfirmDelete(project.id); setMenuOpen(null); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-500 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Icon name="TrashIcon" size={14} className="text-red-400" />
                          Delete Project
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                  {project.description}
                </p>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-600 text-slate-500">Progress</span>
                    <span className="text-[11px] font-700 text-slate-700 font-tabular">{project.completedTaskCount}/{project.taskCount} tasks</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${project.progress}%`,
                        background: project.progress === 100
                          ? 'linear-gradient(90deg, #10b981, #0d9488)'
                          : project.progress >= 70
                          ? 'linear-gradient(90deg, #f97316, #0d9488)'
                          : 'linear-gradient(90deg, #f97316, #fb923c)',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-400">
                      {project.progress === 100 ? '✓ Complete' : `${project.progress}% done`}
                    </span>
                    {overdue && (
                      <span className="text-[10px] text-red-500 font-600 flex items-center gap-0.5">
                        <Icon name="ExclamationCircleIcon" size={10} />
                        Overdue
                      </span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.tags.map(tag => (
                      <span key={`proj-tag-${project.id}-${tag}`} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  {/* Team */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center"
                      style={{ background: team?.color || '#F97316' }}
                    >
                      <Icon name="UserGroupIcon" size={10} className="text-white" />
                    </div>
                    <span className="text-[11px] font-500 text-slate-600 truncate max-w-[100px]">{team?.name}</span>
                  </div>

                  {/* Due date */}
                  <div className={`flex items-center gap-1 text-[11px] font-500 ${overdue ? 'text-red-500' : 'text-slate-500'}`}>
                    <Icon name="CalendarDaysIcon" size={11} className={overdue ? 'text-red-400' : 'text-slate-400'} />
                    <span className="font-tabular">{formatDate(project.dueDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-modal p-6 max-w-sm w-full slide-in-right">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <Icon name="TrashIcon" size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-700 text-slate-800">Delete Project</h3>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              Deleting this project will permanently remove all tasks, comments, and team assignments associated with it.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-600 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-600 transition-all duration-150 active:scale-95"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}