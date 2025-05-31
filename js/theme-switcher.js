// Enhanced Theme Switcher with better dark mode compatibility
document.addEventListener('DOMContentLoaded', function() {
  // Theme variables
  const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
  };
  
  // DOM elements
  const themeSwitcher = document.querySelector('.theme-switch');
  const themeIcon = document.querySelector('.theme-icon');
  
  if (!themeSwitcher) return;
  
  // Check for saved theme preference or use prefers-color-scheme
  const savedTheme = localStorage.getItem('rpm-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set initial theme
  let currentTheme = savedTheme || (prefersDark ? THEMES.DARK : THEMES.LIGHT);
  setTheme(currentTheme);
  
  // Listen for theme switch clicks
  themeSwitcher.addEventListener('click', toggleTheme);
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('rpm-theme')) {
      setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
    }
  });
  
  // Functions
  function toggleTheme() {
    const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    setTheme(newTheme);
    
    // Save preference
    localStorage.setItem('rpm-theme', newTheme);
    
    // Animate the switch
    themeSwitcher.classList.add('switched');
    setTimeout(() => {
      themeSwitcher.classList.remove('switched');
    }, 300);
  }
  
  function setTheme(theme) {
    currentTheme = theme;
    
    // Set attribute on body element for CSS selectors
    document.body.setAttribute('data-theme', theme);
    
    // Also set on HTML element for compatibility
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update switch appearance
    if (theme === THEMES.DARK) {
      themeSwitcher.classList.add('dark');
      themeIcon.textContent = '☀️';
      themeSwitcher.setAttribute('title', 'Switch to Light Mode');
      
      // Apply dark mode specific CSS variables
      updateDarkModeColors();
    } else {
      themeSwitcher.classList.remove('dark');
      themeIcon.textContent = '🌙';
      themeSwitcher.setAttribute('title', 'Switch to Dark Mode');
      
      // Reset to default colors
      resetColors();
    }
    
    // Trigger CSS transitions
    document.body.classList.add('theme-transition');
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 1000);
  }
  
  // Define and apply dark mode specific color variables
  function updateDarkModeColors() {
    const root = document.documentElement;
    
    // Set dark mode color variables
    root.style.setProperty('--background', '#1f2937');
    root.style.setProperty('--primary', '#f5f5f5');
    root.style.setProperty('--white', '#2d3748');
    root.style.setProperty('--light-gray', '#4a5568');
    
    // Fix text colors for dark backgrounds
    document.querySelectorAll('p, h2, h3, li:not(.nav-cta)').forEach(element => {
      if (!element.classList.contains('btn') && 
          !element.classList.contains('cta-btn')) {
        element.style.color = '#e5e5e5';
      }
    });
    
    // Make sure buttons remain visible with proper contrast
    document.querySelectorAll('.btn, .cta-btn').forEach(button => {
      button.style.color = '#1f2937';
    });
    
    // Adjust service cards background in dark mode
    document.querySelectorAll('.service-list li, .process-step, .testimonial').forEach(card => {
      card.style.backgroundColor = '#374151';
      card.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.5)';
    });
  }
  
  // Reset to light mode colors
  function resetColors() {
    const root = document.documentElement;
    
    // Reset to default color scheme
    root.style.removeProperty('--background');
    root.style.removeProperty('--primary');
    root.style.removeProperty('--white');
    root.style.removeProperty('--light-gray');
    
    // Reset text colors
    document.querySelectorAll('p, h2, h3, li').forEach(element => {
      element.style.removeProperty('color');
    });
    
    // Reset button colors
    document.querySelectorAll('.btn, .cta-btn').forEach(button => {
      button.style.removeProperty('color');
    });
    
    // Reset card backgrounds
    document.querySelectorAll('.service-list li, .process-step, .testimonial').forEach(card => {
      card.style.removeProperty('background-color');
      card.style.removeProperty('box-shadow');
    });
  }
});