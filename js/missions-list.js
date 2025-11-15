// Missions List Modal - View and Manage All Missions

let allMissions = [];
let filteredMissions = [];
let currentSort = 'distance'; // distance, name, priority
let currentFilter = 'pending'; // all, pending, completed, closed
let searchQuery = '';

// Open missions list modal
window.openMissionsListModal = async function() {
  // Create modal if it doesn't exist
  let modal = document.getElementById('missions-list-modal');
  if (!modal) {
    modal = createMissionsListModal();
    document.body.appendChild(modal);
  }

  // Show modal
  modal.classList.add('active');

  // Load missions
  await loadAllMissions();
};

// Create missions list modal HTML
function createMissionsListModal() {
  const modal = document.createElement('div');
  modal.id = 'missions-list-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeMissionsListModal()"></div>
    <div class="modal-content missions-list-container">
      <div class="modal-header">
        <h2 class="modal-title">ALL MISSIONS</h2>
        <button class="modal-close" onclick="closeMissionsListModal()">✕</button>
      </div>

      <div class="missions-controls">
        <!-- Search Bar -->
        <div class="search-container">
          <input
            type="text"
            id="missions-search"
            class="search-input"
            placeholder="Search by name or address..."
            oninput="handleMissionSearch(this.value)"
          >
          <button class="search-clear" onclick="clearMissionSearch()" style="display: none;">✕</button>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button class="filter-tab active" data-filter="pending" onclick="filterMissions('pending')">
            Pending <span class="tab-count" id="count-pending">0</span>
          </button>
          <button class="filter-tab" data-filter="all" onclick="filterMissions('all')">
            All <span class="tab-count" id="count-all">0</span>
          </button>
          <button class="filter-tab" data-filter="completed" onclick="filterMissions('completed')">
            Completed <span class="tab-count" id="count-completed">0</span>
          </button>
          <button class="filter-tab" data-filter="closed" onclick="filterMissions('closed')">
            Closed <span class="tab-count" id="count-closed">0</span>
          </button>
        </div>

        <!-- Sort Options -->
        <div class="sort-container">
          <label>Sort by:</label>
          <select id="missions-sort" class="sort-select" onchange="handleMissionSort(this.value)">
            <option value="distance">Distance</option>
            <option value="name">Name (A-Z)</option>
            <option value="priority">Priority</option>
            <option value="lastInteraction">Last Interaction</option>
          </select>
        </div>
      </div>

      <!-- Missions List -->
      <div class="missions-list" id="missions-list">
        <div class="loading-spinner">Loading missions...</div>
      </div>

      <!-- Results Summary -->
      <div class="results-summary">
        Showing <span id="results-count">0</span> missions
      </div>
    </div>
  `;

  return modal;
}

// Close missions list modal
window.closeMissionsListModal = function() {
  const modal = document.getElementById('missions-list-modal');
  if (modal) {
    modal.classList.remove('active');
  }
};

// Load all missions from Firestore
async function loadAllMissions() {
  try {
    const listContainer = document.getElementById('missions-list');
    listContainer.innerHTML = '<div class="loading-spinner">Loading missions...</div>';

    // Get current user location for distance calculation
    const userLoc = await getUserLocationForMissions();

    // Fetch all locations
    const snapshot = await db.collection('locations').get();

    allMissions = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const mission = {
        id: doc.id,
        name: data.name,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        status: data.status || 'pending',
        type: data.type || 'commercial kitchen',
        priority: data.priority || 'medium',
        lastInteractionDate: data.lastInteractionDate || null,
        totalInteractions: data.totalInteractions || 0,
        avgEfficacy: data.avgEfficacyScore || 0,
        distance: calculateDistance(userLoc.lat, userLoc.lng, data.lat, data.lng)
      };
      allMissions.push(mission);
    });

    // Update counts
    updateFilterCounts();

    // Apply current filter and sort
    applyFiltersAndSort();

  } catch (error) {
    console.error('Error loading missions:', error);
    document.getElementById('missions-list').innerHTML = `
      <div class="error-message">
        <p>Error loading missions. Please try again.</p>
        <button class="btn-secondary" onclick="loadAllMissions()">Retry</button>
      </div>
    `;
  }
}

// Get user location (reuse from mission.js or use default)
async function getUserLocationForMissions() {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Default to Memphis downtown if geolocation fails
          resolve({ lat: 35.1495, lng: -90.0490 });
        }
      );
    } else {
      resolve({ lat: 35.1495, lng: -90.0490 });
    }
  });
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Radius of Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Update filter tab counts
function updateFilterCounts() {
  const counts = {
    all: allMissions.length,
    pending: allMissions.filter(m => m.status === 'pending').length,
    completed: allMissions.filter(m => m.status === 'completed').length,
    closed: allMissions.filter(m => m.status === 'closed').length
  };

  document.getElementById('count-all').textContent = counts.all;
  document.getElementById('count-pending').textContent = counts.pending;
  document.getElementById('count-completed').textContent = counts.completed;
  document.getElementById('count-closed').textContent = counts.closed;
}

// Filter missions by status
window.filterMissions = function(filter) {
  currentFilter = filter;

  // Update active tab
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.filter === filter) {
      tab.classList.add('active');
    }
  });

  applyFiltersAndSort();
};

// Handle search input
window.handleMissionSearch = function(query) {
  searchQuery = query.toLowerCase().trim();

  // Show/hide clear button
  const clearBtn = document.querySelector('.search-clear');
  if (searchQuery) {
    clearBtn.style.display = 'block';
  } else {
    clearBtn.style.display = 'none';
  }

  applyFiltersAndSort();
};

// Clear search
window.clearMissionSearch = function() {
  document.getElementById('missions-search').value = '';
  searchQuery = '';
  document.querySelector('.search-clear').style.display = 'none';
  applyFiltersAndSort();
};

// Handle sort change
window.handleMissionSort = function(sortBy) {
  currentSort = sortBy;
  applyFiltersAndSort();
};

// Apply all filters and sorting
function applyFiltersAndSort() {
  // Start with all missions
  filteredMissions = [...allMissions];

  // Apply status filter
  if (currentFilter !== 'all') {
    filteredMissions = filteredMissions.filter(m => m.status === currentFilter);
  }

  // Apply search filter
  if (searchQuery) {
    filteredMissions = filteredMissions.filter(m =>
      m.name.toLowerCase().includes(searchQuery) ||
      m.address.toLowerCase().includes(searchQuery)
    );
  }

  // Apply sorting
  filteredMissions.sort((a, b) => {
    switch (currentSort) {
      case 'distance':
        return a.distance - b.distance;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'priority':
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'lastInteraction':
        if (!a.lastInteractionDate) return 1;
        if (!b.lastInteractionDate) return -1;
        return new Date(b.lastInteractionDate) - new Date(a.lastInteractionDate);
      default:
        return 0;
    }
  });

  // Render missions
  renderMissions();
}

// Render missions list
function renderMissions() {
  const listContainer = document.getElementById('missions-list');
  const resultsCount = document.getElementById('results-count');

  resultsCount.textContent = filteredMissions.length;

  if (filteredMissions.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <p>No missions found</p>
        ${searchQuery ? '<button class="btn-secondary" onclick="clearMissionSearch()">Clear Search</button>' : ''}
      </div>
    `;
    return;
  }

  listContainer.innerHTML = filteredMissions.map(mission => `
    <div class="mission-item" onclick="viewMissionDetails('${mission.id}')">
      <div class="mission-item-header">
        <h3 class="mission-item-name">${mission.name}</h3>
        <span class="priority-badge priority-${mission.priority}">${mission.priority.toUpperCase()}</span>
      </div>
      <div class="mission-item-details">
        <div class="mission-detail">
          <span class="detail-icon">📍</span>
          <span>${mission.address}</span>
        </div>
        <div class="mission-detail">
          <span class="detail-icon">🚗</span>
          <span>${mission.distance.toFixed(1)} mi away</span>
        </div>
        ${mission.lastInteractionDate ? `
          <div class="mission-detail">
            <span class="detail-icon">🕒</span>
            <span>Last visit: ${formatDate(mission.lastInteractionDate)}</span>
          </div>
        ` : '<div class="mission-detail"><span class="detail-icon">🆕</span><span>No interactions yet</span></div>'}
        ${mission.totalInteractions > 0 ? `
          <div class="mission-detail">
            <span class="detail-icon">⭐</span>
            <span>${mission.totalInteractions} interactions | Avg: ${mission.avgEfficacy.toFixed(1)}/5</span>
          </div>
        ` : ''}
      </div>
      <div class="mission-item-footer">
        <span class="status-badge status-${mission.status}">${mission.status}</span>
        <button class="btn-small btn-primary" onclick="event.stopPropagation(); viewMissionDetails('${mission.id}')">View Details →</button>
      </div>
    </div>
  `).join('');
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString();
}

// View mission details (placeholder for Task #2)
window.viewMissionDetails = function(missionId) {
  console.log('View mission details for:', missionId);
  // This will be implemented in Task #2 - Mission Details View
  alert(`Mission Details View coming in Task #2!\n\nMission ID: ${missionId}\n\nFor now, you can see the mission on the map.`);

  // Close modal
  closeMissionsListModal();

  // Highlight on map if available
  const mission = allMissions.find(m => m.id === missionId);
  if (mission && typeof highlightMission === 'function') {
    highlightMission(mission);
  }
};

// Initialize event listeners when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMissionsList);
} else {
  initMissionsList();
}

function initMissionsList() {
  // Event listeners are handled inline in the HTML for simplicity
  console.log('Missions list module loaded');
}
