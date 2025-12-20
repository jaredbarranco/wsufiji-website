import React, { useState, useEffect } from 'react'
import { getScholarships, createScholarship, updateScholarship, deleteScholarship } from '../services/api'

const ScholarshipManagement = () => {
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingScholarship, setEditingScholarship] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    verbose_description: '',
    deadline: '',
    active: true,
    form_schema: '{}',
    ui_schema: '{}',
    reviewer_field_visibility: '{"mode": "denylist", "fields": []}'
  })

  useEffect(() => {
    fetchScholarships()
  }, [])

  const fetchScholarships = async () => {
    try {
      setLoading(true)
      const response = await getScholarships()
      setScholarships(response.data || [])
      setError('')
    } catch (err) {
      setError('Failed to fetch scholarships: ' + err.message)
      setScholarships([])
    } finally {
      setLoading(false)
    }
  }

  const validateJSON = (jsonString, fieldName) => {
    try {
      return JSON.parse(jsonString)
    } catch (err) {
      throw new Error(`Invalid JSON in ${fieldName}: ${err.message}`)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Validate JSON schemas
      const form_schema = validateJSON(formData.form_schema, 'Form Schema')
      const ui_schema = validateJSON(formData.ui_schema, 'UI Schema')
      const reviewer_field_visibility = validateJSON(formData.reviewer_field_visibility, 'Reviewer Field Visibility')

      const submissionData = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        form_schema,
        ui_schema,
        reviewer_field_visibility
      }

      if (editingScholarship) {
        await updateScholarship(editingScholarship.id, submissionData)
        setEditingScholarship(null)
      } else {
        await createScholarship(submissionData)
        setShowCreateForm(false)
      }

      setFormData({
        slug: '',
        title: '',
        description: '',
        verbose_description: '',
        deadline: '',
        active: true,
        form_schema: '{}',
        ui_schema: '{}',
        reviewer_field_visibility: '{"mode": "denylist", "fields": []}'
      })
      fetchScholarships()
    } catch (err) {
      setError('Failed to save scholarship: ' + err.message)
    }
  }

  const handleEdit = (scholarship) => {
    setEditingScholarship(scholarship)
    setFormData({
      slug: scholarship.slug,
      title: scholarship.title,
      description: scholarship.description || '',
      verbose_description: scholarship.verbose_description || '',
      deadline: scholarship.deadline ? new Date(scholarship.deadline).toISOString().slice(0, 16) : '',
      active: scholarship.active,
      form_schema: JSON.stringify(scholarship.form_schema || {}, null, 2),
      ui_schema: JSON.stringify(scholarship.ui_schema || {}, null, 2),
      reviewer_field_visibility: JSON.stringify(scholarship.reviewer_field_visibility || { mode: 'denylist', fields: [] }, null, 2)
    })
    setShowCreateForm(false)
  }

  const handleDelete = async (scholarshipId) => {
    if (window.confirm('Are you sure you want to delete this scholarship?')) {
      try {
        await deleteScholarship(scholarshipId)
        fetchScholarships()
      } catch (err) {
        setError('Failed to delete scholarship: ' + err.message)
      }
    }
  }

  const handleCancel = () => {
    setEditingScholarship(null)
    setShowCreateForm(false)
    setFormData({
      slug: '',
      title: '',
      description: '',
      verbose_description: '',
      deadline: '',
      active: true,
      form_schema: '{}',
      ui_schema: '{}',
      reviewer_field_visibility: '{"mode": "denylist", "fields": []}'
    })
  }

  const loadFormSchemaTemplate = () => {
    const template = {
      "type": "object",
      "properties": {
        "fullName": {
          "type": "string",
          "title": "Full Name",
          "minLength": 2
        },
        "email": {
          "type": "string",
          "title": "Email",
          "format": "email"
        },
        "phone": {
          "type": "string",
          "title": "Phone Number",
          "pattern": "^[0-9-+()\\s]+$"
        },
        "essay": {
          "type": "string",
          "title": "Personal Statement",
          "minLength": 100
        }
      },
      "required": ["fullName", "email", "essay"]
    }
    setFormData(prev => ({ ...prev, form_schema: JSON.stringify(template, null, 2) }))
  }

  const loadUISchemaTemplate = () => {
    const template = {
      "ui:order": ["fullName", "email", "phone", "essay"],
      "essay": {
        "ui:widget": "textarea",
        "ui:options": {
          "rows": 6
        }
      }
    }
    setFormData(prev => ({ ...prev, ui_schema: JSON.stringify(template, null, 2) }))
  }

  const prettyPrintJSON = (fieldName) => {
    try {
      const jsonString = formData[fieldName]
      const parsed = JSON.parse(jsonString)
      const pretty = JSON.stringify(parsed, null, 2)
      setFormData(prev => ({ ...prev, [fieldName]: pretty }))
    } catch (err) {
      setError(`Cannot pretty print ${fieldName.replace('_', ' ')}: Invalid JSON`)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const getFormSchemaFields = () => {
    try {
      const schema = JSON.parse(formData.form_schema)
      if (schema.properties && typeof schema.properties === 'object') {
        return Object.keys(schema.properties)
      }
      return []
    } catch (err) {
      return []
    }
  }

  const handleVisibilityFieldToggle = (fieldName, checked) => {
    try {
      const currentVisibility = JSON.parse(formData.reviewer_field_visibility)
      let fields = currentVisibility.fields || []

      if (checked) {
        if (!fields.includes(fieldName)) {
          fields.push(fieldName)
        }
      } else {
        fields = fields.filter(field => field !== fieldName)
      }

      const newVisibility = {
        ...currentVisibility,
        fields: fields
      }

      setFormData(prev => ({
        ...prev,
        reviewer_field_visibility: JSON.stringify(newVisibility, null, 2)
      }))
    } catch (err) {
      setError('Failed to update field visibility: Invalid JSON structure')
    }
  }

  const getHiddenFields = () => {
    try {
      const visibility = JSON.parse(formData.reviewer_field_visibility)
      return visibility.fields || []
    } catch (err) {
      return []
    }
  }

  if (loading) {
    return <div className="loading">Loading scholarships...</div>
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Scholarship Management</h2>
        <button 
          className="btn" 
          onClick={() => setShowCreateForm(true)}
          disabled={showCreateForm || editingScholarship}
        >
          Create New Scholarship
        </button>
      </div>

      {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {(showCreateForm || editingScholarship) && (
        <div className="form-container" style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>{editingScholarship ? 'Edit Scholarship' : 'Create New Scholarship'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="e.g., fall-2025-grant"
                  required
                  disabled={!!editingScholarship}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Scholarship title"
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Deadline</label>
                <input
                  type="datetime-local"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  name="active"
                  id="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="active" style={{ margin: 0 }}>Active</label>
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Brief Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description (255 chars max)"
                  maxLength={255}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Verbose Description</label>
                <textarea
                  name="verbose_description"
                  value={formData.verbose_description}
                  onChange={handleInputChange}
                  placeholder="Detailed description (markdown supported)"
                  rows={4}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
                />
              </div>
            </div>
            
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <h4>JSON Schemas</h4>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold', margin: 0 }}>Form Schema (JSON)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        type="button" 
                        onClick={() => prettyPrintJSON('form_schema')}
                        className="btn"
                        style={{ 
                          fontSize: '0.8rem', 
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#28a745'
                        }}
                      >
                        Pretty Print
                      </button>
                      <button 
                        type="button" 
                        onClick={loadFormSchemaTemplate}
                        className="btn"
                        style={{ 
                          fontSize: '0.8rem', 
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#17a2b8'
                        }}
                      >
                        Load Template
                      </button>
                    </div>
                  </div>
                  <textarea
                    name="form_schema"
                    value={formData.form_schema}
                    onChange={handleInputChange}
                    placeholder='{"type": "object", "properties": {...}}'
                    rows={8}
                    style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px', 
                      resize: 'vertical',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem'
                    }}
                  />
                  <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
                    JSON Schema for form structure and validation
                  </small>
                </div>
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold', margin: 0 }}>UI Schema (JSON)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        type="button" 
                        onClick={() => prettyPrintJSON('ui_schema')}
                        className="btn"
                        style={{ 
                          fontSize: '0.8rem', 
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#28a745'
                        }}
                      >
                        Pretty Print
                      </button>
                      <button 
                        type="button" 
                        onClick={loadUISchemaTemplate}
                        className="btn"
                        style={{ 
                          fontSize: '0.8rem', 
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#17a2b8'
                        }}
                      >
                        Load Template
                      </button>
                    </div>
                  </div>
                  <textarea
                    name="ui_schema"
                    value={formData.ui_schema}
                    onChange={handleInputChange}
                    placeholder='{"ui:order": [...], "field": {"ui:widget": "..."}}'
                    rows={6}
                    style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px', 
                      resize: 'vertical',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem'
                    }}
                  />
                  <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
                    JSON Schema for UI layout hints and widgets (optional)
                  </small>
                </div>
              </div>
             </div>

             <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
               <h4>Reviewer Field Visibility</h4>
               <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                 Select which fields should be hidden from reviewers. These fields will not be visible in the reviewer interface but will still be stored in the database.
               </p>

               <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
                 <div style={{ marginBottom: '1rem' }}>
                   <strong>Mode:</strong> Denylist (hide selected fields, show everything else)
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                   {getFormSchemaFields().map(fieldName => {
                     const isHidden = getHiddenFields().includes(fieldName)
                     return (
                       <label key={fieldName} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <input
                           type="checkbox"
                           checked={isHidden}
                           onChange={(e) => handleVisibilityFieldToggle(fieldName, e.target.checked)}
                           style={{ width: 'auto' }}
                         />
                         <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{fieldName}</span>
                       </label>
                     )
                   })}
                 </div>

                 {getFormSchemaFields().length === 0 && (
                   <p style={{ color: '#666', fontStyle: 'italic' }}>
                     No form fields found. Configure the Form Schema above to see field visibility options.
                   </p>
                 )}

                 <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                   <strong>Hidden Fields:</strong> {getHiddenFields().length > 0 ? getHiddenFields().join(', ') : 'None'}
                 </div>
               </div>
             </div>

             <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn">
                {editingScholarship ? 'Update' : 'Create'} Scholarship
              </button>
              <button type="button" onClick={handleCancel} className="btn" style={{ backgroundColor: '#6c757d' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="scholarships-table-container">
        {scholarships.length === 0 ? (
          <p>No scholarships found. Create your first scholarship above.</p>
        ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
             <thead>
               <tr style={{ borderBottom: '2px solid #ddd' }}>
                 <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Title</th>
                 <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Slug</th>
                 <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Deadline</th>
                 <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Form Fields</th>
                 <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Hidden Fields</th>
                 <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Active</th>
                 <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Actions</th>
               </tr>
             </thead>
            <tbody>
              {Array.isArray(scholarships) && scholarships.map((scholarship) => (
                <tr key={scholarship.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem' }}>{scholarship.title}</td>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>{scholarship.slug}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {scholarship.deadline ? new Date(scholarship.deadline).toLocaleString() : 'No deadline'}
                  </td>
                   <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                     {scholarship.form_schema?.properties ?
                       Object.keys(scholarship.form_schema.properties).length : 0
                     } fields
                   </td>
                   <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                     {scholarship.reviewer_field_visibility?.fields ?
                       scholarship.reviewer_field_visibility.fields.length : 0
                     } hidden
                   </td>
                   <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      backgroundColor: scholarship.active ? '#d4edda' : '#f8d7da',
                      color: scholarship.active ? '#155724' : '#721c24'
                    }}>
                      {scholarship.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleEdit(scholarship)}
                      className="btn"
                      style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      disabled={showCreateForm || editingScholarship}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(scholarship.id)}
                      className="btn"
                      style={{ backgroundColor: '#dc3545', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      disabled={showCreateForm || editingScholarship}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default ScholarshipManagement