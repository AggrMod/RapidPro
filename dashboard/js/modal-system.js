/**
 * Dashboard Modal System
 * Provides a consistent modal experience throughout the dashboard
 * Replaces new window/tab opening with in-page modals
 */

// Modal Manager - handles creation, opening, and closing of modals
class ModalManager {
    constructor() {
        // Create modal container if it doesn't exist
        this.modalContainer = document.getElementById('global-modal-container');
        if (!this.modalContainer) {
            this.modalContainer = document.createElement('div');
            this.modalContainer.id = 'global-modal-container';
            document.body.appendChild(this.modalContainer);
        }
        
        // Add stylesheet if not already added
        this.addModalStyles();
        
        // Track active modals
        this.activeModals = [];
        
        // Handle ESC key to close modals
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && this.activeModals.length > 0) {
                this.closeTopModal();
            }
        });
    }
    
    /**
     * Add modal styles to the document
     */
    addModalStyles() {
        if (document.getElementById('modal-system-styles')) return;
        
        const styleEl = document.createElement('style');
        styleEl.id = 'modal-system-styles';
        styleEl.textContent = `
            #global-modal-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9000;
                pointer-events: none;
            }
            
            .dashboard-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9100;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }
            
            .dashboard-modal.active {
                opacity: 1;
                pointer-events: auto;
            }
            
            .modal-dialog {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                transform: translateY(20px);
                transition: transform 0.3s ease;
                overflow: hidden;
            }
            
            .dashboard-modal.active .modal-dialog {
                transform: translateY(0);
            }
            
            .modal-header {
                padding: 15px 20px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background-color: #f9fafb;
            }
            
            .modal-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
            }
            
            .modal-close {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: background-color 0.2s ease;
            }
            
            .modal-close:hover {
                background-color: #e5e7eb;
                color: #1f2937;
            }
            
            .modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer {
                padding: 15px 20px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 10px;
                background-color: #f9fafb;
            }
            
            .modal-btn {
                padding: 8px 16px;
                border-radius: 4px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .modal-btn-primary {
                background-color: #1f2937;
                color: white;
                border: 1px solid #1f2937;
            }
            
            .modal-btn-primary:hover {
                background-color: #111827;
            }
            
            .modal-btn-secondary {
                background-color: white;
                color: #1f2937;
                border: 1px solid #d1d5db;
            }
            
            .modal-btn-secondary:hover {
                background-color: #f9fafb;
                border-color: #9ca3af;
            }
            
            .modal-fullscreen .modal-dialog {
                width: 95%;
                max-width: 1200px;
                height: 90%;
            }
            
            /* Content-specific modal styles */
            .modal-iframe-container {
                width: 100%;
                height: 100%;
                min-height: 400px;
            }
            
            .modal-iframe {
                width: 100%;
                height: 100%;
                border: none;
            }
            
            /* Responsive adjustments */
            @media (max-width: 767px) {
                .modal-dialog {
                    width: 95%;
                }
                
                .modal-header, .modal-footer, .modal-body {
                    padding: 12px 15px;
                }
                
                .modal-fullscreen .modal-dialog {
                    width: 100%;
                    height: 100%;
                    max-height: 100%;
                    border-radius: 0;
                }
            }
        `;
        
        document.head.appendChild(styleEl);
    }
    
    /**
     * Create a new modal
     * @param {Object} options - Modal options
     * @returns {HTMLElement} The modal element
     */
    createModal(options = {}) {
        const {
            title = 'Modal',
            content = '',
            size = 'default',
            showFooter = true,
            closeButton = true,
            buttons = [],
            onClose = null
        } = options;
        
        // Create modal element
        const modal = document.createElement('div');
        modal.className = `dashboard-modal ${size === 'fullscreen' ? 'modal-fullscreen' : ''}`;
        modal.id = 'modal-' + Date.now();
        
        // Create modal content
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    ${closeButton ? `
                        <button class="modal-close" aria-label="Close modal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    ` : ''}
                </div>
                <div class="modal-body">${typeof content === 'string' ? content : ''}</div>
                ${showFooter ? `
                    <div class="modal-footer">
                        ${buttons.map(btn => `
                            <button class="modal-btn modal-btn-${btn.type || 'secondary'}" data-action="${btn.action || ''}">${btn.text}</button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Append modal to container
        this.modalContainer.appendChild(modal);
        
        // If content is an element, append it to the body
        if (content instanceof HTMLElement) {
            modal.querySelector('.modal-body').appendChild(content);
        }
        
        // Setup close button event
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal(modal.id);
                if (onClose && typeof onClose === 'function') {
                    onClose();
                }
            });
        }
        
        // Setup footer button events
        const footerBtns = modal.querySelectorAll('.modal-footer .modal-btn');
        footerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                if (action === 'close') {
                    this.closeModal(modal.id);
                    if (onClose && typeof onClose === 'function') {
                        onClose();
                    }
                } else if (buttons) {
                    const buttonConfig = buttons.find(b => b.action === action);
                    if (buttonConfig && buttonConfig.onClick) {
                        buttonConfig.onClick(modal);
                    }
                }
            });
        });
        
        // Enable closing by clicking the backdrop
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal.id);
                if (onClose && typeof onClose === 'function') {
                    onClose();
                }
            }
        });
        
        return modal;
    }
    
    /**
     * Open a modal
     * @param {string} modalId - The ID of the modal to open
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Add to active modals
        this.activeModals.push(modalId);
        
        // Show the modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }
    
    /**
     * Close a modal
     * @param {string} modalId - The ID of the modal to close
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Remove from active modals
        this.activeModals = this.activeModals.filter(id => id !== modalId);
        
        // Hide the modal
        modal.classList.remove('active');
        
        // Remove after animation completes
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
    
    /**
     * Close the top-most modal
     */
    closeTopModal() {
        if (this.activeModals.length > 0) {
            this.closeModal(this.activeModals[this.activeModals.length - 1]);
        }
    }
    
    /**
     * Create and open a modal to display content in an iframe
     * @param {string} title - Modal title
     * @param {string} url - URL to load in the iframe
     * @param {Object} options - Additional modal options
     * @returns {string} The ID of the created modal
     */
    openIframeModal(title, url, options = {}) {
        // Create iframe element
        const iframe = document.createElement('iframe');
        iframe.className = 'modal-iframe';
        iframe.src = url;
        iframe.setAttribute('allowfullscreen', 'true');
        
        // Create iframe container
        const iframeContainer = document.createElement('div');
        iframeContainer.className = 'modal-iframe-container';
        iframeContainer.appendChild(iframe);
        
        // Create the modal
        const modal = this.createModal({
            title,
            content: iframeContainer,
            size: options.size || 'fullscreen',
            showFooter: options.showFooter !== undefined ? options.showFooter : false,
            closeButton: options.closeButton !== undefined ? options.closeButton : true,
            buttons: options.buttons || [],
            onClose: options.onClose || null
        });
        
        // Open the modal
        this.openModal(modal.id);
        
        return modal.id;
    }
    
    /**
     * Create and open a modal to display HTML content
     * @param {string} title - Modal title
     * @param {string|HTMLElement} content - HTML content or element
     * @param {Object} options - Additional modal options
     * @returns {string} The ID of the created modal
     */
    openHtmlModal(title, content, options = {}) {
        // Create the modal
        const modal = this.createModal({
            title,
            content,
            size: options.size || 'default',
            showFooter: options.showFooter !== undefined ? options.showFooter : true,
            closeButton: options.closeButton !== undefined ? options.closeButton : true,
            buttons: options.buttons || [
                { text: 'Close', action: 'close', type: 'secondary' }
            ],
            onClose: options.onClose || null
        });
        
        // Open the modal
        this.openModal(modal.id);
        
        return modal.id;
    }
    
    /**
     * Create and open a PDF preview modal
     * @param {jsPDF|Blob|string} pdfContent - PDF content (jsPDF object, Blob, or data URL)
     * @param {string} title - Modal title
     * @param {Object} options - Additional modal options
     * @returns {string} The ID of the created modal
     */
    openPdfPreviewModal(pdfContent, title = 'PDF Preview', options = {}) {
        // Convert jsPDF to data URL if needed
        let pdfUrl = pdfContent;
        if (typeof pdfContent === 'object' && pdfContent.output) {
            pdfUrl = pdfContent.output('datauristring');
        } else if (pdfContent instanceof Blob) {
            pdfUrl = URL.createObjectURL(pdfContent);
        }
        
        // Add download button if not provided
        let buttons = options.buttons || [];
        if (!buttons.find(b => b.action === 'download')) {
            buttons.push({
                text: 'Download',
                action: 'download',
                type: 'primary',
                onClick: () => {
                    // Create temporary link and trigger download
                    const link = document.createElement('a');
                    link.href = pdfUrl;
                    link.download = options.filename || 'document.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            });
        }
        
        // Add close button if not already present
        if (!buttons.find(b => b.action === 'close')) {
            buttons.push({ text: 'Close', action: 'close', type: 'secondary' });
        }
        
        // Open as iframe modal
        return this.openIframeModal(title, pdfUrl, {
            ...options,
            showFooter: true,
            buttons
        });
    }
    
    /**
     * Create and open a confirmation modal
     * @param {string} title - Modal title
     * @param {string} message - Confirmation message
     * @param {Function} onConfirm - Function to call when confirmed
     * @param {Object} options - Additional modal options
     * @returns {string} The ID of the created modal
     */
    openConfirmModal(title, message, onConfirm, options = {}) {
        // Set up buttons
        const buttons = [
            {
                text: options.confirmText || 'Confirm',
                action: 'confirm',
                type: 'primary',
                onClick: (modal) => {
                    if (onConfirm && typeof onConfirm === 'function') {
                        onConfirm();
                    }
                    this.closeModal(modal.id);
                }
            },
            {
                text: options.cancelText || 'Cancel',
                action: 'close',
                type: 'secondary'
            }
        ];
        
        // Create content element
        const content = document.createElement('div');
        content.className = 'confirm-modal-content';
        content.innerHTML = `<p>${message}</p>`;
        
        // Open HTML modal
        return this.openHtmlModal(title, content, {
            ...options,
            buttons
        });
    }
}

// Initialize modal manager
window.modalManager = window.modalManager || new ModalManager();

/**
 * Override PDF preview function to use modal instead of new window
 */
document.addEventListener('DOMContentLoaded', function() {
    // Override preview function if it exists
    if (typeof window.previewPdf === 'function') {
        const originalPreviewPdf = window.previewPdf;
        window.previewPdf = function(pdf) {
            // Use modal manager to open PDF preview
            window.modalManager.openPdfPreviewModal(
                pdf, 
                'PM Report Preview',
                { size: 'fullscreen' }
            );
        };
    }
    
    // Convert any "open in new window" buttons to use modals
    const convertToModalLinks = () => {
        const links = document.querySelectorAll('a[target="_blank"], button[data-action="open-new-window"]');
        links.forEach(link => {
            // Skip if already converted
            if (link.getAttribute('data-modal-converted')) return;
            
            // Mark as converted
            link.setAttribute('data-modal-converted', 'true');
            
            // Get URL and title
            let url = link.href || link.getAttribute('data-url');
            let title = link.getAttribute('data-title') || link.textContent.trim() || 'Details';
            
            // Skip if no URL
            if (!url) return;
            
            // Prevent default and open modal instead
            link.addEventListener('click', function(e) {
                e.preventDefault();
                window.modalManager.openIframeModal(title, url);
            });
        });
    };
    
    // Run conversion initially
    convertToModalLinks();
    
    // Set up mutation observer to convert new links
    const observer = new MutationObserver(mutations => {
        let shouldConvert = false;
        
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                shouldConvert = true;
            }
        });
        
        if (shouldConvert) {
            convertToModalLinks();
        }
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['href', 'data-url', 'target']
    });
});