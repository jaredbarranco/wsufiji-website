import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ApplyPage from './components/ApplyPage';
import ScholarshipFormPage from './components/ScholarshipFormPage';
import ApplicationSuccessPage from './components/ApplicationSuccessPage';
import ApplicationViewPage from './components/ApplicationViewPage';
import './style.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/apply/:scholarshipSlug" element={<ScholarshipFormPage />} />
        <Route path="/apply/:applicationName/:applicationUuid" element={<ApplicationViewPage />} />
        <Route path="/success" element={<ApplicationSuccessPage />} />
      </Routes>
    </div>
  );
}

export default App;