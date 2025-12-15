import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ApplyPage = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchScholarships() {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
        const response = await fetch(`${API_BASE}/scholarships`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch scholarships');
        }
        
        const data = await response.json();
        setScholarships(data);
      } catch (err) {
        console.error('Error fetching scholarships:', err);
        setError(err.message);
        
        // Fallback scholarships for testing
        setScholarships([
          {
            id: 1,
            slug: 'academic-excellence',
            title: 'Academic Excellence Scholarship',
            description: 'Awarded to students with outstanding academic achievement',
            deadline: '2025-03-01'
          },
          {
            id: 2,
            slug: 'leadership-award',
            title: 'Leadership Award',
            description: 'Recognizing students who demonstrate exceptional leadership qualities',
            deadline: '2025-02-15'
          },
          {
            id: 3,
            slug: 'community-service',
            title: 'Community Service Scholarship',
            description: 'For students committed to making a difference in their communities',
            deadline: '2025-03-15'
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchScholarships();
  }, []);

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
                <Link to="/apply" className="nav-link active">Apply</Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="apply-main">
          <div className="apply-container">
            <div className="loading">
              <h2>Loading Available Scholarships...</h2>
              <p>Please wait while we fetch the latest scholarship opportunities.</p>
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
              <Link to="/apply" className="nav-link active">Apply</Link>
            </li>
          </ul>
        </div>
      </nav>

      <main className="apply-main">
        <div className="apply-container">
          <div className="apply-header">
            <h1>Available Scholarships</h1>
            <p className="apply-intro">
              Select a scholarship below to start your application. Each scholarship has specific requirements and deadlines.
            </p>
          </div>

          {error && (
            <div className="error-message">
              <p>Unable to load latest scholarships. Showing available opportunities:</p>
            </div>
          )}

          <div className="scholarships-grid">
            {scholarships.map((scholarship) => (
              <div key={scholarship.id} className="scholarship-card">
                <div className="scholarship-header">
                  <h3>{scholarship.title}</h3>
                  <span className="deadline">
                    Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                  </span>
                </div>
                <div className="scholarship-description">
                  <p>{scholarship.description}</p>
                </div>
                <div className="scholarship-action">
                  <Link 
                    to={`/apply/${scholarship.slug}`} 
                    className="scholarship-btn"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {scholarships.length === 0 && (
            <div className="no-scholarships">
              <h3>No Scholarships Available</h3>
              <p>There are currently no scholarship opportunities available. Please check back later.</p>
            </div>
          )}
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

export default ApplyPage;