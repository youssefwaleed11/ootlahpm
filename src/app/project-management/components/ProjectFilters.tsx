'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { MOCK_TEAMS, type Project } from '@/lib/mockData';

interface ProjectFiltersProps {
  statusFilter: 'all' | Project['status'];
  onStatusFilter: (s: 'all' | Project['status']) => void;
  teamFilter: string;
  onTeamFilter: (t: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCount: number;
}

const STATUS_OPTIONS: { value: 'all' | Project['status']; label: string }[] = [
  { value: 'all', label: 'All Projects' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'archived', label: 'Archived' },
];

export default function ProjectFilters({
  statusFilter,
  onStatusFilter,
  teamFilter,
  onTeamFilter,
  searchQuery,
  onSearchChange,
  totalCount,
}: ProjectFiltersProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Icon
          name="MagnifyingGlassIcon"
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search projects..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange placeholder-slate-400 transition-all duration-150"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <Icon name="XMarkIcon" size={14} />
          </button>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 gap-0.5">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={`sf-${opt.value}`}
            onClick={() => onStatusFilter(opt.value)}
            className={`px-3 py-1 rounded-md text-xs font-600 transition-all duration-150 ${
              statusFilter === opt.value
                ? 'bg-brand-orange text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Team filter */}
      <select
        value={teamFilter}
        onChange={(e) => onTeamFilter(e.target.value)}
        className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange text-slate-600 cursor-pointer"
      >
        <option value="all">All Teams</option>
        {MOCK_TEAMS.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>

      <span className="text-xs text-slate-400 font-500 ml-auto">
        {totalCount} project{totalCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
