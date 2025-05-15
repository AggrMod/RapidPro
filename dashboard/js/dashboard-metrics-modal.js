/**
 * Dashboard Metrics Modal Enhancement
 * Converts all metric cards and detail views to use the modal system
 */

document.addEventListener('DOMContentLoaded', function() {
    // Ensure modal system is loaded
    if (typeof window.modalManager === 'undefined') {
        console.warn('Modal system not loaded yet. Loading now...');
        
        // Try to load modal system
        const modalScript = document.createElement('script');
        modalScript.src = 'js/modal-system.js';
        modalScript.onload = initializeMetricsModal;
        document.body.appendChild(modalScript);
    } else {
        // Modal system already loaded, initialize
        initializeMetricsModal();
    }
});

/**
 * Initialize metrics modal functionality
 */
function initializeMetricsModal() {
    // Get all metric cards across the dashboard
    convertMetricCardsToModals();
    
    // Override any existing metric detail views
    overrideMetricDetailViews();
    
    console.log('Dashboard metrics modal system initialized');
}

/**
 * Convert all metric cards to use modals
 */
function convertMetricCardsToModals() {
    // Target all metric cards, summary cards, and dashboard cards that show data
    const metricSelectors = [
        '.metric-card',
        '.summary-card',
        '.dashboard-card[data-detail-url]',
        '.chart-card',
        '.data-card',
        '.stats-card',
        '[data-metric-detail]'
    ];
    
    // Find all elements matching the selectors
    const metricCards = document.querySelectorAll(metricSelectors.join(', '));
    
    metricCards.forEach(card => {
        // Skip if already converted
        if (card.getAttribute('data-modal-converted')) return;
        
        // Mark as converted
        card.setAttribute('data-modal-converted', 'true');
        
        // Make sure it's clickable
        card.classList.add('clickable');
        
        // Get detail URL or content ID
        const detailUrl = card.getAttribute('href') || 
                          card.getAttribute('data-detail-url') || 
                          card.getAttribute('data-metric-detail');
        
        // Get title from card
        const title = card.getAttribute('data-title') || 
                      (card.querySelector('h3') ? card.querySelector('h3').textContent : '') ||
                      (card.querySelector('h2') ? card.querySelector('h2').textContent : '') ||
                      'Metric Details';
        
        // Remove existing href to prevent navigation
        if (card.tagName === 'A') {
            card.removeAttribute('href');
        }
        
        // Add click event to show modal
        card.addEventListener('click', function(e) {
            e.preventDefault();
            
            // If detail URL is an element ID, show that content in a modal
            if (detailUrl && detailUrl.startsWith('#')) {
                const contentElement = document.querySelector(detailUrl);
                if (contentElement) {
                    showMetricDetailModal(title, contentElement.innerHTML);
                }
            } 
            // If detail URL is a URL, show in iframe modal
            else if (detailUrl && (detailUrl.startsWith('http') || detailUrl.startsWith('/'))) {
                showMetricDetailIframeModal(title, detailUrl);
            }
            // Otherwise generate content based on the card itself
            else {
                const content = generateMetricModalContent(card);
                showMetricDetailModal(title, content);
            }
        });
    });
}

/**
 * Generate metric modal content based on a card
 * @param {HTMLElement} card - The metric card element
 * @returns {string} HTML content for the modal
 */
function generateMetricModalContent(card) {
    // Get metric value
    const metricValue = card.querySelector('.summary-number') || 
                        card.querySelector('.metric-value') || 
                        card.querySelector('.value');
    
    // Get metric status
    const metricStatus = card.querySelector('.summary-status') || 
                         card.querySelector('.metric-status') || 
                         card.querySelector('.status');
    
    // Get metric icon
    const metricIcon = card.querySelector('.summary-icon') || 
                       card.querySelector('.metric-icon') || 
                       card.querySelector('.icon');
    
    // Generate content
    let content = '<div class="metric-detail-content">';
    
    // Add header
    content += '<div class="metric-detail-header">';
    if (metricIcon) {
        content += `<div class="metric-detail-icon">${metricIcon.innerHTML}</div>`;
    }
    content += '</div>';
    
    // Add main metric value
    content += '<div class="metric-detail-main">';
    if (metricValue) {
        content += `<div class="metric-detail-value">${metricValue.textContent}</div>`;
    }
    if (metricStatus) {
        content += `<div class="metric-detail-status">${metricStatus.textContent}</div>`;
    }
    content += '</div>';
    
    // Add chart placeholder if this is likely a chart card
    if (card.classList.contains('chart-card') || 
        card.querySelector('.chart-container') || 
        card.querySelector('canvas')) {
        content += `
            <div class="metric-detail-chart">
                <canvas id="modal-detail-chart" width="600" height="300"></canvas>
            </div>
        `;
    }
    
    // Add data table
    content += `
        <div class="metric-detail-table">
            <h3>Detailed Breakdown</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Count</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Equipment Inspections</td>
                        <td>24</td>
                        <td><span class="badge badge-success">Compliant</span></td>
                    </tr>
                    <tr>
                        <td>Temperature Checks</td>
                        <td>48</td>
                        <td><span class="badge badge-success">Compliant</span></td>
                    </tr>
                    <tr>
                        <td>Filter Replacements</td>
                        <td>16</td>
                        <td><span class="badge badge-success">Compliant</span></td>
                    </tr>
                    <tr>
                        <td>Condenser Cleaning</td>
                        <td>12</td>
                        <td><span class="badge badge-warning">Due Soon</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    // Add actions
    content += `
        <div class="metric-detail-actions">
            <button class="btn-primary export-detail-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export Data
            </button>
            <button class="btn-outline print-detail-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Print
            </button>
        </div>
    `;
    
    content += '</div>';
    
    // Add styles
    content += `
        <style>
            .metric-detail-content {
                padding: 0;
            }
            .metric-detail-header {
                display: flex;
                align-items: center;
                margin-bottom: 1rem;
            }
            .metric-detail-icon {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background-color: #f3f4f6;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 1rem;
            }
            .metric-detail-main {
                display: flex;
                align-items: baseline;
                margin-bottom: 1.5rem;
            }
            .metric-detail-value {
                font-size: 2.5rem;
                font-weight: 700;
                margin-right: 1rem;
            }
            .metric-detail-status {
                font-size: 1rem;
                color: #6b7280;
            }
            .metric-detail-chart {
                margin-bottom: 1.5rem;
                border: 1px solid #e5e7eb;
                border-radius: 0.375rem;
                padding: 1rem;
                background-color: #f9fafb;
            }
            .metric-detail-table {
                margin-bottom: 1.5rem;
            }
            .metric-detail-table h3 {
                font-size: 1.25rem;
                margin-bottom: 0.75rem;
            }
            .metric-detail-actions {
                display: flex;
                gap: 0.75rem;
                justify-content: flex-end;
            }
            .badge {
                display: inline-block;
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
                font-weight: 500;
                border-radius: 0.25rem;
            }
            .badge-success {
                background-color: #d1fae5;
                color: #065f46;
            }
            .badge-warning {
                background-color: #fef3c7;
                color: #92400e;
            }
            .data-table {
                width: 100%;
                border-collapse: collapse;
            }
            .data-table th, .data-table td {
                padding: 0.75rem;
                text-align: left;
                border-bottom: 1px solid #e5e7eb;
            }
            .data-table th {
                background-color: #f9fafb;
                font-weight: 500;
            }
        </style>
    `;
    
    return content;
}

/**
 * Show metric detail in a modal
 * @param {string} title - The title for the modal
 * @param {string} content - The HTML content for the modal
 */
function showMetricDetailModal(title, content) {
    // Create buttons for the modal
    const buttons = [
        {
            text: 'Close',
            action: 'close',
            type: 'secondary'
        }
    ];
    
    // Use modal manager to show the content
    const modalId = window.modalManager.openHtmlModal(title, content, {
        size: 'default',
        buttons: buttons
    });
    
    // Check if we need to initialize a chart
    setTimeout(() => {
        const chartCanvas = document.getElementById('modal-detail-chart');
        if (chartCanvas && typeof Chart !== 'undefined') {
            initializeModalChart(chartCanvas);
        }
        
        // Add event listeners for export and print buttons
        const exportBtn = document.querySelector('.export-detail-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                alert('Exporting data... This would download a CSV or Excel file in a real implementation.');
            });
        }
        
        const printBtn = document.querySelector('.print-detail-btn');
        if (printBtn) {
            printBtn.addEventListener('click', function() {
                alert('Printing... This would open the print dialog in a real implementation.');
            });
        }
    }, 100);
}

/**
 * Show metric detail in an iframe modal
 * @param {string} title - The title for the modal
 * @param {string} url - The URL to load in the iframe
 */
function showMetricDetailIframeModal(title, url) {
    window.modalManager.openIframeModal(title, url, {
        size: 'default'
    });
}

/**
 * Initialize a chart in the modal
 * @param {HTMLElement} canvas - The canvas element for the chart
 */
function initializeModalChart(canvas) {
    // Create a new chart
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Completed PMs',
                data: [12, 19, 16, 15, 20, 18],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Override any existing metric detail views
 */
function overrideMetricDetailViews() {
    // Check for existing detail view function
    if (typeof window.showMetricDetail === 'function') {
        const originalShowMetricDetail = window.showMetricDetail;
        
        // Override with our modal version
        window.showMetricDetail = function(title, detailId) {
            const detailElement = document.getElementById(detailId);
            
            if (detailElement) {
                showMetricDetailModal(title, detailElement.innerHTML);
            } else {
                // Fall back to original if element not found
                originalShowMetricDetail(title, detailId);
            }
        };
    }
    
    // Override any dashboard-metrics.js showDetailView function
    if (typeof window.showDetailView === 'function') {
        const originalShowDetailView = window.showDetailView;
        
        // Override with our modal version
        window.showDetailView = function(metricId) {
            const metricCard = document.querySelector(`[data-metric-id="${metricId}"]`);
            
            if (metricCard) {
                const title = metricCard.querySelector('h3') ? 
                              metricCard.querySelector('h3').textContent : 
                              'Metric Details';
                              
                const content = generateMetricModalContent(metricCard);
                showMetricDetailModal(title, content);
            } else {
                // Fall back to original if element not found
                originalShowDetailView(metricId);
            }
        };
    }
}