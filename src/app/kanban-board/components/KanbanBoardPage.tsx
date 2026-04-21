'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import KanbanHeader from './KanbanHeader';
import KanbanColumns from './KanbanColumns';
import TaskDetailPanel from './TaskDetailPanel';
import TaskChatPanel from './TaskChatPanel';
import { MOCK_TASKS, MOCK_PROJECTS, type Task } from '@/lib/mockData';

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
    // BACKEND INTEGRATION: Supabase update task + trigger real-time notification
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    // BACKEND INTEGRATION: Supabase update task status + send Resend email if assigned user
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t));
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
    }
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
        />
        <div className="flex flex-1 overflow-hidden">
          {/* Kanban board */}
          <div className={`flex-1 overflow-hidden transition-all duration-300 ${selectedTask ? 'lg:mr-0' : ''}`}>
            <KanbanColumns
              tasks={projectTasks}
              onTaskClick={handleTaskClick}
              onStatusChange={handleStatusChange}
              selectedTaskId={selectedTask?.id}
            />
          </div>

          {/* Task detail + chat panels */}
          {selectedTask && (
            <div className="flex border-l border-slate-200 slide-in-right">
              <TaskDetailPanel
                task={selectedTask}
                onClose={handleClosePanel}
                onUpdate={handleTaskUpdate}
                onOpenChat={() => setChatTaskOpen(!chatTaskOpen)}
                chatOpen={chatTaskOpen}
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