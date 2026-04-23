'use client';

import { useState } from 'react';
import { Task } from '@/hooks/useTasks';
import { useComments } from '@/hooks/useComments';

interface TaskPanelProps {
  task: Task | null;
  onClose: () => void;
}

export function TaskPanel({ task, onClose }: TaskPanelProps) {
  const { comments, addComment, isLoading: commentsLoading } = useComments(task?.id || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentions, setMentions] = useState<string[]>([]);

  if (!task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment(message, mentions);
      setMessage('');
      setMentions([]);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">{task.title}</h2>
            <p className="text-sm text-slate-600 mt-1">
              {task.project?.name} • {task.department?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex">
          {/* Left Panel */}
          <div className="flex-1 p-6 border-r border-slate-200">
            {/* Task Details */}
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : task.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    task.priority === 'critical'
                      ? 'bg-red-100 text-red-800'
                      : task.priority === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {task.priority}
                </span>
              </div>

              {task.assigned_to && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Assigned To
                  </label>
                  <div className="flex items-center gap-2">
                    {task.assigned_to.avatar_url && (
                      <img
                        src={task.assigned_to.avatar_url}
                        alt={task.assigned_to.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-sm text-slate-700">{task.assigned_to.full_name}</span>
                  </div>
                </div>
              )}

              {task.due_date && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <p className="text-sm text-slate-600">
                    {new Date(task.due_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <div className="mb-8">
                <h3 className="font-medium text-slate-900 mb-2">Description</h3>
                <p className="text-slate-600 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}
          </div>

          {/* Right Panel - Chat */}
          <div className="w-80 flex flex-col bg-slate-50">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <h3 className="font-medium text-slate-900 sticky top-0 bg-slate-50">
                Comments ({comments.length})
              </h3>

              {commentsLoading ? (
                <div className="text-center py-4 text-slate-500">Loading...</div>
              ) : comments.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-sm">No comments yet</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      {comment.author?.avatar_url && (
                        <img
                          src={comment.author.avatar_url}
                          alt={comment.author.full_name}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="text-sm font-medium text-slate-900">
                        {comment.author?.full_name || 'Unknown'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{comment.content}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="border-t border-slate-200 p-4">
              <form onSubmit={handleSubmit} className="space-y-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-2 border border-slate-300 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  disabled={isSubmitting}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white px-3 py-1 rounded text-sm font-medium transition"
                  >
                    {isSubmitting ? 'Sending...' : 'Comment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
