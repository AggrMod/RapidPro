/**
 * Issues and Alerts UI Components
 * Manages the UI for Issues and Critical Alerts tabs
 * Implements enhanced filtering, sorting, and modal functionality
 */

// Initialize the issues and alerts UI when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create the issues and alerts tab content
    createIssuesTabContent();
    createAlertsTabContent();
    createEnhancedModal();
    
    // Link metrics to tabs
    linkMetricsToTabs();
});

/**
 * Create the Issues tab content
 */
function createIssuesTabContent() {
    const issuesTab = document.getElementById('issues');
    
    // If the tab doesn't exist, create it
    if (!issuesTab) {
        const tabContent = document.createElement('div');
        tabContent.id = 'issues';
        tabContent.className = 'tab-content';
        tabContent.style.display = 'none';
        
        // Create card HTML
        tabContent.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2>Issues Requiring Follow-Up</h2>
                    <div class="card-actions">
                        <div class="search-box">
                            <input type="text" placeholder="Search issues..." class="search-input" id="issues-search">
                            <button class="search-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="filter-controls">
                            <select class="filter-select" id="issues-priority-filter">
                                <option value="">All Priorities</option>
                                <option value="High">High Priority</option>
                                <option value="Medium">Medium Priority</option>
                                <option value="Low">Low Priority</option>
                            </select>
                            <select class="filter-select" id="issues-status-filter">
                                <option value="">All Statuses</option>
                                <option value="pending" selected>Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <button class="btn-outline" id="issues-add-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                            Add Issue
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table" id="issues-table">
                            <thead>
                                <tr>
                                    <th class="sortable" data-sort="id">Issue ID</th>
                                    <th class="sortable" data-sort="customer">Customer</th>
                                    <th class="sortable" data-sort="equipment">Equipment</th>
                                    <th class="sortable" data-sort="issue">Issue</th>
                                    <th class="sortable" data-sort="priority">Priority</th>
                                    <th class="sortable" data-sort="status">Status</th>
                                    <th class="sortable" data-sort="createdDate">Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="issues-table-body">
                                <tr>
                                    <td colspan="8" class="loading-message">Loading issues...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="pagination">
                        <button class="pagination-btn" id="issues-prev-page" disabled>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <div class="pagination-pages">
                            <span class="pagination-current" id="issues-current-page">1</span>
                            <span class="pagination-separator">of</span>
                            <span class="pagination-total" id="issues-total-pages">1</span>
                        </div>
                        <button class="pagination-btn" id="issues-next-page">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add the tab content to the dashboard content
        document.querySelector('.dashboard-content').appendChild(tabContent);
        
        // Initialize the issues table
        initIssuesTable();
        
        // Add event listeners
        addIssuesEventListeners();
    }
}

/**
 * Create the Alerts tab content
 */
function createAlertsTabContent() {
    const alertsTab = document.getElementById('alerts');
    
    // If the tab doesn't exist, create it
    if (!alertsTab) {
        const tabContent = document.createElement('div');
        tabContent.id = 'alerts';
        tabContent.className = 'tab-content';
        tabContent.style.display = 'none';
        
        // Create card HTML
        tabContent.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2>Critical Equipment Alerts</h2>
                    <div class="card-actions">
                        <div class="search-box">
                            <input type="text" placeholder="Search alerts..." class="search-input" id="alerts-search">
                            <button class="search-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="filter-controls">
                            <select class="filter-select" id="alerts-status-filter">
                                <option value="">All Statuses</option>
                                <option value="active" selected>Active</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                        <button class="btn-outline" id="alerts-add-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                            Add Alert
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table" id="alerts-table">
                            <thead>
                                <tr>
                                    <th class="sortable" data-sort="id">Alert ID</th>
                                    <th class="sortable" data-sort="customer">Customer</th>
                                    <th class="sortable" data-sort="equipment">Equipment</th>
                                    <th class="sortable" data-sort="issue">Issue</th>
                                    <th class="sortable" data-sort="date">Date</th>
                                    <th class="sortable" data-sort="status">Status</th>
                                    <th>Required Action</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="alerts-table-body">
                                <tr>
                                    <td colspan="8" class="loading-message">Loading alerts...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="pagination">
                        <button class="pagination-btn" id="alerts-prev-page" disabled>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <div class="pagination-pages">
                            <span class="pagination-current" id="alerts-current-page">1</span>
                            <span class="pagination-separator">of</span>
                            <span class="pagination-total" id="alerts-total-pages">1</span>
                        </div>
                        <button class="pagination-btn" id="alerts-next-page">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add the tab content to the dashboard content
        document.querySelector('.dashboard-content').appendChild(tabContent);
        
        // Initialize the alerts table
        initAlertsTable();
        
        // Add event listeners
        addAlertsEventListeners();
    }
}

/**
 * Create the enhanced modal for displaying and editing details
 */
function createEnhancedModal() {
    // Check if the enhanced detail modal already exists
    if (document.getElementById('enhanced-detail-modal')) {
        return;
    }
    
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'enhanced-detail-modal';
    modalContainer.className = 'modal';
    
    // Add modal content structure
    modalContainer.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="enhanced-modal-title">Details</h2>
                <button class="modal-close" id="enhanced-close-modal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="tabs-container">
                    <div class="modal-tabs">
                        <button class="modal-tab-button active" data-tab="details">Details</button>
                        <button class="modal-tab-button" data-tab="history">History</button>
                        <button class="modal-tab-button" data-tab="notes">Notes</button>
                    </div>
                    <div class="modal-tab-content" id="details-tab">
                        <div class="form-group">
                            <label class="form-label" id="id-label">ID</label>
                            <div class="form-value-display" id="id-value"></div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" id="customer-label">Customer</label>
                                <div class="form-value-display" id="customer-value"></div>
                            </div>
                            <div class="form-group">
                                <label class="form-label" id="date-label">Date</label>
                                <div class="form-value-display" id="date-value"></div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" id="equipment-label">Equipment</label>
                                <div class="form-value-display" id="equipment-value"></div>
                            </div>
                            <div class="form-group">
                                <label class="form-label" id="priority-label">Priority</label>
                                <div class="form-value-display" id="priority-value"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" id="issue-label">Issue</label>
                            <div class="form-value-display" id="issue-value"></div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" id="notes-label">Notes</label>
                            <div class="form-value-display" id="notes-value"></div>
                        </div>
                        <div class="form-row" id="action-row">
                            <div class="form-group">
                                <label class="form-label" id="action-label">Required Action</label>
                                <div class="form-value-display" id="action-value"></div>
                            </div>
                            <div class="form-group">
                                <label class="form-label" id="cost-label">Estimated Cost</label>
                                <div class="form-value-display" id="cost-value"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" id="status-label">Status</label>
                            <div class="form-value-display" id="status-value"></div>
                        </div>
                    </div>
                    <div class="modal-tab-content" id="history-tab" style="display: none;">
                        <div class="timeline">
                            <div class="timeline-loading">Loading history...</div>
                            <div class="timeline-items" id="history-items"></div>
                        </div>
                    </div>
                    <div class="modal-tab-content" id="notes-tab" style="display: none;">
                        <div class="notes-container">
                            <div class="notes-list" id="notes-list">
                                <div class="notes-loading">Loading notes...</div>
                            </div>
                            <div class="add-note-form">
                                <textarea class="form-control textarea" rows="3" placeholder="Add a new note..." id="new-note-input"></textarea>
                                <button class="btn-primary" id="add-note-btn">Add Note</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-outline" id="enhanced-modal-close-btn">Close</button>
                <div class="action-buttons" id="enhanced-modal-actions">
                    <button class="btn-secondary" id="enhanced-modal-edit-btn">Edit</button>
                    <button class="btn-primary" id="enhanced-modal-action-btn">Update Status</button>
                </div>
            </div>
        </div>
    `;
    
    // Add to the body
    document.body.appendChild(modalContainer);
    
    // Set up event listeners for modal
    setupEnhancedModalListeners();
}

/**
 * Set up event listeners for the enhanced modal
 */
function setupEnhancedModalListeners() {
    const modal = document.getElementById('enhanced-detail-modal');
    const closeBtn = document.getElementById('enhanced-close-modal');
    const closeFooterBtn = document.getElementById('enhanced-modal-close-btn');
    const tabButtons = modal.querySelectorAll('.modal-tab-button');
    
    // Close modal when clicking close button
    closeBtn.addEventListener('click', closeEnhancedModal);
    closeFooterBtn.addEventListener('click', closeEnhancedModal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeEnhancedModal();
        }
    });
    
    // Tab functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Hide all tab contents
            modal.querySelectorAll('.modal-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // Show the selected tab content
            document.getElementById(`${tabId}-tab`).style.display = 'block';
            
            // Update active tab button
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Edit button
    const editBtn = document.getElementById('enhanced-modal-edit-btn');
    editBtn.addEventListener('click', function() {
        const itemType = modal.getAttribute('data-type');
        const itemId = modal.getAttribute('data-id');
        
        // Open edit form
        showEditForm(itemType, itemId);
    });
    
    // Action button
    const actionBtn = document.getElementById('enhanced-modal-action-btn');
    actionBtn.addEventListener('click', function() {
        const itemType = modal.getAttribute('data-type');
        const itemId = modal.getAttribute('data-id');
        const currentStatus = modal.getAttribute('data-status');
        
        // Show status change form
        showStatusChangeForm(itemType, itemId, currentStatus);
    });
}

/**
 * Close the enhanced detail modal
 */
function closeEnhancedModal() {
    const modal = document.getElementById('enhanced-detail-modal');
    modal.classList.remove('active');
}

/**
 * Show the edit form for an item
 * @param {string} itemType - Type of item ('issue' or 'alert')
 * @param {string} itemId - ID of the item
 */
function showEditForm(itemType, itemId) {
    alert(`Edit form for ${itemType} ${itemId} would be shown here`);
    // In a real implementation, this would show a form to edit the item
}

/**
 * Show the status change form for an item
 * @param {string} itemType - Type of item ('issue' or 'alert')
 * @param {string} itemId - ID of the item
 * @param {string} currentStatus - Current status of the item
 */
function showStatusChangeForm(itemType, itemId, currentStatus) {
    alert(`Status change form for ${itemType} ${itemId} would be shown here (current status: ${currentStatus})`);
    // In a real implementation, this would show a form to change the item status
}

/**
 * Initialize the issues table
 */
function initIssuesTable() {
    const tableBody = document.getElementById('issues-table-body');
    
    // Show loading message
    tableBody.innerHTML = '<tr><td colspan="8" class="loading-message">Loading issues...</td></tr>';
    
    // Fetch issues
    fetchIssues();
}

/**
 * Fetch issues from the API and populate the table
 */
async function fetchIssues() {
    try {
        // Get filter values
        const priorityFilter = document.getElementById('issues-priority-filter').value;
        const statusFilter = document.getElementById('issues-status-filter').value;
        const searchQuery = document.getElementById('issues-search').value;
        
        // Fetch data
        const issues = await window.IssuesAPI.fetchIssues({
            filter: searchQuery,
            priority: priorityFilter,
            status: statusFilter
        });
        
        // Update the table
        updateIssuesTable(issues);
    } catch (error) {
        console.error('Error fetching issues:', error);
        const tableBody = document.getElementById('issues-table-body');
        tableBody.innerHTML = `<tr><td colspan="8" class="error-message">Error loading issues: ${error.message}</td></tr>`;
    }
}

/**
 * Update the issues table with data
 * @param {Array} issues - Array of issue objects
 */
function updateIssuesTable(issues) {
    const tableBody = document.getElementById('issues-table-body');
    
    // Clear the table
    tableBody.innerHTML = '';
    
    if (issues.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="empty-message">No issues found</td></tr>';
        return;
    }
    
    // Add rows for each issue
    issues.forEach(issue => {
        let priorityClass = '';
        if (issue.priority === 'High') {
            priorityClass = 'badge-danger';
        } else if (issue.priority === 'Medium') {
            priorityClass = 'badge-warning';
        } else {
            priorityClass = 'badge-info';
        }
        
        let statusClass = '';
        let statusLabel = '';
        if (issue.status === 'pending') {
            statusClass = 'badge-warning';
            statusLabel = 'Pending';
        } else if (issue.status === 'in_progress') {
            statusClass = 'badge-info';
            statusLabel = 'In Progress';
        } else {
            statusClass = 'badge-success';
            statusLabel = 'Completed';
        }
        
        tableBody.innerHTML += `
            <tr>
                <td>${issue.id}</td>
                <td>
                    <div class="customer-cell">
                        <div class="customer-icon">${getInitials(issue.customer)}</div>
                        <div class="customer-info">
                            <div class="customer-name">${issue.customer}</div>
                        </div>
                    </div>
                </td>
                <td>${issue.equipment}</td>
                <td>${issue.issue}</td>
                <td><span class="badge ${priorityClass}">${issue.priority}</span></td>
                <td><span class="badge ${statusClass}">${statusLabel}</span></td>
                <td>${issue.createdDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-issue" data-id="${issue.id}" title="View Details">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                        <button class="btn-icon edit-issue" data-id="${issue.id}" title="Edit Issue">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn-icon update-issue-status" data-id="${issue.id}" title="Update Status">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                <path d="M9 14l2 2 4-4"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    // Add event listeners for action buttons
    document.querySelectorAll('.view-issue').forEach(button => {
        button.addEventListener('click', function() {
            const issueId = this.getAttribute('data-id');
            showIssueDetails(issueId);
        });
    });
    
    document.querySelectorAll('.edit-issue').forEach(button => {
        button.addEventListener('click', function() {
            const issueId = this.getAttribute('data-id');
            showEditForm('issue', issueId);
        });
    });
    
    document.querySelectorAll('.update-issue-status').forEach(button => {
        button.addEventListener('click', function() {
            const issueId = this.getAttribute('data-id');
            const issue = issues.find(issue => issue.id === issueId);
            showStatusChangeForm('issue', issueId, issue.status);
        });
    });
}

/**
 * Initialize the alerts table
 */
function initAlertsTable() {
    const tableBody = document.getElementById('alerts-table-body');
    
    // Show loading message
    tableBody.innerHTML = '<tr><td colspan="8" class="loading-message">Loading alerts...</td></tr>';
    
    // Fetch alerts
    fetchAlerts();
}

/**
 * Fetch alerts from the API and populate the table
 */
async function fetchAlerts() {
    try {
        // Get filter values
        const statusFilter = document.getElementById('alerts-status-filter').value;
        const searchQuery = document.getElementById('alerts-search').value;
        
        // Fetch data
        const alerts = await window.AlertsAPI.fetchAlerts({
            filter: searchQuery,
            status: statusFilter
        });
        
        // Update the table
        updateAlertsTable(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        const tableBody = document.getElementById('alerts-table-body');
        tableBody.innerHTML = `<tr><td colspan="8" class="error-message">Error loading alerts: ${error.message}</td></tr>`;
    }
}

/**
 * Update the alerts table with data
 * @param {Array} alerts - Array of alert objects
 */
function updateAlertsTable(alerts) {
    const tableBody = document.getElementById('alerts-table-body');
    
    // Clear the table
    tableBody.innerHTML = '';
    
    if (alerts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="empty-message">No alerts found</td></tr>';
        return;
    }
    
    // Add rows for each alert
    alerts.forEach(alert => {
        let statusClass = alert.status === 'active' ? 'badge-danger' : 'badge-success';
        let statusLabel = alert.status === 'active' ? 'Active' : 'Resolved';
        
        tableBody.innerHTML += `
            <tr>
                <td>${alert.id}</td>
                <td>
                    <div class="customer-cell">
                        <div class="customer-icon">${getInitials(alert.customer)}</div>
                        <div class="customer-info">
                            <div class="customer-name">${alert.customer}</div>
                        </div>
                    </div>
                </td>
                <td>${alert.equipment}</td>
                <td>${alert.issue}</td>
                <td>${alert.date}</td>
                <td><span class="badge ${statusClass}">${statusLabel}</span></td>
                <td><span class="badge badge-danger">${alert.action}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-alert" data-id="${alert.id}" title="View Details">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                        <button class="btn-icon edit-alert" data-id="${alert.id}" title="Edit Alert">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn-icon resolve-alert ${alert.status === 'resolved' ? 'disabled' : ''}" data-id="${alert.id}" title="Resolve Alert" ${alert.status === 'resolved' ? 'disabled' : ''}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    // Add event listeners for action buttons
    document.querySelectorAll('.view-alert').forEach(button => {
        button.addEventListener('click', function() {
            const alertId = this.getAttribute('data-id');
            showAlertDetails(alertId);
        });
    });
    
    document.querySelectorAll('.edit-alert').forEach(button => {
        button.addEventListener('click', function() {
            const alertId = this.getAttribute('data-id');
            showEditForm('alert', alertId);
        });
    });
    
    document.querySelectorAll('.resolve-alert:not(.disabled)').forEach(button => {
        button.addEventListener('click', function() {
            const alertId = this.getAttribute('data-id');
            resolveAlert(alertId);
        });
    });
}

/**
 * Show issue details in the enhanced modal
 * @param {string} issueId - ID of the issue to display
 */
async function showIssueDetails(issueId) {
    try {
        const issue = await window.IssuesAPI.getIssue(issueId);
        const modal = document.getElementById('enhanced-detail-modal');
        
        // Set modal attributes
        modal.setAttribute('data-type', 'issue');
        modal.setAttribute('data-id', issueId);
        modal.setAttribute('data-status', issue.status);
        
        // Set modal title
        document.getElementById('enhanced-modal-title').textContent = `Issue Details: ${issueId}`;
        
        // Fill in issue details
        document.getElementById('id-value').textContent = issue.id;
        document.getElementById('customer-value').textContent = issue.customer;
        document.getElementById('date-value').textContent = issue.createdDate;
        document.getElementById('equipment-value').textContent = issue.equipment;
        
        let priorityHTML = issue.priority;
        if (issue.priority === 'High') {
            priorityHTML = `<span class="badge badge-danger">${issue.priority}</span>`;
        } else if (issue.priority === 'Medium') {
            priorityHTML = `<span class="badge badge-warning">${issue.priority}</span>`;
        } else {
            priorityHTML = `<span class="badge badge-info">${issue.priority}</span>`;
        }
        document.getElementById('priority-value').innerHTML = priorityHTML;
        
        document.getElementById('issue-value').textContent = issue.issue;
        document.getElementById('notes-value').textContent = issue.notes || 'No additional notes';
        
        // Display cost if available
        const costLabel = document.getElementById('cost-label');
        const costValue = document.getElementById('cost-value');
        const actionRow = document.getElementById('action-row');
        
        if (issue.estimatedCost) {
            costValue.textContent = issue.estimatedCost;
            actionRow.style.display = 'flex';
        } else {
            actionRow.style.display = 'none';
        }
        
        // Show appropriate status
        let statusHTML = '';
        if (issue.status === 'pending') {
            statusHTML = '<span class="badge badge-warning">Pending</span>';
        } else if (issue.status === 'in_progress') {
            statusHTML = '<span class="badge badge-info">In Progress</span>';
        } else {
            statusHTML = '<span class="badge badge-success">Completed</span>';
        }
        document.getElementById('status-value').innerHTML = statusHTML;
        
        // Set action button text based on status
        const actionBtn = document.getElementById('enhanced-modal-action-btn');
        if (issue.status === 'pending') {
            actionBtn.textContent = 'Mark In Progress';
        } else if (issue.status === 'in_progress') {
            actionBtn.textContent = 'Mark Completed';
        } else {
            actionBtn.textContent = 'Reopen Issue';
        }
        
        // Load the history and notes (mock data for now)
        loadMockHistory('issue', issueId);
        loadMockNotes('issue', issueId);
        
        // Show the first tab
        const tabButtons = modal.querySelectorAll('.modal-tab-button');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        tabButtons[0].classList.add('active');
        
        modal.querySelectorAll('.modal-tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById('details-tab').style.display = 'block';
        
        // Show the modal
        modal.classList.add('active');
    } catch (error) {
        console.error(`Error loading issue ${issueId}:`, error);
        alert(`Error loading issue details: ${error.message}`);
    }
}

/**
 * Show alert details in the enhanced modal
 * @param {string} alertId - ID of the alert to display
 */
async function showAlertDetails(alertId) {
    try {
        const alert = await window.AlertsAPI.getAlert(alertId);
        const modal = document.getElementById('enhanced-detail-modal');
        
        // Set modal attributes
        modal.setAttribute('data-type', 'alert');
        modal.setAttribute('data-id', alertId);
        modal.setAttribute('data-status', alert.status);
        
        // Set modal title
        document.getElementById('enhanced-modal-title').textContent = `Critical Alert: ${alertId}`;
        
        // Fill in alert details
        document.getElementById('id-value').textContent = alert.id;
        document.getElementById('customer-value').textContent = alert.customer;
        document.getElementById('date-value').textContent = alert.date;
        document.getElementById('equipment-value').textContent = alert.equipment;
        
        // Hide priority for alerts (they're all critical)
        document.getElementById('priority-label').style.display = 'none';
        document.getElementById('priority-value').style.display = 'none';
        
        document.getElementById('issue-value').textContent = alert.issue;
        document.getElementById('notes-value').textContent = alert.details || 'No additional details';
        
        // Show action and cost
        document.getElementById('action-label').textContent = 'Required Action';
        document.getElementById('action-value').innerHTML = `<span class="badge badge-danger">${alert.action}</span>`;
        document.getElementById('cost-label').textContent = 'Estimated Cost';
        document.getElementById('cost-value').textContent = alert.estimatedCost || 'Not estimated';
        document.getElementById('action-row').style.display = 'flex';
        
        // Show appropriate status
        let statusHTML = alert.status === 'active' ? 
            '<span class="badge badge-danger">Active</span>' : 
            '<span class="badge badge-success">Resolved</span>';
        document.getElementById('status-value').innerHTML = statusHTML;
        
        // Set action button text based on status
        const actionBtn = document.getElementById('enhanced-modal-action-btn');
        if (alert.status === 'active') {
            actionBtn.textContent = 'Mark Resolved';
        } else {
            actionBtn.textContent = 'Reactivate Alert';
            actionBtn.disabled = true; // Usually can't reactivate resolved alerts
        }
        
        // Load the history and notes (mock data for now)
        loadMockHistory('alert', alertId);
        loadMockNotes('alert', alertId);
        
        // Show the first tab
        const tabButtons = modal.querySelectorAll('.modal-tab-button');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        tabButtons[0].classList.add('active');
        
        modal.querySelectorAll('.modal-tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById('details-tab').style.display = 'block';
        
        // Show the modal
        modal.classList.add('active');
    } catch (error) {
        console.error(`Error loading alert ${alertId}:`, error);
        alert(`Error loading alert details: ${error.message}`);
    }
}

/**
 * Resolve an alert
 * @param {string} alertId - ID of the alert to resolve
 */
async function resolveAlert(alertId) {
    try {
        if (confirm('Are you sure you want to mark this alert as resolved?')) {
            await window.AlertsAPI.resolveAlert(alertId, {
                technician: 'Terry Jamison',
                notes: 'Alert resolved via dashboard'
            });
            
            // Refresh the alerts table
            fetchAlerts();
        }
    } catch (error) {
        console.error(`Error resolving alert ${alertId}:`, error);
        alert(`Error resolving alert: ${error.message}`);
    }
}

/**
 * Load mock history data for display in the modal
 * @param {string} itemType - Type of item ('issue' or 'alert')
 * @param {string} itemId - ID of the item
 */
function loadMockHistory(itemType, itemId) {
    const historyItems = document.getElementById('history-items');
    
    // Clear previous content
    historyItems.innerHTML = '';
    
    // Add mock history items
    const mockHistory = [
        {
            date: '2025-05-10 09:15',
            action: 'Created',
            user: 'Terry Jamison',
            details: `${itemType === 'issue' ? 'Issue' : 'Alert'} was created during PM inspection`
        },
        {
            date: '2025-05-10 11:30',
            action: 'Updated',
            user: 'Sarah Johnson',
            details: 'Priority updated from Medium to High'
        },
        {
            date: '2025-05-11 14:45',
            action: 'Status Change',
            user: 'Mike Davis',
            details: 'Status changed to In Progress'
        }
    ];
    
    mockHistory.forEach(item => {
        historyItems.innerHTML += `
            <div class="timeline-item">
                <div class="timeline-item-icon"></div>
                <div class="timeline-item-content">
                    <div class="timeline-item-header">
                        <span class="timeline-item-date">${item.date}</span>
                        <span class="timeline-item-action">${item.action}</span>
                    </div>
                    <div class="timeline-item-body">
                        <p>${item.details}</p>
                        <p class="timeline-item-user">By: ${item.user}</p>
                    </div>
                </div>
            </div>
        `;
    });
}

/**
 * Load mock notes data for display in the modal
 * @param {string} itemType - Type of item ('issue' or 'alert')
 * @param {string} itemId - ID of the item
 */
function loadMockNotes(itemType, itemId) {
    const notesList = document.getElementById('notes-list');
    
    // Clear previous content
    notesList.innerHTML = '';
    
    // Add mock notes
    const mockNotes = [
        {
            date: '2025-05-10 09:15',
            user: 'Terry Jamison',
            content: 'Initial inspection shows this will require parts ordering'
        },
        {
            date: '2025-05-11 14:45',
            user: 'Mike Davis',
            content: 'Called customer to discuss timeline for repairs'
        }
    ];
    
    mockNotes.forEach(note => {
        notesList.innerHTML += `
            <div class="note-item">
                <div class="note-header">
                    <span class="note-user">${note.user}</span>
                    <span class="note-date">${note.date}</span>
                </div>
                <div class="note-content">
                    <p>${note.content}</p>
                </div>
            </div>
        `;
    });
}

/**
 * Add event listeners for the issues tab
 */
function addIssuesEventListeners() {
    // Add issue button
    const addIssueBtn = document.getElementById('issues-add-btn');
    if (addIssueBtn) {
        addIssueBtn.addEventListener('click', function() {
            showCreateIssueForm();
        });
    }
    
    // Filter change events
    const priorityFilter = document.getElementById('issues-priority-filter');
    const statusFilter = document.getElementById('issues-status-filter');
    
    if (priorityFilter) {
        priorityFilter.addEventListener('change', fetchIssues);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', fetchIssues);
    }
    
    // Search input
    const searchInput = document.getElementById('issues-search');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                fetchIssues();
            }
        });
        
        const searchBtn = searchInput.nextElementSibling;
        if (searchBtn) {
            searchBtn.addEventListener('click', fetchIssues);
        }
    }
    
    // Sortable columns
    const sortableHeaders = document.querySelectorAll('#issues-table .sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const sortField = this.getAttribute('data-sort');
            const currentSort = this.getAttribute('data-sort-dir') || 'none';
            let newSort = 'asc';
            
            // Cycle through sort directions: none -> asc -> desc -> none
            if (currentSort === 'asc') {
                newSort = 'desc';
            } else if (currentSort === 'desc') {
                newSort = 'none';
            }
            
            // Clear sort indicators on all headers
            sortableHeaders.forEach(h => {
                h.removeAttribute('data-sort-dir');
                h.classList.remove('sort-asc', 'sort-desc');
            });
            
            // Set sort indicator on current header
            if (newSort !== 'none') {
                this.setAttribute('data-sort-dir', newSort);
                this.classList.add(`sort-${newSort}`);
            }
            
            // Fetch issues with sort
            fetchIssuesSorted(sortField, newSort);
        });
    });
}

/**
 * Fetch issues with sorting applied
 * @param {string} sortField - Field to sort by
 * @param {string} sortDirection - Sort direction ('asc', 'desc', or 'none')
 */
async function fetchIssuesSorted(sortField, sortDirection) {
    try {
        // Get filter values
        const priorityFilter = document.getElementById('issues-priority-filter').value;
        const statusFilter = document.getElementById('issues-status-filter').value;
        const searchQuery = document.getElementById('issues-search').value;
        
        // Determine sort parameter
        let sortParam = '';
        if (sortDirection === 'asc') {
            sortParam = sortField;
        } else if (sortDirection === 'desc') {
            sortParam = `-${sortField}`;
        } else {
            // Default sort if none specified
            sortParam = '-createdDate';
        }
        
        // Fetch data
        const issues = await window.IssuesAPI.fetchIssues({
            filter: searchQuery,
            priority: priorityFilter,
            status: statusFilter,
            sort: sortParam
        });
        
        // Update the table
        updateIssuesTable(issues);
    } catch (error) {
        console.error('Error fetching issues:', error);
        const tableBody = document.getElementById('issues-table-body');
        tableBody.innerHTML = `<tr><td colspan="8" class="error-message">Error loading issues: ${error.message}</td></tr>`;
    }
}

/**
 * Add event listeners for the alerts tab
 */
function addAlertsEventListeners() {
    // Add alert button
    const addAlertBtn = document.getElementById('alerts-add-btn');
    if (addAlertBtn) {
        addAlertBtn.addEventListener('click', function() {
            showCreateAlertForm();
        });
    }
    
    // Filter change events
    const statusFilter = document.getElementById('alerts-status-filter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', fetchAlerts);
    }
    
    // Search input
    const searchInput = document.getElementById('alerts-search');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                fetchAlerts();
            }
        });
        
        const searchBtn = searchInput.nextElementSibling;
        if (searchBtn) {
            searchBtn.addEventListener('click', fetchAlerts);
        }
    }
    
    // Sortable columns
    const sortableHeaders = document.querySelectorAll('#alerts-table .sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const sortField = this.getAttribute('data-sort');
            const currentSort = this.getAttribute('data-sort-dir') || 'none';
            let newSort = 'asc';
            
            // Cycle through sort directions: none -> asc -> desc -> none
            if (currentSort === 'asc') {
                newSort = 'desc';
            } else if (currentSort === 'desc') {
                newSort = 'none';
            }
            
            // Clear sort indicators on all headers
            sortableHeaders.forEach(h => {
                h.removeAttribute('data-sort-dir');
                h.classList.remove('sort-asc', 'sort-desc');
            });
            
            // Set sort indicator on current header
            if (newSort !== 'none') {
                this.setAttribute('data-sort-dir', newSort);
                this.classList.add(`sort-${newSort}`);
            }
            
            // Fetch alerts with sort
            fetchAlertsSorted(sortField, newSort);
        });
    });
}

/**
 * Fetch alerts with sorting applied
 * @param {string} sortField - Field to sort by
 * @param {string} sortDirection - Sort direction ('asc', 'desc', or 'none')
 */
async function fetchAlertsSorted(sortField, sortDirection) {
    try {
        // Get filter values
        const statusFilter = document.getElementById('alerts-status-filter').value;
        const searchQuery = document.getElementById('alerts-search').value;
        
        // Determine sort parameter
        let sortParam = '';
        if (sortDirection === 'asc') {
            sortParam = sortField;
        } else if (sortDirection === 'desc') {
            sortParam = `-${sortField}`;
        } else {
            // Default sort if none specified
            sortParam = '-date';
        }
        
        // Fetch data
        const alerts = await window.AlertsAPI.fetchAlerts({
            filter: searchQuery,
            status: statusFilter,
            sort: sortParam
        });
        
        // Update the table
        updateAlertsTable(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        const tableBody = document.getElementById('alerts-table-body');
        tableBody.innerHTML = `<tr><td colspan="8" class="error-message">Error loading alerts: ${error.message}</td></tr>`;
    }
}

/**
 * Show form to create a new issue
 */
function showCreateIssueForm() {
    alert('Create issue form would be shown here');
    // In a real implementation, this would show a form to create a new issue
}

/**
 * Show form to create a new alert
 */
function showCreateAlertForm() {
    alert('Create alert form would be shown here');
    // In a real implementation, this would show a form to create a new alert
}

/**
 * Get initials from a name for customer icons
 * @param {string} name - Full name
 * @returns {string} Initials (up to 2 characters)
 */
function getInitials(name) {
    if (!name) return 'XX';
    
    const parts = name.split(' ');
    if (parts.length === 1) {
        return name.substring(0, 2).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Link dashboard metrics to the appropriate report tabs
 */
function linkMetricsToTabs() {
    // Find the metric cards in the reports page
    const issuesMetricCard = document.querySelector('.stat-card:nth-child(3)');
    const alertsMetricCard = document.querySelector('.stat-card:nth-child(4)');
    
    // Add click event listeners to the metric cards
    if (issuesMetricCard) {
        issuesMetricCard.style.cursor = 'pointer';
        issuesMetricCard.addEventListener('click', function() {
            // Find and click the issues tab button
            const issuesTabButton = document.querySelector('.tab-button[data-tab="issues"]');
            if (issuesTabButton) {
                issuesTabButton.click();
            }
        });
    }
    
    if (alertsMetricCard) {
        alertsMetricCard.style.cursor = 'pointer';
        alertsMetricCard.addEventListener('click', function() {
            // Find and click the alerts tab button
            const alertsTabButton = document.querySelector('.tab-button[data-tab="alerts"]');
            if (alertsTabButton) {
                alertsTabButton.click();
            }
        });
    }
}

// Additional styles for the enhanced components
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    /* Enhanced Modal Styles */
    .modal-tabs {
        display: flex;
        border-bottom: 1px solid var(--gray);
        margin-bottom: var(--spacing-md);
    }
    
    .modal-tab-button {
        padding: var(--spacing-sm) var(--spacing-lg);
        background: none;
        border: none;
        font-weight: 500;
        color: var(--darker-gray);
        cursor: pointer;
        position: relative;
        transition: all var(--transition-fast) ease;
    }
    
    .modal-tab-button:hover {
        color: var(--primary);
    }
    
    .modal-tab-button.active {
        color: var(--primary);
    }
    
    .modal-tab-button.active::after {
        content: "";
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background-color: var(--primary);
    }
    
    .form-value-display {
        padding: var(--spacing-sm);
        background-color: var(--light-gray);
        border-radius: var(--radius-sm);
        min-height: 1.5rem;
    }
    
    /* Timeline Styles */
    .timeline {
        position: relative;
        padding-left: 2rem;
    }
    
    .timeline::before {
        content: "";
        position: absolute;
        left: 0.5rem;
        top: 0;
        bottom: 0;
        width: 2px;
        background-color: var(--gray);
    }
    
    .timeline-item {
        position: relative;
        margin-bottom: var(--spacing-md);
    }
    
    .timeline-item-icon {
        position: absolute;
        left: -2rem;
        top: 0.25rem;
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        background-color: var(--primary);
        z-index: 1;
    }
    
    .timeline-item-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--spacing-xs);
    }
    
    .timeline-item-date {
        font-size: 0.8rem;
        color: var(--dark-gray);
    }
    
    .timeline-item-action {
        font-weight: 600;
        color: var(--primary);
    }
    
    .timeline-item-body {
        background-color: var(--light-gray);
        padding: var(--spacing-sm);
        border-radius: var(--radius-sm);
    }
    
    .timeline-item-body p {
        margin: 0 0 var(--spacing-xs) 0;
    }
    
    .timeline-item-user {
        font-size: 0.8rem;
        color: var(--dark-gray);
        font-style: italic;
    }
    
    /* Notes Styles */
    .notes-container {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }
    
    .notes-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
        max-height: 300px;
        overflow-y: auto;
    }
    
    .note-item {
        background-color: var(--light-gray);
        padding: var(--spacing-sm);
        border-radius: var(--radius-sm);
    }
    
    .note-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--spacing-xs);
    }
    
    .note-user {
        font-weight: 600;
    }
    
    .note-date {
        font-size: 0.8rem;
        color: var(--dark-gray);
    }
    
    .note-content p {
        margin: 0;
    }
    
    .add-note-form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }
    
    /* Enhanced Form Elements */
    .form-row {
        display: flex;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-md);
    }
    
    .form-group {
        margin-bottom: var(--spacing-md);
        flex: 1;
    }
    
    /* Filter Controls */
    .filter-controls {
        display: flex;
        gap: var(--spacing-sm);
    }
    
    /* Sortable Table Headers */
    .sortable {
        cursor: pointer;
        position: relative;
        padding-right: 1.5rem !important;
    }
    
    .sortable::after {
        content: "↕️";
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.75rem;
        opacity: 0.5;
    }
    
    .sortable.sort-asc::after {
        content: "↑";
        opacity: 1;
    }
    
    .sortable.sort-desc::after {
        content: "↓";
        opacity: 1;
    }
    
    /* Loading and Error Messages */
    .loading-message,
    .error-message,
    .empty-message {
        text-align: center;
        padding: var(--spacing-lg);
        color: var(--dark-gray);
    }
    
    .error-message {
        color: var(--danger);
    }
    
    /* Enhanced Button States */
    .btn-icon.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    /* Table Container with Horizontal Scroll */
    .table-container {
        overflow-x: auto;
        width: 100%;
    }
`;

// Append the styles to the head when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    document.head.appendChild(enhancedStyles);
});