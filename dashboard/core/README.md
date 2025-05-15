# Unified Dashboard Framework for Rapid Pro Maintenance

This directory contains the implementation of the Unified Dashboard framework for Rapid Pro Maintenance. The framework provides a consistent, powerful interface that adapts dynamically based on service vertical, provider tier, and business context.

## Directory Contents

### Core Framework
- `implementation-plan.md` - Overall implementation strategy
- `IMPLEMENTATION_GUIDE.md` - Developer guide for implementation
- `unified-dashboard-core.js` - Core dashboard framework
- `unified-dashboard.css` - Responsive styling for the dashboard
- `sqlite-data-structure.sql` - SQLite database schema for offline support
- `sqlite-service.js` - Database service for managing offline data
- `integration-example.js` - Rapid Pro Maintenance integration example

### PM Workflow System
- `pm-workflow.js` - Preventative maintenance workflow system with offline support
- `pm-component.js` - UI component for the PM workflow
- `pm-workflow.css` - Styling for the PM workflow
- `pm-usage-example.js` - Example usage of the PM workflow with the dashboard

## PM Workflow Features

The PM Workflow system provides:

1. **Complete PM Session Management**
   - Multi-step workflow for preventative maintenance
   - Step-by-step guidance with progress tracking
   - Photo documentation with offline storage
   - Completion reporting

2. **Bridge Building Mode**
   - Specialized workflow for relationship development
   - Conversation starters and follow-up planning
   - Prospect relationship tracking
   - Interest level assessment

3. **Offline Support**
   - Complete offline functionality via SQLite
   - Auto-sync when connectivity is restored
   - Photo storage and syncing
   - Session history access

4. **Mobile-First Design**
   - Touch-friendly UI components
   - Responsive layout for all device sizes
   - Optimized photo capture on mobile
   - Efficient data entry forms

## Quick Start

1. Include the necessary files in your project:

```html
<link rel="stylesheet" href="dashboard-framework/unified-dashboard.css">
<link rel="stylesheet" href="dashboard-framework/pm-workflow.css">
<script src="dashboard-framework/unified-dashboard-core.js"></script>
<script src="dashboard-framework/sqlite-service.js"></script>
<script src="dashboard-framework/integration-example.js"></script>
<script src="dashboard-framework/pm-workflow.js"></script>
<script src="dashboard-framework/pm-component.js"></script>
<script src="dashboard-framework/pm-usage-example.js"></script>
```

2. Add containers for the dashboard and PM workflow:

```html
<div id="dashboard-container"></div>
<div id="pm-workflow-container"></div>
```

3. Initialize the dashboard with PM workflow:

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  // Check URL parameters for mode
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode') === 'bridge' ? 'bridge-building' : 'normal';
  
  // Initialize dashboard with PM workflow
  await initializeDashboard('dashboard-container', 'pm-workflow-container', mode);
});
```

## PM Workflow Usage

The PM workflow can be used in two modes:

### 1. Normal PM Mode
Standard preventative maintenance workflow with the following steps:
- Client Identification
- Equipment Identification
- Cooler Inspection
- Freezer Inspection
- Temperature Verification
- Coil Cleaning
- Minor Repairs
- Gasket Inspection
- Sink & Plumbing
- Final Report

```javascript
// Initialize in normal mode
await initializeNormalMode('dashboard-container', 'pm-workflow-container');
```

### 2. Bridge Building Mode
Relationship development workflow with the following steps:
- Business Identification
- Introduction Notes
- Equipment Overview
- Pain Points & Challenges
- Follow-up Planning

```javascript
// Initialize in bridge building mode
await initializeBridgeBuildingMode('dashboard-container', 'pm-workflow-container');
```

## Customizing PM Workflow

You can customize the PM workflow by extending the `PMWorkflow` class:

```javascript
class CustomPMWorkflow extends PMWorkflow {
  constructor(databaseService) {
    super(databaseService);
    
    // Add custom steps
    this.steps.push('custom_step');
  }
  
  // Override or add methods as needed
}
```

## Mobile Implementation

This framework is built for mobile-first usage with:

1. **Responsive Design** - Adapts from 4-column to 1-column layouts
2. **Offline Support** - Complete offline functionality with SQLite database
3. **Progressive Web App Features** - Service workers and installable app
4. **Native Device Integration** - Compiled to native mobile app via Capacitor

## Performance Considerations

- SQLite database with proper indexing for efficient queries
- Lazy loading of data and photos
- Step-by-step workflow reduces memory usage
- Efficient offline/online synchronization

## Ready For Tomorrow

The implementation is ready for immediate deployment with:

1. **Complete PM Workflow** - All steps, data collection, and reporting
2. **Bridge Building Mode** - Full relationship development framework
3. **Offline Capability** - Works without connectivity
4. **SQLite Database** - Efficient local data storage
5. **Real-time Sync** - Updates when connectivity is restored

Simply copy the entire `dashboard-framework` directory to your project and follow the integration instructions to get started.