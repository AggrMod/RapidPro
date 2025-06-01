// Rapid Pro Maintenance - Main JS file
document.addEventListener('DOMContentLoaded', function() {
  // Check if images are loaded correctly
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    // Add class when page is fully loaded
    window.addEventListener('load', function() {
      heroSection.classList.add('loaded');
      console.log('Page fully loaded with all assets');
    });

    // Try to load hero image first
    const heroImg = new Image();
    heroImg.onload = function() {
      console.log('Hero image loaded successfully');
      heroSection.classList.add('image-loaded');
      // Use the hero image
      heroSection.style.backgroundImage = 'linear-gradient(rgba(31, 41, 55, 0.7), rgba(31, 41, 55, 0.7)), url("images/hero.png")';
      // Add a class for human imagery
      heroSection.classList.add('human-focused');
    };
    heroImg.onerror = function() {
      console.log('Hero image not found, trying SVG fallback');
      // Try SVG fallback
      const svgImg = new Image();
      svgImg.onload = function() {
        console.log('SVG image loaded successfully');
        heroSection.classList.add('image-loaded');
        // Use SVG fallback explicitly
        heroSection.style.backgroundImage = 'linear-gradient(rgba(31, 41, 55, 0.7), rgba(31, 41, 55, 0.7)), url("images/kitchen-cooler.svg")';
      };
      svgImg.onerror = function() {
        console.error('Error loading all images');
        // Set a fallback gradient
        heroSection.style.background = 'linear-gradient(135deg, #1f2937, #374151)';
      };
      svgImg.src = 'images/kitchen-cooler.svg';
    };
    heroImg.src = 'images/hero.png';
  }
});