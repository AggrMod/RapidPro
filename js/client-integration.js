/**
 * Client Data Integration Module
 * Integrates the client data manager with the main site UI
 * For Rapid Pro Maintenance
 */

import clientManager from './client-data-manager.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize client data section in the main UI
  initializeClientSection();
  
  // Add client data tab to navigation
  addClientTab();
});

// Add client management section tab to the main navigation
function addClientTab() {
  const nav = document.querySelector('nav ul');
  if (!nav) return;
  
  const clientTab = document.createElement('li');
  clientTab.innerHTML = '<a href="#client-management" data-section="client-management">Client Portal</a>';
  nav.appendChild(clientTab);
  
  // Add event listener for the new tab
  clientTab.querySelector('a').addEventListener('click', (e) => {
    e.preventDefault();
    
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
      section.style.display = 'none';
    });
    
    // Show client management section
    const clientSection = document.getElementById('client-management');
    if (clientSection) {
      clientSection.style.display = 'block';
      
      // Refresh the client data
      refreshClientData();
    }
  });
}

// Create and initialize the client management section
function initializeClientSection() {
  const main = document.querySelector('main');
  if (!main) return;
  
  // Create client management section
  const clientSection = document.createElement('section');
  clientSection.id = 'client-management';
  clientSection.classList.add('client-management-section');
  clientSection.style.display = 'none'; // Hidden by default
  
  clientSection.innerHTML = `
    <div class="section-container">
      <h2>Client Management Portal</h2>
      <p class="section-description">
        Welcome to the Rapid Pro Maintenance client portal. Here you can manage your kitchen equipment, 
        view maintenance history, and schedule service.
      </p>
      
      <div class="portal-tabs">
        <button class="tab-button active" data-tab="dashboard">Dashboard</button>
        <button class="tab-button" data-tab="equipment">Equipment</button>
        <button class="tab-button" data-tab="clients">Clients</button>
        <button class="tab-button" data-tab="maintenance">Maintenance</button>
      </div>
      
      <div class="portal-content">
        <div id="client-dashboard" class="tab-content active"></div>
        <div id="equipment-list" class="tab-content"></div>
        <div id="client-list" class="tab-content"></div>
        <div id="maintenance-list" class="tab-content"></div>
      </div>
    </div>
  `;
  
  main.appendChild(clientSection);
  
  // Add filter and sort controls to equipment list
  const equipmentList = clientSection.querySelector('#equipment-list');
  equipmentList.innerHTML = `
    <div class="controls-container">
      <div class="filter-controls">
        <label>
          Status:
          <select data-filter="status">
            <option value="all">All Status</option>
            <option value="operational">Operational</option>
            <option value="needs maintenance">Needs Maintenance</option>
            <option value="needs repair">Needs Repair</option>
          </select>
        </label>
        
        <label>
          Equipment Type:
          <select data-filter="equipmentType">
            <option value="all">All Types</option>
            <option value="refrigerator">Refrigerator</option>
            <option value="oven">Oven</option>
            <option value="freezer">Freezer</option>
            <option value="dishwasher">Dishwasher</option>
            <option value="mixer">Mixer</option>
            <option value="grill">Grill</option>
            <option value="fryer">Fryer</option>
            <option value="slicer">Slicer</option>
          </select>
        </label>
        
        <label>
          Service Date:
          <select data-filter="dateRange">
            <option value="all">All Time</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </label>
      </div>
      
      <div class="sort-controls">
        <span>Sort by:</span>
        <button data-sort="lastService" class="sort-button sort-desc active">Last Service</button>
        <button data-sort="type" class="sort-button">Type</button>
        <button data-sort="status" class="sort-button">Status</button>
        <button data-sort="installDate" class="sort-button">Install Date</button>
      </div>
    </div>
    
    <div class="equipment-container"></div>
  `;
  
  // Add event listeners for tab switching
  clientSection.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all tabs
      clientSection.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Add active class to clicked tab
      button.classList.add('active');
      
      // Hide all tab content
      clientSection.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // Show selected tab content
      const tabName = button.getAttribute('data-tab');
      const tabContent = clientSection.querySelector(`#${tabName}-list, #client-${tabName}`);
      if (tabContent) {
        tabContent.classList.add('active');
        
        // Refresh the data for the selected tab
        refreshTabData(tabName);
      }
    });
  });
  
  // Initialize filter and sort controls
  initializeControls(clientSection);
  
  // Initial data load
  refreshClientData();
}

// Initialize filter and sort controls
function initializeControls(container) {
  // Filter controls
  container.querySelectorAll('[data-filter]').forEach(element => {
    element.addEventListener('change', (e) => {
      const filterType = e.target.getAttribute('data-filter');
      const value = e.target.value;
      
      clientManager.filterCriteria[filterType] = value;
      refreshTabData('equipment');
    });
  });
  
  // Sort controls
  container.querySelectorAll('[data-sort]').forEach(element => {
    element.addEventListener('click', (e) => {
      const field = e.target.getAttribute('data-sort');
      
      // Update sort indicators
      container.querySelectorAll('[data-sort]').forEach(el => {
        el.classList.remove('active', 'sort-asc', 'sort-desc');
      });
      
      if (field === clientManager.sortCriteria.field) {
        clientManager.sortCriteria.direction = clientManager.sortCriteria.direction === 'asc' ? 'desc' : 'asc';
      } else {
        clientManager.sortCriteria.field = field;
        clientManager.sortCriteria.direction = 'asc';
      }
      
      // Update the active sort button
      element.classList.add('active', `sort-${clientManager.sortCriteria.direction}`);
      
      refreshTabData('equipment');
    });
  });
}

// Refresh data for all tabs
function refreshClientData() {
  refreshTabData('dashboard');
  refreshTabData('equipment');
  refreshTabData('clients');
  refreshTabData('maintenance');
}

// Refresh data for a specific tab
function refreshTabData(tabName) {
  switch(tabName) {
    case 'dashboard':
      clientManager.renderDashboard(document.getElementById('client-dashboard'));
      break;
    case 'equipment':
      clientManager.renderEquipmentList(document.getElementById('equipment-list').querySelector('.equipment-container'));
      break;
    case 'clients':
      clientManager.renderClientList(document.getElementById('client-list'));
      break;
    case 'maintenance':
      renderMaintenanceList();
      break;
  }
}

// Render the maintenance records list
function renderMaintenanceList() {
  const container = document.getElementById('maintenance-list');
  if (!container) return;
  
  let maintenanceHTML = '<h3>Recent Maintenance Records</h3>';
  
  // Get all maintenance records and sort by date (newest first)
  const records = [...clientManager.maintenanceRecords].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  
  if (records.length === 0) {
    maintenanceHTML += '<p>No maintenance records found.</p>';
  } else {
    maintenanceHTML += '<div class="maintenance-records">';
    
    records.forEach(record => {
      // Get equipment and client info
      const equipment = clientManager.equipment.find(e => e.id === record.equipmentId);
      const client = equipment ? clientManager.clients.find(c => c.id === equipment.clientId) : null;
      
      maintenanceHTML += `
        <div class="maintenance-card type-${record.type}">
          <div class="maintenance-header">
            <span class="maintenance-date">${record.date}</span>
            <span class="maintenance-type">${record.type}</span>
          </div>
          <div class="maintenance-details">
            <p><strong>Equipment:</strong> ${equipment ? `${equipment.manufacturer} ${equipment.model} (${equipment.type})` : 'Unknown'}</p>
            <p><strong>Client:</strong> ${client ? client.name : 'Unknown'}</p>
            <p><strong>Technician:</strong> ${record.technician}</p>
            <p><strong>Notes:</strong> ${record.notes}</p>
            <p><strong>Parts:</strong> ${record.parts || 'None'}</p>
            <p><strong>Cost:</strong> $${record.cost}</p>
          </div>
        </div>
      `;
    });
    
    maintenanceHTML += '</div>';
  }
  
  container.innerHTML = maintenanceHTML;
}

// Export the module's functions
export { refreshClientData, initializeClientSection };