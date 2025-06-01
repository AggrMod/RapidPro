// Premium animations and interactive elements
document.addEventListener('DOMContentLoaded', function() {
  // Initialize intersection observer for scroll animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2
  };
  
  // Observer for fade-in animations
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Get all elements with animation classes
  const fadeElements = document.querySelectorAll('.fade-in, .fade-up, .fade-right, .fade-left');
  fadeElements.forEach(el => {
    fadeObserver.observe(el);
  });
  
  // Parallax effect for hero section
  let hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('scroll', function() {
      let scrollPosition = window.pageYOffset;
      hero.style.backgroundPositionY = (50 + scrollPosition * 0.05) + '%';
    });
  }
  
  // Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Interactive service cards hover effect
  const serviceItems = document.querySelectorAll('.service-list li');
  serviceItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.classList.add('active');
    });
    
    item.addEventListener('mouseleave', function() {
      this.classList.remove('active');
    });
  });
  
  // Header scroll effect
  const header = document.querySelector('.header');
  let lastScrollTop = 0;
  
  window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
      header.classList.add('scrolled');
      
      if (scrollTop > lastScrollTop) {
        header.classList.add('header-hidden');
      } else {
        header.classList.remove('header-hidden');
      }
    } else {
      header.classList.remove('scrolled');
      header.classList.remove('header-hidden');
    }
    
    lastScrollTop = scrollTop;
  });
  
  // Cursor effects for buttons
  const buttons = document.querySelectorAll('.btn, .nav-cta');
  buttons.forEach(button => {
    button.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.style.setProperty('--cursor-x', `${x}px`);
      this.style.setProperty('--cursor-y', `${y}px`);
    });
  });
  
  // Footer animation
  const footer = document.querySelector('.footer');
  const footerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        footer.classList.add('visible');
      }
    });
  }, { threshold: 0.2 });
  
  if (footer) {
    footerObserver.observe(footer);
  }
  
  // Count-up animation for statistics
  const stats = document.querySelectorAll('.stat-number');
  
  if (stats.length > 0) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const countTo = parseInt(target.dataset.count);
          let count = 0;
          const duration = 2000; // 2 seconds
          const interval = duration / countTo;
          
          const timer = setInterval(() => {
            count++;
            target.textContent = count;
            
            if (count >= countTo) {
              clearInterval(timer);
            }
          }, interval);
          
          statsObserver.unobserve(target);
        }
      });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => {
      statsObserver.observe(stat);
    });
  }
});