'use client';
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import Icon from '@/components/ui/AppIcon';
import type { Task, TaskStatus } from '@/lib/mockData';
import { CURRENT_USER } from '@/lib/mockData';
import { toast } from 'sonner';

interface KanbanColumnsProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus, approvalComment?: string, approvedBy?: string) => void;
  selectedTaskId?: string;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; dotColor: string; adminOnly?: boolean }[] = [
  { id: 'backlog', label: 'Backlog', color: 'bg-slate-100 text-slate-600', dotColor: 'bg-slate-300', adminOnly: true },
  { id: 'todo', label: 'To Do', color: 'bg-slate-100 text-slate-600', dotColor: 'bg-slate-400' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-50 text-blue-700', dotColor: 'bg-blue-500' },
  { id: 'in_review', label: 'In Review', color: 'bg-amber-50 text-amber-700', dotColor: 'bg-amber-500' },
  { id: 'done', label: 'Done', color: 'bg-emerald-50 text-emerald-700', dotColor: 'bg-emerald-500' },
];

// Role-based drag rules
function canDrag(task: Task, fromStatus: TaskStatus, toStatus: TaskStatus): boolean {
  const role = CURRENT_USER.role;
  if (role === 'admin') return true;
  if (role === 'team_leader') return true;
  if (role === 'agent') {
    const allowed: Partial<Record<TaskStatus, TaskStatus[]>> = {
      todo: ['in_progress'],
      in_progress: ['in_review'],
    };
    return allowed[fromStatus]?.includes(toStatus) ?? false;
  }
  return false;
}

interface RequestChangesModalProps {
  task: Task;
  onConfirm: (comment: string) => void;
  onCancel: () => void;
}

function RequestChangesModal({ task, onConfirm, onCancel }: RequestChangesModalProps) {
  const [comment, setComment] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md p-6">
        <h3 className="text-base font-700 text-slate-800 mb-1">Request Changes</h3>
        <p className="text-sm text-slate-500 mb-4 truncate">Task: <span className="font-600 text-slate-700">{task.title}</span></p>
        <textarea
          autoFocus
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Describe what changes are needed (required)..."
          rows={4}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange resize-none scrollbar-thin"
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => { if (comment.trim()) onConfirm(comment.trim()); }}
            disabled={!comment.trim()}
            className="flex-1 py-2 bg-amber-500 text-white text-sm font-600 rounded-xl hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send Request
          </button>
          <button onClick={onCancel} className="flex-1 py-2 bg-slate-100 text-slate-700 text-sm font-600 rounded-xl hover:bg-slate-200 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function KanbanColumns({ tasks, onTaskClick, onStatusChange, selectedTaskId }: KanbanColumnsProps) {
  const [localTasks, setLocalTasks] = useState(tasks);
  const [requestChangesTask, setRequestChangesTask] = useState<Task | null>(null);

  React.useEffect(() => { setLocalTasks(tasks); }, [tasks]);

  const role = CURRENT_USER.role;
  const visibleColumns = COLUMNS.filter(col => {
    if (col.id === 'backlog' && role === 'agent') return false;
    return true;
  });

  const getColumnTasks = (status: TaskStatus) =>
    localTasks.filter(t => t.status === status).sort((a, b) => a.order - b.order);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const fromStatus = source.droppableId as TaskStatus;
    const toStatus = destination.droppableId as TaskStatus;

    if (!canDrag(localTasks.find(t => t.id === draggableId)!, fromStatus, toStatus)) {
      toast.error('Only Team Leaders can approve tasks.');
      return;
    }

    // If TL/admin moves to done from in_review — approve
    if (toStatus === 'done' && fromStatus === 'in_review') {
      setLocalTasks(prev => prev.map(t => t.id === draggableId
        ? { ...t, status: 'done', order: destination.index, approvedBy: CURRENT_USER.id, completedAt: new Date().toISOString() }
        : t));
      onStatusChange(draggableId, 'done', undefined, CURRENT_USER.id);
      toast.success('Task approved and marked as done');
      return;
    }

    // If TL/admin moves from in_review to todo — request changes
    if (fromStatus === 'in_review' && toStatus === 'todo') {
      const task = localTasks.find(t => t.id === draggableId);
      if (task) setRequestChangesTask(task);
      return;
    }

    setLocalTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: toStatus, order: destination.index } : t));
    onStatusChange(draggableId, toStatus);
    const col = COLUMNS.find(c => c.id === toStatus);
    toast.success(`Task moved to ${col?.label}`);
  };

  const handleApprove = (task: Task) => {
    setLocalTasks(prev => prev.map(t => t.id === task.id
      ? { ...t, status: 'done', approvedBy: CURRENT_USER.id, completedAt: new Date().toISOString() }
      : t));
    onStatusChange(task.id, 'done', undefined, CURRENT_USER.id);
    toast.success('Task approved and marked as done');
  };

  const handleRequestChanges = (task: Task) => {
    setRequestChangesTask(task);
  };

  const handleConfirmChanges = (comment: string) => {
    if (!requestChangesTask) return;
    setLocalTasks(prev => prev.map(t => t.id === requestChangesTask.id
      ? { ...t, status: 'todo', approvalComment: comment }
      : t));
    onStatusChange(requestChangesTask.id, 'todo', comment);
    toast.success('Changes requested — agent has been notified');
    setRequestChangesTask(null);
  };

  const canApprove = role === 'team_leader' || role === 'admin';

  return (
    <>
      {requestChangesTask && (
        <RequestChangesModal
          task={requestChangesTask}
          onConfirm={handleConfirmChanges}
          onCancel={() => setRequestChangesTask(null)}
        />
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-0 h-full overflow-x-auto scrollbar-thin">
          {visibleColumns.map(col => {
            const colTasks = getColumnTasks(col.id);
            return (
              <div key={`col-${col.id}`} className="flex-shrink-0 w-72 xl:w-80 flex flex-col h-full border-r border-slate-200 last:border-r-0">
                {/* Column header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                    <span className="text-sm font-600 text-slate-700">{col.label}</span>
                    <span className={`text-[11px] font-700 px-2 py-0.5 rounded-full ${col.color}`}>
                      {colTasks.length}
                    </span>
                  </div>
                  <button className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                    <Icon name="PlusIcon" size={14} />
                  </button>
                </div>

                {/* Droppable area */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2.5 transition-colors duration-150 ${snapshot.isDraggingOver ? 'bg-orange-50/60' : 'bg-slate-50/40'} kanban-column`}
                    >
                      {colTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-2">
                            <Icon name="ClipboardDocumentListIcon" size={18} className="text-slate-400" />
                          </div>
                          <p className="text-xs text-slate-400 font-500">No tasks here</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Drag a card or create a new task</p>
                        </div>
                      )}
                      {colTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`task-card-enter ${dragSnapshot.isDragging ? 'rotate-1 shadow-card-hover' : ''}`}
                            >
                              <TaskCard
                                task={task}
                                onClick={() => onTaskClick(task)}
                                isSelected={task.id === selectedTaskId}
                                isDragging={dragSnapshot.isDragging}
                                onApprove={canApprove && col.id === 'in_review' ? () => handleApprove(task) : undefined}
                                onRequestChanges={canApprove && col.id === 'in_review' ? () => handleRequestChanges(task) : undefined}
                                allTasks={localTasks}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </>
  );
}