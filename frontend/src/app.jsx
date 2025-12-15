import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import Turnstile from 'react-turnstile';

const ApplyPage = () => {
    const [schema, setSchema] = useState(null);
    const [uiSchema, setUiSchema] = useState(null);
    const [formData, setFormData] = useState(null);
    const [turnstileToken, setTurnstileToken] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [scholarshipSlug] = useState(() => {
        // Get slug from URL path or use default
        const path = window.location.pathname;
        const match = path.match(/\/apply\/(.+)/);
        return match ? match[1] : 'default-scholarship';
    });

    // Create a unique key for LocalStorage so different grants don't overwrite each other
    const STORAGE_KEY = `draft_${scholarshipSlug}`;
    const TURNSTILE_SITE_KEY = '0x4AAAAAACGrI9rCasWZr4zl'; // Replace with actual site key

    // 1. Fetch the Form Definition (Schema) from Cloudflare Worker
    useEffect(() => {
        async function loadForm() {
            try {
                // Fetch from your Cloudflare Worker: /api/schema/:slug
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
                const res = await fetch(`${API_BASE}/schema/${scholarshipSlug}`);

                if (!res.ok) {
                    throw new Error('Scholarship not found');
                }

                const data = await res.json();
                setSchema(data.form_schema);
                setUiSchema(data.ui_schema);

                // 2. Load Draft from Local Storage (Client-side persistence)
                const savedDraft = localStorage.getItem(STORAGE_KEY);
                if (savedDraft) {
                    setFormData(JSON.parse(savedDraft));
                }
            } catch (error) {
                console.error('Error loading form:', error);
                // Fallback schema for testing
                setSchema({
                    title: "Default Scholarship Application",
                    type: "object",
                    required: ["fullName", "email", "essay"],
                    properties: {
                        fullName: { "type": "string", "title": "Full Name" },
                        email: { "type": "string", "format": "email", "title": "Email Address" },
                        phone: { "type": "string", "title": "Phone Number" },
                        essay: {
                            "type": "string",
                            "title": "Why do you deserve this scholarship?",
                            "minLength": 100
                        }
                    }
                });
                setUiSchema({
                    "essay": { "ui:widget": "textarea", "ui:options": { "rows": 10 } }
                });
            }
        }

        loadForm();
    }, [scholarshipSlug]);

    // 3. Save to Local Storage on every keystroke
    const handleChange = ({ formData }) => {
        setFormData(formData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    };

    // 4. Submit Handler
    const handleSubmit = async ({ formData }) => {
        if (!turnstileToken) {
            alert("Please complete the anti-spam check.");
            return;
        }

        setIsSubmitting(true);

        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
            const response = await fetch(`${API_BASE}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: scholarshipSlug,
                    submission: formData,
                    token: turnstileToken // Send Captcha to backend
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Submission failed');
            }

            const result = await response.json();

            // Success! Clear the draft.
            localStorage.removeItem(STORAGE_KEY);
            alert("Application Submitted Successfully!");
            setFormData({}); // Reset form

        } catch (err) {
            console.error('Submission error:', err);
            alert("Error submitting application: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!schema) {
        return (
            <div className="container">
                <div className="loading">
                    <h2>Loading Application...</h2>
                    <p>Please wait while we prepare your scholarship application.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <nav className="navbar">
                <div className="nav-container">
                    <div className="nav-logo">
                        <h1>WSU Fiji</h1>
                    </div>
                    <ul className="nav-menu">
                        <li className="nav-item">
                            <a href="/" className="nav-link">Home</a>
                        </li>
                        <li className="nav-item">
                            <a href={`/apply/${scholarshipSlug}`} className="nav-link active">Apply</a>
                        </li>
                    </ul>
                </div>
            </nav>

            <main className="application-main">
                <div className="application-container">
                    <div className="application-header">
                        <h1>{schema.title || 'Scholarship Application'}</h1>
                        <p className="application-intro">
                            Complete the form below to apply for this scholarship. Your progress is automatically saved locally.
                        </p>
                    </div>

                    <Form
                        schema={schema}
                        uiSchema={uiSchema}
                        formData={formData}
                        validator={validator}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        className="application-form"
                    >
                        {/* Custom Submit Button & Turnstile Area */}
                        <div className="security-section">
                            <div className="turnstile-container">
                                <Turnstile
                                    sitekey={TURNSTILE_SITE_KEY}
                                    onVerify={(token) => setTurnstileToken(token)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || !turnstileToken}
                                className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                            >
                                {isSubmitting ? "Submitting..." : "Submit Application"}
                            </button>
                        </div>
                    </Form>
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

// Initialize React app
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<ApplyPage />);
