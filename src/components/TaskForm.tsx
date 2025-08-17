import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_TASK, UPDATE_TASK } from '../graphql/mutations';
import { GET_PROJECT } from '../graphql/queries';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface TaskFormProps {
  projectId: string;
  task?: Task;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TaskForm({ projectId, task, onSuccess, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assigneeEmail: task?.assigneeEmail || '',
    dueDate: task?.dueDate?.split('T')[0] || '',
    status: task?.status || 'TODO'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createTask, { loading: creating }] = useMutation(CREATE_TASK, {
    refetchQueries: [{ query: GET_PROJECT, variables: { id: projectId } }]
  });

  const [updateTask, { loading: updating }] = useMutation(UPDATE_TASK, {
    refetchQueries: [{ query: GET_PROJECT, variables: { id: projectId } }]
  });

  const loading = creating || updating;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Task title must be less than 200 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (formData.assigneeEmail && !isValidEmail(formData.assigneeEmail)) {
      newErrors.assigneeEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (task) {
        // Update existing task
        const input: UpdateTaskInput = {
          id: task.id,
          title: formData.title,
          description: formData.description || undefined,
          status: formData.status as any,
          assigneeEmail: formData.assigneeEmail || undefined,
          dueDate: formData.dueDate || undefined
        };
        await updateTask({ variables: { input } });
      } else {
        // Create new task
        const input: CreateTaskInput = {
          projectId,
          title: formData.title,
          description: formData.description || undefined,
          assigneeEmail: formData.assigneeEmail || undefined,
          dueDate: formData.dueDate || undefined
        };
        await createTask({ variables: { input } });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save task:', error);
      setErrors({ submit: 'Failed to save task. Please try again.' });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Task Title"
        type="text"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        error={errors.title}
        placeholder="Enter task title"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className={`
            block w-full px-3 py-2 border rounded-lg text-sm resize-none
            ${errors.description 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors
          `}
          rows={4}
          placeholder="Describe the task (optional)"
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Assignee Email"
          type="email"
          value={formData.assigneeEmail}
          onChange={(e) => handleChange('assigneeEmail', e.target.value)}
          error={errors.assigneeEmail}
          placeholder="user@example.com"
        />

        <Input
          label="Due Date"
          type="date"
          value={formData.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
        />
      </div>

      {task && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      )}

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}