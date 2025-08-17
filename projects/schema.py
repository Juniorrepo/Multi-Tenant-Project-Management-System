import graphene
from graphene_django import DjangoObjectType
from django.db.models import Q
from .models import Organization, Project, Task, TaskComment


class OrganizationType(DjangoObjectType):
    class Meta:
        model = Organization
        fields = '__all__'


class ProjectType(DjangoObjectType):
    task_stats = graphene.Field('projects.schema.TaskStatsType')
    
    class Meta:
        model = Project
        fields = '__all__'

    def resolve_task_stats(self, info):
        return self


class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = '__all__'


class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = '__all__'


class TaskStatsType(graphene.ObjectType):
    total = graphene.Int()
    completed = graphene.Int()
    in_progress = graphene.Int()
    todo = graphene.Int()
    completion_rate = graphene.Float()

    def resolve_total(self, info):
        return self.tasks.count()

    def resolve_completed(self, info):
        return self.tasks.filter(status='DONE').count()

    def resolve_in_progress(self, info):
        return self.tasks.filter(status='IN_PROGRESS').count()

    def resolve_todo(self, info):
        return self.tasks.filter(status='TODO').count()

    def resolve_completion_rate(self, info):
        total = self.tasks.count()
        if total == 0:
            return 0.0
        completed = self.tasks.filter(status='DONE').count()
        return (completed / total) * 100


class CreateProjectInput(graphene.InputObjectType):
    name = graphene.String(required=True)
    description = graphene.String()
    status = graphene.String()
    due_date = graphene.Date()


class UpdateProjectInput(graphene.InputObjectType):
    id = graphene.ID(required=True)
    name = graphene.String()
    description = graphene.String()
    status = graphene.String()
    due_date = graphene.Date()


class CreateTaskInput(graphene.InputObjectType):
    project_id = graphene.ID(required=True)
    title = graphene.String(required=True)
    description = graphene.String()
    status = graphene.String()
    assignee_email = graphene.String()
    due_date = graphene.DateTime()


class UpdateTaskInput(graphene.InputObjectType):
    id = graphene.ID(required=True)
    title = graphene.String()
    description = graphene.String()
    status = graphene.String()
    assignee_email = graphene.String()
    due_date = graphene.DateTime()


class CreateCommentInput(graphene.InputObjectType):
    task_id = graphene.ID(required=True)
    content = graphene.String(required=True)
    author_email = graphene.String(required=True)


class Query(graphene.ObjectType):
    # Organization queries
    organization = graphene.Field(OrganizationType, slug=graphene.String(required=True))
    organizations = graphene.List(OrganizationType)
    
    # Project queries
    projects = graphene.List(ProjectType, organization_slug=graphene.String())
    project = graphene.Field(ProjectType, id=graphene.ID(required=True))
    
    # Task queries
    tasks = graphene.List(TaskType, project_id=graphene.ID())
    task = graphene.Field(TaskType, id=graphene.ID(required=True))
    
    # Comment queries
    comments = graphene.List(TaskCommentType, task_id=graphene.ID())

    def resolve_organization(self, info, slug):
        return Organization.objects.get(slug=slug)

    def resolve_organizations(self, info):
        return Organization.objects.all()

    def resolve_projects(self, info, organization_slug=None):
        if organization_slug:
            return Project.objects.filter(organization__slug=organization_slug)
        return Project.objects.all()

    def resolve_project(self, info, id):
        return Project.objects.get(pk=id)

    def resolve_tasks(self, info, project_id=None):
        if project_id:
            return Task.objects.filter(project_id=project_id)
        return Task.objects.all()

    def resolve_task(self, info, id):
        return Task.objects.get(pk=id)

    def resolve_comments(self, info, task_id=None):
        if task_id:
            return TaskComment.objects.filter(task_id=task_id)
        return TaskComment.objects.all()


class CreateProject(graphene.Mutation):
    class Arguments:
        input = CreateProjectInput(required=True)
        organization_slug = graphene.String(required=True)

    project = graphene.Field(ProjectType)

    def mutate(self, info, input, organization_slug):
        organization = Organization.objects.get(slug=organization_slug)
        project = Project.objects.create(
            organization=organization,
            name=input.name,
            description=input.description or '',
            status=input.status or 'ACTIVE',
            due_date=input.due_date
        )
        return CreateProject(project=project)


class UpdateProject(graphene.Mutation):
    class Arguments:
        input = UpdateProjectInput(required=True)

    project = graphene.Field(ProjectType)

    def mutate(self, info, input):
        project = Project.objects.get(pk=input.id)
        
        if input.name is not None:
            project.name = input.name
        if input.description is not None:
            project.description = input.description
        if input.status is not None:
            project.status = input.status
        if input.due_date is not None:
            project.due_date = input.due_date
            
        project.save()
        return UpdateProject(project=project)


class DeleteProject(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        project = Project.objects.get(pk=id)
        project.delete()
        return DeleteProject(success=True)


class CreateTask(graphene.Mutation):
    class Arguments:
        input = CreateTaskInput(required=True)

    task = graphene.Field(TaskType)

    def mutate(self, info, input):
        project = Project.objects.get(pk=input.project_id)
        task = Task.objects.create(
            project=project,
            title=input.title,
            description=input.description or '',
            status=input.status or 'TODO',
            assignee_email=input.assignee_email or '',
            due_date=input.due_date
        )
        return CreateTask(task=task)


class UpdateTask(graphene.Mutation):
    class Arguments:
        input = UpdateTaskInput(required=True)

    task = graphene.Field(TaskType)

    def mutate(self, info, input):
        task = Task.objects.get(pk=input.id)
        
        if input.title is not None:
            task.title = input.title
        if input.description is not None:
            task.description = input.description
        if input.status is not None:
            task.status = input.status
        if input.assignee_email is not None:
            task.assignee_email = input.assignee_email
        if input.due_date is not None:
            task.due_date = input.due_date
            
        task.save()
        return UpdateTask(task=task)


class DeleteTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        task = Task.objects.get(pk=id)
        task.delete()
        return DeleteTask(success=True)


class CreateComment(graphene.Mutation):
    class Arguments:
        input = CreateCommentInput(required=True)

    comment = graphene.Field(TaskCommentType)

    def mutate(self, info, input):
        task = Task.objects.get(pk=input.task_id)
        comment = TaskComment.objects.create(
            task=task,
            content=input.content,
            author_email=input.author_email
        )
        return CreateComment(comment=comment)


class Mutation(graphene.ObjectType):
    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    delete_project = DeleteProject.Field()
    
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()
    
    create_comment = CreateComment.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
