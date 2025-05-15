/**
 * Issues and Alerts API Integration
 * Provides backend integration for Issues Requiring Follow-up and Critical Equipment Alerts features
 * Handles data fetching, filtering, sorting, and state management
 */

// API Configuration
const API_CONFIG = {
    baseUrl: '/api', // Will be replaced with actual API endpoint in production
    endpoints: {
        issues: '/issues',
        alerts: '/alerts',
        equipment: '/equipment',
        customers: '/customers'
    },
    mockEnabled: true // Enable mock data for development
};

/**
 * Issues API Module - Handles all interactions with the Issues API
 */
const IssuesAPI = (function() {
    // Private state
    let _issues = [];
    let _isLoaded = false;
    let _lastFetch = null;
    
    // Mock data for development
    const _mockIssues = [
        { id: 'ISS-2025-0014', customer: 'Fresh Start Bakery', equipment: 'Walk-in Cooler', issue: 'Door gasket requires replacement', priority: 'Medium', status: 'pending', createdDate: '2025-05-05', technician: 'Terry Jamison', notes: 'Gasket is torn in multiple places, affecting temperature regulation. Customer notified of required replacement.', estimatedCost: '$350', equipmentId: 'EQ-FSB-001', customerId: 'CUST-0023' },
        { id: 'ISS-2025-0013', customer: 'Beale Street Kitchen', equipment: 'Range Hood', issue: 'Excessive grease buildup in filters', priority: 'High', status: 'pending', createdDate: '2025-05-06', technician: 'Mike Davis', notes: 'Fire hazard present. Filters need immediate cleaning/replacement. Customer notified of safety concern.', estimatedCost: '$275', equipmentId: 'EQ-BSK-003', customerId: 'CUST-0015' },
        { id: 'ISS-2025-0012', customer: 'Cooper-Young Gastropub', equipment: 'Ice Machine', issue: 'Scale buildup affecting production', priority: 'Medium', status: 'in_progress', createdDate: '2025-05-08', technician: 'Sarah Johnson', notes: 'Severe scale buildup in water lines and evaporator. Descaling service recommended.', estimatedCost: '$425', equipmentId: 'EQ-CYG-005', customerId: 'CUST-0019' },
        { id: 'ISS-2025-0011', customer: 'Downtown Cafe', equipment: 'Dish Machine', issue: 'Temperature not reaching sanitizing level', priority: 'High', status: 'pending', createdDate: '2025-05-07', technician: 'Terry Jamison', notes: 'Heating element may be failing. Unable to reach 180°F sanitizing temp. Replacement parts ordered.', estimatedCost: '$560', equipmentId: 'EQ-DTC-008', customerId: 'CUST-0034' },
        { id: 'ISS-2025-0010', customer: 'Blues & BBQ', equipment: 'Prep Table', issue: 'Not maintaining safe food temperature', priority: 'High', status: 'in_progress', createdDate: '2025-05-09', technician: 'Mike Davis', notes: 'Compressor cycling too frequently. Possible refrigerant leak. Scheduled for follow-up repair.', estimatedCost: '$675', equipmentId: 'EQ-BBQ-004', customerId: 'CUST-0042' },
        { id: 'ISS-2025-0009', customer: 'Memphis Grill', equipment: 'Reach-in Freezer', issue: 'Intermittent temperature fluctuations', priority: 'Medium', status: 'pending', createdDate: '2025-05-10', technician: 'Sarah Johnson', notes: 'Controller may be faulty. Temperature fluctuates between -5°F and 15°F. Monitoring device installed.', estimatedCost: '$390', equipmentId: 'EQ-MG-002', customerId: 'CUST-0008' },
        { id: 'ISS-2025-0008', customer: 'Grand Hotel Memphis', equipment: 'HVAC System', issue: 'Condenser coil requires cleaning', priority: 'Low', status: 'pending', createdDate: '2025-05-08', technician: 'Terry Jamison', notes: 'Reduced airflow due to dirty condenser. Scheduled for cleaning during next PM visit.', estimatedCost: '$225', equipmentId: 'EQ-GHM-012', customerId: 'CUST-0017' },
        { id: 'ISS-2025-0007', customer: 'Riverside Catering', equipment: 'Deep Fryer', issue: 'Oil filtration system malfunction', priority: 'Medium', status: 'in_progress', createdDate: '2025-05-10', technician: 'Mike Davis', notes: 'Pump not circulating oil properly. Filter assembly may need replacement.', estimatedCost: '$340', equipmentId: 'EQ-RC-006', customerId: 'CUST-0021' },
        { id: 'ISS-2025-0006', customer: 'TJ\'s Bar & Grill', equipment: 'Beer Cooler', issue: 'Condensate drain line clogged', priority: 'Medium', status: 'pending', createdDate: '2025-05-04', technician: 'Sarah Johnson', notes: 'Water backing up in unit. Drain line needs clearing and sanitizing.', estimatedCost: '$180', equipmentId: 'EQ-TJB-009', customerId: 'CUST-0012' },
        { id: 'ISS-2025-0005', customer: 'Southside Diner', equipment: 'Griddle', issue: 'Uneven heating surface', priority: 'Low', status: 'pending', createdDate: '2025-05-03', technician: 'Terry Jamison', notes: 'Temperature variance across cooking surface. May need calibration or element replacement.', estimatedCost: '$275', equipmentId: 'EQ-SSD-007', customerId: 'CUST-0028' },
        { id: 'ISS-2025-0004', customer: 'Fresh Start Bakery', equipment: 'Convection Oven', issue: 'Fan motor making noise', priority: 'Low', status: 'in_progress', createdDate: '2025-05-02', technician: 'Mike Davis', notes: 'Bearing sounds worn. Recommended replacement before failure.', estimatedCost: '$420', equipmentId: 'EQ-FSB-003', customerId: 'CUST-0023' },
        { id: 'ISS-2025-0003', customer: 'Cooper-Young Gastropub', equipment: 'Draft Beer System', issue: 'Inconsistent pour temperature', priority: 'Medium', status: 'pending', createdDate: '2025-05-01', technician: 'Sarah Johnson', notes: 'Glycol chiller not maintaining consistent temp. Possible compressor issue.', estimatedCost: '$590', equipmentId: 'EQ-CYG-010', customerId: 'CUST-0019' },
        { id: 'ISS-2025-0002', customer: 'Blues & BBQ', equipment: 'Exhaust Hood', issue: 'Airflow below recommended levels', priority: 'Medium', status: 'pending', createdDate: '2025-04-30', technician: 'Terry Jamison', notes: 'Fan speed reduced. Motor and belt inspection needed. May affect HVAC balance.', estimatedCost: '$315', equipmentId: 'EQ-BBQ-002', customerId: 'CUST-0042' },
        { id: 'ISS-2025-0001', customer: 'Beale Street Kitchen', equipment: 'Walk-in Freezer', issue: 'Door not sealing properly', priority: 'Low', status: 'in_progress', createdDate: '2025-04-29', technician: 'Mike Davis', notes: 'Door hinge alignment issue. Temporary fix applied, permanent repair scheduled.', estimatedCost: '$250', equipmentId: 'EQ-BSK-001', customerId: 'CUST-0015' }
    ];
    
    // Cache refresh time (15 minutes)
    const CACHE_TTL = 15 * 60 * 1000;
    
    /**
     * Check if data needs to be refreshed based on cache TTL
     * @returns {boolean} True if data needs refreshing
     */
    function _needsRefresh() {
        if (!_isLoaded) return true;
        if (!_lastFetch) return true;
        return (Date.now() - _lastFetch) > CACHE_TTL;
    }
    
    /**
     * Fetch issues from the API
     * @param {Object} options - Query parameters
     * @returns {Promise<Array>} Promise resolving to issues array
     */
    async function fetchIssues(options = {}) {
        // Default query parameters
        const params = {
            limit: options.limit || 50,
            offset: options.offset || 0,
            sort: options.sort || '-createdDate', // Default sort by date descending
            filter: options.filter || '',
            priority: options.priority || '',
            status: options.status || '',
            ...options
        };
        
        if (_needsRefresh() || options.forceRefresh) {
            try {
                if (API_CONFIG.mockEnabled) {
                    // Use mock data
                    console.log('Using mock issues data');
                    _issues = _mockIssues;
                    
                    // Apply filters if provided
                    if (params.filter) {
                        const filterLower = params.filter.toLowerCase();
                        _issues = _issues.filter(issue => 
                            issue.customer.toLowerCase().includes(filterLower) ||
                            issue.equipment.toLowerCase().includes(filterLower) ||
                            issue.issue.toLowerCase().includes(filterLower) ||
                            issue.id.toLowerCase().includes(filterLower)
                        );
                    }
                    
                    // Filter by priority if provided
                    if (params.priority) {
                        _issues = _issues.filter(issue => issue.priority === params.priority);
                    }
                    
                    // Filter by status if provided
                    if (params.status) {
                        _issues = _issues.filter(issue => issue.status === params.status);
                    }
                    
                    // Sort issues
                    const sortField = params.sort.startsWith('-') 
                        ? params.sort.substring(1) 
                        : params.sort;
                    const sortDescending = params.sort.startsWith('-');
                    
                    _issues.sort((a, b) => {
                        const aVal = a[sortField];
                        const bVal = b[sortField];
                        
                        // Handle string comparison
                        if (typeof aVal === 'string') {
                            return sortDescending 
                                ? bVal.localeCompare(aVal) 
                                : aVal.localeCompare(bVal);
                        }
                        
                        // Handle numeric comparison
                        return sortDescending 
                            ? bVal - aVal 
                            : aVal - bVal;
                    });
                    
                    // Apply pagination
                    _issues = _issues.slice(params.offset, params.offset + params.limit);
                } else {
                    // Build query string
                    const queryParams = new URLSearchParams();
                    Object.keys(params).forEach(key => {
                        if (params[key]) queryParams.append(key, params[key]);
                    });
                    
                    // Make API request
                    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.issues}?${queryParams}`);
                    if (!response.ok) throw new Error('Failed to fetch issues');
                    _issues = await response.json();
                }
                
                _isLoaded = true;
                _lastFetch = Date.now();
                
                return _issues;
            } catch (error) {
                console.error('Error fetching issues:', error);
                throw error;
            }
        } else {
            // Return cached data
            console.log('Using cached issues data');
            return _issues;
        }
    }
    
    /**
     * Get a single issue by ID
     * @param {string} issueId - Issue ID
     * @returns {Promise<Object>} Promise resolving to issue object
     */
    async function getIssue(issueId) {
        try {
            if (API_CONFIG.mockEnabled) {
                const issue = _mockIssues.find(issue => issue.id === issueId);
                if (!issue) throw new Error(`Issue ${issueId} not found`);
                return issue;
            } else {
                const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.issues}/${issueId}`);
                if (!response.ok) throw new Error(`Failed to fetch issue ${issueId}`);
                return await response.json();
            }
        } catch (error) {
            console.error(`Error fetching issue ${issueId}:`, error);
            throw error;
        }
    }
    
    /**
     * Update an issue
     * @param {string} issueId - Issue ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Promise resolving to updated issue
     */
    async function updateIssue(issueId, updates) {
        try {
            if (API_CONFIG.mockEnabled) {
                const issueIndex = _mockIssues.findIndex(issue => issue.id === issueId);
                if (issueIndex === -1) throw new Error(`Issue ${issueId} not found`);
                
                // Update the issue
                _mockIssues[issueIndex] = {
                    ..._mockIssues[issueIndex],
                    ...updates,
                    updatedDate: new Date().toISOString().split('T')[0]
                };
                
                return _mockIssues[issueIndex];
            } else {
                const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.issues}/${issueId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updates)
                });
                
                if (!response.ok) throw new Error(`Failed to update issue ${issueId}`);
                return await response.json();
            }
        } catch (error) {
            console.error(`Error updating issue ${issueId}:`, error);
            throw error;
        }
    }
    
    /**
     * Create a new issue
     * @param {Object} issueData - New issue data
     * @returns {Promise<Object>} Promise resolving to created issue
     */
    async function createIssue(issueData) {
        try {
            if (API_CONFIG.mockEnabled) {
                // Generate a new ID for the issue
                const newId = `ISS-2025-${String(_mockIssues.length + 1).padStart(4, '0')}`;
                
                // Create new issue
                const newIssue = {
                    id: newId,
                    ...issueData,
                    createdDate: new Date().toISOString().split('T')[0],
                    status: issueData.status || 'pending'
                };
                
                // Add to mock data
                _mockIssues.unshift(newIssue);
                
                return newIssue;
            } else {
                const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.issues}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(issueData)
                });
                
                if (!response.ok) throw new Error('Failed to create issue');
                return await response.json();
            }
        } catch (error) {
            console.error('Error creating issue:', error);
            throw error;
        }
    }
    
    /**
     * Delete an issue
     * @param {string} issueId - Issue ID to delete
     * @returns {Promise<boolean>} Promise resolving to success status
     */
    async function deleteIssue(issueId) {
        try {
            if (API_CONFIG.mockEnabled) {
                const issueIndex = _mockIssues.findIndex(issue => issue.id === issueId);
                if (issueIndex === -1) throw new Error(`Issue ${issueId} not found`);
                
                // Remove the issue
                _mockIssues.splice(issueIndex, 1);
                
                return true;
            } else {
                const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.issues}/${issueId}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) throw new Error(`Failed to delete issue ${issueId}`);
                return true;
            }
        } catch (error) {
            console.error(`Error deleting issue ${issueId}:`, error);
            throw error;
        }
    }
    
    /**
     * Get issue statistics
     * @returns {Promise<Object>} Promise resolving to issue stats
     */
    async function getIssueStats() {
        try {
            if (API_CONFIG.mockEnabled) {
                // Ensure issues data is loaded
                if (!_isLoaded) await fetchIssues();
                
                // Calculate statistics from mock data
                const totalIssues = _mockIssues.length;
                const highPriority = _mockIssues.filter(issue => issue.priority === 'High').length;
                const mediumPriority = _mockIssues.filter(issue => issue.priority === 'Medium').length;
                const lowPriority = _mockIssues.filter(issue => issue.priority === 'Low').length;
                const pendingStatus = _mockIssues.filter(issue => issue.status === 'pending').length;
                const inProgressStatus = _mockIssues.filter(issue => issue.status === 'in_progress').length;
                const completedStatus = _mockIssues.filter(issue => issue.status === 'completed').length;
                
                return {
                    totalIssues,
                    byPriority: { high: highPriority, medium: mediumPriority, low: lowPriority },
                    byStatus: { pending: pendingStatus, inProgress: inProgressStatus, completed: completedStatus },
                    lastUpdated: _lastFetch
                };
            } else {
                const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.issues}/stats`);
                if (!response.ok) throw new Error('Failed to fetch issue statistics');
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching issue statistics:', error);
            throw error;
        }
    }
    
    // Public API
    return {
        fetchIssues,
        getIssue,
        updateIssue,
        createIssue,
        deleteIssue,
        getIssueStats
    };
})();

/**
 * Alerts API Module - Handles all interactions with the Critical Alerts API
 */
const AlertsAPI = (function() {
    // Private state
    let _alerts = [];
    let _isLoaded = false;
    let _lastFetch = null;
    
    // Mock data for development
    const _mockAlerts = [
        { id: 'ALT-2025-0005', customer: 'Beale Street Kitchen', equipment: 'Walk-in Freezer', issue: 'Compressor failure imminent', date: '2025-05-06', action: 'Schedule emergency service', status: 'active', priority: 'critical', details: 'Compressor drawing excessive amperage and overheating. High risk of complete failure within 24-48 hours. Emergency service required.', estimatedCost: '$2,800', equipmentId: 'EQ-BSK-002', customerId: 'CUST-0015' },
        { id: 'ALT-2025-0004', customer: 'Downtown Cafe', equipment: 'Dish Machine', issue: 'Sanitizer pump failure', date: '2025-05-07', action: 'Replace sanitizer pump', status: 'active', priority: 'critical', details: 'Chemical sanitizer not being dispensed. Health code violation risk. Replacement pump needed immediately.', estimatedCost: '$420', equipmentId: 'EQ-DTC-008', customerId: 'CUST-0034' },
        { id: 'ALT-2025-0003', customer: 'Blues & BBQ', equipment: 'Prep Table', issue: 'Refrigeration failure', date: '2025-05-09', action: 'Replace compressor', status: 'active', priority: 'critical', details: 'Unit unable to maintain safe food temperature. Current temp: 52°F. Immediate repair required to prevent food loss.', estimatedCost: '$1,250', equipmentId: 'EQ-BBQ-004', customerId: 'CUST-0042' },
        { id: 'ALT-2025-0002', customer: 'Fresh Start Bakery', equipment: 'Convection Oven', issue: 'Gas leak detected', date: '2025-05-05', action: 'Shut down equipment, emergency repair', status: 'active', priority: 'critical', details: 'Gas odor detected around connection point. Unit shut down for safety. Immediate repair needed.', estimatedCost: '$850', equipmentId: 'EQ-FSB-004', customerId: 'CUST-0023' },
        { id: 'ALT-2025-0001', customer: 'Cooper-Young Gastropub', equipment: 'Exhaust Hood', issue: 'Fire suppression system fault', date: '2025-05-08', action: 'Immediate service required', status: 'active', priority: 'critical', details: 'System showing error code E-42. Fire suppression not armed properly. Kitchen operations suspended until fixed.', estimatedCost: '$1,100', equipmentId: 'EQ-CYG-003', customerId: 'CUST-0019' }
    ];
    
    // Cache refresh time (5 minutes for critical alerts)
    const CACHE_TTL = 5 * 60 * 1000;
    
    /**
     * Check if data needs to be refreshed based on cache TTL
     * @returns {boolean} True if data needs refreshing
     */
    function _needsRefresh() {
        if (!_isLoaded) return true;
        if (!_lastFetch) return true;
        return (Date.now() - _lastFetch) > CACHE_TTL;
    }
    
    /**
     * Fetch alerts from the API
     * @param {Object} options - Query parameters
     * @returns {Promise<Array>} Promise resolving to alerts array
     */
    async function fetchAlerts(options = {}) {
        // Default query parameters
        const params = {
            limit: options.limit || 50,
            offset: options.offset || 0,
            sort: options.sort || '-date', // Default sort by date descending
            filter: options.filter || '',
            status: options.status || 'active',
            ...options
        };
        
        if (_needsRefresh() || options.forceRefresh) {
            try {
                if (API_CONFIG.mockEnabled) {
                    // Use mock data
                    console.log('Using mock alerts data');
                    _alerts = _mockAlerts;
                    
                    // Apply filters if provided
                    if (params.filter) {
                        const filterLower = params.filter.toLowerCase();
                        _alerts = _alerts.filter(alert => 
                            alert.customer.toLowerCase().includes(filterLower) ||
                            alert.equipment.toLowerCase().includes(filterLower) ||
                            alert.issue.toLowerCase().includes(filterLower) ||
                            alert.id.toLowerCase().includes(filterLower)
                        );
                    }
                    
                    // Filter by status if provided
                    if (params.status) {
                        _alerts = _alerts.filter(alert => alert.status === params.status);
                    }
                    
                    // Sort alerts
                    const sortField = params.sort.startsWith('-') 
                        ? params.sort.substring(1) 
                        : params.sort;
                    const sortDescending = params.sort.startsWith('-');
                    
                    _alerts.sort((a, b) => {
                        const aVal = a[sortField];
                        const bVal = b[sortField];
                        
                        // Handle string comparison
                        if (typeof aVal === 'string') {
                            return sortDescending 
                                ? bVal.localeCompare(aVal) 
                                : aVal.localeCompare(bVal);
                        }
                        
                        // Handle numeric comparison
                        return sortDescending 
                            ? bVal - aVal 
                            : aVal - bVal;
                    });
                    
                    // Apply pagination
                    _alerts = _alerts.slice(params.offset, params.offset + params.limit);
                } else {
                    // Build query string
                    const queryParams = new URLSearchParams();
                    Object.keys(params).forEach(key => {
                        if (params[key]) queryParams.append(key, params[key]);
                    });
                    
                    // Make API request
                    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.alerts}?${queryParams}`);
                    if (!response.ok) throw new Error('Failed to fetch alerts');
                    _alerts = await response.json();
                }
                
                _isLoaded = true;
                _lastFetch = Date.now();
                
                return _alerts;
            } catch (error) {
                console.error('Error fetching alerts:', error);
                throw error;
            }
        } else {
            // Return cached data
            console.log('Using cached alerts data');
            return _alerts;
        }
    }
    
    /**
     * Get a single alert by ID
     * @param {string} alertId - Alert ID
     * @returns {Promise<Object>} Promise resolving to alert object
     */
    async function getAlert(alertId) {
        try {
            if (API_CONFIG.mockEnabled) {
                const alert = _mockAlerts.find(alert => alert.id === alertId);
                if (!alert) throw new Error(`Alert ${alertId} not found`);
                return alert;
            } else {
                const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.alerts}/${alertId}`);
                if (!response.ok) throw new Error(`Failed to fetch alert ${alertId}`);
                return await response.json();
            }
        } catch (error) {
            console.error(`Error fetching alert ${alertId}:`, error);
            throw error;
        }
    }
    
    /**
     * Update an alert
     * @param {string} alertId - Alert ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Promise resolving to updated alert
     */
    async function updateAlert(alertId, updates) {
        try {
            if (API_CONFIG.mockEnabled) {
                const alertIndex = _mockAlerts.findIndex(alert => alert.id === alertId);
                if (alertIndex === -1) throw new Error(`Alert ${alertId} not found`);
                
                // Update the alert
                _mockAlerts[alertIndex] = {
                    ..._mockAlerts[alertIndex],
                    ...updates,
                    updatedDate: new Date().toISOString().split('T')[0]
                };
                
                return _mockAlerts[alertIndex];
            } else {
                const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.alerts}/${alertId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updates)
                });
                
                if (!response.ok) throw new Error(`Failed to update alert ${alertId}`);
                return await response.json();
            }
        } catch (error) {
            console.error(`Error updating alert ${alertId}:`, error);
            throw error;
        }
    }
    
    /**
     * Create a new alert
     * @param {Object} alertData - New alert data
     * @returns {Promise<Object>} Promise resolving to created alert
     */
    async function createAlert(alertData) {
        try {
            if (API_CONFIG.mockEnabled) {
                // Generate a new ID for the alert
                const newId = `ALT-2025-${String(_mockAlerts.length + 1).padStart(4, '0')}`;
                
                // Create new alert
                const newAlert = {
                    id: newId,
                    ...alertData,
                    date: new Date().toISOString().split('T')[0],
                    status: alertData.status || 'active'
                };
                
                // Add to mock data
                _mockAlerts.unshift(newAlert);
                
                return newAlert;
            } else {
                const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.alerts}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(alertData)
                });
                
                if (!response.ok) throw new Error('Failed to create alert');
                return await response.json();
            }
        } catch (error) {
            console.error('Error creating alert:', error);
            throw error;
        }
    }
    
    /**
     * Resolve an alert
     * @param {string} alertId - Alert ID to resolve
     * @param {Object} resolution - Resolution details
     * @returns {Promise<Object>} Promise resolving to resolved alert
     */
    async function resolveAlert(alertId, resolution) {
        try {
            if (API_CONFIG.mockEnabled) {
                const alertIndex = _mockAlerts.findIndex(alert => alert.id === alertId);
                if (alertIndex === -1) throw new Error(`Alert ${alertId} not found`);
                
                // Update the alert
                _mockAlerts[alertIndex] = {
                    ..._mockAlerts[alertIndex],
                    status: 'resolved',
                    resolution: resolution.notes || 'Resolved',
                    resolvedBy: resolution.technician || 'Unknown',
                    resolvedDate: new Date().toISOString().split('T')[0]
                };
                
                return _mockAlerts[alertIndex];
            } else {
                const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.alerts}/${alertId}/resolve`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(resolution)
                });
                
                if (!response.ok) throw new Error(`Failed to resolve alert ${alertId}`);
                return await response.json();
            }
        } catch (error) {
            console.error(`Error resolving alert ${alertId}:`, error);
            throw error;
        }
    }
    
    /**
     * Get alert statistics
     * @returns {Promise<Object>} Promise resolving to alert stats
     */
    async function getAlertStats() {
        try {
            if (API_CONFIG.mockEnabled) {
                // Ensure alerts data is loaded
                if (!_isLoaded) await fetchAlerts();
                
                // Calculate statistics from mock data
                const totalAlerts = _mockAlerts.length;
                const activeAlerts = _mockAlerts.filter(alert => alert.status === 'active').length;
                const resolvedAlerts = _mockAlerts.filter(alert => alert.status === 'resolved').length;
                
                // Count alerts by type
                const alertsByType = _mockAlerts.reduce((acc, alert) => {
                    // Categorize alerts
                    let type = 'other';
                    if (alert.issue.includes('failure') || alert.issue.includes('fault')) {
                        type = 'Equipment Failure';
                    } else if (alert.issue.includes('leak') || alert.issue.includes('fire')) {
                        type = 'Safety Hazard';
                    } else if (alert.issue.includes('temperature') || alert.issue.includes('sanitizer')) {
                        type = 'Health Code Risk';
                    }
                    
                    // Update counts
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                }, {});
                
                return {
                    totalAlerts,
                    activeAlerts,
                    resolvedAlerts,
                    byType: alertsByType,
                    lastUpdated: _lastFetch
                };
            } else {
                const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.alerts}/stats`);
                if (!response.ok) throw new Error('Failed to fetch alert statistics');
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching alert statistics:', error);
            throw error;
        }
    }
    
    // Public API
    return {
        fetchAlerts,
        getAlert,
        updateAlert,
        createAlert,
        resolveAlert,
        getAlertStats
    };
})();

// Export the API modules
window.IssuesAPI = IssuesAPI;
window.AlertsAPI = AlertsAPI;