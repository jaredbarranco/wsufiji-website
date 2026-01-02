import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from './Layout';

const ApplicationSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div style={{
            fontSize: '72px',
            color: '#C5B358',
            marginBottom: '20px'
          }}>
            ✓
          </div>
          
          <h1 className="hero-title">
            Application Submitted Successfully!
          </h1>
          
           <p style={{
             fontSize: '1.3rem',
             marginBottom: '2rem',
             color: '#333',
             lineHeight: '1.6'
           }}>
             Thank you for submitting your scholarship application. We have received your submission and will review it carefully.
             You will receive a confirmation email shortly with further details.
           </p>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #C5B358',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '2rem',
            maxWidth: '500px',
            margin: '0 auto 2rem'
          }}>
            <h3 style={{
              color: '#4a05a8',
              marginBottom: '10px',
              fontSize: '1.1rem',
              fontFamily: 'Playfair Display, Merriweather, serif'
            }}>
              What happens next?
            </h3>
            <ul style={{
              textAlign: 'left',
              color: '#666',
              lineHeight: '1.8'
            }}>
              <li>Your application will be reviewed by our scholarship committee</li>
              <li>You will receive email updates on your application status</li>
              <li>Final decisions will be announced within 4-6 weeks</li>
              <li>If selected, you will be contacted via email with next steps</li>
            </ul>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => navigate('/apply')}
              className="hero-btn primary"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                textDecoration: 'none'
              }}
            >
              Apply for Another Scholarship
            </button>
            
            <Link
              to="/"
              className="hero-btn secondary"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                textDecoration: 'none'
              }}
            >
              Return to Home
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ApplicationSuccessPage;