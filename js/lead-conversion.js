// Lead Conversion Flow
// Converts "interested" door-knock prospects into qualified leads

let currentLead = null;
let equipmentList = [];

// Equipment types for commercial kitchens
const EQUIPMENT_TYPES = {
  'walk-in-cooler': 'Walk-In Cooler',
  'walk-in-freezer': 'Walk-In Freezer',
  'reach-in-cooler': 'Reach-In Cooler',
  'reach-in-freezer': 'Reach-In Freezer',
  'ice-machine': 'Ice Machine',
  'prep-table': 'Prep Table Refrigerator',
  'display-case': 'Display Case',
  'beverage-cooler': 'Beverage Cooler',
  'other': 'Other Equipment'
};

const EQUIPMENT_BRANDS = [
  'True', 'Turbo Air', 'Beverage-Air', 'Hoshizaki', 'Manitowoc',
  'Scotsman', 'Delfield', 'Victory', 'Traulsen', 'Master-Bilt',
  'Nor-Lake', 'Hussmann', 'Hill Phoenix', 'Other', 'Unknown'
];

const PAIN_POINTS = [
  'Frequent breakdowns',
  'High energy bills',
  'Temperature fluctuations',
  'Current provider unresponsive',
  'No preventive maintenance',
  'Recent major repair needed',
  'Equipment older than 10 years',
  'Food safety concerns',
  'Noise issues',
  'Other'
];

// Initialize Lead Conversion - Called when location status is "interested"
function initializeLeadConversion(locationId, locationData) {
  currentLead = {
    id: locationId,
    ...locationData,
    equipmentSurvey: [],
    painPoints: [],
    preferredContact: 'phone',
    assessmentDate: null,
    notes: ''
  };

  equipmentList = [];

  // Show lead conversion modal
  showLeadConversionModal();
}

// Show Lead Conversion Modal
function showLeadConversionModal() {
  const modal = document.createElement('div');
  modal.id = 'lead-conversion-modal';
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal-content lead-conversion-content">
      <div class="modal-header">
        <h2>🎯 Convert Lead: ${currentLead.name}</h2>
        <button class="close-btn" onclick="closeLeadConversion()">×</button>
      </div>

      <div class="lead-conversion-body">
        <!-- Progress Steps -->
        <div class="conversion-steps">
          <div class="step active" data-step="1">
            <div class="step-number">1</div>
            <div class="step-label">Equipment Survey</div>
          </div>
          <div class="step" data-step="2">
            <div class="step-number">2</div>
            <div class="step-label">Pain Points</div>
          </div>
          <div class="step" data-step="3">
            <div class="step-number">3</div>
            <div class="step-label">Schedule Assessment</div>
          </div>
        </div>

        <!-- Step 1: Equipment Survey -->
        <div class="conversion-step-content" data-step="1">
          <h3>Equipment Survey</h3>
          <p class="step-description">Document all refrigeration equipment that needs service or maintenance</p>

          <div class="equipment-list-container">
            <div id="equipment-items-list"></div>
            <button class="btn btn-secondary" onclick="addEquipmentItem()">
              <span class="btn-icon">+</span> Add Equipment
            </button>
          </div>
        </div>

        <!-- Step 2: Pain Points -->
        <div class="conversion-step-content hidden" data-step="2">
          <h3>What are their main concerns?</h3>
          <p class="step-description">Select all pain points that apply</p>

          <div class="pain-points-grid" id="pain-points-grid">
            ${PAIN_POINTS.map(point => `
              <label class="pain-point-item">
                <input type="checkbox" value="${point}" onchange="updatePainPoints()">
                <span>${point}</span>
              </label>
            `).join('')}
          </div>

          <div class="form-group">
            <label>Additional Notes</label>
            <textarea
              id="pain-notes"
              rows="3"
              placeholder="Any other concerns or specific issues mentioned..."
              class="form-control"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Current Service Provider (if any)</label>
            <input
              type="text"
              id="current-provider"
              placeholder="Provider name or 'self-serviced' or 'none'"
              class="form-control"
            >
          </div>
        </div>

        <!-- Step 3: Schedule Assessment -->
        <div class="conversion-step-content hidden" data-step="3">
          <h3>Schedule Initial Assessment</h3>
          <p class="step-description">When can you visit to perform a detailed equipment inspection?</p>

          <div class="form-group">
            <label>Preferred Assessment Date/Time</label>
            <input
              type="datetime-local"
              id="assessment-datetime"
              class="form-control"
              min="${getMinDateTime()}"
            >
          </div>

          <div class="form-group">
            <label>Best Contact Method</label>
            <select id="contact-method" class="form-control">
              <option value="phone">Phone Call</option>
              <option value="text">Text Message</option>
              <option value="email">Email</option>
            </select>
          </div>

          <div class="form-group">
            <label>Contact Information</label>
            <input
              type="text"
              id="contact-info"
              placeholder="Phone number or email"
              class="form-control"
              value="${currentLead.phone || ''}"
            >
          </div>

          <div class="form-group">
            <label>Special Instructions / Access Notes</label>
            <textarea
              id="access-notes"
              rows="2"
              placeholder="Gate code, parking instructions, best entrance, key contact person..."
              class="form-control"
            ></textarea>
          </div>

          <div class="lead-summary">
            <h4>Lead Summary</h4>
            <div id="lead-summary-content"></div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="previousConversionStep()">
          ← Previous
        </button>
        <button class="btn btn-primary" id="conversion-next-btn" onclick="nextConversionStep()">
          Next →
        </button>
        <button class="btn btn-success hidden" id="conversion-submit-btn" onclick="submitLeadConversion()">
          ✓ Convert to Lead
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Initialize with any existing equipment data
  renderEquipmentList();
}

// Add Equipment Item
function addEquipmentItem() {
  const equipmentItem = {
    id: Date.now(),
    type: '',
    brand: '',
    model: '',
    age: '',
    condition: 'unknown'
  };

  const itemHtml = `
    <div class="equipment-item" data-id="${equipmentItem.id}">
      <div class="equipment-item-header">
        <h4>Equipment #${equipmentList.length + 1}</h4>
        <button class="btn-icon-only" onclick="removeEquipmentItem(${equipmentItem.id})">×</button>
      </div>

      <div class="equipment-item-fields">
        <div class="form-group">
          <label>Equipment Type *</label>
          <select class="form-control" onchange="updateEquipmentItem(${equipmentItem.id}, 'type', this.value)">
            <option value="">Select type...</option>
            ${Object.entries(EQUIPMENT_TYPES).map(([key, label]) =>
              `<option value="${key}">${label}</option>`
            ).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>Brand</label>
          <select class="form-control" onchange="updateEquipmentItem(${equipmentItem.id}, 'brand', this.value)">
            <option value="">Select brand...</option>
            ${EQUIPMENT_BRANDS.map(brand =>
              `<option value="${brand}">${brand}</option>`
            ).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>Model Number</label>
          <input
            type="text"
            class="form-control"
            placeholder="Model #"
            onchange="updateEquipmentItem(${equipmentItem.id}, 'model', this.value)"
          >
        </div>

        <div class="form-group">
          <label>Age (years)</label>
          <input
            type="number"
            class="form-control"
            placeholder="0-30"
            min="0"
            max="50"
            onchange="updateEquipmentItem(${equipmentItem.id}, 'age', this.value)"
          >
        </div>

        <div class="form-group">
          <label>Condition</label>
          <select class="form-control" onchange="updateEquipmentItem(${equipmentItem.id}, 'condition', this.value)">
            <option value="unknown">Unknown</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
            <option value="critical">Critical - Needs Immediate Service</option>
          </select>
        </div>
      </div>
    </div>
  `;

  equipmentList.push(equipmentItem);
  renderEquipmentList();
}

// Update Equipment Item
function updateEquipmentItem(id, field, value) {
  const item = equipmentList.find(e => e.id === id);
  if (item) {
    item[field] = value;
  }
}

// Remove Equipment Item
function removeEquipmentItem(id) {
  equipmentList = equipmentList.filter(e => e.id !== id);
  renderEquipmentList();
}

// Render Equipment List
function renderEquipmentList() {
  const container = document.getElementById('equipment-items-list');
  if (!container) return;

  container.innerHTML = equipmentList.map((item, index) => `
    <div class="equipment-item" data-id="${item.id}">
      <div class="equipment-item-header">
        <h4>Equipment #${index + 1}</h4>
        <button class="btn-icon-only" onclick="removeEquipmentItem(${item.id})">×</button>
      </div>

      <div class="equipment-item-fields">
        <div class="form-group">
          <label>Equipment Type *</label>
          <select class="form-control" onchange="updateEquipmentItem(${item.id}, 'type', this.value)" value="${item.type}">
            <option value="">Select type...</option>
            ${Object.entries(EQUIPMENT_TYPES).map(([key, label]) =>
              `<option value="${key}" ${item.type === key ? 'selected' : ''}>${label}</option>`
            ).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>Brand</label>
          <select class="form-control" onchange="updateEquipmentItem(${item.id}, 'brand', this.value)">
            <option value="">Select brand...</option>
            ${EQUIPMENT_BRANDS.map(brand =>
              `<option value="${brand}" ${item.brand === brand ? 'selected' : ''}>${brand}</option>`
            ).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>Model Number</label>
          <input
            type="text"
            class="form-control"
            placeholder="Model #"
            value="${item.model || ''}"
            onchange="updateEquipmentItem(${item.id}, 'model', this.value)"
          >
        </div>

        <div class="form-group">
          <label>Age (years)</label>
          <input
            type="number"
            class="form-control"
            placeholder="0-30"
            min="0"
            max="50"
            value="${item.age || ''}"
            onchange="updateEquipmentItem(${item.id}, 'age', this.value)"
          >
        </div>

        <div class="form-group">
          <label>Condition</label>
          <select class="form-control" onchange="updateEquipmentItem(${item.id}, 'condition', this.value)">
            <option value="unknown" ${item.condition === 'unknown' ? 'selected' : ''}>Unknown</option>
            <option value="excellent" ${item.condition === 'excellent' ? 'selected' : ''}>Excellent</option>
            <option value="good" ${item.condition === 'good' ? 'selected' : ''}>Good</option>
            <option value="fair" ${item.condition === 'fair' ? 'selected' : ''}>Fair</option>
            <option value="poor" ${item.condition === 'poor' ? 'selected' : ''}>Poor</option>
            <option value="critical" ${item.condition === 'critical' ? 'selected' : ''}>Critical - Needs Immediate Service</option>
          </select>
        </div>
      </div>
    </div>
  `).join('');
}

// Update Pain Points
function updatePainPoints() {
  const checkboxes = document.querySelectorAll('#pain-points-grid input[type="checkbox"]');
  currentLead.painPoints = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);
}

// Get minimum datetime for assessment scheduling (tomorrow)
function getMinDateTime() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0); // Default to 8 AM tomorrow
  return tomorrow.toISOString().slice(0, 16);
}

// Navigation between steps
let currentStep = 1;

function nextConversionStep() {
  // Validate current step
  if (currentStep === 1) {
    if (equipmentList.length === 0) {
      alert('Please add at least one piece of equipment');
      return;
    }
    // Check if all equipment items have a type
    const invalidItems = equipmentList.filter(item => !item.type);
    if (invalidItems.length > 0) {
      alert('Please select a type for all equipment items');
      return;
    }
  }

  if (currentStep === 2) {
    if (currentLead.painPoints.length === 0) {
      if (!confirm('No pain points selected. Continue anyway?')) {
        return;
      }
    }
    // Save additional notes
    currentLead.notes = document.getElementById('pain-notes')?.value || '';
    currentLead.currentProvider = document.getElementById('current-provider')?.value || 'none';
  }

  // Move to next step
  if (currentStep < 3) {
    currentStep++;
    updateStepDisplay();
  }
}

function previousConversionStep() {
  if (currentStep > 1) {
    currentStep--;
    updateStepDisplay();
  }
}

function updateStepDisplay() {
  // Update step indicators
  document.querySelectorAll('.conversion-steps .step').forEach(step => {
    const stepNum = parseInt(step.dataset.step);
    if (stepNum === currentStep) {
      step.classList.add('active');
    } else if (stepNum < currentStep) {
      step.classList.add('completed');
      step.classList.remove('active');
    } else {
      step.classList.remove('active', 'completed');
    }
  });

  // Show/hide step content
  document.querySelectorAll('.conversion-step-content').forEach(content => {
    const stepNum = parseInt(content.dataset.step);
    if (stepNum === currentStep) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });

  // Update buttons
  const nextBtn = document.getElementById('conversion-next-btn');
  const submitBtn = document.getElementById('conversion-submit-btn');

  if (currentStep === 3) {
    nextBtn.classList.add('hidden');
    submitBtn.classList.remove('hidden');
    generateLeadSummary();
  } else {
    nextBtn.classList.remove('hidden');
    submitBtn.classList.add('hidden');
  }
}

// Generate Lead Summary
function generateLeadSummary() {
  const summaryContainer = document.getElementById('lead-summary-content');
  if (!summaryContainer) return;

  const equipmentCount = equipmentList.length;
  const criticalEquipment = equipmentList.filter(e => e.condition === 'critical').length;
  const poorEquipment = equipmentList.filter(e => e.condition === 'poor').length;

  summaryContainer.innerHTML = `
    <div class="summary-item">
      <strong>Equipment Surveyed:</strong> ${equipmentCount} items
      ${criticalEquipment > 0 ? `<span class="badge badge-danger">${criticalEquipment} Critical</span>` : ''}
      ${poorEquipment > 0 ? `<span class="badge badge-warning">${poorEquipment} Poor Condition</span>` : ''}
    </div>
    <div class="summary-item">
      <strong>Pain Points:</strong> ${currentLead.painPoints.length > 0 ? currentLead.painPoints.join(', ') : 'None specified'}
    </div>
    ${currentLead.currentProvider ? `
      <div class="summary-item">
        <strong>Current Provider:</strong> ${currentLead.currentProvider}
      </div>
    ` : ''}
    <div class="summary-item">
      <strong>Priority Level:</strong>
      <span class="badge badge-${getPriorityBadgeClass(criticalEquipment, poorEquipment)}">
        ${calculateLeadPriority(criticalEquipment, poorEquipment)}
      </span>
    </div>
  `;
}

// Calculate lead priority based on equipment condition
function calculateLeadPriority(critical, poor) {
  if (critical > 0) return 'CRITICAL';
  if (poor > 1) return 'HIGH';
  if (poor > 0) return 'MEDIUM';
  return 'LOW';
}

function getPriorityBadgeClass(critical, poor) {
  if (critical > 0) return 'danger';
  if (poor > 1) return 'warning';
  if (poor > 0) return 'info';
  return 'secondary';
}

// Submit Lead Conversion
async function submitLeadConversion() {
  const submitBtn = document.getElementById('conversion-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Converting Lead...';

  try {
    // Gather all data
    const assessmentDatetime = document.getElementById('assessment-datetime')?.value;
    const contactMethod = document.getElementById('contact-method')?.value;
    const contactInfo = document.getElementById('contact-info')?.value;
    const accessNotes = document.getElementById('access-notes')?.value;

    if (!assessmentDatetime) {
      alert('Please schedule an assessment date and time');
      submitBtn.disabled = false;
      submitBtn.textContent = '✓ Convert to Lead';
      return;
    }

    if (!contactInfo) {
      alert('Please provide contact information');
      submitBtn.disabled = false;
      submitBtn.textContent = '✓ Convert to Lead';
      return;
    }

    // Calculate priority
    const criticalEquipment = equipmentList.filter(e => e.condition === 'critical').length;
    const poorEquipment = equipmentList.filter(e => e.condition === 'poor').length;
    const priority = calculateLeadPriority(criticalEquipment, poorEquipment);

    // Prepare lead data
    const leadData = {
      locationId: currentLead.id,
      equipmentSurvey: equipmentList,
      painPoints: currentLead.painPoints,
      notes: currentLead.notes,
      currentProvider: currentLead.currentProvider,
      assessmentDateTime: assessmentDatetime,
      contactMethod: contactMethod,
      contactInfo: contactInfo,
      accessNotes: accessNotes,
      priority: priority.toLowerCase(),
      status: 'assessment-scheduled',
      convertedAt: new Date().toISOString()
    };

    // Call Cloud Function to convert lead
    const result = await functions.httpsCallable('convertLeadToCustomer')(leadData);

    if (result.data.success) {
      // Show success message
      showLeadConversionSuccess(result.data);

      // Close modal
      closeLeadConversion();

      // Reload dashboard data
      if (typeof loadLocations === 'function') {
        loadLocations();
      }
      if (typeof loadKPIs === 'function') {
        loadKPIs();
      }
    } else {
      throw new Error(result.data.message || 'Failed to convert lead');
    }

  } catch (error) {
    console.error('Error converting lead:', error);
    alert('Error converting lead: ' + error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = '✓ Convert to Lead';
  }
}

// Show Lead Conversion Success
function showLeadConversionSuccess(data) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal-content success-modal">
      <div class="modal-header success-header">
        <h2>✅ Lead Converted Successfully!</h2>
      </div>

      <div class="modal-body">
        <div class="success-message">
          <p><strong>${currentLead.name}</strong> has been converted to a qualified lead.</p>

          <div class="next-steps">
            <h3>Next Steps Created:</h3>
            <ul>
              ${data.followUpTasks ? data.followUpTasks.map(task => `<li>${task}</li>`).join('') : ''}
            </ul>
          </div>

          ${data.assessmentReminder ? `
            <div class="reminder-info">
              <strong>📅 Assessment Scheduled:</strong><br>
              ${new Date(data.assessmentReminder.scheduledFor).toLocaleString()}
            </div>
          ` : ''}
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">
          Got It!
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Auto-close after 5 seconds
  setTimeout(() => {
    if (modal.parentElement) {
      modal.remove();
    }
  }, 5000);
}

// Close Lead Conversion Modal
function closeLeadConversion() {
  const modal = document.getElementById('lead-conversion-modal');
  if (modal) {
    modal.remove();
  }
  currentLead = null;
  equipmentList = [];
  currentStep = 1;
}

// Make functions globally available
window.initializeLeadConversion = initializeLeadConversion;
window.closeLeadConversion = closeLeadConversion;
window.addEquipmentItem = addEquipmentItem;
window.updateEquipmentItem = updateEquipmentItem;
window.removeEquipmentItem = removeEquipmentItem;
window.updatePainPoints = updatePainPoints;
window.nextConversionStep = nextConversionStep;
window.previousConversionStep = previousConversionStep;
window.submitLeadConversion = submitLeadConversion;
