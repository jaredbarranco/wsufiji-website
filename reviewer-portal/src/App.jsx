import React, { useState, useEffect } from 'react'
import { auth } from './services/api'
import ReviewerManagement from './components/ReviewerManagement'
import CloudflareHeaderConfig from './components/CloudflareHeaderConfig'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentView, setCurrentView] = useState('dashboard')
  const [cfHeaders, setCfHeaders] = useState(null)

  useEffect(() => {
    if (import.meta.env.DEV) {
      const savedHeaders = localStorage.getItem('cf-headers')
      if (savedHeaders) {
        const parsed = JSON.parse(savedHeaders)
        setCfHeaders(parsed)
      }
    }
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      const response = await auth()
      if (response.success) {
        setUser(response.data)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await auth()
      if (response.success) {
        setUser(response.data)
      } else {
        setError('Authentication failed')
      }
    } catch (err) {
      setError('Failed to authenticate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="landing">
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  const isAdmin = user?.role === 'admin'

  const Navigation = () => {
    if (!isAdmin) return null

    return (
      <nav className="admin-nav">
        <div className="container">
          <div className="nav-links">
            <button
              className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`nav-link ${currentView === 'reviewers' ? 'active' : ''}`}
              onClick={() => setCurrentView('reviewers')}
            >
              Reviewer Management
            </button>
          </div>
        </div>
      </nav>
    )
  }

  const Dashboard = () => (
    <div className="landing">
      <h2>Welcome, {user.name}!</h2>
      <p>You are authenticated as a {user.role}.</p>
      {isAdmin && (
        <div className="admin-dashboard">
          <h3>Admin Dashboard</h3>
          <div className="dashboard-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => setCurrentView('reviewers')}
            >
              Manage Reviewers
            </button>
          </div>
        </div>
      )}
      {!isAdmin && (
        <div className="reviewer-dashboard">
          <h3>Reviewer Dashboard</h3>
          <p>Reviewer portal features coming soon...</p>
        </div>
      )}
    </div>
  )

  if (user) {
    return (
      <div>
        <header className="header">
          <div className="container">
            <h1>WSU Fiji Reviewer Portal</h1>
            <div className="user-info">
              <span>{user.name}</span>
              <span className="user-role">({user.role})</span>
            </div>
          </div>
        </header>
        {import.meta.env.DEV && (
          <div className="container">
            <CloudflareHeaderConfig onHeadersSet={setCfHeaders} />
          </div>
        )}
        <Navigation />
        <main>
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'reviewers' && isAdmin && <ReviewerManagement />}
        </main>
      </div>
    )
  }

  return (
    <div>
      <header className="header">
        <div className="container">
          <h1>WSU Fiji Reviewer Portal</h1>
        </div>
      </header>
      {import.meta.env.DEV && (
        <div className="container">
          <CloudflareHeaderConfig onHeadersSet={setCfHeaders} />
        </div>
      )}
      <div className="landing">
        <h2>Scholarship Review Portal</h2>
        <p>Access the WSU Fiji scholarship application review system to evaluate and score applications.</p>
        {error && <div className="error">{error}</div>}
        <button className="btn" onClick={handleLogin} disabled={loading}>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <span>Authenticating...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </div>
    </div>
  )
}

export default App