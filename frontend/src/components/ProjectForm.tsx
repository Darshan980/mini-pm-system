import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import './ProjectForm.css';

const CREATE_PROJECT = gql`
  mutation CreateProject(
    $name: String!
    $description: String
    $status: String
    $dueDate: Date
  ) {
    createProject(
      name: $name
      description: $description
      status: $status
      dueDate: $dueDate
    ) {
      project {
        id
        name
        description
        status
        dueDate
        createdAt
      }
      success
      message
    }
  }
`;

interface CreateProjectData {
  createProject: {
    project: {
      id: string;
      name: string;
      description?: string;
      status: string;
      dueDate?: string;
      createdAt: string;
    };
    success: boolean;
    message: string;
  };
}

interface ProjectFormData {
  name: string;
  description: string;
  status: string;
  dueDate: string;
}

interface ProjectFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'planning',
    dueDate: ''
  });

  const [createProject, { loading, error }] = useMutation<CreateProjectData>(CREATE_PROJECT, {
    onCompleted: (data: CreateProjectData) => {
      if (data.createProject.success) {
        onSuccess();
        onClose();
      }
    },
    onError: (error) => {
      console.error('Error creating project:', error);
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Project name is required');
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      status: formData.status,
      dueDate: formData.dueDate || undefined,
    };

    try {
      await createProject({ variables: submitData });
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  return (
    <div className="project-form-overlay" onClick={onClose}>
      <div className="project-form-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="project-form-header">
          <div className="project-form-title-section">
            <h2 className="project-form-title">Create New Project</h2>
            <p className="project-form-subtitle">
              Set up a new project for your organization
            </p>
          </div>
          <button className="project-form-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="project-form-content">
          {error && (
            <div className="project-form-error">
              <strong>Error:</strong> {error.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({...formData, name: e.target.value})
                }
                required
                placeholder="Enter project name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  setFormData({...formData, description: e.target.value})
                }
                rows={4}
                placeholder="Describe your project goals and requirements"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    setFormData({...formData, status: e.target.value})
                  }
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({...formData, dueDate: e.target.value})
                  }
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {formData.status && (
              <div className="status-preview">
                <div className="status-preview-label">Status Preview:</div>
                <span className={`status-badge status-${formData.status}`}>
                  {formData.status.replace('_', ' ')}
                </span>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className={`btn-submit ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;