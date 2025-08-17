import { gql } from '@apollo/client';

export const GET_ORGANIZATION = gql`
  query GetOrganization($slug: String!) {
    organization(slug: $slug) {
      id
      name
      slug
      contactEmail
      createdAt
    }
  }
`;

export const GET_PROJECTS = gql`
  query GetProjects($organizationSlug: String) {
    projects(organizationSlug: $organizationSlug) {
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
      tasks {
        id
        title
        status
      }
    }
  }
`;

export const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
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
      tasks {
        id
        title
        description
        status
        assigneeEmail
        dueDate
        createdAt
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

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      status
      assigneeEmail
      dueDate
      createdAt
      project {
        id
        name
      }
      comments {
        id
        content
        authorEmail
        createdAt
      }
    }
  }
`;