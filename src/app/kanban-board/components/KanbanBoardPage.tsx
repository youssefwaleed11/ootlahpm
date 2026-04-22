'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import KanbanHeader from './KanbanHeader';
import KanbanColumns from './KanbanColumns';
import TaskDetailPanel from './TaskDetailPanel';
import TaskChatPanel from './TaskChatPanel';
import { MOCK_TASKS, MOCK_PROJECTS, type Task, type TaskStatus } from '@/lib/mockData';
import { toast } from 'sonner';

export default function KanbanBoardPage() {
  const [selectedProjectId, setSelectedProjectId] = useState('proj-001');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [chatTaskOpen, setChatTaskOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setChatTaskOpen(false);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus, approvalComment?: string, approvedBy?: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const updates: Partial<Task> = { status: newStatus, updatedAt: new Date().toISOString() };
      if (approvalComment !== undefined) updates.approvalComment = approvalComment;
      if (approvedBy !== undefined) { updates.approvedBy = approvedBy; updates.completedAt = new Date().toISOString(); }
      if (newStatus === 'done' && !approvedBy) updates.completedAt = new Date().toISOString();
      // Check if any tasks are now unblocked
      const updatedTasks = prev.map(t2 => t2.id === taskId ? { ...t2, ...updates } : t2);
      if (newStatus === 'done') {
        updatedTasks.forEach(t2 => {
          if ((t2.blockedBy || []).includes(taskId)) {
            const allBlockersDone = (t2.blockedBy || []).every(bid => {
              const blocker = updatedTasks.find(x => x.id === bid);
              return blocker?.status === 'done';
            });
            if (allBlockersDone) {
              setTimeout(() => toast.success(`🔓 "${t2.title}" is now unblocked and ready to start!`), 300);
            }
          }
        });
      }
      return { ...t, ...updates };
    }));
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => {
        if (!prev) return null;
        const updates: Partial<Task> = { status: newStatus };
        if (approvalComment !== undefined) updates.approvalComment = approvalComment;
        if (approvedBy !== undefined) updates.approvedBy = approvedBy;
        return { ...prev, ...updates };
      });
    }
  };

  const handleTaskCreated = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const handleClosePanel = () => {
    setSelectedTask(null);
    setChatTaskOpen(false);
  };

  return (
    <AppLayout currentPath="/kanban-board">
      <div className="flex flex-col h-full -mx-4 lg:-mx-6 xl:-mx-8 2xl:-mx-10 -my-6">
        <KanbanHeader
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
          projects={MOCK_PROJECTS.filter(p => p.status !== 'archived')}
          onTaskCreated={handleTaskCreated}
        />
        <div className="flex flex-1 overflow-hidden">
          <div className={`flex-1 overflow-hidden transition-all duration-300 ${selectedTask ? 'lg:mr-0' : ''}`}>
            <KanbanColumns
              tasks={projectTasks}
              onTaskClick={handleTaskClick}
              onStatusChange={handleStatusChange}
              selectedTaskId={selectedTask?.id}
            />
          </div>

          {selectedTask && (
            <div className="flex border-l border-slate-200 slide-in-right">
              <TaskDetailPanel
                task={selectedTask}
                onClose={handleClosePanel}
                onUpdate={handleTaskUpdate}
                onOpenChat={() => setChatTaskOpen(!chatTaskOpen)}
                chatOpen={chatTaskOpen}
                allTasks={tasks}
              />
              {chatTaskOpen && (
                <TaskChatPanel
                  task={selectedTask}
                  onClose={() => setChatTaskOpen(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}