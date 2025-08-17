export const typeDefs = `#graphql
  scalar DateTime

  type Organization {
    id: ID!
    name: String!
    slug: String!
    contactEmail: String!
    createdAt: DateTime!
  }

  type Project {
    id: ID!
    name: String!
    description: String
    status: ProjectStatus!
    dueDate: String
    createdAt: DateTime!
    organization: Organization!
    tasks: [Task!]!
    taskStats: TaskStats!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: TaskStatus!
    assigneeEmail: String
    dueDate: DateTime
    createdAt: DateTime!
    project: Project!
    comments: [TaskComment!]!
  }

  type TaskComment {
    id: ID!
    content: String!
    authorEmail: String!
    createdAt: DateTime!
    task: Task!
  }

  type TaskStats {
    total: Int!
    completed: Int!
    inProgress: Int!
    todo: Int!
    completionRate: Float!
  }

  enum ProjectStatus {
    ACTIVE
    COMPLETED
    ON_HOLD
    ARCHIVED
  }

  enum TaskStatus {
    TODO
    IN_PROGRESS
    DONE
  }

  input CreateProjectInput {
    name: String!
    description: String
    dueDate: String
  }

  input UpdateProjectInput {
    id: ID!
    name: String
    description: String
    status: ProjectStatus
    dueDate: String
  }

  input CreateTaskInput {
    projectId: ID!
    title: String!
    description: String
    assigneeEmail: String
    dueDate: DateTime
  }

  input UpdateTaskInput {
    id: ID!
    title: String
    description: String
    status: TaskStatus
    assigneeEmail: String
    dueDate: DateTime
  }

  input CreateCommentInput {
    taskId: ID!
    content: String!
    authorEmail: String!
  }

  type Query {
    organization(slug: String!): Organization
    projects: [Project!]!
    project(id: ID!): Project
    task(id: ID!): Task
  }

  type Mutation {
    createProject(input: CreateProjectInput!): Project!
    updateProject(input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
    
    createTask(input: CreateTaskInput!): Task!
    updateTask(input: UpdateTaskInput!): Task!
    deleteTask(id: ID!): Task!
    
    createComment(input: CreateCommentInput!): TaskComment!
  }
`;