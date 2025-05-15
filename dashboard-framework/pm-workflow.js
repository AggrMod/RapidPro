/**
 * PM Workflow Module for Rapid Pro Maintenance
 * Handles the preventative maintenance workflow process with offline support
 */

class PMWorkflow {
  constructor(databaseService) {
    this.db = databaseService;
    this.currentSession = null;
    this.currentStep = null;
    this.steps = [
      'client_identification',
      'equipment_identification',
      'cooler_inspection',
      'freezer_inspection',
      'temperature_verification',
      'coil_cleaning',
      'minor_repairs',
      'gasket_inspection',
      'sink_plumbing',
      'final_report'
    ];
    
    // Bridge building specific steps
    this.bridgeSteps = [
      'business_identification', 
      'introduction_notes',
      'equipment_overview',
      'pain_points',
      'follow_up_planning'
    ];
    
    this.listeners = {};
    this.isBridgeMode = false;
  }
  
  /**
   * Initialize the workflow module
   * @param {boolean} bridgeBuildingMode - Whether in bridge building mode
   */
  async initialize(bridgeBuildingMode = false) {
    this.isBridgeMode = bridgeBuildingMode;
    
    // Check for any in-progress sessions
    await this.checkForInProgressSession();
    
    console.log(`PM Workflow initialized in ${bridgeBuildingMode ? 'bridge building' : 'normal'} mode`);
    return true;
  }
  
  /**
   * Check for any in-progress sessions
   */
  async checkForInProgressSession() {
    try {
      // Query for in-progress sessions
      const inProgressSessions = await this.db.query(`
        SELECT j.*, c.name as customer_name, c.business_name as customer_business
        FROM jobs j
        JOIN customers c ON j.customer_id = c.id
        WHERE j.status = 'in_progress'
        ORDER BY j.updated_at DESC
        LIMIT 1
      `);
      
      if (inProgressSessions && inProgressSessions.length > 0) {
        this.currentSession = inProgressSessions[0];
        
        // Get current step from session data
        const sessionData = JSON.parse(this.currentSession.data || '{}');
        this.currentStep = sessionData.currentStep || this.getFirstStep();
        
        // Notify listeners
        this.notifyListeners('sessionLoaded', {
          session: this.currentSession,
          step: this.currentStep
        });
        
        console.log(`Resumed in-progress session for ${this.currentSession.customer_name}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking for in-progress sessions:', error);
      return false;
    }
  }
  
  /**
   * Get the first step in the workflow
   * @returns {string} First step ID
   */
  getFirstStep() {
    return this.isBridgeMode ? this.bridgeSteps[0] : this.steps[0];
  }
  
  /**
   * Get all steps in the workflow
   * @returns {Array} Array of step IDs
   */
  getAllSteps() {
    return this.isBridgeMode ? this.bridgeSteps : this.steps;
  }
  
  /**
   * Start a new PM session
   * @param {number} customerId - Customer ID
   * @param {string} jobType - Type of job ('pm_service' or 'bridge_building')
   * @returns {Object} Session data
   */
  async startSession(customerId, jobType = 'pm_service') {
    try {
      // Check if already in a session
      if (this.currentSession) {
        console.warn('Already in a session. Please complete or cancel first.');
        return null;
      }
      
      // Get customer data
      const customers = await this.db.query(`
        SELECT * FROM customers WHERE id = ?
      `, [customerId]);
      
      if (!customers || customers.length === 0) {
        console.error(`Customer with ID ${customerId} not found`);
        return null;
      }
      
      const customer = customers[0];
      const isOffline = !(await this.db.isOnline());
      
      // Create new job record
      const now = new Date().toISOString();
      const date = now.split('T')[0];
      const time = now.split('T')[1].substring(0, 5);
      
      // Determine job type based on bridge mode
      const sessionType = this.isBridgeMode ? 'bridge_building' : jobType;
      
      // Create session data object
      const sessionData = {
        currentStep: this.getFirstStep(),
        startTime: now,
        steps: {},
        photos: [],
        notes: '',
        completedSteps: []
      };
      
      // Create job record
      const jobId = await this.db.addRecord('jobs', {
        customer_id: customerId,
        service_type: sessionType,
        title: `${sessionType === 'bridge_building' ? 'Bridge Building Visit' : 'PM Service'} - ${customer.name}`,
        date: date,
        start_time: time,
        status: 'in_progress',
        data: JSON.stringify(sessionData)
      }, isOffline);
      
      // Get the created job
      const jobs = await this.db.query(`
        SELECT j.*, c.name as customer_name, c.business_name as customer_business
        FROM jobs j
        JOIN customers c ON j.customer_id = c.id
        WHERE j.id = ?
      `, [jobId]);
      
      if (jobs && jobs.length > 0) {
        this.currentSession = jobs[0];
        this.currentStep = this.getFirstStep();
        
        // Notify listeners
        this.notifyListeners('sessionStarted', {
          session: this.currentSession,
          step: this.currentStep
        });
        
        console.log(`Started new ${sessionType} session for ${customer.name}`);
        return this.currentSession;
      }
      
      return null;
    } catch (error) {
      console.error('Error starting PM session:', error);
      return null;
    }
  }
  
  /**
   * Save data for the current step
   * @param {string} stepId - Step ID
   * @param {Object} stepData - Step data
   * @returns {boolean} Whether save was successful
   */
  async saveStepData(stepId, stepData) {
    try {
      if (!this.currentSession) {
        console.error('No active session');
        return false;
      }
      
      // Get current session data
      const sessionData = JSON.parse(this.currentSession.data || '{}');
      
      // Update step data
      sessionData.steps[stepId] = stepData;
      
      // Add to completed steps if not already there
      if (!sessionData.completedSteps.includes(stepId)) {
        sessionData.completedSteps.push(stepId);
      }
      
      // Store current step
      sessionData.currentStep = stepId;
      
      // Update session in database
      const isOffline = !(await this.db.isOnline());
      await this.db.updateRecord('jobs', this.currentSession.id, {
        data: JSON.stringify(sessionData)
      }, isOffline);
      
      // Update local session data
      this.currentSession.data = JSON.stringify(sessionData);
      
      // Notify listeners
      this.notifyListeners('stepSaved', {
        session: this.currentSession,
        step: stepId,
        data: stepData
      });
      
      console.log(`Saved data for step ${stepId}`);
      return true;
    } catch (error) {
      console.error(`Error saving step data for ${stepId}:`, error);
      return false;
    }
  }
  
  /**
   * Navigate to the next step in the workflow
   * @returns {string} Next step ID
   */
  async nextStep() {
    try {
      if (!this.currentSession || !this.currentStep) {
        console.error('No active session or step');
        return null;
      }
      
      const steps = this.getAllSteps();
      const currentIndex = steps.indexOf(this.currentStep);
      
      if (currentIndex === -1 || currentIndex >= steps.length - 1) {
        // Already at the last step
        return this.currentStep;
      }
      
      const nextStepId = steps[currentIndex + 1];
      this.currentStep = nextStepId;
      
      // Update session data
      const sessionData = JSON.parse(this.currentSession.data || '{}');
      sessionData.currentStep = nextStepId;
      
      // Update session in database
      const isOffline = !(await this.db.isOnline());
      await this.db.updateRecord('jobs', this.currentSession.id, {
        data: JSON.stringify(sessionData)
      }, isOffline);
      
      // Notify listeners
      this.notifyListeners('stepChanged', {
        session: this.currentSession,
        step: nextStepId,
        direction: 'next'
      });
      
      console.log(`Navigated to next step: ${nextStepId}`);
      return nextStepId;
    } catch (error) {
      console.error('Error navigating to next step:', error);
      return this.currentStep;
    }
  }
  
  /**
   * Navigate to the previous step in the workflow
   * @returns {string} Previous step ID
   */
  async prevStep() {
    try {
      if (!this.currentSession || !this.currentStep) {
        console.error('No active session or step');
        return null;
      }
      
      const steps = this.getAllSteps();
      const currentIndex = steps.indexOf(this.currentStep);
      
      if (currentIndex <= 0) {
        // Already at the first step
        return this.currentStep;
      }
      
      const prevStepId = steps[currentIndex - 1];
      this.currentStep = prevStepId;
      
      // Update session data
      const sessionData = JSON.parse(this.currentSession.data || '{}');
      sessionData.currentStep = prevStepId;
      
      // Update session in database
      const isOffline = !(await this.db.isOnline());
      await this.db.updateRecord('jobs', this.currentSession.id, {
        data: JSON.stringify(sessionData)
      }, isOffline);
      
      // Notify listeners
      this.notifyListeners('stepChanged', {
        session: this.currentSession,
        step: prevStepId,
        direction: 'prev'
      });
      
      console.log(`Navigated to previous step: ${prevStepId}`);
      return prevStepId;
    } catch (error) {
      console.error('Error navigating to previous step:', error);
      return this.currentStep;
    }
  }
  
  /**
   * Add a photo to the current session
   * @param {string} photoUri - Photo URI or base64 data
   * @param {string} stepId - Step ID
   * @param {string} description - Photo description
   * @returns {boolean} Whether add was successful
   */
  async addPhoto(photoUri, stepId, description = '') {
    try {
      if (!this.currentSession) {
        console.error('No active session');
        return false;
      }
      
      // Get current session data
      const sessionData = JSON.parse(this.currentSession.data || '{}');
      
      // Initialize photos array if not exists
      if (!sessionData.photos) {
        sessionData.photos = [];
      }
      
      // Add photo
      const photoData = {
        id: `photo_${Date.now()}`,
        uri: photoUri,
        step: stepId,
        description: description,
        timestamp: new Date().toISOString()
      };
      
      sessionData.photos.push(photoData);
      
      // Update session in database
      const isOffline = !(await this.db.isOnline());
      await this.db.updateRecord('jobs', this.currentSession.id, {
        data: JSON.stringify(sessionData)
      }, isOffline);
      
      // Update local session data
      this.currentSession.data = JSON.stringify(sessionData);
      
      // Notify listeners
      this.notifyListeners('photoAdded', {
        session: this.currentSession,
        photo: photoData
      });
      
      console.log(`Added photo to step ${stepId}`);
      return true;
    } catch (error) {
      console.error('Error adding photo:', error);
      return false;
    }
  }
  
  /**
   * Complete the current session
   * @param {Object} finalData - Final data for the session
   * @returns {boolean} Whether completion was successful
   */
  async completeSession(finalData = {}) {
    try {
      if (!this.currentSession) {
        console.error('No active session');
        return false;
      }
      
      // Get current session data
      const sessionData = JSON.parse(this.currentSession.data || '{}');
      
      // Add final data
      sessionData.finalData = finalData;
      sessionData.endTime = new Date().toISOString();
      sessionData.completionNotes = finalData.notes || '';
      
      // Update session in database
      const isOffline = !(await this.db.isOnline());
      await this.db.updateRecord('jobs', this.currentSession.id, {
        status: 'completed',
        end_time: sessionData.endTime.split('T')[1].substring(0, 5),
        data: JSON.stringify(sessionData)
      }, isOffline);
      
      // For bridge building mode, update relationship if exists
      if (this.isBridgeMode && finalData.relationshipData) {
        await this.updateBridgeRelationship(
          this.currentSession.customer_id, 
          finalData.relationshipData
        );
      }
      
      // Reset current session
      const completedSession = {...this.currentSession, status: 'completed'};
      this.currentSession = null;
      this.currentStep = null;
      
      // Notify listeners
      this.notifyListeners('sessionCompleted', {
        session: completedSession,
        finalData: finalData
      });
      
      console.log('Session completed successfully');
      return true;
    } catch (error) {
      console.error('Error completing session:', error);
      return false;
    }
  }
  
  /**
   * Cancel the current session
   * @param {string} reason - Reason for cancellation
   * @returns {boolean} Whether cancellation was successful
   */
  async cancelSession(reason = '') {
    try {
      if (!this.currentSession) {
        console.error('No active session');
        return false;
      }
      
      // Get current session data
      const sessionData = JSON.parse(this.currentSession.data || '{}');
      
      // Add cancellation data
      sessionData.cancellationReason = reason;
      sessionData.cancellationTime = new Date().toISOString();
      
      // Update session in database
      const isOffline = !(await this.db.isOnline());
      await this.db.updateRecord('jobs', this.currentSession.id, {
        status: 'cancelled',
        data: JSON.stringify(sessionData)
      }, isOffline);
      
      // Reset current session
      const cancelledSession = {...this.currentSession, status: 'cancelled'};
      this.currentSession = null;
      this.currentStep = null;
      
      // Notify listeners
      this.notifyListeners('sessionCancelled', {
        session: cancelledSession,
        reason: reason
      });
      
      console.log('Session cancelled successfully');
      return true;
    } catch (error) {
      console.error('Error cancelling session:', error);
      return false;
    }
  }
  
  /**
   * Get steps with completion status
   * @returns {Array} Steps with completion status
   */
  getStepsWithStatus() {
    if (!this.currentSession) {
      return [];
    }
    
    const sessionData = JSON.parse(this.currentSession.data || '{}');
    const completedSteps = sessionData.completedSteps || [];
    const steps = this.getAllSteps();
    
    return steps.map(stepId => ({
      id: stepId,
      completed: completedSteps.includes(stepId),
      current: stepId === this.currentStep
    }));
  }
  
  /**
   * Get data for a specific step
   * @param {string} stepId - Step ID
   * @returns {Object} Step data
   */
  getStepData(stepId) {
    if (!this.currentSession) {
      return null;
    }
    
    const sessionData = JSON.parse(this.currentSession.data || '{}');
    return sessionData.steps[stepId] || null;
  }
  
  /**
   * Get all photos for the current session
   * @returns {Array} Photos
   */
  getPhotos() {
    if (!this.currentSession) {
      return [];
    }
    
    const sessionData = JSON.parse(this.currentSession.data || '{}');
    return sessionData.photos || [];
  }
  
  /**
   * Update bridge building relationship
   * @param {number} customerId - Customer ID
   * @param {Object} relationshipData - Relationship data
   * @returns {boolean} Whether update was successful
   */
  async updateBridgeRelationship(customerId, relationshipData) {
    try {
      if (!this.isBridgeMode) {
        return false;
      }
      
      // Get customer data
      const customers = await this.db.query(`
        SELECT * FROM customers WHERE id = ?
      `, [customerId]);
      
      if (!customers || customers.length === 0) {
        console.error(`Customer with ID ${customerId} not found`);
        return false;
      }
      
      const customer = customers[0];
      
      // Check if relationship already exists
      const relationships = await this.db.query(`
        SELECT * FROM bridge_building_relationships
        WHERE customer_id = ?
      `, [customerId]);
      
      const isOffline = !(await this.db.isOnline());
      
      if (relationships && relationships.length > 0) {
        // Update existing relationship
        const relationship = relationships[0];
        
        await this.db.updateRecord('bridge_building_relationships', relationship.id, {
          status: relationshipData.status || relationship.status,
          interest_level: relationshipData.interestLevel || relationship.interest_level,
          next_action: relationshipData.nextAction || relationship.next_action,
          next_action_date: relationshipData.nextActionDate || relationship.next_action_date,
          notes: relationship.notes + '\n\n' + (relationshipData.notes || '')
        }, isOffline);
        
        // Add interaction record
        await this.db.addRecord('bridge_building_interactions', {
          relationship_id: relationship.id,
          interaction_type: 'visit',
          date: new Date().toISOString(),
          notes: relationshipData.notes || '',
          outcome: relationshipData.outcome || '',
          follow_up_required: relationshipData.nextAction ? 1 : 0,
          follow_up_date: relationshipData.nextActionDate || null
        }, isOffline);
        
        console.log(`Updated bridge relationship for ${customer.name}`);
      } else {
        // Create new relationship
        const relationshipId = await this.db.addRecord('bridge_building_relationships', {
          customer_id: customerId,
          prospect_name: customer.name,
          business_name: customer.business_name || customer.name,
          status: relationshipData.status || 'initial_contact',
          interest_level: relationshipData.interestLevel || 3,
          notes: relationshipData.notes || '',
          next_action: relationshipData.nextAction || '',
          next_action_date: relationshipData.nextActionDate || null
        }, isOffline);
        
        // Add initial interaction record
        await this.db.addRecord('bridge_building_interactions', {
          relationship_id: relationshipId,
          interaction_type: 'visit',
          date: new Date().toISOString(),
          notes: relationshipData.notes || '',
          outcome: relationshipData.outcome || 'Initial visit completed',
          follow_up_required: relationshipData.nextAction ? 1 : 0,
          follow_up_date: relationshipData.nextActionDate || null
        }, isOffline);
        
        console.log(`Created new bridge relationship for ${customer.name}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating bridge relationship:', error);
      return false;
    }
  }
  
  /**
   * Add an equipment record from a PM session
   * @param {Object} equipmentData - Equipment data
   * @returns {boolean} Whether add was successful
   */
  async addEquipmentRecord(equipmentData) {
    try {
      if (!this.currentSession) {
        console.error('No active session');
        return false;
      }
      
      const isOffline = !(await this.db.isOnline());
      
      // Add equipment record
      await this.db.addRecord('equipment', {
        customer_id: this.currentSession.customer_id,
        type: equipmentData.type,
        brand: equipmentData.brand,
        model: equipmentData.model,
        serial_number: equipmentData.serialNumber,
        installation_date: equipmentData.installationDate,
        last_service_date: new Date().toISOString(),
        next_service_date: equipmentData.nextServiceDate,
        status: equipmentData.status || 'operational',
        notes: equipmentData.notes
      }, isOffline);
      
      console.log(`Added equipment record: ${equipmentData.type} ${equipmentData.brand}`);
      return true;
    } catch (error) {
      console.error('Error adding equipment record:', error);
      return false;
    }
  }
  
  /**
   * Get step title
   * @param {string} stepId - Step ID
   * @returns {string} Step title
   */
  getStepTitle(stepId) {
    const stepTitles = {
      // Normal mode step titles
      client_identification: 'Client Identification',
      equipment_identification: 'Equipment Identification',
      cooler_inspection: 'Cooler Inspection',
      freezer_inspection: 'Freezer Inspection',
      temperature_verification: 'Temperature Verification',
      coil_cleaning: 'Coil Cleaning',
      minor_repairs: 'Minor Repairs',
      gasket_inspection: 'Gasket Inspection',
      sink_plumbing: 'Sink & Plumbing',
      final_report: 'Final Report',
      
      // Bridge building mode step titles
      business_identification: 'Business Identification',
      introduction_notes: 'Introduction Notes',
      equipment_overview: 'Equipment Overview',
      pain_points: 'Pain Points & Challenges',
      follow_up_planning: 'Follow-up Planning'
    };
    
    return stepTitles[stepId] || stepId;
  }
  
  /**
   * Add a listener for workflow events
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  addListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  /**
   * Remove a listener for workflow events
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  removeListener(event, callback) {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
  
  /**
   * Notify listeners of an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  notifyListeners(event, data) {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }
}

// Export the workflow module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PMWorkflow;
} else {
  window.PMWorkflow = PMWorkflow;
}