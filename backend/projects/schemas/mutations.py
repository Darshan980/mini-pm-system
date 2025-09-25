import graphene
from ..models import Project, Task, TaskComment
from .types import ProjectType, TaskType, TaskCommentType


class CreateProject(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()
    
    project = graphene.Field(ProjectType)
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(self, info, name, **kwargs):
        org = getattr(info.context, 'organization', None)
        if not org:
            return CreateProject(success=False, message="No organization header")
        
        project = Project.objects.create(
            organization=org,
            name=name,
            description=kwargs.get('description', ''),
            status=kwargs.get('status', 'planning'),
            due_date=kwargs.get('due_date')
        )
        return CreateProject(project=project, success=True, message="Project created")


class UpdateProject(graphene.Mutation):
    class Arguments:
        project_id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()
    
    project = graphene.Field(ProjectType)
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(self, info, project_id, **kwargs):
        org = getattr(info.context, 'organization', None)
        if not org:
            return UpdateProject(success=False, message="No organization header")
        
        try:
            project = Project.objects.get(id=project_id, organization=org)
        except Project.DoesNotExist:
            return UpdateProject(success=False, message="Project not found")
        
        for field, value in kwargs.items():
            if value is not None:
                setattr(project, field, value)
        
        project.save()
        return UpdateProject(project=project, success=True, message="Project updated")


class DeleteProject(graphene.Mutation):
    class Arguments:
        project_id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(self, info, project_id):
        org = getattr(info.context, 'organization', None)
        if not org:
            return DeleteProject(success=False, message="No organization header")
        
        try:
            project = Project.objects.get(id=project_id, organization=org)
            project_name = project.name  # Store name before deletion
            project.delete()
            return DeleteProject(
                success=True, 
                message=f"Project '{project_name}' deleted successfully"
            )
        except Project.DoesNotExist:
            return DeleteProject(success=False, message="Project not found")


class CreateTask(graphene.Mutation):
    class Arguments:
        project_id = graphene.ID(required=True)
        title = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        priority = graphene.String()
        assignee = graphene.String()
        due_date = graphene.DateTime()
    
    task = graphene.Field(TaskType)
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(self, info, project_id, title, **kwargs):
        org = getattr(info.context, 'organization', None)
        if not org:
            return CreateTask(success=False, message="No organization header")
        
        try:
            project = Project.objects.get(id=project_id, organization=org)
        except Project.DoesNotExist:
            return CreateTask(success=False, message="Project not found")
        
        task = Task.objects.create(
            project=project,
            title=title,
            description=kwargs.get('description', ''),
            status=kwargs.get('status', 'todo'),
            priority=kwargs.get('priority', 'medium'),
            assignee=kwargs.get('assignee', ''),
            due_date=kwargs.get('due_date')
        )
        return CreateTask(task=task, success=True, message="Task created")


class UpdateTask(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        status = graphene.String()
        priority = graphene.String()
        assignee = graphene.String()
        due_date = graphene.DateTime()
    
    task = graphene.Field(TaskType)
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(self, info, task_id, **kwargs):
        org = getattr(info.context, 'organization', None)
        if not org:
            return UpdateTask(success=False, message="No organization header")
        
        try:
            task = Task.objects.select_related('project').get(
                id=task_id, project__organization=org
            )
        except Task.DoesNotExist:
            return UpdateTask(success=False, message="Task not found")
        
        for field, value in kwargs.items():
            if value is not None:
                setattr(task, field, value)
        
        task.save()
        return UpdateTask(task=task, success=True, message="Task updated")


class DeleteTask(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(self, info, task_id):
        org = getattr(info.context, 'organization', None)
        if not org:
            return DeleteTask(success=False, message="No organization header")
        
        try:
            task = Task.objects.select_related('project').get(
                id=task_id, project__organization=org
            )
            task_title = task.title  # Store title before deletion
            task.delete()
            return DeleteTask(
                success=True, 
                message=f"Task '{task_title}' deleted successfully"
            )
        except Task.DoesNotExist:
            return DeleteTask(success=False, message="Task not found")


class AddComment(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        author = graphene.String(required=True)
        content = graphene.String(required=True)
    
    comment = graphene.Field(TaskCommentType)
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(self, info, task_id, author, content):
        org = getattr(info.context, 'organization', None)
        if not org:
            return AddComment(success=False, message="No organization header")
        
        try:
            task = Task.objects.select_related('project').get(
                id=task_id, project__organization=org
            )
        except Task.DoesNotExist:
            return AddComment(success=False, message="Task not found")
        
        comment = TaskComment.objects.create(
            task=task, author=author, content=content
        )
        return AddComment(comment=comment, success=True, message="Comment added")


class UpdateComment(graphene.Mutation):
    class Arguments:
        comment_id = graphene.ID(required=True)
        content = graphene.String(required=True)
    
    comment = graphene.Field(TaskCommentType)
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(self, info, comment_id, content):
        org = getattr(info.context, 'organization', None)
        if not org:
            return UpdateComment(success=False, message="No organization header")
        
        try:
            comment = TaskComment.objects.select_related('task__project').get(
                id=comment_id, task__project__organization=org
            )
        except TaskComment.DoesNotExist:
            return UpdateComment(success=False, message="Comment not found")
        
        comment.content = content
        comment.save()
        return UpdateComment(comment=comment, success=True, message="Comment updated")


class DeleteComment(graphene.Mutation):
    class Arguments:
        comment_id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(self, info, comment_id):
        org = getattr(info.context, 'organization', None)
        if not org:
            return DeleteComment(success=False, message="No organization header")
        
        try:
            comment = TaskComment.objects.select_related('task__project').get(
                id=comment_id, task__project__organization=org
            )
            comment.delete()
            return DeleteComment(success=True, message="Comment deleted successfully")
        except TaskComment.DoesNotExist:
            return DeleteComment(success=False, message="Comment not found")


# Main Mutation class with all mutations
class Mutation(graphene.ObjectType):
    # Project mutations
    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    delete_project = DeleteProject.Field()
    
    # Task mutations
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()
    
    # Comment mutations
    add_comment = AddComment.Field()
    update_comment = UpdateComment.Field()
    delete_comment = DeleteComment.Field()