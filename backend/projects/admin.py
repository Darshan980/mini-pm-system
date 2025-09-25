# admin.py
from django.contrib import admin
from .models import Organization, Project, Task, TaskComment

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'contact_email', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'slug', 'contact_email']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'status', 'due_date', 'created_at']
    list_filter = ['status', 'organization', 'created_at']
    search_fields = ['name', 'description']
    list_select_related = ['organization']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'status', 'priority', 'assignee', 'due_date', 'created_at']
    list_filter = ['status', 'priority', 'project__organization', 'created_at']
    search_fields = ['title', 'description', 'assignee']
    list_select_related = ['project', 'project__organization']

@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'author', 'content_preview', 'created_at']
    list_filter = ['created_at', 'task__project__organization']
    search_fields = ['content', 'author']
    list_select_related = ['task', 'task__project']
    
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'