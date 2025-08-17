import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Plus, Calendar, User, MessageCircle } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { UPDATE_TASK } from '../graphql/mutations';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface TaskBoardProps {
  tasks: Task[];
  projectId: string;
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
}

const COLUMNS = [
  { id: 'TODO' as TaskStatus, title: 'To Do', color: 'border-gray-300' },
  { id: 'IN_PROGRESS' as TaskStatus, title: 'In Progress', color: 'border-blue-300' },
  { id: 'DONE' as TaskStatus, title: 'Done', color: 'border-green-300' }
];

export function TaskBoard({ tasks, projectId, onCreateTask, onEditTask, onViewTask }: TaskBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [updateTask] = useMutation(UPDATE_TASK);

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask.status === status) {
      setDraggedTask(null);
      return;
    }

    try {
      await updateTask({
        variables: {
          input: {
            id: draggedTask.id,
            status
          }
        }
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }

    setDraggedTask(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {COLUMNS.map(column => {
        const columnTasks = getTasksByStatus(column.id);
        
        return (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center">
                {column.title}
                <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {columnTasks.length}
                </span>
              </h3>
              {column.id === 'TODO' && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Plus}
                  onClick={onCreateTask}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Add
                </Button>
              )}
            </div>

            <div
              className={`min-h-96 border-2 border-dashed rounded-lg p-4 transition-colors ${
                draggedTask && draggedTask.status !== column.id
                  ? 'border-blue-300 bg-blue-50'
                  : column.color
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="space-y-3">
                {columnTasks.map(task => (
                  <Card
                    key={task.id}
                    className={`cursor-move transition-transform hover:scale-105 ${
                      draggedTask?.id === task.id ? 'opacity-50' : ''
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => onViewTask(task)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 line-clamp-2">
                          {task.title}
                        </h4>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-3">
                            {task.assigneeEmail && (
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                <span className="truncate max-w-20">
                                  {task.assigneeEmail.split('@')[0]}
                                </span>
                              </div>
                            )}
                            {task.dueDate && (
                              <div className={`flex items-center ${
                                isOverdue(task.dueDate) ? 'text-red-600' : ''
                              }`}>
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{formatDate(task.dueDate)}</span>
                              </div>
                            )}
                          </div>
                          
                          {task.comments.length > 0 && (
                            <div className="flex items-center">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              <span>{task.comments.length}</span>
                            </div>
                          )}
                        </div>
                        
                        {isOverdue(task.dueDate) && task.status !== 'DONE' && (
                          <Badge variant="danger" size="sm">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-sm">No tasks yet</div>
                    {column.id === 'TODO' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCreateTask}
                        className="mt-2"
                      >
                        Create your first task
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}