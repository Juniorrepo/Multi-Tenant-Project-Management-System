from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from projects.models import Organization, Project, Task, TaskComment


class Command(BaseCommand):
    help = 'Set up sample data for the project management system'

    def handle(self, *args, **options):
        self.stdout.write('Setting up sample data...')

        # Create organizations
        org1, created = Organization.objects.get_or_create(
            slug='demo-org',
            defaults={
                'name': 'Demo Organization',
                'contact_email': 'admin@demo-org.com'
            }
        )
        if created:
            self.stdout.write(f'Created organization: {org1.name}')

        org2, created = Organization.objects.get_or_create(
            slug='tech-startup',
            defaults={
                'name': 'Tech Startup Inc.',
                'contact_email': 'hello@techstartup.com'
            }
        )
        if created:
            self.stdout.write(f'Created organization: {org2.name}')

        # Create projects for demo-org
        project1, created = Project.objects.get_or_create(
            name='Website Redesign',
            organization=org1,
            defaults={
                'description': 'Complete redesign of the company website with modern UI/UX',
                'status': 'ACTIVE',
                'due_date': timezone.now().date() + timedelta(days=30)
            }
        )
        if created:
            self.stdout.write(f'Created project: {project1.name}')

        project2, created = Project.objects.get_or_create(
            name='Mobile App Development',
            organization=org1,
            defaults={
                'description': 'Develop a new mobile application for iOS and Android',
                'status': 'ACTIVE',
                'due_date': timezone.now().date() + timedelta(days=60)
            }
        )
        if created:
            self.stdout.write(f'Created project: {project2.name}')

        project3, created = Project.objects.get_or_create(
            name='Marketing Campaign',
            organization=org1,
            defaults={
                'description': 'Launch a comprehensive marketing campaign for Q4',
                'status': 'ON_HOLD',
                'due_date': timezone.now().date() + timedelta(days=45)
            }
        )
        if created:
            self.stdout.write(f'Created project: {project3.name}')

        # Create projects for tech-startup
        project4, created = Project.objects.get_or_create(
            name='MVP Development',
            organization=org2,
            defaults={
                'description': 'Build the minimum viable product for our SaaS platform',
                'status': 'ACTIVE',
                'due_date': timezone.now().date() + timedelta(days=90)
            }
        )
        if created:
            self.stdout.write(f'Created project: {project4.name}')

        # Create tasks for Website Redesign
        task1, created = Task.objects.get_or_create(
            title='Design Homepage',
            project=project1,
            defaults={
                'description': 'Create wireframes and mockups for the homepage',
                'status': 'IN_PROGRESS',
                'assignee_email': 'designer@demo-org.com',
                'due_date': timezone.now() + timedelta(days=7)
            }
        )
        if created:
            self.stdout.write(f'Created task: {task1.title}')

        task2, created = Task.objects.get_or_create(
            title='Implement Navigation',
            project=project1,
            defaults={
                'description': 'Build the main navigation component',
                'status': 'TODO',
                'assignee_email': 'developer@demo-org.com',
                'due_date': timezone.now() + timedelta(days=14)
            }
        )
        if created:
            self.stdout.write(f'Created task: {task2.title}')

        task3, created = Task.objects.get_or_create(
            title='Content Migration',
            project=project1,
            defaults={
                'description': 'Migrate existing content to the new design',
                'status': 'DONE',
                'assignee_email': 'content@demo-org.com',
                'due_date': timezone.now() - timedelta(days=3)
            }
        )
        if created:
            self.stdout.write(f'Created task: {task3.title}')

        # Create tasks for Mobile App Development
        task4, created = Task.objects.get_or_create(
            title='Setup React Native',
            project=project2,
            defaults={
                'description': 'Initialize React Native project and configure development environment',
                'status': 'DONE',
                'assignee_email': 'mobile@demo-org.com',
                'due_date': timezone.now() - timedelta(days=5)
            }
        )
        if created:
            self.stdout.write(f'Created task: {task4.title}')

        task5, created = Task.objects.get_or_create(
            title='Design App Screens',
            project=project2,
            defaults={
                'description': 'Create UI designs for all app screens',
                'status': 'IN_PROGRESS',
                'assignee_email': 'designer@demo-org.com',
                'due_date': timezone.now() + timedelta(days=10)
            }
        )
        if created:
            self.stdout.write(f'Created task: {task5.title}')

        # Create tasks for MVP Development
        task6, created = Task.objects.get_or_create(
            title='Database Schema Design',
            project=project4,
            defaults={
                'description': 'Design the database schema for the MVP',
                'status': 'DONE',
                'assignee_email': 'backend@techstartup.com',
                'due_date': timezone.now() - timedelta(days=10)
            }
        )
        if created:
            self.stdout.write(f'Created task: {task6.title}')

        task7, created = Task.objects.get_or_create(
            title='User Authentication',
            project=project4,
            defaults={
                'description': 'Implement user registration and login functionality',
                'status': 'IN_PROGRESS',
                'assignee_email': 'backend@techstartup.com',
                'due_date': timezone.now() + timedelta(days=15)
            }
        )
        if created:
            self.stdout.write(f'Created task: {task7.title}')

        # Create comments
        comment1, created = TaskComment.objects.get_or_create(
            task=task1,
            author_email='designer@demo-org.com',
            defaults={
                'content': 'Started working on the homepage design. Will have mockups ready by Friday.'
            }
        )
        if created:
            self.stdout.write(f'Created comment on task: {task1.title}')

        comment2, created = TaskComment.objects.get_or_create(
            task=task1,
            author_email='pm@demo-org.com',
            defaults={
                'content': 'Great progress! Make sure to include the new branding elements.'
            }
        )
        if created:
            self.stdout.write(f'Created comment on task: {task1.title}')

        comment3, created = TaskComment.objects.get_or_create(
            task=task5,
            author_email='designer@demo-org.com',
            defaults={
                'content': 'Completed the login and dashboard screens. Moving on to the main features.'
            }
        )
        if created:
            self.stdout.write(f'Created comment on task: {task5.title}')

        comment4, created = TaskComment.objects.get_or_create(
            task=task7,
            author_email='backend@techstartup.com',
            defaults={
                'content': 'Authentication system is working well. Need to add password reset functionality.'
            }
        )
        if created:
            self.stdout.write(f'Created comment on task: {task7.title}')

        self.stdout.write(
            self.style.SUCCESS('Sample data setup completed successfully!')
        )
        self.stdout.write(f'Created:')
        self.stdout.write(f'- {Organization.objects.count()} organizations')
        self.stdout.write(f'- {Project.objects.count()} projects')
        self.stdout.write(f'- {Task.objects.count()} tasks')
        self.stdout.write(f'- {TaskComment.objects.count()} comments')
