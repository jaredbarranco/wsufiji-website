import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import Turnstile from 'react-turnstile';
import { CustomFileWidget } from './CustomFileWidget';



// Custom Array Field Template with better buttons
const CustomArrayFieldTemplate = (props) => {
  const { items, canAdd, onAddClick } = props;
  
  return (
    <div className="custom-array-field">
      {items.map((element, index) => (
        <div key={element.key} className="custom-array-item">
          <div className="custom-array-item-content">
            {element.children}
          </div>
          {element.hasRemove && (
            <div className="custom-array-item-actions">
              <button
                type="button"
                className="custom-remove-btn"
                onClick={element.onDropIndexClick(index)}
              >
                🗑️ Remove Position {index + 1}
              </button>
            </div>
          )}
        </div>
      ))}
      
      {canAdd && (
        <div className="custom-array-add">
          <button
            type="button"
            className="custom-add-btn"
            onClick={onAddClick}
          >
            ➕ Add Leadership Position
          </button>
        </div>
      )}
    </div>
  );
};

const ScholarshipFormPage = () => {
  const { scholarshipSlug } = useParams();
  const navigate = useNavigate();
  const [schema, setSchema] = useState(null);
  const [uiSchema, setUiSchema] = useState(null);
  const [formData, setFormData] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formKey, setFormKey] = useState(0); // Key to force re-render of form

  // Create a unique key for LocalStorage so different scholarships don't overwrite each other
  const STORAGE_KEY = `draft_${scholarshipSlug}`;
  const TURNSTILE_SITE_KEY = '0x4AAAAAACGrI9rCasWZr4zl'; // Replace with actual site key

  // Fetch the Form Definition (Schema) from Cloudflare Worker
  useEffect(() => {
    async function loadForm() {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
        const res = await fetch(`${API_BASE}/schema/${scholarshipSlug}`);

        if (!res.ok) {
          throw new Error('Scholarship not found');
        }

        const data = await res.json();
        setSchema(data.form_schema);
        setUiSchema(data.ui_schema);

        // Load Draft from Local Storage (Client-side persistence)
        const savedDraft = localStorage.getItem(STORAGE_KEY);
        if (savedDraft) {
          setFormData(JSON.parse(savedDraft));
        }
      } catch (error) {
        console.error('Error loading form:', error);
        setError(error.message);
        
        // Fallback schema for testing
        setSchema({
          title: `${scholarshipSlug} Scholarship Application`,
          type: "object",
          required: ["fullName", "email", "essay"],
          properties: {
            fullName: { "type": "string", "title": "Full Name" },
            email: { "type": "string", "format": "email", "title": "Email Address" },
            phone: { "type": "string", "title": "Phone Number" },
            essay: {
              "type": "string",
              "title": "Why do you deserve this scholarship?",
              "minLength": 100
            }
          }
        });
        setUiSchema({
          "essay": { "ui:widget": "textarea", "ui:options": { "rows": 10 } }
        });
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [scholarshipSlug]);

  // Save to Local Storage on every keystroke
  const handleChange = ({ formData }) => {
    setFormData(formData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  };

  // Submit Handler
  const handleSubmit = async ({ formData }) => {
    if (!turnstileToken) {
      alert("Please complete the security verification.");
      return;
    }

    setIsSubmitting(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
      const response = await fetch(`${API_BASE}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: scholarshipSlug,
          submission: formData,
          token: turnstileToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      const result = await response.json();

      // Success! Clear the draft and redirect.
      localStorage.removeItem(STORAGE_KEY);
      setFormData({}); // Reset form
      setFormKey(prev => prev + 1); // Force re-render to clear file inputs
      navigate('/success');

    } catch (err) {
      console.error('Submission error:', err);
      alert("Error submitting application: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-logo">
              <h1>WSU Fiji</h1>
            </div>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/apply" className="nav-link">Apply</Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="application-main">
          <div className="application-container">
            <div className="loading">
              <h2>Loading Application...</h2>
              <p>Please wait while we prepare your scholarship application.</p>
            </div>
          </div>
        </main>

        <footer className="footer">
          <div className="footer-content">
            <p>&copy; 2024 WSU Fiji. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="container">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h1>WSU Fiji</h1>
          </div>
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/apply" className="nav-link">Apply</Link>
            </li>
            <li className="nav-item">
              <Link to={`/apply/${scholarshipSlug}`} className="nav-link active">Application</Link>
            </li>
          </ul>
        </div>
      </nav>

      <main className="application-main">
        <div className="application-container">
          <div className="application-header">
            <h1>{schema.title || 'Scholarship Application'}</h1>
            <p className="application-intro">
              Complete the form below to apply for this scholarship. Your progress is automatically saved locally.
            </p>
            {error && (
              <div className="error-message">
                <p>Note: Using demo form. Could not load scholarship details: {error}</p>
              </div>
            )}
          </div>

            <Form
            key={`form-${formKey}`} // Force re-render when key changes
            schema={schema}
            uiSchema={uiSchema}
            formData={formData}
            validator={validator}
            onChange={handleChange}
            onSubmit={handleSubmit}
            liveValidate={false}
            showErrorList={false}
            className="application-form"
            templates={{
              ArrayFieldTemplate: CustomArrayFieldTemplate
            }}
            widgets={{
              file: CustomFileWidget
            }}
          >
            <div className="security-section" style={{ 
              margin: '30px 0',
              padding: '20px',
              border: '1px solid #ddd', 
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
              textAlign: 'center'
            }}>
              <h3 style={{ marginBottom: '15px' }}>
                Security Verification
              </h3>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                Please complete the security check below before submitting your application.
              </p>
              <div className="turnstile-container">
                <Turnstile
                  sitekey={TURNSTILE_SITE_KEY}
                  onVerify={(token) => {
                    console.log('Turnstile verification success, token length:', token ? token.length : 'none');
                    setTurnstileToken(token);
                  }}
                />
              </div>
            </div>
            
            <div className="submit-section">
              <button
                type="submit"
                disabled={isSubmitting || !turnstileToken}
                className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                style={{ 
                  opacity: (!turnstileToken || isSubmitting) ? 0.6 : 1,
                  cursor: (!turnstileToken || isSubmitting) ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
              {!turnstileToken && (
                <p style={{ 
                  marginTop: '10px', 
                  fontSize: '14px', 
                  color: '#666',
                  textAlign: 'center'
                }}>
                  Please complete the security verification above before submitting.
                </p>
              )}
            </div>
          </Form>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 WSU Fiji. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ScholarshipFormPage;