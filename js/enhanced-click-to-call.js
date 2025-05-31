/**
 * Enhanced Click-to-Call Functionality
 * 
 * This script provides enhanced click-to-call features following best practices
 * for conversion optimization and mobile user experience.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize call tracking
  initCallTracking();
  
  // Optimize mobile experience
  optimizeMobileExperience();
  
  // Add call button animations
  initCallButtonEffects();
});

/**
 * Initialize call tracking for analytics
 */
function initCallTracking() {
  // Track all phone number clicks
  document.querySelectorAll('a[href^="tel:"]').forEach(phoneLink => {
    phoneLink.addEventListener('click', function(e) {
      // Track the event if Google Analytics is available
      if (typeof gtag !== 'undefined') {
        gtag('event', 'phone_call', {
          'event_category': 'Contact',
          'event_label': this.getAttribute('href').replace('tel:', '')
        });
      }
      
      // Log interaction for debugging
      console.log('Phone call initiated: ' + this.getAttribute('href').replace('tel:', ''));
      
      // Add "calling" class for visual feedback
      this.classList.add('calling');

      // Only show calling toast on mobile, not desktop
      if (isMobileDevice()) {
        showCallingToast();

        // Provide haptic feedback if available (for mobile)
        if (navigator.vibrate) {
          navigator.vibrate([50, 50, 50]);
        }
      }
    });
  });
}

/**
 * Show a toast notification when initiating a call
 */
function showCallingToast() {
  // Create a toast element if it doesn't exist
  let toast = document.getElementById('calling-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'calling-toast';
    toast.className = 'calling-toast';
    document.body.appendChild(toast);
    
    // Add CSS for the toast
    const style = document.createElement('style');
    style.textContent = `
      .calling-toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #2563eb;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
      }
      .calling-toast.visible {
        opacity: 1;
      }
      .calling-toast::before {
        content: "📞";
        font-size: 20px;
      }
      @media (max-width: 480px) {
        .calling-toast {
          width: 90%;
          font-size: 14px;
          padding: 10px 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Set content and show the toast
  toast.textContent = 'Calling Rapid Pro Maintenance...';
  toast.classList.add('visible');
  
  // Hide the toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 3000);
}

/**
 * Check if device is mobile
 */
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
}

/**
 * Optimize the click-to-call experience based on device type
 */
function optimizeMobileExperience() {
  const mobile = isMobileDevice();

  // Show sticky call button on mobile only
  const stickyCall = document.querySelector('.sticky-call');
  if (stickyCall) {
    if (mobile) {
      // Show with animation on mobile
      setTimeout(() => {
        stickyCall.style.display = 'flex';
        stickyCall.style.opacity = '0';
        stickyCall.style.transform = 'translateY(20px)';

        setTimeout(() => {
          stickyCall.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          stickyCall.style.opacity = '1';
          stickyCall.style.transform = 'translateY(0)';
        }, 100);
      }, 2000); // Show after 2 seconds
    } else {
      // Hide on desktop
      stickyCall.style.display = 'none';
    }
  }

  // Different behavior based on device type
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    if (!mobile) {
      // Desktop behavior - copy to clipboard
      link.setAttribute('title', 'Click to copy phone number');

      link.addEventListener('click', function(e) {
        // Prevent default tel: behavior on desktop
        e.preventDefault();

        // Copy number to clipboard
        const phoneNumber = this.getAttribute('href').replace('tel:', '');
        navigator.clipboard.writeText(phoneNumber).then(() => {
          // Show feedback toast
          showCopiedToast(phoneNumber);
        }).catch(err => {
          console.error('Could not copy number: ', err);
        });
      });
    }
  });
}

/**
 * Shows a toast when phone number is copied to clipboard (for desktop)
 */
function showCopiedToast(phoneNumber) {
  // Create a toast element if it doesn't exist
  let toast = document.getElementById('copied-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'copied-toast';
    toast.className = 'copied-toast';
    document.body.appendChild(toast);
    
    // Add CSS for the toast
    const style = document.createElement('style');
    style.textContent = `
      .copied-toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #10b981;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.3s ease;
        font-weight: 500;
      }
      .copied-toast.visible {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Set content and show the toast
  toast.textContent = `Number copied: ${phoneNumber}`;
  toast.classList.add('visible');
  
  // Hide the toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 3000);
}

/**
 * Initialize call button visual effects and interactions
 */
function initCallButtonEffects() {
  // Add hover effect to phone numbers
  document.querySelectorAll('.phone-number').forEach(phoneButton => {
    // Create ripple effect on click
    phoneButton.addEventListener('click', function(e) {
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      this.appendChild(ripple);
      
      // Position the ripple
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
      
      // Remove ripple after animation completes
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
  
  // Add "Call Now: Available" message during business hours
  updateCallAvailability();
}

/**
 * Update call availability message based on business hours
 */
function updateCallAvailability() {
  const phoneNumbers = document.querySelectorAll('.phone-number');
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const hour = now.getHours();
  
  // Check if it's business hours (Monday-Friday, 8am-5pm)
  const isBusinessHours = day >= 1 && day <= 5 && hour >= 8 && hour < 17;
  
  if (isBusinessHours) {
    // During business hours
    phoneNumbers.forEach(phone => {
      if (!phone.querySelector('.availability')) {
        const availability = document.createElement('span');
        availability.className = 'availability available';
        availability.innerHTML = ' <small>• Available Now</small>';
        phone.appendChild(availability);
      }
    });
  } else {
    // After hours
    phoneNumbers.forEach(phone => {
      if (!phone.querySelector('.availability')) {
        const availability = document.createElement('span');
        availability.className = 'availability unavailable';
        availability.innerHTML = ' <small>• Leave Message</small>';
        phone.appendChild(availability);
      }
    });
  }
}