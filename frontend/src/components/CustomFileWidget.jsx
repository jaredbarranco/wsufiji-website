import React, { useState } from 'react';
import { useInvisibleTurnstile } from '../hooks/useInvisibleTurnstile';

export const CustomFileWidget = ({ value, onChange, options }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [key, setKey] = useState(0); // Key to force re-render of file input

  const { containerRef, getTurnstileToken, isReady } = useInvisibleTurnstile();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('=== FILE UPLOAD DEBUG START ===');
    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
      console.log('API_BASE:', API_BASE);
      console.log('Turnstile isReady:', isReady);
      console.log('Widget container exists:', !!containerRef.current);

      // 1. Get Turnstile token from invisible widget
      console.log('Getting Turnstile token for file upload...');
      const turnstileToken = await getTurnstileToken();

      if (!turnstileToken) {
        console.error('Turnstile verification failed - no token returned');
        throw new Error('Security verification failed. Please try again.');
      }
      console.log('Turnstile token received, length:', turnstileToken.length);
      console.log('Token preview:', turnstileToken.substring(0, 20) + '...');

      // 2. Request Signed URL
      const requestUrl = `${API_BASE}/api/sign-upload`;
      console.log('Step 1: Requesting signed URL from:', requestUrl);
      console.log('Request payload:', {
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        token: turnstileToken ? turnstileToken.substring(0, 20) + '...' : 'missing'
      });

      console.log('About to call fetch for signed URL...');
      const signRes = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
          token: turnstileToken
        })
      });

      console.log('Response status:', signRes.status);
      console.log('Response headers:', Object.fromEntries(signRes.headers.entries()));

      if (!signRes.ok) {
        const errorData = await signRes.text();
        console.error('Error response:', errorData);
        throw new Error(errorData || 'Failed to get upload URL');
      }

      const responseText = await signRes.text();
      console.log('Sign upload response text:', responseText);

      let responseJson;
      try {
        responseJson = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('Failed to parse JSON response:', parseErr);
        throw new Error('Invalid response from server');
      }

      const { uploadUrl, path } = responseJson;
      console.log('Extracted - uploadUrl:', uploadUrl ? 'present' : 'missing', 'path:', path);

      // 3. Direct Upload to Supabase (Bypassing Worker)
      console.log('Starting direct upload to Supabase...');
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
          'Content-Length': file.size.toString()
        }
      });

      console.log('Supabase upload response status:', uploadRes.status);
      console.log('Supabase upload response headers:', Object.fromEntries(uploadRes.headers.entries()));

      if (!uploadRes.ok) {
        const uploadErrorText = await uploadRes.text();
        console.error('Supabase upload failed:', uploadErrorText);
        throw new Error(`File upload failed: ${uploadRes.status} ${uploadErrorText}`);
      }

      console.log('Upload successful, updating form with path:', path);
      // 4. Update Form Data (Save Path only)
      onChange(path);
      setProgress(100);
      setUploadSuccess(true);

    } catch (err) {
      console.error("Upload failed - Full error:", err);
      console.error("Error name:", err.name);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
    setUploadSuccess(false);
    setKey(prev => prev + 1); // Force re-render of file input
  };

  // Always return the upload widget, showing preview if file exists
  return (
    <div>
      {/* Invisible Turnstile container */}
      <div ref={containerRef} style={{ display: 'none' }} />
      {value && (
        <div className="file-preview" style={{
          padding: '10px',
          border: uploadSuccess ? '2px solid #28a745' : '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: uploadSuccess ? '#f8fff9' : '#f9f9f9',
          transition: 'all 0.3s ease',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#28a745',
              fontWeight: '500'
            }}>
              <div style={{
                fontSize: '18px',
                backgroundColor: '#28a745',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>✓</div>
              File uploaded: {value.split('/').pop()}
            </div>
            <button
              type="button"
              onClick={handleRemove}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <div>
        <input
          key={`file-input-${key}`} // Force re-render when key changes
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          accept=".pdf,.docx,.jpg,.jpeg,.png"
          style={{
            border: error ? '1px solid #dc3545' : '1px solid #ddd',
            padding: '8px',
            borderRadius: '4px',
            width: '100%'
          }}
        />
        {uploading && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <progress
                value={progress}
                max="100"
                style={{ flex: 1 }}
              />
              <span>{Math.round(progress)}%</span>
            </div>
            <small style={{ color: '#666' }}>Uploading file...</small>
          </div>
        )}
        {error && (
          <div style={{
            color: '#dc3545',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {error}
          </div>
        )}
        {!uploading && !error && (
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginTop: '4px'
          }}>
            {value ? 'Upload a new file to replace the current one' : 'Accepted formats: PDF, DOCX, JPG, PNG (Max: 10MB)'}
          </div>
        )}
      </div>
    </div>
  );
};
