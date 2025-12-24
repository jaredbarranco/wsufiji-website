import React, { useState, useEffect } from 'react'

function CloudflareHeaderConfig({ onHeadersSet }) {
  const [headers, setHeaders] = useState({
    'CF-Access-Client-Id': '',
    'X-Dev-Name': ''
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const savedHeaders = localStorage.getItem('cf-headers')
    if (savedHeaders) {
      const parsed = JSON.parse(savedHeaders)
      setHeaders(prev => ({
        'CF-Access-Client-Id': parsed['CF-Access-Client-Id'] || '',
        'X-Dev-Name': parsed['X-Dev-Name'] || parsed['name'] || '',
        'CF-Access-Client-Secret': '' // Remove old secret if exists
      }))
    }
  }, [])

  const handleChange = (headerName, value) => {
    setHeaders(prev => ({
      ...prev,
      [headerName]: value
    }))
    setSaved(false)
  }

  const handleSave = () => {
    localStorage.setItem('cf-headers', JSON.stringify(headers))
    setSaved(true)
    onHeadersSet(headers)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClear = () => {
    const emptyHeaders = {
      'CF-Access-Client-Id': '',
      'X-Dev-Name': ''
    }
    setHeaders(emptyHeaders)
    localStorage.removeItem('cf-headers')
    onHeadersSet(emptyHeaders)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="cf-header-config" style={{
      padding: '20px',
      margin: '20px 0',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>Development Authentication (Local Only)</h3>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        Enter your email and name to bypass Cloudflare authentication during local development.
        This will be used to identify you in the reviewer system.
      </p>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Email Address:
        </label>
        <input
          type="email"
          value={headers['CF-Access-Client-Id']}
          onChange={(e) => handleChange('CF-Access-Client-Id', e.target.value)}
          placeholder="your.email@example.com"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Your Name:
        </label>
        <input
          type="text"
          value={headers['X-Dev-Name']}
          onChange={(e) => handleChange('X-Dev-Name', e.target.value)}
          placeholder="John Doe"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleSave}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Save Credentials
        </button>
        <button
          onClick={handleClear}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Clear Credentials
        </button>
      </div>

      {saved && (
        <div style={{
          marginTop: '10px',
          padding: '8px',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          Credentials {headers['CF-Access-Client-Id'] ? 'saved' : 'cleared'} successfully!
        </div>
      )}
    </div>
  )
}

export default CloudflareHeaderConfig