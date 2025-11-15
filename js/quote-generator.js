// Quote Generation System
// Allows technicians to create quotes for commercial appliance repair

// Pricing configuration (can be modified per business needs)
const PRICING_CONFIG = {
  laborRate: 125, // $ per hour
  partsMarkup: 1.35, // 35% markup on parts
  diagnosticFee: 75, // Initial diagnostic fee
  emergencyMultiplier: 1.5, // 50% extra for emergency service
  serviceFees: {
    tripCharge: 50,
    afterHours: 75,
    weekend: 100
  }
};

// Pre-configured common repair items
const COMMON_REPAIRS = {
  'walk-in-cooler': [
    { name: 'Replace Door Gasket', laborHours: 1, partsCost: 120, description: 'Door gasket replacement' },
    { name: 'Evaporator Coil Cleaning', laborHours: 2, partsCost: 0, description: 'Deep clean evaporator coils' },
    { name: 'Thermostat Replacement', laborHours: 0.5, partsCost: 85, description: 'Digital thermostat replacement' },
    { name: 'Condenser Fan Motor', laborHours: 1.5, partsCost: 250, description: 'Replace condenser fan motor' },
    { name: 'Door Hinge Repair', laborHours: 1, partsCost: 65, description: 'Repair or replace door hinges' }
  ],
  'freezer': [
    { name: 'Defrost Timer Replacement', laborHours: 1, partsCost: 95, description: 'Replace defrost timer' },
    { name: 'Temperature Control', laborHours: 0.75, partsCost: 110, description: 'Replace temperature control' },
    { name: 'Compressor Relay', laborHours: 1, partsCost: 45, description: 'Replace compressor relay' },
    { name: 'Door Seal Replacement', laborHours: 1, partsCost: 140, description: 'Replace freezer door seal' }
  ],
  'ice-machine': [
    { name: 'Water Filter Replacement', laborHours: 0.5, partsCost: 75, description: 'Replace water filter cartridge' },
    { name: 'Clean & Descale', laborHours: 2, partsCost: 35, description: 'Complete clean and descale service' },
    { name: 'Ice Maker Assembly', laborHours: 2, partsCost: 320, description: 'Replace ice maker assembly' },
    { name: 'Water Inlet Valve', laborHours: 1, partsCost: 85, description: 'Replace water inlet valve' }
  ],
  'refrigerator': [
    { name: 'Compressor Replacement', laborHours: 3, partsCost: 450, description: 'Replace compressor unit' },
    { name: 'Evaporator Fan Motor', laborHours: 1.5, partsCost: 175, description: 'Replace evaporator fan motor' },
    { name: 'Control Board', laborHours: 1, partsCost: 225, description: 'Replace main control board' },
    { name: 'Door Gasket Set', laborHours: 1.25, partsCost: 95, description: 'Replace all door gaskets' }
  ],
  'preventive-maintenance': [
    { name: 'Quarterly PM Service', laborHours: 2, partsCost: 50, description: 'Quarterly preventive maintenance service' },
    { name: 'Annual PM Service', laborHours: 4, partsCost: 125, description: 'Annual comprehensive PM service' },
    { name: 'Emergency PM Service', laborHours: 1.5, partsCost: 25, description: 'Emergency preventive check' }
  ]
};

// Current quote state
let currentQuote = {
  customerId: null,
  locationId: null,
  equipmentType: 'walk-in-cooler',
  lineItems: [],
  serviceFees: [],
  isEmergency: false,
  notes: '',
  validUntil: null,
  status: 'draft' // draft, sent, viewed, accepted, rejected
};

// Open quote modal
function openQuoteModal(locationId = null, customerId = null) {
  const modal = document.getElementById('quote-modal');
  if (!modal) {
    console.error('Quote modal not found');
    return;
  }

  // Reset quote state
  currentQuote = {
    customerId: customerId,
    locationId: locationId,
    equipmentType: 'walk-in-cooler',
    lineItems: [],
    serviceFees: [],
    isEmergency: false,
    notes: '',
    validUntil: getDefaultValidUntilDate(),
    status: 'draft'
  };

  // Pre-fill customer info if available
  if (locationId) {
    loadLocationInfo(locationId);
  }

  // Show modal
  modal.classList.remove('hidden');
  modal.classList.add('active');

  // Update UI
  updateQuotePreview();
  populateCommonRepairsList();
}

// Close quote modal
function closeQuoteModal() {
  const modal = document.getElementById('quote-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.classList.add('hidden');
  }
}

// Get default valid until date (14 days from now)
function getDefaultValidUntilDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().split('T')[0];
}

// Load location info from Firestore
async function loadLocationInfo(locationId) {
  try {
    const locationDoc = await db.collection('locations').doc(locationId).get();
    if (locationDoc.exists) {
      const location = locationDoc.data();
      document.getElementById('quote-customer-name').value = location.name || '';
      document.getElementById('quote-customer-address').value = location.address || '';
      document.getElementById('quote-customer-phone').value = location.phone || '';
      currentQuote.locationId = locationId;
    }
  } catch (error) {
    console.error('Error loading location:', error);
  }
}

// Populate common repairs list based on selected equipment type
function populateCommonRepairsList() {
  const equipmentType = document.getElementById('quote-equipment-type')?.value || 'walk-in-cooler';
  const repairsList = document.getElementById('common-repairs-list');

  if (!repairsList) return;

  const repairs = COMMON_REPAIRS[equipmentType] || [];

  repairsList.innerHTML = repairs.map((repair, index) => `
    <div class="common-repair-item" onclick="addRepairToQuote('${equipmentType}', ${index})">
      <div class="repair-name">${repair.name}</div>
      <div class="repair-details">
        ${repair.laborHours}h labor + $${repair.partsCost} parts = $${calculateLineItemTotal(repair)}
      </div>
    </div>
  `).join('');
}

// Calculate line item total
function calculateLineItemTotal(item) {
  const laborCost = item.laborHours * PRICING_CONFIG.laborRate;
  const partsCost = item.partsCost * PRICING_CONFIG.partsMarkup;
  return Math.round(laborCost + partsCost);
}

// Add repair to quote
function addRepairToQuote(equipmentType, repairIndex) {
  const repair = COMMON_REPAIRS[equipmentType][repairIndex];
  if (!repair) return;

  // Check if already added
  const exists = currentQuote.lineItems.find(item =>
    item.name === repair.name && item.equipmentType === equipmentType
  );

  if (exists) {
    alert('This repair is already in the quote');
    return;
  }

  // Add to line items
  currentQuote.lineItems.push({
    ...repair,
    equipmentType: equipmentType,
    quantity: 1,
    total: calculateLineItemTotal(repair)
  });

  updateQuotePreview();
}

// Add custom line item
function addCustomLineItem() {
  const name = document.getElementById('custom-item-name')?.value;
  const description = document.getElementById('custom-item-description')?.value;
  const laborHours = parseFloat(document.getElementById('custom-item-labor')?.value) || 0;
  const partsCost = parseFloat(document.getElementById('custom-item-parts')?.value) || 0;

  if (!name || !description) {
    alert('Please fill in item name and description');
    return;
  }

  const customItem = {
    name,
    description,
    laborHours,
    partsCost,
    equipmentType: 'custom',
    quantity: 1,
    total: calculateLineItemTotal({ laborHours, partsCost })
  };

  currentQuote.lineItems.push(customItem);

  // Clear form
  document.getElementById('custom-item-name').value = '';
  document.getElementById('custom-item-description').value = '';
  document.getElementById('custom-item-labor').value = '';
  document.getElementById('custom-item-parts').value = '';

  updateQuotePreview();
}

// Remove line item
function removeLineItem(index) {
  currentQuote.lineItems.splice(index, 1);
  updateQuotePreview();
}

// Toggle service fee
function toggleServiceFee(feeType) {
  const index = currentQuote.serviceFees.findIndex(f => f.type === feeType);

  if (index >= 0) {
    // Remove fee
    currentQuote.serviceFees.splice(index, 1);
  } else {
    // Add fee
    currentQuote.serviceFees.push({
      type: feeType,
      name: getFeeDisplayName(feeType),
      amount: PRICING_CONFIG.serviceFees[feeType]
    });
  }

  updateQuotePreview();
}

// Get fee display name
function getFeeDisplayName(feeType) {
  const names = {
    tripCharge: 'Trip Charge',
    afterHours: 'After Hours Service',
    weekend: 'Weekend Service'
  };
  return names[feeType] || feeType;
}

// Toggle emergency service
function toggleEmergencyService() {
  currentQuote.isEmergency = !currentQuote.isEmergency;
  updateQuotePreview();
}

// Update quote preview
function updateQuotePreview() {
  const previewContainer = document.getElementById('quote-preview-items');
  if (!previewContainer) return;

  // Calculate subtotals
  let laborSubtotal = 0;
  let partsSubtotal = 0;

  // Render line items
  let itemsHTML = currentQuote.lineItems.map((item, index) => {
    const laborCost = item.laborHours * PRICING_CONFIG.laborRate;
    const partsCost = item.partsCost * PRICING_CONFIG.partsMarkup;

    laborSubtotal += laborCost;
    partsSubtotal += partsCost;

    return `
      <tr class="quote-line-item">
        <td>${item.name}</td>
        <td>${item.description}</td>
        <td>${item.laborHours}h</td>
        <td>$${Math.round(laborCost)}</td>
        <td>$${Math.round(partsCost)}</td>
        <td class="quote-item-total">$${item.total}</td>
        <td>
          <button class="btn-small btn-danger" onclick="removeLineItem(${index})">Remove</button>
        </td>
      </tr>
    `;
  }).join('');

  // Add service fees
  let feesSubtotal = 0;
  currentQuote.serviceFees.forEach(fee => {
    feesSubtotal += fee.amount;
    itemsHTML += `
      <tr class="quote-service-fee">
        <td colspan="5">${fee.name}</td>
        <td class="quote-item-total">$${fee.amount}</td>
        <td></td>
      </tr>
    `;
  });

  // Calculate total
  let subtotal = laborSubtotal + partsSubtotal + feesSubtotal;

  if (currentQuote.isEmergency) {
    const emergencyFee = Math.round(subtotal * (PRICING_CONFIG.emergencyMultiplier - 1));
    itemsHTML += `
      <tr class="quote-emergency-fee">
        <td colspan="5">Emergency Service Premium (50%)</td>
        <td class="quote-item-total">$${emergencyFee}</td>
        <td></td>
      </tr>
    `;
    subtotal += emergencyFee;
  }

  // Add totals row
  itemsHTML += `
    <tr class="quote-total-row">
      <td colspan="5"><strong>TOTAL</strong></td>
      <td class="quote-total-value"><strong>$${Math.round(subtotal)}</strong></td>
      <td></td>
    </tr>
  `;

  previewContainer.innerHTML = itemsHTML || '<tr><td colspan="7" class="empty-state">No items added yet</td></tr>';

  // Update total display
  const totalDisplay = document.getElementById('quote-total-display');
  if (totalDisplay) {
    totalDisplay.textContent = `$${Math.round(subtotal)}`;
  }
}

// Save quote (generate and store in Firestore)
async function saveQuote() {
  if (currentQuote.lineItems.length === 0) {
    alert('Please add at least one item to the quote');
    return;
  }

  const customerName = document.getElementById('quote-customer-name')?.value;
  const customerAddress = document.getElementById('quote-customer-address')?.value;
  const customerPhone = document.getElementById('quote-customer-phone')?.value;

  if (!customerName || !customerAddress) {
    alert('Please fill in customer name and address');
    return;
  }

  try {
    // Show loading state
    const saveBtn = document.getElementById('save-quote-btn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'SAVING...';
    }

    // Prepare quote data
    const quoteData = {
      ...currentQuote,
      customerName,
      customerAddress,
      customerPhone,
      notes: document.getElementById('quote-notes')?.value || '',
      validUntil: document.getElementById('quote-valid-until')?.value || currentQuote.validUntil,
      createdAt: new Date(),
      createdBy: auth.currentUser?.uid,
      updatedAt: new Date()
    };

    // Call Cloud Function to generate quote
    const result = await functions.httpsCallable('generateQuote')(quoteData);

    if (result.data.success) {
      alert('Quote saved successfully! Quote ID: ' + result.data.quoteId);

      // Optionally download PDF
      if (result.data.pdfUrl) {
        window.open(result.data.pdfUrl, '_blank');
      }

      closeQuoteModal();
    } else {
      alert('Error saving quote: ' + result.data.message);
    }

    // Reset button state
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'SAVE QUOTE';
    }
  } catch (error) {
    console.error('Error saving quote:', error);
    alert('Error saving quote: ' + error.message);

    // Reset button state
    const saveBtn = document.getElementById('save-quote-btn');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'SAVE QUOTE';
    }
  }
}

// Send quote via email/text
async function sendQuote() {
  const quoteId = currentQuote.id;
  if (!quoteId) {
    alert('Please save the quote first');
    return;
  }

  const email = document.getElementById('quote-customer-email')?.value;
  const phone = document.getElementById('quote-customer-phone')?.value;

  if (!email && !phone) {
    alert('Please provide customer email or phone number');
    return;
  }

  try {
    const result = await functions.httpsCallable('sendQuote')({
      quoteId,
      email,
      phone
    });

    if (result.data.success) {
      alert('Quote sent successfully!');
      currentQuote.status = 'sent';
    } else {
      alert('Error sending quote: ' + result.data.message);
    }
  } catch (error) {
    console.error('Error sending quote:', error);
    alert('Error sending quote: ' + error.message);
  }
}

// Initialize quote generator when equipment type changes
document.addEventListener('DOMContentLoaded', () => {
  const equipmentSelect = document.getElementById('quote-equipment-type');
  if (equipmentSelect) {
    equipmentSelect.addEventListener('change', populateCommonRepairsList);
  }

  // Initialize valid until date
  const validUntilInput = document.getElementById('quote-valid-until');
  if (validUntilInput) {
    validUntilInput.value = getDefaultValidUntilDate();
  }
});

// Export functions for use in HTML
window.openQuoteModal = openQuoteModal;
window.closeQuoteModal = closeQuoteModal;
window.addRepairToQuote = addRepairToQuote;
window.addCustomLineItem = addCustomLineItem;
window.removeLineItem = removeLineItem;
window.toggleServiceFee = toggleServiceFee;
window.toggleEmergencyService = toggleEmergencyService;
window.saveQuote = saveQuote;
window.sendQuote = sendQuote;
window.populateCommonRepairsList = populateCommonRepairsList;
