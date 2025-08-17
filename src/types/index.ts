export interface Organization {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  dueDate?: string;
  createdAt: string;
  organization: Organization;
  tasks: Task[];
  taskStats: TaskStats;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeEmail?: string;
  dueDate?: string;
  createdAt: string;
  project: Project;
  comments: TaskComment[];
}

export interface TaskComment {
  id: string;
  content: string;
  authorEmail: string;
  createdAt: string;
  task: Task;
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  completionRate: number;
}

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'ARCHIVED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface CreateProjectInput {
  name: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  dueDate?: string;
}

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  assigneeEmail?: string;
  dueDate?: string;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  assigneeEmail?: string;
  dueDate?: string;
}

export interface CreateCommentInput {
  taskId: string;
  content: string;
  authorEmail: string;
}