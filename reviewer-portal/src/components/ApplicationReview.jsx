import React, { useState, useEffect } from 'react'
import { getApplicationsForScholarship, getApplicationDetails, submitReview } from '../services/api'

const ApplicationReview = ({ scholarshipId, scholarshipTitle, onBack }) => {
  const [applications, setApplications] = useState([])
  const [currentApplication, setCurrentApplication] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewData, setReviewData] = useState({
    overall_rating: '',
    academic_potential: '',
    leadership_potential: '',
    financial_need: '',
    comments: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Helper function to render different field value types
  const renderFieldValue = (value) => {
    if (value === null || value === undefined) {
      return 'Not provided'
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return 'None'

      // Check if array contains objects
      if (value.every(item => typeof item === 'object' && item !== null)) {
        return (
          <div className="array-objects">
            {value.map((item, index) => (
              <div key={index} className="object-item">
                <strong>Item {index + 1}:</strong>
                <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                  {Object.entries(item).map(([key, val]) => (
                    <div key={key} style={{ marginBottom: '0.25rem' }}>
                      <small><strong>{key}:</strong> {renderFieldValue(val)}</small>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      }

      // Regular array of primitives
      return value.join(', ')
    }

    if (typeof value === 'object') {
      return (
        <div className="object-display">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} style={{ marginBottom: '0.25rem' }}>
              <strong>{key}:</strong> {renderFieldValue(val)}
            </div>
          ))}
        </div>
      )
    }

    if (typeof value === 'string') {
      // Handle long text (essays, etc.)
      if (value.length > 500) {
        return (
          <details>
            <summary>{value.substring(0, 100)}...</summary>
            <div style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
              {value}
            </div>
          </details>
        )
      }
      // Handle URLs
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
      }

      // Handle file paths (from Supabase storage)
      if (value.includes('temp/') || value.includes('applications/')) {
        return <span className="file-path">📎 File uploaded: {value.split('/').pop()}</span>
      }
      // Handle email
      if (value.includes('@') && value.includes('.')) {
        return <a href={`mailto:${value}`}>{value}</a>
      }
      return value
    }

    return String(value)
  }

  useEffect(() => {
    fetchApplications()
  }, [scholarshipId])

  useEffect(() => {
    if (applications.length > 0 && currentIndex >= 0 && currentIndex < applications.length) {
      fetchApplicationDetails(applications[currentIndex].id)
    }
  }, [currentIndex, applications])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await getApplicationsForScholarship(scholarshipId)
      if (response.success) {
        setApplications(response.data || [])
        setCurrentIndex(0)
      } else {
        setError('Failed to fetch applications')
      }
    } catch (err) {
      setError('Failed to fetch applications: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplicationDetails = async (applicationId) => {
    try {
      const response = await getApplicationDetails(applicationId)
      if (response.success) {
        setCurrentApplication(response.data)
        // Reset review form for new application
        setReviewData({
          overall_rating: response.data.review?.overall_rating || '',
          academic_potential: response.data.review?.academic_potential || '',
          leadership_potential: response.data.review?.leadership_potential || '',
          financial_need: response.data.review?.financial_need || '',
          comments: response.data.review?.comments || ''
        })
      }
    } catch (err) {
      setError('Failed to fetch application details: ' + err.message)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < applications.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleReviewChange = (field, value) => {
    setReviewData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmitReview = async () => {
    try {
      setSubmitting(true)
      const response = await submitReview(currentApplication.id, reviewData)
      if (response.success) {
        // Update the application's review status
        const updatedApplications = [...applications]
        updatedApplications[currentIndex] = {
          ...updatedApplications[currentIndex],
          reviewed: true,
          review: reviewData
        }
        setApplications(updatedApplications)
        
        // Move to next application if available
        if (currentIndex < applications.length - 1) {
          handleNext()
        }
      } else {
        setError('Failed to submit review')
      }
    } catch (err) {
      setError('Failed to submit review: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const reviewedCount = applications.filter(app => app.reviewed).length
  const totalCount = applications.length

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Loading applications...</span>
      </div>
    )
  }

  if (error && !currentApplication) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button className="btn" onClick={onBack}>Back to Scholarships</button>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Applications Found</h3>
        <p>There are no applications for this scholarship yet.</p>
        <button className="btn" onClick={onBack}>Back to Scholarships</button>
      </div>
    )
  }

  return (
    <div className="application-review container-wide">
      <div className="review-header">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Scholarships
        </button>
        <div className="review-title">
          <h2>{scholarshipTitle}</h2>
          <div className="progress-counter">
            {reviewedCount}/{totalCount} Reviewed
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="review-navigation">
        <button 
          className="btn" 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>
        
        <div className="application-counter">
          Application {currentIndex + 1} of {applications.length}
        </div>
        
        <button 
          className="btn" 
          onClick={handleNext}
          disabled={currentIndex === applications.length - 1}
        >
          Next →
        </button>
      </div>

      {currentApplication && (
        <div className="review-content">
          <div className="review-columns">
            {/* Left Column - Application Data */}
            <div className="application-data">
              <div className="application-header">
                <h3>Application Details</h3>
                <span className={`review-status ${currentApplication.reviewed ? 'reviewed' : 'pending'}`}>
                  {currentApplication.reviewed ? 'Reviewed' : 'Pending Review'}
                </span>
              </div>
              
              <div className="application-content">
                {currentApplication.submission_data && (
                  <div className="applicant-info">
                    <h4>Applicant Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Name:</label>
                        <span>{currentApplication.submission_data.fullName || currentApplication.submission_data.full_name || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>Email:</label>
                        <span>{currentApplication.email || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>Phone:</label>
                        <span>{currentApplication.submission_data.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentApplication.submission_data && (
                  <div className="form-responses">
                    <h4>Application Responses</h4>
                    <div className="responses">
                      {(() => {
                        // Get field order from form_schema if available
                        const formSchema = currentApplication.scholarship?.form_schema;
                        let fieldOrder = Object.keys(currentApplication.submission_data);

                        if (formSchema?.uiSchema?.['ui:order']) {
                          // Use the specified order from ui:order
                          fieldOrder = formSchema.uiSchema['ui:order'];
                        }

                        return fieldOrder.map(key => {
                          const value = currentApplication.submission_data[key];

                          // Skip review data and undefined values
                          if (key === 'review' || value === undefined) return null;

                          // Get field title from form_schema if available
                          const fieldTitle = formSchema?.properties?.[key]?.title || key;

                          return (
                            <div key={key} className="response-item">
                              <label>{fieldTitle}:</label>
                              <div className="response-value">
                                {renderFieldValue(value)}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
                
                {currentApplication.submitted_at && (
                  <div className="submission-info">
                    <h4>Submission Information</h4>
                    <p>Submitted: {new Date(currentApplication.submitted_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Review Form */}
            <div className="review-form">
              <h3>Review & Rating</h3>
              
              <div className="rating-section">
                <div className="rating-item">
                  <label>Overall Rating (1-10):</label>
                  <select 
                    value={reviewData.overall_rating}
                    onChange={(e) => handleReviewChange('overall_rating', e.target.value)}
                  >
                    <option value="">Select Rating</option>
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div className="rating-item">
                  <label>Academic Potential (1-10):</label>
                  <select 
                    value={reviewData.academic_potential}
                    onChange={(e) => handleReviewChange('academic_potential', e.target.value)}
                  >
                    <option value="">Select Rating</option>
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div className="rating-item">
                  <label>Leadership Potential (1-10):</label>
                  <select 
                    value={reviewData.leadership_potential}
                    onChange={(e) => handleReviewChange('leadership_potential', e.target.value)}
                  >
                    <option value="">Select Rating</option>
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div className="rating-item">
                  <label>Financial Need (1-10):</label>
                  <select 
                    value={reviewData.financial_need}
                    onChange={(e) => handleReviewChange('financial_need', e.target.value)}
                  >
                    <option value="">Select Rating</option>
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div className="rating-item">
                  <label>Comments:</label>
                  <textarea 
                    value={reviewData.comments}
                    onChange={(e) => handleReviewChange('comments', e.target.value)}
                    rows={6}
                    placeholder="Add your comments about this application..."
                  />
                </div>
              </div>

              <div className="review-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleSubmitReview}
                  disabled={submitting || !reviewData.overall_rating}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplicationReview