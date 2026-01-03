import React from 'react';
import Layout from './Layout';

const AboutPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section" style={{ height: '60vh', minHeight: '400px' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">About Phi Gamma Delta</h1>
          <p className="hero-subtitle">The Fiji Chapter at Washington State University</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2 className="section-title">Our Mission</h2>
              <p className="about-description">
                Phi Gamma Delta unites men in enduring friendships, stimulates the pursuit of knowledge,
                and builds courageous leaders who serve the world with the best that is in them.
                Join us in our mission to develop leadership, scholarship, and service.
              </p>
            </div>
            <div className="about-image">
              <img src="/group_training.jpg"
                alt="Phi Gamma Delta Brotherhood"
                className="about-img" />
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title text-center">Our History</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="feature-title">Founded in 1950</h3>
              <p className="feature-description">
                Phi Gamma Delta was established in 1848 and has since grown to become one of the largest
                international fraternities in the world.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="feature-title">Founded in 1950</h3>
              <p className="feature-description">
                The Fiji Chapter at Washington State University was established in 1950 and has been a cornerstone of campus life,
                fostering leadership and brotherhood for generations.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.01 2.01 0 0 0 18.06 7H15V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v3H1v5h2v13h18v-7h2v-2h-2zm-7-2h2v2h-2v-2z" />
                </svg>
              </div>
              <h3 className="feature-title">Community Impact</h3>
              <p className="feature-description">
                Our members actively contribute to the community through service projects,
                philanthropy, and leadership initiatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="stats-section">
        <div className="stats-overlay"></div>
        <div className="container">
          <h2 className="section-title text-center" style={{ color: 'white' }}>Our Core Values</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">Friendship</div>
              <div className="stat-label">Building lifelong bonds</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">Knowledge</div>
              <div className="stat-label">Pursuing academic excellence</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">Service</div>
              <div className="stat-label">Making a positive impact</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">Morality</div>
              <div className="stat-label">Upholding high ethical standards</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="recruitment-form-section">
        <div className="container">
          <div className="form-container">
            <h2 className="section-title">Get Involved</h2>
            <p className="form-description">
              Ready to learn more about Phi Gamma Delta? Contact us to get involved with our chapter.
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <h3>Email</h3>
                <p>fiji@wsu.edu</p>
              </div>
              <div className="contact-item">
                <h3>Address</h3>
                <p>Washington State University<br />
                  Pullman, WA 99164</p>
              </div>
              <div className="contact-item">
                <h3>Follow Us</h3>
                <p>Social media links coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
