import { gql } from '@apollo/client';

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!, $organizationSlug: String!) {
    createProject(input: $input, organizationSlug: $organizationSlug) {
      id
      name
      description
      status
      dueDate
      createdAt
      taskStats {
        total
        completed
        inProgress
        todo
        completionRate
      }
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      id
      name
      description
      status
      dueDate
      taskStats {
        total
        completed
        inProgress
        todo
        completionRate
      }
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      status
      assigneeEmail
      dueDate
      createdAt
      project {
        id
        taskStats {
          total
          completed
          inProgress
          todo
          completionRate
        }
      }
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      id
      title
      description
      status
      assigneeEmail
      dueDate
      project {
        id
        taskStats {
          total
          completed
          inProgress
          todo
          completionRate
        }
      }
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id
      project {
        id
        taskStats {
          total
          completed
          inProgress
          todo
          completionRate
        }
      }
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      content
      authorEmail
      createdAt
      task {
        id
        comments {
          id
          content
          authorEmail
          createdAt
        }
      }
    }
  }
`;