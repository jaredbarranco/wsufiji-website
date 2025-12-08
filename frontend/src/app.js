document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Leadership roles management
    let leadershipRoleCount = 0;
    const addLeadershipBtn = document.getElementById('add-leadership-role');
    const leadershipContainer = document.getElementById('leadership-roles-container');

    addLeadershipBtn.addEventListener('click', function() {
        leadershipRoleCount++;
        const newRole = createLeadershipRole(leadershipRoleCount);
        leadershipContainer.appendChild(newRole);
    });

    function createLeadershipRole(roleId) {
        const roleDiv = document.createElement('div');
        roleDiv.className = 'leadership-role';
        roleDiv.dataset.roleId = roleId;
        
        roleDiv.innerHTML = `
            <div class="role-header">
                <h4>Leadership Role #${roleId}</h4>
                <button type="button" class="remove-role" onclick="removeLeadershipRole(${roleId})">Remove</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="organization_${roleId}">Organization Name</label>
                    <input type="text" id="organization_${roleId}" name="organization_${roleId}">
                </div>
                <div class="form-group">
                    <label for="role_title_${roleId}">Role/Position</label>
                    <input type="text" id="role_title_${roleId}" name="role_title_${roleId}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="start_date_${roleId}">Start Date</label>
                    <input type="date" id="start_date_${roleId}" name="start_date_${roleId}">
                </div>
                <div class="form-group">
                    <label for="end_date_${roleId}">End Date</label>
                    <input type="date" id="end_date_${roleId}" name="end_date_${roleId}">
                </div>
            </div>
            <div class="form-group">
                <label for="responsibilities_${roleId}">Responsibilities & Achievements</label>
                <textarea id="responsibilities_${roleId}" name="responsibilities_${roleId}" rows="3" placeholder="Describe your key responsibilities and achievements in this role..."></textarea>
            </div>
        `;
        
        return roleDiv;
    }

    window.removeLeadershipRole = function(roleId) {
        const roleElement = document.querySelector(`[data-role-id="${roleId}"]`);
        if (roleElement) {
            roleElement.remove();
            
            // Check if there are no more leadership roles
            const remainingRoles = document.querySelectorAll('.leadership-role');
            if (remainingRoles.length === 0) {
                leadershipRoleCount = 0;
            }
        }
    };

    // File upload handling
    const transcriptInput = document.getElementById('transcript');
    const transcriptPreview = document.getElementById('transcript-preview');

    transcriptInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                showError(this, 'File size must be less than 5MB');
                this.value = '';
                transcriptPreview.style.display = 'none';
                return;
            }

            // Check file type
            if (file.type !== 'application/pdf') {
                showError(this, 'Please upload a PDF file');
                this.value = '';
                transcriptPreview.style.display = 'none';
                return;
            }

            // Show file preview
            transcriptPreview.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
            transcriptPreview.style.display = 'block';
            clearError(this);
        } else {
            transcriptPreview.style.display = 'none';
        }
    });

    // Essay word count
    const essayTextarea = document.getElementById('essay');
    const wordCountSpan = document.getElementById('word-count');

    essayTextarea.addEventListener('input', function() {
        const wordCount = this.value.trim().split(/\s+/).filter(word => word.length > 0).length;
        wordCountSpan.textContent = wordCount;
        
        const wordCountContainer = document.querySelector('.word-count');
        wordCountContainer.classList.remove('warning', 'error');
        
        if (wordCount < 500) {
            wordCountContainer.classList.add('warning');
        } else if (wordCount > 1000) {
            wordCountContainer.classList.add('error');
        }
    });

    // Form handling
    const form = document.getElementById('applicationForm');
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm()) {
                return;
            }
            
            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            messageDiv.textContent = '';
            messageDiv.className = 'message';

            try {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                // Add leadership roles data
                const leadershipRoles = [];
                document.querySelectorAll('.leadership-role').forEach(role => {
                    const roleId = role.dataset.roleId;
                    const organization = document.getElementById(`organization_${roleId}`).value;
                    const roleTitle = document.getElementById(`role_title_${roleId}`).value;
                    
                    if (organization || roleTitle) {
                        leadershipRoles.push({
                            organization_name: organization,
                            role_title: roleTitle,
                            start_date: document.getElementById(`start_date_${roleId}`).value,
                            end_date: document.getElementById(`end_date_${roleId}`).value,
                            responsibilities: document.getElementById(`responsibilities_${roleId}`).value
                        });
                    }
                });
                
                data.leadership_roles = leadershipRoles;

                // For now, just simulate submission since we don't have the backend API yet
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Simulate successful submission
                messageDiv.textContent = 'Application submitted successfully! We will review your application and contact you soon.';
                messageDiv.className = 'message success';
                form.reset();
                
                // Reset leadership roles to empty
                leadershipContainer.innerHTML = '';
                leadershipRoleCount = 0;
                
                // Reset file preview and word count
                transcriptPreview.style.display = 'none';
                wordCountSpan.textContent = '0';
                document.querySelector('.word-count').classList.remove('warning', 'error');
                
                // Scroll to message
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

            } catch (error) {
                console.error('Submission error:', error);
                messageDiv.textContent = 'Submission failed. Please try again.';
                messageDiv.className = 'message error';
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Application';
            }
        });
    }

    function validateForm() {
        let isValid = true;
        
        // Validate required fields
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (field.type === 'file') {
                if (!field.files || field.files.length === 0) {
                    showError(field, 'Please upload your transcript');
                    isValid = false;
                } else {
                    clearError(field);
                }
            } else if (!field.value.trim()) {
                showError(field, 'This field is required');
                isValid = false;
            } else {
                clearError(field);
            }
        });

        // Email validation
        const emailField = document.getElementById('email');
        if (emailField.value && !isValidEmail(emailField.value)) {
            showError(emailField, 'Please enter a valid email address');
            isValid = false;
        }

        // GPA validation
        const gpaField = document.getElementById('anticipated_gpa');
        if (gpaField.value && (parseFloat(gpaField.value) < 0 || parseFloat(gpaField.value) > 4)) {
            showError(gpaField, 'GPA must be between 0 and 4');
            isValid = false;
        }

        // Essay word count validation
        const essayWordCount = essayTextarea.value.trim().split(/\s+/).filter(word => word.length > 0).length;
        if (essayWordCount < 500) {
            showError(essayTextarea, 'Essay must be at least 500 words');
            isValid = false;
        } else if (essayWordCount > 1000) {
            showError(essayTextarea, 'Essay must not exceed 1000 words');
            isValid = false;
        }

        // Leadership roles are optional - no validation needed

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showError(field, message) {
        clearError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
        field.classList.add('error');
    }

    function clearError(field) {
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        field.classList.remove('error');
    }

    // Real-time validation
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            if (this.type === 'file') {
                if (!this.files || this.files.length === 0) {
                    showError(this, 'Please upload your transcript');
                } else {
                    clearError(this);
                }
            } else if (!this.value.trim()) {
                showError(this, 'This field is required');
            } else {
                clearError(this);
            }
        });

        field.addEventListener('input', function() {
            if (this.value.trim()) {
                clearError(this);
            }
        });
    });

    // Email field validation
    const emailField = document.getElementById('email');
    if (emailField) {
        emailField.addEventListener('blur', function() {
            if (this.value && !isValidEmail(this.value)) {
                showError(this, 'Please enter a valid email address');
            }
        });
    }

    // GPA field validation
    const gpaField = document.getElementById('anticipated_gpa');
    if (gpaField) {
        gpaField.addEventListener('blur', function() {
            if (this.value && (parseFloat(this.value) < 0 || parseFloat(this.value) > 4)) {
                showError(this, 'GPA must be between 0 and 4');
            }
        });
    }
});