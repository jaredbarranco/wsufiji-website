import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/" className="nav-logo-link">
            <h1>WSU Fiji</h1>
          </Link>
        </div>
        
        {/* Desktop Menu */}
        <ul className="nav-menu desktop-menu">
          <li className="nav-item">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>About</Link>
          </li>
          <li className="nav-item">
            <Link to="/apply" className={`nav-link ${isActive('/apply') ? 'active' : ''}`}>Scholarships</Link>
          </li>
          <li className="nav-item">
            <a href="#recruitment-form" className="nav-link">Recruitment</a>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <ul className={`nav-menu mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <li className="nav-item">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            to="/about" 
            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            to="/apply" 
            className={`nav-link ${isActive('/apply') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Scholarships
          </Link>
        </li>
        <li className="nav-item">
          <a 
            href="#recruitment-form" 
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Recruitment
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;