import { useState } from 'react'
import './App.css'
import ProjectList from './components/ProjectList'
import TaskBoard from './components/TaskBoard'

function App() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId)
  }

  const handleBackToProjects = () => {
    setSelectedProjectId(null)
  }

  return (
    <div className="App" style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      fontFamily: 'Inter, Roboto, Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Navigation Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {selectedProjectId && (
              <button 
                onClick={handleBackToProjects}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 20px',
                  minHeight: '44px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '0.025em',
                  transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                  backdropFilter: 'blur(10px)',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <span style={{ fontSize: '16px' }}>←</span>
                Back to Projects
              </button>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                fontSize: '18px'
              }}>
                📊
              </div>
              
              <div>
                <h1 style={{
                  margin: 0,
                  fontSize: selectedProjectId ? '20px' : '24px',
                  color: 'white',
                  fontWeight: '700',
                  fontFamily: 'Poppins, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  letterSpacing: '-0.025em',
                  lineHeight: '1.25',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}>
                  {selectedProjectId ? 'Task Board' : 'Mini Project Management System'}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {selectedProjectId ? (
          <TaskBoard projectId={selectedProjectId} />
        ) : (
          <ProjectList onSelectProject={handleProjectSelect} />
        )}
      </main>

      {/* Footer */}
      {!selectedProjectId && (
        <footer style={{
          marginTop: '48px',
          padding: '24px',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <p style={{ margin: 0, fontWeight: '500' }}>
              Project Hub - Organize • Track • Deliver
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}

export default App