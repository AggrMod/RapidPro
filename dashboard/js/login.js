/**
 * Login functionality for the Rapid Pro Maintenance dashboard
 * Accepts any valid email format with any password
 */

document.addEventListener('DOMContentLoaded', function() {
    // Simple password toggle functionality
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Update icon based on state
            const eyeIcon = this.querySelector('svg');
            if (type === 'text') {
                eyeIcon.innerHTML = `
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                `;
            } else {
                eyeIcon.innerHTML = `
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                `;
            }
        });
    }

    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            
            // Validate email format
            if (!isValidEmail(emailInput.value)) {
                showError(emailInput, 'Please enter a valid email address');
                return;
            } else {
                clearError(emailInput);
            }
            
            // Any password is valid, but it should not be empty
            if (!passwordInput.value.trim()) {
                showError(passwordInput, 'Password cannot be empty');
                return;
            } else {
                clearError(passwordInput);
            }
            
            // Show loading state
            const button = this.querySelector('button[type="submit"]');
            button.textContent = 'Signing In...';
            button.disabled = true;
            
            // Store login info if "remember me" is checked
            if (document.getElementById('remember').checked) {
                localStorage.setItem('rpm_remember_email', emailInput.value);
                // Don't store the actual password, just a flag that user wants to be remembered
                localStorage.setItem('rpm_remember_me', 'true');
            } else {
                localStorage.removeItem('rpm_remember_email');
                localStorage.removeItem('rpm_remember_me');
            }
            
            // Any credentials will work - just simulate a brief loading state
            setTimeout(() => {
                // Set a session cookie to indicate user is logged in
                document.cookie = 'rpm_logged_in=true; path=/; max-age=86400'; // 24 hours
                
                // Store user details in sessionStorage
                sessionStorage.setItem('rpm_user', JSON.stringify({
                    email: emailInput.value,
                    name: 'Technician User',
                    role: 'technician'
                }));
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            }, 800);
        });
    }
    
    // Forgot password link
    const forgotPassword = document.querySelector('.forgot-password');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            
            const emailInput = document.getElementById('email');
            if (!isValidEmail(emailInput.value)) {
                showError(emailInput, 'Please enter your email address first');
                return;
            }
            
            alert('For demo purposes: Password reset functionality would send an email to ' + emailInput.value);
        });
    }
    
    // Fill in remembered email if available
    if (localStorage.getItem('rpm_remember_me') === 'true') {
        const emailInput = document.getElementById('email');
        const rememberCheckbox = document.getElementById('remember');
        
        if (emailInput && rememberCheckbox) {
            emailInput.value = localStorage.getItem('rpm_remember_email') || '';
            rememberCheckbox.checked = true;
        }
    }
    
    // Quick access button functionality
    const quickAccessButton = document.querySelector('.btn-quick.tech');
    if (quickAccessButton) {
        quickAccessButton.addEventListener('click', function() {
            // Set demo user in session
            sessionStorage.setItem('rpm_user', JSON.stringify({
                email: 'tech@example.com',
                name: 'Demo Technician',
                role: 'technician'
            }));
            
            // Set logged in cookie
            document.cookie = 'rpm_logged_in=true; path=/; max-age=86400'; // 24 hours
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        });
    }
    
    // Helper function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Helper function to show error message
    function showError(inputElement, message) {
        clearError(inputElement);
        
        const formGroup = inputElement.closest('.form-group');
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = message;
        
        formGroup.classList.add('error');
        formGroup.appendChild(errorMessage);
        
        // Add error styling to input
        inputElement.style.borderColor = '#ef4444';
    }
    
    // Helper function to clear error message
    function clearError(inputElement) {
        const formGroup = inputElement.closest('.form-group');
        const existingError = formGroup.querySelector('.error-message');
        
        if (existingError) {
            formGroup.removeChild(existingError);
        }
        
        formGroup.classList.remove('error');
        inputElement.style.borderColor = '';
    }
    
    // Add error message styling
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        .form-group.error input {
            border-color: #ef4444;
        }
    `;
    document.head.appendChild(style);
});