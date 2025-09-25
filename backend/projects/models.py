from django.db import models
from django.utils import timezone


class Organization(models.Model):
    """
    Model to represent a tenant organization.
    """
    name = models.CharField(max_length=200, help_text="Organization name")
    slug = models.SlugField(max_length=100, unique=True, help_text="URL-friendly identifier")
    contact_email = models.EmailField(help_text="Primary contact email for the organization")
    created_at = models.DateTimeField(default=timezone.now, help_text="When the organization was created")
    
    class Meta:
        ordering = ['name']
        verbose_name = "Organization"
        verbose_name_plural = "Organizations"
    
    def __str__(self):
        return self.name


class Project(models.Model):
    """
    Model to represent a project linked to an organization.
    """
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    organization = models.ForeignKey(
        Organization, 
        on_delete=models.CASCADE, 
        related_name='projects',
        help_text="The organization this project belongs to"
    )
    name = models.CharField(max_length=200, help_text="Project name")
    description = models.TextField(blank=True, help_text="Project description")
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='planning',
        help_text="Current project status"
    )
    due_date = models.DateField(null=True, blank=True, help_text="Project due date")
    created_at = models.DateTimeField(default=timezone.now, help_text="When the project was created")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Project"
        verbose_name_plural = "Projects"
    
    def __str__(self):
        return f"{self.name} ({self.organization.name})"


class Task(models.Model):
    """
    Model to represent a task within a project.
    """
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='tasks',
        help_text="The project this task belongs to"
    )
    title = models.CharField(max_length=200, help_text="Task title")
    description = models.TextField(blank=True, help_text="Task description")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='todo',
        help_text="Current task status"
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium',
        help_text="Task priority"
    )
    assignee = models.CharField(max_length=100, blank=True, help_text="Person assigned to this task")
    due_date = models.DateTimeField(null=True, blank=True, help_text="Task due date")
    created_at = models.DateTimeField(default=timezone.now, help_text="When the task was created")
    updated_at = models.DateTimeField(auto_now=True, help_text="When the task was last updated")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Task"
        verbose_name_plural = "Tasks"
    
    def __str__(self):
        return f"{self.title} ({self.project.name})"


class TaskComment(models.Model):
    """
    Model to represent comments on tasks.
    """
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="The task this comment belongs to"
    )
    author = models.CharField(max_length=100, help_text="Comment author")
    content = models.TextField(help_text="Comment content")
    created_at = models.DateTimeField(default=timezone.now, help_text="When the comment was created")
    
    class Meta:
        ordering = ['created_at']
        verbose_name = "Task Comment"
        verbose_name_plural = "Task Comments"
    
    def __str__(self):
        return f"Comment by {self.author} on {self.task.title}"