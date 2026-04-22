'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  mentions: string[];
  attachments: { name: string; url: string }[];
  timestamp: string;
}

interface TaskDetailPanelProps {
  taskId?: string;
  taskTitle?: string;
  taskDescription?: string;
  taskStatus?: string;
  taskPriority?: string;
  assignee?: string;
  dueDate?: string;
  onClose?: () => void;
}

export default function TaskDetailPanel({
  taskId = '1',
  taskTitle = 'Review Q2 Marketing Strategy',
  taskDescription = 'Complete review of Q2 marketing strategy including budget allocation, timeline, and KPIs.',
  taskStatus = 'in_progress',
  taskPriority = 'high',
  assignee = 'Layla Ahmed',
  dueDate = '2024-04-25',
  onClose,
}: TaskDetailPanelProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Omar Hassan',
      avatar: 'O',
      content: 'I have reviewed the first draft. Please update the budget section with the latest figures.',
      mentions: ['@Layla'],
      attachments: [],
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      author: 'Layla Ahmed',
      avatar: 'L',
      content: '@Omar I will update the budget section by tomorrow morning.',
      mentions: ['@Omar'],
      attachments: [],
      timestamp: '1 hour ago',
    },
  ]);

  const [newComment, setNewComment] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showMentions, setShowMentions] = useState(false);

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `${comments.length + 1}`,
      author: 'Layla Ahmed',
      avatar: 'L',
      content: newComment,
      mentions: newComment.match(/@\w+/g) || [],
      attachments: attachedFiles.map(f => ({ name: f.name, url: '#' })),
      timestamp: 'just now',
    };

    setComments([...comments, comment]);
    setNewComment('');
    setAttachedFiles([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_review':
        return 'bg-blue-100 text-blue-700';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 p-6 flex items-start justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-800 text-slate-900 mb-2">{taskTitle}</h1>
          <p className="text-sm text-slate-600 mb-3">Task #{taskId}</p>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-600 ${getPriorityColor(taskPriority)}`}>
              {taskPriority}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-600 ${getStatusColor(taskStatus)}`}>
              {taskStatus.replace('_', ' ')}
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Task Details */}
        <div className="border-b border-slate-200 p-6 flex-shrink-0">
          <h2 className="text-sm font-700 text-slate-900 uppercase mb-4">Description</h2>
          <p className="text-slate-700 leading-relaxed mb-6">{taskDescription}</p>

          <h2 className="text-sm font-700 text-slate-900 uppercase mb-4">Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-600 text-slate-600 uppercase mb-1">Assigned To</p>
              <p className="text-sm font-600 text-slate-900">{assignee}</p>
            </div>
            <div>
              <p className="text-xs font-600 text-slate-600 uppercase mb-1">Due Date</p>
              <p className="text-sm font-600 text-slate-900">{new Date(dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 flex-shrink-0">
            <h2 className="text-sm font-700 text-slate-900 uppercase mb-4">Comments & Updates</h2>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xs font-700 flex-shrink-0">
                  {comment.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-600 text-slate-900 text-sm">{comment.author}</p>
                    <p className="text-xs text-slate-500">{comment.timestamp}</p>
                  </div>
                  <p className="text-sm text-slate-700 break-words">{comment.content}</p>
                  {comment.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {comment.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs text-slate-700 hover:bg-slate-200 cursor-pointer"
                        >
                          <Icon name="PaperClipIcon" size={12} />
                          {att.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Comment Input */}
          <div className="border-t border-slate-200 p-6 flex-shrink-0 space-y-3">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  setShowMentions(e.target.value.includes('@'));
                }}
                placeholder="Add a comment... Use @mentions to notify team members"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm"
                rows={3}
              />
              
              {/* Mentions Dropdown */}
              {showMentions && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {['Layla Ahmed', 'Omar Hassan', 'Nour Ibrahim', 'Sara Mohamed'].map(name => (
                    <button
                      key={name}
                      onClick={() => {
                        setNewComment(prev => prev + name.split(' ')[0]);
                        setShowMentions(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 text-sm text-slate-700 border-b border-slate-100 last:border-b-0"
                    >
                      @{name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Attachments */}
            <div>
              <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <Icon name="PaperClipIcon" size={16} className="text-slate-600" />
                <span className="text-sm font-600 text-slate-700">Attach files</span>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setAttachedFiles(Array.from(e.target.files));
                    }
                  }}
                  className="hidden"
                />
              </label>

              {attachedFiles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {attachedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-700"
                    >
                      <Icon name="DocumentIcon" size={14} />
                      <span>{file.name}</span>
                      <button
                        onClick={() => setAttachedFiles(attachedFiles.filter((_, i) => i !== idx))}
                        className="ml-1 hover:text-red-600"
                      >
                        <Icon name="XMarkIcon" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Icon name="FaceSmileIcon" size={18} />
                <span className="text-xs font-600">Add emoji</span>
              </button>
              <button
                onClick={handleCommentSubmit}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-lg font-600 transition-colors text-sm"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
