import React from 'react';
import { Project } from '@/lib/mockData';
import Icon from '@/components/ui/AppIcon';

interface ProjectOverviewCardProps {
  project: Project;
}

export default function ProjectOverviewCard({ project }: ProjectOverviewCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
    on_hold: 'bg-yellow-100 text-yellow-800',
  } as const;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
            <Icon name="FolderIcon" size={20} className="text-brand-orange" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
            <p className="text-xs text-muted-foreground">
              {project.taskCount} tasks • {project.completedTaskCount} done
            </p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded ${statusColors[project.status]}`}>
          {project.status.replace('_', ' ')}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground">Progress</span>
          <span className="text-xs font-semibold text-foreground">{project.progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-orange rounded-full transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
        <span className="capitalize">{project.priority} priority</span>
      </div>
    </div>
  );
}
