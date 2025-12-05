document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('applicationForm');
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Disable submit button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        messageDiv.textContent = '';
        messageDiv.className = 'message';

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.textContent = result.message || 'Application submitted successfully!';
                messageDiv.className = 'message success';
                form.reset();
            } else {
                messageDiv.textContent = result.error || 'Submission failed. Please try again.';
                messageDiv.className = 'message error';
            }
        } catch (error) {
            console.error('Submission error:', error);
            messageDiv.textContent = 'Network error. Please check your connection and try again.';
            messageDiv.className = 'message error';
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Application';
        }
    });
});