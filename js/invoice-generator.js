// Invoice Generation System
// Handles invoice creation, parts tracking, time tracking, and payment processing

class InvoiceGenerator {
  constructor() {
    this.db = firebase.firestore();
    this.functions = firebase.functions();
    this.storage = firebase.storage();
    this.currentUser = null;
  }

  /**
   * Initialize with current user
   */
  init(user) {
    this.currentUser = user;
  }

  /**
   * Create a new invoice from a work order
   * @param {Object} workOrderData - Work order details
   * @returns {Promise<Object>} Created invoice
   */
  async createInvoice(workOrderData) {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      // Validate work order data
      this.validateWorkOrderData(workOrderData);

      // Calculate totals
      const calculations = this.calculateInvoiceTotals(
        workOrderData.parts || [],
        workOrderData.labor || {},
        workOrderData.taxRate || 0.0925 // Default Memphis, TN sales tax rate
      );

      // Create invoice object
      const invoice = {
        // Invoice metadata
        invoiceNumber: await this.generateInvoiceNumber(),
        invoiceDate: new Date().toISOString(),
        dueDate: this.calculateDueDate(workOrderData.paymentTerms || 'due_on_receipt'),
        status: 'draft', // draft, sent, paid, overdue, cancelled

        // Work order reference
        workOrderId: workOrderData.workOrderId,
        locationId: workOrderData.locationId,

        // Customer information
        customer: {
          name: workOrderData.customerName,
          businessName: workOrderData.businessName,
          address: workOrderData.address,
          phone: workOrderData.phone,
          email: workOrderData.email
        },

        // Service details
        serviceDate: workOrderData.serviceDate || new Date().toISOString(),
        equipmentServiced: workOrderData.equipmentServiced || [],
        description: workOrderData.description || '',

        // Parts used
        parts: (workOrderData.parts || []).map(part => ({
          partNumber: part.partNumber || '',
          description: part.description,
          quantity: part.quantity,
          unitPrice: part.unitPrice,
          subtotal: part.quantity * part.unitPrice,
          supplier: part.supplier || '',
          warranty: part.warranty || ''
        })),

        // Labor charges
        labor: {
          hours: workOrderData.labor?.hours || 0,
          rate: workOrderData.labor?.rate || 85, // $85/hour default
          subtotal: (workOrderData.labor?.hours || 0) * (workOrderData.labor?.rate || 85),
          description: workOrderData.labor?.description || 'Service and repair'
        },

        // Time tracking
        timeTracking: {
          arrivalTime: workOrderData.arrivalTime,
          departureTime: workOrderData.departureTime,
          totalMinutes: workOrderData.totalMinutes,
          travelTime: workOrderData.travelTime || 0,
          workTime: workOrderData.workTime || 0
        },

        // Financial details
        subtotal: calculations.subtotal,
        taxRate: workOrderData.taxRate || 0.0925,
        taxAmount: calculations.taxAmount,
        totalAmount: calculations.totalAmount,
        amountPaid: 0,
        amountDue: calculations.totalAmount,

        // Payment details
        paymentTerms: workOrderData.paymentTerms || 'due_on_receipt',
        paymentMethod: null, // cash, check, card, null
        paymentDate: null,
        paymentNotes: '',

        // Documentation
        photos: {
          before: workOrderData.photosBefore || [],
          after: workOrderData.photosAfter || [],
          parts: workOrderData.photosParts || []
        },
        technicianNotes: workOrderData.technicianNotes || '',
        customerSignature: null,
        technicianSignature: null,

        // Follow-up
        followUpRequested: false,
        followUpDate: null,
        reviewRequested: false,
        reviewSubmitted: false,

        // Metadata
        createdBy: this.currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        sentAt: null,
        paidAt: null
      };

      // Save to Firestore
      const invoiceRef = await this.db.collection('invoices').add(invoice);

      // Update work order status
      if (workOrderData.workOrderId) {
        await this.db.collection('workOrders').doc(workOrderData.workOrderId).update({
          status: 'invoiced',
          invoiceId: invoiceRef.id,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      return {
        success: true,
        invoiceId: invoiceRef.id,
        invoice: { ...invoice, id: invoiceRef.id }
      };
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Validate work order data before creating invoice
   */
  validateWorkOrderData(data) {
    const required = ['customerName', 'address'];
    const missing = required.filter(field => !data[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    if (!data.parts || data.parts.length === 0) {
      if (!data.labor || !data.labor.hours || data.labor.hours <= 0) {
        throw new Error('Invoice must include either parts or labor');
      }
    }
  }

  /**
   * Calculate invoice totals
   */
  calculateInvoiceTotals(parts, labor, taxRate) {
    // Calculate parts subtotal
    const partsSubtotal = parts.reduce((sum, part) => {
      return sum + (part.quantity * part.unitPrice);
    }, 0);

    // Calculate labor subtotal
    const laborSubtotal = (labor.hours || 0) * (labor.rate || 85);

    // Calculate subtotal
    const subtotal = partsSubtotal + laborSubtotal;

    // Calculate tax (on parts and labor)
    const taxAmount = subtotal * taxRate;

    // Calculate total
    const totalAmount = subtotal + taxAmount;

    return {
      partsSubtotal: Math.round(partsSubtotal * 100) / 100,
      laborSubtotal: Math.round(laborSubtotal * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100
    };
  }

  /**
   * Generate unique invoice number
   */
  async generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const prefix = `RPM-${year}-`;

    // Get count of invoices this year
    const startOfYear = new Date(year, 0, 1).toISOString();
    const invoiceCount = await this.db.collection('invoices')
      .where('invoiceDate', '>=', startOfYear)
      .count()
      .get();

    const number = (invoiceCount.data().count + 1).toString().padStart(4, '0');
    return `${prefix}${number}`;
  }

  /**
   * Calculate due date based on payment terms
   */
  calculateDueDate(paymentTerms) {
    const today = new Date();

    switch (paymentTerms) {
      case 'due_on_receipt':
        return today.toISOString();
      case 'net_7':
        return new Date(today.setDate(today.getDate() + 7)).toISOString();
      case 'net_15':
        return new Date(today.setDate(today.getDate() + 15)).toISOString();
      case 'net_30':
        return new Date(today.setDate(today.getDate() + 30)).toISOString();
      default:
        return today.toISOString();
    }
  }

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(invoiceId, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...additionalData
      };

      if (status === 'sent') {
        updateData.sentAt = firebase.firestore.FieldValue.serverTimestamp();
      } else if (status === 'paid') {
        updateData.paidAt = firebase.firestore.FieldValue.serverTimestamp();
        updateData.amountPaid = updateData.amountDue;
      }

      await this.db.collection('invoices').doc(invoiceId).update(updateData);

      return { success: true };
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }

  /**
   * Record payment for an invoice
   */
  async recordPayment(invoiceId, paymentData) {
    try {
      const invoiceRef = this.db.collection('invoices').doc(invoiceId);
      const invoiceDoc = await invoiceRef.get();

      if (!invoiceDoc.exists) {
        throw new Error('Invoice not found');
      }

      const invoice = invoiceDoc.data();
      const amountPaid = (invoice.amountPaid || 0) + paymentData.amount;
      const amountDue = invoice.totalAmount - amountPaid;

      const updateData = {
        amountPaid,
        amountDue,
        paymentMethod: paymentData.method,
        paymentDate: paymentData.date || new Date().toISOString(),
        paymentNotes: paymentData.notes || '',
        status: amountDue <= 0 ? 'paid' : 'partial',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      if (amountDue <= 0) {
        updateData.paidAt = firebase.firestore.FieldValue.serverTimestamp();
      }

      await invoiceRef.update(updateData);

      // Record payment in separate collection for tracking
      await this.db.collection('payments').add({
        invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        amount: paymentData.amount,
        method: paymentData.method,
        date: paymentData.date || new Date().toISOString(),
        notes: paymentData.notes || '',
        recordedBy: this.currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,
        amountPaid,
        amountDue,
        status: updateData.status
      };
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId) {
    try {
      const invoiceDoc = await this.db.collection('invoices').doc(invoiceId).get();

      if (!invoiceDoc.exists) {
        throw new Error('Invoice not found');
      }

      return {
        success: true,
        invoice: { id: invoiceDoc.id, ...invoiceDoc.data() }
      };
    } catch (error) {
      console.error('Error getting invoice:', error);
      throw error;
    }
  }

  /**
   * Get all invoices (with optional filters)
   */
  async getInvoices(filters = {}) {
    try {
      let query = this.db.collection('invoices');

      // Apply filters
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters.customerId) {
        query = query.where('customer.id', '==', filters.customerId);
      }
      if (filters.startDate) {
        query = query.where('invoiceDate', '>=', filters.startDate);
      }
      if (filters.endDate) {
        query = query.where('invoiceDate', '<=', filters.endDate);
      }

      // Order by date (newest first)
      query = query.orderBy('invoiceDate', 'desc');

      // Apply limit
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const snapshot = await query.get();
      const invoices = [];

      snapshot.forEach(doc => {
        invoices.push({ id: doc.id, ...doc.data() });
      });

      return {
        success: true,
        invoices,
        count: invoices.length
      };
    } catch (error) {
      console.error('Error getting invoices:', error);
      throw error;
    }
  }

  /**
   * Generate invoice PDF (client-side using jsPDF)
   * This is a simplified version - would need jsPDF library loaded
   */
  async generateInvoicePDF(invoiceId) {
    try {
      const result = await this.getInvoice(invoiceId);
      const invoice = result.invoice;

      // This would use jsPDF to generate a PDF
      // For now, return the invoice data formatted for display
      return {
        success: true,
        invoiceHtml: this.generateInvoiceHTML(invoice)
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  /**
   * Generate HTML representation of invoice
   */
  generateInvoiceHTML(invoice) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .company-info { font-weight: bold; }
          .invoice-info { text-align: right; }
          .customer-info { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; }
          .totals { text-align: right; }
          .total-row { font-weight: bold; font-size: 1.2em; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #333; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>Rapid Pro Maintenance</h1>
            <p>Commercial Appliance Repair</p>
            <p>Memphis, TN</p>
            <p>Phone: (901) 257-9417</p>
            <p>Email: R22subcooling@gmail.com</p>
          </div>
          <div class="invoice-info">
            <h2>INVOICE</h2>
            <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div class="customer-info">
          <h3>Bill To:</h3>
          <p><strong>${invoice.customer.businessName || invoice.customer.name}</strong></p>
          <p>${invoice.customer.address}</p>
          <p>${invoice.customer.phone}</p>
          ${invoice.customer.email ? `<p>${invoice.customer.email}</p>` : ''}
        </div>

        <div class="service-info">
          <p><strong>Service Date:</strong> ${new Date(invoice.serviceDate).toLocaleDateString()}</p>
          <p><strong>Description:</strong> ${invoice.description}</p>
        </div>

        <h3>Parts & Materials</h3>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Part #</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.parts.map(part => `
              <tr>
                <td>${part.description}</td>
                <td>${part.partNumber}</td>
                <td>${part.quantity}</td>
                <td>$${part.unitPrice.toFixed(2)}</td>
                <td>$${part.subtotal.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>Labor</h3>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Hours</th>
              <th>Rate</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${invoice.labor.description}</td>
              <td>${invoice.labor.hours}</td>
              <td>$${invoice.labor.rate.toFixed(2)}/hr</td>
              <td>$${invoice.labor.subtotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <p><strong>Subtotal:</strong> $${invoice.subtotal.toFixed(2)}</p>
          <p><strong>Tax (${(invoice.taxRate * 100).toFixed(2)}%):</strong> $${invoice.taxAmount.toFixed(2)}</p>
          <p class="total-row"><strong>TOTAL:</strong> $${invoice.totalAmount.toFixed(2)}</p>
          ${invoice.amountPaid > 0 ? `<p><strong>Paid:</strong> $${invoice.amountPaid.toFixed(2)}</p>` : ''}
          <p class="total-row"><strong>AMOUNT DUE:</strong> $${invoice.amountDue.toFixed(2)}</p>
        </div>

        <div class="footer">
          <p><strong>Payment Terms:</strong> ${this.formatPaymentTerms(invoice.paymentTerms)}</p>
          <p><strong>Technician Notes:</strong> ${invoice.technicianNotes}</p>
          <p style="margin-top: 30px;">Thank you for your business!</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Format payment terms for display
   */
  formatPaymentTerms(terms) {
    const termsMap = {
      'due_on_receipt': 'Due on Receipt',
      'net_7': 'Net 7 Days',
      'net_15': 'Net 15 Days',
      'net_30': 'Net 30 Days'
    };
    return termsMap[terms] || terms;
  }

  /**
   * Send invoice via email (would integrate with Cloud Function)
   */
  async sendInvoice(invoiceId, emailOptions = {}) {
    try {
      const sendInvoiceFunc = this.functions.httpsCallable('sendInvoice');
      const result = await sendInvoiceFunc({
        invoiceId,
        recipientEmail: emailOptions.recipientEmail,
        includeAttachment: emailOptions.includeAttachment !== false,
        customMessage: emailOptions.customMessage || ''
      });

      if (result.data.success) {
        // Update invoice status
        await this.updateInvoiceStatus(invoiceId, 'sent');
      }

      return result.data;
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw error;
    }
  }

  /**
   * Request customer review/testimonial
   */
  async requestReview(invoiceId) {
    try {
      await this.db.collection('invoices').doc(invoiceId).update({
        reviewRequested: true,
        reviewRequestedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Could trigger email/SMS via Cloud Function
      return { success: true };
    } catch (error) {
      console.error('Error requesting review:', error);
      throw error;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InvoiceGenerator;
}
