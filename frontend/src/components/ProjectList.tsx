import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import ProjectForm from './ProjectForm';
import './ProjectList.css';

const GET_PROJECTS = gql`
  query GetProjects {
    allProjectStats {
      projectId
      projectName
      totalTasks
      completedTasks
      inProgressTasks
      todoTasks
      completionRate
    }
  }
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($projectId: ID!) {
    deleteProject(projectId: $projectId) {
      success
      message
    }
  }
`;

interface Project {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
}

interface ProjectsData {
  allProjectStats: Project[];
}

interface ProjectListProps {
  onSelectProject: (projectId: string) => void;
}

// SVG Delete Icon Component
const DeleteIcon = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c-1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

// Loading Spinner Icon
const SpinnerIcon = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={`animate-spin ${className}`}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const ProjectList: React.FC<ProjectListProps> = ({ onSelectProject }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);
  
  const { loading, error, data, refetch } = useQuery<ProjectsData>(GET_PROJECTS, {
    errorPolicy: 'all'
  });

  const [deleteProject] = useMutation(DELETE_PROJECT, {
    onCompleted: (data) => {
      if (data.deleteProject.success) {
        refetch();
        setDeletingProject(null);
      } else {
        alert(`Failed to delete project: ${data.deleteProject.message}`);
        setDeletingProject(null);
      }
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
      setDeletingProject(null);
    }
  });

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This will also delete all associated tasks and cannot be undone.`)) {
      setDeletingProject(projectId);
      try {
        await deleteProject({ variables: { projectId } });
      } catch (error) {
        console.error('Delete project error:', error);
        setDeletingProject(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="project-list-container">
        <div className="loading-state" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e9ecef',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ margin: 0, color: '#6c757d' }}>Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-list-container">
        <div className="error-state" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px 20px',
          textAlign: 'center',
          background: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          color: '#721c24'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ margin: '0 0 12px 0' }}>Error loading projects</h3>
          <p style={{ margin: '0 0 16px 0' }}>{error.message}</p>
          <button
            onClick={() => refetch()}
            style={{
              padding: '8px 16px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleProjectClick = (projectId: string) => {
    onSelectProject(projectId);
  };

  return (
    <div className="project-list-container">
      <div className="project-list-header">
        <h2 className="project-list-title">Projects</h2>
        <button 
          className="create-project-btn"
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: '10px 20px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          + New Project
        </button>
      </div>
      
      {!data?.allProjectStats || data.allProjectStats.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-content" style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6c757d'
          }}>
            <div className="empty-state-icon" style={{ fontSize: '72px', marginBottom: '24px' }}>📁</div>
            <h3 className="empty-state-title" style={{
              margin: '0 0 12px 0',
              fontSize: '24px',
              color: '#2c3e50'
            }}>No projects yet</h3>
            <p className="empty-state-description" style={{
              margin: '0 0 32px 0',
              fontSize: '16px',
              maxWidth: '400px',
              margin: '0 auto 32px auto'
            }}>
              Get started by creating your first project. You can organize tasks, track progress, and collaborate with your team.
            </p>
            <button
              className="empty-state-btn"
              onClick={() => setShowCreateForm(true)}
              style={{
                padding: '12px 24px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Create Your First Project
            </button>
          </div>
        </div>
      ) : (
        <ul className="projects-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}>
          {data.allProjectStats.map((project) => (
            <li 
              key={project.projectId} 
              className="project-card"
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e9ecef',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => handleProjectClick(project.projectId)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project.projectId, project.projectName);
                }}
                disabled={deletingProject === project.projectId}
                className="delete-button-modern"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: deletingProject === project.projectId 
                    ? 'linear-gradient(135deg, #ffc107 0%, #ff8c00 100%)' 
                    : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  cursor: deletingProject === project.projectId ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                  opacity: 0.9
                }}
                title={deletingProject === project.projectId ? 'Deleting...' : 'Delete project'}
                onMouseOver={(e) => {
                  if (deletingProject !== project.projectId) {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                {deletingProject === project.projectId ? (
                  <SpinnerIcon size={16} />
                ) : (
                  <DeleteIcon size={16} />
                )}
              </button>

              <div className="project-card-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px',
                marginRight: '48px'
              }}>
                <h3 className="project-name" style={{
                  margin: '0 0 8px 0',
                  fontSize: '20px',
                  color: '#2c3e50',
                  fontWeight: '600',
                  lineHeight: '1.3'
                }}>{project.projectName}</h3>
                <div className="project-task-count" style={{
                  background: '#f8f9fa',
                  color: '#495057',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}>
                  {project.totalTasks} {project.totalTasks === 1 ? 'task' : 'tasks'}
                </div>
              </div>
              
              <div className="project-stats" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px'
              }}>
                <div className="stat-item" style={{ textAlign: 'center' }}>
                  <span className="stat-label" style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#6c757d',
                    marginBottom: '4px'
                  }}>Completed</span>
                  <span className="stat-value completed" style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#28a745'
                  }}>{project.completedTasks}</span>
                </div>
                
                <div className="stat-item" style={{ textAlign: 'center' }}>
                  <span className="stat-label" style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#6c757d',
                    marginBottom: '4px'
                  }}>In Progress</span>
                  <span className="stat-value in-progress" style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#17a2b8'
                  }}>{project.inProgressTasks}</span>
                </div>
                
                <div className="stat-item" style={{ textAlign: 'center' }}>
                  <span className="stat-label" style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#6c757d',
                    marginBottom: '4px'
                  }}>Todo</span>
                  <span className="stat-value todo" style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#ffc107'
                  }}>{project.todoTasks}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showCreateForm && (
        <ProjectForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .delete-button-modern:focus {
          outline: 2px solid rgba(255, 107, 107, 0.4);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default ProjectList;