/**
 * Parts Dashboard Functionality
 * Handles parts ordering from dashboard and integration with the parts inventory system
 */

// Sample low stock parts data - in a real app, this would be fetched from a server
const lowStockParts = [
    { id: 'E-356921', description: 'Temperature Controller Digital 120V', category: 'Electrical', inStock: 2, minLevel: 5, price: 89.75 },
    { id: 'M-892341', description: 'Evaporator Fan Assembly 9W 115V', category: 'Mechanical', inStock: 0, minLevel: 2, price: 112.50 },
    { id: 'R-455667', description: 'Refrigerant R-410A 25lb', category: 'Refrigeration', inStock: 1, minLevel: 3, price: 175.25 },
    { id: 'F-672234', description: 'Condenser Coil Filter 20x25', category: 'Filters', inStock: 3, minLevel: 10, price: 32.99 },
    { id: 'M-773421', description: 'Compressor Starter Kit 3HP', category: 'Mechanical', inStock: 2, minLevel: 4, price: 95.50 }
];

// Selected parts for quick order
let quickOrderParts = [];

// Initialize Parts Dashboard functionality when document is ready
document.addEventListener('DOMContentLoaded', function() {
    initializePartsDashboard();
});

/**
 * Initialize Parts Dashboard components and functionality
 */
function initializePartsDashboard() {
    // Add click handler to the Parts Needed dashboard card for quick ordering
    const partsNeededCard = document.getElementById('parts-needed-card');
    if (!partsNeededCard) {
        console.warn('Parts Needed dashboard card not found');
        return;
    }

    // Create a custom event handler for the card that opens the quick order modal instead of navigating
    partsNeededCard.addEventListener('click', function(event) {
        // Prevent default navigation
        event.preventDefault();
        
        // Show quick order modal
        showQuickOrderModal();
    });

    // Create and inject the quick order modal into the DOM if it doesn't exist yet
    let quickOrderModal = document.getElementById('quick-order-modal');
    if (!quickOrderModal) {
        quickOrderModal = createQuickOrderModal();
        document.body.appendChild(quickOrderModal);
    }

    // Set up event handlers for the modal
    setupQuickOrderModalHandlers(quickOrderModal);
}

/**
 * Create the Quick Order Modal structure
 * @returns {HTMLElement} The modal element
 */
function createQuickOrderModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'quick-order-modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Quick Order Parts</h2>
                <button class="modal-close" id="close-quick-order-modal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="quick-order-info">
                    <p>The following parts are low in stock or out of stock. Select the parts you want to order:</p>
                </div>
                <div class="quick-order-parts">
                    <table class="order-parts-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" id="select-all-quick-parts" class="select-checkbox"></th>
                                <th>Part #</th>
                                <th>Description</th>
                                <th>In Stock</th>
                                <th>Min Level</th>
                                <th>Status</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody id="quick-order-parts-list">
                            <!-- Low stock parts will be populated here -->
                        </tbody>
                    </table>
                </div>

                <div class="quick-order-details">
                    <h3>Order Details</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Supplier<span class="required">*</span></label>
                            <select class="form-control" id="quick-supplier-select" required>
                                <option value="">Select a supplier</option>
                                <option value="memphis-commercial">Memphis Commercial Parts</option>
                                <option value="southern-equipment">Southern Equipment Supply</option>
                                <option value="national-hvac">National HVAC Distributors</option>
                                <option value="wholesale-refrigeration">Wholesale Refrigeration Parts</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Priority<span class="required">*</span></label>
                            <select class="form-control" id="quick-priority-select" required>
                                <option value="standard">Standard (3-5 days)</option>
                                <option value="expedited">Expedited (1-2 days)</option>
                                <option value="emergency">Emergency (Same day if available)</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Notes</label>
                        <textarea class="form-control textarea" id="quick-order-notes" rows="2" placeholder="Enter any special instructions or comments about this order..."></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <div class="order-total">
                    <span class="order-total-label">Estimated Total:</span>
                    <span class="order-total-value" id="quick-order-total">$0.00</span>
                </div>
                <div>
                    <button class="btn-outline" id="cancel-quick-order">Cancel</button>
                    <button class="btn-primary" id="submit-quick-order">Submit Order</button>
                    <button class="btn-outline" id="view-all-parts">View All Parts</button>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

/**
 * Set up event handlers for the Quick Order Modal
 * @param {HTMLElement} modal - The modal element
 */
function setupQuickOrderModalHandlers(modal) {
    // Close modal handlers
    const closeModalBtn = modal.querySelector('#close-quick-order-modal');
    const cancelBtn = modal.querySelector('#cancel-quick-order');
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideQuickOrderModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideQuickOrderModal);
    }
    
    // View All Parts button - navigate to parts tab in reports page
    const viewAllPartsBtn = modal.querySelector('#view-all-parts');
    if (viewAllPartsBtn) {
        viewAllPartsBtn.addEventListener('click', function() {
            window.location.href = 'reports.html?tab=parts';
        });
    }
    
    // Select all parts checkbox
    const selectAllCheckbox = modal.querySelector('#select-all-quick-parts');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = modal.querySelectorAll('.part-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
                
                // Update the quickOrderParts array based on checkbox state
                const partId = checkbox.getAttribute('data-part-id');
                if (checkbox.checked) {
                    addPartToQuickOrder(partId);
                } else {
                    removePartFromQuickOrder(partId);
                }
            });
            
            // Update the order total
            updateQuickOrderTotal();
        });
    }
    
    // Submit order button
    const submitOrderBtn = modal.querySelector('#submit-quick-order');
    if (submitOrderBtn) {
        submitOrderBtn.addEventListener('click', submitQuickOrder);
    }
}

/**
 * Show the Quick Order Modal with low stock parts
 */
function showQuickOrderModal() {
    const modal = document.getElementById('quick-order-modal');
    if (!modal) return;
    
    // Reset the quick order parts array
    quickOrderParts = [];
    
    // Populate the parts list
    populateQuickOrderPartsList();
    
    // Show the modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Hide the Quick Order Modal
 */
function hideQuickOrderModal() {
    const modal = document.getElementById('quick-order-modal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Populate the Quick Order Parts list with low stock parts
 */
function populateQuickOrderPartsList() {
    const partsList = document.getElementById('quick-order-parts-list');
    if (!partsList) return;
    
    // Clear the list
    partsList.innerHTML = '';
    
    // Add each low stock part to the list
    lowStockParts.forEach(part => {
        const row = document.createElement('tr');
        
        // Determine the status of the part
        let statusHtml = '';
        if (part.inStock === 0) {
            statusHtml = '<span class="badge badge-danger">Out of Stock</span>';
        } else if (part.inStock < part.minLevel) {
            statusHtml = '<span class="badge badge-warning">Low Stock</span>';
        }
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="part-checkbox" data-part-id="${part.id}">
            </td>
            <td>${part.id}</td>
            <td>${part.description}</td>
            <td>${part.inStock}</td>
            <td>${part.minLevel}</td>
            <td>${statusHtml}</td>
            <td>
                <input type="number" class="quantity-input" data-part-id="${part.id}" value="1" min="1" max="10">
            </td>
        `;
        
        partsList.appendChild(row);
    });
    
    // Add event listeners to checkboxes and quantity inputs
    const checkboxes = partsList.querySelectorAll('.part-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const partId = this.getAttribute('data-part-id');
            if (this.checked) {
                addPartToQuickOrder(partId);
            } else {
                removePartFromQuickOrder(partId);
            }
            updateQuickOrderTotal();
        });
    });
    
    const quantityInputs = partsList.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const partId = this.getAttribute('data-part-id');
            const quantity = parseInt(this.value);
            
            // Find the corresponding checkbox and ensure it's checked
            const checkbox = partsList.querySelector(`.part-checkbox[data-part-id="${partId}"]`);
            if (checkbox && !checkbox.checked) {
                checkbox.checked = true;
                addPartToQuickOrder(partId);
            }
            
            // Update the quantity in the quickOrderParts array
            updatePartQuantityInQuickOrder(partId, quantity);
            
            // Update the order total
            updateQuickOrderTotal();
        });
    });
}

/**
 * Add a part to the quick order array
 * @param {string} partId - The ID of the part to add
 */
function addPartToQuickOrder(partId) {
    // Check if part is already in the array
    const existingPartIndex = quickOrderParts.findIndex(p => p.id === partId);
    if (existingPartIndex >= 0) return;
    
    // Find the part in the lowStockParts array
    const part = lowStockParts.find(p => p.id === partId);
    if (!part) return;
    
    // Get the quantity from the input if it exists
    const quantityInput = document.querySelector(`.quantity-input[data-part-id="${partId}"]`);
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    // Add the part to the quickOrderParts array
    quickOrderParts.push({
        ...part,
        quantity: quantity
    });
}

/**
 * Remove a part from the quick order array
 * @param {string} partId - The ID of the part to remove
 */
function removePartFromQuickOrder(partId) {
    quickOrderParts = quickOrderParts.filter(p => p.id !== partId);
}

/**
 * Update the quantity of a part in the quick order array
 * @param {string} partId - The ID of the part to update
 * @param {number} quantity - The new quantity
 */
function updatePartQuantityInQuickOrder(partId, quantity) {
    const partIndex = quickOrderParts.findIndex(p => p.id === partId);
    if (partIndex >= 0 && quantity > 0) {
        quickOrderParts[partIndex].quantity = quantity;
    }
}

/**
 * Update the quick order total
 */
function updateQuickOrderTotal() {
    const orderTotalElement = document.getElementById('quick-order-total');
    if (!orderTotalElement) return;
    
    let total = 0;
    
    quickOrderParts.forEach(part => {
        total += part.price * part.quantity;
    });
    
    orderTotalElement.textContent = `$${total.toFixed(2)}`;
}

/**
 * Submit the quick order
 */
function submitQuickOrder() {
    // Check if any parts are selected
    if (quickOrderParts.length === 0) {
        alert('Please select at least one part to order.');
        return;
    }
    
    // Check if supplier and priority are selected
    const supplierSelect = document.getElementById('quick-supplier-select');
    const prioritySelect = document.getElementById('quick-priority-select');
    
    if (!supplierSelect.value) {
        alert('Please select a supplier.');
        return;
    }
    
    if (!prioritySelect.value) {
        alert('Please select a priority.');
        return;
    }
    
    // In a real app, this would submit the order to a backend service
    // For now, show a success message and close the modal
    
    // Get the notes
    const notes = document.getElementById('quick-order-notes').value;
    
    // Create a summary message
    let summary = `Order submitted for ${quickOrderParts.length} part${quickOrderParts.length > 1 ? 's' : ''}:\n\n`;
    
    quickOrderParts.forEach(part => {
        summary += `- ${part.quantity}x ${part.description} (${part.id})\n`;
    });
    
    summary += `\nSupplier: ${supplierSelect.options[supplierSelect.selectedIndex].text}`;
    summary += `\nPriority: ${prioritySelect.options[prioritySelect.selectedIndex].text}`;
    
    if (notes) {
        summary += `\nNotes: ${notes}`;
    }
    
    // Show the summary and success message
    alert('Order submitted successfully!\n\n' + summary);
    
    // Close the modal
    hideQuickOrderModal();
    
    // Update the dashboard to show the order has been placed
    updateDashboardAfterOrder();
}

/**
 * Update the dashboard after an order is placed
 */
function updateDashboardAfterOrder() {
    // Update the Parts Needed card to show parts have been ordered
    const partsNeededCard = document.querySelector('a[href="reports.html?tab=parts"] .summary-status');
    if (partsNeededCard) {
        partsNeededCard.textContent = 'Order submitted';
        
        // Change color to indicate success
        partsNeededCard.style.color = 'var(--success)';
    }
    
    // Create a notification for the order
    // In a real app, this would be handled by the notifications system
    // But since we have the notifications.js file, we can use its functions
    
    // Check if notifications.js functions are available
    if (typeof window.markAllNotificationsAsRead === 'function') {
        // Add a new notification
        const newNotification = {
            id: 'notif-' + Date.now(),
            type: 'success',
            message: `Parts order submitted for ${quickOrderParts.length} item${quickOrderParts.length > 1 ? 's' : ''}`,
            time: 'Just now',
            source: 'Parts',
            unread: true,
            link: 'reports.html?tab=parts'
        };
        
        // Add to the beginning of the sampleNotifications array if it exists
        if (window.sampleNotifications) {
            window.sampleNotifications.unshift(newNotification);
            
            // Update the notification badge if the function exists
            if (typeof window.updateNotificationBadge === 'function') {
                window.updateNotificationBadge();
            }
        }
    }
}