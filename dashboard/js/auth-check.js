// Simple authentication check for RapidPro
(function() {
    // Check if we're on the login page
    const isLoginPage = window.location.pathname.includes('index.html') || 
                       window.location.pathname.endsWith('/') || 
                       window.location.pathname.endsWith('/dashboard/');
    
    // If not on login page and no auth token, redirect to login
    if (!isLoginPage) {
        const auth = JSON.parse(localStorage.getItem('rapidpro_auth') || '{}');
        if (!auth.token) {
            window.location.href = 'index.html';
        }
    }
})();