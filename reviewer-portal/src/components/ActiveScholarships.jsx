import React, { useState, useEffect } from 'react'
import { getActiveScholarships } from '../services/api'
import ApplicationReview from './ApplicationReview'

const ActiveScholarships = () => {
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedScholarship, setSelectedScholarship] = useState(null)

  useEffect(() => {
    fetchScholarships()
  }, [])

  const fetchScholarships = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getActiveScholarships()
      if (response.success) {
        setScholarships(response.data)
      } else {
        setError('Failed to load scholarships')
      }
    } catch (err) {
      setError('Failed to load scholarships')
      console.error('Error fetching scholarships:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatAmount = (amount) => {
    if (!amount) return 'Amount not specified'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleViewApplications = (scholarship) => {
    setSelectedScholarship(scholarship)
  }

  const handleBackToScholarships = () => {
    setSelectedScholarship(null)
  }

  if (selectedScholarship) {
    return (
      <ApplicationReview 
        scholarshipId={selectedScholarship.id}
        scholarshipTitle={selectedScholarship.title}
        onBack={handleBackToScholarships}
      />
    )
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Loading active scholarships...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button className="btn btn-primary" onClick={fetchScholarships}>
          Try Again
        </button>
      </div>
    )
  }

  if (scholarships.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Active Scholarships</h3>
        <p>There are currently no active scholarships available for review.</p>
      </div>
    )
  }

  return (
    <div className="scholarships-container">
      <div className="scholarships-header">
        <h2>Active Scholarships</h2>
        <p>View and manage scholarship applications for currently active scholarship programs.</p>
      </div>
      
      <div className="scholarships-list">
        {scholarships.map((scholarship) => (
          <div key={scholarship.id} className="scholarship-card">
            <div className="scholarship-header">
              <h3>{scholarship.title}</h3>
            </div>
            
            {scholarship.description && (
              <p className="scholarship-description">{scholarship.description}</p>
            )}
            
            <div className="scholarship-details">
              <div className="detail-item">
                <span className="detail-label">Deadline:</span>
                <span className="detail-value">{formatDate(scholarship.deadline)}</span>
              </div>
            </div>
            
            <div className="scholarship-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => handleViewApplications(scholarship)}
              >
                View Applications
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActiveScholarships