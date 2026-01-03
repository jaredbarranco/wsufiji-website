import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>WSU Fiji</h3>
            <p>Phi Gamma Delta - Washington State University</p>
            <p>Building Courageous Leaders Since 1950</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/apply">Scholarships</Link></li>
              <li><a href="#recruitment-form">Recruitment</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <p><a href="mailto:recruitment@wsufiji.com" className="contact-link">recruitment@wsufiji.com</a></p>
            <p>Pullman, WA 99164</p>
            <div className="footer-social">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="https://www.instagram.com/wsufiji" target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 WSU Fiji. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
