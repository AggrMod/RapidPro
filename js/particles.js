// Premium Particle Background Effect
document.addEventListener('DOMContentLoaded', function() {
  // Check if the hero section exists
  const hero = document.querySelector('.hero');
  if (!hero) return;
  
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.className = 'particle-canvas';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '1';
  canvas.style.pointerEvents = 'none'; // Make it non-interactive
  
  // Insert canvas as the first child of hero
  hero.insertBefore(canvas, hero.firstChild);
  
  // Get canvas context
  const ctx = canvas.getContext('2d');
  
  // Set canvas size to match hero dimensions
  function resizeCanvas() {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  
  // Initial sizing
  resizeCanvas();
  
  // Resize on window resize
  window.addEventListener('resize', debounce(resizeCanvas, 200));
  
  // Create particles
  const particleCount = 50;
  const particles = [];
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      speedX: Math.random() * 0.5 - 0.25,
      speedY: Math.random() * 0.5 - 0.25,
      opacity: Math.random() * 0.5 + 0.1
    });
  }
  
  // Animation loop
  function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Check if hero is visible (for performance)
    if (isElementInViewport(hero)) {
      // Update and draw particles
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        
        // Move particle
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Reset if out of bounds
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(250, 204, 21, ${p.opacity})`;
        ctx.fill();
      }
      
      // Draw connections between particles
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) { // Only draw connections for nearby particles
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    }
    
    // Continue animation loop
    requestAnimationFrame(animate);
  }
  
  // Start animation
  animate();
  
  // Helper functions
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom >= 0
    );
  }
  
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }
});