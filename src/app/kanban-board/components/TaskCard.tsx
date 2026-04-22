'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { getUserById, formatDate, isOverdue, type Task } from '@/lib/mockData';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isSelected: boolean;
  isDragging: boolean;
  onApprove?: () => void;
  onRequestChanges?: () => void;
  allTasks?: Task[];
}

const PRIORITY_CONFIG = {
  low: { label: 'Low', className: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  critical: { label: 'Critical', className: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
};

export default function TaskCard({ task, onClick, isSelected, isDragging, onApprove, onRequestChanges, allTasks = [] }: TaskCardProps) {
  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
  const approvedByUser = task.approvedBy ? getUserById(task.approvedBy) : null;
  const overdue = isOverdue(task.dueDate) && task.status !== 'done';
  const priority = PRIORITY_CONFIG[task.priority];

  // Dependency blocking check
  const isBlocked = (task.blockedBy?.length ?? 0) > 0 &&
    task.blockedBy!.some(blockId => {
      const blockTask = allTasks.find(t => t.id === blockId);
      return blockTask && blockTask.status !== 'done';
    });

  const blockingTaskTitles = (task.blockedBy || [])
    .map(id => allTasks.find(t => t.id === id))
    .filter(t => t && t.status !== 'done')
    .map(t => t!.title);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border cursor-pointer transition-all duration-150 group relative ${
        isBlocked ? 'opacity-60' : ''
      } ${
        isSelected
          ? 'border-brand-orange shadow-card-hover ring-2 ring-brand-orange/20'
          : isDragging
          ? 'border-brand-orange/40 shadow-card-hover'
          : 'border-slate-200 shadow-card hover:border-brand-orange/30 hover:shadow-card-hover'
      }`}
      title={isBlocked ? `Blocked by: ${blockingTaskTitles.join(', ')}` : undefined}
    >
      <div className="p-3">
        {/* Status badges row */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {task.status === 'in_review' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-700 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
              ⏳ Pending Approval
            </span>
          )}
          {task.approvalComment && task.status === 'todo' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-700 px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
              ↩ Changes Requested
            </span>
          )}
          {isBlocked && (
            <span className="inline-flex items-center gap-1 text-[10px] font-700 px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600">
              🔒 Blocked
            </span>
          )}
        </div>

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

        {/* Changes requested comment */}
        {task.approvalComment && task.status === 'todo' && (
          <div className="mb-2.5 px-2.5 py-2 bg-red-50 rounded-lg border border-red-100">
            <p className="text-[11px] text-red-600 leading-snug">{task.approvalComment}</p>
          </div>
        )}

        {/* Done — approved by */}
        {task.status === 'done' && approvedByUser && (
          <div className="mb-2.5 flex items-center gap-1.5">
            <Icon name="CheckCircleIcon" size={12} className="text-emerald-500" />
            <span className="text-[11px] text-emerald-600 font-500">Approved by {approvedByUser.name.split(' ')[0]}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 text-[11px] font-500 ${overdue ? 'text-red-500' : 'text-slate-500'}`}>
              <Icon name="CalendarDaysIcon" size={11} className={overdue ? 'text-red-400' : 'text-slate-400'} />
              <span className="font-tabular">{formatDate(task.dueDate)}</span>
              {overdue && <Icon name="ExclamationCircleIcon" size={10} className="text-red-500" />}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {task.attachmentCount > 0 && (
              <div className="flex items-center gap-0.5 text-[11px] text-slate-400">
                <Icon name="PaperClipIcon" size={11} />
                <span className="font-tabular">{task.attachmentCount}</span>
              </div>
            )}
            {task.commentCount > 0 && (
              <div className="flex items-center gap-0.5 text-[11px] text-slate-400">
                <Icon name="ChatBubbleLeftIcon" size={11} />
                <span className="font-tabular">{task.commentCount}</span>
              </div>
            )}
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

        {/* Approval action buttons for in_review */}
        {(onApprove || onRequestChanges) && task.status === 'in_review' && (
          <div className="flex gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            {onApprove && (
              <button
                onClick={e => { e.stopPropagation(); onApprove(); }}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-500 text-white text-[11px] font-600 rounded-lg hover:bg-emerald-600 transition-colors active:scale-95"
              >
                <Icon name="CheckIcon" size={11} />
                Approve
              </button>
            )}
            {onRequestChanges && (
              <button
                onClick={e => { e.stopPropagation(); onRequestChanges(); }}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-amber-100 text-amber-700 text-[11px] font-600 rounded-lg hover:bg-amber-200 transition-colors active:scale-95"
              >
                <Icon name="ArrowUturnLeftIcon" size={11} />
                Changes
              </button>
            )}
          </div>
        )}
      </div>

      {/* Overdue stripe */}
      {overdue && (
        <div className="h-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-b-xl" />
      )}
    </div>
  );
}