import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
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
              <Link to="/" className="nav-link active">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/apply" className="nav-link">Apply</Link>
            </li>
          </ul>
        </div>
      </nav>

      <main className="home-main">
        <div className="home-container">
          <div className="home-header">
            <h1>Welcome to WSU Fiji homepage.</h1>
            <p className="home-intro">
              Discover scholarship opportunities and start your application journey with WSU Fiji.
            </p>
          </div>

          <div className="home-actions">
            <Link to="/apply" className="primary-btn">
              View Available Scholarships
            </Link>
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

export default HomePage;