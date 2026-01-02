import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';

const ApplyPage = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchScholarships() {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';
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
            description: 'Awarded to students with outstanding academic achievement'
          },
          {
            id: 2,
            slug: 'leadership-award',
            title: 'Leadership Award',
            description: 'Recognizing students who demonstrate exceptional leadership qualities'
          },
          {
            id: 3,
            slug: 'community-service',
            title: 'Community Service Scholarship',
            description: 'For students committed to making a difference in their communities'
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
      <Layout>
        {/* Hero Section */}
        <section className="hero-section hero-section-compact">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-title">Loading Available Scholarships...</h1>
             <p style={{ fontSize: '1.3rem', marginBottom: '2rem', color: '#333' }}>
               Please wait while we fetch the latest scholarship opportunities.
             </p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section" style={{ minHeight: '60vh' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Scholarship Opportunities</h1>
           <p style={{ fontSize: '1.3rem', marginBottom: '2rem', color: '#333' }}>
             Select a scholarship below to start your application. Each scholarship has specific requirements and deadlines.
           </p>
        </div>
      </section>

      {/* Scholarships Section */}
      <section className="features-section">
        <div className="container">
          {error && (
            <div className="error-message" style={{ marginBottom: '2rem' }}>
              <p>Unable to load latest scholarships. Showing available opportunities:</p>
            </div>
          )}

          <div className="features-grid">
            {scholarships.map((scholarship) => (
              <div key={scholarship.id} className="feature-card" style={{ textAlign: 'center' }}>
                <div className="feature-icon" style={{ marginBottom: '1.5rem' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="feature-title">{scholarship.title}</h3>
                <p className="feature-description" style={{ marginBottom: '1.5rem' }}>
                  {scholarship.description}
                </p>
                <div className="scholarship-action">
                  <Link 
                    to={`/apply/${scholarship.slug}`} 
                    className="hero-btn primary"
                    style={{ display: 'inline-block', padding: '0.75rem 1.5rem', textDecoration: 'none' }}
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {scholarships.length === 0 && (
            <div className="no-scholarships" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#4a05a8' }}>No Scholarships Available</h3>
              <p>There are currently no scholarship opportunities available. Please check back later.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ApplyPage;