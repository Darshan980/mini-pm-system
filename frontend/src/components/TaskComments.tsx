import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';

// GraphQL Queries & Mutations
const GET_COMMENTS = gql`
  query GetComments($taskId: ID!) {
    comments(taskId: $taskId) {
      id
      author
      content
      createdAt
    }
  }
`;

const ADD_COMMENT = gql`
  mutation AddComment($taskId: ID!, $author: String!, $content: String!) {
    addComment(taskId: $taskId, author: $author, content: $content) {
      comment {
        id
        author
        content
        createdAt
      }
      success
      message
    }
  }
`;

// TypeScript Interfaces
interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface CommentsData {
  comments: Comment[];
}

interface TaskCommentsProps {
  taskId: string;
  taskTitle: string;
  onClose: () => void;
}

const TaskComments: React.FC<TaskCommentsProps> = ({ taskId, taskTitle, onClose }) => {
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('');

  const { loading, error, data, refetch } = useQuery<CommentsData>(GET_COMMENTS, {
    variables: { taskId }
  });

  const [addComment, { loading: addingComment }] = useMutation(ADD_COMMENT, {
    onCompleted: () => {
      refetch();
      setNewComment('');
    }
  });

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !author.trim()) {
      alert('Please fill in both author and comment fields');
      return;
    }

    try {
      await addComment({
        variables: {
          taskId,
          author: author.trim(),
          content: newComment.trim()
        }
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (name: string) => {
    return name
      .split('@')[0] // Remove email domain if present
      .split(/[\s._-]+/) // Split by common separators
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (author: string) => {
    // Generate consistent color based on author name
    const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1', '#fd7e14'];
    let hash = 0;
    for (let i = 0; i < author.length; i++) {
      hash = author.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading comments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#dc3545', margin: '0 0 10px 0' }}>Error Loading Comments</h3>
          <p style={{ margin: '0 0 15px 0' }}>{error.message}</p>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const comments = data?.comments || [];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '600px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #dee2e6',
          background: '#f8f9fa'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#2c3e50' }}>
                Task Comments
              </h2>
              <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
                {taskTitle}
              </p>
            </div>
            <button 
              style={{
                background: 'none',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer',
                color: '#6c757d',
                lineHeight: 1
              }}
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          maxHeight: 'calc(80vh - 200px)'
        }}>
          {comments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6c757d'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <p style={{ margin: 0, fontSize: '16px' }}>No comments yet</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>Be the first to start the discussion!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {comments.map((comment) => (
                <div key={comment.id} style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: getAvatarColor(comment.author),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {getInitials(comment.author)}
                  </div>

                  {/* Comment Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: '8px',
                      gap: '12px'
                    }}>
                      <span style={{
                        fontWeight: '600',
                        color: '#2c3e50',
                        fontSize: '14px'
                      }}>
                        {comment.author}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: '#6c757d',
                        flexShrink: 0
                      }}>
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p style={{
                      margin: 0,
                      lineHeight: '1.5',
                      color: '#495057',
                      fontSize: '14px',
                      wordWrap: 'break-word'
                    }}>
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Comment Form */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #dee2e6',
          background: '#f8f9fa'
        }}>
          <form onSubmit={handleSubmitComment}>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Your name or email"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: 'white'
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical',
                  minHeight: '80px',
                  background: 'white',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingComment}
                style={{
                  padding: '10px 20px',
                  background: addingComment ? '#95c2fd' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: addingComment ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {addingComment ? 'Adding...' : 'Add Comment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskComments;