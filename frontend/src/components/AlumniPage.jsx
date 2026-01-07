import React from 'react';
import Layout from './Layout';

const AlumniPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Graduate Brothers</h1>
          <p className="hero-subtitle">Not for College Days Alone</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2 className="section-title">Alumni Network</h2>
              <p className="about-description">
                Our alumni network spans generations and professions, united by the bonds forged during
                our time at Phi Gamma Delta. We remain committed to supporting each other, mentoring
                current members, and contributing to the continued success of our chapter.
              </p>
            </div>
            <div className="about-image">
              <img src="https://images.unsplash.com/photo-1537511446984-935f663eb1f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Alumni Network"
                className="about-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title text-center">Alumni Achievements</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="feature-title">Professional Excellence</h3>
              <p className="feature-description">
                Our alumni excel in diverse fields including business, medicine, law, engineering,
                and public service, demonstrating the leadership skills developed through Phi Gamma Delta.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="feature-title">Community Leadership</h3>
              <p className="feature-description">
                Fiji alumni continue to serve their communities through volunteer work, mentorship programs,
                and philanthropic initiatives, embodying our commitment to service.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.01 2.01 0 0 0 18.06 7H15V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v3H1v5h2v13h18v-7h2v-2h-2zm-7-2h2v2h-2v-2z" />
                </svg>
              </div>
              <h3 className="feature-title">Generational Impact</h3>
              <p className="feature-description">
                Through mentoring and networking events, our alumni ensure that the values and traditions
                of Phi Gamma Delta continue to thrive for future generations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="stats-section">
        <div className="stats-overlay"></div>
        <div className="container">
          <h2 className="section-title text-center" style={{ color: 'white' }}>Alumni Values</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">Mentorship</div>
              <div className="stat-label">Guiding the next generation</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">Connection</div>
              <div className="stat-label">Maintaining lifelong bonds</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">Service</div>
              <div className="stat-label">Continuing our commitment</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">Excellence</div>
              <div className="stat-label">Striving for greatness</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="recruitment-form-section">
        <div className="container">
          <div className="form-container">
            <h2 className="section-title">Stay Connected</h2>
            <p className="form-description">
              Join our alumni network to stay connected with fellow brothers, mentor current members,
              and continue your involvement with Phi Gamma Delta.
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <h3>Email</h3>
                <p>alumni@fiji.wsu.edu</p>
              </div>
              <div className="contact-item">
                <h3>Alumni Events</h3>
                <p>Regular networking events and reunions throughout the year</p>
              </div>
              <div className="contact-item">
                <h3>Mentorship Program</h3>
                <p>Connect with current members for career guidance and support</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AlumniPage;
