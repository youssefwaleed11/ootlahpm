'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FilterConfig {
  departments?: string[];
  statuses?: string[];
  priorities?: string[];
  assignees?: string[];
  dateRange?: { from: string; to: string };
  search?: string;
}

interface AdvancedFiltersProps {
  onFilterChange?: (filters: FilterConfig) => void;
  onSaveFilter?: (name: string, filters: FilterConfig) => void;
}

const DEPARTMENTS = [
  { id: 'marketing', label: 'Marketing' },
  { id: 'seo', label: 'SEO' },
  { id: 'content', label: 'Content' },
  { id: 'bd', label: 'BD' },
  { id: 'designers', label: 'Designers' },
  { id: 'social-media', label: 'Social Media' },
];

const STATUSES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'in_review', label: 'In Review' },
  { id: 'completed', label: 'Completed' },
];

const PRIORITIES = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
  { id: 'critical', label: 'Critical' },
];

const ASSIGNEES = [
  { id: 'layla', label: 'Layla Ahmed' },
  { id: 'omar', label: 'Omar Hassan' },
  { id: 'nour', label: 'Nour Ibrahim' },
  { id: 'sara', label: 'Sara Mohamed' },
  { id: 'youssef', label: 'Youssef Ali' },
];

export default function AdvancedFilters({ onFilterChange, onSaveFilter }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filterName, setFilterName] = useState('');

  const [filters, setFilters] = useState<FilterConfig>({
    departments: [],
    statuses: [],
    priorities: [],
    assignees: [],
    search: '',
  });

  const handleFilterChange = (key: keyof FilterConfig, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const toggleMultiSelect = (key: keyof FilterConfig, value: string) => {
    const current = (filters[key] as string[]) || [];
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    handleFilterChange(key, newValue);
  };

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      onSaveFilter?.(filterName, filters);
      setFilterName('');
      setShowSaveModal(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      departments: [],
      statuses: [],
      priorities: [],
      assignees: [],
      search: '',
    });
    onFilterChange?.({});
  };

  const activeFilterCount = [
    filters.departments?.length || 0,
    filters.statuses?.length || 0,
    filters.priorities?.length || 0,
    filters.assignees?.length || 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <>
      {/* Filter Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-600 text-sm transition-colors ${
            isOpen
              ? 'bg-red-600 text-white'
              : activeFilterCount > 0
                ? 'bg-red-100 text-red-700 border border-red-300'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Icon name="FunnelIcon" size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-slate-200/50 rounded-full text-xs font-700">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Filter Panel */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />

            {/* Panel */}
            <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-slate-200 rounded-lg shadow-xl z-40 max-h-96 overflow-y-auto">
              {/* Search */}
              <div className="p-4 border-b border-slate-200">
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search tasks or projects..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>

              {/* Filter Sections */}
              <div className="p-4 space-y-6">
                {/* Departments */}
                <div>
                  <h3 className="text-xs font-700 text-slate-900 uppercase mb-3">Departments</h3>
                  <div className="space-y-2">
                    {DEPARTMENTS.map((dept) => (
                      <label key={dept.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.departments?.includes(dept.id) || false}
                          onChange={() => toggleMultiSelect('departments', dept.id)}
                          className="w-4 h-4 rounded accent-red-600"
                        />
                        <span className="text-sm text-slate-700">{dept.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Statuses */}
                <div>
                  <h3 className="text-xs font-700 text-slate-900 uppercase mb-3">Status</h3>
                  <div className="space-y-2">
                    {STATUSES.map((status) => (
                      <label key={status.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.statuses?.includes(status.id) || false}
                          onChange={() => toggleMultiSelect('statuses', status.id)}
                          className="w-4 h-4 rounded accent-red-600"
                        />
                        <span className="text-sm text-slate-700">{status.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Priorities */}
                <div>
                  <h3 className="text-xs font-700 text-slate-900 uppercase mb-3">Priority</h3>
                  <div className="space-y-2">
                    {PRIORITIES.map((priority) => (
                      <label key={priority.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.priorities?.includes(priority.id) || false}
                          onChange={() => toggleMultiSelect('priorities', priority.id)}
                          className="w-4 h-4 rounded accent-red-600"
                        />
                        <span className="text-sm text-slate-700">{priority.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Assignees */}
                <div>
                  <h3 className="text-xs font-700 text-slate-900 uppercase mb-3">Assigned To</h3>
                  <div className="space-y-2">
                    {ASSIGNEES.map((assignee) => (
                      <label key={assignee.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.assignees?.includes(assignee.id) || false}
                          onChange={() => toggleMultiSelect('assignees', assignee.id)}
                          className="w-4 h-4 rounded accent-red-600"
                        />
                        <span className="text-sm text-slate-700">{assignee.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <h3 className="text-xs font-700 text-slate-900 uppercase mb-3">Due Date Range</h3>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={filters.dateRange?.from || ''}
                      onChange={(e) =>
                        handleFilterChange('dateRange', {
                          ...filters.dateRange,
                          from: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="From"
                    />
                    <input
                      type="date"
                      value={filters.dateRange?.to || ''}
                      onChange={(e) =>
                        handleFilterChange('dateRange', {
                          ...filters.dateRange,
                          to: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="To"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-200 p-4 flex gap-2">
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-600 text-slate-700 hover:bg-slate-50 transition-colors text-sm"
                >
                  Save Filter
                </button>
                <button
                  onClick={resetFilters}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-600 text-slate-700 hover:bg-slate-50 transition-colors text-sm"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-600 transition-colors text-sm"
                >
                  Apply
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Save Filter Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6">
            <h2 className="text-2xl font-800 text-slate-900 mb-4">Save Filter</h2>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Filter name (e.g., 'High Priority Marketing')"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-600 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFilter}
                disabled={!filterName.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-lg font-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
