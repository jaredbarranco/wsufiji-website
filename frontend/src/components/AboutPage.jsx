import React from 'react';
import Layout from './Layout';

const AboutPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section">
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
              <h3 className="feature-title">Established in 1848</h3>
              <p className="feature-description">
                Phi Gamma Delta was founded May 1, 1848, at Jefferson College in Canonsburg, Pennsylvania by the “Immortal Six“: John Templeton McCarty, Samuel Beatty Wilson, James Elliott Jr., Ellis Bailey Gregg, Daniel Webster Crofts and Naaman Fletcher.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="feature-title">Chartered in 1950</h3>
              <p className="feature-description">
                The Fiji Chapter at Washington State University was established in 1950 and has been a cornerstone of campus life,
                fostering leadership and brotherhood for generations.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  width="56"
                  height="56"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M13,1c1.7,0,3,1.3,3,3s-1.3,3-3,3s-3-1.3-3-3S11.3,1,13,1 M20,14c0-2.4-1.8-4.4-4.5-5.4C15,9.4,14.1,10,13,10
      c-1.2,0-2.3-0.8-2.8-1.8c-0.2,0-0.5,0.1-0.7,0.1L7,7v2.3c-1.5,0.9-2.6,2.2-2.9,3.7H2v4h3.1c0.5,0.6,1.2,1.2,1.9,1.7V22h2v-2.4
      c0.9,0.3,1.9,0.4,3,0.4s2.1-0.2,3-0.4V22h2v-3.3c1.1-0.7,2-1.6,2.5-2.7H22v-2H20 M7,13c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1
      S7.6,13,7,13z"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Commitment to Scholarship</h3>
              <p className="feature-description">
                The Pi Mu advisory board has awarded over $100,000 to undergraduate members who acheived academic excellence while living in the chapter house.
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
            <div className="stat-item">
              <div className="stat-number">Excellence</div>
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
                 <p>contact@wsufiji.com</p>
               </div>
              <div className="contact-item">
                <h3>Address</h3>
                <p>Washington State University<br />
                  Pullman, WA 99164</p>
              </div>
               <div className="contact-item">
                 <h3>Follow Us</h3>
                 <a href="https://www.instagram.com/wsufiji" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', color: 'white', textDecoration: 'none' }}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                     <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
                   </svg>
                   @wsufiji
                 </a>
               </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
