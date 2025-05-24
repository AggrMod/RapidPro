/**
 * Dashboard Metrics - Handles data storage, retrieval, and display for dashboard metrics
 * Provides clickable metrics with detailed view modals
 */

// Initial metrics data store (will be updated from API data when available)
let metricsData = {
    completedPMs: {
        count: 35,
        change: '+12%',
        trend: 'positive',
        details: [
            { id: 'RPM-2025-0512', customer: 'Memphis Grill', date: 'May 10, 2025', tech: 'Terry Jamison' },
            { id: 'RPM-2025-0511', customer: 'Riverside Catering', date: 'May 10, 2025', tech: 'Terry Jamison' },
            { id: 'RPM-2025-0510', customer: 'Blues & BBQ', date: 'May 9, 2025', tech: 'Sarah Johnson' },
            { id: 'RPM-2025-0509', customer: 'Cooper-Young Gastropub', date: 'May 8, 2025', tech: 'Mike Davis' },
            { id: 'RPM-2025-0508', customer: 'Grand Hotel Memphis', date: 'May 8, 2025', tech: 'Terry Jamison' },
            { id: 'RPM-2025-0507', customer: 'Downtown Cafe', date: 'May 7, 2025', tech: 'Sarah Johnson' },
            { id: 'RPM-2025-0506', customer: 'Beale Street Kitchen', date: 'May 6, 2025', tech: 'Mike Davis' },
            { id: 'RPM-2025-0505', customer: 'Fresh Start Bakery', date: 'May 5, 2025', tech: 'Terry Jamison' },
            // Add more entries to represent 35 total
        ],
        chartData: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            values: [8, 9, 10, 8]
        }
    },
    equipmentCompliance: {
        rate: '96%',
        change: '+3%',
        trend: 'positive',
        details: [
            { category: 'Refrigeration', compliance: '98%', total: 156, compliant: 153 },
            { category: 'Cooking Equipment', compliance: '95%', total: 98, compliant: 93 },
            { category: 'HVAC Systems', compliance: '92%', total: 75, compliant: 69 },
            { category: 'Plumbing Fixtures', compliance: '99%', total: 210, compliant: 208 },
            { category: 'Dishwashing Equipment', compliance: '97%', total: 68, compliant: 66 }
        ],
        chartData: {
            labels: ['Refrigeration', 'Cooking', 'HVAC', 'Plumbing', 'Dishwashing'],
            values: [98, 95, 92, 99, 97]
        }
    },
    issuesRequiringFollowup: {
        count: 14,
        change: '+3',
        trend: 'negative',
        details: [
            { id: 'ISS-2025-0014', customer: 'Fresh Start Bakery', equipment: 'Walk-in Cooler', issue: 'Door gasket requires replacement', priority: 'Medium', date: 'May 5, 2025' },
            { id: 'ISS-2025-0013', customer: 'Beale Street Kitchen', equipment: 'Range Hood', issue: 'Excessive grease buildup in filters', priority: 'High', date: 'May 6, 2025' },
            { id: 'ISS-2025-0012', customer: 'Cooper-Young Gastropub', equipment: 'Ice Machine', issue: 'Scale buildup affecting production', priority: 'Medium', date: 'May 8, 2025' },
            { id: 'ISS-2025-0011', customer: 'Downtown Cafe', equipment: 'Dish Machine', issue: 'Temperature not reaching sanitizing level', priority: 'High', date: 'May 7, 2025' },
            { id: 'ISS-2025-0010', customer: 'Blues & BBQ', equipment: 'Prep Table', issue: 'Not maintaining safe food temperature', priority: 'High', date: 'May 9, 2025' },
            { id: 'ISS-2025-0009', customer: 'Memphis Grill', equipment: 'Reach-in Freezer', issue: 'Intermittent temperature fluctuations', priority: 'Medium', date: 'May 10, 2025' },
            { id: 'ISS-2025-0008', customer: 'Grand Hotel Memphis', equipment: 'HVAC System', issue: 'Condenser coil requires cleaning', priority: 'Low', date: 'May 8, 2025' },
            { id: 'ISS-2025-0007', customer: 'Riverside Catering', equipment: 'Deep Fryer', issue: 'Oil filtration system malfunction', priority: 'Medium', date: 'May 10, 2025' },
            // Add more entries to represent 14 total
        ],
        chartData: {
            labels: ['High', 'Medium', 'Low'],
            values: [5, 7, 2]
        }
    },
    criticalAlerts: {
        count: 5,
        change: '+2',
        trend: 'negative',
        details: [
            { id: 'ALT-2025-0005', customer: 'Beale Street Kitchen', equipment: 'Walk-in Freezer', issue: 'Compressor failure imminent', date: 'May 6, 2025', action: 'Schedule emergency service' },
            { id: 'ALT-2025-0004', customer: 'Downtown Cafe', equipment: 'Dish Machine', issue: 'Sanitizer pump failure', date: 'May 7, 2025', action: 'Replace sanitizer pump' },
            { id: 'ALT-2025-0003', customer: 'Blues & BBQ', equipment: 'Prep Table', issue: 'Refrigeration failure', date: 'May 9, 2025', action: 'Replace compressor' },
            { id: 'ALT-2025-0002', customer: 'Fresh Start Bakery', equipment: 'Convection Oven', issue: 'Gas leak detected', date: 'May 5, 2025', action: 'Shut down equipment, emergency repair' },
            { id: 'ALT-2025-0001', customer: 'Cooper-Young Gastropub', equipment: 'Exhaust Hood', issue: 'Fire suppression system fault', date: 'May 8, 2025', action: 'Immediate service required' }
        ],
        chartData: {
            labels: ['Equipment Failure', 'Safety Hazard', 'Health Code Risk'],
            values: [2, 2, 1]
        }
    }
};

/**
 * Initialize dashboard metrics with click handlers
 */
function initializeMetrics() {
    // Set up event listeners for metric cards
    setupMetricClickHandlers();
    
    // Create the modal container if it doesn't exist
    createModalContainer();
    
    // Sync metrics data with issues and alerts APIs if available
    syncMetricsData();
}

/**
 * Synchronize metrics data with issues and alerts APIs
 */
async function syncMetricsData() {
    try {
        // Only proceed if the API objects are available
        if (window.IssuesAPI && window.AlertsAPI) {
            // Fetch issues data
            const issuesData = await window.IssuesAPI.fetchIssues({
                status: 'pending'  // Only get pending issues that require follow-up
            });
            
            // Update issues metric count and details
            if (issuesData && Array.isArray(issuesData)) {
                metricsData.issuesRequiringFollowup.count = issuesData.length;
                
                // Update stat card display
                const issuesCard = document.querySelector('.stat-card:nth-child(3) .stat-number');
                if (issuesCard) {
                    issuesCard.textContent = issuesData.length;
                }
                
                // Update issue details
                if (issuesData.length > 0) {
                    metricsData.issuesRequiringFollowup.details = issuesData.map(issue => ({
                        id: issue.id,
                        customer: issue.customer,
                        equipment: issue.equipment,
                        issue: issue.issue,
                        priority: issue.priority,
                        date: issue.createdDate
                    }));
                    
                    // Update chart data
                    const priorityCounts = {
                        'High': 0,
                        'Medium': 0,
                        'Low': 0
                    };
                    
                    issuesData.forEach(issue => {
                        if (issue.priority in priorityCounts) {
                            priorityCounts[issue.priority]++;
                        }
                    });
                    
                    metricsData.issuesRequiringFollowup.chartData.values = [
                        priorityCounts['High'],
                        priorityCounts['Medium'],
                        priorityCounts['Low']
                    ];
                }
            }
            
            // Fetch alerts data
            const alertsData = await window.AlertsAPI.fetchAlerts({
                status: 'active'  // Only get active alerts
            });
            
            // Update alerts metric count and details
            if (alertsData && Array.isArray(alertsData)) {
                metricsData.criticalAlerts.count = alertsData.length;
                
                // Update stat card display
                const alertsCard = document.querySelector('.stat-card:nth-child(4) .stat-number');
                if (alertsCard) {
                    alertsCard.textContent = alertsData.length;
                }
                
                // Update alert details
                if (alertsData.length > 0) {
                    metricsData.criticalAlerts.details = alertsData.map(alert => ({
                        id: alert.id,
                        customer: alert.customer,
                        equipment: alert.equipment,
                        issue: alert.issue,
                        date: alert.date,
                        action: alert.action
                    }));
                    
                    // Update chart data by categorizing alerts
                    const categoryCounts = {
                        'Equipment Failure': 0,
                        'Safety Hazard': 0,
                        'Health Code Risk': 0
                    };
                    
                    // Simple categorization based on keywords
                    alertsData.forEach(alert => {
                        if (alert.issue.toLowerCase().includes('failure') || 
                            alert.issue.toLowerCase().includes('malfunction')) {
                            categoryCounts['Equipment Failure']++;
                        } else if (alert.issue.toLowerCase().includes('leak') || 
                                 alert.issue.toLowerCase().includes('fire') ||
                                 alert.issue.toLowerCase().includes('suppression')) {
                            categoryCounts['Safety Hazard']++;
                        } else {
                            categoryCounts['Health Code Risk']++;
                        }
                    });
                    
                    metricsData.criticalAlerts.chartData.values = [
                        categoryCounts['Equipment Failure'],
                        categoryCounts['Safety Hazard'],
                        categoryCounts['Health Code Risk']
                    ];
                }
            }
            
            console.log('Metrics data synchronized with issues and alerts APIs');
        }
    } catch (error) {
        console.error('Error synchronizing metrics data:', error);
    }
}

/**
 * Set up click event handlers for metric cards
 */
function setupMetricClickHandlers() {
    // Completed PMs
    const completedPMsCard = document.querySelector('.stat-card:nth-child(1)');
    if (completedPMsCard) {
        completedPMsCard.style.cursor = 'pointer';
        completedPMsCard.addEventListener('click', () => showMetricDetail('completedPMs'));
    }
    
    // Equipment Compliance Rate
    const complianceRateCard = document.querySelector('.stat-card:nth-child(2)');
    if (complianceRateCard) {
        complianceRateCard.style.cursor = 'pointer';
        complianceRateCard.addEventListener('click', () => showMetricDetail('equipmentCompliance'));
    }
    
    // Issues Requiring Follow-up
    const issuesCard = document.querySelector('.stat-card:nth-child(3)');
    if (issuesCard) {
        issuesCard.style.cursor = 'pointer';
        issuesCard.addEventListener('click', () => showMetricDetail('issuesRequiringFollowup'));
    }
    
    // Critical Equipment Alerts
    const alertsCard = document.querySelector('.stat-card:nth-child(4)');
    if (alertsCard) {
        alertsCard.style.cursor = 'pointer';
        alertsCard.addEventListener('click', () => showMetricDetail('criticalAlerts'));
    }
}

/**
 * Create modal container for metric details
 */
function createModalContainer() {
    // Check if modal container already exists
    if (document.getElementById('metric-detail-modal')) {
        return;
    }
    
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'metric-detail-modal';
    modalContainer.className = 'modal';
    
    // Add modal content structure
    modalContainer.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modal-title">Metric Details</h2>
                <button class="modal-close" id="close-modal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div id="modal-chart-container" class="chart-container">
                    <canvas id="modal-chart"></canvas>
                </div>
                <div id="modal-content"></div>
            </div>
            <div class="modal-footer">
                <button class="btn-outline" id="modal-close-btn">Close</button>
                <button class="btn-primary" id="modal-action-btn">View All</button>
            </div>
        </div>
    `;
    
    // Add to the body
    document.body.appendChild(modalContainer);
    
    // Set up event listeners for modal closing
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    modalContainer.addEventListener('click', function(event) {
        if (event.target === modalContainer) {
            closeModal();
        }
    });
}

/**
 * Show metric detail modal
 * @param {string} metricType - Type of metric to display
 */
function showMetricDetail(metricType) {
    // Check if we should navigate directly to tab for certain metrics
    if (metricType === 'issuesRequiringFollowup' || metricType === 'criticalAlerts') {
        // For issues and alerts, navigate directly to the corresponding tab instead of showing the modal
        const tabName = metricType === 'issuesRequiringFollowup' ? 'issues' : 'alerts';
        const tabButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
        
        if (tabButton) {
            // Click the tab button to show the corresponding tab
            tabButton.click();
            return; // Exit early to avoid showing the modal
        }
    }
    
    // Otherwise, proceed with showing the modal
    const modal = document.getElementById('metric-detail-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const actionBtn = document.getElementById('modal-action-btn');
    
    // Set modal title based on metric type
    if (metricType === 'completedPMs') {
        modalTitle.textContent = 'Completed PMs This Month';
    } else if (metricType === 'equipmentCompliance') {
        modalTitle.textContent = 'Equipment Compliance Rate';
    } else if (metricType === 'issuesRequiringFollowup') {
        modalTitle.textContent = 'Issues Requiring Follow-up';
    } else if (metricType === 'criticalAlerts') {
        modalTitle.textContent = 'Critical Equipment Alerts';
    }
    
    // Generate content based on metric type
    let contentHtml = '';
    
    if (metricType === 'completedPMs') {
        contentHtml = generateCompletedPMsContent();
        actionBtn.textContent = 'View All PM Reports';
    } else if (metricType === 'equipmentCompliance') {
        contentHtml = generateComplianceRateContent();
        actionBtn.textContent = 'View Equipment Reports';
    } else if (metricType === 'issuesRequiringFollowup') {
        contentHtml = generateIssuesRequiringFollowupContent();
        actionBtn.textContent = 'View All Issues';
    } else if (metricType === 'criticalAlerts') {
        contentHtml = generateCriticalAlertsContent();
        actionBtn.textContent = 'View All Alerts';
    }
    
    // Set content
    modalContent.innerHTML = contentHtml;
    
    // Generate chart
    generateChart(metricType);
    
    // Set action button onclick to appropriate destination
    actionBtn.onclick = function() {
        if (metricType === 'completedPMs') {
            window.location.href = 'reports.html?tab=pm-reports';
        } else if (metricType === 'equipmentCompliance') {
            window.location.href = 'reports.html?tab=equipment-reports';
        } else if (metricType === 'issuesRequiringFollowup') {
            window.location.href = 'reports.html?tab=issues';
        } else if (metricType === 'criticalAlerts') {
            window.location.href = 'reports.html?tab=alerts';
        }
    };
    
    // Show the modal
    modal.classList.add('active');
}

/**
 * Generate content for completed PMs metric
 */
function generateCompletedPMsContent() {
    const data = metricsData.completedPMs;
    
    let html = `
        <div class="metric-summary">
            <div class="metric-value">${data.count}</div>
            <div class="metric-label">Completed PMs This Month</div>
            <div class="metric-change ${data.trend}">${data.change} from last month</div>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Report ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Technician</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Add rows for each completed PM
    data.details.forEach(pm => {
        html += `
            <tr>
                <td>${pm.id}</td>
                <td>${pm.customer}</td>
                <td>${pm.date}</td>
                <td>${pm.tech}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" title="View Report">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                        <button class="btn-icon" title="Download PDF">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

/**
 * Generate content for equipment compliance rate metric
 */
function generateComplianceRateContent() {
    const data = metricsData.equipmentCompliance;
    
    let html = `
        <div class="metric-summary">
            <div class="metric-value">${data.rate}</div>
            <div class="metric-label">Equipment Compliance Rate</div>
            <div class="metric-change ${data.trend}">${data.change} from last month</div>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Compliance Rate</th>
                        <th>Equipment Count</th>
                        <th>Compliant</th>
                        <th>Non-Compliant</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Add rows for each equipment category
    data.details.forEach(category => {
        const nonCompliant = category.total - category.compliant;
        html += `
            <tr>
                <td>${category.category}</td>
                <td>${category.compliance}</td>
                <td>${category.total}</td>
                <td>${category.compliant}</td>
                <td>${nonCompliant}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

/**
 * Generate content for issues requiring follow-up metric
 */
function generateIssuesRequiringFollowupContent() {
    const data = metricsData.issuesRequiringFollowup;
    
    let html = `
        <div class="metric-summary">
            <div class="metric-value">${data.count}</div>
            <div class="metric-label">Issues Requiring Follow-up</div>
            <div class="metric-change ${data.trend}">${data.change} from last month</div>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Issue ID</th>
                        <th>Customer</th>
                        <th>Equipment</th>
                        <th>Issue</th>
                        <th>Priority</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Add rows for each issue
    data.details.forEach(issue => {
        let priorityClass = '';
        if (issue.priority === 'High') {
            priorityClass = 'badge-danger';
        } else if (issue.priority === 'Medium') {
            priorityClass = 'badge-warning';
        } else {
            priorityClass = 'badge-info';
        }
        
        html += `
            <tr>
                <td>${issue.id}</td>
                <td>${issue.customer}</td>
                <td>${issue.equipment}</td>
                <td>${issue.issue}</td>
                <td><span class="badge ${priorityClass}">${issue.priority}</span></td>
                <td>${issue.date}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

/**
 * Generate content for critical equipment alerts metric
 */
function generateCriticalAlertsContent() {
    const data = metricsData.criticalAlerts;
    
    let html = `
        <div class="metric-summary">
            <div class="metric-value">${data.count}</div>
            <div class="metric-label">Critical Equipment Alerts</div>
            <div class="metric-change ${data.trend}">${data.change} from last month</div>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Alert ID</th>
                        <th>Customer</th>
                        <th>Equipment</th>
                        <th>Issue</th>
                        <th>Date</th>
                        <th>Required Action</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Add rows for each alert
    data.details.forEach(alert => {
        html += `
            <tr>
                <td>${alert.id}</td>
                <td>${alert.customer}</td>
                <td>${alert.equipment}</td>
                <td>${alert.issue}</td>
                <td>${alert.date}</td>
                <td><span class="badge badge-danger">${alert.action}</span></td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

/**
 * Generate chart for metric details
 * @param {string} metricType - Type of metric to display
 */
function generateChart(metricType) {
    const chartCanvas = document.getElementById('modal-chart');
    const chartContainer = document.getElementById('modal-chart-container');
    
    if (!chartCanvas || !chartContainer) {
        return;
    }
    
    // Get chart data based on metric type
    let chartData = null;
    let chartTitle = '';
    let chartType = 'bar';
    
    if (metricType === 'completedPMs') {
        chartData = metricsData.completedPMs.chartData;
        chartTitle = 'PMs Completed by Week';
    } else if (metricType === 'equipmentCompliance') {
        chartData = metricsData.equipmentCompliance.chartData;
        chartTitle = 'Compliance Rate by Equipment Type (%)';
    } else if (metricType === 'issuesRequiringFollowup') {
        chartData = metricsData.issuesRequiringFollowup.chartData;
        chartTitle = 'Issues by Priority';
        chartType = 'pie';
    } else if (metricType === 'criticalAlerts') {
        chartData = metricsData.criticalAlerts.chartData;
        chartTitle = 'Critical Alerts by Category';
        chartType = 'pie';
    }
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        chartContainer.innerHTML = `<div class="chart-fallback">
            <p>Chart visualization requires Chart.js library.</p>
            <p>Chart Title: ${chartTitle}</p>
            <p>Data: ${JSON.stringify(chartData)}</p>
        </div>`;
        return;
    }
    
    // Reset canvas for new chart
    chartCanvas.getContext('2d').clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    
    // Create chart configuration
    const chartConfig = {
        type: chartType,
        data: {
            labels: chartData.labels,
            datasets: [{
                label: chartTitle,
                data: chartData.values,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 99, 132, 0.7)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: chartTitle
                }
            }
        }
    };
    
    // Create the chart
    new Chart(chartCanvas, chartConfig);
    
    // Add export button after chart is created
    addExportButton(metricType, chartContainer);
}

/**
 * Add export button to the chart container
 * @param {string} metricType - Type of metric
 * @param {HTMLElement} container - Chart container element
 */
function addExportButton(metricType, container) {
    // Check if export button already exists
    if (container.querySelector('.export-controls')) {
        return;
    }
    
    // Create export controls
    const exportControls = document.createElement('div');
    exportControls.className = 'export-controls';
    exportControls.innerHTML = `
        <button class="btn-outline export-data" title="Export Data">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Data
        </button>
        <div class="export-format-dropdown">
            <button class="export-csv" data-format="csv">CSV</button>
            <button class="export-excel" data-format="excel">Excel</button>
            <button class="export-pdf" data-format="pdf">PDF</button>
        </div>
    `;
    
    // Add the export controls to the container
    container.appendChild(exportControls);
    
    // Add event listeners for export buttons
    const exportDataBtn = exportControls.querySelector('.export-data');
    const formatDropdown = exportControls.querySelector('.export-format-dropdown');
    
    exportDataBtn.addEventListener('click', function() {
        formatDropdown.classList.toggle('active');
    });
    
    // Add event listeners for format buttons
    const formatButtons = formatDropdown.querySelectorAll('button');
    formatButtons.forEach(button => {
        button.addEventListener('click', function() {
            const format = this.getAttribute('data-format');
            exportMetricData(metricType, format);
            formatDropdown.classList.remove('active');
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!exportControls.contains(event.target)) {
            formatDropdown.classList.remove('active');
        }
    });
}

/**
 * Export metric data in the specified format
 * @param {string} metricType - Type of metric to export
 * @param {string} format - Export format (csv, excel, pdf)
 */
function exportMetricData(metricType, format) {
    // Get appropriate data based on metric type
    let data = null;
    let fileName = '';
    
    if (metricType === 'completedPMs') {
        data = metricsData.completedPMs.details;
        fileName = 'completed-pms';
    } else if (metricType === 'equipmentCompliance') {
        data = metricsData.equipmentCompliance.details;
        fileName = 'equipment-compliance';
    } else if (metricType === 'issuesRequiringFollowup') {
        data = metricsData.issuesRequiringFollowup.details;
        fileName = 'issues-requiring-followup';
    } else if (metricType === 'criticalAlerts') {
        data = metricsData.criticalAlerts.details;
        fileName = 'critical-alerts';
    }
    
    if (!data || data.length === 0) {
        alert('No data available to export');
        return;
    }
    
    // Add timestamp to filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    fileName = `${fileName}-${timestamp}`;
    
    // Handle export based on format
    if (format === 'csv') {
        exportAsCSV(data, fileName);
    } else if (format === 'excel') {
        // In a real implementation, this would export as Excel format
        alert('Excel export functionality would be implemented here');
        console.log('Would export data as Excel:', data);
    } else if (format === 'pdf') {
        // In a real implementation, this would export as PDF format
        alert('PDF export functionality would be implemented here');
        console.log('Would export data as PDF:', data);
    }
}

/**
 * Export data as CSV
 * @param {Array} data - Data to export
 * @param {string} fileName - Name for the export file
 */
function exportAsCSV(data, fileName) {
    if (!data || data.length === 0) {
        return;
    }
    
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add data rows
    data.forEach(item => {
        const row = headers.map(header => {
            // Escape commas and quotes in values
            let value = item[header] || '';
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',');
        
        csvContent += row + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.display = 'none';
    
    // Add to document, trigger download, and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Close the metric detail modal
 */
function closeModal() {
    const modal = document.getElementById('metric-detail-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Refresh metrics data periodically
 */
function startMetricsRefresh() {
    // Initial refresh
    syncMetricsData();
    
    // Set up auto-refresh every 5 minutes (300000 ms)
    const refreshInterval = 300000;
    setInterval(syncMetricsData, refreshInterval);
    
    console.log(`Metrics auto-refresh enabled (every ${refreshInterval/60000} minutes)`);
}

// Initialize metrics when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the metrics system
    initializeMetrics();
    
    // Start auto-refresh if on the reports page
    if (window.location.pathname.includes('reports.html')) {
        startMetricsRefresh();
    }
});