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

       {/* Contact Section */}
       <section className="recruitment-form-section">
         <div className="container">
           <div className="form-container">
             <h2 className="section-title">Stay Connected</h2>
             <p className="form-description">
               Join our alumni network to stay connected with fellow brothers, mentor current members,
               and continue your involvement with Phi Gamma Delta.
             </p>
             <div className="form-actions">
               <a
                 href="https://forms.gle/HHar217UiQdw6Mnc6"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="cta-button"
               >
                 Update Your Contact Information
               </a>
             </div>
           </div>
         </div>
       </section>

      {/* Mission Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2 className="section-title">Frank Norris Pig Dinner</h2>
              <p className="about-description">
                Phi Gamma Delta’s Norris Pig Dinners are the most widely observed and longest continually running, chapter-based, annual graduate event in the Greek world. The first Pig Dinner was held at the University of California Berkeley in 1893. In 1902, the Pig Dinner was dedicated in memory of Frank Norris (California Berkeley 1894), whose sense of humor created the event that has become an annual ceremony throughout Phi Gamma Delta.
                <br /><br />
                Pi Mu's Pig Dinner is typically hosted in Pullman, WA on the first away game or bye week in the Football Season.                  Be sure to submit your contact information to stay up-to-date on this year's Pig Dinner plans!

              </p>
            </div>
            <div className="about-image">
               <img src="/pig-dinner.png"
                 alt="Frank Norris Pig Dinner"
                 className="about-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Fiji Archives Section */}
      <section className="archives-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2 className="section-title">Fiji Archives</h2>
              <p className="about-description">
                Help preserve our chapter's rich history by contributing to the Fiji Archives. Graduate brothers are encouraged to share their stories, photos, and memories to ensure our legacy continues for future generations. Visit the archives to explore historical items and learn about our chapter's past.
              </p>
              <div className="form-actions">
                <a
                  href="https://phigamarchives.historyit.com/items/view/history/696"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-button"
                >
                  View Archives
                </a>
                <a
                  href="https://phigamarchives.historyit.com/public-sites/about/history"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-button"
                >
                  Contribute to Archives
                </a>
              </div>
            </div>
            <div className="about-image">
              <img src="/fiji-archives-example.png"
                alt="Fiji Archives Example"
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


    </Layout>
  );
};

export default AlumniPage;
