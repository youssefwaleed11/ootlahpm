'use client';

import { useEffect, useState } from 'react';

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  client_name?: string;
  status: 'active' | 'completed' | 'on_hold' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  budget?: number;
  start_date?: string;
  end_date?: string;
  created_by?: { full_name: string };
  department?: { name: string; color: string };
}

export function useProjects(departmentId?: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [departmentId]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const params = departmentId ? `?departmentId=${departmentId}` : '';

      const res = await fetch(`/api/projects${params}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch projects');
        return;
      }

      setProjects(data.projects || []);
      setError(null);
    } catch (err) {
      setError('Error fetching projects');
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (projectData: Partial<Project>) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to create project');
    }

    setProjects([...projects, data]);
    return data;
  };

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
    createProject,
  };
}
