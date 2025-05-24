/**
 * PM Workflow Usage Example
 * Demonstrates how to integrate PM workflow with the unified dashboard framework
 */

// Import required modules
const { UnifiedDashboard } = require('./unified-dashboard-core');
const databaseService = require('./sqlite-service');
const PMWorkflow = require('./pm-workflow');
const PMComponent = require('./pm-component');
const { RapidProDashboard } = require('./integration-example');

/**
 * Initialize the dashboard with PM workflow
 * @param {string} containerId - Dashboard container ID
 * @param {string} pmContainerId - PM workflow container ID
 * @param {string} mode - 'normal' or 'bridge-building'
 */
async function initializeDashboard(containerId, pmContainerId, mode = 'normal') {
  // Initialize the database first
  await databaseService.initialize();
  
  // Initialize the dashboard
  const userId = 'current-user-id'; // Replace with actual user ID
  const userRole = 'technician'; // Replace with actual user role
  
  // Create dashboard instance
  const dashboard = new RapidProDashboard(userId, userRole, mode);
  
  // Initialize dashboard
  await dashboard.initialize(containerId);
  
  // Create and initialize PM workflow
  const workflow = new PMWorkflow(databaseService);
  await workflow.initialize(mode === 'bridge-building');
  
  // Create and initialize PM component
  const pmComponent = new PMComponent(workflow, {
    containerSelector: `#${pmContainerId}`,
    onSessionStart: (session) => {
      console.log('PM session started:', session);
      
      // Update dashboard UI if needed
      // For example, update today's schedule card
      const scheduleModule = document.querySelector('#module-schedule .dashboard-card-content');
      if (scheduleModule) {
        const jobCount = parseInt(scheduleModule.querySelector('.stat-highlight').textContent) || 0;
        scheduleModule.querySelector('.stat-highlight').textContent = jobCount + 1;
      }
    },
    onSessionComplete: () => {
      console.log('PM session completed');
      
      // Update dashboard UI if needed
      // For example, update today's schedule card
      const scheduleModule = document.querySelector('#module-schedule .dashboard-card-content');
      if (scheduleModule) {
        const jobCount = parseInt(scheduleModule.querySelector('.stat-highlight').textContent) || 0;
        const completedCount = parseInt(scheduleModule.querySelector('.progress-text').textContent.split(' ')[0]) || 0;
        
        scheduleModule.querySelector('.progress-text').textContent = `${completedCount + 1} completed`;
        scheduleModule.querySelector('.progress-bar').style.width = `${(completedCount + 1) / jobCount * 100}%`;
      }
      
      // Trigger sync to upload the completed session data
      databaseService.sync();
    },
    onSessionCancel: (reason) => {
      console.log('PM session cancelled:', reason);
      
      // Trigger sync to upload the cancelled session data
      databaseService.sync();
    }
  });
  
  pmComponent.initialize();
  
  // Register custom module for PM workflow
  dashboard.registerModule('pmWorkflow', {
    title: mode === 'bridge-building' ? 'Bridge Building Workflow' : 'PM Workflow',
    priority: 25, // High priority to appear near the top
    renderFn: () => {
      return `
        <div class="pm-workflow-module">
          <div id="${pmContainerId}">
            <!-- PM workflow will be rendered here -->
          </div>
        </div>
      `;
    },
    dataFn: async () => {
      // Return workflow data for the module
      const activeSession = workflow.currentSession;
      
      if (activeSession) {
        const sessionData = JSON.parse(activeSession.data || '{}');
        const steps = workflow.getStepsWithStatus();
        const completedCount = steps.filter(step => step.completed).length;
        const totalSteps = steps.length;
        
        return {
          hasActiveSession: true,
          customer: activeSession.customer_name,
          progress: {
            current: workflow.currentStep,
            completed: completedCount,
            total: totalSteps,
            percentage: Math.round((completedCount / totalSteps) * 100)
          }
        };
      } else {
        return {
          hasActiveSession: false
        };
      }
    },
    refreshInterval: 30 * 1000, // 30 seconds
    showInContext: ['solo', 'team_member', 'team_leader'],
    showInTier: ['certified_technician', 'elite_technician', 'territory_leader'],
    showInVertical: ['kitchen_maintenance']
  });
  
  // Force render to include the new module
  dashboard.render();
  
  return { dashboard, workflow, pmComponent };
}

/**
 * Bridge Building Mode Example
 */
async function initializeBridgeBuildingMode(dashboardContainerId, pmContainerId) {
  // Initialize in bridge building mode
  return initializeDashboard(dashboardContainerId, pmContainerId, 'bridge-building');
}

/**
 * Normal PM Mode Example
 */
async function initializeNormalMode(dashboardContainerId, pmContainerId) {
  // Initialize in normal mode
  return initializeDashboard(dashboardContainerId, pmContainerId, 'normal');
}

// Export the initialization functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeBridgeBuildingMode,
    initializeNormalMode
  };
} else {
  window.initializeBridgeBuildingMode = initializeBridgeBuildingMode;
  window.initializeNormalMode = initializeNormalMode;
}

// Usage example
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', async () => {
    // Check URL parameters for mode
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') === 'bridge' ? 'bridge-building' : 'normal';
    
    // Initialize dashboard with the appropriate mode
    await initializeDashboard('dashboard-container', 'pm-workflow-container', mode);
    
    console.log(`Dashboard initialized in ${mode} mode`);
  });
}