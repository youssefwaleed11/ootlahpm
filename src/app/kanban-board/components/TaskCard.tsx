'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { getUserById, formatDate, isOverdue, type Task, CURRENT_USER } from '@/lib/mockData';
import { isTaskBlocked, getBlockingTasksInfo } from '@/lib/taskDependencies';

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
  const [showApprovalButtons, setShowApprovalButtons] = useState(false);
  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
  const overdue = isOverdue(task.dueDate) && task.status !== 'done';
  const priority = PRIORITY_CONFIG[task.priority];
  const isInReview = task.status === 'in_review';
  const canApprove = isInReview && (CURRENT_USER.role === 'team_leader' || CURRENT_USER.role === 'admin');
  const blocked = isTaskBlocked(task);
  const blockingTasks = getBlockingTasksInfo(task);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setShowApprovalButtons(true)}
      onMouseLeave={() => setShowApprovalButtons(false)}
      className={`bg-white rounded-xl border cursor-pointer transition-all duration-150 group relative ${
        isSelected
          ? 'border-brand-orange shadow-card-hover ring-2 ring-brand-orange/20'
          : isDragging
          ? 'border-brand-orange/40 shadow-card-hover'
          : isInReview
          ? 'border-amber-200 shadow-card hover:border-amber-300 hover:shadow-card-hover'
          : blocked
          ? 'border-gray-300 shadow-card opacity-60 hover:opacity-70'
          : 'border-slate-200 shadow-card hover:border-brand-orange/30 hover:shadow-card-hover'
      }`}
      title={blocked ? `Blocked by: ${blockingTasks.map(t => t.title).join(', ')}` : undefined}
    >
      <div className={`p-3 ${blocked ? 'relative' : ''}`}>
        {/* Lock icon for blocked tasks */}
        {blocked && (
          <div className="absolute top-2 right-2 text-gray-400" title={`Blocked by: ${blockingTasks.map(t => t.title).join(', ')}`}>
            <Icon name="LockClosedIcon" size={16} />
          </div>
        )}

        {/* Top row: priority + tags */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className={`inline-flex items-center gap-1 text-[10px] font-600 px-1.5 py-0.5 rounded-full ${priority.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
            {priority.label}
          </span>
          {task.tags.slice(0, 2).map(tag => (
            <span key={`tag-${task.id}-${tag}`} className="text-[10px] font-500 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
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
            <div className={`flex items-center gap-1 text-[11px] font-500 ${overdue ? 'text-red-500' : 'text-slate-500'}`}>
              <Icon name="CalendarDaysIcon" size={11} className={overdue ? 'text-red-400' : 'text-slate-400'} />
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
      {overdue && (
        <div className="h-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-b-xl" />
      )}

      {/* In Review Badge */}
      {isInReview && (
        <div className="absolute top-2 right-2 bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-full">
          Pending Approval
        </div>
      )}

      {/* Approval Buttons (visible on hover for TL/Admin) */}
      {showApprovalButtons && canApprove && isInReview && (
        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center gap-2 backdrop-blur-sm">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement approve action
            }}
            className="px-3 py-1.5 bg-green-500 text-white rounded font-medium text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
          >
            <Icon name="CheckIcon" size={14} />
            Approve
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement request changes action
            }}
            className="px-3 py-1.5 bg-amber-500 text-white rounded font-medium text-sm hover:bg-amber-600 transition-colors flex items-center gap-1"
          >
            <Icon name="ArrowUturnLeftIcon" size={14} />
            Changes
          </button>
        </div>
      )}

      {/* Changes Requested Badge */}
      {task.status === 'changes_requested' && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
          Changes Requested
        </div>
      )}

      {/* Done Checkmark */}
      {task.status === 'done' && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">
          <Icon name="CheckIcon" size={12} />
          Done
        </div>
      )}
    </div>
  );
}
