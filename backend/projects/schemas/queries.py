import graphene
from django.db.models import Count, Q
from ..models import Organization, Project, Task, TaskComment
from .types import OrganizationType, ProjectType, TaskType, TaskCommentType


class ProjectStatsType(graphene.ObjectType):
    project_id = graphene.ID()
    project_name = graphene.String()
    total_tasks = graphene.Int()
    completed_tasks = graphene.Int()
    in_progress_tasks = graphene.Int()
    todo_tasks = graphene.Int()
    completion_rate = graphene.Float()


class OrganizationStatsType(graphene.ObjectType):
    total_projects = graphene.Int()
    active_projects = graphene.Int()
    completed_projects = graphene.Int()
    total_tasks = graphene.Int()
    completed_tasks = graphene.Int()
    overall_completion_rate = graphene.Float()


class Query(graphene.ObjectType):
    # MISSING BASIC QUERIES - ADD THESE:
    organization = graphene.Field(OrganizationType)
    projects = graphene.List(ProjectType)
    project = graphene.Field(ProjectType, id=graphene.ID(required=True))
    tasks = graphene.List(TaskType, project_id=graphene.ID(required=True))
    task = graphene.Field(TaskType, id=graphene.ID(required=True))
    comments = graphene.List(TaskCommentType, task_id=graphene.ID(required=True))
    
    # EXISTING STATISTICS QUERIES:
    project_stats = graphene.Field(ProjectStatsType, project_id=graphene.ID(required=True))
    organization_stats = graphene.Field(OrganizationStatsType)
    all_project_stats = graphene.List(ProjectStatsType)
    
    # NEW BASIC RESOLVERS:
    def resolve_organization(self, info):
        """Get current organization info"""
        return getattr(info.context, 'organization', None)
    
    def resolve_projects(self, info):
        """Get all projects for current organization"""
        org = getattr(info.context, 'organization', None)
        if not org:
            return []
        return Project.objects.filter(organization=org)
    
    def resolve_project(self, info, id):
        """Get specific project by ID"""
        org = getattr(info.context, 'organization', None)
        if not org:
            return None
        try:
            return Project.objects.get(id=id, organization=org)
        except Project.DoesNotExist:
            return None
    
    def resolve_tasks(self, info, project_id):
        """Get all tasks for a project"""
        org = getattr(info.context, 'organization', None)
        if not org:
            return []
        try:
            project = Project.objects.get(id=project_id, organization=org)
            return Task.objects.filter(project=project).order_by('-created_at')
        except Project.DoesNotExist:
            return []
    
    def resolve_task(self, info, id):
        """Get specific task by ID"""
        org = getattr(info.context, 'organization', None)
        if not org:
            return None
        try:
            task = Task.objects.select_related('project').get(
                id=id, project__organization=org
            )
            return task
        except Task.DoesNotExist:
            return None
    
    def resolve_comments(self, info, task_id):
        """Get all comments for a task"""
        org = getattr(info.context, 'organization', None)
        if not org:
            return []
        try:
            task = Task.objects.select_related('project').get(
                id=task_id, project__organization=org
            )
            return TaskComment.objects.filter(task=task).order_by('created_at')
        except Task.DoesNotExist:
            return []
    
    # EXISTING STATISTICS RESOLVERS:
    def resolve_project_stats(self, info, project_id):
        org = getattr(info.context, 'organization', None)
        if not org:
            return None
        
        try:
            project = Project.objects.get(id=project_id, organization=org)
        except Project.DoesNotExist:
            return None
        
        tasks = Task.objects.filter(project=project)
        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status='done').count()
        in_progress_tasks = tasks.filter(status='in_progress').count()
        todo_tasks = tasks.filter(status='todo').count()
        
        completion_rate = (completed_tasks / total_tasks) if total_tasks > 0 else 0
        
        return ProjectStatsType(
            project_id=project.id,
            project_name=project.name,
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            in_progress_tasks=in_progress_tasks,
            todo_tasks=todo_tasks,
            completion_rate=completion_rate
        )
    
    def resolve_organization_stats(self, info):
        org = getattr(info.context, 'organization', None)
        if not org:
            return None
        
        projects = Project.objects.filter(organization=org)
        total_projects = projects.count()
        active_projects = projects.filter(status='active').count()
        completed_projects = projects.filter(status='completed').count()
        
        all_tasks = Task.objects.filter(project__organization=org)
        total_tasks = all_tasks.count()
        completed_tasks = all_tasks.filter(status='done').count()
        
        overall_completion_rate = (completed_tasks / total_tasks) if total_tasks > 0 else 0
        
        return OrganizationStatsType(
            total_projects=total_projects,
            active_projects=active_projects,
            completed_projects=completed_projects,
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            overall_completion_rate=overall_completion_rate
        )
    
    def resolve_all_project_stats(self, info):
        org = getattr(info.context, 'organization', None)
        if not org:
            return []
        
        projects = Project.objects.filter(organization=org)
        stats_list = []
        
        for project in projects:
            tasks = Task.objects.filter(project=project)
            total_tasks = tasks.count()
            completed_tasks = tasks.filter(status='done').count()
            in_progress_tasks = tasks.filter(status='in_progress').count()
            todo_tasks = tasks.filter(status='todo').count()
            
            completion_rate = (completed_tasks / total_tasks) if total_tasks > 0 else 0
            
            stats_list.append(ProjectStatsType(
                project_id=project.id,
                project_name=project.name,
                total_tasks=total_tasks,
                completed_tasks=completed_tasks,
                in_progress_tasks=in_progress_tasks,
                todo_tasks=todo_tasks,
                completion_rate=completion_rate
            ))
        
        return stats_list