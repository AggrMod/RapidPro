/**
 * Unified Dashboard Core
 * A modular dashboard framework that can be used across different service verticals and provider tiers
 */

class UnifiedDashboard {
  /**
   * Create a new unified dashboard instance
   * @param {Object} config - Dashboard configuration
   * @param {string} config.serviceVertical - The service vertical (kitchen_maintenance, cleaning_services, lawn_care)
   * @param {string} config.providerTier - Provider tier level (certified_technician, elite_technician, territory_leader)
   * @param {string} config.businessContext - Business context (solo, team_member, team_leader)
   * @param {Object} config.apiConfig - API configuration for data fetching
   */
  constructor(config) {
    this.config = {
      serviceVertical: config.serviceVertical || 'generic',
      providerTier: config.providerTier || 'certified_technician',
      businessContext: config.businessContext || 'solo',
      apiConfig: config.apiConfig || {
        baseUrl: '/api',
        dashboardEndpoint: '/dashboard',
        scheduleEndpoint: '/schedule',
        alertsEndpoint: '/alerts'
      }
    };
    
    // Initialize dashboard data structure
    this.data = {
      schedule: {
        today: [],
        upcoming: []
      },
      performance: {
        rating: 0,
        completedJobs: 0,
        onTimeRate: 0,
        customerSatisfaction: 0
      },
      earnings: {
        weekly: {
          amount: 0,
          currency: 'USD',
          changePercent: 0,
          trend: 'neutral'
        }
      },
      feedback: {
        score: 0,
        recent: []
      },
      alerts: [],
      team: null,
      growthOpportunities: []
    };
    
    // Dynamic module registry
    this.modules = {};
    
    // Dashboard element reference
    this.dashboardElement = null;
    
    // Event listeners
    this.eventListeners = {};
  }
  
  /**
   * Initialize the dashboard
   * @param {string} containerId - DOM element ID to render the dashboard in
   */
  async initialize(containerId) {
    console.log(`Initializing unified dashboard in ${containerId}`);
    this.dashboardElement = document.getElementById(containerId);
    
    if (!this.dashboardElement) {
      console.error(`Dashboard container '${containerId}' not found`);
      return false;
    }
    
    // Register core modules
    this.registerCoreModules();
    
    // Register vertical-specific modules
    this.registerVerticalModules();
    
    // Register tier-specific modules
    this.registerTierModules();
    
    // Register context-specific modules
    this.registerContextModules();
    
    // Load initial data
    await this.loadInitialData();
    
    // Render the dashboard
    this.render();
    
    // Set up auto-refresh
    this.setupAutoRefresh();
    
    console.log('Dashboard initialization complete');
    return true;
  }
  
  /**
   * Register core dashboard modules common to all implementations
   */
  registerCoreModules() {
    // Schedule module
    this.registerModule('schedule', {
      title: 'Today\'s Schedule',
      priority: 10,
      renderFn: this.renderScheduleModule.bind(this),
      dataFn: this.loadScheduleData.bind(this),
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      showInContext: ['solo', 'team_member', 'team_leader'],
      showInTier: ['certified_technician', 'elite_technician', 'territory_leader'],
      showInVertical: ['kitchen_maintenance', 'cleaning_services', 'lawn_care']
    });
    
    // Performance module
    this.registerModule('performance', {
      title: 'Current Performance',
      priority: 20,
      renderFn: this.renderPerformanceModule.bind(this),
      dataFn: this.loadPerformanceData.bind(this),
      refreshInterval: 15 * 60 * 1000, // 15 minutes
      showInContext: ['solo', 'team_member', 'team_leader'],
      showInTier: ['certified_technician', 'elite_technician', 'territory_leader'],
      showInVertical: ['kitchen_maintenance', 'cleaning_services', 'lawn_care'] 
    });
    
    // Feedback module
    this.registerModule('feedback', {
      title: 'Feedback Score',
      priority: 30,
      renderFn: this.renderFeedbackModule.bind(this),
      dataFn: this.loadFeedbackData.bind(this),
      refreshInterval: 15 * 60 * 1000, // 15 minutes
      showInContext: ['solo', 'team_member', 'team_leader'],
      showInTier: ['certified_technician', 'elite_technician', 'territory_leader'],
      showInVertical: ['kitchen_maintenance', 'cleaning_services', 'lawn_care'] 
    });
    
    // Earnings module
    this.registerModule('earnings', {
      title: 'Earnings This Week',
      priority: 40,
      renderFn: this.renderEarningsModule.bind(this),
      dataFn: this.loadEarningsData.bind(this),
      refreshInterval: 60 * 60 * 1000, // 1 hour
      showInContext: ['solo', 'team_member', 'team_leader'],
      showInTier: ['certified_technician', 'elite_technician', 'territory_leader'],
      showInVertical: ['kitchen_maintenance', 'cleaning_services', 'lawn_care'] 
    });
    
    // Alerts module
    this.registerModule('alerts', {
      title: 'Alerts & Notifications',
      priority: 50,
      renderFn: this.renderAlertsModule.bind(this),
      dataFn: this.loadAlertsData.bind(this),
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      showInContext: ['solo', 'team_member', 'team_leader'],
      showInTier: ['certified_technician', 'elite_technician', 'territory_leader'],
      showInVertical: ['kitchen_maintenance', 'cleaning_services', 'lawn_care'] 
    });
    
    // Upcoming jobs module
    this.registerModule('upcomingJobs', {
      title: 'Upcoming Jobs',
      priority: 60,
      renderFn: this.renderUpcomingJobsModule.bind(this),
      dataFn: this.loadUpcomingJobsData.bind(this),
      refreshInterval: 15 * 60 * 1000, // 15 minutes
      showInContext: ['solo', 'team_member', 'team_leader'],
      showInTier: ['certified_technician', 'elite_technician', 'territory_leader'],
      showInVertical: ['kitchen_maintenance', 'cleaning_services', 'lawn_care'] 
    });
    
    // Growth opportunities module
    this.registerModule('growthOpportunities', {
      title: 'Growth Opportunities',
      priority: 80,
      renderFn: this.renderGrowthOpportunitiesModule.bind(this),
      dataFn: this.loadGrowthOpportunitiesData.bind(this),
      refreshInterval: 24 * 60 * 60 * 1000, // 24 hours
      showInContext: ['solo', 'team_member', 'team_leader'],
      showInTier: ['certified_technician', 'elite_technician', 'territory_leader'],
      showInVertical: ['kitchen_maintenance', 'cleaning_services', 'lawn_care'] 
    });
  }
  
  /**
   * Register modules specific to the service vertical
   */
  registerVerticalModules() {
    const vertical = this.config.serviceVertical;
    
    if (vertical === 'kitchen_maintenance') {
      // Equipment history module
      this.registerModule('equipmentHistory', {
        title: 'Equipment History',
        priority: 90,
        renderFn: this.renderEquipmentHistoryModule.bind(this),
        dataFn: this.loadEquipmentHistoryData.bind(this),
        refreshInterval: 60 * 60 * 1000, // 1 hour
        showInContext: ['solo', 'team_member', 'team_leader'],
        showInTier: ['certified_technician', 'elite_technician', 'territory_leader'],
        showInVertical: ['kitchen_maintenance']
      });
      
      // Parts inventory module
      this.registerModule('partsInventory', {
        title: 'Parts Inventory',
        priority: 100,
        renderFn: this.renderPartsInventoryModule.bind(this),
        dataFn: this.loadPartsInventoryData.bind(this),
        refreshInterval: 60 * 60 * 1000, // 1 hour
        showInContext: ['solo', 'team_member', 'team_leader'],
        showInTier: ['elite_technician', 'territory_leader'],
        showInVertical: ['kitchen_maintenance']
      });
    } 
    else if (vertical === 'cleaning_services') {
      // Cleaning checklists module
      this.registerModule('cleaningChecklists', {
        title: 'Cleaning Checklists',
        priority: 90,
        renderFn: this.renderCleaningChecklistsModule.bind(this),
        dataFn: this.loadCleaningChecklistsData.bind(this),
        refreshInterval: 24 * 60 * 60 * 1000, // 24 hours
        showInContext: ['solo', 'team_member', 'team_leader'],
        showInTier: ['certified_technician', 'elite_technician', 'territory_leader'],
        showInVertical: ['cleaning_services']
      });
      
      // Supply inventory module
      this.registerModule('supplyInventory', {
        title: 'Supply Inventory',
        priority: 100,
        renderFn: this.renderSupplyInventoryModule.bind(this),
        dataFn: this.loadSupplyInventoryData.bind(this),
        refreshInterval: 60 * 60 * 1000, // 1 hour
        showInContext: ['solo', 'team_member', 'team_leader'],
        showInTier: ['elite_technician', 'territory_leader'],
        showInVertical: ['cleaning_services']
      });
    }
    else if (vertical === 'lawn_care') {
      // Property maps module
      this.registerModule('propertyMaps', {
        title: 'Property Maps',
        priority: 90,
        renderFn: this.renderPropertyMapsModule.bind(this),
        dataFn: this.loadPropertyMapsData.bind(this),
        refreshInterval: 24 * 60 * 60 * 1000, // 24 hours
        showInContext: ['solo', 'team_member', 'team_leader'],
        showInTier: ['certified_technician', 'elite_technician', 'territory_leader'],
        showInVertical: ['lawn_care']
      });
      
      // Weather alerts module
      this.registerModule('weatherAlerts', {
        title: 'Weather Alerts',
        priority: 30,
        renderFn: this.renderWeatherAlertsModule.bind(this),
        dataFn: this.loadWeatherAlertsData.bind(this),
        refreshInterval: 30 * 60 * 1000, // 30 minutes
        showInContext: ['solo', 'team_member', 'team_leader'],
        showInTier: ['certified_technician', 'elite_technician', 'territory_leader'],
        showInVertical: ['lawn_care']
      });
    }
  }
  
  /**
   * Register modules specific to provider tier
   */
  registerTierModules() {
    const tier = this.config.providerTier;
    
    if (tier === 'territory_leader' || tier === 'elite_technician') {
      // Team performance module (only for team leaders and elite techs)
      this.registerModule('teamPerformance', {
        title: 'Team Performance',
        priority: 70,
        renderFn: this.renderTeamPerformanceModule.bind(this),
        dataFn: this.loadTeamPerformanceData.bind(this),
        refreshInterval: 60 * 60 * 1000, // 1 hour
        showInContext: ['team_leader'],
        showInTier: ['elite_technician', 'territory_leader'],
        showInVertical: ['kitchen_maintenance', 'cleaning_services', 'lawn_care']
      });
      
      // Revenue analytics module (only for team leaders and elite techs)
      this.registerModule('revenueAnalytics', {
        title: 'Revenue Analytics',
        priority: 110,
        renderFn: this.renderRevenueAnalyticsModule.bind(this),
        dataFn: this.loadRevenueAnalyticsData.bind(this),
        refreshInterval: 24 * 60 * 60 * 1000, // 24 hours
        showInContext: ['team_leader'],
        showInTier: ['elite_technician', 'territory_leader'],
        showInVertical: ['kitchen_maintenance', 'cleaning_services', 'lawn_care']
      });
    }
    
    if (tier === 'territory_leader') {
      // Territory overview module (only for territory leaders)
      this.registerModule('territoryOverview', {
        title: 'Territory Overview',
        priority: 120,
        renderFn: this.renderTerritoryOverviewModule.bind(this),
        dataFn: this.loadTerritoryOverviewData.bind(this),
        refreshInterval: 24 * 60 * 60 * 1000, // 24 hours
        showInContext: ['team_leader'],
        showInTier: ['territory_leader'],
        showInVertical: ['kitchen_maintenance', 'cleaning_services', 'lawn_care']
      });
      
      // Recruitment tools module (only for territory leaders)
      this.registerModule('recruitmentTools', {
        title: 'Recruitment Tools',
        priority: 130,
        renderFn: this.renderRecruitmentToolsModule.bind(this),
        dataFn: this.loadRecruitmentToolsData.bind(this),
        refreshInterval: 24 * 60 * 60 * 1000, // 24 hours
        showInContext: ['team_leader'],
        showInTier: ['territory_leader'],
        showInVertical: ['kitchen_maintenance', 'cleaning_services', 'lawn_care']
      });
    }
  }
  
  /**
   * Register modules specific to business context
   */
  registerContextModules() {
    const context = this.config.businessContext;
    
    if (context === 'team_leader') {
      // Team schedule module (only for team leaders)
      this.registerModule('teamSchedule', {
        title: 'Team Schedule',
        priority: 65,
        renderFn: this.renderTeamScheduleModule.bind(this),
        dataFn: this.loadTeamScheduleData.bind(this),
        refreshInterval: 15 * 60 * 1000, // 15 minutes
        showInContext: ['team_leader'],
        showInTier: ['elite_technician', 'territory_leader'],
        showInVertical: ['kitchen_maintenance', 'cleaning_services', 'lawn_care']
      });
      
      // Team performance metrics module (only for team leaders)
      this.registerModule('teamMetrics', {
        title: 'Team Metrics',
        priority: 75,
        renderFn: this.renderTeamMetricsModule.bind(this),
        dataFn: this.loadTeamMetricsData.bind(this),
        refreshInterval: 60 * 60 * 1000, // 1 hour
        showInContext: ['team_leader'],
        showInTier: ['elite_technician', 'territory_leader'],
        showInVertical: ['kitchen_maintenance', 'cleaning_services', 'lawn_care']
      });
    }
  }
  
  /**
   * Register a module with the dashboard
   * @param {string} moduleId - Unique identifier for the module
   * @param {Object} moduleConfig - Configuration for the module
   */
  registerModule(moduleId, moduleConfig) {
    this.modules[moduleId] = {
      id: moduleId,
      title: moduleConfig.title || moduleId,
      priority: moduleConfig.priority || 100,
      renderFn: moduleConfig.renderFn || (data => `<div>Module ${moduleId}</div>`),
      dataFn: moduleConfig.dataFn || (() => Promise.resolve({})),
      refreshInterval: moduleConfig.refreshInterval || 60000,
      showInContext: moduleConfig.showInContext || ['solo', 'team_member', 'team_leader'],
      showInTier: moduleConfig.showInTier || ['certified_technician', 'elite_technician', 'territory_leader'],
      showInVertical: moduleConfig.showInVertical || ['kitchen_maintenance', 'cleaning_services', 'lawn_care'],
      lastRefresh: 0,
      data: {}
    };
    
    console.log(`Registered module: ${moduleId}`);
  }
  
  /**
   * Load initial data for all registered modules
   */
  async loadInitialData() {
    console.log('Loading initial dashboard data...');
    
    // Define list of visible modules based on context, tier, and vertical
    const visibleModules = Object.values(this.modules).filter(module => {
      return module.showInContext.includes(this.config.businessContext) &&
             module.showInTier.includes(this.config.providerTier) &&
             module.showInVertical.includes(this.config.serviceVertical);
    });
    
    // Load data for each visible module
    const dataPromises = visibleModules.map(module => {
      return module.dataFn()
        .then(data => {
          module.data = data;
          module.lastRefresh = Date.now();
          console.log(`Loaded data for module: ${module.id}`);
        })
        .catch(error => {
          console.error(`Error loading data for module ${module.id}:`, error);
        });
    });
    
    // Wait for all data to load
    await Promise.all(dataPromises);
    console.log('Initial data loading complete');
  }
  
  /**
   * Set up auto-refresh for modules based on their refresh intervals
   */
  setupAutoRefresh() {
    // Set up a timer to check for modules that need refreshing
    setInterval(() => {
      const now = Date.now();
      
      // Find modules that need refreshing
      const modulesByRefreshTime = Object.values(this.modules).filter(module => {
        // Only consider visible modules
        if (!module.showInContext.includes(this.config.businessContext) ||
            !module.showInTier.includes(this.config.providerTier) ||
            !module.showInVertical.includes(this.config.serviceVertical)) {
          return false;
        }
        
        // Check if it's time to refresh
        return (now - module.lastRefresh) >= module.refreshInterval;
      });
      
      // Refresh modules that need it
      modulesByRefreshTime.forEach(module => {
        module.dataFn()
          .then(data => {
            const oldData = module.data;
            module.data = data;
            module.lastRefresh = now;
            
            // Check if data has changed
            if (JSON.stringify(oldData) !== JSON.stringify(data)) {
              // Re-render just this module
              this.renderModule(module.id);
              
              // Trigger events
              this.triggerEvent('moduleDataChanged', { moduleId: module.id, data });
            }
          })
          .catch(error => {
            console.error(`Error refreshing data for module ${module.id}:`, error);
          });
      });
    }, 60000); // Check every minute
    
    console.log('Auto-refresh setup complete');
  }
  
  /**
   * Render the entire dashboard
   */
  render() {
    if (!this.dashboardElement) {
      console.error('Dashboard element not found');
      return;
    }
    
    console.log('Rendering dashboard...');
    
    // Get visible modules sorted by priority
    const visibleModules = Object.values(this.modules)
      .filter(module => {
        return module.showInContext.includes(this.config.businessContext) &&
               module.showInTier.includes(this.config.providerTier) &&
               module.showInVertical.includes(this.config.serviceVertical);
      })
      .sort((a, b) => a.priority - b.priority);
    
    // Create the dashboard HTML
    let dashboardHtml = `
      <div class="unified-dashboard" data-vertical="${this.config.serviceVertical}" data-tier="${this.config.providerTier}" data-context="${this.config.businessContext}">
        <div class="dashboard-grid-row">
    `;
    
    // Add summary modules (first 4 modules) in a grid
    const summaryModules = visibleModules.slice(0, 4);
    summaryModules.forEach(module => {
      dashboardHtml += `
        <div class="dashboard-grid-cell" id="module-${module.id}">
          <div class="dashboard-card">
            <div class="dashboard-card-header">
              <h3>${module.title}</h3>
            </div>
            <div class="dashboard-card-content">
              ${module.renderFn(module.data)}
            </div>
          </div>
        </div>
      `;
    });
    
    dashboardHtml += `
        </div>
        <div class="dashboard-grid-row">
    `;
    
    // Add remaining modules in a second grid row with larger cells
    const mainModules = visibleModules.slice(4, 7); // Next 3 modules
    mainModules.forEach(module => {
      dashboardHtml += `
        <div class="dashboard-grid-cell dashboard-grid-cell-large" id="module-${module.id}">
          <div class="dashboard-card">
            <div class="dashboard-card-header">
              <h3>${module.title}</h3>
            </div>
            <div class="dashboard-card-content">
              ${module.renderFn(module.data)}
            </div>
          </div>
        </div>
      `;
    });
    
    dashboardHtml += `
        </div>
        <div class="dashboard-grid-row">
    `;
    
    // Add final row of modules
    const finalModules = visibleModules.slice(7);
    finalModules.forEach(module => {
      dashboardHtml += `
        <div class="dashboard-grid-cell" id="module-${module.id}">
          <div class="dashboard-card">
            <div class="dashboard-card-header">
              <h3>${module.title}</h3>
            </div>
            <div class="dashboard-card-content">
              ${module.renderFn(module.data)}
            </div>
          </div>
        </div>
      `;
    });
    
    dashboardHtml += `
        </div>
      </div>
    `;
    
    // Set the dashboard content
    this.dashboardElement.innerHTML = dashboardHtml;
    
    // Trigger the dashboard rendered event
    this.triggerEvent('dashboardRendered', { modules: visibleModules });
    
    console.log('Dashboard rendering complete');
  }
  
  /**
   * Render a specific module
   * @param {string} moduleId - ID of the module to render
   */
  renderModule(moduleId) {
    const module = this.modules[moduleId];
    if (!module) {
      console.error(`Module ${moduleId} not found`);
      return;
    }
    
    const moduleElement = document.getElementById(`module-${moduleId}`);
    if (!moduleElement) {
      console.error(`Element for module ${moduleId} not found`);
      return;
    }
    
    // Update the module content
    const contentElement = moduleElement.querySelector('.dashboard-card-content');
    if (contentElement) {
      contentElement.innerHTML = module.renderFn(module.data);
      console.log(`Re-rendered module: ${moduleId}`);
      
      // Trigger the module rendered event
      this.triggerEvent('moduleRendered', { moduleId, data: module.data });
    }
  }
  
  // ---- Data Loading Methods ----
  
  /**
   * Load schedule data
   * @returns {Promise<Object>} Schedule data
   */
  async loadScheduleData() {
    const endpoint = `${this.config.apiConfig.baseUrl}${this.config.apiConfig.scheduleEndpoint}/today`;
    try {
      // In a real implementation, this would be an API call
      // For now, return sample data
      return {
        count: 3,
        completed: 0,
        jobs: [
          { id: 1, time: '9:00 AM', client: "Joe's Diner", type: 'Regular PM', status: 'pending' },
          { id: 2, time: '1:30 PM', client: 'Taco Heaven', type: 'Regular PM', status: 'pending' },
          { id: 3, time: '4:00 PM', client: 'Pasta Place', type: 'Regular PM', status: 'pending' }
        ]
      };
    } catch (error) {
      console.error('Error loading schedule data:', error);
      return { count: 0, completed: 0, jobs: [] };
    }
  }
  
  /**
   * Load performance data
   * @returns {Promise<Object>} Performance data
   */
  async loadPerformanceData() {
    try {
      // In a real implementation, this would be an API call
      return {
        rating: 97.8,
        completedJobs: 35,
        onTimeRate: 98.5,
        lastWeekChange: 2.3,
        trend: 'up'
      };
    } catch (error) {
      console.error('Error loading performance data:', error);
      return { rating: 0, completedJobs: 0, onTimeRate: 0, trend: 'neutral' };
    }
  }
  
  /**
   * Load feedback data
   * @returns {Promise<Object>} Feedback data
   */
  async loadFeedbackData() {
    try {
      // In a real implementation, this would be an API call
      return {
        score: 4.92,
        count: 42,
        recent: [
          { client: "Joe's Diner", score: 5, comment: 'Excellent service!' },
          { client: 'Pasta Place', score: 4.8, comment: 'Very thorough.' }
        ]
      };
    } catch (error) {
      console.error('Error loading feedback data:', error);
      return { score: 0, count: 0, recent: [] };
    }
  }
  
  /**
   * Load earnings data
   * @returns {Promise<Object>} Earnings data
   */
  async loadEarningsData() {
    try {
      // In a real implementation, this would be an API call
      return {
        weekly: {
          amount: 1245,
          currency: 'USD',
          changePercent: 18,
          trend: 'up'
        },
        projectedMonthly: {
          amount: 4980,
          currency: 'USD'
        }
      };
    } catch (error) {
      console.error('Error loading earnings data:', error);
      return { weekly: { amount: 0, currency: 'USD', changePercent: 0, trend: 'neutral' } };
    }
  }
  
  /**
   * Load alerts data
   * @returns {Promise<Object>} Alerts data
   */
  async loadAlertsData() {
    const endpoint = `${this.config.apiConfig.baseUrl}${this.config.apiConfig.alertsEndpoint}`;
    try {
      // In a real implementation, this would be an API call
      return {
        count: 3,
        alerts: [
          { id: 1, type: 'job_request', message: 'New job request', timestamp: '2025-05-10T10:30:00Z' },
          { id: 2, type: 'team', message: 'Team member available', timestamp: '2025-05-10T09:15:00Z' },
          { id: 3, type: 'feedback', message: 'Feedback received', timestamp: '2025-05-09T16:45:00Z' }
        ]
      };
    } catch (error) {
      console.error('Error loading alerts data:', error);
      return { count: 0, alerts: [] };
    }
  }
  
  /**
   * Load upcoming jobs data
   * @returns {Promise<Object>} Upcoming jobs data
   */
  async loadUpcomingJobsData() {
    try {
      // In a real implementation, this would be an API call
      return {
        count: 3,
        jobs: [
          { id: 1, date: '2025-05-11', time: '9:00 AM', client: "Joe's Diner", type: 'Regular PM' },
          { id: 2, date: '2025-05-11', time: '1:30 PM', client: 'Taco Heaven', type: 'Regular PM' },
          { id: 3, date: '2025-05-12', time: '11:00 AM', client: 'Pasta Place', type: 'Regular PM' }
        ]
      };
    } catch (error) {
      console.error('Error loading upcoming jobs data:', error);
      return { count: 0, jobs: [] };
    }
  }
  
  /**
   * Load team performance data
   * @returns {Promise<Object>} Team performance data
   */
  async loadTeamPerformanceData() {
    try {
      // In a real implementation, this would be an API call
      // Only applies to team leaders
      if (this.config.businessContext !== 'team_leader') {
        return null;
      }
      
      return {
        memberCount: 3,
        averageRating: 4.85,
        members: [
          { id: 1, name: 'Sarah J.', rating: 4.95, jobsCompleted: 42 },
          { id: 2, name: 'Michael T.', rating: 4.87, jobsCompleted: 38 },
          { id: 3, name: 'David R.', rating: 4.72, jobsCompleted: 35 }
        ]
      };
    } catch (error) {
      console.error('Error loading team performance data:', error);
      return null;
    }
  }
  
  /**
   * Load growth opportunities data
   * @returns {Promise<Object>} Growth opportunities data
   */
  async loadGrowthOpportunitiesData() {
    try {
      // In a real implementation, this would be an API call
      // Different opportunities based on tier and vertical
      const opportunities = [
        { id: 1, title: 'Advanced Refrigeration Course Available', type: 'training', url: '/training/refrigeration' },
        { id: 2, title: 'Team Leader Application Open', type: 'promotion', url: '/career/team-leader' },
        { id: 3, title: 'New Service Area Opening Soon', type: 'expansion', url: '/areas/expansion' },
        { id: 4, title: 'Parts Certification Module Available', type: 'certification', url: '/certification/parts' }
      ];
      
      // Filter based on current tier
      let filteredOpportunities = opportunities;
      if (this.config.providerTier === 'certified_technician') {
        filteredOpportunities = opportunities.filter(opp => 
          opp.type === 'training' || opp.type === 'certification' || opp.type === 'promotion');
      } else if (this.config.providerTier === 'elite_technician') {
        filteredOpportunities = opportunities.filter(opp => 
          opp.type === 'promotion' || opp.type === 'expansion' || opp.type === 'certification');
      }
      
      return {
        count: filteredOpportunities.length,
        opportunities: filteredOpportunities
      };
    } catch (error) {
      console.error('Error loading growth opportunities data:', error);
      return { count: 0, opportunities: [] };
    }
  }
  
  // ---- Vertical-specific data loading methods ----
  
  /**
   * Load equipment history data (kitchen maintenance)
   */
  async loadEquipmentHistoryData() {
    if (this.config.serviceVertical !== 'kitchen_maintenance') {
      return null;
    }
    
    try {
      return {
        count: 3,
        equipment: [
          { id: 1, type: 'Walk-in Cooler', brand: 'CoolMaster', client: "Joe's Diner", lastService: '2025-04-15' },
          { id: 2, type: 'Ice Machine', brand: 'IcePro', client: 'Taco Heaven', lastService: '2025-04-22' },
          { id: 3, type: 'Bar Back Cooler', brand: 'CoolMaster', client: 'Pasta Place', lastService: '2025-04-30' }
        ]
      };
    } catch (error) {
      console.error('Error loading equipment history data:', error);
      return null;
    }
  }
  
  /**
   * Load parts inventory data (kitchen maintenance)
   */
  async loadPartsInventoryData() {
    if (this.config.serviceVertical !== 'kitchen_maintenance') {
      return null;
    }
    
    try {
      return {
        count: 5,
        parts: [
          { id: 1, name: 'Compressor Relay', count: 3, reorder: false },
          { id: 2, name: 'Door Gaskets', count: 2, reorder: true },
          { id: 3, name: 'Evaporator Fan', count: 1, reorder: true },
          { id: 4, name: 'Condenser Fan Motor', count: 2, reorder: false },
          { id: 5, name: 'Defrost Timer', count: 4, reorder: false }
        ]
      };
    } catch (error) {
      console.error('Error loading parts inventory data:', error);
      return null;
    }
  }
  
  /**
   * Load cleaning checklists data (cleaning services)
   */
  async loadCleaningChecklistsData() {
    if (this.config.serviceVertical !== 'cleaning_services') {
      return null;
    }
    
    try {
      return {
        count: 3,
        checklists: [
          { id: 1, name: 'Standard Home Cleaning', items: 15, lastUpdated: '2025-04-30' },
          { id: 2, name: 'Deep Cleaning', items: 25, lastUpdated: '2025-04-30' },
          { id: 3, name: 'Office Cleaning', items: 18, lastUpdated: '2025-04-30' }
        ]
      };
    } catch (error) {
      console.error('Error loading cleaning checklists data:', error);
      return null;
    }
  }
  
  /**
   * Load supply inventory data (cleaning services)
   */
  async loadSupplyInventoryData() {
    if (this.config.serviceVertical !== 'cleaning_services') {
      return null;
    }
    
    try {
      return {
        count: 5,
        supplies: [
          { id: 1, name: 'All-Purpose Cleaner', count: 8, reorder: false },
          { id: 2, name: 'Microfiber Cloths', count: 12, reorder: false },
          { id: 3, name: 'Floor Cleaner', count: 2, reorder: true },
          { id: 4, name: 'Bathroom Cleaner', count: 3, reorder: false },
          { id: 5, name: 'Glass Cleaner', count: 1, reorder: true }
        ]
      };
    } catch (error) {
      console.error('Error loading supply inventory data:', error);
      return null;
    }
  }
  
  /**
   * Load property maps data (lawn care)
   */
  async loadPropertyMapsData() {
    if (this.config.serviceVertical !== 'lawn_care') {
      return null;
    }
    
    try {
      return {
        count: 3,
        properties: [
          { id: 1, name: '123 Main St', size: '0.5 acre', lastService: '2025-04-30' },
          { id: 2, name: '456 Oak Ave', size: '0.75 acre', lastService: '2025-05-02' },
          { id: 3, name: '789 Pine Rd', size: '0.25 acre', lastService: '2025-05-05' }
        ]
      };
    } catch (error) {
      console.error('Error loading property maps data:', error);
      return null;
    }
  }
  
  /**
   * Load weather alerts data (lawn care)
   */
  async loadWeatherAlertsData() {
    if (this.config.serviceVertical !== 'lawn_care') {
      return null;
    }
    
    try {
      return {
        count: 2,
        alerts: [
          { id: 1, type: 'rain', message: 'Heavy rain expected tomorrow', affects: 3 },
          { id: 2, type: 'heat', message: 'Heat advisory for the weekend', affects: 5 }
        ]
      };
    } catch (error) {
      console.error('Error loading weather alerts data:', error);
      return null;
    }
  }
  
  // ---- Tier-specific data loading methods ----
  
  /**
   * Load revenue analytics data (elite_technician, territory_leader)
   */
  async loadRevenueAnalyticsData() {
    if (this.config.providerTier !== 'elite_technician' && this.config.providerTier !== 'territory_leader') {
      return null;
    }
    
    try {
      return {
        weekly: 1245,
        monthly: 4980,
        projectedAnnual: 59760,
        topServices: [
          { name: 'Regular PM', revenue: 850, count: 17 },
          { name: 'Deep Cleaning', revenue: 395, count: 5 }
        ]
      };
    } catch (error) {
      console.error('Error loading revenue analytics data:', error);
      return null;
    }
  }
  
  /**
   * Load territory overview data (territory_leader)
   */
  async loadTerritoryOverviewData() {
    if (this.config.providerTier !== 'territory_leader') {
      return null;
    }
    
    try {
      return {
        name: 'East Memphis',
        providerCount: 5,
        customerCount: 42,
        serviceRequestsWeekly: 38,
        fulfillmentRate: 92,
        growth: 18
      };
    } catch (error) {
      console.error('Error loading territory overview data:', error);
      return null;
    }
  }
  
  /**
   * Load recruitment tools data (territory_leader)
   */
  async loadRecruitmentToolsData() {
    if (this.config.providerTier !== 'territory_leader') {
      return null;
    }
    
    try {
      return {
        openPositions: 2,
        applicants: 5,
        interviewsScheduled: 2,
        referralBonusActive: true
      };
    } catch (error) {
      console.error('Error loading recruitment tools data:', error);
      return null;
    }
  }
  
  // ---- Context-specific data loading methods ----
  
  /**
   * Load team schedule data (team_leader)
   */
  async loadTeamScheduleData() {
    if (this.config.businessContext !== 'team_leader') {
      return null;
    }
    
    try {
      return {
        date: '2025-05-10',
        members: [
          { 
            id: 1, 
            name: 'Sarah J.',
            jobs: [
              { time: '9:00 AM', client: 'Memphis Grill', type: 'Regular PM' },
              { time: '1:30 PM', client: 'Downtown Cafe', type: 'Regular PM' }
            ]
          },
          { 
            id: 2, 
            name: 'Michael T.',
            jobs: [
              { time: '10:00 AM', client: 'Beale Street Kitchen', type: 'Regular PM' },
              { time: '2:30 PM', client: 'Cooper-Young Gastropub', type: 'Regular PM' }
            ]
          },
          { 
            id: 3, 
            name: 'David R.',
            jobs: [
              { time: '11:00 AM', client: 'Fresh Start Bakery', type: 'Regular PM' },
              { time: '3:30 PM', client: 'Riverside Catering', type: 'Regular PM' }
            ]
          }
        ]
      };
    } catch (error) {
      console.error('Error loading team schedule data:', error);
      return null;
    }
  }
  
  /**
   * Load team metrics data (team_leader)
   */
  async loadTeamMetricsData() {
    if (this.config.businessContext !== 'team_leader') {
      return null;
    }
    
    try {
      return {
        overallRating: 4.85,
        weeklyJobs: 25,
        onTimeRate: 96,
        customerRetention: 98,
        memberMetrics: [
          { id: 1, name: 'Sarah J.', rating: 4.95, onTimeRate: 98, efficiency: 97 },
          { id: 2, name: 'Michael T.', rating: 4.87, onTimeRate: 95, efficiency: 92 },
          { id: 3, name: 'David R.', rating: 4.72, onTimeRate: 94, efficiency: 88 }
        ]
      };
    } catch (error) {
      console.error('Error loading team metrics data:', error);
      return null;
    }
  }
  
  // ---- Rendering Methods ----
  
  /**
   * Render the schedule module
   * @param {Object} data - Schedule data
   * @returns {string} HTML for the schedule module
   */
  renderScheduleModule(data) {
    if (!data || !data.jobs) {
      return '<div class="loading-placeholder">Loading schedule...</div>';
    }
    
    return `
      <div class="schedule-module">
        <div class="stat-highlight">${data.count}</div>
        <div class="stat-label">Jobs Today</div>
        <div class="progress-container">
          <div class="progress-bar" style="width: ${(data.completed / data.count) * 100}%"></div>
        </div>
        <div class="progress-text">${data.completed} completed</div>
      </div>
    `;
  }
  
  /**
   * Render the performance module
   * @param {Object} data - Performance data
   * @returns {string} HTML for the performance module
   */
  renderPerformanceModule(data) {
    if (!data) {
      return '<div class="loading-placeholder">Loading performance data...</div>';
    }
    
    const trendIndicator = data.trend === 'up' 
      ? '<span class="trend-up">↑</span>'
      : data.trend === 'down'
        ? '<span class="trend-down">↓</span>'
        : '';
    
    return `
      <div class="performance-module">
        <div class="stat-highlight">${data.rating}%</div>
        <div class="stat-label">Performance Score ${trendIndicator}</div>
        <div class="performance-details">
          <div class="detail-item">
            <span class="detail-label">Completed Jobs:</span>
            <span class="detail-value">${data.completedJobs}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">On-Time Rate:</span>
            <span class="detail-value">${data.onTimeRate}%</span>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render the feedback module
   * @param {Object} data - Feedback data
   * @returns {string} HTML for the feedback module
   */
  renderFeedbackModule(data) {
    if (!data) {
      return '<div class="loading-placeholder">Loading feedback data...</div>';
    }
    
    return `
      <div class="feedback-module">
        <div class="stat-highlight">${data.score}/5</div>
        <div class="stat-label">Customer Rating</div>
        <div class="rating-stars">
          ${this.renderStars(data.score)}
        </div>
        <div class="feedback-count">Based on ${data.count} reviews</div>
      </div>
    `;
  }
  
  /**
   * Render the earnings module
   * @param {Object} data - Earnings data
   * @returns {string} HTML for the earnings module
   */
  renderEarningsModule(data) {
    if (!data || !data.weekly) {
      return '<div class="loading-placeholder">Loading earnings data...</div>';
    }
    
    const trendIndicator = data.weekly.trend === 'up'
      ? `<span class="trend-up">↑ ${data.weekly.changePercent}%</span>`
      : data.weekly.trend === 'down'
        ? `<span class="trend-down">↓ ${data.weekly.changePercent}%</span>`
        : '';
    
    return `
      <div class="earnings-module">
        <div class="stat-highlight">$${data.weekly.amount}</div>
        <div class="stat-label">This Week ${trendIndicator}</div>
        ${data.projectedMonthly ? `
          <div class="earnings-projection">
            <span class="projection-label">Projected Monthly:</span>
            <span class="projection-value">$${data.projectedMonthly.amount}</span>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  /**
   * Render the alerts module
   * @param {Object} data - Alerts data
   * @returns {string} HTML for the alerts module
   */
  renderAlertsModule(data) {
    if (!data || !data.alerts) {
      return '<div class="loading-placeholder">Loading alerts...</div>';
    }
    
    let alertsHtml = '';
    if (data.alerts.length > 0) {
      alertsHtml = '<ul class="alerts-list">';
      data.alerts.slice(0, 3).forEach(alert => {
        alertsHtml += `
          <li class="alert-item alert-${alert.type}">
            <div class="alert-icon"></div>
            <div class="alert-content">
              <div class="alert-message">${alert.message}</div>
              <div class="alert-time">${this.formatTimestamp(alert.timestamp)}</div>
            </div>
          </li>
        `;
      });
      alertsHtml += '</ul>';
    } else {
      alertsHtml = '<div class="no-alerts">No new alerts</div>';
    }
    
    return `
      <div class="alerts-module">
        ${alertsHtml}
        ${data.count > 3 ? `<a class="view-all-link">View all ${data.count} alerts</a>` : ''}
      </div>
    `;
  }
  
  /**
   * Render the upcoming jobs module
   * @param {Object} data - Upcoming jobs data
   * @returns {string} HTML for the upcoming jobs module
   */
  renderUpcomingJobsModule(data) {
    if (!data || !data.jobs) {
      return '<div class="loading-placeholder">Loading upcoming jobs...</div>';
    }
    
    let jobsHtml = '';
    if (data.jobs.length > 0) {
      jobsHtml = '<table class="jobs-table">';
      jobsHtml += `
        <thead>
          <tr>
            <th>Time</th>
            <th>Client</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
      `;
      
      data.jobs.forEach(job => {
        jobsHtml += `
          <tr>
            <td>${job.time}</td>
            <td>${job.client}</td>
            <td>${job.type}</td>
          </tr>
        `;
      });
      
      jobsHtml += '</tbody></table>';
    } else {
      jobsHtml = '<div class="no-jobs">No upcoming jobs</div>';
    }
    
    return `
      <div class="upcoming-jobs-module">
        ${jobsHtml}
        ${data.count > 5 ? `<a class="view-all-link">View all ${data.count} jobs</a>` : ''}
      </div>
    `;
  }
  
  /**
   * Render the team performance module
   * @param {Object} data - Team performance data
   * @returns {string} HTML for the team performance module
   */
  renderTeamPerformanceModule(data) {
    if (!data || !data.members) {
      return '<div class="loading-placeholder">Loading team data...</div>';
    }
    
    let membersHtml = '';
    if (data.members.length > 0) {
      membersHtml = '<table class="team-table">';
      membersHtml += `
        <thead>
          <tr>
            <th>Member</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
      `;
      
      data.members.forEach(member => {
        membersHtml += `
          <tr>
            <td>${member.name}</td>
            <td>${member.rating}/5</td>
          </tr>
        `;
      });
      
      membersHtml += '</tbody></table>';
    } else {
      membersHtml = '<div class="no-members">No team members</div>';
    }
    
    return `
      <div class="team-performance-module">
        ${membersHtml}
      </div>
    `;
  }
  
  /**
   * Render the growth opportunities module
   * @param {Object} data - Growth opportunities data
   * @returns {string} HTML for the growth opportunities module
   */
  renderGrowthOpportunitiesModule(data) {
    if (!data || !data.opportunities) {
      return '<div class="loading-placeholder">Loading opportunities...</div>';
    }
    
    let opportunitiesHtml = '';
    if (data.opportunities.length > 0) {
      opportunitiesHtml = '<ul class="opportunities-list">';
      
      data.opportunities.forEach(opportunity => {
        opportunitiesHtml += `
          <li class="opportunity-item opportunity-${opportunity.type}">
            <div class="opportunity-icon"></div>
            <div class="opportunity-content">
              <div class="opportunity-title">${opportunity.title}</div>
            </div>
          </li>
        `;
      });
      
      opportunitiesHtml += '</ul>';
    } else {
      opportunitiesHtml = '<div class="no-opportunities">No growth opportunities available</div>';
    }
    
    return `
      <div class="growth-opportunities-module">
        ${opportunitiesHtml}
      </div>
    `;
  }
  
  // ---- Vertical-specific rendering methods ----
  
  /**
   * Render the equipment history module (kitchen maintenance)
   */
  renderEquipmentHistoryModule(data) {
    if (!data || !data.equipment) {
      return '<div class="loading-placeholder">Loading equipment history...</div>';
    }
    
    let equipmentHtml = '';
    if (data.equipment.length > 0) {
      equipmentHtml = '<table class="equipment-table">';
      equipmentHtml += `
        <thead>
          <tr>
            <th>Equipment</th>
            <th>Client</th>
            <th>Last Service</th>
          </tr>
        </thead>
        <tbody>
      `;
      
      data.equipment.forEach(item => {
        equipmentHtml += `
          <tr>
            <td>${item.type}</td>
            <td>${item.client}</td>
            <td>${item.lastService}</td>
          </tr>
        `;
      });
      
      equipmentHtml += '</tbody></table>';
    } else {
      equipmentHtml = '<div class="no-equipment">No equipment history</div>';
    }
    
    return `
      <div class="equipment-history-module">
        ${equipmentHtml}
      </div>
    `;
  }
  
  /**
   * Render the parts inventory module (kitchen maintenance)
   */
  renderPartsInventoryModule(data) {
    if (!data || !data.parts) {
      return '<div class="loading-placeholder">Loading parts inventory...</div>';
    }
    
    let partsHtml = '';
    if (data.parts.length > 0) {
      partsHtml = '<table class="parts-table">';
      partsHtml += `
        <thead>
          <tr>
            <th>Part</th>
            <th>Count</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
      `;
      
      data.parts.forEach(part => {
        const status = part.reorder 
          ? '<span class="status-warning">Reorder</span>'
          : '<span class="status-ok">OK</span>';
          
        partsHtml += `
          <tr>
            <td>${part.name}</td>
            <td>${part.count}</td>
            <td>${status}</td>
          </tr>
        `;
      });
      
      partsHtml += '</tbody></table>';
    } else {
      partsHtml = '<div class="no-parts">No parts in inventory</div>';
    }
    
    return `
      <div class="parts-inventory-module">
        ${partsHtml}
      </div>
    `;
  }
  
  /**
   * Render the cleaning checklists module (cleaning services)
   */
  renderCleaningChecklistsModule(data) {
    if (!data || !data.checklists) {
      return '<div class="loading-placeholder">Loading cleaning checklists...</div>';
    }
    
    let checklistsHtml = '';
    if (data.checklists.length > 0) {
      checklistsHtml = '<ul class="checklists-list">';
      
      data.checklists.forEach(checklist => {
        checklistsHtml += `
          <li class="checklist-item">
            <div class="checklist-info">
              <div class="checklist-name">${checklist.name}</div>
              <div class="checklist-details">${checklist.items} items</div>
            </div>
            <div class="checklist-actions">
              <button class="btn-small">View</button>
            </div>
          </li>
        `;
      });
      
      checklistsHtml += '</ul>';
    } else {
      checklistsHtml = '<div class="no-checklists">No checklists available</div>';
    }
    
    return `
      <div class="cleaning-checklists-module">
        ${checklistsHtml}
      </div>
    `;
  }
  
  /**
   * Render the supply inventory module (cleaning services)
   */
  renderSupplyInventoryModule(data) {
    if (!data || !data.supplies) {
      return '<div class="loading-placeholder">Loading supply inventory...</div>';
    }
    
    let suppliesHtml = '';
    if (data.supplies.length > 0) {
      suppliesHtml = '<table class="supplies-table">';
      suppliesHtml += `
        <thead>
          <tr>
            <th>Supply</th>
            <th>Count</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
      `;
      
      data.supplies.forEach(supply => {
        const status = supply.reorder 
          ? '<span class="status-warning">Reorder</span>'
          : '<span class="status-ok">OK</span>';
          
        suppliesHtml += `
          <tr>
            <td>${supply.name}</td>
            <td>${supply.count}</td>
            <td>${status}</td>
          </tr>
        `;
      });
      
      suppliesHtml += '</tbody></table>';
    } else {
      suppliesHtml = '<div class="no-supplies">No supplies in inventory</div>';
    }
    
    return `
      <div class="supply-inventory-module">
        ${suppliesHtml}
      </div>
    `;
  }
  
  /**
   * Render the property maps module (lawn care)
   */
  renderPropertyMapsModule(data) {
    if (!data || !data.properties) {
      return '<div class="loading-placeholder">Loading property maps...</div>';
    }
    
    let propertiesHtml = '';
    if (data.properties.length > 0) {
      propertiesHtml = '<ul class="properties-list">';
      
      data.properties.forEach(property => {
        propertiesHtml += `
          <li class="property-item">
            <div class="property-info">
              <div class="property-name">${property.name}</div>
              <div class="property-details">${property.size}</div>
            </div>
            <div class="property-actions">
              <button class="btn-small">View Map</button>
            </div>
          </li>
        `;
      });
      
      propertiesHtml += '</ul>';
    } else {
      propertiesHtml = '<div class="no-properties">No properties available</div>';
    }
    
    return `
      <div class="property-maps-module">
        ${propertiesHtml}
      </div>
    `;
  }
  
  /**
   * Render the weather alerts module (lawn care)
   */
  renderWeatherAlertsModule(data) {
    if (!data || !data.alerts) {
      return '<div class="loading-placeholder">Loading weather alerts...</div>';
    }
    
    let alertsHtml = '';
    if (data.alerts.length > 0) {
      alertsHtml = '<ul class="weather-alerts-list">';
      
      data.alerts.forEach(alert => {
        alertsHtml += `
          <li class="weather-alert weather-alert-${alert.type}">
            <div class="weather-alert-icon"></div>
            <div class="weather-alert-content">
              <div class="weather-alert-message">${alert.message}</div>
              <div class="weather-alert-impact">Affects ${alert.affects} properties</div>
            </div>
          </li>
        `;
      });
      
      alertsHtml += '</ul>';
    } else {
      alertsHtml = '<div class="no-weather-alerts">No weather alerts</div>';
    }
    
    return `
      <div class="weather-alerts-module">
        ${alertsHtml}
      </div>
    `;
  }
  
  // ---- Tier-specific rendering methods ----
  
  /**
   * Render the revenue analytics module (elite_technician, territory_leader)
   */
  renderRevenueAnalyticsModule(data) {
    if (!data) {
      return '<div class="loading-placeholder">Loading revenue analytics...</div>';
    }
    
    return `
      <div class="revenue-analytics-module">
        <div class="revenue-summary">
          <div class="revenue-item">
            <div class="revenue-label">Weekly</div>
            <div class="revenue-value">$${data.weekly}</div>
          </div>
          <div class="revenue-item">
            <div class="revenue-label">Monthly</div>
            <div class="revenue-value">$${data.monthly}</div>
          </div>
          <div class="revenue-item">
            <div class="revenue-label">Projected Annual</div>
            <div class="revenue-value">$${data.projectedAnnual}</div>
          </div>
        </div>
        ${data.topServices && data.topServices.length > 0 ? `
          <div class="top-services">
            <div class="section-label">Top Services</div>
            <table class="top-services-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Revenue</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                ${data.topServices.map(service => `
                  <tr>
                    <td>${service.name}</td>
                    <td>$${service.revenue}</td>
                    <td>${service.count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  /**
   * Render the territory overview module (territory_leader)
   */
  renderTerritoryOverviewModule(data) {
    if (!data) {
      return '<div class="loading-placeholder">Loading territory overview...</div>';
    }
    
    return `
      <div class="territory-overview-module">
        <div class="territory-name">${data.name}</div>
        <div class="territory-stats">
          <div class="territory-stat">
            <div class="stat-value">${data.providerCount}</div>
            <div class="stat-label">Providers</div>
          </div>
          <div class="territory-stat">
            <div class="stat-value">${data.customerCount}</div>
            <div class="stat-label">Customers</div>
          </div>
          <div class="territory-stat">
            <div class="stat-value">${data.serviceRequestsWeekly}</div>
            <div class="stat-label">Weekly Requests</div>
          </div>
          <div class="territory-stat">
            <div class="stat-value">${data.fulfillmentRate}%</div>
            <div class="stat-label">Fulfillment Rate</div>
          </div>
        </div>
        <div class="territory-growth">
          <div class="growth-label">YoY Growth</div>
          <div class="growth-value">${data.growth}%</div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render the recruitment tools module (territory_leader)
   */
  renderRecruitmentToolsModule(data) {
    if (!data) {
      return '<div class="loading-placeholder">Loading recruitment tools...</div>';
    }
    
    return `
      <div class="recruitment-tools-module">
        <div class="recruitment-stats">
          <div class="recruitment-stat">
            <div class="stat-value">${data.openPositions}</div>
            <div class="stat-label">Open Positions</div>
          </div>
          <div class="recruitment-stat">
            <div class="stat-value">${data.applicants}</div>
            <div class="stat-label">Applicants</div>
          </div>
          <div class="recruitment-stat">
            <div class="stat-value">${data.interviewsScheduled}</div>
            <div class="stat-label">Interviews</div>
          </div>
        </div>
        ${data.referralBonusActive ? `
          <div class="referral-bonus active">
            <div class="bonus-icon">🎉</div>
            <div class="bonus-text">Referral Bonus Active</div>
          </div>
        ` : ''}
        <div class="recruitment-actions">
          <button class="btn-primary">Post New Position</button>
          <button class="btn-outline">Review Applicants</button>
        </div>
      </div>
    `;
  }
  
  // ---- Context-specific rendering methods ----
  
  /**
   * Render the team schedule module (team_leader)
   */
  renderTeamScheduleModule(data) {
    if (!data || !data.members) {
      return '<div class="loading-placeholder">Loading team schedule...</div>';
    }
    
    return `
      <div class="team-schedule-module">
        <div class="schedule-date">${data.date}</div>
        <div class="team-schedules">
          ${data.members.map(member => `
            <div class="member-schedule">
              <div class="member-name">${member.name}</div>
              ${member.jobs && member.jobs.length > 0 ? `
                <ul class="job-list">
                  ${member.jobs.map(job => `
                    <li class="job-item">
                      <div class="job-time">${job.time}</div>
                      <div class="job-details">
                        <div class="job-client">${job.client}</div>
                        <div class="job-type">${job.type}</div>
                      </div>
                    </li>
                  `).join('')}
                </ul>
              ` : `<div class="no-jobs">No jobs scheduled</div>`}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  /**
   * Render the team metrics module (team_leader)
   */
  renderTeamMetricsModule(data) {
    if (!data) {
      return '<div class="loading-placeholder">Loading team metrics...</div>';
    }
    
    return `
      <div class="team-metrics-module">
        <div class="team-metrics-summary">
          <div class="metric-item">
            <div class="metric-value">${data.overallRating}/5</div>
            <div class="metric-label">Team Rating</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">${data.weeklyJobs}</div>
            <div class="metric-label">Weekly Jobs</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">${data.onTimeRate}%</div>
            <div class="metric-label">On-Time Rate</div>
          </div>
        </div>
        ${data.memberMetrics && data.memberMetrics.length > 0 ? `
          <table class="team-metrics-table">
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Rating</th>
                <th>On-Time</th>
                <th>Efficiency</th>
              </tr>
            </thead>
            <tbody>
              ${data.memberMetrics.map(member => `
                <tr>
                  <td>${member.name}</td>
                  <td>${member.rating}/5</td>
                  <td>${member.onTimeRate}%</td>
                  <td>${member.efficiency}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      </div>
    `;
  }
  
  // ---- Utility Methods ----
  
  /**
   * Add an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
  
  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  off(event, callback) {
    if (!this.eventListeners[event]) {
      return;
    }
    this.eventListeners[event] = this.eventListeners[event]
      .filter(cb => cb !== callback);
  }
  
  /**
   * Trigger an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  triggerEvent(event, data) {
    if (!this.eventListeners[event]) {
      return;
    }
    this.eventListeners[event].forEach(callback => {
      callback(data);
    });
  }
  
  /**
   * Render star rating
   * @param {number} score - Rating score
   * @returns {string} Star rating HTML
   */
  renderStars(score) {
    const fullStars = Math.floor(score);
    const hasHalfStar = score - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHtml = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<span class="star star-full">★</span>';
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      starsHtml += '<span class="star star-half">★</span>';
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<span class="star star-empty">☆</span>';
    }
    
    return starsHtml;
  }
  
  /**
   * Format timestamp
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted timestamp
   */
  formatTimestamp(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

// Export the module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UnifiedDashboard };
} else {
  window.UnifiedDashboard = UnifiedDashboard;
}