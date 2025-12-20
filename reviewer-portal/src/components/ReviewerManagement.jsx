import React, { useState, useEffect } from 'react'
import { getReviewers, createReviewer, updateReviewer, deleteReviewer } from '../services/api'

function ReviewerManagement() {
  const [reviewers, setReviewers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingReviewer, setEditingReviewer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'reviewer',
    is_active: true
  })

  useEffect(() => {
    fetchReviewers()
  }, [])

  const fetchReviewers = async () => {
    try {
      setLoading(true)
      const response = await getReviewers()
      if (response.success) {
        setReviewers(response.data)
      }
    } catch (err) {
      setError('Failed to fetch reviewers')
      console.error('Fetch reviewers error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      if (editingReviewer) {
        const response = await updateReviewer(editingReviewer.id, formData)
        if (response.success) {
          setReviewers(reviewers.map(r => r.id === editingReviewer.id ? response.data : r))
        }
      } else {
        const response = await createReviewer(formData)
        if (response.success) {
          setReviewers([response.data, ...reviewers])
        }
      }

      setFormData({ name: '', email: '', role: 'reviewer', is_active: true })
      setEditingReviewer(null)
      setShowForm(false)
    } catch (err) {
      setError(editingReviewer ? 'Failed to update reviewer' : 'Failed to create reviewer')
      console.error('Submit error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (reviewer) => {
    setEditingReviewer(reviewer)
    setFormData({
      name: reviewer.name,
      email: reviewer.email,
      role: reviewer.role,
      is_active: reviewer.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (reviewerId) => {
    if (!confirm('Are you sure you want to delete this reviewer?')) {
      return
    }

    try {
      setLoading(true)
      const response = await deleteReviewer(reviewerId)
      if (response.success) {
        setReviewers(reviewers.filter(r => r.id !== reviewerId))
      }
    } catch (err) {
      setError('Failed to delete reviewer')
      console.error('Delete error:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleForm = () => {
    if (showForm) {
      setFormData({ name: '', email: '', role: 'reviewer', is_active: true })
      setEditingReviewer(null)
    }
    setShowForm(!showForm)
  }

  if (loading && reviewers.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Loading reviewers...</span>
      </div>
    )
  }

  return (
    <div className="reviewer-management">
      <div className="container">
        <div className="page-header">
          <h2>Reviewer Management</h2>
          <button className="btn btn-primary" onClick={toggleForm}>
            {showForm ? 'Cancel' : 'Add New Reviewer'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {showForm && (
          <div className="form-container">
            <h3>{editingReviewer ? 'Edit Reviewer' : 'Add New Reviewer'}</h3>
            <form onSubmit={handleSubmit} className="reviewer-form">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="reviewer">Reviewer</option>
                  <option value="committee_member">Committee Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <div className="loading">
                      <div className="spinner"></div>
                      <span>{editingReviewer ? 'Updating...' : 'Creating...'}</span>
                    </div>
                  ) : (
                    editingReviewer ? 'Update Reviewer' : 'Create Reviewer'
                  )}
                </button>
                <button type="button" className="btn btn-secondary" onClick={toggleForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="reviewers-list">
          <h3>Current Reviewers ({reviewers.length})</h3>
          {reviewers.length === 0 ? (
            <p>No reviewers found. Add your first reviewer to get started.</p>
          ) : (
            <div className="table-container">
              <table className="reviewers-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewers.map((reviewer) => (
                    <tr key={reviewer.id}>
                      <td>{reviewer.name}</td>
                      <td>{reviewer.email}</td>
                      <td>
                        <span className={`role-badge role-${reviewer.role}`}>
                          {reviewer.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${reviewer.is_active ? 'active' : 'inactive'}`}>
                          {reviewer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(reviewer.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleEdit(reviewer)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(reviewer.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewerManagement