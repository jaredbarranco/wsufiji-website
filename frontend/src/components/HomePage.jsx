import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from './Layout';

const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <Layout>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">The Pi Mu Chapter of Phi Gamma Delta</h1>
          <div className="hero-buttons">
            <a href="#recruitment-form" className="hero-btn primary">Rush/Recruitment</a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2 className="section-title">Welcome to our Brotherhood</h2>
              <p className="about-description">
                Phi Gamma Delta unites men in enduring friendships, stimulates the pursuit of knowledge,
                and builds courageous leaders who serve the world with the best that is in them.
                Join us in our mission to develop leadership, scholarship, and service.
              </p>
            </div>
            <div className="about-image">
              <img src="/group_training.jpg"
                alt="Fiji Brotherhood"
                className="about-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="feature-title">Friendship</h3>
              <p className="feature-description">
                Building lifelong bonds through shared experiences and mutual support.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                </svg>
              </div>
              <h3 className="feature-title">Knowledge</h3>
              <p className="feature-description">
                Pursuing academic excellence and intellectual growth together.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="feature-title">Service</h3>
              <p className="feature-description">
                Making a positive impact through community service and leadership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-overlay"></div>
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">1950</div>
              <div className="stat-label">WSU Chapter Founded</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">45</div>
              <div className="stat-label">Active Members</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">$100,000</div>
              <div className="stat-label">Scholarships Awarded</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recruitment Form Section */}
      <section id="recruitment-form" className="recruitment-form-section">
        <div className="container">
          <div className="form-container">
            <h2 className="section-title">Join Our Brotherhood</h2>
            <p className="form-description">
              Interested in becoming part of Phi Gamma Delta? Fill out our recruitment form to learn more about joining our chapter and the recruitment process.
            </p>
            <div className="form-actions">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfdX-C-LilXXUbD-dMQnICU8yc1KqRK_wAVxzmWhOqqRuxR1g/viewform?usp=publish-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button"
              >
                Recruitment Form
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
