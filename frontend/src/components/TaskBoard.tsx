import React, { useState } from 'react';
import { useQuery, useMutation} from '@apollo/client/react';
import { gql } from '@apollo/client';
import { MessageCircle, Edit3, Trash2, ChevronLeft, ChevronRight, Plus, User, Calendar, AlertCircle, Clock } from 'lucide-react';
import TaskComments from './TaskComments';
import './TaskBoard.css';

// GraphQL Queries & Mutations
const GET_TASKS = gql`
  query GetTasks($projectId: ID!) {
    tasks(projectId: $projectId) {
      id
      title
      description
      status
      priority
      assignee
      dueDate
      createdAt
      updatedAt
    }
  }
`;

const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      name
      description
      status
      dueDate
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask(
    $taskId: ID!
    $title: String
    $description: String
    $status: String
    $priority: String
    $assignee: String
    $dueDate: DateTime
  ) {
    updateTask(
      taskId: $taskId
      title: $title
      description: $description
      status: $status
      priority: $priority
      assignee: $assignee
      dueDate: $dueDate
    ) {
      task {
        id
        title
        description
        status
        priority
        assignee
        dueDate
        updatedAt
      }
      success
      message
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask(
    $projectId: ID!
    $title: String!
    $description: String
    $status: String
    $priority: String
    $assignee: String
    $dueDate: DateTime
  ) {
    createTask(
      projectId: $projectId
      title: $title
      description: $description
      status: $status
      priority: $priority
      assignee: $assignee
      dueDate: $dueDate
    ) {
      task {
        id
        title
        description
        status
        priority
        assignee
        dueDate
        createdAt
      }
      success
      message
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($taskId: ID!) {
    deleteTask(taskId: $taskId) {
      success
      message
    }
  }
`;

// TypeScript Interfaces
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  dueDate?: string;
}

interface TaskFormData {
  title: string;
  description?: string;
  status: Task['status'];
  priority: Task['priority'];
  assignee?: string;
  dueDate?: string;
}

interface TaskBoardProps {
  projectId: string;
}

interface TasksData {
  tasks: Task[];
}

interface ProjectData {
  project: Project;
}

// GraphQL Response Types
interface UpdateTaskResponse {
  updateTask: {
    task: Task;
    success: boolean;
    message?: string;
  };
}

interface CreateTaskResponse {
  createTask: {
    task: Task;
    success: boolean;
    message?: string;
  };
}

interface DeleteTaskResponse {
  deleteTask: {
    success: boolean;
    message?: string;
  };
}

const TaskBoard: React.FC<TaskBoardProps> = ({ projectId }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [commentsTask, setCommentsTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<string | null>(null);
  
  const { loading: tasksLoading, error: tasksError, data: tasksData, refetch: refetchTasks } = useQuery<TasksData>(GET_TASKS, { 
    variables: { projectId },
    errorPolicy: 'all'
  });
    
  const { loading: projectLoading, error: projectError, data: projectData } = useQuery<ProjectData>(GET_PROJECT, { 
    variables: { id: projectId },
    errorPolicy: 'all'
  });

  const [updateTask] = useMutation<UpdateTaskResponse>(UPDATE_TASK, {
    onCompleted: (data: UpdateTaskResponse) => {
      if (data.updateTask.success) {
        refetchTasks();
      } else {
        alert(`Failed to update task: ${data.updateTask.message}`);
      }
    },
    onError: (error) => {
      console.error('Update task error:', error);
      alert('Failed to update task. Please try again.');
    }
  });

  const [createTask] = useMutation<CreateTaskResponse>(CREATE_TASK, {
    onCompleted: (data: CreateTaskResponse) => {
      if (data.createTask.success) {
        refetchTasks();
        setShowCreateForm(false);
      } else {
        alert(`Failed to create task: ${data.createTask.message}`);
      }
    },
    onError: (error) => {
      console.error('Create task error:', error);
      alert('Failed to create task. Please try again.');
    }
  });

  const [deleteTask] = useMutation<DeleteTaskResponse>(DELETE_TASK, {
    onCompleted: (data: DeleteTaskResponse) => {
      if (data.deleteTask.success) {
        refetchTasks();
        setDeletingTask(null);
      } else {
        alert(`Failed to delete task: ${data.deleteTask.message}`);
        setDeletingTask(null);
      }
    },
    onError: (error) => {
      console.error('Delete task error:', error);
      alert('Failed to delete task. Please try again.');
      setDeletingTask(null);
    }
  });

  // Group tasks by status
  const groupedTasks = React.useMemo(() => {
    if (!tasksData?.tasks) return { todo: [], in_progress: [], done: [] };
    
    return tasksData.tasks.reduce((acc: Record<string, Task[]>, task: Task) => {
      if (task?.status) {
        const normalizedStatus = task.status.toLowerCase();
        acc[normalizedStatus] = acc[normalizedStatus] || [];
        acc[normalizedStatus].push(task);
      }
      return acc;
    }, { todo: [], in_progress: [], done: [] } as Record<string, Task[]>);
  }, [tasksData]);

  const handleStatusUpdate = async (taskId: string, newStatus: Task['status']) => {
    await updateTask({ variables: { taskId, status: newStatus } });
  };

  const handleEditTask = async (task: Task, updates: TaskFormData) => {
    await updateTask({ variables: { taskId: task.id, ...updates } });
    setEditingTask(null);
  };

  const handleCreateTask = async (taskData: TaskFormData) => {
    await createTask({ variables: { projectId, ...taskData } });
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${taskTitle}"? This cannot be undone.`)) {
      setDeletingTask(taskId);
      try {
        await deleteTask({ variables: { taskId } });
      } catch (error) {
        console.error('Delete task error:', error);
        setDeletingTask(null);
      }
    }
  };

  if (projectLoading || tasksLoading) {
    return (
      <div className="task-board-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (projectError || tasksError) {
    return (
      <div className="task-board-container">
        <div className="error-state">
          <AlertCircle className="error-icon" />
          <h3>Error Loading Data</h3>
          {projectError && <p>Project Error: {projectError.message}</p>}
          {tasksError && <p>Tasks Error: {tasksError.message}</p>}
          <button
            onClick={() => {
              refetchTasks();
              window.location.reload();
            }}
            className="retry-btn"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const project = projectData?.project;
  const tasks = tasksData?.tasks || [];

  return (
    <div className="task-board-container">
      {/* Project Header */}
      <div className="project-header">
        <div className="project-info">
          <h1 className="project-title">
            {project?.name || 'Loading Project...'}
          </h1>
          {project?.description && (
            <p className="project-description">
              {project.description}
            </p>
          )}
          <div className="project-meta">
            {project?.status && (
              <span className={`status-badge ${project.status}`}>
                {project.status.replace('_', ' ')}
              </span>
            )}
            {project?.dueDate && (
              <div className="due-date">
                <Calendar size={14} />
                <span className={new Date(project.dueDate) < new Date() ? 'overdue' : ''}>
                  Due: {new Date(project.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="task-count-info">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
            </div>
          </div>
        </div>
        <button 
          className="create-task-btn"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus size={20} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Task Stats */}
      <div className="task-stats">
        <div className="stat-card total">
          <span className="stat-number">{tasks.length}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-card todo">
          <span className="stat-number">{groupedTasks.todo?.length || 0}</span>
          <span className="stat-label">To Do</span>
        </div>
        <div className="stat-card progress">
          <span className="stat-number">{groupedTasks.in_progress?.length || 0}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card done">
          <span className="stat-number">{groupedTasks.done?.length || 0}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        <TaskColumn 
          title="To Do" 
          status="todo" 
          tasks={groupedTasks.todo || []} 
          onStatusUpdate={handleStatusUpdate} 
          onEditTask={setEditingTask} 
          onCommentsTask={setCommentsTask} 
          onDeleteTask={handleDeleteTask} 
          deletingTask={deletingTask} 
        />
        <TaskColumn 
          title="In Progress" 
          status="in_progress" 
          tasks={groupedTasks.in_progress || []} 
          onStatusUpdate={handleStatusUpdate} 
          onEditTask={setEditingTask} 
          onCommentsTask={setCommentsTask} 
          onDeleteTask={handleDeleteTask} 
          deletingTask={deletingTask} 
        />
        <TaskColumn 
          title="Done" 
          status="done" 
          tasks={groupedTasks.done || []} 
          onStatusUpdate={handleStatusUpdate} 
          onEditTask={setEditingTask} 
          onCommentsTask={setCommentsTask} 
          onDeleteTask={handleDeleteTask} 
          deletingTask={deletingTask} 
        />
      </div>

      {showCreateForm && (
        <TaskModal onClose={() => setShowCreateForm(false)} onSubmit={handleCreateTask} title="Create Task" />
      )}

      {editingTask && (
        <TaskModal 
          task={editingTask} 
          onClose={() => setEditingTask(null)} 
          onSubmit={(updates) => handleEditTask(editingTask, updates)} 
          title="Edit Task" 
        />
      )}

      {commentsTask && (
        <TaskComments
          taskId={commentsTask.id}
          taskTitle={commentsTask.title}
          onClose={() => setCommentsTask(null)}
        />
      )}
    </div>
  );
};

// Task Column Component
interface TaskColumnProps {
  title: string;
  status: Task['status'];
  tasks: Task[];
  onStatusUpdate: (taskId: string, status: Task['status']) => void;
  onEditTask: (task: Task) => void;
  onCommentsTask: (task: Task) => void;
  onDeleteTask: (taskId: string, taskTitle: string) => void;
  deletingTask: string | null;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ 
  title, 
  status, 
  tasks, 
  onStatusUpdate, 
  onEditTask, 
  onCommentsTask, 
  onDeleteTask, 
  deletingTask 
}) => {
  return (
    <div className={`task-column ${status}`}>
      <div className="column-header">
        <h3 className="column-title">{title}</h3>
        <span className="task-count">{tasks.length}</span>
      </div>
      <div className="task-list">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onStatusUpdate={onStatusUpdate} 
            onEdit={() => onEditTask(task)} 
            onComments={() => onCommentsTask(task)}
            onDelete={() => onDeleteTask(task.id, task.title)}
            isDeleting={deletingTask === task.id}
          />
        ))}
        {tasks.length === 0 && (
          <div className="empty-state">
            <p>No {title.toLowerCase()} tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Task Card Component
interface TaskCardProps {
  task: Task;
  onStatusUpdate: (taskId: string, status: Task['status']) => void;
  onEdit: () => void;
  onComments: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onStatusUpdate, 
  onEdit, 
  onComments, 
  onDelete, 
  isDeleting 
}) => {
  const statusFlow: Record<Task['status'], Task['status'] | null> = { 
    todo: 'in_progress', 
    in_progress: 'done', 
    done: null 
  };
  
  const statusReverse: Record<Task['status'], Task['status'] | null> = { 
    done: 'in_progress', 
    in_progress: 'todo', 
    todo: null 
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  const handleNextStatus = () => {
    const nextStatus = statusFlow[task.status];
    if (nextStatus) {
      onStatusUpdate(task.id, nextStatus);
    }
  };

  const handlePrevStatus = () => {
    const prevStatus = statusReverse[task.status];
    if (prevStatus) {
      onStatusUpdate(task.id, prevStatus);
    }
  };

  return (
    <div className={`task-card ${isOverdue ? 'overdue' : ''}`}>
      <div className={`priority-indicator ${task.priority}`}></div>
      
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <div className="task-actions-header">
          <span className={`priority-badge ${task.priority}`}>
            {task.priority}
          </span>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className={`action-btn delete ${isDeleting ? 'deleting' : ''}`}
            title={isDeleting ? 'Deleting...' : 'Delete task'}
          >
            {isDeleting ? <Clock size={14} /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="task-description">
          {task.description}
        </p>
      )}
      
      <div className="task-meta">
        {task.assignee && (
          <div className="assignee">
            <div className="assignee-avatar">
              <User size={12} />
            </div>
            <span className="assignee-name">{task.assignee.split('@')[0]}</span>
          </div>
        )}
        
        {task.dueDate && (
          <div className={`due-date ${isOverdue ? 'overdue' : ''}`}>
            <Calendar size={12} />
            <span>
              {isOverdue ? 'Overdue: ' : 'Due: '}
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
      
      <div className="task-actions">
        <button
          className="action-btn prev"
          onClick={handlePrevStatus}
          disabled={!statusReverse[task.status]}
          title="Move to previous status"
        >
          <ChevronLeft size={16} />
        </button>
        
        <button
          className="action-btn edit"
          onClick={onEdit}
          title="Edit task"
        >
          <Edit3 size={16} />
        </button>
        
        <button
          className="action-btn comments"
          onClick={onComments}
          title="View comments"
        >
          <MessageCircle size={16} />
        </button>
        
        <button
          className="action-btn next"
          onClick={handleNextStatus}
          disabled={!statusFlow[task.status]}
          title="Move to next status"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// Task Modal Component
interface TaskModalProps {
  task?: Task;
  onClose: () => void;
  onSubmit: (task: TaskFormData) => void;
  title: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSubmit, title }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    assignee: task?.assignee || '',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const submitData: TaskFormData = {
      title: formData.title.trim(),
      status: formData.status,
      priority: formData.priority,
      description: formData.description?.trim() || undefined,
      assignee: formData.assignee?.trim() || undefined,
      dueDate: formData.dueDate ? `${formData.dueDate}T23:59:59Z` : undefined,
    };

    try {
      await onSubmit(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              placeholder="Enter task title"
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              placeholder="Describe the task details"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as Task['status']})}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as Task['priority']})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Assignee</label>
              <input
                type="email"
                value={formData.assignee}
                onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                placeholder="user@example.com"
              />
            </div>
            
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="submit-btn"
            >
              {isSubmitting ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskBoard;
