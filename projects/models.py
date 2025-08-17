from django.db import models
from django.core.validators import EmailValidator
from django.utils import timezone


class Organization(models.Model):
    """Organization model for multi-tenancy support."""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, max_length=50)
    contact_email = models.EmailField(validators=[EmailValidator()])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'organizations'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def project_count(self):
        return self.projects.count()

    @property
    def task_count(self):
        return Task.objects.filter(project__organization=self).count()


class Project(models.Model):
    """Project model with organization dependency."""
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('ON_HOLD', 'On Hold'),
        ('ARCHIVED', 'Archived'),
    ]

    organization = models.ForeignKey(
        Organization, 
        on_delete=models.CASCADE, 
        related_name='projects'
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='ACTIVE'
    )
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'projects'
        ordering = ['-created_at']
        unique_together = ['organization', 'name']

    def __str__(self):
        return f"{self.organization.name} - {self.name}"

    @property
    def task_count(self):
        return self.tasks.count()

    @property
    def completed_task_count(self):
        return self.tasks.filter(status='DONE').count()

    @property
    def completion_rate(self):
        if self.task_count == 0:
            return 0.0
        return (self.completed_task_count / self.task_count) * 100

    @property
    def is_overdue(self):
        if not self.due_date:
            return False
        return self.due_date < timezone.now().date() and self.status != 'COMPLETED'


class Task(models.Model):
    """Task model with project dependency."""
    STATUS_CHOICES = [
        ('TODO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('DONE', 'Done'),
    ]

    project = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE, 
        related_name='tasks'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='TODO'
    )
    assignee_email = models.EmailField(
        blank=True, 
        validators=[EmailValidator()]
    )
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tasks'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.project.name} - {self.title}"

    @property
    def organization(self):
        return self.project.organization

    @property
    def is_overdue(self):
        if not self.due_date:
            return False
        return self.due_date < timezone.now() and self.status != 'DONE'

    @property
    def comment_count(self):
        return self.comments.count()


class TaskComment(models.Model):
    """Task comment model."""
    task = models.ForeignKey(
        Task, 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    content = models.TextField()
    author_email = models.EmailField(validators=[EmailValidator()])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'task_comments'
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment on {self.task.title} by {self.author_email}"

    @property
    def organization(self):
        return self.task.organization
