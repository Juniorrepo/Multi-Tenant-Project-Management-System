import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Calendar, User, MessageCircle, Plus, Send } from 'lucide-react';
import { Task, CreateCommentInput } from '../types';
import { CREATE_COMMENT } from '../graphql/mutations';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface TaskDetailProps {
  task: Task;
  currentUserEmail?: string;
  onEdit: (task: Task) => void;
}

export function TaskDetail({ task, currentUserEmail = 'user@example.com', onEdit }: TaskDetailProps) {
  const [commentContent, setCommentContent] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  
  const [createComment, { loading: creating }] = useMutation(CREATE_COMMENT);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'TODO': return 'default';
      case 'IN_PROGRESS': return 'info';
      case 'DONE': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDateShort = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && task.status !== 'DONE';
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentContent.trim()) return;

    try {
      const input: CreateCommentInput = {
        taskId: task.id,
        content: commentContent,
        authorEmail: currentUserEmail
      };
      
      await createComment({ variables: { input } });
      setCommentContent('');
      setShowCommentForm(false);
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {task.title}
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <Badge variant={getStatusVariant(task.status)} size="md">
              {task.status.replace('_', ' ')}
            </Badge>
            <span>in {task.project.name}</span>
            {isOverdue(task.dueDate) && (
              <Badge variant="danger" size="sm">
                Overdue
              </Badge>
            )}
          </div>
        </div>
        <Button onClick={() => onEdit(task)}>
          Edit Task
        </Button>
      </div>

      {/* Task Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Comments ({task.comments.length})
              </h3>
              <Button
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => setShowCommentForm(!showCommentForm)}
              >
                Add Comment
              </Button>
            </div>

            {showCommentForm && (
              <form onSubmit={handleCreateComment} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write a comment..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors"
                    rows={3}
                    required
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCommentForm(false);
                        setCommentContent('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      icon={Send}
                      loading={creating}
                      disabled={!commentContent.trim()}
                    >
                      Post Comment
                    </Button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {task.comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No comments yet</p>
                  <p className="text-sm">Be the first to add a comment!</p>
                </div>
              ) : (
                task.comments.map(comment => (
                  <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            {comment.authorEmail.split('@')[0]}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap ml-10">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-gray-900">Details</h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant={getStatusVariant(task.status)} size="sm">
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>

              {task.assigneeEmail && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Assignee:</span>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span className="font-medium">
                      {task.assigneeEmail.split('@')[0]}
                    </span>
                  </div>
                </div>
              )}

              {task.dueDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <div className={`flex items-center ${
                    isOverdue(task.dueDate) ? 'text-red-600' : ''
                  }`}>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDateShort(task.dueDate)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span>{formatDateShort(task.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}