from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from .models import Organization, Project, Task, TaskComment


class OrganizationModelTest(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Organization',
            slug='test-org',
            contact_email='test@example.com'
        )

    def test_organization_creation(self):
        self.assertEqual(self.org.name, 'Test Organization')
        self.assertEqual(self.org.slug, 'test-org')
        self.assertEqual(self.org.contact_email, 'test@example.com')

    def test_organization_str(self):
        self.assertEqual(str(self.org), 'Test Organization')

    def test_organization_properties(self):
        self.assertEqual(self.org.project_count, 0)
        self.assertEqual(self.org.task_count, 0)


class ProjectModelTest(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Organization',
            slug='test-org',
            contact_email='test@example.com'
        )
        self.project = Project.objects.create(
            organization=self.org,
            name='Test Project',
            description='Test project description',
            status='ACTIVE',
            due_date=timezone.now().date() + timedelta(days=30)
        )

    def test_project_creation(self):
        self.assertEqual(self.project.name, 'Test Project')
        self.assertEqual(self.project.organization, self.org)
        self.assertEqual(self.project.status, 'ACTIVE')

    def test_project_str(self):
        expected = f'{self.org.name} - {self.project.name}'
        self.assertEqual(str(self.project), expected)

    def test_project_properties(self):
        self.assertEqual(self.project.task_count, 0)
        self.assertEqual(self.project.completed_task_count, 0)
        self.assertEqual(self.project.completion_rate, 0.0)
        self.assertFalse(self.project.is_overdue)


class TaskModelTest(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Organization',
            slug='test-org',
            contact_email='test@example.com'
        )
        self.project = Project.objects.create(
            organization=self.org,
            name='Test Project',
            description='Test project description'
        )
        self.task = Task.objects.create(
            project=self.project,
            title='Test Task',
            description='Test task description',
            status='TODO',
            assignee_email='assignee@example.com',
            due_date=timezone.now() + timedelta(days=7)
        )

    def test_task_creation(self):
        self.assertEqual(self.task.title, 'Test Task')
        self.assertEqual(self.task.project, self.project)
        self.assertEqual(self.task.status, 'TODO')
        self.assertEqual(self.task.assignee_email, 'assignee@example.com')

    def test_task_str(self):
        expected = f'{self.project.name} - {self.task.title}'
        self.assertEqual(str(self.task), expected)

    def test_task_properties(self):
        self.assertEqual(self.task.organization, self.org)
        self.assertFalse(self.task.is_overdue)
        self.assertEqual(self.task.comment_count, 0)


class TaskCommentModelTest(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Organization',
            slug='test-org',
            contact_email='test@example.com'
        )
        self.project = Project.objects.create(
            organization=self.org,
            name='Test Project'
        )
        self.task = Task.objects.create(
            project=self.project,
            title='Test Task'
        )
        self.comment = TaskComment.objects.create(
            task=self.task,
            content='Test comment content',
            author_email='author@example.com'
        )

    def test_comment_creation(self):
        self.assertEqual(self.comment.content, 'Test comment content')
        self.assertEqual(self.comment.task, self.task)
        self.assertEqual(self.comment.author_email, 'author@example.com')

    def test_comment_str(self):
        expected = f'Comment on {self.task.title} by {self.comment.author_email}'
        self.assertEqual(str(self.comment), expected)

    def test_comment_organization(self):
        self.assertEqual(self.comment.organization, self.org)


class ModelRelationshipsTest(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Organization',
            slug='test-org',
            contact_email='test@example.com'
        )
        self.project = Project.objects.create(
            organization=self.org,
            name='Test Project'
        )
        self.task = Task.objects.create(
            project=self.project,
            title='Test Task'
        )
        self.comment = TaskComment.objects.create(
            task=self.task,
            content='Test comment',
            author_email='author@example.com'
        )

    def test_organization_project_relationship(self):
        self.assertEqual(self.org.projects.count(), 1)
        self.assertEqual(self.org.projects.first(), self.project)

    def test_project_task_relationship(self):
        self.assertEqual(self.project.tasks.count(), 1)
        self.assertEqual(self.project.tasks.first(), self.task)

    def test_task_comment_relationship(self):
        self.assertEqual(self.task.comments.count(), 1)
        self.assertEqual(self.task.comments.first(), self.comment)

    def test_cascade_deletion(self):
        # Delete organization should delete all related data
        self.org.delete()
        self.assertEqual(Organization.objects.count(), 0)
        self.assertEqual(Project.objects.count(), 0)
        self.assertEqual(Task.objects.count(), 0)
        self.assertEqual(TaskComment.objects.count(), 0)
