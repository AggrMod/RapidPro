/**
 * Enhanced Click-to-Call functionality
 * 
 * This script enhances the click-to-call experience for both mobile and desktop users
 * by providing visual feedback and ensuring optimal compatibility with
 * native phone apps on iOS and Android.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Enhance all phone number links
    enhancePhoneLinks();
    
    // Add click tracking for analytics
    setupClickTracking();
});

/**
 * Enhances all phone links on the page
 */
function enhancePhoneLinks() {
    // Get all phone number links
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    
    // Loop through each link
    phoneLinks.forEach(link => {
        // Add the enhanced click-to-call data attributes
        link.setAttribute('data-enhanced-call', 'true');
        
        // For iOS devices - add specific attributes for CallKit
        if (isIOS()) {
            link.setAttribute('data-ios-call', 'true');
            link.setAttribute('data-call-service-type', 'voip');
            link.setAttribute('data-call-provider', 'Rapid Pro Maintenance');
        }
        
        // For Android devices - add intent data
        if (isAndroid()) {
            link.setAttribute('data-android-call', 'true');
            
            // Preserve the original href
            const originalHref = link.getAttribute('href');
            
            // Add event listener to handle Android intents
            link.addEventListener('click', function(e) {
                // Only intercept if we're on Android
                if (isAndroid()) {
                    e.preventDefault();
                    
                    // Extract the phone number
                    const phoneNumber = originalHref.replace('tel:', '');
                    
                    // Create intent URL that works with Google Dialer app
                    const intentUrl = `intent://${phoneNumber}#Intent;scheme=tel;action=android.intent.action.DIAL;package=com.google.android.dialer;end`;
                    
                    // Navigate to the intent URL
                    window.location.href = intentUrl;
                    
                    // Fallback to regular tel: link if intent doesn't work
                    // This happens automatically after a short timeout
                    setTimeout(() => {
                        window.location.href = originalHref;
                    }, 300);
                }
            });
        }
        
        // Add visual feedback when the phone number is clicked
        link.addEventListener('click', function() {
            // Add a visual indicator that the call is being initiated
            this.classList.add('calling');
            
            // Play a subtle sound to indicate the call is being placed
            playCallSound();
            
            // Show a toast notification
            showToast('Initiating call...');
            
            // Vibrate the device if supported (mobile only)
            if (navigator.vibrate) {
                navigator.vibrate([50, 50, 50]);
            }
        });
    });
}

/**
 * Checks if the user is on an iOS device
 */
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

/**
 * Checks if the user is on an Android device
 */
function isAndroid() {
    return /Android/.test(navigator.userAgent);
}

/**
 * Shows a toast notification
 */
function showToast(message) {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('call-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'call-toast';
        toast.className = 'call-toast';
        document.body.appendChild(toast);
        
        // Add the CSS for the toast
        const style = document.createElement('style');
        style.textContent = `
            .call-toast {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: var(--primary);
                color: white;
                padding: 12px 24px;
                border-radius: 4px;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .call-toast.visible {
                opacity: 1;
            }
            .call-toast::before {
                content: "📞";
                font-size: 18px;
            }
            .calling {
                position: relative;
                animation: pulse 1.5s infinite;
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Set the message and show the toast
    toast.textContent = message;
    toast.classList.add('visible');
    
    // Hide the toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

/**
 * Plays a subtle sound when a call is initiated
 */
function playCallSound() {
    // Create audio element if supported
    if (window.AudioContext || window.webkitAudioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const context = new AudioContext();
        
        // Create oscillator for dial tone sound
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, context.currentTime);
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.start();
        
        // Stop the sound after 0.3 seconds
        setTimeout(() => {
            oscillator.stop();
        }, 300);
    }
}

/**
 * Sets up click tracking for analytics
 */
function setupClickTracking() {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    
    phoneLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Track the call in analytics if available
            if (window.gtag) {
                gtag('event', 'phone_call', {
                    'event_category': 'Engagement',
                    'event_label': 'Phone Call'
                });
            }
            
            // Track in console for debugging
            console.log('Phone call clicked: ' + this.getAttribute('href'));
        });
    });
}