// Simplified interactions for better consistency
document.addEventListener('DOMContentLoaded', function() {
  // Initialize smooth scrolling
  initSmoothScrolling();

  // Initialize section visibility detection
  initSectionVisibility();

  // Initialize page preloader
  initPreloader();

  // Initialize theme color consistency
  ensureColorConsistency();
});

// Smooth scrolling for anchor links
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      if (this.getAttribute('href') !== '#') {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 100,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

// Section visibility detection for subtle animations
function initSectionVisibility() {
  // Detect when sections are visible
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-in-view');
      }
    });
  }, { threshold: 0.2 });
  
  // Observe all sections
  document.querySelectorAll('section').forEach(section => {
    sectionObserver.observe(section);
  });
}

// Page preloader
function initPreloader() {
  const preloader = document.querySelector('.preloader');
  const progressFill = document.querySelector('.progress-fill');
  
  if (preloader && progressFill) {
    let loadingProgress = 0;
    const interval = setInterval(() => {
      loadingProgress += 10;
      
      if (loadingProgress > 100) {
        loadingProgress = 100;
        clearInterval(interval);
        
        // Hide preloader
        setTimeout(() => {
          preloader.classList.add('loaded');
          document.body.classList.add('page-loaded');
        }, 300);
      }
      
      progressFill.style.width = `${loadingProgress}%`;
    }, 100);
  } else {
    document.body.classList.add('page-loaded');
  }
}

// Ensure color consistency across light/dark themes
function ensureColorConsistency() {
  // Define theme variables if not already present
  const root = document.documentElement;
  
  // Create dark mode variables if they don't exist
  if (!getComputedStyle(root).getPropertyValue('--dark-background')) {
    root.style.setProperty('--dark-background', '#1f2937');
    root.style.setProperty('--dark-primary', '#f5f5f5');
    root.style.setProperty('--dark-accent', '#facc15');
    root.style.setProperty('--dark-text', '#e5e5e5');
    root.style.setProperty('--dark-card-bg', '#374151');
    root.style.setProperty('--dark-btn-text', '#1f2937');
  }
  
  // Listen for theme changes
  const themeSwitch = document.querySelector('.theme-switch');
  if (themeSwitch) {
    themeSwitch.addEventListener('click', function() {
      // Apply specific fixes for dark mode
      setTimeout(fixDarkModeVisibility, 100);
    });
  }
  
  // Check system preference for dark mode
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // Apply dark mode fixes
    setTimeout(fixDarkModeVisibility, 100);
  }
}

// Fix visibility issues in dark mode
function fixDarkModeVisibility() {
  const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
  
  if (isDarkMode) {
    // Fix contrast issues in dark mode
    document.querySelectorAll('.service-icon, .step-number').forEach(element => {
      element.style.color = '#1f2937';
    });
    
    // Fix button visibility
    document.querySelectorAll('.btn, .cta-btn').forEach(button => {
      button.style.color = '#1f2937';
    });
  } else {
    // Reset styles in light mode
    document.querySelectorAll('.service-icon, .step-number').forEach(element => {
      element.style.color = '';
    });
    
    document.querySelectorAll('.btn, .cta-btn').forEach(button => {
      button.style.color = '';
    });
  }
}