// Invoice Manager - UI Components and Interaction Logic
// Manages the invoice interface on the dashboard

class InvoiceManager {
  constructor(invoiceGenerator) {
    this.invoiceGen = invoiceGenerator;
    this.currentInvoice = null;
    this.currentWorkOrder = null;
    this.parts = [];
    this.photos = {
      before: [],
      after: [],
      parts: []
    };
  }

  /**
   * Initialize the invoice manager
   */
  async init(currentUser) {
    this.currentUser = currentUser;
    this.invoiceGen.init(currentUser);
    this.setupEventListeners();
    await this.loadInvoices();
  }

  /**
   * Setup event listeners for invoice UI
   */
  setupEventListeners() {
    // Create invoice button
    const createInvoiceBtn = document.getElementById('create-invoice-btn');
    if (createInvoiceBtn) {
      createInvoiceBtn.addEventListener('click', () => this.showInvoiceForm());
    }

    // Add part button
    const addPartBtn = document.getElementById('add-part-btn');
    if (addPartBtn) {
      addPartBtn.addEventListener('click', () => this.addPart());
    }

    // Upload photos
    const beforePhotoInput = document.getElementById('before-photos');
    const afterPhotoInput = document.getElementById('after-photos');
    const partsPhotoInput = document.getElementById('parts-photos');

    if (beforePhotoInput) {
      beforePhotoInput.addEventListener('change', (e) => this.handlePhotoUpload(e, 'before'));
    }
    if (afterPhotoInput) {
      afterPhotoInput.addEventListener('change', (e) => this.handlePhotoUpload(e, 'after'));
    }
    if (partsPhotoInput) {
      partsPhotoInput.addEventListener('change', (e) => this.handlePhotoUpload(e, 'parts'));
    }

    // Save invoice button
    const saveInvoiceBtn = document.getElementById('save-invoice-btn');
    if (saveInvoiceBtn) {
      saveInvoiceBtn.addEventListener('click', () => this.saveInvoice());
    }

    // Cancel invoice button
    const cancelInvoiceBtn = document.getElementById('cancel-invoice-btn');
    if (cancelInvoiceBtn) {
      cancelInvoiceBtn.addEventListener('click', () => this.cancelInvoiceForm());
    }

    // Record payment button
    const recordPaymentBtn = document.getElementById('record-payment-btn');
    if (recordPaymentBtn) {
      recordPaymentBtn.addEventListener('click', () => this.showPaymentForm());
    }

    // Send invoice button
    const sendInvoiceBtn = document.getElementById('send-invoice-btn');
    if (sendInvoiceBtn) {
      sendInvoiceBtn.addEventListener('click', () => this.sendInvoiceEmail());
    }
  }

  /**
   * Show invoice creation form
   */
  showInvoiceForm() {
    const form = document.getElementById('invoice-form');
    if (form) {
      form.classList.remove('hidden');
      this.resetInvoiceForm();
    }
  }

  /**
   * Hide invoice form
   */
  hideInvoiceForm() {
    const form = document.getElementById('invoice-form');
    if (form) {
      form.classList.add('hidden');
    }
  }

  /**
   * Reset invoice form
   */
  resetInvoiceForm() {
    this.parts = [];
    this.photos = { before: [], after: [], parts: [] };
    this.currentInvoice = null;
    this.renderPartsList();

    // Reset form fields
    const form = document.getElementById('invoice-form');
    if (form) {
      form.reset();
    }
  }

  /**
   * Add a part to the invoice
   */
  addPart() {
    const descriptionInput = document.getElementById('part-description');
    const partNumberInput = document.getElementById('part-number');
    const quantityInput = document.getElementById('part-quantity');
    const priceInput = document.getElementById('part-price');

    const description = descriptionInput?.value.trim();
    const partNumber = partNumberInput?.value.trim();
    const quantity = parseFloat(quantityInput?.value || 1);
    const price = parseFloat(priceInput?.value || 0);

    if (!description) {
      alert('Please enter a part description');
      return;
    }

    if (quantity <= 0 || price < 0) {
      alert('Please enter valid quantity and price');
      return;
    }

    const part = {
      id: Date.now(), // Temporary ID
      description,
      partNumber,
      quantity,
      unitPrice: price,
      subtotal: quantity * price
    };

    this.parts.push(part);
    this.renderPartsList();
    this.updateInvoiceTotals();

    // Clear inputs
    if (descriptionInput) descriptionInput.value = '';
    if (partNumberInput) partNumberInput.value = '';
    if (quantityInput) quantityInput.value = '1';
    if (priceInput) priceInput.value = '';
  }

  /**
   * Remove a part from the invoice
   */
  removePart(partId) {
    this.parts = this.parts.filter(p => p.id !== partId);
    this.renderPartsList();
    this.updateInvoiceTotals();
  }

  /**
   * Render the parts list in the UI
   */
  renderPartsList() {
    const partsList = document.getElementById('parts-list');
    if (!partsList) return;

    if (this.parts.length === 0) {
      partsList.innerHTML = '<p class="text-muted">No parts added yet</p>';
      return;
    }

    partsList.innerHTML = `
      <table class="parts-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Part #</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Subtotal</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${this.parts.map(part => `
            <tr>
              <td>${part.description}</td>
              <td>${part.partNumber || '-'}</td>
              <td>${part.quantity}</td>
              <td>$${part.unitPrice.toFixed(2)}</td>
              <td>$${part.subtotal.toFixed(2)}</td>
              <td>
                <button class="btn-remove" onclick="invoiceManager.removePart(${part.id})">
                  Remove
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  /**
   * Update invoice totals display
   */
  updateInvoiceTotals() {
    const laborHours = parseFloat(document.getElementById('labor-hours')?.value || 0);
    const laborRate = parseFloat(document.getElementById('labor-rate')?.value || 85);
    const taxRate = parseFloat(document.getElementById('tax-rate')?.value || 0.0925);

    const totals = this.invoiceGen.calculateInvoiceTotals(
      this.parts,
      { hours: laborHours, rate: laborRate },
      taxRate
    );

    // Update display
    const subtotalEl = document.getElementById('invoice-subtotal');
    const taxEl = document.getElementById('invoice-tax');
    const totalEl = document.getElementById('invoice-total');

    if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${totals.taxAmount.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${totals.totalAmount.toFixed(2)}`;
  }

  /**
   * Handle photo uploads
   */
  async handlePhotoUpload(event, photoType) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploadBtn = event.target.parentElement.querySelector('.upload-status');
    if (uploadBtn) uploadBtn.textContent = 'Uploading...';

    try {
      const uploadPromises = Array.from(files).map(file => this.uploadPhoto(file, photoType));
      const urls = await Promise.all(uploadPromises);

      this.photos[photoType].push(...urls);

      if (uploadBtn) {
        uploadBtn.textContent = `${this.photos[photoType].length} photo(s) uploaded`;
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Error uploading photos: ' + error.message);
      if (uploadBtn) uploadBtn.textContent = 'Upload failed';
    }
  }

  /**
   * Upload a single photo to Firebase Storage
   */
  async uploadPhoto(file, photoType) {
    const storage = firebase.storage();
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const path = `invoice-photos/${this.currentUser.uid}/${photoType}/${filename}`;

    const storageRef = storage.ref(path);
    await storageRef.put(file);
    const downloadUrl = await storageRef.getDownloadURL();

    return downloadUrl;
  }

  /**
   * Save invoice to database
   */
  async saveInvoice() {
    const saveBtn = document.getElementById('save-invoice-btn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
    }

    try {
      // Gather form data
      const workOrderData = this.gatherFormData();

      // Create invoice
      const result = await this.invoiceGen.createInvoice(workOrderData);

      if (result.success) {
        alert('Invoice created successfully!');
        this.hideInvoiceForm();
        await this.loadInvoices();

        // Optionally show the created invoice
        this.showInvoiceDetail(result.invoiceId);
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Error creating invoice: ' + error.message);
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Create Invoice';
      }
    }
  }

  /**
   * Gather form data for invoice creation
   */
  gatherFormData() {
    return {
      // Customer information
      customerName: document.getElementById('customer-name')?.value || '',
      businessName: document.getElementById('business-name')?.value || '',
      address: document.getElementById('customer-address')?.value || '',
      phone: document.getElementById('customer-phone')?.value || '',
      email: document.getElementById('customer-email')?.value || '',

      // Service details
      serviceDate: document.getElementById('service-date')?.value || new Date().toISOString(),
      description: document.getElementById('service-description')?.value || '',

      // Equipment serviced
      equipmentServiced: this.gatherEquipmentList(),

      // Parts
      parts: this.parts,

      // Labor
      labor: {
        hours: parseFloat(document.getElementById('labor-hours')?.value || 0),
        rate: parseFloat(document.getElementById('labor-rate')?.value || 85),
        description: document.getElementById('labor-description')?.value || 'Service and repair'
      },

      // Time tracking
      arrivalTime: document.getElementById('arrival-time')?.value,
      departureTime: document.getElementById('departure-time')?.value,

      // Tax and payment
      taxRate: parseFloat(document.getElementById('tax-rate')?.value || 0.0925),
      paymentTerms: document.getElementById('payment-terms')?.value || 'due_on_receipt',

      // Documentation
      photosBefore: this.photos.before,
      photosAfter: this.photos.after,
      photosParts: this.photos.parts,
      technicianNotes: document.getElementById('technician-notes')?.value || ''
    };
  }

  /**
   * Gather equipment list from form
   */
  gatherEquipmentList() {
    const equipmentText = document.getElementById('equipment-serviced')?.value || '';
    return equipmentText.split('\n').filter(line => line.trim() !== '');
  }

  /**
   * Cancel invoice form
   */
  cancelInvoiceForm() {
    if (confirm('Cancel invoice creation? All data will be lost.')) {
      this.hideInvoiceForm();
      this.resetInvoiceForm();
    }
  }

  /**
   * Load invoices from database
   */
  async loadInvoices(filters = {}) {
    try {
      const result = await this.invoiceGen.getInvoices(filters);

      if (result.success) {
        this.renderInvoicesList(result.invoices);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  }

  /**
   * Render invoices list in UI
   */
  renderInvoicesList(invoices) {
    const invoicesList = document.getElementById('invoices-list');
    if (!invoicesList) return;

    if (invoices.length === 0) {
      invoicesList.innerHTML = '<p class="text-muted">No invoices found</p>';
      return;
    }

    invoicesList.innerHTML = `
      <div class="invoices-grid">
        ${invoices.map(invoice => this.renderInvoiceCard(invoice)).join('')}
      </div>
    `;
  }

  /**
   * Render a single invoice card
   */
  renderInvoiceCard(invoice) {
    const statusClass = this.getStatusClass(invoice.status);
    const statusText = this.formatStatus(invoice.status);

    return `
      <div class="invoice-card" data-invoice-id="${invoice.id}">
        <div class="invoice-header">
          <h3>${invoice.invoiceNumber}</h3>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="invoice-body">
          <p><strong>Customer:</strong> ${invoice.customer.businessName || invoice.customer.name}</p>
          <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
          <p><strong>Amount:</strong> $${invoice.totalAmount.toFixed(2)}</p>
          <p><strong>Due:</strong> $${invoice.amountDue.toFixed(2)}</p>
        </div>
        <div class="invoice-actions">
          <button class="btn-view" onclick="invoiceManager.showInvoiceDetail('${invoice.id}')">
            View
          </button>
          ${invoice.status === 'draft' ? `
            <button class="btn-send" onclick="invoiceManager.sendInvoiceEmail('${invoice.id}')">
              Send
            </button>
          ` : ''}
          ${invoice.status !== 'paid' ? `
            <button class="btn-pay" onclick="invoiceManager.showPaymentForm('${invoice.id}')">
              Record Payment
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Get CSS class for invoice status
   */
  getStatusClass(status) {
    const classes = {
      'draft': 'status-draft',
      'sent': 'status-sent',
      'partial': 'status-partial',
      'paid': 'status-paid',
      'overdue': 'status-overdue',
      'cancelled': 'status-cancelled'
    };
    return classes[status] || 'status-default';
  }

  /**
   * Format status text for display
   */
  formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  /**
   * Show invoice detail view
   */
  async showInvoiceDetail(invoiceId) {
    try {
      const result = await this.invoiceGen.getInvoice(invoiceId);

      if (result.success) {
        this.currentInvoice = result.invoice;
        this.renderInvoiceDetail(result.invoice);
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      alert('Error loading invoice details');
    }
  }

  /**
   * Render invoice detail view
   */
  renderInvoiceDetail(invoice) {
    const detailContainer = document.getElementById('invoice-detail');
    if (!detailContainer) return;

    const html = this.invoiceGen.generateInvoiceHTML(invoice);

    detailContainer.innerHTML = `
      <div class="invoice-detail-wrapper">
        <div class="invoice-detail-actions">
          <button onclick="invoiceManager.printInvoice('${invoice.id}')">Print</button>
          <button onclick="invoiceManager.downloadInvoicePDF('${invoice.id}')">Download PDF</button>
          <button onclick="invoiceManager.closeInvoiceDetail()">Close</button>
        </div>
        <div class="invoice-content">
          ${html}
        </div>
      </div>
    `;

    detailContainer.classList.remove('hidden');
  }

  /**
   * Close invoice detail view
   */
  closeInvoiceDetail() {
    const detailContainer = document.getElementById('invoice-detail');
    if (detailContainer) {
      detailContainer.classList.add('hidden');
    }
  }

  /**
   * Print invoice
   */
  printInvoice(invoiceId) {
    const invoiceContent = document.querySelector('.invoice-content');
    if (invoiceContent) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(invoiceContent.innerHTML);
      printWindow.document.close();
      printWindow.print();
    }
  }

  /**
   * Download invoice as PDF
   */
  async downloadInvoicePDF(invoiceId) {
    try {
      const result = await this.invoiceGen.generateInvoicePDF(invoiceId);
      // Would implement actual PDF download here
      alert('PDF download functionality would be implemented with jsPDF library');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF');
    }
  }

  /**
   * Show payment form
   */
  showPaymentForm(invoiceId) {
    this.currentInvoice = { id: invoiceId };

    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
      <div class="payment-form-container">
        <h2>Record Payment</h2>
        <form id="payment-form">
          <div class="form-group">
            <label>Amount Paid</label>
            <input type="number" id="payment-amount" step="0.01" required />
          </div>
          <div class="form-group">
            <label>Payment Method</label>
            <select id="payment-method" required>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="card">Credit/Debit Card</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Payment Date</label>
            <input type="date" id="payment-date" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea id="payment-notes"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">Record Payment</button>
            <button type="button" class="btn-secondary" onclick="this.closest('.payment-modal').remove()">
              Cancel
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    const form = modal.querySelector('#payment-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.recordPayment(invoiceId);
      modal.remove();
    });
  }

  /**
   * Record payment for an invoice
   */
  async recordPayment(invoiceId) {
    const amount = parseFloat(document.getElementById('payment-amount')?.value || 0);
    const method = document.getElementById('payment-method')?.value;
    const date = document.getElementById('payment-date')?.value;
    const notes = document.getElementById('payment-notes')?.value || '';

    if (amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    try {
      const result = await this.invoiceGen.recordPayment(invoiceId, {
        amount,
        method,
        date,
        notes
      });

      if (result.success) {
        alert(`Payment recorded! Amount due: $${result.amountDue.toFixed(2)}`);
        await this.loadInvoices();
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Error recording payment: ' + error.message);
    }
  }

  /**
   * Send invoice via email
   */
  async sendInvoiceEmail(invoiceId) {
    const email = prompt('Enter recipient email address:');
    if (!email) return;

    try {
      const result = await this.invoiceGen.sendInvoice(invoiceId, {
        recipientEmail: email
      });

      if (result.success) {
        alert('Invoice sent successfully!');
        await this.loadInvoices();
      } else {
        alert('Error sending invoice: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Error sending invoice: ' + error.message);
    }
  }
}

// Global instance
let invoiceManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Will be initialized after authentication
});
