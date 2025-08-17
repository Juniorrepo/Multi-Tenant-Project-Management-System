import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { ArrowLeft, Calendar, Users, TrendingUp, Settings, Plus, List, Grid3X3 } from 'lucide-react';
import { GET_PROJECT } from '../graphql/queries';
import { Project, Task } from '../types';
import { Layout } from '../components/Layout';
import { TaskBoard } from '../components/TaskBoard';
import { TaskForm } from '../components/TaskForm';
import { TaskDetail } from '../components/TaskDetail';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';

interface ProjectViewProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectView({ projectId, onBack }: ProjectViewProps) {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  const { data, loading, error, refetch } = useQuery(GET_PROJECT, {
    variables: { id: projectId }
  });

  const project: Project | null = data?.project || null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'info';
      case 'COMPLETED': return 'success';
      case 'ON_HOLD': return 'warning';
      case 'ARCHIVED': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const handleTaskSuccess = () => {
    setShowCreateTask(false);
    setEditingTask(null);
    refetch();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Failed to load project</div>
          <Button onClick={onBack}>Back to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentView="project">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
              onClick={onBack}
              className="mt-1"
            >
              Back
            </Button>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <Badge variant={getStatusVariant(project.status)}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
              {project.description && (
                <p className="text-gray-600 max-w-3xl">{project.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex border border-gray-300 rounded-lg">
              <Button
                variant={viewMode === 'board' ? 'primary' : 'ghost'}
                size="sm"
                icon={Grid3X3}
                onClick={() => setViewMode('board')}
                className="rounded-r-none"
              >
                Board
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                icon={List}
                onClick={() => setViewMode('list')}
                className="rounded-l-none border-l-0"
              >
                List
              </Button>
            </div>
            <Button
              icon={Settings}
              variant="secondary"
              size="sm"
            >
              Settings
            </Button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{project.taskStats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <List className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{project.taskStats.inProgress}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{project.taskStats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(project.dueDate)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Project Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {Math.round(project.taskStats.completionRate)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${project.taskStats.completionRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Task Board */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
            <Button
              icon={Plus}
              onClick={() => setShowCreateTask(true)}
            >
              Add Task
            </Button>
          </div>

          {viewMode === 'board' ? (
            <TaskBoard
              tasks={project.tasks}
              projectId={project.id}
              onCreateTask={() => setShowCreateTask(true)}
              onEditTask={setEditingTask}
              onViewTask={setSelectedTask}
            />
          ) : (
            <div className="space-y-3">
              {project.tasks.map(task => (
                <Card key={task.id} hover onClick={() => setSelectedTask(task)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 truncate mt-1">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <Badge variant={task.status === 'TODO' ? 'default' : task.status === 'IN_PROGRESS' ? 'info' : 'success'}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        {task.assigneeEmail && (
                          <div className="text-sm text-gray-500">
                            {task.assigneeEmail.split('@')[0]}
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="text-sm text-gray-500">
                            {formatDate(task.dueDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {project.tasks.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <List className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No tasks yet</p>
                  <p className="text-sm">Create your first task to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        title="Create New Task"
        size="lg"
      >
        <TaskForm
          projectId={project.id}
          onSuccess={handleTaskSuccess}
          onCancel={() => setShowCreateTask(false)}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
        size="lg"
      >
        {editingTask && (
          <TaskForm
            projectId={project.id}
            task={editingTask}
            onSuccess={handleTaskSuccess}
            onCancel={() => setEditingTask(null)}
          />
        )}
      </Modal>

      {/* Task Detail Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Task Details"
        size="xl"
      >
        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            onEdit={(task) => {
              setSelectedTask(null);
              setEditingTask(task);
            }}
          />
        )}
      </Modal>
    </Layout>
  );
}