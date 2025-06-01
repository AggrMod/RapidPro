/**
 * Global Includes for Dashboard
 * Dynamically includes common scripts and styles across dashboard pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add modal system to all dashboard pages
    if (!document.querySelector('script[src*="modal-system.js"]')) {
        const modalScript = document.createElement('script');
        modalScript.src = 'js/modal-system.js';
        document.body.appendChild(modalScript);
    }
    
    // Add metrics modal system to all dashboard pages
    if (!document.querySelector('script[src*="dashboard-metrics-modal.js"]')) {
        const metricsModalScript = document.createElement('script');
        metricsModalScript.src = 'js/dashboard-metrics-modal.js';
        document.body.appendChild(metricsModalScript);
    }
    
    // Ensure responsive CSS is included on all pages
    if (!document.querySelector('link[href*="responsive.css"]')) {
        const responsiveCSS = document.createElement('link');
        responsiveCSS.rel = 'stylesheet';
        responsiveCSS.href = 'css/responsive.css';
        document.head.appendChild(responsiveCSS);
    }
    
    // Wait for elements to be fully loaded, then make all metric cards modal-compatible
    setTimeout(() => {
        makeAllCardsClickable();
    }, 500);
    
    console.log('Global includes initialized');
});

/**
 * Make all dashboard cards clickable and show modals
 */
function makeAllCardsClickable() {
    // Target all card-like elements that should be clickable
    const cardSelectors = [
        '.summary-card:not(.clickable)',
        '.metric-card:not(.clickable)',
        '.dashboard-card:not(.clickable)',
        '.stats-card:not(.clickable)',
        '.chart-card:not(.clickable)'
    ];
    
    // Find all elements matching the selectors
    const cards = document.querySelectorAll(cardSelectors.join(', '));
    
    cards.forEach(card => {
        // Skip if already processed
        if (card.hasAttribute('data-modal-ready')) return;
        
        // Add clickable class and mark as processed
        card.classList.add('clickable');
        card.setAttribute('data-modal-ready', 'true');
        
        // Add pointer cursor style
        card.style.cursor = 'pointer';
        
        // Add hover effect if not already present
        if (!card.hasAttribute('data-hover-effect')) {
            card.setAttribute('data-hover-effect', 'true');
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px)';
                this.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
                this.style.boxShadow = '';
            });
        }
    });
}