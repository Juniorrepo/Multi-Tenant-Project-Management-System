import React from 'react';
import { Calendar, Users, TrendingUp, MoreVertical } from 'lucide-react';
import { Project, TaskStatus } from '../types';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onView: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onView, onDelete }: ProjectCardProps) {
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
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card hover className="group cursor-pointer" onClick={() => onView(project)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Badge variant={getStatusVariant(project.status)} size="sm">
              {project.status.replace('_', ' ')}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              icon={MoreVertical}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity !p-1"
            >
              <span className="sr-only">More options</span>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{Math.round(project.taskStats.completionRate)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.taskStats.completionRate)}`}
                style={{ width: `${project.taskStats.completionRate}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-gray-900">{project.taskStats.total}</div>
              <div className="text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-blue-600">{project.taskStats.inProgress}</div>
              <div className="text-gray-500">In Progress</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-600">{project.taskStats.completed}</div>
              <div className="text-gray-500">Done</div>
            </div>
          </div>

          {/* Due Date */}
          {project.dueDate && (
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Due {formatDate(project.dueDate)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}