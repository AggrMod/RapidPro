// Mobile Navigation Handler
document.addEventListener('DOMContentLoaded', function() {
    // Create mobile menu toggle button
    const header = document.querySelector('.header');
    const container = document.querySelector('.header .container');
    const mainNav = document.querySelector('.main-nav');
    
    // Create mobile menu toggle
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-menu-toggle';
    mobileToggle.innerHTML = '☰';
    mobileToggle.setAttribute('aria-label', 'Toggle mobile menu');
    
    // Insert mobile toggle before the nav element (so it appears on the right)
    if (container && mainNav) {
        container.insertBefore(mobileToggle, mainNav);
    }
    
    // Toggle mobile menu
    mobileToggle.addEventListener('click', function() {
        mainNav.classList.toggle('mobile-open');
        mobileToggle.innerHTML = mainNav.classList.contains('mobile-open') ? '✕' : '☰';
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!header.contains(e.target) && mainNav.classList.contains('mobile-open')) {
            mainNav.classList.remove('mobile-open');
            mobileToggle.innerHTML = '☰';
        }
    });
    
    // Close mobile menu when clicking on a link
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                mainNav.classList.remove('mobile-open');
                mobileToggle.innerHTML = '☰';
            }
        });
    });
});
