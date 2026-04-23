'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import type { Project } from '@/lib/mockData';

interface KanbanHeaderProps {
  selectedProjectId: string;
  onProjectChange: (id: string) => void;
  projects: Project[];
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export default function KanbanHeader({
  selectedProjectId,
  onProjectChange,
  projects,
}: KanbanHeaderProps) {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [projectDropOpen, setProjectDropOpen] = useState(false);
  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <div className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex-shrink-0">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Project selector */}
        <div className="relative">
          <button
            onClick={() => setProjectDropOpen(!projectDropOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors duration-150 group"
          >
            <div className="w-5 h-5 rounded-md bg-brand-orange flex items-center justify-center flex-shrink-0">
              <Icon name="FolderIcon" size={11} className="text-white" />
            </div>
            <span className="text-sm font-600 text-slate-800 max-w-[180px] truncate">
              {activeProject?.name}
            </span>
            <Icon name="ChevronDownIcon" size={14} className="text-slate-400" />
          </button>
          {projectDropOpen && (
            <div className="absolute top-10 left-0 w-72 bg-white rounded-xl border border-slate-200 shadow-modal z-30 fade-in overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-600 text-slate-500 uppercase tracking-wider">
                  Switch Project
                </p>
              </div>
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => {
                    onProjectChange(proj.id);
                    setProjectDropOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left ${proj.id === selectedProjectId ? 'bg-orange-50' : ''}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="FolderIcon" size={14} className="text-brand-orange" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-slate-800 truncate">{proj.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-orange rounded-full"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-tabular">
                        {proj.progress}%
                      </span>
                    </div>
                  </div>
                  {proj.id === selectedProjectId && (
                    <Icon
                      name="CheckIcon"
                      size={14}
                      className="text-brand-orange flex-shrink-0 mt-1"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-1.5">
          {['all', 'critical', 'high', 'medium', 'low'].map((p) => (
            <button
              key={`filter-${p}`}
              onClick={() => setFilterPriority(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-500 transition-all duration-150 ${
                filterPriority === p
                  ? p === 'all'
                    ? 'bg-slate-800 text-white'
                    : PRIORITY_COLORS[p] + ' ring-1 ring-offset-1 ring-current'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Team avatars */}
          <div className="flex -space-x-2">
            {['LA', 'OK', 'NH', 'TM'].map((av, i) => (
              <div
                key={`av-${av}`}
                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-700 text-white"
                style={{ background: i % 2 === 0 ? '#F97316' : '#0D9488', zIndex: 10 - i }}
              >
                {av}
              </div>
            ))}
            <div
              className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-600 text-slate-600"
              style={{ zIndex: 6 }}
            >
              +4
            </div>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-orange hover:bg-brand-orange-dark text-white text-xs font-600 rounded-lg transition-all duration-150 active:scale-95">
            <Icon name="PlusIcon" size={14} />
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
