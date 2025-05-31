// Performance optimization and preloader handling
document.addEventListener('DOMContentLoaded', function() {
    // Hide preloader when DOM is ready
    const preloader = document.querySelector('.preloader');
    const pageContent = document.querySelector('.page-content');
    
    // Function to hide preloader
    function hidePreloader() {
        if (preloader) {
            preloader.classList.add('loaded');
        }
        if (pageContent) {
            pageContent.style.opacity = '1';
        }
    }
    
    // Hide preloader after a short delay to ensure smooth transition
    setTimeout(hidePreloader, 500);
    
    // Also hide on window load as fallback
    window.addEventListener('load', function() {
        hidePreloader();
    });
    
    // Performance optimization - lazy loading images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});
