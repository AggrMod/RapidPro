# Unified Dashboard Implementation Plan

## Overview

This implementation plan outlines how to integrate the Control Center Dashboard framework across both the Memphis Cleaning Business and Rapid-Pro Maintenance projects, focusing on back-end changes that won't disrupt the current front-end user experience. The approach will be modular, allowing for gradual adoption of the new framework.

## Database Model Enhancements

### 1. Service Provider Tier System (Memphis Cleaning)

Extend the ServiceProvider model to include tier levels that align with the unified dashboard framework:

```typescript
// Add to ServiceProvider.ts
export enum ServiceProviderTier {
  CERTIFIED_TECHNICIAN = 'certified_technician',  // Tier 1
  ELITE_TECHNICIAN = 'elite_technician',          // Tier 2
  TERRITORY_LEADER = 'territory_leader'           // Tier 3
}

// Add to ServiceProvider schema
tier: {
  type: String,
  enum: Object.values(ServiceProviderTier),
  default: ServiceProviderTier.CERTIFIED_TECHNICIAN
},
tierProgress: {
  type: Number,
  default: 0, // Percentage progress to next tier
},
teamMembers: [{
  type: Schema.Types.ObjectId,
  ref: 'ServiceProvider'
}],
teamMetrics: {
  memberCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 }
}
```

### 2. Equipment and Service Vertical (Rapid-Pro Maintenance)

Create a more structured approach to service verticals:

```javascript
// New service-verticals.json file
[
  {
    "id": "kitchen_maintenance",
    "name": "Commercial Kitchen Maintenance",
    "modules": ["equipment_history", "temperature_logs", "part_inventory", "certifications", "documentation_library"],
    "equipment": ["walk_in_cooler", "reach_in_freezer", "prep_table", "ice_machine", "bar_cooler"]
  },
  {
    "id": "cleaning_services",
    "name": "Cleaning Services",
    "modules": ["cleaning_checklists", "supply_inventory", "verification", "photo_uploads", "access_instructions"],
    "equipment": []
  },
  {
    "id": "lawn_care",
    "name": "Lawn Care",
    "modules": ["property_maps", "service_frequency", "seasonal_tasks", "weather_alerts", "equipment_maintenance"],
    "equipment": []
  }
]
```

## API Enhancements

### 1. Provider Dashboard API (Memphis Cleaning)

Create a new controller to serve unified dashboard data:

```typescript
// src/controllers/dashboardController.ts
import { Request, Response } from 'express';
import { ServiceProvider, ServiceProviderTier } from '../models/ServiceProvider';
import { Booking, BookingStatus } from '../models/Booking';
import { logger } from '../utils/logger';

/**
 * Get provider dashboard data
 * @route GET /api/dashboard/provider
 * @access Private (Provider)
 */
export const getProviderDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const providerId = req.user.id;
    
    // Get the service provider profile
    const provider = await ServiceProvider.findOne({ user: providerId });
    if (!provider) {
      res.status(404).json({ success: false, message: 'Service provider not found' });
      return;
    }
    
    // Get today's schedule
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayBookings = await Booking.find({
      serviceProvider: provider._id,
      date: { $gte: today, $lt: tomorrow },
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] }
    }).populate('customer', 'firstName lastName');
    
    // Get performance data
    const performanceData = {
      rating: provider.ratings.average || 0,
      completedJobs: 0,
      onTimeRate: 0,
      customerSatisfaction: 0
    };
    
    // Get current week earnings
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    
    const weeklyEarnings = await calculateWeeklyEarnings(provider._id, startOfWeek, endOfWeek);
    
    // Get feedback data
    const feedbackScore = provider.ratings.average || 0;
    
    // Get alerts and notifications
    const alerts = []; // To be populated with actual alerts
    
    // Get team data if the provider is a team leader
    let teamData = null;
    if (provider.tier === ServiceProviderTier.TERRITORY_LEADER) {
      teamData = await getTeamPerformanceData(provider._id);
    }
    
    // Get growth opportunities based on provider tier
    const growthOpportunities = getGrowthOpportunities(provider.tier);
    
    // Send response
    res.status(200).json({
      success: true,
      dashboardData: {
        schedule: {
          today: todayBookings
        },
        performance: performanceData,
        earnings: {
          weekly: weeklyEarnings
        },
        feedback: {
          score: feedbackScore
        },
        alerts: alerts,
        team: teamData,
        growthOpportunities: growthOpportunities,
        tier: provider.tier,
        serviceVertical: 'cleaning_services' // Default for Memphis Cleaning
      }
    });
  } catch (error) {
    logger.error(`Dashboard data error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper functions
async function calculateWeeklyEarnings(providerId, startDate, endDate) {
  // Implement earnings calculation logic
  return {
    amount: 1245,
    currency: 'USD',
    changePercent: 18,
    trend: 'up'
  };
}

async function getTeamPerformanceData(leaderId) {
  // Implement team performance data retrieval
  return {
    members: [
      { name: 'Sarah J.', rating: 4.95, completedJobs: 23 },
      { name: 'Michael T.', rating: 4.87, completedJobs: 19 },
      { name: 'David R.', rating: 4.72, completedJobs: 17 }
    ],
    averageRating: 4.85,
    totalJobs: 59
  };
}

function getGrowthOpportunities(tier) {
  // Return different opportunities based on tier
  const opportunities = [
    { title: 'Advanced Cleaning Techniques Course Available', type: 'training', url: '/training/advanced-cleaning' },
    { title: 'Team Leader Application Open', type: 'promotion', url: '/career/team-leader-application' },
    { title: 'New Service Area Opening Soon', type: 'expansion', url: '/service-areas/expansion' },
    { title: 'Equipment Certification Module Available', type: 'certification', url: '/certifications/equipment' }
  ];
  
  return opportunities;
}
```

### 2. Bridge Building Integration (Rapid-Pro Maintenance)

Enhance the existing bridge building mode with the unified dashboard structure:

```javascript
// Modified bridge-building-implementation.js

// Import the unified dashboard structure
import { UnifiedDashboard } from './unified-dashboard.js';

class BridgeBuildingDashboard extends UnifiedDashboard {
  constructor() {
    super({
      serviceVertical: 'kitchen_maintenance',
      providerTier: 'certified_technician', // Default tier
      businessContext: 'solo' // Default context
    });
    
    // Initialize bridge building specific features
    this.initBridgeBuilding();
  }
  
  initBridgeBuilding() {
    // Override standard modules with bridge building focused versions
    this.modules.pmWorkflow = {
      title: 'Visit Workflow',
      steps: [
        'Business Identification',
        'Introduction Notes',
        'Equipment Overview',
        'Follow-up Planning'
      ]
    };
    
    // Add relationship-focused modules
    this.modules.relationshipBuilding = {
      title: 'Relationship Building',
      tools: [
        'Conversation Starters',
        'Pain Point Discovery',
        'Value Proposition',
        'Follow-up Strategy'
      ]
    };
  }
  
  // Override the schedule component to focus on visit opportunities
  renderTodaySchedule() {
    // Custom rendering for bridge building focused schedule
    return {
      component: 'bridge-building-schedule',
      data: this.data.schedule
    };
  }
}

// Initialize the bridge building dashboard
const dashboard = new BridgeBuildingDashboard();
dashboard.initialize();
```

## Unified Dashboard Core

Create a shared core module that both projects can import:

```javascript
// unified-dashboard.js (core framework)

export class UnifiedDashboard {
  constructor(config) {
    this.config = {
      serviceVertical: config.serviceVertical || 'generic',
      providerTier: config.providerTier || 'certified_technician',
      businessContext: config.businessContext || 'solo'
    };
    
    this.data = {
      schedule: {
        today: []
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
    
    // Define standard modules
    this.modules = {
      pmWorkflow: {
        title: 'PM Workflow',
        steps: []
      },
      partsManagement: {
        title: 'Parts Management',
        tools: []
      },
      teamBuilding: {
        title: 'Team Building',
        tools: []
      }
    };
  }
  
  // Load dashboard data from API
  async loadDashboardData(apiEndpoint) {
    try {
      const response = await fetch(apiEndpoint);
      const data = await response.json();
      
      if (data.success) {
        this.data = {...this.data, ...data.dashboardData};
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      return false;
    }
  }
  
  // Render the dashboard components
  render() {
    return {
      schedule: this.renderTodaySchedule(),
      performance: this.renderPerformanceMetrics(),
      earnings: this.renderEarningsModule(),
      feedback: this.renderFeedbackScore(),
      alerts: this.renderAlertsNotifications(),
      team: this.renderTeamPerformance(),
      growth: this.renderGrowthOpportunities()
    };
  }
  
  // Component rendering methods
  renderTodaySchedule() {
    return {
      component: 'today-schedule',
      data: this.data.schedule
    };
  }
  
  renderPerformanceMetrics() {
    return {
      component: 'performance-metrics',
      data: this.data.performance
    };
  }
  
  renderEarningsModule() {
    return {
      component: 'earnings-module',
      data: this.data.earnings
    };
  }
  
  renderFeedbackScore() {
    return {
      component: 'feedback-score',
      data: this.data.feedback
    };
  }
  
  renderAlertsNotifications() {
    return {
      component: 'alerts-notifications',
      data: this.data.alerts
    };
  }
  
  renderTeamPerformance() {
    // Only show for team leaders or if team data exists
    if (this.config.providerTier === 'territory_leader' || this.data.team) {
      return {
        component: 'team-performance',
        data: this.data.team
      };
    }
    return null;
  }
  
  renderGrowthOpportunities() {
    return {
      component: 'growth-opportunities',
      data: this.data.growthOpportunities
    };
  }
  
  // Initialize and set up the dashboard
  initialize() {
    // Load vertical-specific modules
    this.loadServiceVerticalModules();
    
    // Load tier-specific features
    this.loadProviderTierFeatures();
    
    // Load context-specific UI
    this.loadBusinessContextUI();
    
    // Initial data load
    this.loadInitialData();
  }
  
  // Load modules specific to the service vertical
  loadServiceVerticalModules() {
    // This would load different modules based on the vertical
    switch (this.config.serviceVertical) {
      case 'kitchen_maintenance':
        // Load kitchen maintenance specific modules
        break;
      case 'cleaning_services':
        // Load cleaning services specific modules
        break;
      case 'lawn_care':
        // Load lawn care specific modules
        break;
    }
  }
  
  // Load features specific to provider tier
  loadProviderTierFeatures() {
    switch (this.config.providerTier) {
      case 'certified_technician':
        // Basic features
        break;
      case 'elite_technician':
        // Enhanced features
        break;
      case 'territory_leader':
        // Leadership features
        break;
    }
  }
  
  // Load UI specific to business context
  loadBusinessContextUI() {
    switch (this.config.businessContext) {
      case 'solo':
        // Individual provider UI
        break;
      case 'team_member':
        // Team member UI
        break;
      case 'team_leader':
        // Team leader UI
        break;
    }
  }
  
  // Load initial dashboard data
  loadInitialData() {
    // Implementation would depend on the specific backend API
    console.log('Loading initial dashboard data...');
  }
}
```

## Integration Strategy

### Phase 1: Backend Models and API

1. Enhance database models in both projects to support the unified structure
2. Create API endpoints for the unified dashboard data format
3. Update existing controllers to serve data in the new format alongside the old format

### Phase 2: Core Dashboard Framework

1. Implement the shared core dashboard framework
2. Create adapters to transform existing project data to the unified format
3. Test the dashboard core with sample data from both projects

### Phase 3: Service-Specific Modules

1. Implement the kitchen maintenance modules for Rapid-Pro
2. Implement the cleaning services modules for Memphis Cleaning
3. Create shared modules that work across both platforms

### Phase 4: Progressive UI Integration

1. Implement a "beta" version of the new dashboard UI available via opt-in
2. Add a toggle for users to switch between classic and new dashboards
3. Collect feedback and refine the implementation

## Mobile Implementation Considerations

The mobile-first approach should be implemented through:

1. Responsive design with mobile breakpoints
2. Progressive web app capabilities for offline functionality
3. Simplified workflow paths for mobile users
4. Touch-optimized interface elements

## Offline Capabilities

1. Implement SQLite database for efficient offline data storage:
   - Create normalized table structure for providers, jobs, equipment, and metrics
   - Add indexes on frequently queried fields (customer name, job date, equipment type)
   - Implement efficient pagination for job and equipment lists
   - Enable full-text search for quick customer/equipment lookup

2. Progressive Web App (PWA) Architecture:
   - Use service workers for offline resource caching
   - Implement background sync for form submissions when connectivity is restored
   - Utilize Workbox for cache management
   - Add install prompts for mobile home screen

3. Efficient Data Management:
   - Load only data needed for the current view (lazy loading)
   - Implement virtual scrolling for long lists
   - Cache frequently accessed data intelligently
   - Periodic background sync to reduce battery drain

4. Native Integration:
   - Compile to native mobile app using Capacitor or similar
   - Use native SQLite plugins for direct database access
   - Leverage device capabilities (GPS, camera) via native APIs
   - Implement push notifications for job reminders and alerts

5. User Experience:
   - Add clear visual indicators for offline vs. online mode
   - Provide data staleness indicators
   - Show sync status and last update times

## Metrics and Success Tracking

1. Implement dashboard usage analytics
2. Track provider progression through tiers
3. Monitor time-to-completion of service workflows
4. Measure customer satisfaction correlations with dashboard features

## Final Notes

This implementation focuses on building the backend structure first, allowing for a gradual UI rollout. By using this approach, both systems can continue operating normally while the new unified framework is integrated beneath the surface, preparing for a seamless transition when ready to reveal the new UI.