import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import validator from '@rjsf/validator-ajv8';
import Form from '@rjsf/core';

const ApplicationViewPage = () => {
  const { applicationName, applicationUuid } = useParams();
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchApplication() {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';
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

        <main className="apply-main">
          <div className="apply-container">
            <div className="loading">
              <h2>Loading Application...</h2>
              <p>Please wait while we fetch the application details.</p>
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

  if (error || !applicationData) {
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

        <main className="apply-main">
          <div className="apply-container">
            <div className="error-message">
              <h2>Application Not Found</h2>
              <p>{error || 'The requested application could not be found.'}</p>
              <Link to="/apply" className="scholarship-btn">Back to Scholarships</Link>
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

  const { scholarship, application } = applicationData;

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

      <main className="apply-main">
        <div className="apply-container">
          <div className="apply-header">
            <h1>{scholarship.title}</h1>
            <p className="apply-intro">
              Application submitted by {application.email} on {new Date(application.created_at).toLocaleDateString()}
            </p>
            <div className="application-info">
              <span className="application-id">Application ID: {application.id}</span>
              <span className="submission-date">Submitted: {new Date(application.created_at).toLocaleString()}</span>
            </div>
          </div>

          <div className="scholarship-description">
            <h3>About This Scholarship</h3>
            <p>{scholarship.description}</p>
          </div>

          <div className="application-form">
            <h3>Application Details</h3>
            <div className="readonly-form">
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

          <div className="application-actions">
            <Link to="/apply" className="scholarship-btn">
              Back to Scholarships
            </Link>
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
};

export default ApplicationViewPage;