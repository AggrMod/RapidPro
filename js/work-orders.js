// Work Order Management System
// Task 8: Work Order System - Convert quotes to work orders and manage job lifecycle

let currentWorkOrder = null;
let workOrdersList = [];

// Work Order Status Types
const WORK_ORDER_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  PARTS_ORDERED: 'parts_ordered',
  COMPLETED: 'completed',
  INVOICED: 'invoiced',
  CANCELLED: 'cancelled'
};

// ============================================================================
// WORK ORDER CREATION
// ============================================================================

/**
 * Convert an accepted quote into a work order
 * @param {Object} quote - The accepted quote object
 * @returns {Promise<Object>} The created work order
 */
async function createWorkOrderFromQuote(quoteId) {
  try {
    const result = await functions.httpsCallable('createWorkOrder')({
      quoteId: quoteId,
      createdBy: currentUser.uid
    });

    if (result.data.success) {
      console.log('Work order created:', result.data.workOrderId);
      return result.data.workOrder;
    } else {
      throw new Error(result.data.message || 'Failed to create work order');
    }
  } catch (error) {
    console.error('Error creating work order:', error);
    throw error;
  }
}

/**
 * Create a manual work order (not from quote)
 * @param {Object} workOrderData - Work order details
 * @returns {Promise<Object>} The created work order
 */
async function createManualWorkOrder(workOrderData) {
  try {
    const workOrder = {
      customerId: workOrderData.customerId,
      customerName: workOrderData.customerName,
      customerAddress: workOrderData.customerAddress,
      customerPhone: workOrderData.customerPhone,
      equipmentType: workOrderData.equipmentType,
      description: workOrderData.description,
      priority: workOrderData.priority || 'medium',
      status: WORK_ORDER_STATUS.DRAFT,
      assignedTo: currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: currentUser.uid,
      scheduledDate: null,
      partsNeeded: [],
      preWorkChecklist: getDefaultChecklist(),
      safetyNotes: workOrderData.safetyNotes || '',
      accessInstructions: workOrderData.accessInstructions || '',
      estimatedHours: workOrderData.estimatedHours || 0,
      actualHours: 0
    };

    const docRef = await db.collection('workOrders').add(workOrder);

    console.log('Manual work order created:', docRef.id);
    return { id: docRef.id, ...workOrder };
  } catch (error) {
    console.error('Error creating manual work order:', error);
    throw error;
  }
}

// ============================================================================
// WORK ORDER SCHEDULING
// ============================================================================

/**
 * Schedule a work order for a specific date/time
 * @param {string} workOrderId - The work order ID
 * @param {Date} scheduledDate - The scheduled date/time
 * @returns {Promise<void>}
 */
async function scheduleWorkOrder(workOrderId, scheduledDate) {
  try {
    await db.collection('workOrders').doc(workOrderId).update({
      scheduledDate: firebase.firestore.Timestamp.fromDate(scheduledDate),
      status: WORK_ORDER_STATUS.SCHEDULED,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('Work order scheduled:', workOrderId, scheduledDate);

    // Create calendar notification/reminder
    await createWorkOrderReminder(workOrderId, scheduledDate);
  } catch (error) {
    console.error('Error scheduling work order:', error);
    throw error;
  }
}

/**
 * Reschedule an existing work order
 * @param {string} workOrderId - The work order ID
 * @param {Date} newDate - The new scheduled date/time
 * @param {string} reason - Reason for rescheduling
 * @returns {Promise<void>}
 */
async function rescheduleWorkOrder(workOrderId, newDate, reason) {
  try {
    await db.collection('workOrders').doc(workOrderId).update({
      scheduledDate: firebase.firestore.Timestamp.fromDate(newDate),
      rescheduledReason: reason,
      rescheduledAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Notify customer of reschedule (future feature)
    console.log('Work order rescheduled:', workOrderId, newDate);
  } catch (error) {
    console.error('Error rescheduling work order:', error);
    throw error;
  }
}

// ============================================================================
// TECHNICIAN ASSIGNMENT
// ============================================================================

/**
 * Assign work order to a technician
 * @param {string} workOrderId - The work order ID
 * @param {string} technicianId - The technician's user ID
 * @returns {Promise<void>}
 */
async function assignWorkOrder(workOrderId, technicianId) {
  try {
    await db.collection('workOrders').doc(workOrderId).update({
      assignedTo: technicianId,
      assignedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('Work order assigned:', workOrderId, technicianId);
  } catch (error) {
    console.error('Error assigning work order:', error);
    throw error;
  }
}

// ============================================================================
// PARTS MANAGEMENT
// ============================================================================

/**
 * Add parts to work order
 * @param {string} workOrderId - The work order ID
 * @param {Array} parts - Array of part objects
 * @returns {Promise<void>}
 */
async function addPartsToWorkOrder(workOrderId, parts) {
  try {
    const workOrderRef = db.collection('workOrders').doc(workOrderId);
    const workOrder = await workOrderRef.get();

    if (!workOrder.exists) {
      throw new Error('Work order not found');
    }

    const currentParts = workOrder.data().partsNeeded || [];
    const updatedParts = [...currentParts, ...parts];

    await workOrderRef.update({
      partsNeeded: updatedParts,
      status: WORK_ORDER_STATUS.PARTS_ORDERED,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('Parts added to work order:', workOrderId);
  } catch (error) {
    console.error('Error adding parts:', error);
    throw error;
  }
}

/**
 * Mark parts as received
 * @param {string} workOrderId - The work order ID
 * @param {Array} partIds - Array of part IDs that were received
 * @returns {Promise<void>}
 */
async function markPartsReceived(workOrderId, partIds) {
  try {
    const workOrderRef = db.collection('workOrders').doc(workOrderId);
    const workOrder = await workOrderRef.get();

    if (!workOrder.exists) {
      throw new Error('Work order not found');
    }

    const parts = workOrder.data().partsNeeded || [];
    const updatedParts = parts.map(part => {
      if (partIds.includes(part.id)) {
        return { ...part, received: true, receivedAt: new Date() };
      }
      return part;
    });

    // Check if all parts are received
    const allReceived = updatedParts.every(part => part.received);

    await workOrderRef.update({
      partsNeeded: updatedParts,
      status: allReceived ? WORK_ORDER_STATUS.SCHEDULED : WORK_ORDER_STATUS.PARTS_ORDERED,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('Parts marked as received:', workOrderId);
  } catch (error) {
    console.error('Error marking parts received:', error);
    throw error;
  }
}

// ============================================================================
// PRE-WORK CHECKLIST
// ============================================================================

/**
 * Get default pre-work checklist
 * @returns {Array} Default checklist items
 */
function getDefaultChecklist() {
  return [
    { id: 1, item: 'Verify customer contact information', completed: false },
    { id: 2, item: 'Review equipment specifications', completed: false },
    { id: 3, item: 'Confirm all parts are available', completed: false },
    { id: 4, item: 'Check tools and equipment needed', completed: false },
    { id: 5, item: 'Review safety requirements', completed: false },
    { id: 6, item: 'Verify access instructions', completed: false },
    { id: 7, item: 'Load parts onto truck', completed: false },
    { id: 8, item: 'Print/download work order details', completed: false }
  ];
}

/**
 * Update pre-work checklist
 * @param {string} workOrderId - The work order ID
 * @param {Array} checklist - Updated checklist array
 * @returns {Promise<void>}
 */
async function updateChecklist(workOrderId, checklist) {
  try {
    await db.collection('workOrders').doc(workOrderId).update({
      preWorkChecklist: checklist,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('Checklist updated:', workOrderId);
  } catch (error) {
    console.error('Error updating checklist:', error);
    throw error;
  }
}

/**
 * Toggle checklist item completion
 * @param {string} workOrderId - The work order ID
 * @param {number} itemId - The checklist item ID
 * @returns {Promise<void>}
 */
async function toggleChecklistItem(workOrderId, itemId) {
  try {
    const workOrderRef = db.collection('workOrders').doc(workOrderId);
    const workOrder = await workOrderRef.get();

    if (!workOrder.exists) {
      throw new Error('Work order not found');
    }

    const checklist = workOrder.data().preWorkChecklist || [];
    const updatedChecklist = checklist.map(item => {
      if (item.id === itemId) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    await workOrderRef.update({
      preWorkChecklist: updatedChecklist,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('Checklist item toggled:', itemId);
  } catch (error) {
    console.error('Error toggling checklist item:', error);
    throw error;
  }
}

// ============================================================================
// SAFETY & ACCESS NOTES
// ============================================================================

/**
 * Update safety notes
 * @param {string} workOrderId - The work order ID
 * @param {string} notes - Safety notes
 * @returns {Promise<void>}
 */
async function updateSafetyNotes(workOrderId, notes) {
  try {
    await db.collection('workOrders').doc(workOrderId).update({
      safetyNotes: notes,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('Safety notes updated:', workOrderId);
  } catch (error) {
    console.error('Error updating safety notes:', error);
    throw error;
  }
}

/**
 * Update access instructions
 * @param {string} workOrderId - The work order ID
 * @param {string} instructions - Access instructions
 * @returns {Promise<void>}
 */
async function updateAccessInstructions(workOrderId, instructions) {
  try {
    await db.collection('workOrders').doc(workOrderId).update({
      accessInstructions: instructions,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('Access instructions updated:', workOrderId);
  } catch (error) {
    console.error('Error updating access instructions:', error);
    throw error;
  }
}

// ============================================================================
// WORK ORDER STATUS MANAGEMENT
// ============================================================================

/**
 * Start work on a work order
 * @param {string} workOrderId - The work order ID
 * @returns {Promise<void>}
 */
async function startWorkOrder(workOrderId) {
  try {
    await db.collection('workOrders').doc(workOrderId).update({
      status: WORK_ORDER_STATUS.IN_PROGRESS,
      startedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('Work order started:', workOrderId);
  } catch (error) {
    console.error('Error starting work order:', error);
    throw error;
  }
}

/**
 * Complete a work order
 * @param {string} workOrderId - The work order ID
 * @param {Object} completionData - Completion details
 * @returns {Promise<void>}
 */
async function completeWorkOrder(workOrderId, completionData) {
  try {
    await db.collection('workOrders').doc(workOrderId).update({
      status: WORK_ORDER_STATUS.COMPLETED,
      completedAt: firebase.firestore.FieldValue.serverTimestamp(),
      actualHours: completionData.actualHours || 0,
      completionNotes: completionData.notes || '',
      beforePhotos: completionData.beforePhotos || [],
      afterPhotos: completionData.afterPhotos || [],
      partsUsed: completionData.partsUsed || [],
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('Work order completed:', workOrderId);

    // Trigger invoice generation (future Task 9)
    // await generateInvoiceFromWorkOrder(workOrderId);
  } catch (error) {
    console.error('Error completing work order:', error);
    throw error;
  }
}

/**
 * Cancel a work order
 * @param {string} workOrderId - The work order ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<void>}
 */
async function cancelWorkOrder(workOrderId, reason) {
  try {
    await db.collection('workOrders').doc(workOrderId).update({
      status: WORK_ORDER_STATUS.CANCELLED,
      cancelledAt: firebase.firestore.FieldValue.serverTimestamp(),
      cancellationReason: reason,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('Work order cancelled:', workOrderId);
  } catch (error) {
    console.error('Error cancelling work order:', error);
    throw error;
  }
}

// ============================================================================
// WORK ORDER RETRIEVAL & LISTING
// ============================================================================

/**
 * Get all work orders for current user
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Array of work orders
 */
async function getWorkOrders(filters = {}) {
  try {
    let query = db.collection('workOrders')
      .where('assignedTo', '==', currentUser.uid)
      .orderBy('createdAt', 'desc');

    // Apply status filter if provided
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }

    const snapshot = await query.get();
    const workOrders = [];

    snapshot.forEach(doc => {
      workOrders.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return workOrders;
  } catch (error) {
    console.error('Error getting work orders:', error);
    throw error;
  }
}

/**
 * Get today's scheduled work orders
 * @returns {Promise<Array>} Array of today's work orders
 */
async function getTodayWorkOrders() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const snapshot = await db.collection('workOrders')
      .where('assignedTo', '==', currentUser.uid)
      .where('scheduledDate', '>=', firebase.firestore.Timestamp.fromDate(startOfDay))
      .where('scheduledDate', '<=', firebase.firestore.Timestamp.fromDate(endOfDay))
      .orderBy('scheduledDate', 'asc')
      .get();

    const workOrders = [];
    snapshot.forEach(doc => {
      workOrders.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return workOrders;
  } catch (error) {
    console.error('Error getting today\'s work orders:', error);
    throw error;
  }
}

/**
 * Get work order by ID
 * @param {string} workOrderId - The work order ID
 * @returns {Promise<Object>} Work order object
 */
async function getWorkOrderById(workOrderId) {
  try {
    const doc = await db.collection('workOrders').doc(workOrderId).get();

    if (!doc.exists) {
      throw new Error('Work order not found');
    }

    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting work order:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a reminder for an upcoming work order
 * @param {string} workOrderId - The work order ID
 * @param {Date} scheduledDate - The scheduled date
 * @returns {Promise<void>}
 */
async function createWorkOrderReminder(workOrderId, scheduledDate) {
  try {
    // Calculate reminder time (24 hours before)
    const reminderDate = new Date(scheduledDate);
    reminderDate.setHours(reminderDate.getHours() - 24);

    await db.collection('reminders').add({
      type: 'work_order',
      workOrderId: workOrderId,
      userId: currentUser.uid,
      reminderDate: firebase.firestore.Timestamp.fromDate(reminderDate),
      sent: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('Reminder created for work order:', workOrderId);
  } catch (error) {
    console.error('Error creating reminder:', error);
  }
}

/**
 * Get status badge HTML
 * @param {string} status - Work order status
 * @returns {string} HTML for status badge
 */
function getStatusBadgeHTML(status) {
  const badges = {
    [WORK_ORDER_STATUS.DRAFT]: '<span class="badge badge-draft">DRAFT</span>',
    [WORK_ORDER_STATUS.SCHEDULED]: '<span class="badge badge-scheduled">SCHEDULED</span>',
    [WORK_ORDER_STATUS.IN_PROGRESS]: '<span class="badge badge-in-progress">IN PROGRESS</span>',
    [WORK_ORDER_STATUS.PARTS_ORDERED]: '<span class="badge badge-parts">PARTS ORDERED</span>',
    [WORK_ORDER_STATUS.COMPLETED]: '<span class="badge badge-completed">COMPLETED</span>',
    [WORK_ORDER_STATUS.INVOICED]: '<span class="badge badge-invoiced">INVOICED</span>',
    [WORK_ORDER_STATUS.CANCELLED]: '<span class="badge badge-cancelled">CANCELLED</span>'
  };

  return badges[status] || '<span class="badge">UNKNOWN</span>';
}

/**
 * Format work order for display
 * @param {Object} workOrder - Work order object
 * @returns {string} Formatted HTML
 */
function formatWorkOrderDisplay(workOrder) {
  const scheduledDate = workOrder.scheduledDate
    ? new Date(workOrder.scheduledDate.toDate()).toLocaleString()
    : 'Not scheduled';

  return `
    <div class="work-order-card" data-id="${workOrder.id}">
      <div class="work-order-header">
        <h3>${workOrder.customerName}</h3>
        ${getStatusBadgeHTML(workOrder.status)}
      </div>
      <div class="work-order-details">
        <p><strong>Equipment:</strong> ${workOrder.equipmentType || 'N/A'}</p>
        <p><strong>Scheduled:</strong> ${scheduledDate}</p>
        <p><strong>Address:</strong> ${workOrder.customerAddress}</p>
        <p><strong>Priority:</strong> <span class="priority-${workOrder.priority}">${workOrder.priority.toUpperCase()}</span></p>
      </div>
      <div class="work-order-actions">
        <button class="btn-view" onclick="viewWorkOrder('${workOrder.id}')">View Details</button>
        ${workOrder.status === WORK_ORDER_STATUS.SCHEDULED ?
          `<button class="btn-start" onclick="startWorkOrder('${workOrder.id}')">Start Work</button>` : ''}
      </div>
    </div>
  `;
}

// ============================================================================
// UI EVENT HANDLERS (if integrated into dashboard)
// ============================================================================

/**
 * Display work orders list in dashboard
 * @param {Array} workOrders - Array of work orders
 * @returns {void}
 */
function displayWorkOrdersList(workOrders) {
  const container = document.getElementById('work-orders-list');

  if (!container) {
    console.warn('Work orders list container not found');
    return;
  }

  if (workOrders.length === 0) {
    container.innerHTML = '<p class="no-data">No work orders found</p>';
    return;
  }

  container.innerHTML = workOrders.map(wo => formatWorkOrderDisplay(wo)).join('');
}

/**
 * View work order details (opens modal or detail view)
 * @param {string} workOrderId - The work order ID
 * @returns {Promise<void>}
 */
async function viewWorkOrder(workOrderId) {
  try {
    const workOrder = await getWorkOrderById(workOrderId);
    currentWorkOrder = workOrder;

    // Display work order details in modal
    displayWorkOrderModal(workOrder);
  } catch (error) {
    console.error('Error viewing work order:', error);
    alert('Error loading work order details');
  }
}

/**
 * Display work order details modal
 * @param {Object} workOrder - Work order object
 * @returns {void}
 */
function displayWorkOrderModal(workOrder) {
  // This would create a modal to display full work order details
  // Implementation depends on UI framework/design
  console.log('Display work order modal:', workOrder);

  // TODO: Implement modal UI
  alert(`Work Order Details:\n\nCustomer: ${workOrder.customerName}\nStatus: ${workOrder.status}\nEquipment: ${workOrder.equipmentType}`);
}

// ============================================================================
// EXPORTS (if using modules)
// ============================================================================

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createWorkOrderFromQuote,
    createManualWorkOrder,
    scheduleWorkOrder,
    rescheduleWorkOrder,
    assignWorkOrder,
    addPartsToWorkOrder,
    markPartsReceived,
    updateChecklist,
    toggleChecklistItem,
    updateSafetyNotes,
    updateAccessInstructions,
    startWorkOrder,
    completeWorkOrder,
    cancelWorkOrder,
    getWorkOrders,
    getTodayWorkOrders,
    getWorkOrderById,
    WORK_ORDER_STATUS
  };
}
