/**
 * Rapid Pro Maintenance - Dashboard Integration
 * Shows how to integrate the Unified Dashboard framework with Rapid Pro Maintenance
 */

// Import the unified dashboard core
const { UnifiedDashboard } = require('./unified-dashboard-core');
const databaseService = require('./sqlite-service');

/**
 * Rapid Pro Maintenance Dashboard Integration
 */
class RapidProDashboard {
  constructor(userId, userRole, mode) {
    this.userId = userId;
    this.userRole = userRole;
    this.mode = mode || 'normal'; // 'normal' or 'bridge-building'
    this.apiBaseUrl = '/api';
    this.technicianInfo = null;
  }
  
  /**
   * Initialize the dashboard
   * @param {string} containerId - DOM element ID to render the dashboard in
   */
  async initialize(containerId) {
    console.log('Initializing Rapid Pro Dashboard...');
    
    // Initialize database
    await databaseService.initialize();
    
    // Load the technician info to determine tier
    await this.loadTechnicianInfo();
    
    // Configure the unified dashboard
    const dashboardConfig = {
      serviceVertical: 'kitchen_maintenance',
      providerTier: this.determineTechnicianTier(),
      businessContext: this.determineBusinessContext(),
      apiConfig: {
        baseUrl: this.apiBaseUrl,
        dashboardEndpoint: '/dashboard/technician',
        scheduleEndpoint: '/schedule',
        alertsEndpoint: '/alerts'
      }
    };
    
    // Create and initialize the unified dashboard
    this.dashboard = new UnifiedDashboard(dashboardConfig);
    
    // Override data loading methods to use database service
    this.overrideDataLoadingMethods();
    
    // Initialize the dashboard
    await this.dashboard.initialize(containerId);
    
    // Add event listeners
    this.addEventListeners();
    
    // Apply bridge building mode if needed
    if (this.mode === 'bridge-building') {
      this.applyBridgeBuildingMode();
    }
    
    console.log('Rapid Pro Dashboard initialized');
  }
  
  /**
   * Load the technician information
   */
  async loadTechnicianInfo() {
    try {
      // Get technician from local database first
      const providers = await databaseService.getProviders({ 
        conditions: { user_id: this.userId },
        limit: 1 
      });
      
      if (providers && providers.length > 0) {
        this.technicianInfo = providers[0];
        console.log('Technician info loaded from database');
        return;
      }
      
      // If not in database, fetch from API
      const response = await fetch(`${this.apiBaseUrl}/technicians/me`);
      const data = await response.json();
      
      if (data.success) {
        this.technicianInfo = data.technician;
        
        // Save to database for offline access
        await databaseService.addRecord('providers', {
          user_id: this.userId,
          first_name: this.technicianInfo.firstName,
          last_name: this.technicianInfo.lastName,
          email: this.technicianInfo.email,
          service_vertical: 'kitchen_maintenance',
          provider_tier: this.technicianInfo.tier || 'certified_technician',
          business_context: this.determineBusinessContext(),
          rating: this.technicianInfo.rating || 0,
          rating_count: this.technicianInfo.ratingCount || 0,
          completed_jobs: this.technicianInfo.completedJobs || 0
        });
        
        console.log('Technician info loaded from API and saved to database');
      } else {
        console.error('Error loading technician info:', data.message);
      }
    } catch (error) {
      console.error('Error fetching technician info:', error);
    }
  }
  
  /**
   * Determine the technician tier based on the technician info
   * @returns {string} Technician tier
   */
  determineTechnicianTier() {
    if (!this.technicianInfo) {
      return 'certified_technician'; // Default tier
    }
    
    // Use tier field if available
    if (this.technicianInfo.tier) {
      return this.technicianInfo.tier;
    }
    
    // Determine based on available data
    const certificationLevel = this.technicianInfo.certificationLevel || 1;
    const monthsExperience = this.technicianInfo.experienceMonths || 0;
    const completedJobs = this.technicianInfo.completedJobs || 0;
    
    if (certificationLevel >= 3 && monthsExperience >= 36 && completedJobs >= 500) {
      return 'territory_leader';
    } else if (certificationLevel >= 2 && monthsExperience >= 12 && completedJobs >= 200) {
      return 'elite_technician';
    } else {
      return 'certified_technician';
    }
  }
  
  /**
   * Determine the business context based on the technician info
   * @returns {string} Business context
   */
  determineBusinessContext() {
    if (!this.technicianInfo) {
      return 'solo'; // Default context
    }
    
    // If the technician has team members, they're a team leader
    if (this.technicianInfo.isTeamLead && this.technicianInfo.teamSize > 0) {
      return 'team_leader';
    }
    
    // If the technician is part of someone else's team
    if (this.technicianInfo.teamLead) {
      return 'team_member';
    }
    
    // Default to solo technician
    return 'solo';
  }
  
  /**
   * Override data loading methods to use database service
   */
  overrideDataLoadingMethods() {
    // Override the loadScheduleData method
    this.dashboard.loadScheduleData = async () => {
      try {
        // Get today's jobs from database
        const jobs = await databaseService.getTodayJobs(this.technicianInfo.id);
        
        return {
          count: jobs.length,
          completed: jobs.filter(job => job.status === 'completed').length,
          jobs: jobs.map(job => ({
            id: job.id,
            time: job.start_time,
            client: job.customer_name || 'Unknown',
            type: this.mode === 'bridge-building' ? 'Bridge Building Visit' : job.service_type,
            status: job.status
          }))
        };
      } catch (error) {
        console.error('Error loading schedule data:', error);
        return { count: 0, completed: 0, jobs: [] };
      }
    };
    
    // Override the loadAlertsData method
    this.dashboard.loadAlertsData = async () => {
      try {
        // Combine issues and alerts for Rapid Pro
        const alerts = await databaseService.getAlerts(this.technicianInfo.id, 10);
        
        // Add bridge building specific alerts if in bridge building mode
        if (this.mode === 'bridge-building') {
          // Get bridge building relationships that need follow-up
          const relationships = await databaseService.getBridgeBuildingRelationships(this.technicianInfo.id);
          const followUps = relationships.filter(r => 
            r.next_action_date && new Date(r.next_action_date) <= new Date()
          );
          
          // Add follow-up alerts
          followUps.forEach(followUp => {
            alerts.push({
              id: `bridge-${followUp.id}`,
              type: 'bridge_building',
              message: `Follow up with ${followUp.prospect_name}`,
              created_at: followUp.next_action_date
            });
          });
        }
        
        return {
          count: alerts.length,
          alerts: alerts.map(alert => ({
            id: alert.id,
            type: alert.type,
            message: alert.message || alert.title,
            timestamp: alert.created_at
          })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        };
      } catch (error) {
        console.error('Error loading alerts data:', error);
        return { count: 0, alerts: [] };
      }
    };
    
    // Override equipment history data loading for kitchen maintenance
    this.dashboard.loadEquipmentHistoryData = async () => {
      try {
        // Query equipment from database
        const equipment = await this.query(`
          SELECT e.*, c.name as customer_name, c.business_name as customer_business
          FROM equipment e
          JOIN customers c ON e.customer_id = c.id
          ORDER BY e.last_service_date DESC
          LIMIT 10
        `);
        
        return {
          count: equipment.length,
          equipment: equipment.map(eq => ({
            id: eq.id,
            type: eq.type,
            brand: eq.brand,
            client: eq.customer_name || eq.customer_business || 'Unknown',
            lastService: eq.last_service_date
          }))
        };
      } catch (error) {
        console.error('Error loading equipment history data:', error);
        return { count: 0, equipment: [] };
      }
    };
    
    // Override parts inventory data loading
    this.dashboard.loadPartsInventoryData = async () => {
      try {
        // Query parts inventory from database
        const parts = await databaseService.query(`
          SELECT * FROM parts_inventory
          WHERE provider_id = ?
          ORDER BY quantity ASC
        `, [this.technicianInfo.id]);
        
        return {
          count: parts.length,
          parts: parts.map(part => ({
            id: part.id,
            name: part.part_name,
            count: part.quantity,
            reorder: part.quantity <= part.reorder_threshold
          }))
        };
      } catch (error) {
        console.error('Error loading parts inventory data:', error);
        return { count: 0, parts: [] };
      }
    };
    
    // Override other methods as needed
  }
  
  /**
   * Add custom event listeners
   */
  addEventListeners() {
    // Listen for dashboard rendered event
    this.dashboard.on('dashboardRendered', (data) => {
      console.log('Dashboard rendered with modules:', data.modules.map(m => m.id));
      
      // Trigger any specific initialization
      this.initMaintenanceSpecificFeatures();
    });
    
    // Listen for module data changed event
    this.dashboard.on('moduleDataChanged', (data) => {
      console.log(`Module ${data.moduleId} data changed`);
      
      // Update any dependent UI elements
      this.updateDependentElements(data.moduleId, data.data);
    });
    
    // Listen for sync status change
    databaseService.addListener('syncStatusChange', (status) => {
      // Update sync status indicator
      const syncIndicator = document.getElementById('sync-status');
      if (syncIndicator) {
        syncIndicator.className = status.inProgress ? 'syncing' : 
          (status.pendingCount > 0 ? 'pending' : 'synced');
        
        const lastSyncText = status.lastSync 
          ? new Date(status.lastSync).toLocaleTimeString() 
          : 'Never';
        
        syncIndicator.title = `Last sync: ${lastSyncText}, Pending items: ${status.pendingCount}`;
      }
    });
  }
  
  /**
   * Initialize maintenance-specific features
   */
  initMaintenanceSpecificFeatures() {
    console.log('Initializing maintenance-specific features');
    
    // Set up equipment history interactions
    const equipmentRows = document.querySelectorAll('.equipment-table tr');
    equipmentRows.forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.currentTarget.dataset.id) {
          this.openEquipmentDetail(e.currentTarget.dataset.id);
        }
      });
    });
    
    // Set up parts inventory interactions
    const orderButtons = document.querySelectorAll('.parts-table .order-btn');
    orderButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const partId = e.currentTarget.dataset.id;
        if (partId) {
          this.orderPart(partId);
        }
      });
    });
  }
  
  /**
   * Apply Bridge Building mode
   */
  applyBridgeBuildingMode() {
    console.log('Applying Bridge Building mode');
    
    // Add CSS class to body
    document.body.classList.add('bridge-building-mode');
    
    // Register bridge building specific modules
    this.dashboard.registerModule('relationshipBuilding', {
      title: 'Relationship Building',
      priority: 35,
      renderFn: this.renderRelationshipBuildingModule.bind(this),
      dataFn: this.loadRelationshipBuildingData.bind(this),
      refreshInterval: 24 * 60 * 60 * 1000, // 24 hours
      showInContext: ['solo', 'team_member', 'team_leader'],
      showInTier: ['certified_technician', 'elite_technician', 'territory_leader'],
      showInVertical: ['kitchen_maintenance']
    });
    
    // Re-render the dashboard
    this.dashboard.render();
  }
  
  /**
   * Load relationship building data
   * @returns {Promise<Object>} Relationship building data
   */
  async loadRelationshipBuildingData() {
    try {
      // Get relationship building data from database
      const relationships = await databaseService.getBridgeBuildingRelationships(this.technicianInfo.id);
      
      // Filter to active relationships
      const activeRelationships = relationships.filter(r => 
        r.status !== 'declined' && r.status !== 'converted'
      );
      
      // Get conversation starters from database or use defaults
      const starters = [
        { text: 'How long have you been in business here?', category: 'background' },
        { text: 'What type of refrigeration equipment do you rely on most?', category: 'equipment' },
        { text: 'How do you currently handle equipment maintenance?', category: 'process' },
        { text: 'What\'s been your biggest challenge with kitchen equipment?', category: 'pain_point' }
      ];
      
      // Get follow-up strategies
      const followUpStrategies = [
        { type: 'call', timeframe: '1-2 days', description: 'Thank you call' },
        { type: 'email', timeframe: '1 week', description: 'Information packet' },
        { type: 'visit', timeframe: '3-4 weeks', description: 'Follow-up visit' }
      ];
      
      return {
        relationships: activeRelationships,
        conversationStarters: starters,
        followUpStrategies: followUpStrategies
      };
    } catch (error) {
      console.error('Error loading relationship building data:', error);
      return {
        relationships: [],
        conversationStarters: [],
        followUpStrategies: []
      };
    }
  }
  
  /**
   * Render the relationship building module
   * @param {Object} data - Relationship building data
   * @returns {string} HTML for the relationship building module
   */
  renderRelationshipBuildingModule(data) {
    if (!data) {
      return '<div class="loading-placeholder">Loading relationship building tools...</div>';
    }
    
    let startersHtml = '<div class="conversation-starters">';
    startersHtml += '<h4>Conversation Starters</h4>';
    startersHtml += '<ul class="starters-list">';
    
    data.conversationStarters.forEach(starter => {
      startersHtml += `
        <li class="starter-item starter-${starter.category}">
          <div class="starter-text">${starter.text}</div>
        </li>
      `;
    });
    
    startersHtml += '</ul></div>';
    
    let followUpHtml = '<div class="follow-up-strategies">';
    followUpHtml += '<h4>Follow-Up Strategies</h4>';
    followUpHtml += '<ul class="strategy-list">';
    
    data.followUpStrategies.forEach(strategy => {
      followUpHtml += `
        <li class="strategy-item strategy-${strategy.type}">
          <div class="strategy-type">${strategy.type}</div>
          <div class="strategy-details">
            <div class="strategy-timeframe">${strategy.timeframe}</div>
            <div class="strategy-description">${strategy.description}</div>
          </div>
        </li>
      `;
    });
    
    followUpHtml += '</ul></div>';
    
    // Add relationship management if there are active relationships
    let relationshipsHtml = '';
    if (data.relationships && data.relationships.length > 0) {
      relationshipsHtml = '<div class="active-relationships">';
      relationshipsHtml += '<h4>Active Prospects</h4>';
      relationshipsHtml += '<ul class="relationship-list">';
      
      data.relationships.slice(0, 3).forEach(relationship => {
        relationshipsHtml += `
          <li class="relationship-item" data-id="${relationship.id}">
            <div class="relationship-name">${relationship.prospect_name}</div>
            <div class="relationship-details">
              <div class="relationship-status">${relationship.status}</div>
              <div class="relationship-next-action">${relationship.next_action || 'No action set'}</div>
            </div>
          </li>
        `;
      });
      
      relationshipsHtml += '</ul>';
      relationshipsHtml += `<a href="#" class="view-all-link">View all ${data.relationships.length} prospects</a>`;
      relationshipsHtml += '</div>';
    }
    
    return `
      <div class="relationship-building-module">
        ${relationshipsHtml}
        ${startersHtml}
        ${followUpHtml}
      </div>
    `;
  }
  
  /**
   * Open equipment detail view
   * @param {string} equipmentId - ID of the equipment
   */
  openEquipmentDetail(equipmentId) {
    console.log(`Opening equipment detail for: ${equipmentId}`);
    
    // Implementation would depend on the app's navigation system
  }
  
  /**
   * Order a part
   * @param {string} partId - ID of the part to order
   */
  orderPart(partId) {
    console.log(`Ordering part: ${partId}`);
    
    // Implementation would depend on the app's part ordering system
  }
  
  /**
   * Update dependent UI elements when module data changes
   * @param {string} moduleId - ID of the module that changed
   * @param {Object} data - New module data
   */
  updateDependentElements(moduleId, data) {
    // Update any UI elements that depend on this module
    console.log(`Updating dependent elements for module: ${moduleId}`);
    
    // For example, update notification badge with alerts count
    if (moduleId === 'alerts') {
      const notificationBadge = document.querySelector('.notification-badge');
      if (notificationBadge) {
        notificationBadge.textContent = data.count;
        notificationBadge.style.display = data.count > 0 ? 'block' : 'none';
      }
    }
  }
}

// Export the dashboard class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RapidProDashboard };
} else {
  window.RapidProDashboard = RapidProDashboard;
}