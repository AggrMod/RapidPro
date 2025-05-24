/**
 * Client Data Management System
 * Advanced enterprise-grade client data handling with simulated database
 * For Rapid Pro Maintenance
 */

class ClientDataManager {
  constructor() {
    this.clients = this.loadClients();
    this.equipment = this.loadEquipment();
    this.maintenanceRecords = this.loadMaintenanceRecords();
    this.serviceContracts = this.loadServiceContracts();
    this.currentUser = null;
    this.observers = [];
    this.filterCriteria = {
      status: 'all',
      dateRange: 'all',
      equipmentType: 'all',
      contractType: 'all'
    };
    this.sortCriteria = {
      field: 'lastService',
      direction: 'desc'
    };
    
    // Initialize view
    this.initializeView();
    
    // Register event listeners
    document.addEventListener('DOMContentLoaded', () => {
      this.registerEventListeners();
    });
  }

  // Simulate loading data from a database
  loadClients() {
    return [
      { id: 'C001', name: 'Riverfront Bistro', contact: 'Maria Garcia', phone: '555-1234', email: 'maria@riverfrontbistro.com', address: '123 River Ave', city: 'Portland', state: 'OR', status: 'active', priority: 'high', notes: 'VIP client, immediate response required' },
      { id: 'C002', name: 'Harbor Seafood', contact: 'James Wilson', phone: '555-2345', email: 'james@harborseafood.com', address: '456 Harbor Blvd', city: 'Seattle', state: 'WA', status: 'active', priority: 'medium', notes: 'Weekend availability only' },
      { id: 'C003', name: 'Mountain Brewery', contact: 'Robert Chen', phone: '555-3456', email: 'robert@mountainbrewery.com', address: '789 Mountain Rd', city: 'Denver', state: 'CO', status: 'active', priority: 'medium', notes: 'Prefers morning appointments' },
      { id: 'C004', name: 'Sunset Grill', contact: 'Sarah Johnson', phone: '555-4567', email: 'sarah@sunsetgrill.com', address: '234 Sunset Ave', city: 'San Diego', state: 'CA', status: 'inactive', priority: 'low', notes: 'Seasonal operation (March-October)' },
      { id: 'C005', name: 'Downtown Deli', contact: 'David Miller', phone: '555-5678', email: 'david@downtowndeli.com', address: '567 Main St', city: 'Chicago', state: 'IL', status: 'active', priority: 'high', notes: 'Requires after-hours service' },
      { id: 'C006', name: 'Campus Cafe', contact: 'Jennifer Adams', phone: '555-6789', email: 'jennifer@campuscafe.com', address: '890 University Dr', city: 'Boston', state: 'MA', status: 'active', priority: 'medium', notes: 'Closed during academic breaks' },
      { id: 'C007', name: 'Hotel Grand', contact: 'Michael Thompson', phone: '555-7890', email: 'michael@hotelgrand.com', address: '123 Grand Ave', city: 'Las Vegas', state: 'NV', status: 'active', priority: 'high', notes: '24/7 service availability needed' },
      { id: 'C008', name: 'Oceanview Restaurant', contact: 'Lisa Wong', phone: '555-8901', email: 'lisa@oceanviewrestaurant.com', address: '456 Beach Rd', city: 'Miami', state: 'FL', status: 'active', priority: 'medium', notes: 'Seasonal high volume (Nov-Apr)' }
    ];
  }

  loadEquipment() {
    return [
      { id: 'E001', clientId: 'C001', type: 'refrigerator', model: 'ColdMax Pro 3000', manufacturer: 'Arctic Systems', installDate: '2021-05-15', lastService: '2023-09-10', status: 'operational', warrantyExpiry: '2025-05-15' },
      { id: 'E002', clientId: 'C001', type: 'oven', model: 'HeatWave Commercial 500', manufacturer: 'Culinary Technologies', installDate: '2020-07-22', lastService: '2023-08-14', status: 'operational', warrantyExpiry: '2024-07-22' },
      { id: 'E003', clientId: 'C001', type: 'dishwasher', model: 'SparklClean XL', manufacturer: 'Pristine Appliances', installDate: '2022-02-10', lastService: '2023-07-30', status: 'needs maintenance', warrantyExpiry: '2026-02-10' },
      { id: 'E004', clientId: 'C002', type: 'freezer', model: 'DeepFreeze Max', manufacturer: 'Arctic Systems', installDate: '2021-08-05', lastService: '2023-06-12', status: 'operational', warrantyExpiry: '2025-08-05' },
      { id: 'E005', clientId: 'C002', type: 'grill', model: 'SearMaster Pro', manufacturer: 'Flame Technologies', installDate: '2022-04-18', lastService: '2023-09-05', status: 'operational', warrantyExpiry: '2026-04-18' },
      { id: 'E006', clientId: 'C003', type: 'mixer', model: 'BrewMix 2000', manufacturer: 'Culinary Technologies', installDate: '2020-11-30', lastService: '2023-08-22', status: 'operational', warrantyExpiry: '2024-11-30' },
      { id: 'E007', clientId: 'C003', type: 'refrigerator', model: 'ColdMax Pro 2500', manufacturer: 'Arctic Systems', installDate: '2021-03-14', lastService: '2023-07-18', status: 'needs repair', warrantyExpiry: '2025-03-14' },
      { id: 'E008', clientId: 'C004', type: 'fryer', model: 'OilMaster Deluxe', manufacturer: 'Flame Technologies', installDate: '2022-06-25', lastService: '2023-05-30', status: 'operational', warrantyExpiry: '2026-06-25' },
      { id: 'E009', clientId: 'C005', type: 'slicer', model: 'PrecisionSlice Pro', manufacturer: 'Pristine Appliances', installDate: '2021-09-08', lastService: '2023-08-05', status: 'operational', warrantyExpiry: '2025-09-08' },
      { id: 'E010', clientId: 'C005', type: 'refrigerator', model: 'ColdMax Pro 3500', manufacturer: 'Arctic Systems', installDate: '2022-01-20', lastService: '2023-09-15', status: 'operational', warrantyExpiry: '2026-01-20' },
      { id: 'E011', clientId: 'C006', type: 'oven', model: 'HeatWave Commercial 400', manufacturer: 'Culinary Technologies', installDate: '2020-08-12', lastService: '2023-06-28', status: 'needs maintenance', warrantyExpiry: '2024-08-12' },
      { id: 'E012', clientId: 'C007', type: 'dishwasher', model: 'SparklClean Commercial', manufacturer: 'Pristine Appliances', installDate: '2021-12-03', lastService: '2023-09-01', status: 'operational', warrantyExpiry: '2025-12-03' },
      { id: 'E013', clientId: 'C007', type: 'refrigerator', model: 'ColdMax Pro 4000', manufacturer: 'Arctic Systems', installDate: '2022-02-15', lastService: '2023-07-22', status: 'operational', warrantyExpiry: '2026-02-15' },
      { id: 'E014', clientId: 'C007', type: 'freezer', model: 'DeepFreeze Ultra', manufacturer: 'Arctic Systems', installDate: '2021-11-10', lastService: '2023-08-30', status: 'needs repair', warrantyExpiry: '2025-11-10' },
      { id: 'E015', clientId: 'C008', type: 'grill', model: 'SearMaster Elite', manufacturer: 'Flame Technologies', installDate: '2022-05-08', lastService: '2023-07-15', status: 'operational', warrantyExpiry: '2026-05-08' }
    ];
  }

  loadMaintenanceRecords() {
    return [
      { id: 'M001', equipmentId: 'E003', date: '2023-07-30', type: 'routine', technician: 'Alex Rivera', notes: 'Filter replaced, all systems checked', parts: 'Filter x2', cost: 150 },
      { id: 'M002', equipmentId: 'E007', date: '2023-07-18', type: 'repair', technician: 'Samantha Lee', notes: 'Compressor issue identified, temporary fix applied', parts: 'None', cost: 200 },
      { id: 'M003', equipmentId: 'E002', date: '2023-08-14', type: 'routine', technician: 'Alex Rivera', notes: 'Calibration performed, heating element checked', parts: 'Thermostat', cost: 175 },
      { id: 'M004', equipmentId: 'E014', date: '2023-08-30', type: 'repair', technician: 'Marcus Johnson', notes: 'Door seal replaced, temperature sensor recalibrated', parts: 'Door seal kit', cost: 320 },
      { id: 'M005', equipmentId: 'E005', date: '2023-09-05', type: 'routine', technician: 'Samantha Lee', notes: 'Burners cleaned, gas connection checked', parts: 'None', cost: 125 },
      { id: 'M006', equipmentId: 'E001', date: '2023-09-10', type: 'routine', technician: 'Marcus Johnson', notes: 'Cooling system inspected, all normal', parts: 'None', cost: 100 },
      { id: 'M007', equipmentId: 'E010', date: '2023-09-15', type: 'routine', technician: 'Alex Rivera', notes: 'Full system check, coils cleaned', parts: 'Cleaning solution', cost: 150 },
      { id: 'M008', equipmentId: 'E012', date: '2023-09-01', type: 'routine', technician: 'Samantha Lee', notes: 'Water pump inspected, detergent system cleaned', parts: 'Pump filter', cost: 180 },
      { id: 'M009', equipmentId: 'E006', date: '2023-08-22', type: 'routine', technician: 'Marcus Johnson', notes: 'Belt tensioned, bearings lubricated', parts: 'Lubricant', cost: 90 },
      { id: 'M010', equipmentId: 'E011', date: '2023-06-28', type: 'maintenance', technician: 'Alex Rivera', notes: 'Heating element showing signs of wear, scheduled for replacement', parts: 'None', cost: 150 }
    ];
  }

  loadServiceContracts() {
    return [
      { id: 'SC001', clientId: 'C001', type: 'premium', startDate: '2023-01-01', endDate: '2023-12-31', frequency: 'monthly', value: 4800, status: 'active' },
      { id: 'SC002', clientId: 'C002', type: 'standard', startDate: '2023-03-15', endDate: '2024-03-14', frequency: 'quarterly', value: 2000, status: 'active' },
      { id: 'SC003', clientId: 'C003', type: 'basic', startDate: '2023-05-01', endDate: '2024-04-30', frequency: 'bi-annually', value: 1200, status: 'active' },
      { id: 'SC004', clientId: 'C005', type: 'premium', startDate: '2023-02-15', endDate: '2024-02-14', frequency: 'monthly', value: 4800, status: 'active' },
      { id: 'SC005', clientId: 'C006', type: 'standard', startDate: '2023-06-01', endDate: '2024-05-31', frequency: 'quarterly', value: 2000, status: 'active' },
      { id: 'SC006', clientId: 'C007', type: 'premium+', startDate: '2023-01-15', endDate: '2023-12-31', frequency: 'weekly', value: 7200, status: 'active' },
      { id: 'SC007', clientId: 'C008', type: 'standard', startDate: '2023-04-01', endDate: '2024-03-31', frequency: 'quarterly', value: 2000, status: 'active' },
      { id: 'SC008', clientId: 'C004', type: 'seasonal', startDate: '2023-03-01', endDate: '2023-10-31', frequency: 'monthly', value: 2800, status: 'inactive' }
    ];
  }

  // Observer pattern for reactive updates
  subscribe(callback) {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  }

  notify() {
    this.observers.forEach(callback => callback());
  }

  // Filter and sort operations
  filterData() {
    let filteredEquipment = [...this.equipment];
    
    if (this.filterCriteria.status !== 'all') {
      filteredEquipment = filteredEquipment.filter(item => item.status === this.filterCriteria.status);
    }
    
    if (this.filterCriteria.equipmentType !== 'all') {
      filteredEquipment = filteredEquipment.filter(item => item.type === this.filterCriteria.equipmentType);
    }
    
    // Add date filtering logic based on last service date
    if (this.filterCriteria.dateRange !== 'all') {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
      
      filteredEquipment = filteredEquipment.filter(item => {
        const lastServiceDate = new Date(item.lastService);
        
        switch(this.filterCriteria.dateRange) {
          case '30days':
            return lastServiceDate >= thirtyDaysAgo;
          case '90days':
            return lastServiceDate >= ninetyDaysAgo;
          default:
            return true;
        }
      });
    }
    
    // Sort the filtered data
    filteredEquipment.sort((a, b) => {
      let valueA = a[this.sortCriteria.field];
      let valueB = b[this.sortCriteria.field];
      
      // Handle date comparison
      if (this.sortCriteria.field === 'lastService' || this.sortCriteria.field === 'installDate') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }
      
      if (valueA < valueB) {
        return this.sortCriteria.direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortCriteria.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return filteredEquipment;
  }

  getClientById(id) {
    return this.clients.find(client => client.id === id);
  }

  getEquipmentForClient(clientId) {
    return this.equipment.filter(item => item.clientId === clientId);
  }

  getMaintenanceForEquipment(equipmentId) {
    return this.maintenanceRecords.filter(record => record.equipmentId === equipmentId);
  }

  getContractsForClient(clientId) {
    return this.serviceContracts.filter(contract => contract.clientId === clientId);
  }

  // CRUD Operations for Clients
  addClient(clientData) {
    const newClient = {
      id: `C${(this.clients.length + 1).toString().padStart(3, '0')}`,
      ...clientData,
      status: clientData.status || 'active'
    };
    
    this.clients.push(newClient);
    this.notify();
    return newClient;
  }

  updateClient(id, updates) {
    const index = this.clients.findIndex(client => client.id === id);
    if (index !== -1) {
      this.clients[index] = { ...this.clients[index], ...updates };
      this.notify();
      return this.clients[index];
    }
    return null;
  }

  // CRUD Operations for Equipment
  addEquipment(equipmentData) {
    const newEquipment = {
      id: `E${(this.equipment.length + 1).toString().padStart(3, '0')}`,
      ...equipmentData,
      status: equipmentData.status || 'operational'
    };
    
    this.equipment.push(newEquipment);
    this.notify();
    return newEquipment;
  }

  updateEquipment(id, updates) {
    const index = this.equipment.findIndex(equipment => equipment.id === id);
    if (index !== -1) {
      this.equipment[index] = { ...this.equipment[index], ...updates };
      this.notify();
      return this.equipment[index];
    }
    return null;
  }

  // CRUD Operations for Maintenance Records
  addMaintenanceRecord(recordData) {
    const newRecord = {
      id: `M${(this.maintenanceRecords.length + 1).toString().padStart(3, '0')}`,
      ...recordData,
      date: recordData.date || new Date().toISOString().split('T')[0]
    };
    
    this.maintenanceRecords.push(newRecord);
    
    // Update the last service date on the equipment
    const equipmentIndex = this.equipment.findIndex(eq => eq.id === recordData.equipmentId);
    if (equipmentIndex !== -1) {
      this.equipment[equipmentIndex].lastService = newRecord.date;
    }
    
    this.notify();
    return newRecord;
  }

  // CRUD Operations for Service Contracts
  addServiceContract(contractData) {
    const newContract = {
      id: `SC${(this.serviceContracts.length + 1).toString().padStart(3, '0')}`,
      ...contractData,
      status: contractData.status || 'active'
    };
    
    this.serviceContracts.push(newContract);
    this.notify();
    return newContract;
  }

  updateServiceContract(id, updates) {
    const index = this.serviceContracts.findIndex(contract => contract.id === id);
    if (index !== -1) {
      this.serviceContracts[index] = { ...this.serviceContracts[index], ...updates };
      this.notify();
      return this.serviceContracts[index];
    }
    return null;
  }

  // Business Intelligence Methods
  getEquipmentRequiringMaintenance() {
    return this.equipment.filter(item => item.status === 'needs maintenance');
  }

  getEquipmentRequiringRepair() {
    return this.equipment.filter(item => item.status === 'needs repair');
  }

  getClientsByPriority(priority) {
    return this.clients.filter(client => client.priority === priority);
  }

  getUpcomingServiceAppointments(days = 30) {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);
    
    // This would typically connect to an appointments system
    // For now, we'll simulate upcoming appointments based on contract frequency
    const appointments = [];
    
    this.serviceContracts.forEach(contract => {
      if (contract.status !== 'active') return;
      
      const client = this.getClientById(contract.clientId);
      if (!client) return;
      
      let nextDate = new Date();
      let interval;
      
      switch(contract.frequency) {
        case 'weekly':
          interval = 7;
          break;
        case 'bi-weekly':
          interval = 14;
          break;
        case 'monthly':
          interval = 30;
          break;
        case 'quarterly':
          interval = 90;
          break;
        case 'bi-annually':
          interval = 180;
          break;
        default:
          interval = 30;
      }
      
      // Add a randomization factor
      nextDate.setDate(nextDate.getDate() + Math.floor(Math.random() * interval));
      
      if (nextDate <= future) {
        appointments.push({
          clientId: client.id,
          clientName: client.name,
          contractId: contract.id,
          contractType: contract.type,
          scheduledDate: nextDate.toISOString().split('T')[0]
        });
      }
    });
    
    return appointments;
  }

  getMaintenanceStats() {
    // Calculate stats like average maintenance cost, frequency by equipment type, etc.
    const stats = {
      totalMaintenanceCost: 0,
      averageCostPerClient: {},
      maintenanceByType: {},
      maintenanceByMonth: {}
    };
    
    // Calculate total maintenance cost
    stats.totalMaintenanceCost = this.maintenanceRecords.reduce((sum, record) => sum + record.cost, 0);
    
    // Calculate costs by client
    this.clients.forEach(client => {
      const clientEquipment = this.getEquipmentForClient(client.id);
      let clientTotal = 0;
      
      clientEquipment.forEach(equipment => {
        const records = this.getMaintenanceForEquipment(equipment.id);
        clientTotal += records.reduce((sum, record) => sum + record.cost, 0);
      });
      
      stats.averageCostPerClient[client.id] = {
        name: client.name,
        total: clientTotal,
        equipmentCount: clientEquipment.length,
        average: clientEquipment.length ? (clientTotal / clientEquipment.length) : 0
      };
    });
    
    // Maintenance by equipment type
    this.equipment.forEach(equipment => {
      if (!stats.maintenanceByType[equipment.type]) {
        stats.maintenanceByType[equipment.type] = {
          count: 0,
          cost: 0
        };
      }
      
      const records = this.getMaintenanceForEquipment(equipment.id);
      records.forEach(record => {
        stats.maintenanceByType[equipment.type].count++;
        stats.maintenanceByType[equipment.type].cost += record.cost;
      });
    });
    
    // Maintenance by month
    this.maintenanceRecords.forEach(record => {
      const month = record.date.substring(0, 7); // YYYY-MM format
      if (!stats.maintenanceByMonth[month]) {
        stats.maintenanceByMonth[month] = {
          count: 0,
          cost: 0
        };
      }
      
      stats.maintenanceByMonth[month].count++;
      stats.maintenanceByMonth[month].cost += record.cost;
    });
    
    return stats;
  }

  // UI Integration Methods
  initializeView() {
    // This would create and inject the necessary DOM elements
    // For now we'll use a placeholder that will be filled when the DOM is ready
    console.log('Client Data Manager initialized');
  }

  registerEventListeners() {
    // Set up event handlers for the client management interface
    document.querySelectorAll('[data-client-action]').forEach(element => {
      element.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-client-action');
        const id = e.target.getAttribute('data-id');
        
        switch(action) {
          case 'view':
            this.showClientDetails(id);
            break;
          case 'edit':
            this.showEditClientForm(id);
            break;
          case 'add-equipment':
            this.showAddEquipmentForm(id);
            break;
          case 'add-maintenance':
            this.showAddMaintenanceForm(id);
            break;
          case 'toggle-status':
            this.toggleClientStatus(id);
            break;
        }
      });
    });
    
    // Filter and sort controls
    document.querySelectorAll('[data-filter]').forEach(element => {
      element.addEventListener('change', (e) => {
        const filterType = e.target.getAttribute('data-filter');
        const value = e.target.value;
        
        this.filterCriteria[filterType] = value;
        this.renderEquipmentList();
      });
    });
    
    document.querySelectorAll('[data-sort]').forEach(element => {
      element.addEventListener('click', (e) => {
        const field = e.target.getAttribute('data-sort');
        
        if (field === this.sortCriteria.field) {
          this.sortCriteria.direction = this.sortCriteria.direction === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortCriteria.field = field;
          this.sortCriteria.direction = 'asc';
        }
        
        this.renderEquipmentList();
        
        // Update sort indicators
        document.querySelectorAll('[data-sort]').forEach(el => {
          el.classList.remove('sort-asc', 'sort-desc');
        });
        
        if (this.sortCriteria.field === field) {
          e.target.classList.add(`sort-${this.sortCriteria.direction}`);
        }
      });
    });
    
    // Form submission handlers
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'client-form') {
        e.preventDefault();
        this.handleClientFormSubmit(e.target);
      } else if (e.target.id === 'equipment-form') {
        e.preventDefault();
        this.handleEquipmentFormSubmit(e.target);
      } else if (e.target.id === 'maintenance-form') {
        e.preventDefault();
        this.handleMaintenanceFormSubmit(e.target);
      } else if (e.target.id === 'contract-form') {
        e.preventDefault();
        this.handleContractFormSubmit(e.target);
      }
    });
  }

  // UI Rendering Methods
  renderClientList(container = document.getElementById('client-list')) {
    if (!container) return;
    
    container.innerHTML = '';
    
    this.clients.forEach(client => {
      const contracts = this.getContractsForClient(client.id);
      const equipment = this.getEquipmentForClient(client.id);
      
      const clientElement = document.createElement('div');
      clientElement.className = `client-card priority-${client.priority} ${client.status === 'inactive' ? 'inactive' : ''}`;
      clientElement.setAttribute('data-id', client.id);
      
      // Create nice HTML representation of the client info
      clientElement.innerHTML = `
        <div class="client-header">
          <h3>${client.name}</h3>
          <span class="status-badge ${client.status}">${client.status}</span>
          <span class="priority-badge ${client.priority}">${client.priority}</span>
        </div>
        <div class="client-details">
          <p><strong>Contact:</strong> ${client.contact}</p>
          <p><strong>Phone:</strong> ${client.phone}</p>
          <p><strong>Email:</strong> ${client.email}</p>
          <p><strong>Location:</strong> ${client.city}, ${client.state}</p>
          <p><strong>Equipment:</strong> ${equipment.length} units</p>
          <p><strong>Contract:</strong> ${contracts.length ? contracts[0].type : 'None'}</p>
        </div>
        <div class="client-actions">
          <button data-client-action="view" data-id="${client.id}" class="btn btn-primary">View Details</button>
          <button data-client-action="edit" data-id="${client.id}" class="btn btn-secondary">Edit</button>
          <button data-client-action="toggle-status" data-id="${client.id}" class="btn btn-${client.status === 'active' ? 'warning' : 'success'}">
            ${client.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      `;
      
      container.appendChild(clientElement);
    });
  }

  renderEquipmentList(container = document.getElementById('equipment-list')) {
    if (!container) return;
    
    container.innerHTML = '';
    
    const filteredEquipment = this.filterData();
    
    filteredEquipment.forEach(equipment => {
      const client = this.getClientById(equipment.clientId);
      const maintenanceRecords = this.getMaintenanceForEquipment(equipment.id);
      
      const equipmentElement = document.createElement('div');
      equipmentElement.className = `equipment-card status-${equipment.status}`;
      equipmentElement.setAttribute('data-id', equipment.id);
      
      // Calculate days since last service
      const lastServiceDate = new Date(equipment.lastService);
      const currentDate = new Date();
      const timeDiff = currentDate.getTime() - lastServiceDate.getTime();
      const daysSinceService = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      // Check warranty status
      const warrantyDate = new Date(equipment.warrantyExpiry);
      const warrantyStatus = currentDate <= warrantyDate ? 'active' : 'expired';
      
      equipmentElement.innerHTML = `
        <div class="equipment-header">
          <h3>${equipment.model}</h3>
          <span class="type-badge">${equipment.type}</span>
          <span class="status-badge ${equipment.status}">${equipment.status}</span>
        </div>
        <div class="equipment-details">
          <p><strong>Client:</strong> ${client ? client.name : 'Unknown'}</p>
          <p><strong>Manufacturer:</strong> ${equipment.manufacturer}</p>
          <p><strong>Install Date:</strong> ${equipment.installDate}</p>
          <p><strong>Last Service:</strong> ${equipment.lastService} (${daysSinceService} days ago)</p>
          <p><strong>Warranty:</strong> <span class="warranty-${warrantyStatus}">${equipment.warrantyExpiry} (${warrantyStatus})</span></p>
        </div>
        <div class="maintenance-summary">
          <h4>Recent Maintenance</h4>
          ${maintenanceRecords.length > 0 ? 
            `<ul>${maintenanceRecords.slice(0, 2).map(record => 
              `<li>${record.date}: ${record.type} - ${record.notes.substring(0, 30)}${record.notes.length > 30 ? '...' : ''}</li>`
            ).join('')}</ul>` : 
            '<p>No recent maintenance records</p>'
          }
        </div>
        <div class="equipment-actions">
          <button data-equipment-action="view" data-id="${equipment.id}" class="btn btn-primary">Details</button>
          <button data-equipment-action="add-maintenance" data-id="${equipment.id}" class="btn btn-secondary">Add Maintenance</button>
          <button data-equipment-action="update-status" data-id="${equipment.id}" class="btn btn-tertiary">Update Status</button>
        </div>
      `;
      
      container.appendChild(equipmentElement);
    });
  }

  renderDashboard(container = document.getElementById('client-dashboard')) {
    if (!container) return;
    
    const stats = this.getMaintenanceStats();
    const equipmentNeedingAttention = [
      ...this.getEquipmentRequiringMaintenance(),
      ...this.getEquipmentRequiringRepair()
    ];
    const highPriorityClients = this.getClientsByPriority('high');
    const upcomingAppointments = this.getUpcomingServiceAppointments();
    
    container.innerHTML = `
      <div class="dashboard-header">
        <h2>Client Management Dashboard</h2>
        <div class="date-display">${new Date().toLocaleDateString()}</div>
      </div>
      
      <div class="dashboard-summary">
        <div class="summary-card">
          <h3>Clients</h3>
          <div class="summary-stat">${this.clients.length}</div>
          <div class="summary-substat">
            <span>${this.clients.filter(c => c.status === 'active').length} Active</span>
            <span>${highPriorityClients.length} High Priority</span>
          </div>
        </div>
        
        <div class="summary-card">
          <h3>Equipment</h3>
          <div class="summary-stat">${this.equipment.length}</div>
          <div class="summary-substat">
            <span>${this.equipment.filter(e => e.status === 'operational').length} Operational</span>
            <span>${equipmentNeedingAttention.length} Need Attention</span>
          </div>
        </div>
        
        <div class="summary-card">
          <h3>Maintenance</h3>
          <div class="summary-stat">$${stats.totalMaintenanceCost.toLocaleString()}</div>
          <div class="summary-substat">
            <span>${this.maintenanceRecords.length} Records</span>
            <span>${this.maintenanceRecords.filter(r => r.type === 'repair').length} Repairs</span>
          </div>
        </div>
        
        <div class="summary-card">
          <h3>Contracts</h3>
          <div class="summary-stat">${this.serviceContracts.filter(c => c.status === 'active').length}</div>
          <div class="summary-substat">
            <span>${this.serviceContracts.filter(c => c.type === 'premium' || c.type === 'premium+').length} Premium</span>
            <span>${this.serviceContracts.filter(c => c.type === 'standard').length} Standard</span>
          </div>
        </div>
      </div>
      
      <div class="dashboard-sections">
        <div class="dashboard-section">
          <h3>Equipment Needing Attention</h3>
          ${equipmentNeedingAttention.length > 0 ? 
            `<ul class="attention-list">
              ${equipmentNeedingAttention.slice(0, 5).map(item => {
                const client = this.getClientById(item.clientId);
                return `<li class="attention-item ${item.status}">
                  <div class="item-name">${item.model} (${item.type})</div>
                  <div class="item-client">${client ? client.name : 'Unknown Client'}</div>
                  <div class="item-status">${item.status}</div>
                  <button data-equipment-action="view" data-id="${item.id}" class="btn btn-sm">Details</button>
                </li>`;
              }).join('')}
            </ul>` :
            '<p class="empty-list">No equipment needs attention</p>'
          }
          ${equipmentNeedingAttention.length > 5 ? 
            `<div class="view-more">+ ${equipmentNeedingAttention.length - 5} more</div>` : ''
          }
        </div>
        
        <div class="dashboard-section">
          <h3>Upcoming Service Appointments</h3>
          ${upcomingAppointments.length > 0 ? 
            `<ul class="appointments-list">
              ${upcomingAppointments.slice(0, 5).map(appointment => `
                <li class="appointment-item">
                  <div class="appointment-date">${appointment.scheduledDate}</div>
                  <div class="appointment-client">${appointment.clientName}</div>
                  <div class="appointment-type">${appointment.contractType}</div>
                  <button data-client-action="view" data-id="${appointment.clientId}" class="btn btn-sm">Client</button>
                </li>
              `).join('')}
            </ul>` :
            '<p class="empty-list">No upcoming appointments</p>'
          }
          ${upcomingAppointments.length > 5 ? 
            `<div class="view-more">+ ${upcomingAppointments.length - 5} more</div>` : ''
          }
        </div>
        
        <div class="dashboard-section">
          <h3>High Priority Clients</h3>
          ${highPriorityClients.length > 0 ? 
            `<ul class="priority-list">
              ${highPriorityClients.slice(0, 5).map(client => `
                <li class="priority-item">
                  <div class="priority-name">${client.name}</div>
                  <div class="priority-contact">${client.contact}</div>
                  <div class="priority-location">${client.city}, ${client.state}</div>
                  <button data-client-action="view" data-id="${client.id}" class="btn btn-sm">Details</button>
                </li>
              `).join('')}
            </ul>` :
            '<p class="empty-list">No high priority clients</p>'
          }
          ${highPriorityClients.length > 5 ? 
            `<div class="view-more">+ ${highPriorityClients.length - 5} more</div>` : ''
          }
        </div>
      </div>
    `;
    
    // Add event listeners for the dashboard elements
    container.querySelectorAll('[data-client-action]').forEach(element => {
      element.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-client-action');
        const id = e.target.getAttribute('data-id');
        
        if (action === 'view') {
          this.showClientDetails(id);
        }
      });
    });
    
    container.querySelectorAll('[data-equipment-action]').forEach(element => {
      element.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-equipment-action');
        const id = e.target.getAttribute('data-id');
        
        if (action === 'view') {
          this.showEquipmentDetails(id);
        }
      });
    });
  }

  // UI Dialog Methods
  showClientDetails(clientId) {
    const client = this.getClientById(clientId);
    if (!client) return;
    
    const equipment = this.getEquipmentForClient(clientId);
    const contracts = this.getContractsForClient(clientId);
    
    // Create modal overlay for client details
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content client-details-modal">
        <div class="modal-header">
          <h2>${client.name}</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="client-info-section">
            <h3>Client Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Contact</label>
                <div>${client.contact}</div>
              </div>
              <div class="info-item">
                <label>Phone</label>
                <div>${client.phone}</div>
              </div>
              <div class="info-item">
                <label>Email</label>
                <div>${client.email}</div>
              </div>
              <div class="info-item">
                <label>Address</label>
                <div>${client.address}, ${client.city}, ${client.state}</div>
              </div>
              <div class="info-item">
                <label>Status</label>
                <div><span class="status-badge ${client.status}">${client.status}</span></div>
              </div>
              <div class="info-item">
                <label>Priority</label>
                <div><span class="priority-badge ${client.priority}">${client.priority}</span></div>
              </div>
            </div>
            <div class="notes-section">
              <h4>Notes</h4>
              <p>${client.notes || 'No notes available'}</p>
            </div>
          </div>
          
          <div class="equipment-section">
            <h3>Equipment (${equipment.length})</h3>
            ${equipment.length > 0 ? 
              `<div class="equipment-list">
                ${equipment.map(item => `
                  <div class="equipment-item status-${item.status}">
                    <div class="equipment-type">${item.type}</div>
                    <div class="equipment-model">${item.model}</div>
                    <div class="equipment-manufacturer">${item.manufacturer}</div>
                    <div class="equipment-status">${item.status}</div>
                    <button data-equipment-action="view" data-id="${item.id}" class="btn btn-sm">Details</button>
                  </div>
                `).join('')}
              </div>` :
              '<p>No equipment registered for this client</p>'
            }
            <button data-client-action="add-equipment" data-id="${client.id}" class="btn btn-primary">Add Equipment</button>
          </div>
          
          <div class="contracts-section">
            <h3>Service Contracts (${contracts.length})</h3>
            ${contracts.length > 0 ? 
              `<div class="contracts-list">
                ${contracts.map(contract => `
                  <div class="contract-item type-${contract.type} ${contract.status}">
                    <div class="contract-type">${contract.type}</div>
                    <div class="contract-dates">${contract.startDate} to ${contract.endDate}</div>
                    <div class="contract-frequency">${contract.frequency} service</div>
                    <div class="contract-value">$${contract.value}</div>
                    <div class="contract-status">${contract.status}</div>
                  </div>
                `).join('')}
              </div>` :
              '<p>No service contracts for this client</p>'
            }
            <button data-client-action="add-contract" data-id="${client.id}" class="btn btn-primary">Add Contract</button>
          </div>
        </div>
        <div class="modal-footer">
          <button data-client-action="edit" data-id="${client.id}" class="btn btn-secondary">Edit Client</button>
          <button class="close-modal-btn btn">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.querySelector('.close-modal-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.querySelectorAll('[data-client-action]').forEach(element => {
      element.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-client-action');
        const id = e.target.getAttribute('data-id');
        
        document.body.removeChild(modal);
        
        switch(action) {
          case 'edit':
            this.showEditClientForm(id);
            break;
          case 'add-equipment':
            this.showAddEquipmentForm(id);
            break;
          case 'add-contract':
            this.showAddContractForm(id);
            break;
        }
      });
    });
    
    modal.querySelectorAll('[data-equipment-action]').forEach(element => {
      element.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-equipment-action');
        const id = e.target.getAttribute('data-id');
        
        document.body.removeChild(modal);
        
        if (action === 'view') {
          this.showEquipmentDetails(id);
        }
      });
    });
  }

  showEquipmentDetails(equipmentId) {
    const equipment = this.equipment.find(item => item.id === equipmentId);
    if (!equipment) return;
    
    const client = this.getClientById(equipment.clientId);
    const maintenanceRecords = this.getMaintenanceForEquipment(equipmentId);
    
    // Create modal overlay for equipment details
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content equipment-details-modal">
        <div class="modal-header">
          <h2>${equipment.model} - ${equipment.type}</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="equipment-info-section">
            <h3>Equipment Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Client</label>
                <div>${client ? client.name : 'Unknown'}</div>
              </div>
              <div class="info-item">
                <label>Type</label>
                <div>${equipment.type}</div>
              </div>
              <div class="info-item">
                <label>Model</label>
                <div>${equipment.model}</div>
              </div>
              <div class="info-item">
                <label>Manufacturer</label>
                <div>${equipment.manufacturer}</div>
              </div>
              <div class="info-item">
                <label>Install Date</label>
                <div>${equipment.installDate}</div>
              </div>
              <div class="info-item">
                <label>Last Service</label>
                <div>${equipment.lastService}</div>
              </div>
              <div class="info-item">
                <label>Status</label>
                <div><span class="status-badge ${equipment.status}">${equipment.status}</span></div>
              </div>
              <div class="info-item">
                <label>Warranty Expiry</label>
                <div>${equipment.warrantyExpiry}</div>
              </div>
            </div>
          </div>
          
          <div class="maintenance-history-section">
            <h3>Maintenance History (${maintenanceRecords.length})</h3>
            ${maintenanceRecords.length > 0 ? 
              `<div class="maintenance-list">
                ${maintenanceRecords.map(record => `
                  <div class="maintenance-item type-${record.type}">
                    <div class="maintenance-date">${record.date}</div>
                    <div class="maintenance-type">${record.type}</div>
                    <div class="maintenance-tech">${record.technician}</div>
                    <div class="maintenance-cost">$${record.cost}</div>
                    <div class="maintenance-notes">${record.notes}</div>
                    <div class="maintenance-parts">${record.parts || 'None'}</div>
                  </div>
                `).join('')}
              </div>` :
              '<p>No maintenance records for this equipment</p>'
            }
            <button data-equipment-action="add-maintenance" data-id="${equipment.id}" class="btn btn-primary">Add Maintenance Record</button>
          </div>
        </div>
        <div class="modal-footer">
          <button data-equipment-action="edit" data-id="${equipment.id}" class="btn btn-secondary">Edit Equipment</button>
          <button data-equipment-action="update-status" data-id="${equipment.id}" class="btn btn-tertiary">Update Status</button>
          <button class="close-modal-btn btn">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.querySelector('.close-modal-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.querySelectorAll('[data-equipment-action]').forEach(element => {
      element.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-equipment-action');
        const id = e.target.getAttribute('data-id');
        
        document.body.removeChild(modal);
        
        switch(action) {
          case 'edit':
            this.showEditEquipmentForm(id);
            break;
          case 'add-maintenance':
            this.showAddMaintenanceForm(id);
            break;
          case 'update-status':
            this.showUpdateStatusForm(id);
            break;
        }
      });
    });
  }

  // Form handlers - implementations would show forms and handle submissions
  showEditClientForm(clientId) {
    console.log(`Edit client form for ${clientId}`);
    // Implementation would create and show a form for editing client details
  }
  
  showAddEquipmentForm(clientId) {
    console.log(`Add equipment form for client ${clientId}`);
    // Implementation would create and show a form for adding equipment
  }
  
  showAddMaintenanceForm(equipmentId) {
    console.log(`Add maintenance form for equipment ${equipmentId}`);
    // Implementation would create and show a form for adding a maintenance record
  }
  
  showAddContractForm(clientId) {
    console.log(`Add contract form for client ${clientId}`);
    // Implementation would create and show a form for adding a service contract
  }
  
  showEditEquipmentForm(equipmentId) {
    console.log(`Edit equipment form for ${equipmentId}`);
    // Implementation would create and show a form for editing equipment details
  }
  
  showUpdateStatusForm(equipmentId) {
    console.log(`Update status form for equipment ${equipmentId}`);
    // Implementation would create and show a form for updating equipment status
  }
  
  toggleClientStatus(clientId) {
    const client = this.getClientById(clientId);
    if (client) {
      const newStatus = client.status === 'active' ? 'inactive' : 'active';
      this.updateClient(clientId, { status: newStatus });
      console.log(`Client ${clientId} status toggled to ${newStatus}`);
    }
  }
  
  handleClientFormSubmit(form) {
    console.log('Client form submitted');
    // Implementation would process the form data and update/create a client
  }
  
  handleEquipmentFormSubmit(form) {
    console.log('Equipment form submitted');
    // Implementation would process the form data and update/create equipment
  }
  
  handleMaintenanceFormSubmit(form) {
    console.log('Maintenance form submitted');
    // Implementation would process the form data and create a maintenance record
  }
  
  handleContractFormSubmit(form) {
    console.log('Contract form submitted');
    // Implementation would process the form data and update/create a service contract
  }
}

// Export the client data manager for use in other modules
const clientManager = new ClientDataManager();
window.clientManager = clientManager; // Make it globally accessible

export default clientManager;