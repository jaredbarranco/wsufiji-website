import React from 'react';
import TopBar from './TopBar';
import Navigation from './Navigation';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="landing-page">
      <TopBar />
      <Navigation />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;