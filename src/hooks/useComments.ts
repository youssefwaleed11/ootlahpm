'use client';

import { useEffect, useState } from 'react';

export interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
}

export interface Comment {
  id: string;
  task_id: string;
  author?: { id: string; full_name: string; avatar_url: string };
  content: string;
  mentions?: string[];
  attachments: Attachment[];
  created_at: string;
}

export function useComments(taskId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/comments?taskId=${taskId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch comments');
        return;
      }

      setComments(data.comments || []);
      setError(null);
    } catch (err) {
      setError('Error fetching comments');
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (content: string, mentions: string[] = []) => {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId,
        content,
        mentions,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to add comment');
    }

    setComments([...comments, { ...data, attachments: [] }]);
    return data;
  };

  return {
    comments,
    isLoading,
    error,
    refetch: fetchComments,
    addComment,
  };
}
