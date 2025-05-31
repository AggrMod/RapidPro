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
    
    // Lazy load images when they're about to enter the viewport
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }
                    
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '50px' });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        const loadImages = () => {
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
                img.classList.add('loaded');
            });
        };
        
        // Load all images after a delay
        setTimeout(loadImages, 1000);
    }
    
    // Add idle callback for non-critical operations
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            // Prefetch links for fast navigation
            const links = document.querySelectorAll('a[href^="http"]');
            links.forEach(link => {
                if (navigator.connection && (navigator.connection.saveData || navigator.connection.effectiveType.includes('2g'))) {
                    return; // Skip prefetching on slow connections or when data saver is enabled
                }
                
                const url = link.href;
                const prefetch = document.createElement('link');
                prefetch.rel = 'prefetch';
                prefetch.href = url;
                document.head.appendChild(prefetch);
            });
            
            // Track engagement metrics
            setTimeout(() => {
                console.log('Performance monitoring active');
                trackPageSpeed();
            }, 3000);
        });
    }
    
    // Remove focus outlines for mouse users, but keep them for keyboard users
    document.body.addEventListener('mousedown', () => {
        document.body.classList.add('using-mouse');
    });
    
    document.body.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
            document.body.classList.remove('using-mouse');
        }
    });
    
    // Advanced script loading
    function loadDeferredScripts() {
        const deferredScripts = document.querySelectorAll('script[data-defer]');
        deferredScripts.forEach(script => {
            const newScript = document.createElement('script');
            
            if (script.src) {
                newScript.src = script.src;
            } else {
                newScript.textContent = script.textContent;
            }
            
            script.getAttributeNames().forEach(attr => {
                if (attr !== 'data-defer') {
                    newScript.setAttribute(attr, script.getAttribute(attr));
                }
            });
            
            document.body.appendChild(newScript);
            script.remove();
        });
    }
    
    // Load deferred scripts when the page is idle
    if ('requestIdleCallback' in window) {
        requestIdleCallback(loadDeferredScripts);
    } else {
        setTimeout(loadDeferredScripts, 3000);
    }
    
    // Basic performance monitoring
    function trackPageSpeed() {
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
            
            console.log(`Page loaded in: ${pageLoadTime}ms`);
            
            // You could send this to an analytics service
            if (pageLoadTime > 3000) {
                console.log('Page load time exceeds threshold - consider optimizations');
            }
        }
    }
});
