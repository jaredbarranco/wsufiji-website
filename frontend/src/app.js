// Simple vanilla JavaScript version for testing
class ScholarshipApplication {
    constructor() {
        this.scholarshipSlug = this.getSlugFromUrl();
        this.storageKey = `draft_${this.scholarshipSlug}`;
        this.schema = null;
        this.uiSchema = null;
        this.formData = null;
        this.isSubmitting = false;
        
        this.init();
    }

    getSlugFromUrl() {
        const path = window.location.pathname;
        const match = path.match(/\/apply\/(.+)/);
        return match ? match[1] : 'test-scholarship-simple';
    }

    async init() {
        console.log('Initializing application for:', this.scholarshipSlug);
        await this.loadForm();
        this.setupEventListeners();
    }

    async loadForm() {
        try {
            // Try to load from the worker
            const response = await fetch(`http://localhost:8787/schema/${this.scholarshipSlug}`);
            
            if (!response.ok) {
                throw new Error('Scholarship not found');
            }
            
            const data = await response.json();
            this.schema = data.form_schema;
            this.uiSchema = data.ui_schema;
            
        } catch (error) {
            console.error('Error loading form:', error);
            // Use fallback schema
            this.schema = this.getFallbackSchema();
            this.uiSchema = this.getFallbackUiSchema();
        }

        // Load saved data from localStorage
        const savedDraft = localStorage.getItem(this.storageKey);
        if (savedDraft) {
            try {
                this.formData = JSON.parse(savedDraft);
            } catch (e) {
                console.error('Error parsing saved data:', e);
                this.formData = {};
            }
        } else {
            this.formData = {};
        }

        this.renderForm();
    }

    getFallbackSchema() {
        return {
            title: "Test Scholarship Application",
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
        };
    }

    getFallbackUiSchema() {
        return {
            "essay": { "ui:widget": "textarea", "ui:options": { "rows": 10 } }
        };
    }

    renderForm() {
        const titleElement = document.getElementById('scholarship-title');
        const formContainer = document.getElementById('form-container');
        
        titleElement.textContent = this.schema.title || 'Scholarship Application';
        
        const formHtml = this.generateFormHtml();
        formContainer.innerHTML = formHtml;
        
        // Load form data
        this.loadFormData();
        
        // Set up form event listeners
        this.setupFormListeners();
    }

    generateFormHtml() {
        let html = `<form id="application-form" class="application-form">`;
        
        if (this.schema.properties) {
            for (const [key, field] of Object.entries(this.schema.properties)) {
                const isRequired = this.schema.required?.includes(key) || false;
                html += this.generateFieldHtml(key, field, isRequired);
            }
        }
        
        html += `
            <div class="security-section">
                <div class="turnstile-container">
                    <p><em>Note: Turnstile verification will be added in production</em></p>
                </div>
                <button type="submit" id="submit-btn" class="submit-btn">
                    Submit Application
                </button>
            </div>
        </form>`;
        
        return html;
    }

    generateFieldHtml(key, field, isRequired) {
        const label = field.title || key;
        const required = isRequired ? ' required' : '';
        const requiredSpan = isRequired ? ' <span class="required">*</span>' : '';
        
        let fieldHtml = `
            <div class="form-group">
                <label for="${key}">${label}${requiredSpan}</label>
        `;
        
        if (field.enum) {
            // Select dropdown
            fieldHtml += `<select id="${key}" name="${key}"${required}>`;
            fieldHtml += `<option value="">Select...</option>`;
            field.enum.forEach(option => {
                fieldHtml += `<option value="${option}">${option}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (field.type === 'string' && (field.minLength > 100 || this.uiSchema?.[key]?.['ui:widget'] === 'textarea')) {
            // Textarea for long text
            const rows = this.uiSchema?.[key]?.['ui:options']?.rows || 6;
            fieldHtml += `<textarea id="${key}" name="${key}" rows="${rows}"${required}></textarea>`;
        } else {
            // Regular input
            const inputType = field.format === 'email' ? 'email' : 
                            field.type === 'number' ? 'number' : 'text';
            const min = field.minimum !== undefined ? ` min="${field.minimum}"` : '';
            const max = field.maximum !== undefined ? ` max="${field.maximum}"` : '';
            const step = field.multipleOf !== undefined ? ` step="${field.multipleOf}"` : '';
            const pattern = field.pattern ? ` pattern="${field.pattern}"` : '';
            const placeholder = this.uiSchema?.[key]?.['ui:placeholder'] || '';
            
            fieldHtml += `<input type="${inputType}" id="${key}" name="${key}"${min}${max}${step}${pattern}${placeholder} placeholder="${placeholder}"${required}>`;
        }
        
        if (field.description) {
            fieldHtml += `<small class="field-description">${field.description}</small>`;
        }
        
        if (this.uiSchema?.[key]?.['ui:help']) {
            fieldHtml += `<small class="field-help">${this.uiSchema[key]['ui:help']}</small>`;
        }
        
        fieldHtml += `</div>`;
        return fieldHtml;
    }

    loadFormData() {
        if (!this.formData) return;
        
        for (const [key, value] of Object.entries(this.formData)) {
            const field = document.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = value;
            }
        }
    }

    setupFormListeners() {
        const form = document.getElementById('application-form');
        if (!form) return;
        
        // Auto-save to localStorage
        form.addEventListener('input', (e) => {
            this.saveFormData();
        });
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(e);
        });
    }

    saveFormData() {
        const form = document.getElementById('application-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        this.formData = data;
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    async handleSubmit(e) {
        if (this.isSubmitting) return;
        
        if (!this.validateForm()) {
            return;
        }
        
        this.isSubmitting = true;
        const submitBtn = document.getElementById('submit-btn');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            
            // For testing, simulate submission
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Clear saved data
            localStorage.removeItem(this.storageKey);
            
            alert('Application submitted successfully!');
            this.formData = {};
            document.getElementById('application-form').reset();
            
        } catch (error) {
            console.error('Submission error:', error);
            alert('Error submitting application. Please try again.');
        } finally {
            this.isSubmitting = false;
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    validateForm() {
        const form = document.getElementById('application-form');
        const formData = new FormData(form);
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        
        // Check required fields
        if (this.schema.required) {
            for (const field of this.schema.required) {
                const value = formData.get(field);
                if (!value || value.trim() === '') {
                    this.showFieldError(field, 'This field is required');
                    isValid = false;
                }
            }
        }
        
        // Validate email format
        const email = formData.get('email');
        if (email && !this.isValidEmail(email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Check minimum lengths
        if (this.schema.properties) {
            for (const [key, field] of Object.entries(this.schema.properties)) {
                const value = formData.get(key);
                if (value && field.minLength && value.length < field.minLength) {
                    this.showFieldError(key, `Must be at least ${field.minLength} characters`);
                    isValid = false;
                }
            }
        }
        
        return isValid;
    }

    showFieldError(fieldName, message) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (!field) return;
        
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    setupEventListeners() {
        // Additional event listeners if needed
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScholarshipApplication();
});