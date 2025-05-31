// Theme switcher functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeSwitch = document.querySelector('.theme-switch');
    const body = document.body;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    
    if (themeSwitch) {
        // Update icon based on theme
        const updateIcon = () => {
            const icon = themeSwitch.querySelector('.theme-icon');
            if (icon) {
                icon.textContent = body.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
            }
        };
        
        updateIcon();
        
        themeSwitch.addEventListener('click', function() {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateIcon();
        });
    }
});
