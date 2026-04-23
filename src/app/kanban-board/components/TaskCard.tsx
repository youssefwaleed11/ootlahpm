'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { getUserById, formatDate, isOverdue, type Task } from '@/lib/mockData';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isSelected: boolean;
  isDragging: boolean;
}

const PRIORITY_CONFIG = {
  low: { label: 'Low', className: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  critical: { label: 'Critical', className: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
};

export default function TaskCard({ task, onClick, isSelected, isDragging }: TaskCardProps) {
  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
  const overdue = isOverdue(task.dueDate) && task.status !== 'done';
  const priority = PRIORITY_CONFIG[task.priority];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border cursor-pointer transition-all duration-150 group ${
        isSelected
          ? 'border-brand-orange shadow-card-hover ring-2 ring-brand-orange/20'
          : isDragging
            ? 'border-brand-orange/40 shadow-card-hover'
            : 'border-slate-200 shadow-card hover:border-brand-orange/30 hover:shadow-card-hover'
      }`}
    >
      <div className="p-3">
        {/* Top row: priority + tags */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-600 px-1.5 py-0.5 rounded-full ${priority.className}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
            {priority.label}
          </span>
          {task.tags.slice(0, 2).map((tag) => (
            <span
              key={`tag-${task.id}-${tag}`}
              className="text-[10px] font-500 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <p className="text-sm font-600 text-slate-800 leading-snug mb-2.5 line-clamp-2 group-hover:text-brand-orange transition-colors duration-150">
          {task.title}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Due date */}
            <div
              className={`flex items-center gap-1 text-[11px] font-500 ${overdue ? 'text-red-500' : 'text-slate-500'}`}
            >
              <Icon
                name="CalendarDaysIcon"
                size={11}
                className={overdue ? 'text-red-400' : 'text-slate-400'}
              />
              <span className="font-tabular">{formatDate(task.dueDate)}</span>
              {overdue && <Icon name="ExclamationCircleIcon" size={10} className="text-red-500" />}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Attachments */}
            {task.attachmentCount > 0 && (
              <div className="flex items-center gap-0.5 text-[11px] text-slate-400">
                <Icon name="PaperClipIcon" size={11} />
                <span className="font-tabular">{task.attachmentCount}</span>
              </div>
            )}
            {/* Comments */}
            {task.commentCount > 0 && (
              <div className="flex items-center gap-0.5 text-[11px] text-slate-400">
                <Icon name="ChatBubbleLeftIcon" size={11} />
                <span className="font-tabular">{task.commentCount}</span>
              </div>
            )}
            {/* Assignee avatar */}
            {assignee && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-700 text-white flex-shrink-0"
                style={{ background: '#0D9488' }}
                title={assignee.name}
              >
                {assignee.avatar}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overdue stripe */}
      {overdue && <div className="h-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-b-xl" />}
    </div>
  );
}
