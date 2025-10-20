// Premium 3D Card Effects
document.addEventListener('DOMContentLoaded', function() {
  // Apply 3D effects to service cards
  const serviceCards = document.querySelectorAll('.service-list li');
  const processCards = document.querySelectorAll('.process-step');
  const termsCards = document.querySelectorAll('.terms-card');
  
  // Function to apply 3D effect
  function apply3DEffect(cards, intensity = 1) {
    cards.forEach(card => {
      card.classList.add('card-3d');
      
      // Create inner wrapper for 3D transform
      const cardContent = card.innerHTML;
      card.innerHTML = `<div class="card-3d-inner">${cardContent}</div>`;
      const inner = card.querySelector('.card-3d-inner');
      
      // Add shine effect
      const shine = document.createElement('div');
      shine.className = 'card-shine';
      card.appendChild(shine);
      
      // Track mouse movement for 3D effect
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate rotation based on mouse position
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / (rect.height / 2) * 10 * intensity;
        const rotateY = (centerX - x) / (rect.width / 2) * 10 * intensity;
        
        // Update transform
        inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        // Update shine position
        const shineX = (x / rect.width) * 100;
        const shineY = (y / rect.height) * 100;
        shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)`;
      });
      
      // Reset on mouse leave
      card.addEventListener('mouseleave', () => {
        inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
        shine.style.background = 'none';
      });
      
      // Smoother transition on mouseenter
      card.addEventListener('mouseenter', () => {
        inner.style.transition = 'transform 0.2s ease-out';
        setTimeout(() => {
          inner.style.transition = 'transform 0.05s ease-out';
        }, 200);
      });
    });
  }
  
  // Apply 3D effects with different intensities
  apply3DEffect(serviceCards, 0.7);
  apply3DEffect(processCards, 0.5);
  apply3DEffect(termsCards, 0.6);
  
  // Apply tilt effect to testimonials
  const testimonials = document.querySelectorAll('.testimonial-content');
  testimonials.forEach(testimonial => {
    // Create a subtle 3D tilt effect
    new Tilt(testimonial);
  });
  
  // Simple vanilla JS tilt implementation
  function Tilt(element, settings = {}) {
    const defaults = {
      max: 5,
      perspective: 1000,
      scale: 1.03,
      speed: 500,
      easing: 'cubic-bezier(.03,.98,.52,.99)'
    };
    
    const options = {...defaults, ...settings};
    
    element.style.transform = 'perspective(' + options.perspective + 'px)';
    element.style.transition = 'transform ' + options.speed + 'ms ' + options.easing;
    
    element.addEventListener('mouseenter', () => {
      element.style.willChange = 'transform';
    });
    
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;
      
      const tiltX = percentY * options.max * -1; // Inverted for natural feel
      const tiltY = percentX * options.max;
      
      element.style.transform = `perspective(${options.perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${options.scale})`;
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.transform = 'perspective(' + options.perspective + 'px) rotateX(0deg) rotateY(0deg) scale(1)';
      element.style.willChange = 'auto';
    });
  }
});