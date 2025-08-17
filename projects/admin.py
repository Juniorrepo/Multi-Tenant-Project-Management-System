from django.contrib import admin
from .models import Organization, Project, Task, TaskComment


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'contact_email', 'project_count', 'task_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'slug', 'contact_email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'status', 'due_date', 'task_count', 'completion_rate', 'is_overdue', 'created_at']
    list_filter = ['status', 'organization', 'created_at', 'due_date']
    search_fields = ['name', 'description', 'organization__name']
    readonly_fields = ['created_at', 'updated_at', 'task_count', 'completion_rate', 'is_overdue']
    ordering = ['-created_at']
    autocomplete_fields = ['organization']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'status', 'assignee_email', 'due_date', 'is_overdue', 'comment_count', 'created_at']
    list_filter = ['status', 'project__organization', 'project', 'created_at', 'due_date']
    search_fields = ['title', 'description', 'assignee_email', 'project__name']
    readonly_fields = ['created_at', 'updated_at', 'comment_count', 'is_overdue']
    ordering = ['-created_at']
    autocomplete_fields = ['project']


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'author_email', 'content_preview', 'created_at']
    list_filter = ['created_at', 'task__project__organization', 'task__project']
    search_fields = ['content', 'author_email', 'task__title']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    autocomplete_fields = ['task']

    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'
