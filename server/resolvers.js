import { v4 as uuidv4 } from 'uuid';
import { dbGet, dbAll, dbRun } from './database.js';

// Helper function to calculate task statistics
const getTaskStats = async (projectId) => {
  const tasks = await dbAll(
    'SELECT status FROM tasks WHERE project_id = ?',
    [projectId]
  );

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'DONE').length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const todo = tasks.filter(t => t.status === 'TODO').length;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  return {
    total,
    completed,
    inProgress,
    todo,
    completionRate
  };
};

// Helper function to get organization by slug
const getOrganizationBySlug = async (slug) => {
  return await dbGet('SELECT * FROM organizations WHERE slug = ?', [slug]);
};

export const resolvers = {
  Query: {
    organization: async (_, { slug }) => {
      return await getOrganizationBySlug(slug);
    },

    projects: async (_, __, { organizationSlug }) => {
      const org = await getOrganizationBySlug(organizationSlug);
      if (!org) throw new Error('Organization not found');

      const projects = await dbAll(
        'SELECT * FROM projects WHERE organization_id = ? ORDER BY created_at DESC',
        [org.id]
      );

      // Add task statistics to each project
      for (const project of projects) {
        project.taskStats = await getTaskStats(project.id);
        project.tasks = await dbAll('SELECT * FROM tasks WHERE project_id = ?', [project.id]);
        project.organization = org;
      }

      return projects;
    },

    project: async (_, { id }, { organizationSlug }) => {
      const org = await getOrganizationBySlug(organizationSlug);
      if (!org) throw new Error('Organization not found');

      const project = await dbGet(
        'SELECT * FROM projects WHERE id = ? AND organization_id = ?',
        [id, org.id]
      );

      if (!project) return null;

      // Get tasks with comments
      const tasks = await dbAll('SELECT * FROM tasks WHERE project_id = ?', [project.id]);
      
      for (const task of tasks) {
        task.comments = await dbAll('SELECT * FROM task_comments WHERE task_id = ?', [task.id]);
        task.project = project;
      }

      project.tasks = tasks;
      project.taskStats = await getTaskStats(project.id);
      project.organization = org;

      return project;
    },

    task: async (_, { id }, { organizationSlug }) => {
      const task = await dbGet('SELECT * FROM tasks WHERE id = ?', [id]);
      if (!task) return null;

      const project = await dbGet('SELECT * FROM projects WHERE id = ?', [task.project_id]);
      const org = await getOrganizationBySlug(organizationSlug);

      if (!project || project.organization_id !== org.id) {
        throw new Error('Task not found or access denied');
      }

      task.project = project;
      task.comments = await dbAll('SELECT * FROM task_comments WHERE task_id = ?', [task.id]);

      return task;
    }
  },

  Mutation: {
    createProject: async (_, { input }, { organizationSlug }) => {
      const org = await getOrganizationBySlug(organizationSlug);
      if (!org) throw new Error('Organization not found');

      const id = uuidv4();
      
      await dbRun(`
        INSERT INTO projects (id, organization_id, name, description, due_date)
        VALUES (?, ?, ?, ?, ?)
      `, [id, org.id, input.name, input.description, input.dueDate]);

      const project = await dbGet('SELECT * FROM projects WHERE id = ?', [id]);
      project.taskStats = await getTaskStats(id);
      project.tasks = [];
      project.organization = org;

      return project;
    },

    updateProject: async (_, { input }, { organizationSlug }) => {
      const org = await getOrganizationBySlug(organizationSlug);
      if (!org) throw new Error('Organization not found');

      const project = await dbGet(
        'SELECT * FROM projects WHERE id = ? AND organization_id = ?',
        [input.id, org.id]
      );

      if (!project) throw new Error('Project not found');

      const updateFields = [];
      const updateValues = [];

      if (input.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(input.name);
      }
      if (input.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(input.description);
      }
      if (input.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(input.status);
      }
      if (input.dueDate !== undefined) {
        updateFields.push('due_date = ?');
        updateValues.push(input.dueDate);
      }

      if (updateFields.length > 0) {
        updateValues.push(input.id);
        await dbRun(
          `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }

      const updatedProject = await dbGet('SELECT * FROM projects WHERE id = ?', [input.id]);
      updatedProject.taskStats = await getTaskStats(input.id);
      updatedProject.tasks = await dbAll('SELECT * FROM tasks WHERE project_id = ?', [input.id]);
      updatedProject.organization = org;

      return updatedProject;
    },

    deleteProject: async (_, { id }, { organizationSlug }) => {
      const org = await getOrganizationBySlug(organizationSlug);
      if (!org) throw new Error('Organization not found');

      const project = await dbGet(
        'SELECT * FROM projects WHERE id = ? AND organization_id = ?',
        [id, org.id]
      );

      if (!project) throw new Error('Project not found');

      await dbRun('DELETE FROM projects WHERE id = ?', [id]);
      return true;
    },

    createTask: async (_, { input }, { organizationSlug }) => {
      const org = await getOrganizationBySlug(organizationSlug);
      if (!org) throw new Error('Organization not found');

      const project = await dbGet(
        'SELECT * FROM projects WHERE id = ? AND organization_id = ?',
        [input.projectId, org.id]
      );

      if (!project) throw new Error('Project not found');

      const id = uuidv4();
      
      await dbRun(`
        INSERT INTO tasks (id, project_id, title, description, assignee_email, due_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [id, input.projectId, input.title, input.description, input.assigneeEmail, input.dueDate]);

      const task = await dbGet('SELECT * FROM tasks WHERE id = ?', [id]);
      task.project = { ...project, taskStats: await getTaskStats(input.projectId) };
      task.comments = [];

      return task;
    },

    updateTask: async (_, { input }, { organizationSlug }) => {
      const org = await getOrganizationBySlug(organizationSlug);
      if (!org) throw new Error('Organization not found');

      const task = await dbGet('SELECT * FROM tasks WHERE id = ?', [input.id]);
      if (!task) throw new Error('Task not found');

      const project = await dbGet(
        'SELECT * FROM projects WHERE id = ? AND organization_id = ?',
        [task.project_id, org.id]
      );

      if (!project) throw new Error('Access denied');

      const updateFields = [];
      const updateValues = [];

      if (input.title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(input.title);
      }
      if (input.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(input.description);
      }
      if (input.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(input.status);
      }
      if (input.assigneeEmail !== undefined) {
        updateFields.push('assignee_email = ?');
        updateValues.push(input.assigneeEmail);
      }
      if (input.dueDate !== undefined) {
        updateFields.push('due_date = ?');
        updateValues.push(input.dueDate);
      }

      if (updateFields.length > 0) {
        updateValues.push(input.id);
        await dbRun(
          `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }

      const updatedTask = await dbGet('SELECT * FROM tasks WHERE id = ?', [input.id]);
      updatedTask.project = { ...project, taskStats: await getTaskStats(project.id) };
      updatedTask.comments = await dbAll('SELECT * FROM task_comments WHERE task_id = ?', [input.id]);

      return updatedTask;
    },

    deleteTask: async (_, { id }, { organizationSlug }) => {
      const org = await getOrganizationBySlug(organizationSlug);
      if (!org) throw new Error('Organization not found');

      const task = await dbGet('SELECT * FROM tasks WHERE id = ?', [id]);
      if (!task) throw new Error('Task not found');

      const project = await dbGet(
        'SELECT * FROM projects WHERE id = ? AND organization_id = ?',
        [task.project_id, org.id]
      );

      if (!project) throw new Error('Access denied');

      await dbRun('DELETE FROM tasks WHERE id = ?', [id]);
      
      return {
        id,
        project: { ...project, taskStats: await getTaskStats(project.id) }
      };
    },

    createComment: async (_, { input }, { organizationSlug }) => {
      const org = await getOrganizationBySlug(organizationSlug);
      if (!org) throw new Error('Organization not found');

      const task = await dbGet('SELECT * FROM tasks WHERE id = ?', [input.taskId]);
      if (!task) throw new Error('Task not found');

      const project = await dbGet(
        'SELECT * FROM projects WHERE id = ? AND organization_id = ?',
        [task.project_id, org.id]
      );

      if (!project) throw new Error('Access denied');

      const id = uuidv4();
      
      await dbRun(`
        INSERT INTO task_comments (id, task_id, content, author_email)
        VALUES (?, ?, ?, ?)
      `, [id, input.taskId, input.content, input.authorEmail]);

      const comment = await dbGet('SELECT * FROM task_comments WHERE id = ?', [id]);
      const updatedTask = await dbGet('SELECT * FROM tasks WHERE id = ?', [input.taskId]);
      updatedTask.comments = await dbAll('SELECT * FROM task_comments WHERE task_id = ?', [input.taskId]);

      comment.task = updatedTask;

      return comment;
    }
  }
};