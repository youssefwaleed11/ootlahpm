'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { MOCK_TEAMS, type Project } from '@/lib/mockData';

interface CreateProjectModalProps {
  editingProject: Project | null;
  onClose: () => void;
  onCreate: (project: Project) => void;
}

type ProjectForm = {
  name: string;
  description: string;
  teamId: string;
  startDate: string;
  dueDate: string;
  priority: Project['priority'];
  tags: string;
};

export default function CreateProjectModal({ editingProject, onClose, onCreate }: CreateProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!editingProject;

  const { register, handleSubmit, formState: { errors } } = useForm<ProjectForm>({
    defaultValues: {
      name: editingProject?.name || '',
      description: editingProject?.description || '',
      teamId: editingProject?.teamId || MOCK_TEAMS[0].id,
      startDate: editingProject?.startDate || '2026-04-21',
      dueDate: editingProject?.dueDate || '2026-06-30',
      priority: editingProject?.priority || 'medium',
      tags: editingProject?.tags.join(', ') || '',
    },
  });

  const onSubmit = async (data: ProjectForm) => {
    setIsLoading(true);
    // BACKEND INTEGRATION: Supabase insert/update project + Resend email to team
    await new Promise(r => setTimeout(r, 900));

    const newProject: Project = {
      id: editingProject?.id || `proj-${Date.now()}`,
      name: data.name,
      description: data.description,
      status: editingProject?.status || 'active',
      teamId: data.teamId,
      adminId: 'user-001',
      startDate: data.startDate,
      dueDate: data.dueDate,
      progress: editingProject?.progress || 0,
      priority: data.priority,
      tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
      taskCount: editingProject?.taskCount || 0,
      completedTaskCount: editingProject?.completedTaskCount || 0,
      createdAt: editingProject?.createdAt || new Date().toISOString(),
    };

    onCreate(newProject);
    setIsLoading(false);
    toast.success(isEditing ? 'Project updated successfully' : 'Project created successfully');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center">
              <Icon name="FolderPlusIcon" size={16} className="text-brand-orange" />
            </div>
            <h2 className="text-base font-700 text-slate-800">{isEditing ? 'Edit Project' : 'Create New Project'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <Icon name="XMarkIcon" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Project name */}
          <div>
            <label className="block text-xs font-600 text-slate-700 mb-1.5" htmlFor="proj-name">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              id="proj-name"
              type="text"
              placeholder="e.g. Mobile App Redesign"
              className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150 ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
              {...register('name', { required: 'Project name is required', minLength: { value: 3, message: 'Name must be at least 3 characters' } })}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <Icon name="ExclamationCircleIcon" size={12} />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-600 text-slate-700 mb-1.5" htmlFor="proj-desc">
              Description
            </label>
            <p className="text-[11px] text-slate-400 mb-1.5">Provide context for the team about the project scope and goals</p>
            <textarea
              id="proj-desc"
              rows={3}
              placeholder="Describe the project goals, scope, and key deliverables..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150 resize-none scrollbar-thin"
              {...register('description')}
            />
          </div>

          {/* Team + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-slate-700 mb-1.5" htmlFor="proj-team">
                Assign Team <span className="text-red-400">*</span>
              </label>
              <select
                id="proj-team"
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150 bg-slate-50 cursor-pointer ${errors.teamId ? 'border-red-400' : 'border-slate-200'}`}
                {...register('teamId', { required: 'Please assign a team' })}
              >
                {MOCK_TEAMS.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              {errors.teamId && (
                <p className="text-red-500 text-xs mt-1">{errors.teamId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-600 text-slate-700 mb-1.5" htmlFor="proj-priority">
                Priority <span className="text-red-400">*</span>
              </label>
              <select
                id="proj-priority"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150 cursor-pointer"
                {...register('priority')}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-slate-700 mb-1.5" htmlFor="proj-start">
                Start Date <span className="text-red-400">*</span>
              </label>
              <input
                id="proj-start"
                type="date"
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150 bg-slate-50 cursor-pointer ${errors.startDate ? 'border-red-400' : 'border-slate-200'}`}
                {...register('startDate', { required: 'Start date is required' })}
              />
            </div>
            <div>
              <label className="block text-xs font-600 text-slate-700 mb-1.5" htmlFor="proj-due">
                Due Date <span className="text-red-400">*</span>
              </label>
              <input
                id="proj-due"
                type="date"
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150 bg-slate-50 cursor-pointer ${errors.dueDate ? 'border-red-400' : 'border-slate-200'}`}
                {...register('dueDate', { required: 'Due date is required' })}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-600 text-slate-700 mb-1.5" htmlFor="proj-tags">
              Tags
            </label>
            <p className="text-[11px] text-slate-400 mb-1.5">Separate tags with commas — e.g. mobile, design, Q2</p>
            <input
              id="proj-tags"
              type="text"
              placeholder="mobile, design, backend..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150"
              {...register('tags')}
            />
          </div>

          {/* Footer */}
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-600 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-lg text-sm font-600 transition-all duration-150 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Icon name="ArrowPathIcon" size={16} className="animate-spin" />{isEditing ? 'Saving...' : 'Creating...'}</>
              ) : (
                isEditing ? 'Save Changes' : 'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}