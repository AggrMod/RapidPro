// Premium Testimonial Carousel
document.addEventListener('DOMContentLoaded', function() {
  const testimonialsSection = document.querySelector('.testimonials');
  if (!testimonialsSection) return;
  
  const testimonialSlider = testimonialsSection.querySelector('.testimonials-slider');
  const testimonials = testimonialsSection.querySelectorAll('.testimonial');
  const prevButton = testimonialsSection.querySelector('.testimonial-prev');
  const nextButton = testimonialsSection.querySelector('.testimonial-next');
  const paginationContainer = testimonialsSection.querySelector('.testimonial-pagination');
  
  if (!testimonialSlider || testimonials.length === 0) return;
  
  let currentIndex = 0;
  let autoplayInterval;
  const autoplayDelay = 5000; // 5 seconds
  
  // Create pagination dots
  if (paginationContainer) {
    testimonials.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.classList.add('pagination-dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      paginationContainer.appendChild(dot);
    });
  }
  
  // Initialize slider position
  updateSliderPosition();
  
  // Add event listeners to navigation buttons
  if (prevButton) {
    prevButton.addEventListener('click', previous);
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', next);
  }
  
  // Add touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  
  testimonialSlider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    clearAutoplay();
  }, {passive: true});
  
  testimonialSlider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    startAutoplay();
  }, {passive: true});
  
  // Mouse drag support
  let isDragging = false;
  let dragStartX = 0;
  let dragEndX = 0;
  
  testimonialSlider.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    testimonialSlider.style.cursor = 'grabbing';
    clearAutoplay();
  });
  
  testimonialSlider.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartX;
    const currentTranslate = -100 * currentIndex;
    
    testimonialSlider.style.transform = `translateX(${currentTranslate + (deltaX / testimonialSlider.offsetWidth) * 100}%)`;
  });
  
  testimonialSlider.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    
    dragEndX = e.clientX;
    testimonialSlider.style.cursor = 'grab';
    
    if (dragStartX - dragEndX > 50) {
      next();
    } else if (dragStartX - dragEndX < -50) {
      previous();
    } else {
      updateSliderPosition();
    }
    
    isDragging = false;
    startAutoplay();
  });
  
  testimonialSlider.addEventListener('mouseleave', () => {
    if (isDragging) {
      updateSliderPosition();
      isDragging = false;
      testimonialSlider.style.cursor = 'grab';
      startAutoplay();
    }
  });
  
  // Start autoplay
  startAutoplay();
  
  // Functions
  function updateSliderPosition() {
    testimonialSlider.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Update pagination dots
    const dots = paginationContainer?.querySelectorAll('.pagination-dot');
    if (dots) {
      dots.forEach((dot, index) => {
        if (index === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
    
    // Update active state for testimonials
    testimonials.forEach((testimonial, index) => {
      if (index === currentIndex) {
        testimonial.classList.add('active');
      } else {
        testimonial.classList.remove('active');
      }
    });
  }
  
  function goToSlide(index) {
    clearAutoplay();
    
    if (index < 0) {
      currentIndex = testimonials.length - 1;
    } else if (index >= testimonials.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }
    
    updateSliderPosition();
    startAutoplay();
  }
  
  function previous() {
    goToSlide(currentIndex - 1);
  }
  
  function next() {
    goToSlide(currentIndex + 1);
  }
  
  function handleSwipe() {
    if (touchStartX - touchEndX > 50) {
      next();
    } else if (touchStartX - touchEndX < -50) {
      previous();
    } else {
      updateSliderPosition();
    }
  }
  
  function startAutoplay() {
    clearAutoplay();
    autoplayInterval = setInterval(() => {
      next();
    }, autoplayDelay);
  }
  
  function clearAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
    }
  }
  
  // Pause autoplay when the user hovers over the slider
  testimonialSlider.addEventListener('mouseenter', clearAutoplay);
  testimonialSlider.addEventListener('mouseleave', startAutoplay);
  
  // Observer for pausing when not in viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startAutoplay();
      } else {
        clearAutoplay();
      }
    });
  }, { threshold: 0.5 });
  
  observer.observe(testimonialsSection);
});