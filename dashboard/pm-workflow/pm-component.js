/**
 * PM Component for Rapid Pro Maintenance
 * UI component for preventative maintenance workflow
 */

class PMComponent {
  /**
   * Create a PM component
   * @param {PMWorkflow} workflow - PM workflow instance
   * @param {Object} options - Component options
   */
  constructor(workflow, options = {}) {
    this.workflow = workflow;
    this.container = null;
    this.options = {
      containerSelector: '#pm-workflow-container',
      onSessionStart: null,
      onSessionComplete: null,
      onSessionCancel: null,
      onStepChange: null,
      ...options
    };
    
    // Bind event handlers
    this.handleSessionLoaded = this.handleSessionLoaded.bind(this);
    this.handleSessionStarted = this.handleSessionStarted.bind(this);
    this.handleStepChanged = this.handleStepChanged.bind(this);
    this.handleStepSaved = this.handleStepSaved.bind(this);
    this.handleSessionCompleted = this.handleSessionCompleted.bind(this);
    this.handleSessionCancelled = this.handleSessionCancelled.bind(this);
    this.handlePhotoAdded = this.handlePhotoAdded.bind(this);
    
    // Step component registry
    this.stepComponents = {};
  }
  
  /**
   * Initialize the component
   * @param {string} containerSelector - Container selector
   * @returns {boolean} Whether initialization was successful
   */
  initialize(containerSelector = null) {
    // Set container selector if provided
    if (containerSelector) {
      this.options.containerSelector = containerSelector;
    }
    
    // Get container element
    this.container = document.querySelector(this.options.containerSelector);
    if (!this.container) {
      console.error(`Container not found: ${this.options.containerSelector}`);
      return false;
    }
    
    // Register workflow event listeners
    this.workflow.addListener('sessionLoaded', this.handleSessionLoaded);
    this.workflow.addListener('sessionStarted', this.handleSessionStarted);
    this.workflow.addListener('stepChanged', this.handleStepChanged);
    this.workflow.addListener('stepSaved', this.handleStepSaved);
    this.workflow.addListener('sessionCompleted', this.handleSessionCompleted);
    this.workflow.addListener('sessionCancelled', this.handleSessionCancelled);
    this.workflow.addListener('photoAdded', this.handlePhotoAdded);
    
    // Register step components
    this.registerStepComponents();
    
    // Initialize UI
    this.renderInitialUI();
    
    console.log('PM Component initialized');
    return true;
  }
  
  /**
   * Register step components
   */
  registerStepComponents() {
    // Register normal mode step components
    this.stepComponents.client_identification = this.renderClientIdentificationStep.bind(this);
    this.stepComponents.equipment_identification = this.renderEquipmentIdentificationStep.bind(this);
    this.stepComponents.cooler_inspection = this.renderCoolerInspectionStep.bind(this);
    this.stepComponents.freezer_inspection = this.renderFreezerInspectionStep.bind(this);
    this.stepComponents.temperature_verification = this.renderTemperatureVerificationStep.bind(this);
    this.stepComponents.coil_cleaning = this.renderCoilCleaningStep.bind(this);
    this.stepComponents.minor_repairs = this.renderMinorRepairsStep.bind(this);
    this.stepComponents.gasket_inspection = this.renderGasketInspectionStep.bind(this);
    this.stepComponents.sink_plumbing = this.renderSinkPlumbingStep.bind(this);
    this.stepComponents.final_report = this.renderFinalReportStep.bind(this);
    
    // Register bridge building step components
    this.stepComponents.business_identification = this.renderBusinessIdentificationStep.bind(this);
    this.stepComponents.introduction_notes = this.renderIntroductionNotesStep.bind(this);
    this.stepComponents.equipment_overview = this.renderEquipmentOverviewStep.bind(this);
    this.stepComponents.pain_points = this.renderPainPointsStep.bind(this);
    this.stepComponents.follow_up_planning = this.renderFollowUpPlanningStep.bind(this);
  }
  
  /**
   * Render initial UI
   */
  renderInitialUI() {
    // Clear container
    this.container.innerHTML = '';
    
    // If there's an active session, render the current step
    if (this.workflow.currentSession) {
      this.renderWorkflowUI();
    } else {
      this.renderStartSessionUI();
    }
  }
  
  /**
   * Render start session UI
   */
  renderStartSessionUI() {
    const html = `
      <div class="pm-start-session">
        <h2>${this.workflow.isBridgeMode ? 'Start Bridge Building Visit' : 'Start PM Session'}</h2>
        <p>Select a customer to begin a new ${this.workflow.isBridgeMode ? 'bridge building visit' : 'preventative maintenance session'}.</p>
        
        <div class="form-group">
          <label for="customer-select">Select Customer:</label>
          <select id="customer-select" class="form-control" required>
            <option value="">-- Select a customer --</option>
            <!-- Customer options will be loaded dynamically -->
          </select>
        </div>
        
        ${!this.workflow.isBridgeMode ? `
          <div class="form-group">
            <label for="service-type">Service Type:</label>
            <select id="service-type" class="form-control">
              <option value="pm_service">Regular PM Service</option>
              <option value="emergency_service">Emergency Service</option>
              <option value="follow_up">Follow-up Visit</option>
            </select>
          </div>
        ` : ''}
        
        <div class="pm-action-buttons">
          <button id="start-session-btn" class="btn-primary">
            ${this.workflow.isBridgeMode ? 'Start Bridge Building Visit' : 'Start PM Session'}
          </button>
        </div>
      </div>
    `;
    
    this.container.innerHTML = html;
    
    // Load customers
    this.loadCustomers();
    
    // Add event listeners
    const startButton = document.getElementById('start-session-btn');
    if (startButton) {
      startButton.addEventListener('click', this.handleStartSession.bind(this));
    }
  }
  
  /**
   * Load customers
   */
  async loadCustomers() {
    try {
      // Query customers from database
      const customers = await this.workflow.db.query(`
        SELECT * FROM customers
        ORDER BY name
      `);
      
      const customerSelect = document.getElementById('customer-select');
      if (!customerSelect) return;
      
      // Add customer options
      customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.business_name 
          ? `${customer.business_name} (${customer.name})` 
          : customer.name;
        customerSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  }
  
  /**
   * Handle start session button click
   */
  async handleStartSession() {
    const customerSelect = document.getElementById('customer-select');
    if (!customerSelect || !customerSelect.value) {
      alert('Please select a customer');
      return;
    }
    
    const customerId = parseInt(customerSelect.value);
    let serviceType = 'pm_service';
    
    // Get service type if not in bridge mode
    if (!this.workflow.isBridgeMode) {
      const serviceTypeSelect = document.getElementById('service-type');
      if (serviceTypeSelect) {
        serviceType = serviceTypeSelect.value;
      }
    }
    
    // Start session
    const session = await this.workflow.startSession(customerId, serviceType);
    if (session) {
      // If onSessionStart callback provided, call it
      if (this.options.onSessionStart) {
        this.options.onSessionStart(session);
      }
      
      // Render the workflow UI
      this.renderWorkflowUI();
    } else {
      alert('Failed to start session. Please try again.');
    }
  }
  
  /**
   * Render workflow UI
   */
  renderWorkflowUI() {
    if (!this.workflow.currentSession || !this.workflow.currentStep) {
      this.renderStartSessionUI();
      return;
    }
    
    // Get current session and step
    const session = this.workflow.currentSession;
    const currentStep = this.workflow.currentStep;
    const stepTitle = this.workflow.getStepTitle(currentStep);
    
    // Get steps with status
    const steps = this.workflow.getStepsWithStatus();
    
    // Create workflow UI
    const html = `
      <div class="pm-workflow">
        <div class="pm-workflow-header">
          <h2>${this.workflow.isBridgeMode ? 'Bridge Building Visit' : 'PM Session'}: ${session.customer_name}</h2>
          <div class="pm-workflow-status">
            <span class="status-label">Status:</span>
            <span class="status-value">In Progress</span>
          </div>
        </div>
        
        <div class="pm-workflow-steps">
          <div class="steps-indicator">
            ${steps.map(step => `
              <div class="step-indicator ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}" 
                   data-step="${step.id}">
                <div class="step-number">${steps.indexOf(step) + 1}</div>
                <div class="step-title">${this.workflow.getStepTitle(step.id)}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="pm-workflow-content">
          <div class="pm-step-header">
            <h3>${stepTitle}</h3>
          </div>
          
          <div class="pm-step-content" id="step-content">
            <!-- Step content will be rendered here -->
          </div>
          
          <div class="pm-workflow-actions">
            <button id="prev-step-btn" class="btn-outline" ${steps.indexOf({ id: currentStep, current: true }) <= 0 ? 'disabled' : ''}>
              Previous
            </button>
            <button id="save-step-btn" class="btn-primary">
              Save & Continue
            </button>
            <button id="cancel-session-btn" class="btn-danger">
              Cancel Session
            </button>
          </div>
        </div>
      </div>
    `;
    
    this.container.innerHTML = html;
    
    // Render current step content
    this.renderStepContent(currentStep);
    
    // Add event listeners
    const prevButton = document.getElementById('prev-step-btn');
    const saveButton = document.getElementById('save-step-btn');
    const cancelButton = document.getElementById('cancel-session-btn');
    
    if (prevButton) {
      prevButton.addEventListener('click', this.handlePrevStep.bind(this));
    }
    
    if (saveButton) {
      saveButton.addEventListener('click', this.handleSaveStep.bind(this));
    }
    
    if (cancelButton) {
      cancelButton.addEventListener('click', this.handleCancelSession.bind(this));
    }
    
    // Add click listeners to step indicators
    const stepIndicators = document.querySelectorAll('.step-indicator');
    stepIndicators.forEach(indicator => {
      indicator.addEventListener('click', () => {
        const stepId = indicator.dataset.step;
        const step = steps.find(s => s.id === stepId);
        
        // Only allow navigating to completed steps
        if (step && step.completed) {
          this.navigateToStep(stepId);
        }
      });
    });
  }
  
  /**
   * Navigate to a specific step
   * @param {string} stepId - Step ID
   */
  async navigateToStep(stepId) {
    if (!this.workflow.currentSession) return;
    
    // Update current step
    this.workflow.currentStep = stepId;
    
    // Update session data
    const sessionData = JSON.parse(this.workflow.currentSession.data || '{}');
    sessionData.currentStep = stepId;
    
    // Update session in database
    const isOffline = !(await this.workflow.db.isOnline());
    await this.workflow.db.updateRecord('jobs', this.workflow.currentSession.id, {
      data: JSON.stringify(sessionData)
    }, isOffline);
    
    // Refresh UI
    this.renderWorkflowUI();
  }
  
  /**
   * Render step content
   * @param {string} stepId - Step ID
   */
  renderStepContent(stepId) {
    const stepContent = document.getElementById('step-content');
    if (!stepContent) return;
    
    // Get step render function
    const renderFunction = this.stepComponents[stepId];
    if (renderFunction) {
      // Get existing step data
      const stepData = this.workflow.getStepData(stepId);
      
      // Render step content
      renderFunction(stepContent, stepData);
    } else {
      stepContent.innerHTML = `<p>No renderer found for step: ${stepId}</p>`;
    }
  }
  
  /**
   * Handle previous step button click
   */
  async handlePrevStep() {
    const prevStepId = await this.workflow.prevStep();
    if (prevStepId) {
      // If onStepChange callback provided, call it
      if (this.options.onStepChange) {
        this.options.onStepChange(prevStepId, 'prev');
      }
      
      // Refresh UI
      this.renderWorkflowUI();
    }
  }
  
  /**
   * Handle save step button click
   */
  async handleSaveStep() {
    const currentStep = this.workflow.currentStep;
    
    // Collect step data from form
    const stepData = this.collectStepData(currentStep);
    if (!stepData) {
      return;
    }
    
    // Save step data
    const saved = await this.workflow.saveStepData(currentStep, stepData);
    if (!saved) {
      alert('Failed to save step data. Please try again.');
      return;
    }
    
    // Check if this is the final step
    const steps = this.workflow.getAllSteps();
    const isLastStep = steps.indexOf(currentStep) === steps.length - 1;
    
    if (isLastStep) {
      // If this is the final step, complete the session
      if (this.workflow.isBridgeMode) {
        // For bridge building mode, collect relationship data
        const relationshipData = {
          status: document.getElementById('relationship-status')?.value || 'follow_up',
          interestLevel: parseInt(document.getElementById('interest-level')?.value || '3'),
          nextAction: document.getElementById('next-action')?.value || '',
          nextActionDate: document.getElementById('next-action-date')?.value || '',
          notes: document.getElementById('follow-up-notes')?.value || '',
          outcome: document.getElementById('visit-outcome')?.value || ''
        };
        
        // Complete session with relationship data
        const completed = await this.workflow.completeSession({
          relationshipData
        });
        
        if (completed) {
          // If onSessionComplete callback provided, call it
          if (this.options.onSessionComplete) {
            this.options.onSessionComplete();
          }
          
          // Show completion message
          alert('Bridge building visit completed successfully!');
          
          // Render start session UI
          this.renderStartSessionUI();
        } else {
          alert('Failed to complete visit. Please try again.');
        }
      } else {
        // For normal PM mode, complete the session
        const completed = await this.workflow.completeSession({
          notes: document.getElementById('completion-notes')?.value || '',
          followUpNeeded: document.getElementById('follow-up-needed')?.checked || false,
          followUpDate: document.getElementById('follow-up-date')?.value || '',
          customerSignature: document.getElementById('customer-signature')?.value || ''
        });
        
        if (completed) {
          // If onSessionComplete callback provided, call it
          if (this.options.onSessionComplete) {
            this.options.onSessionComplete();
          }
          
          // Show completion message
          alert('PM session completed successfully!');
          
          // Render start session UI
          this.renderStartSessionUI();
        } else {
          alert('Failed to complete session. Please try again.');
        }
      }
    } else {
      // If not the final step, go to next step
      const nextStepId = await this.workflow.nextStep();
      if (nextStepId) {
        // If onStepChange callback provided, call it
        if (this.options.onStepChange) {
          this.options.onStepChange(nextStepId, 'next');
        }
        
        // Refresh UI
        this.renderWorkflowUI();
      }
    }
  }
  
  /**
   * Handle cancel session button click
   */
  async handleCancelSession() {
    if (!confirm('Are you sure you want to cancel this session? All progress will be lost.')) {
      return;
    }
    
    // Get cancellation reason
    const reason = prompt('Please enter a reason for cancellation:') || '';
    
    // Cancel session
    const cancelled = await this.workflow.cancelSession(reason);
    if (cancelled) {
      // If onSessionCancel callback provided, call it
      if (this.options.onSessionCancel) {
        this.options.onSessionCancel(reason);
      }
      
      // Show cancellation message
      alert('Session cancelled successfully.');
      
      // Render start session UI
      this.renderStartSessionUI();
    } else {
      alert('Failed to cancel session. Please try again.');
    }
  }
  
  /**
   * Collect step data from form
   * @param {string} stepId - Step ID
   * @returns {Object} Step data
   */
  collectStepData(stepId) {
    // Different collection logic based on step
    switch (stepId) {
      case 'client_identification':
        return this.collectClientIdentificationData();
      case 'equipment_identification':
        return this.collectEquipmentIdentificationData();
      case 'cooler_inspection':
        return this.collectCoolerInspectionData();
      case 'freezer_inspection':
        return this.collectFreezerInspectionData();
      case 'temperature_verification':
        return this.collectTemperatureVerificationData();
      case 'coil_cleaning':
        return this.collectCoilCleaningData();
      case 'minor_repairs':
        return this.collectMinorRepairsData();
      case 'gasket_inspection':
        return this.collectGasketInspectionData();
      case 'sink_plumbing':
        return this.collectSinkPlumbingData();
      case 'final_report':
        return this.collectFinalReportData();
      case 'business_identification':
        return this.collectBusinessIdentificationData();
      case 'introduction_notes':
        return this.collectIntroductionNotesData();
      case 'equipment_overview':
        return this.collectEquipmentOverviewData();
      case 'pain_points':
        return this.collectPainPointsData();
      case 'follow_up_planning':
        return this.collectFollowUpPlanningData();
      default:
        console.error(`No data collector for step: ${stepId}`);
        return {};
    }
  }
  
  // ===== Event Handlers =====
  
  /**
   * Handle session loaded event
   * @param {Object} data - Event data
   */
  handleSessionLoaded(data) {
    console.log('Session loaded:', data);
    this.renderWorkflowUI();
  }
  
  /**
   * Handle session started event
   * @param {Object} data - Event data
   */
  handleSessionStarted(data) {
    console.log('Session started:', data);
    this.renderWorkflowUI();
  }
  
  /**
   * Handle step changed event
   * @param {Object} data - Event data
   */
  handleStepChanged(data) {
    console.log('Step changed:', data);
    this.renderWorkflowUI();
  }
  
  /**
   * Handle step saved event
   * @param {Object} data - Event data
   */
  handleStepSaved(data) {
    console.log('Step saved:', data);
  }
  
  /**
   * Handle session completed event
   * @param {Object} data - Event data
   */
  handleSessionCompleted(data) {
    console.log('Session completed:', data);
    this.renderStartSessionUI();
  }
  
  /**
   * Handle session cancelled event
   * @param {Object} data - Event data
   */
  handleSessionCancelled(data) {
    console.log('Session cancelled:', data);
    this.renderStartSessionUI();
  }
  
  /**
   * Handle photo added event
   * @param {Object} data - Event data
   */
  handlePhotoAdded(data) {
    console.log('Photo added:', data);
    
    // If the photo was added for the current step, refresh the UI
    if (data.photo.step === this.workflow.currentStep) {
      this.renderStepContent(this.workflow.currentStep);
    }
  }
  
  // ===== Step Renderers =====
  
  // Normal mode step renderers
  
  /**
   * Render client identification step
   * @param {HTMLElement} container - Step content container
   * @param {Object} data - Step data
   */
  renderClientIdentificationStep(container, data = {}) {
    container.innerHTML = `
      <div class="pm-step-form">
        <div class="form-group">
          <label for="contact-name">Contact Name:</label>
          <input type="text" id="contact-name" class="form-control" 
                 value="${data?.contactName || ''}" required>
        </div>
        
        <div class="form-group">
          <label for="contact-position">Position:</label>
          <input type="text" id="contact-position" class="form-control" 
                 value="${data?.contactPosition || ''}">
        </div>
        
        <div class="form-group">
          <label for="contact-phone">Phone Number:</label>
          <input type="tel" id="contact-phone" class="form-control" 
                 value="${data?.contactPhone || ''}">
        </div>
        
        <div class="form-group">
          <label for="contact-email">Email:</label>
          <input type="email" id="contact-email" class="form-control" 
                 value="${data?.contactEmail || ''}">
        </div>
        
        <div class="form-group">
          <label for="visit-notes">Visit Notes:</label>
          <textarea id="visit-notes" class="form-control" rows="4">${data?.visitNotes || ''}</textarea>
        </div>
        
        <div class="form-group">
          <button id="add-photo-btn" class="btn-outline">
            <i class="icon-camera"></i> Add Photo
          </button>
          
          <div class="photo-preview" id="photos-container">
            ${this.renderPhotos(this.workflow.getPhotos(), 'client_identification')}
          </div>
        </div>
      </div>
    `;
    
    // Add photo button event listener
    const addPhotoBtn = container.querySelector('#add-photo-btn');
    if (addPhotoBtn) {
      addPhotoBtn.addEventListener('click', () => {
        this.showPhotoCapture('client_identification', 'Client Contact');
      });
    }
  }
  
  /**
   * Collect client identification data
   * @returns {Object} Client identification data
   */
  collectClientIdentificationData() {
    return {
      contactName: document.getElementById('contact-name')?.value || '',
      contactPosition: document.getElementById('contact-position')?.value || '',
      contactPhone: document.getElementById('contact-phone')?.value || '',
      contactEmail: document.getElementById('contact-email')?.value || '',
      visitNotes: document.getElementById('visit-notes')?.value || '',
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Render equipment identification step
   * @param {HTMLElement} container - Step content container
   * @param {Object} data - Step data
   */
  renderEquipmentIdentificationStep(container, data = {}) {
    // Will implement this and other step renderers in the full code
    container.innerHTML = `<p>Equipment Identification Step</p>`;
  }
  
  // More step renderers would go here...
  
  /**
   * Render photos
   * @param {Array} photos - Photos
   * @param {string} stepId - Step ID
   * @returns {string} HTML
   */
  renderPhotos(photos, stepId) {
    if (!photos || photos.length === 0) {
      return '<p>No photos added yet.</p>';
    }
    
    // Filter photos for the current step
    const stepPhotos = photos.filter(photo => photo.step === stepId);
    
    if (stepPhotos.length === 0) {
      return '<p>No photos added for this step.</p>';
    }
    
    return `
      <div class="photos-grid">
        ${stepPhotos.map(photo => `
          <div class="photo-item">
            <img src="${photo.uri}" alt="${photo.description || 'Photo'}" class="photo-thumbnail">
            <div class="photo-description">${photo.description || 'No description'}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  /**
   * Show photo capture UI
   * @param {string} stepId - Step ID
   * @param {string} description - Default photo description
   */
  showPhotoCapture(stepId, description = '') {
    // In a real implementation, this would show a photo capture UI
    // For now, just simulate adding a photo
    const photoUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAADMElEQVR4nOzVwQnAIBQFQYXff81RUkQCOyDj1YOPnbXWPmeTRef+/3O/OyBjzh3CD95BfqICMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMO0TAAD//2Anhf4QtqobAAAAAElFTkSuQmCC';
    
    // Add photo to session
    this.workflow.addPhoto(photoUri, stepId, description);
  }
}

// Export the component
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PMComponent;
} else {
  window.PMComponent = PMComponent;
}