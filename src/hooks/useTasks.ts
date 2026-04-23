'use client';

import { useEffect, useState } from 'react';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: { id: string; full_name: string; avatar_url: string };
  created_by?: { id: string; full_name: string };
  project?: { name: string };
  department?: { name: string; color: string };
  due_date?: string;
  completed_at?: string;
  created_at: string;
}

interface UseTasksOptions {
  projectId?: string;
  departmentId?: string;
  status?: string;
  assignedTo?: string;
}

export function useTasks(options?: UseTasksOptions) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [options?.projectId, options?.departmentId, options?.status]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();

      if (options?.projectId) params.set('projectId', options.projectId);
      if (options?.departmentId) params.set('departmentId', options.departmentId);
      if (options?.status) params.set('status', options.status);
      if (options?.assignedTo) params.set('assignedTo', options.assignedTo);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch tasks');
        return;
      }

      setTasks(data.tasks || []);
      setError(null);
    } catch (err) {
      setError('Error fetching tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (taskData: Partial<Task>) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to create task');
    }

    setTasks([...tasks, data]);
    return data;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const res = await fetch(`/api/tasks?id=${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to update task');
    }

    setTasks(tasks.map((t) => (t.id === taskId ? data : t)));
    return data;
  };

  return {
    tasks,
    isLoading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
  };
}
