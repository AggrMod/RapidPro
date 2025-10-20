/**
 * User Menu Dropdown Functionality
 * Provides consistent user profile dropdown menu behavior across all dashboard pages
 */

// Initialize User Menu functionality on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeUserMenu();
});

/**
 * Initialize the user menu dropdown functionality
 */
function initializeUserMenu() {
    const userMenuBtn = document.querySelector('.user-menu-btn');
    const userMenuDropdown = document.querySelector('.user-menu-dropdown');

    if (!userMenuBtn || !userMenuDropdown) {
        console.warn('User menu elements not found in the DOM');
        return;
    }

    // Toggle dropdown visibility when the user menu button is clicked
    userMenuBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        userMenuDropdown.classList.toggle('active');
        
        // If notification dropdown is open, close it
        const notificationDropdown = document.querySelector('.notification-dropdown');
        if (notificationDropdown && notificationDropdown.classList.contains('active')) {
            notificationDropdown.classList.remove('active');
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!userMenuBtn.contains(event.target) && !userMenuDropdown.contains(event.target)) {
            userMenuDropdown.classList.remove('active');
        }
    });

    // Handle keyboard navigation and accessibility
    userMenuBtn.addEventListener('keydown', function(event) {
        // Open menu on Enter or Space
        if ((event.key === 'Enter' || event.key === ' ') && !userMenuDropdown.classList.contains('active')) {
            event.preventDefault();
            userMenuDropdown.classList.add('active');
            
            // Focus the first menu item
            const firstMenuItem = userMenuDropdown.querySelector('a');
            if (firstMenuItem) {
                firstMenuItem.focus();
            }
        }
        
        // Close menu on Escape
        if (event.key === 'Escape' && userMenuDropdown.classList.contains('active')) {
            userMenuDropdown.classList.remove('active');
            userMenuBtn.focus();
        }
    });
    
    // Keyboard navigation within dropdown
    userMenuDropdown.addEventListener('keydown', function(event) {
        const menuItems = userMenuDropdown.querySelectorAll('a');
        const currentIndex = Array.from(menuItems).indexOf(document.activeElement);
        
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (currentIndex < menuItems.length - 1) {
                menuItems[currentIndex + 1].focus();
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (currentIndex > 0) {
                menuItems[currentIndex - 1].focus();
            } else {
                userMenuBtn.focus();
            }
        } else if (event.key === 'Escape') {
            event.preventDefault();
            userMenuDropdown.classList.remove('active');
            userMenuBtn.focus();
        }
    });
}

/**
 * Create the user profile menu dropdown dynamically
 * This is useful for injecting the menu into pages that don't have it yet
 * @param {HTMLElement} container - Container element to append the menu to
 * @param {Object} userData - User data for personalization (optional)
 */
function createUserMenu(container, userData = {}) {
    if (!container) return;
    
    // Use provided user data or defaults
    const user = {
        name: userData.name || 'John Smith',
        initials: userData.initials || 'JS',
        role: userData.role || 'Service Technician',
        email: userData.email || 'john.smith@rapidpro.com'
    };
    
    // Create user menu container
    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    
    // Create user menu button
    userMenu.innerHTML = `
        <button class="user-menu-btn" aria-label="User menu" aria-haspopup="true" aria-expanded="false">
            <div class="user-avatar">${user.initials}</div>
            <span class="user-name">${user.name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        </button>
        <div class="user-menu-dropdown" aria-labelledby="user-menu-btn">
            <div class="user-info">
                <div class="user-avatar-large">${user.initials}</div>
                <div class="user-details">
                    <div class="user-name-large">${user.name}</div>
                    <div class="user-role">${user.role}</div>
                    <div class="user-email">${user.email}</div>
                </div>
            </div>
            <div class="dropdown-divider"></div>
            <a href="settings.html?tab=profile" class="dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Profile
            </a>
            <a href="settings.html?tab=account" class="dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Account
            </a>
            <a href="settings.html?tab=preferences" class="dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Preferences
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item" id="help-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Help & Support
            </a>
            <a href="index.html" class="dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
            </a>
        </div>
    `;
    
    // Append to container
    container.appendChild(userMenu);
    
    // Initialize functionality
    initializeUserMenu();
    
    // Set up help link
    const helpLink = userMenu.querySelector('#help-link');
    if (helpLink) {
        helpLink.addEventListener('click', function(event) {
            event.preventDefault();
            // Show help modal or redirect to help page
            alert('Help & Support functionality will be implemented in a future update.');
        });
    }
}