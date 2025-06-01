/**
 * Notifications Dropdown Functionality
 * Provides consistent notifications dropdown behavior across all dashboard pages
 */

// Sample notification data - in a real implementation, this would come from an API
const sampleNotifications = [
    {
        id: 'notif-1',
        type: 'alert',
        message: 'Critical temperature alert for Grand Hotel Memphis walk-in cooler',
        time: '10 minutes ago',
        source: 'Equipment',
        unread: true,
        link: 'reports.html?tab=alerts'
    },
    {
        id: 'notif-2',
        type: 'warning',
        message: 'Scheduled maintenance for TJ\'s Bar & Grill is due today',
        time: '1 hour ago',
        source: 'Schedule',
        unread: true,
        link: 'schedule.html'
    },
    {
        id: 'notif-3',
        type: 'info',
        message: 'New PM session assigned for tomorrow: Southern Diner',
        time: '3 hours ago',
        source: 'Assignment',
        unread: false,
        link: 'schedule.html'
    },
    {
        id: 'notif-4',
        type: 'success',
        message: 'Parts order #28973 has been delivered to warehouse',
        time: 'Yesterday',
        source: 'Inventory',
        unread: false,
        link: 'reports.html?tab=parts'
    },
    {
        id: 'notif-5',
        type: 'info',
        message: 'Weekly maintenance report is ready for review',
        time: 'Yesterday',
        source: 'Reports',
        unread: false,
        link: 'reports.html'
    }
];

// Initialize Notifications functionality on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeNotifications();
});

/**
 * Initialize the notifications dropdown functionality
 */
function initializeNotifications() {
    // Get existing notification button, or return if not found
    const notificationBtn = document.querySelector('.notification-btn');
    if (!notificationBtn) {
        console.warn('Notification button not found in the DOM');
        return;
    }
    
    // Check if dropdown already exists, if not create it
    let notificationDropdown = document.querySelector('.notification-dropdown');
    if (!notificationDropdown) {
        // Create the dropdown
        notificationDropdown = createNotificationDropdown();
        
        // Append after the notification button
        notificationBtn.parentNode.appendChild(notificationDropdown);
    }
    
    // Populate with notifications
    populateNotifications(notificationDropdown, sampleNotifications);
    
    // Update notification badge
    updateNotificationBadge();
    
    // Toggle dropdown visibility when the notification button is clicked
    notificationBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        notificationDropdown.classList.toggle('active');
        
        // If user menu dropdown is open, close it
        const userMenuDropdown = document.querySelector('.user-menu-dropdown');
        if (userMenuDropdown && userMenuDropdown.classList.contains('active')) {
            userMenuDropdown.classList.remove('active');
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!notificationBtn.contains(event.target) && !notificationDropdown.contains(event.target)) {
            notificationDropdown.classList.remove('active');
        }
    });
    
    // Handle keyboard navigation and accessibility
    notificationBtn.addEventListener('keydown', function(event) {
        // Open menu on Enter or Space
        if ((event.key === 'Enter' || event.key === ' ') && !notificationDropdown.classList.contains('active')) {
            event.preventDefault();
            notificationDropdown.classList.add('active');
            
            // Focus the first actionable element
            const firstActionable = notificationDropdown.querySelector('.notification-action-btn, .notification-item');
            if (firstActionable) {
                firstActionable.focus();
            }
        }
        
        // Close menu on Escape
        if (event.key === 'Escape' && notificationDropdown.classList.contains('active')) {
            notificationDropdown.classList.remove('active');
            notificationBtn.focus();
        }
    });
    
    // Setup action buttons
    setupNotificationActions(notificationDropdown);
}

/**
 * Create the notification dropdown structure
 * @returns {HTMLElement} The notification dropdown element
 */
function createNotificationDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'notification-dropdown';
    
    dropdown.innerHTML = `
        <div class="notification-header">
            <h3 class="notification-title">Notifications</h3>
            <div class="notification-actions">
                <button class="notification-action-btn" id="mark-all-read">Mark all as read</button>
                <button class="notification-action-btn" id="clear-all">Clear all</button>
            </div>
        </div>
        <div class="notification-list">
            <!-- Notifications will be populated here -->
        </div>
        <div class="notification-footer">
            <a href="settings.html?tab=notifications" class="view-all-notifications">View all notifications</a>
        </div>
    `;
    
    return dropdown;
}

/**
 * Populate the notification dropdown with notification items
 * @param {HTMLElement} dropdown - The notification dropdown element
 * @param {Array} notifications - Array of notification objects
 */
function populateNotifications(dropdown, notifications) {
    const notificationList = dropdown.querySelector('.notification-list');
    
    // If no notifications, show empty state
    if (!notifications || notifications.length === 0) {
        notificationList.innerHTML = `
            <div class="notification-empty">
                <div class="notification-empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </div>
                <p class="notification-empty-message">You have no new notifications</p>
                <p class="notification-empty-submessage">Notifications will appear here when available</p>
            </div>
        `;
        return;
    }
    
    // Add notification items
    notificationList.innerHTML = '';
    
    notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = `notification-item${notification.unread ? ' unread' : ''}`;
        notificationItem.dataset.id = notification.id;
        
        // Icon based on notification type
        let iconSvg = '';
        switch (notification.type) {
            case 'info':
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
                break;
            case 'success':
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
                break;
            case 'warning':
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
                break;
            case 'alert':
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
                break;
        }
        
        notificationItem.innerHTML = `
            <div class="notification-icon notification-type-${notification.type}">
                ${iconSvg}
            </div>
            <div class="notification-content">
                <p class="notification-message">${notification.message}</p>
                <div class="notification-meta">
                    <span class="notification-time">${notification.time}</span>
                    <span class="notification-source">${notification.source}</span>
                </div>
            </div>
            ${notification.unread ? '<div class="unread-indicator"></div>' : ''}
        `;
        
        // Add click event to navigate to linked page
        notificationItem.addEventListener('click', function() {
            // Mark as read
            if (notification.unread) {
                markNotificationAsRead(notification.id);
            }
            
            // Navigate to link
            if (notification.link) {
                window.location.href = notification.link;
            }
        });
        
        notificationList.appendChild(notificationItem);
    });
}

/**
 * Setup event handlers for notification action buttons
 * @param {HTMLElement} dropdown - The notification dropdown element
 */
function setupNotificationActions(dropdown) {
    // Mark all as read
    const markAllReadBtn = dropdown.querySelector('#mark-all-read');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            markAllNotificationsAsRead();
        });
    }
    
    // Clear all notifications
    const clearAllBtn = dropdown.querySelector('#clear-all');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            clearAllNotifications();
        });
    }
}

/**
 * Update the notification badge count
 */
function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (!badge) return;
    
    // Count unread notifications
    const unreadCount = sampleNotifications.filter(n => n.unread).length;
    
    // Update or hide badge
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

/**
 * Mark a specific notification as read
 * @param {string} notificationId - ID of the notification to mark as read
 */
function markNotificationAsRead(notificationId) {
    // Find the notification in our sample data
    const notification = sampleNotifications.find(n => n.id === notificationId);
    if (notification) {
        notification.unread = false;
    }
    
    // Update UI
    const notificationItem = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
    if (notificationItem) {
        notificationItem.classList.remove('unread');
        const unreadIndicator = notificationItem.querySelector('.unread-indicator');
        if (unreadIndicator) {
            unreadIndicator.remove();
        }
    }
    
    // Update badge
    updateNotificationBadge();
}

/**
 * Mark all notifications as read
 */
function markAllNotificationsAsRead() {
    // Mark all as read in data
    sampleNotifications.forEach(n => n.unread = false);
    
    // Update UI
    document.querySelectorAll('.notification-item.unread').forEach(item => {
        item.classList.remove('unread');
        const unreadIndicator = item.querySelector('.unread-indicator');
        if (unreadIndicator) {
            unreadIndicator.remove();
        }
    });
    
    // Update badge
    updateNotificationBadge();
}

/**
 * Clear all notifications
 */
function clearAllNotifications() {
    // Clear notifications in data
    sampleNotifications.length = 0;
    
    // Update UI
    const notificationList = document.querySelector('.notification-list');
    if (notificationList) {
        notificationList.innerHTML = `
            <div class="notification-empty">
                <div class="notification-empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </div>
                <p class="notification-empty-message">You have no new notifications</p>
                <p class="notification-empty-submessage">Notifications will appear here when available</p>
            </div>
        `;
    }
    
    // Update badge
    updateNotificationBadge();
}