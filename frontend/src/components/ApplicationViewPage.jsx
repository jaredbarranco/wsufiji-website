import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import validator from '@rjsf/validator-ajv8';
import Form from '@rjsf/core';
import Layout from './Layout';

const ApplicationViewPage = () => {
  const { applicationName, applicationUuid } = useParams();
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchApplication() {
      try {
        const API_BASE = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_BASE}/apply/${applicationName}/${applicationUuid}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch application');
        }
        
        const data = await response.json();
        setApplicationData(data);
      } catch (err) {
        console.error('Error fetching application:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchApplication();
  }, [applicationName, applicationUuid]);

if (loading) {
    return (
      <Layout>
        {/* Hero Section */}
        <section className="hero-section hero-section-compact">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-title">Loading Application...</h1>
             <p style={{ fontSize: '1.3rem', marginBottom: '2rem', color: '#333' }}>
               Please wait while we fetch application details.
             </p>
          </div>
        </section>
      </Layout>
    );
  }

  if (error || !applicationData) {
    return (
      <Layout>
        {/* Hero Section */}
        <section className="hero-section hero-section-compact">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-title">Application Not Found</h1>
             <p style={{ fontSize: '1.3rem', marginBottom: '2rem', color: '#333' }}>
               {error || 'The requested application could not be found.'}
             </p>
            <Link 
              to="/apply" 
              className="hero-btn primary"
              style={{ display: 'inline-block', padding: '1rem 2rem', textDecoration: 'none' }}
            >
              Back to Scholarships
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  const { scholarship, application } = applicationData;

  return (
    <Layout>
      {/* Application Section */}
      <section className="features-section">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 className="section-title">{scholarship.title}</h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#666',
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}>
                Application submitted by {application.email} on {new Date(application.created_at).toLocaleDateString()}
              </p>
              <div style={{
                display: 'flex',
                gap: '2rem',
                justifyContent: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap'
              }}>
                <span className="hero-btn secondary" style={{ display: 'inline-block', padding: '0.5rem 1rem' }}>
                  Application ID: {application.id}
                </span>
                <span className="hero-btn secondary" style={{ display: 'inline-block', padding: '0.5rem 1rem' }}>
                  Submitted: {new Date(application.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="feature-card" style={{ marginBottom: '2rem' }}>
              <h3 className="feature-title">About This Scholarship</h3>
              <p className="feature-description">{scholarship.description}</p>
            </div>

            <div className="feature-card">
              <h3 className="feature-title">Application Details</h3>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
                <Form
                  schema={scholarship.form_schema}
                  uiSchema={scholarship.ui_schema}
                  formData={application.submission_data}
                  validator={validator}
                  disabled={true}
                  liveValidate={false}
                />
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link 
                to="/apply" 
                className="hero-btn primary"
                style={{ display: 'inline-block', padding: '1rem 2rem', textDecoration: 'none' }}
              >
                Back to Scholarships
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ApplicationViewPage;