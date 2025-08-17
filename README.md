# Project Management System

A modern, multi-tenant project management system built with Django + GraphQL backend and React + TypeScript frontend.

## 🚀 Features

### Backend (Django + GraphQL)
- **Multi-tenant Architecture**: Organization-based data isolation
- **Core Models**: Organization, Project, Task, TaskComment
- **GraphQL API**: Full CRUD operations with proper relationships
- **Data Validation**: Email validation, field constraints
- **Admin Interface**: Django admin for data management

### Frontend (React + TypeScript)
- **Modern UI**: Clean, responsive design with TailwindCSS
- **Project Dashboard**: List view with filtering and search
- **Task Management**: Board view with status updates
- **Comment System**: Real-time task comments
- **Form Validation**: Client-side validation with error handling
- **Apollo Client**: GraphQL integration with caching

## 🛠 Tech Stack

### Backend
- **Django 4.2.7**: Web framework
- **Django REST Framework**: API framework
- **Graphene-Django**: GraphQL implementation
- **PostgreSQL**: Database
- **Django CORS Headers**: Cross-origin resource sharing

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Apollo Client**: GraphQL client
- **TailwindCSS**: Styling
- **Vite**: Build tool
- **Lucide React**: Icons

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL
- Docker (optional)

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-management-system
   ```

2. **Start the services**
   ```bash
   docker-compose up -d
   ```

3. **Run migrations and setup data**
   ```bash
   docker-compose exec django python manage.py migrate
   docker-compose exec django python manage.py setup_sample_data
   ```

4. **Start the frontend**
   ```bash
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - GraphQL Playground: http://localhost:8000/graphql/
   - Django Admin: http://localhost:8000/admin/

### Option 2: Local Development

1. **Setup PostgreSQL**
   ```bash
   # Create database
   createdb project_management
   ```

2. **Setup Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Setup Django**
   ```bash
   python manage.py migrate
   python manage.py setup_sample_data
   python manage.py runserver
   ```

4. **Setup Frontend**
   ```bash
   npm install
   npm run dev
   ```

## 📊 Sample Data

The system comes with sample data for demonstration:

### Organizations
- **Demo Organization** (slug: `demo-org`)
- **Tech Startup Inc.** (slug: `tech-startup`)

### Sample Projects
- Website Redesign
- Mobile App Development
- Marketing Campaign
- MVP Development

## 🔌 API Documentation

### GraphQL Endpoint
```
POST http://localhost:8000/graphql/
```

### Key Queries

#### Get Projects for Organization
```graphql
query GetProjects($organizationSlug: String) {
  projects(organizationSlug: $organizationSlug) {
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
```

#### Get Single Project with Tasks
```graphql
query GetProject($id: ID!) {
  project(id: $id) {
    id
    name
    description
    status
    tasks {
      id
      title
      status
      assigneeEmail
      comments {
        id
        content
        authorEmail
        createdAt
      }
    }
  }
}
```

### Key Mutations

#### Create Project
```graphql
mutation CreateProject($input: CreateProjectInput!, $organizationSlug: String!) {
  createProject(input: $input, organizationSlug: $organizationSlug) {
    id
    name
    description
    status
  }
}
```

#### Create Task
```graphql
mutation CreateTask($input: CreateTaskInput!) {
  createTask(input: $input) {
    id
    title
    description
    status
    assigneeEmail
  }
}
```

#### Add Comment
```graphql
mutation CreateComment($input: CreateCommentInput!) {
  createComment(input: $input) {
    id
    content
    authorEmail
    createdAt
  }
}
```

## 🏗 Project Structure

```
project/
├── project_management/          # Django project settings
├── projects/                    # Django app
│   ├── models.py               # Data models
│   ├── schema.py               # GraphQL schema
│   ├── admin.py                # Admin interface
│   └── management/             # Custom commands
├── src/                        # React frontend
│   ├── components/             # Reusable components
│   ├── pages/                  # Page components
│   ├── graphql/                # GraphQL queries/mutations
│   ├── types/                  # TypeScript interfaces
│   └── lib/                    # Utilities
├── requirements.txt            # Python dependencies
├── package.json               # Node.js dependencies
├── docker-compose.yml         # Docker setup
└── README.md                  # This file
```

## 🔐 Multi-tenancy

The system implements organization-based multi-tenancy:

- All data is scoped to organizations
- Projects belong to organizations
- Tasks belong to projects (and inherit organization)
- Comments belong to tasks (and inherit organization)
- GraphQL queries filter by organization slug

## 🧪 Testing

### Backend Tests
```bash
python manage.py test
```

### Frontend Tests
```bash
npm test
```

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
   ```bash
   DEBUG=False
   SECRET_KEY=your-secret-key
   DB_HOST=your-db-host
   DB_NAME=your-db-name
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   ```

2. **Static Files**
   ```bash
   python manage.py collectstatic
   ```

3. **Database**
   ```bash
   python manage.py migrate
   ```

## 🔧 Development Commands

### Django
```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Setup sample data
python manage.py setup_sample_data

# Run tests
python manage.py test

# Start development server
python manage.py runserver
```

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## 📝 API Examples

### Create a Project
```javascript
const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!, $organizationSlug: String!) {
    createProject(input: $input, organizationSlug: $organizationSlug) {
      id
      name
      description
      status
    }
  }
`;

// Usage
const [createProject] = useMutation(CREATE_PROJECT);
await createProject({
  variables: {
    input: {
      name: "New Project",
      description: "Project description",
      dueDate: "2024-12-31"
    },
    organizationSlug: "demo-org"
  }
});
```

### Get Projects with Tasks
```javascript
const GET_PROJECTS = gql`
  query GetProjects($organizationSlug: String) {
    projects(organizationSlug: $organizationSlug) {
      id
      name
      status
      taskStats {
        total
        completed
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

// Usage
const { data, loading } = useQuery(GET_PROJECTS, {
  variables: { organizationSlug: "demo-org" }
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the documentation
2. Search existing issues
3. Create a new issue with details

## 🎯 Future Improvements

- [ ] Real-time updates with WebSockets
- [ ] Advanced filtering and search
- [ ] File attachments
- [ ] User authentication and authorization
- [ ] Email notifications
- [ ] Mobile app
- [ ] Advanced reporting and analytics
- [ ] Integration with external tools
- [ ] Performance optimizations
- [ ] Comprehensive test coverage
