/**
 * Reports Page Tab Functionality
 * Handles tab switching in the reports page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get all tab buttons and tab content elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // If we don't have any tab buttons, exit early
    if (!tabButtons.length) return;
    
    // Add click event listeners to each tab button
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => content.style.display = 'none');
            
            // Show the selected tab content
            const tabId = this.getAttribute('data-tab');
            const selectedTab = document.getElementById(tabId);
            
            if (selectedTab) {
                selectedTab.style.display = 'block';
                
                // Dispatch custom event that tab was changed
                // This allows other components to respond to tab changes
                const tabChangeEvent = new CustomEvent('tabChanged', {
                    detail: { tabId: tabId }
                });
                document.dispatchEvent(tabChangeEvent);
                
                // Update URL hash to maintain tab state on refresh
                window.location.hash = tabId;
            }
        });
    });
    
    // Check for hash in URL to activate the corresponding tab
    const hash = window.location.hash.substring(1);
    if (hash) {
        const hashButton = Array.from(tabButtons).find(button => 
            button.getAttribute('data-tab') === hash
        );
        
        if (hashButton) {
            hashButton.click();
        } else {
            // Default to first tab if hash doesn't match
            tabButtons[0].click();
        }
    } else {
        // Default to first tab if no hash
        tabButtons[0].click();
    }
    
    console.log('Reports tab functionality initialized');
});