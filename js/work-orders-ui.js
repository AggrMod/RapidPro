// Work Orders UI Module - View and Manage Work Orders

let allWorkOrders = [];
let filteredWorkOrders = [];
let currentWorkOrderSort = 'scheduledDate'; // scheduledDate, customer, status, priority
let currentWorkOrderFilter = 'scheduled'; // all, draft, scheduled, in_progress, completed
let workOrderSearchQuery = '';

// Open work orders modal
window.openWorkOrdersModal = async function() {
  // Create modal if it doesn't exist
  let modal = document.getElementById('work-orders-modal');
  if (!modal) {
    modal = createWorkOrdersModal();
    document.body.appendChild(modal);
  }

  // Show modal
  modal.classList.add('active');

  // Load work orders
  await loadAllWorkOrders();
};

// Create work orders modal HTML
function createWorkOrdersModal() {
  const modal = document.createElement('div');
  modal.id = 'work-orders-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeWorkOrdersModal()"></div>
    <div class="modal-content work-orders-container">
      <div class="modal-header">
        <h2 class="modal-title">WORK ORDERS</h2>
        <button class="modal-close" onclick="closeWorkOrdersModal()">✕</button>
      </div>

      <div class="work-orders-controls">
        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn-primary" onclick="openCreateWorkOrderForm()">
            ➕ NEW WORK ORDER
          </button>
          <button class="btn-secondary" onclick="viewTodaySchedule()">
            📅 TODAY'S SCHEDULE
          </button>
        </div>

        <!-- Search Bar -->
        <div class="search-container">
          <input
            type="text"
            id="work-orders-search"
            class="search-input"
            placeholder="Search by customer or equipment..."
            oninput="handleWorkOrderSearch(this.value)"
          >
          <button class="search-clear" onclick="clearWorkOrderSearch()" style="display: none;">✕</button>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button class="filter-tab active" data-filter="scheduled" onclick="filterWorkOrders('scheduled')">
            Scheduled <span class="tab-count" id="count-scheduled">0</span>
          </button>
          <button class="filter-tab" data-filter="in_progress" onclick="filterWorkOrders('in_progress')">
            In Progress <span class="tab-count" id="count-in-progress">0</span>
          </button>
          <button class="filter-tab" data-filter="all" onclick="filterWorkOrders('all')">
            All <span class="tab-count" id="count-all-wo">0</span>
          </button>
          <button class="filter-tab" data-filter="completed" onclick="filterWorkOrders('completed')">
            Completed <span class="tab-count" id="count-completed-wo">0</span>
          </button>
        </div>

        <!-- Sort Options -->
        <div class="sort-container">
          <label>Sort by:</label>
          <select id="work-orders-sort" class="sort-select" onchange="handleWorkOrderSort(this.value)">
            <option value="scheduledDate">Scheduled Date</option>
            <option value="customer">Customer (A-Z)</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      <!-- Work Orders List -->
      <div class="work-orders-list" id="work-orders-list">
        <div class="loading-spinner">Loading work orders...</div>
      </div>

      <!-- Results Summary -->
      <div class="results-summary">
        Showing <span id="results-count-wo">0</span> work orders
      </div>
    </div>
  `;

  return modal;
}

// Close work orders modal
window.closeWorkOrdersModal = function() {
  const modal = document.getElementById('work-orders-modal');
  if (modal) {
    modal.classList.remove('active');
  }
};

// Load all work orders from Firestore
async function loadAllWorkOrders() {
  try {
    const listContainer = document.getElementById('work-orders-list');
    listContainer.innerHTML = '<div class="loading-spinner">Loading work orders...</div>';

    // Fetch all work orders for current user
    const snapshot = await db.collection('workOrders')
      .where('assignedTo', '==', currentUser.uid)
      .orderBy('createdAt', 'desc')
      .get();

    allWorkOrders = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const workOrder = {
        id: doc.id,
        customerName: data.customerName,
        customerAddress: data.customerAddress,
        customerPhone: data.customerPhone,
        equipmentType: data.equipmentType,
        description: data.description,
        status: data.status || 'draft',
        priority: data.priority || 'medium',
        scheduledDate: data.scheduledDate ? data.scheduledDate.toDate() : null,
        completedAt: data.completedAt ? data.completedAt.toDate() : null,
        estimatedHours: data.estimatedHours || 0,
        partsNeeded: data.partsNeeded || [],
        safetyNotes: data.safetyNotes || '',
        accessInstructions: data.accessInstructions || '',
        preWorkChecklist: data.preWorkChecklist || []
      };
      allWorkOrders.push(workOrder);
    });

    // Update counts
    updateWorkOrderCounts();

    // Apply current filter and sort
    applyWorkOrderFiltersAndSort();

  } catch (error) {
    console.error('Error loading work orders:', error);
    document.getElementById('work-orders-list').innerHTML = `
      <div class="error-message">
        <p>Error loading work orders. Please try again.</p>
        <button class="btn-secondary" onclick="loadAllWorkOrders()">Retry</button>
      </div>
    `;
  }
}

// Update filter tab counts
function updateWorkOrderCounts() {
  const counts = {
    all: allWorkOrders.length,
    draft: allWorkOrders.filter(wo => wo.status === 'draft').length,
    scheduled: allWorkOrders.filter(wo => wo.status === 'scheduled').length,
    in_progress: allWorkOrders.filter(wo => wo.status === 'in_progress').length,
    parts_ordered: allWorkOrders.filter(wo => wo.status === 'parts_ordered').length,
    completed: allWorkOrders.filter(wo => wo.status === 'completed').length
  };

  document.getElementById('count-all-wo').textContent = counts.all;
  document.getElementById('count-scheduled').textContent = counts.scheduled;
  document.getElementById('count-in-progress').textContent = counts.in_progress;
  document.getElementById('count-completed-wo').textContent = counts.completed;
}

// Filter work orders by status
window.filterWorkOrders = function(filter) {
  currentWorkOrderFilter = filter;

  // Update active tab
  document.querySelectorAll('#work-orders-modal .filter-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.filter === filter) {
      tab.classList.add('active');
    }
  });

  applyWorkOrderFiltersAndSort();
};

// Handle search input
window.handleWorkOrderSearch = function(query) {
  workOrderSearchQuery = query.toLowerCase().trim();

  // Show/hide clear button
  const clearBtn = document.querySelector('#work-orders-modal .search-clear');
  if (clearBtn) {
    if (workOrderSearchQuery) {
      clearBtn.style.display = 'block';
    } else {
      clearBtn.style.display = 'none';
    }
  }

  applyWorkOrderFiltersAndSort();
};

// Clear search
window.clearWorkOrderSearch = function() {
  document.getElementById('work-orders-search').value = '';
  workOrderSearchQuery = '';
  const clearBtn = document.querySelector('#work-orders-modal .search-clear');
  if (clearBtn) clearBtn.style.display = 'none';
  applyWorkOrderFiltersAndSort();
};

// Handle sort change
window.handleWorkOrderSort = function(sortBy) {
  currentWorkOrderSort = sortBy;
  applyWorkOrderFiltersAndSort();
};

// Apply all filters and sorting
function applyWorkOrderFiltersAndSort() {
  // Start with all work orders
  filteredWorkOrders = [...allWorkOrders];

  // Apply status filter
  if (currentWorkOrderFilter !== 'all') {
    filteredWorkOrders = filteredWorkOrders.filter(wo => wo.status === currentWorkOrderFilter);
  }

  // Apply search filter
  if (workOrderSearchQuery) {
    filteredWorkOrders = filteredWorkOrders.filter(wo =>
      wo.customerName.toLowerCase().includes(workOrderSearchQuery) ||
      (wo.equipmentType && wo.equipmentType.toLowerCase().includes(workOrderSearchQuery)) ||
      (wo.customerAddress && wo.customerAddress.toLowerCase().includes(workOrderSearchQuery))
    );
  }

  // Apply sorting
  filteredWorkOrders.sort((a, b) => {
    switch (currentWorkOrderSort) {
      case 'scheduledDate':
        if (!a.scheduledDate) return 1;
        if (!b.scheduledDate) return -1;
        return a.scheduledDate - b.scheduledDate;
      case 'customer':
        return a.customerName.localeCompare(b.customerName);
      case 'priority':
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  // Render work orders
  renderWorkOrders();
}

// Render work orders list
function renderWorkOrders() {
  const listContainer = document.getElementById('work-orders-list');
  const resultsCount = document.getElementById('results-count-wo');

  if (!listContainer || !resultsCount) return;

  resultsCount.textContent = filteredWorkOrders.length;

  if (filteredWorkOrders.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <p>No work orders found</p>
        ${workOrderSearchQuery ? '<button class="btn-secondary" onclick="clearWorkOrderSearch()">Clear Search</button>' : ''}
        <button class="btn-primary" onclick="openCreateWorkOrderForm()">Create Work Order</button>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = filteredWorkOrders.map(wo => `
    <div class="work-order-item" onclick="viewWorkOrderDetails('${wo.id}')">
      <div class="work-order-item-header">
        <h3 class="work-order-item-name">${wo.customerName}</h3>
        <span class="status-badge status-${wo.status}">${formatStatus(wo.status)}</span>
      </div>
      <div class="work-order-item-details">
        <div class="work-order-detail">
          <span class="detail-icon">🔧</span>
          <span>${wo.equipmentType || 'General Service'}</span>
        </div>
        <div class="work-order-detail">
          <span class="detail-icon">📍</span>
          <span>${wo.customerAddress}</span>
        </div>
        ${wo.scheduledDate ? `
          <div class="work-order-detail">
            <span class="detail-icon">📅</span>
            <span>Scheduled: ${formatScheduledDate(wo.scheduledDate)}</span>
          </div>
        ` : '<div class="work-order-detail"><span class="detail-icon">⏳</span><span>Not scheduled yet</span></div>'}
        ${wo.partsNeeded.length > 0 ? `
          <div class="work-order-detail">
            <span class="detail-icon">📦</span>
            <span>${wo.partsNeeded.length} part(s) needed</span>
          </div>
        ` : ''}
      </div>
      <div class="work-order-item-footer">
        <span class="priority-badge priority-${wo.priority}">${wo.priority.toUpperCase()}</span>
        ${wo.estimatedHours > 0 ? `<span class="estimate">~${wo.estimatedHours}h</span>` : ''}
        <button class="btn-small btn-primary" onclick="event.stopPropagation(); viewWorkOrderDetails('${wo.id}')">
          ${getActionButtonText(wo.status)}
        </button>
      </div>
    </div>
  `).join('');
}

// Format status for display
function formatStatus(status) {
  const statusMap = {
    'draft': 'DRAFT',
    'scheduled': 'SCHEDULED',
    'in_progress': 'IN PROGRESS',
    'parts_ordered': 'PARTS ORDERED',
    'completed': 'COMPLETED',
    'invoiced': 'INVOICED',
    'cancelled': 'CANCELLED'
  };
  return statusMap[status] || status.toUpperCase();
}

// Format scheduled date for display
function formatScheduledDate(date) {
  if (!date) return 'Not scheduled';

  const now = new Date();
  const diffMs = date - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  if (diffDays === 1) return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  if (diffDays === -1) return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays < 7) return `In ${diffDays} days`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

// Get action button text based on status
function getActionButtonText(status) {
  switch (status) {
    case 'draft':
      return 'Schedule →';
    case 'scheduled':
      return 'Start Work →';
    case 'in_progress':
      return 'Continue →';
    case 'completed':
      return 'View Details →';
    default:
      return 'View →';
  }
}

// View today's schedule
window.viewTodaySchedule = async function() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayWorkOrders = allWorkOrders.filter(wo => {
      if (!wo.scheduledDate) return false;
      const woDate = new Date(wo.scheduledDate);
      woDate.setHours(0, 0, 0, 0);
      return woDate.getTime() === today.getTime();
    });

    // Create today's schedule modal
    displayTodaySchedule(todayWorkOrders);
  } catch (error) {
    console.error('Error viewing today\'s schedule:', error);
    alert('Error loading today\'s schedule');
  }
};

// Display today's schedule
function displayTodaySchedule(workOrders) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">TODAY'S SCHEDULE</h2>
        <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</button>
      </div>
      <div class="schedule-content">
        ${workOrders.length === 0 ? `
          <div class="empty-state">
            <p>No work orders scheduled for today</p>
            <button class="btn-primary" onclick="this.parentElement.parentElement.parentElement.parentElement.remove(); openCreateWorkOrderForm()">
              Schedule Work Order
            </button>
          </div>
        ` : `
          <div class="schedule-list">
            ${workOrders
              .sort((a, b) => a.scheduledDate - b.scheduledDate)
              .map(wo => `
                <div class="schedule-item">
                  <div class="schedule-time">
                    ${wo.scheduledDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                  <div class="schedule-details">
                    <h4>${wo.customerName}</h4>
                    <p>${wo.equipmentType || 'General Service'}</p>
                    <p class="address">${wo.customerAddress}</p>
                  </div>
                  <div class="schedule-actions">
                    <button class="btn-small btn-primary" onclick="viewWorkOrderDetails('${wo.id}')">
                      ${wo.status === 'scheduled' ? 'Start Work' : 'View'}
                    </button>
                  </div>
                </div>
              `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// View work order details
window.viewWorkOrderDetails = async function(workOrderId) {
  try {
    const workOrder = await getWorkOrderById(workOrderId);
    displayWorkOrderDetailsModal(workOrder);
  } catch (error) {
    console.error('Error viewing work order:', error);
    alert('Error loading work order details');
  }
};

// Display work order details modal
function displayWorkOrderDetailsModal(workOrder) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'work-order-detail-modal';

  const checklistProgress = workOrder.preWorkChecklist ?
    `${workOrder.preWorkChecklist.filter(c => c.completed).length}/${workOrder.preWorkChecklist.length}` : '0/0';

  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeWorkOrderDetail()"></div>
    <div class="modal-content work-order-detail">
      <div class="modal-header">
        <h2 class="modal-title">WORK ORDER DETAILS</h2>
        <button class="modal-close" onclick="closeWorkOrderDetail()">✕</button>
      </div>

      <div class="detail-content">
        <!-- Customer Info -->
        <section class="detail-section">
          <h3>Customer Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Name:</label>
              <span>${workOrder.customerName}</span>
            </div>
            <div class="info-item">
              <label>Phone:</label>
              <span><a href="tel:${workOrder.customerPhone}">${workOrder.customerPhone}</a></span>
            </div>
            <div class="info-item">
              <label>Address:</label>
              <span>${workOrder.customerAddress}</span>
            </div>
          </div>
        </section>

        <!-- Work Details -->
        <section class="detail-section">
          <h3>Work Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Equipment:</label>
              <span>${workOrder.equipmentType || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>Status:</label>
              ${getStatusBadgeHTML(workOrder.status)}
            </div>
            <div class="info-item">
              <label>Priority:</label>
              <span class="priority-badge priority-${workOrder.priority}">${workOrder.priority.toUpperCase()}</span>
            </div>
            <div class="info-item">
              <label>Scheduled:</label>
              <span>${workOrder.scheduledDate ? workOrder.scheduledDate.toLocaleString() : 'Not scheduled'}</span>
            </div>
          </div>
          ${workOrder.description ? `
            <div class="info-item full-width">
              <label>Description:</label>
              <p>${workOrder.description}</p>
            </div>
          ` : ''}
        </section>

        <!-- Pre-Work Checklist -->
        ${workOrder.preWorkChecklist && workOrder.preWorkChecklist.length > 0 ? `
          <section class="detail-section">
            <h3>Pre-Work Checklist <span class="checklist-progress">${checklistProgress}</span></h3>
            <div class="checklist">
              ${workOrder.preWorkChecklist.map(item => `
                <label class="checklist-item">
                  <input type="checkbox" ${item.completed ? 'checked' : ''}
                    onchange="toggleChecklistItemUI('${workOrder.id}', ${item.id})">
                  <span>${item.item}</span>
                </label>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <!-- Parts -->
        ${workOrder.partsNeeded && workOrder.partsNeeded.length > 0 ? `
          <section class="detail-section">
            <h3>Parts Needed</h3>
            <div class="parts-list">
              ${workOrder.partsNeeded.map(part => `
                <div class="part-item">
                  <span>${part.name || part.partNumber}</span>
                  <span class="${part.received ? 'part-received' : 'part-pending'}">
                    ${part.received ? '✓ Received' : '⏳ Pending'}
                  </span>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <!-- Safety & Access -->
        <section class="detail-section">
          <h3>Safety & Access</h3>
          ${workOrder.safetyNotes ? `
            <div class="info-item full-width">
              <label>⚠️ Safety Notes:</label>
              <div class="alert alert-warning">${workOrder.safetyNotes}</div>
            </div>
          ` : ''}
          ${workOrder.accessInstructions ? `
            <div class="info-item full-width">
              <label>🔑 Access Instructions:</label>
              <p>${workOrder.accessInstructions}</p>
            </div>
          ` : ''}
        </section>

        <!-- Actions -->
        <section class="detail-actions">
          ${workOrder.status === 'scheduled' ? `
            <button class="btn-large btn-primary" onclick="startWorkOrderUI('${workOrder.id}')">
              ▶️ START WORK
            </button>
          ` : ''}
          ${workOrder.status === 'in_progress' ? `
            <button class="btn-large btn-success" onclick="completeWorkOrderUI('${workOrder.id}')">
              ✓ COMPLETE WORK
            </button>
          ` : ''}
          <button class="btn-secondary" onclick="closeWorkOrderDetail()">Close</button>
        </section>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Close work order detail modal
window.closeWorkOrderDetail = function() {
  const modal = document.getElementById('work-order-detail-modal');
  if (modal) modal.remove();
};

// Start work order from UI
window.startWorkOrderUI = async function(workOrderId) {
  if (confirm('Start work on this order?')) {
    try {
      await startWorkOrder(workOrderId);
      closeWorkOrderDetail();
      await loadAllWorkOrders();
      alert('Work order started!');
    } catch (error) {
      alert('Error starting work order: ' + error.message);
    }
  }
};

// Toggle checklist item from UI
window.toggleChecklistItemUI = async function(workOrderId, itemId) {
  try {
    await toggleChecklistItem(workOrderId, itemId);
  } catch (error) {
    console.error('Error toggling checklist item:', error);
  }
};

// Complete work order from UI
window.completeWorkOrderUI = async function(workOrderId) {
  // This would open a completion form in a real implementation
  const notes = prompt('Completion notes:');
  if (notes !== null) {
    try {
      await completeWorkOrder(workOrderId, {
        notes: notes,
        actualHours: 0, // Would be tracked in real implementation
        partsUsed: [],
        beforePhotos: [],
        afterPhotos: []
      });
      closeWorkOrderDetail();
      await loadAllWorkOrders();
      alert('Work order completed!');
    } catch (error) {
      alert('Error completing work order: ' + error.message);
    }
  }
};

// Open create work order form
window.openCreateWorkOrderForm = function() {
  alert('Create Work Order form coming soon!\n\nFor now, work orders are created from accepted quotes (Task 7).');
  // This will be implemented as part of Task 7 integration
};

// Initialize event listeners
console.log('Work orders UI module loaded');
