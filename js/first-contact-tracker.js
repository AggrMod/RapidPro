// First Contact Tracker - Door Knock Logger
// Mobile-first interface for logging door-knock attempts

let currentLocation = null;
let userGPS = null;

// Initialize GPS tracking
function initializeGPS() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userGPS = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('GPS location acquired:', userGPS);
      },
      (error) => {
        console.warn('GPS not available:', error);
        userGPS = null;
      }
    );
  }
}

// Initialize GPS when page loads
if (typeof window !== 'undefined') {
  initializeGPS();
}

// Show Door Knock Logger Modal
function showDoorKnockLogger(locationId = null, locationData = null) {
  // If location provided, use it; otherwise show location selector
  if (locationId && locationData) {
    currentLocation = {
      id: locationId,
      ...locationData
    };
    showLoggerModal();
  } else {
    // Show location search/selector
    showLocationSelector();
  }
}

// Show Location Selector
function showLocationSelector() {
  const modal = document.createElement('div');
  modal.id = 'location-selector-modal';
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal-content door-knock-content">
      <div class="modal-header">
        <h2>📋 Select Location</h2>
        <button class="close-btn" onclick="closeDoorKnockLogger()">×</button>
      </div>

      <div class="modal-body door-knock-body">
        <div class="location-search">
          <label class="form-label">Search for location</label>
          <input
            type="text"
            id="location-search-input"
            class="form-control location-search-input"
            placeholder="Type business name or address..."
          >
          <div id="location-search-results" class="location-results"></div>
        </div>

        <div class="quick-location-options">
          <button class="btn btn-secondary btn-large" onclick="useCurrentGPSLocation()">
            📍 Use Current GPS Location
          </button>
          <button class="btn btn-secondary btn-large" onclick="manualLocationEntry()">
            ✏️ Enter Location Manually
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Setup search functionality
  const searchInput = document.getElementById('location-search-input');
  searchInput.addEventListener('input', debounce(searchLocations, 300));
}

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Search locations in Firestore
async function searchLocations(event) {
  const query = event.target.value.trim().toLowerCase();
  const resultsContainer = document.getElementById('location-search-results');

  if (!query || query.length < 2) {
    resultsContainer.innerHTML = '';
    return;
  }

  try {
    // Query Firestore for locations
    const locationsRef = db.collection('locations');
    const snapshot = await locationsRef.get();

    const results = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const name = (data.name || '').toLowerCase();
      const address = (data.address || '').toLowerCase();

      if (name.includes(query) || address.includes(query)) {
        results.push({
          id: doc.id,
          ...data
        });
      }
    });

    // Display results
    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="no-results">No locations found</div>';
    } else {
      resultsContainer.innerHTML = results.slice(0, 5).map(loc => `
        <div class="location-result-item" onclick="selectLocation('${loc.id}', ${JSON.stringify(loc).replace(/"/g, '&quot;')})">
          <div class="location-name">${loc.name}</div>
          <div class="location-address">${loc.address || 'No address'}</div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error searching locations:', error);
    resultsContainer.innerHTML = '<div class="error-message">Error searching locations</div>';
  }
}

// Select a location from search results
function selectLocation(locationId, locationData) {
  currentLocation = {
    id: locationId,
    ...locationData
  };

  // Close search modal and show logger
  const searchModal = document.getElementById('location-selector-modal');
  if (searchModal) {
    searchModal.remove();
  }

  showLoggerModal();
}

// Use current GPS location
function useCurrentGPSLocation() {
  if (!userGPS) {
    alert('GPS location not available. Please enable location services or enter location manually.');
    return;
  }

  // Create a GPS-based location entry
  currentLocation = {
    id: 'gps-' + Date.now(),
    name: 'GPS Location',
    address: `${userGPS.lat.toFixed(6)}, ${userGPS.lng.toFixed(6)}`,
    gps: userGPS,
    isGPSOnly: true
  };

  // Close search modal and show logger
  const searchModal = document.getElementById('location-selector-modal');
  if (searchModal) {
    searchModal.remove();
  }

  showLoggerModal();
}

// Manual location entry
function manualLocationEntry() {
  const searchModal = document.getElementById('location-selector-modal');
  if (searchModal) {
    searchModal.remove();
  }

  const modal = document.createElement('div');
  modal.id = 'manual-location-modal';
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal-content door-knock-content">
      <div class="modal-header">
        <h2>✏️ Enter Location Details</h2>
        <button class="close-btn" onclick="closeDoorKnockLogger()">×</button>
      </div>

      <div class="modal-body door-knock-body">
        <div class="form-group">
          <label>Business Name *</label>
          <input type="text" id="manual-name" class="form-control" placeholder="e.g., Memphis BBQ Company">
        </div>

        <div class="form-group">
          <label>Address *</label>
          <input type="text" id="manual-address" class="form-control" placeholder="e.g., 123 Beale St, Memphis, TN">
        </div>

        <div class="form-group">
          <label>Phone (optional)</label>
          <input type="tel" id="manual-phone" class="form-control" placeholder="(555) 123-4567">
        </div>

        <button class="btn btn-primary btn-large" onclick="submitManualLocation()">
          Continue to Logger →
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Submit manual location entry
function submitManualLocation() {
  const name = document.getElementById('manual-name')?.value.trim();
  const address = document.getElementById('manual-address')?.value.trim();
  const phone = document.getElementById('manual-phone')?.value.trim();

  if (!name || !address) {
    alert('Please enter both business name and address');
    return;
  }

  currentLocation = {
    id: 'manual-' + Date.now(),
    name: name,
    address: address,
    phone: phone || null,
    gps: userGPS || null,
    isManualEntry: true
  };

  // Close manual entry modal and show logger
  const manualModal = document.getElementById('manual-location-modal');
  if (manualModal) {
    manualModal.remove();
  }

  showLoggerModal();
}

// Show the main door knock logger interface
function showLoggerModal() {
  const modal = document.createElement('div');
  modal.id = 'door-knock-modal';
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal-content door-knock-content">
      <div class="modal-header">
        <h2>📋 DOOR KNOCK LOGGER</h2>
        <button class="close-btn" onclick="closeDoorKnockLogger()">×</button>
      </div>

      <div class="modal-body door-knock-body">
        <!-- Location Info -->
        <div class="location-info">
          <div class="location-icon">📍</div>
          <div class="location-details">
            <div class="location-name">${currentLocation.name}</div>
            <div class="location-address">${currentLocation.address || 'No address'}</div>
          </div>
        </div>

        <!-- Outcome Buttons -->
        <div class="outcome-section">
          <label class="form-label outcome-label">OUTCOME:</label>
          <div class="outcome-grid">
            <button class="outcome-btn" onclick="selectOutcome('no_answer')">
              <span class="outcome-icon">🚪</span>
              <span class="outcome-text">NO ANSWER</span>
            </button>
            <button class="outcome-btn" onclick="selectOutcome('not_interested')">
              <span class="outcome-icon">❌</span>
              <span class="outcome-text">NOT INTERESTED</span>
            </button>
            <button class="outcome-btn outcome-btn-success" onclick="selectOutcome('interested')">
              <span class="outcome-icon">⭐</span>
              <span class="outcome-text">INTERESTED</span>
            </button>
            <button class="outcome-btn" onclick="selectOutcome('callback')">
              <span class="outcome-icon">📞</span>
              <span class="outcome-text">CALL BACK</span>
            </button>
          </div>
        </div>

        <!-- Quick Notes -->
        <div class="notes-section">
          <label class="form-label">Quick Notes (optional)</label>
          <textarea
            id="door-knock-notes"
            class="form-control notes-textarea"
            rows="3"
            placeholder="e.g., Owner arrives at 2pm, Ask for Mike, Back door entrance..."
          ></textarea>
        </div>

        <!-- Hidden outcome-specific fields (shown based on selection) -->
        <div id="outcome-details" class="outcome-details hidden"></div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeDoorKnockLogger()">Cancel</button>
        <button class="btn btn-primary btn-large" id="log-submit-btn" disabled>
          LOG & NEXT LOCATION →
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Track selected outcome
let selectedOutcome = null;

// Select an outcome
function selectOutcome(outcome) {
  selectedOutcome = outcome;

  // Update button states
  document.querySelectorAll('.outcome-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  event.target.closest('.outcome-btn').classList.add('selected');

  // Enable submit button
  document.getElementById('log-submit-btn').disabled = false;

  // Show outcome-specific fields
  showOutcomeDetails(outcome);

  // Setup submit handler
  const submitBtn = document.getElementById('log-submit-btn');
  submitBtn.onclick = () => submitDoorKnock(outcome);
}

// Show outcome-specific fields
function showOutcomeDetails(outcome) {
  const detailsContainer = document.getElementById('outcome-details');

  if (outcome === 'not_interested') {
    detailsContainer.innerHTML = `
      <div class="form-group">
        <label>Rejection Reason (optional)</label>
        <select id="rejection-reason" class="form-control">
          <option value="">Select reason...</option>
          <option value="already-has-provider">Already has provider</option>
          <option value="not-needed">Service not needed</option>
          <option value="too-expensive">Concerned about cost</option>
          <option value="handles-internally">Handles maintenance internally</option>
          <option value="not-interested">Just not interested</option>
          <option value="other">Other</option>
        </select>
      </div>
    `;
    detailsContainer.classList.remove('hidden');
  } else if (outcome === 'callback') {
    detailsContainer.innerHTML = `
      <div class="form-group">
        <label>When to return? *</label>
        <input
          type="datetime-local"
          id="callback-datetime"
          class="form-control"
          min="${getMinDateTime()}"
        >
      </div>
    `;
    detailsContainer.classList.remove('hidden');
  } else {
    detailsContainer.innerHTML = '';
    detailsContainer.classList.add('hidden');
  }
}

// Get minimum datetime (tomorrow at 8am)
function getMinDateTime() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);
  return tomorrow.toISOString().slice(0, 16);
}

// Submit door knock log
async function submitDoorKnock(outcome) {
  const submitBtn = document.getElementById('log-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging...';

  try {
    const notes = document.getElementById('door-knock-notes')?.value || '';
    let outcomeData = {
      locationId: currentLocation.id,
      locationName: currentLocation.name,
      locationAddress: currentLocation.address,
      attemptDate: new Date().toISOString(),
      outcome: outcome,
      notes: notes,
      gps: userGPS || currentLocation.gps || null,
      loggedBy: currentUser?.email || 'unknown'
    };

    // Add outcome-specific data
    if (outcome === 'not_interested') {
      outcomeData.rejectionReason = document.getElementById('rejection-reason')?.value || null;
    } else if (outcome === 'callback') {
      const callbackDatetime = document.getElementById('callback-datetime')?.value;
      if (!callbackDatetime) {
        alert('Please select when to return for callback');
        submitBtn.disabled = false;
        submitBtn.textContent = 'LOG & NEXT LOCATION →';
        return;
      }
      outcomeData.nextAttemptDate = callbackDatetime;
    }

    // Save to Firestore
    await db.collection('contactAttempts').add(outcomeData);

    // If location was manually entered or GPS-only, save it to locations collection
    if (currentLocation.isManualEntry || currentLocation.isGPSOnly) {
      const locationData = {
        name: currentLocation.name,
        address: currentLocation.address,
        phone: currentLocation.phone || null,
        gps: currentLocation.gps || null,
        status: outcome === 'interested' ? 'interested' : outcome === 'not_interested' ? 'rejected' : 'pending',
        firstContact: new Date().toISOString(),
        source: currentLocation.isManualEntry ? 'manual-door-knock' : 'gps-door-knock'
      };

      const locationRef = await db.collection('locations').add(locationData);
      currentLocation.id = locationRef.id;
    } else {
      // Update existing location status
      await db.collection('locations').doc(currentLocation.id).update({
        status: outcome === 'interested' ? 'interested' : outcome === 'not_interested' ? 'rejected' : 'pending',
        lastContact: new Date().toISOString()
      });
    }

    // Handle outcome-specific actions
    if (outcome === 'interested') {
      // Close door knock modal
      closeDoorKnockLogger();

      // Launch lead conversion flow
      if (typeof initializeLeadConversion === 'function') {
        initializeLeadConversion(currentLocation.id, currentLocation);
      } else {
        alert('Lead conversion flow not available. Contact has been logged as interested.');
      }
    } else if (outcome === 'callback') {
      // Show callback scheduled confirmation
      showSuccessMessage(`Callback scheduled for ${new Date(outcomeData.nextAttemptDate).toLocaleString()}`);
      closeDoorKnockLogger();
    } else if (outcome === 'not_interested') {
      // Show rejection logged confirmation
      showSuccessMessage('Contact marked as not interested');
      closeDoorKnockLogger();
    } else if (outcome === 'no_answer') {
      // Show no answer logged, suggest retry
      showSuccessMessage('No answer logged. Suggested retry: 3 days');
      closeDoorKnockLogger();
    }

    // Refresh dashboard if available
    if (typeof loadKPIs === 'function') {
      loadKPIs();
    }

  } catch (error) {
    console.error('Error logging door knock:', error);
    alert('Error logging contact: ' + error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = 'LOG & NEXT LOCATION →';
  }
}

// Show success message
function showSuccessMessage(message) {
  const toast = document.createElement('div');
  toast.className = 'success-toast';
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">✓</span>
      <span class="toast-message">${message}</span>
    </div>
  `;

  document.body.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Close all door knock modals
function closeDoorKnockLogger() {
  const modals = [
    'door-knock-modal',
    'location-selector-modal',
    'manual-location-modal'
  ];

  modals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
  });

  currentLocation = null;
  selectedOutcome = null;
}

// Make functions globally available
window.showDoorKnockLogger = showDoorKnockLogger;
window.closeDoorKnockLogger = closeDoorKnockLogger;
window.selectLocation = selectLocation;
window.useCurrentGPSLocation = useCurrentGPSLocation;
window.manualLocationEntry = manualLocationEntry;
window.submitManualLocation = submitManualLocation;
window.selectOutcome = selectOutcome;
window.submitDoorKnock = submitDoorKnock;
