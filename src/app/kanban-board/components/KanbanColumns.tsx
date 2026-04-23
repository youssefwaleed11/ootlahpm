'use client';
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import Icon from '@/components/ui/AppIcon';
import type { Task } from '@/lib/mockData';
import { toast } from 'sonner';

interface KanbanColumnsProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  selectedTaskId?: string;
}

const COLUMNS: { id: Task['status']; label: string; color: string; dotColor: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-100 text-slate-600', dotColor: 'bg-slate-400' },
  {
    id: 'in_progress',
    label: 'In Progress',
    color: 'bg-blue-50 text-blue-700',
    dotColor: 'bg-blue-500',
  },
  {
    id: 'in_review',
    label: 'In Review',
    color: 'bg-amber-50 text-amber-700',
    dotColor: 'bg-amber-500',
  },
  {
    id: 'done',
    label: 'Done',
    color: 'bg-emerald-50 text-emerald-700',
    dotColor: 'bg-emerald-500',
  },
];

export default function KanbanColumns({
  tasks,
  onTaskClick,
  onStatusChange,
  selectedTaskId,
}: KanbanColumnsProps) {
  const [localTasks, setLocalTasks] = useState(tasks);

  React.useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const getColumnTasks = (status: Task['status']) =>
    localTasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index)
      return;

    const newStatus = destination.droppableId as Task['status'];
    // BACKEND INTEGRATION: Supabase update task status and order
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === draggableId ? { ...t, status: newStatus, order: destination.index } : t
      )
    );
    onStatusChange(draggableId, newStatus);

    const col = COLUMNS.find((c) => c.id === newStatus);
    toast.success(`Task moved to ${col?.label}`);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-0 h-full overflow-x-auto scrollbar-thin">
        {COLUMNS.map((col) => {
          const colTasks = getColumnTasks(col.id);
          return (
            <div
              key={`col-${col.id}`}
              className="flex-shrink-0 w-72 xl:w-80 flex flex-col h-full border-r border-slate-200 last:border-r-0"
            >
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
                          <Icon
                            name="ClipboardDocumentListIcon"
                            size={18}
                            className="text-slate-400"
                          />
                        </div>
                        <p className="text-xs text-slate-400 font-500">No tasks here</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Drag a card or create a new task
                        </p>
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
  );
}
