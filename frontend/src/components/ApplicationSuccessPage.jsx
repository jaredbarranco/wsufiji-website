import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ApplicationSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <Link to="/" className="nav-logo-link">
              <h1>WSU Fiji</h1>
            </Link>
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
          <div className="success-message" style={{
            textAlign: 'center',
            padding: '60px 20px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{
              fontSize: '72px',
              color: '#28a745',
              marginBottom: '20px'
            }}>
              ✓
            </div>
            
            <h1 style={{
              fontSize: '2.5rem',
              color: '#333',
              marginBottom: '20px',
              fontWeight: '600'
            }}>
              Application Submitted Successfully!
            </h1>
            
            <p style={{
              fontSize: '1.2rem',
              color: '#666',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              Thank you for submitting your scholarship application. We have received your submission and will review it carefully. 
              You will receive a confirmation email shortly with further details.
            </p>
            
            <div style={{
              backgroundColor: '#f8fff9',
              border: '1px solid #28a745',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '40px'
            }}>
              <h3 style={{
                color: '#28a745',
                marginBottom: '10px',
                fontSize: '1.1rem'
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
                className="submit-btn"
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
              >
                Apply for Another Scholarship
              </button>
              
              <Link
                to="/"
                className="submit-btn"
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
              >
                Return to Home
              </Link>
            </div>
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

export default ApplicationSuccessPage;