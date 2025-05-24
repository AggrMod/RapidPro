/**
 * PDF Export Extensions
 * Additional functionality for the PDF export system
 */

// Extend the PDF export functionality with advanced features
document.addEventListener('DOMContentLoaded', function() {
    // Add QR code to PDF
    enhancePdfWithQrCode();
    
    // Add export format options
    addExportFormatOptions();
    
    // Add table of contents support
    enableTableOfContents();
    
    // Add branded header customization
    enableHeaderCustomization();
    
    // Add syntax highlighting for code snippets
    enableSyntaxHighlighting();
    
    console.log('PDF export extensions initialized');
});

/**
 * Enable QR code generation in PDFs
 */
function enhancePdfWithQrCode() {
    // Load QR code library if needed
    if (typeof QRCode === 'undefined') {
        const qrCodeScript = document.createElement('script');
        qrCodeScript.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js';
        qrCodeScript.async = true;
        document.head.appendChild(qrCodeScript);
    }
    
    // Extend the original PDF generation function
    const originalGeneratePdf = window.generatePdf;
    if (typeof originalGeneratePdf === 'function') {
        window.generatePdf = function(preview = false) {
            // First add the QR code element to the report
            addQrCodeToReport();
            
            // Then call the original function
            return originalGeneratePdf(preview);
        };
    }
}

/**
 * Add a QR code to the report
 */
function addQrCodeToReport() {
    const reportContainer = document.querySelector('.report-preview');
    if (!reportContainer) return;
    
    // Check if QR code container already exists
    let qrContainer = reportContainer.querySelector('.qr-code-container');
    if (!qrContainer) {
        // Create QR code container
        qrContainer = document.createElement('div');
        qrContainer.className = 'qr-code-container';
        qrContainer.style.textAlign = 'center';
        qrContainer.style.marginTop = '20px';
        
        // Add QR code title
        const qrTitle = document.createElement('p');
        qrTitle.textContent = 'Scan for Digital Verification';
        qrTitle.style.fontSize = '12px';
        qrTitle.style.marginBottom = '5px';
        qrContainer.appendChild(qrTitle);
        
        // Add QR code element
        const qrElement = document.createElement('div');
        qrElement.id = 'report-qr-code';
        qrElement.style.width = '100px';
        qrElement.style.height = '100px';
        qrElement.style.margin = '0 auto';
        qrContainer.appendChild(qrElement);
        
        // Add verification ID
        const verificationId = document.createElement('p');
        verificationId.textContent = `Verification ID: ${generateVerificationId()}`;
        verificationId.style.fontSize = '10px';
        verificationId.style.marginTop = '5px';
        qrContainer.appendChild(verificationId);
        
        // Add to report (before signatures if they exist)
        const signatures = reportContainer.querySelector('.report-signatures');
        if (signatures) {
            reportContainer.insertBefore(qrContainer, signatures);
        } else {
            reportContainer.appendChild(qrContainer);
        }
    }
    
    // Generate the QR code if library is loaded
    setTimeout(() => {
        if (typeof QRCode !== 'undefined' && document.getElementById('report-qr-code')) {
            try {
                // Clear existing QR code
                document.getElementById('report-qr-code').innerHTML = '';
                
                // Generate verification URL
                const reportId = generateReportId();
                const verificationUrl = `https://rapidpromaintenance.com/verify?id=${reportId}`;
                
                // Generate QR code
                new QRCode(document.getElementById('report-qr-code'), {
                    text: verificationUrl,
                    width: 100,
                    height: 100,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });
            } catch (error) {
                console.error('Error generating QR code:', error);
            }
        }
    }, 500);
}

/**
 * Generate a random verification ID
 * @returns {string} A verification ID
 */
function generateVerificationId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `RPM-${id}`;
}

/**
 * Generate a unique report ID
 * @returns {string} A unique report ID
 */
function generateReportId() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return `${timestamp}-${random}`;
}

/**
 * Add export format options to the PDF export functionality
 */
function addExportFormatOptions() {
    // Look for export options container
    const exportOptions = document.querySelector('.export-options');
    if (!exportOptions) return;
    
    // Create a format selector
    const formatSelector = document.createElement('div');
    formatSelector.className = 'format-selector';
    formatSelector.innerHTML = `
        <label for="export-format">Export Format:</label>
        <select id="export-format" class="form-control">
            <option value="pdf" selected>PDF Document</option>
            <option value="pdf-expanded">PDF (Expanded Details)</option>
            <option value="html">HTML (Coming Soon)</option>
            <option value="markdown">Markdown (Coming Soon)</option>
            <option value="word">Word (Coming Soon)</option>
        </select>
    `;
    
    // Add export options
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'export-config';
    optionsContainer.innerHTML = `
        <div class="export-options-title">Export Options:</div>
        <div class="export-option">
            <input type="checkbox" id="export-include-code" checked>
            <label for="export-include-code">Include Code Snippets</label>
        </div>
        <div class="export-option">
            <input type="checkbox" id="export-include-images" checked>
            <label for="export-include-images">Include Images</label>
        </div>
        <div class="export-option">
            <input type="checkbox" id="export-include-toc" checked>
            <label for="export-include-toc">Include Table of Contents</label>
        </div>
    `;
    
    // Insert before the action buttons
    const actionButtons = exportOptions.querySelector('.export-actions');
    if (actionButtons) {
        exportOptions.insertBefore(formatSelector, actionButtons);
        exportOptions.insertBefore(optionsContainer, actionButtons);
    } else {
        exportOptions.appendChild(formatSelector);
        exportOptions.appendChild(optionsContainer);
    }
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .format-selector {
            margin-bottom: 15px;
        }
        .format-selector label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        .export-config {
            margin-bottom: 15px;
            padding: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            background-color: #f9fafb;
        }
        .export-options-title {
            font-weight: 500;
            margin-bottom: 8px;
        }
        .export-option {
            margin-bottom: 5px;
        }
        .export-option label {
            margin-left: 5px;
        }
    `;
    document.head.appendChild(style);
    
    // Add event listener for format change
    const formatSelect = document.getElementById('export-format');
    if (formatSelect) {
        formatSelect.addEventListener('change', function() {
            const format = this.value;
            const comingSoonFormats = ['html', 'markdown', 'word'];
            
            if (comingSoonFormats.includes(format)) {
                alert('This export format will be available in an upcoming update.');
                this.value = 'pdf';
            }
        });
    }
}

/**
 * Enable table of contents generation for PDFs
 */
function enableTableOfContents() {
    // Check if the include TOC checkbox is checked when generating PDF
    const originalGeneratePdf = window.generatePdf;
    if (typeof originalGeneratePdf === 'function') {
        window.generatePdf = function(preview = false) {
            // Add table of contents if option is checked
            const includeToc = document.getElementById('export-include-toc');
            if (includeToc && includeToc.checked) {
                addTableOfContents();
            }
            
            // Call the original function
            return originalGeneratePdf(preview);
        };
    }
}

/**
 * Add a table of contents to the report
 */
function addTableOfContents() {
    const reportContainer = document.querySelector('.report-preview');
    if (!reportContainer) return;
    
    // Get all section headings
    const sections = reportContainer.querySelectorAll('.report-section-preview h3, .report-section-preview h4');
    if (sections.length === 0) return;
    
    // Check if TOC already exists
    let tocContainer = reportContainer.querySelector('.toc-container');
    if (tocContainer) {
        tocContainer.remove();
    }
    
    // Create TOC container
    tocContainer = document.createElement('div');
    tocContainer.className = 'toc-container';
    tocContainer.style.marginBottom = '20px';
    tocContainer.style.pageBreakAfter = 'always';
    
    // Add TOC title
    const tocTitle = document.createElement('h3');
    tocTitle.textContent = 'Table of Contents';
    tocTitle.style.borderBottom = '1px solid #e5e7eb';
    tocTitle.style.paddingBottom = '5px';
    tocTitle.style.marginBottom = '10px';
    tocContainer.appendChild(tocTitle);
    
    // Create TOC list
    const tocList = document.createElement('ul');
    tocList.style.listStyleType = 'none';
    tocList.style.padding = '0';
    tocList.style.margin = '0';
    
    // Add each section to the TOC
    sections.forEach((section, index) => {
        // Add an ID to the section if it doesn't have one
        if (!section.id) {
            section.id = `section-${index}`;
        }
        
        // Create TOC item
        const tocItem = document.createElement('li');
        tocItem.style.margin = '5px 0';
        tocItem.style.paddingLeft = section.tagName === 'H4' ? '20px' : '0';
        tocItem.style.fontSize = section.tagName === 'H4' ? '14px' : '16px';
        
        // Create link to section
        const tocLink = document.createElement('a');
        tocLink.href = `#${section.id}`;
        tocLink.textContent = section.textContent;
        tocLink.style.textDecoration = 'none';
        tocLink.style.color = '#000';
        
        // Add page number (dummy for now, will be replaced in PDF)
        const pageNumber = document.createElement('span');
        pageNumber.className = 'toc-page';
        pageNumber.textContent = '•••';
        pageNumber.style.float = 'right';
        
        tocItem.appendChild(tocLink);
        tocItem.appendChild(pageNumber);
        tocList.appendChild(tocItem);
    });
    
    tocContainer.appendChild(tocList);
    
    // Insert TOC at the beginning of the report
    const firstChild = reportContainer.firstChild;
    reportContainer.insertBefore(tocContainer, firstChild);
}

/**
 * Enable branded header customization for PDFs
 */
function enableHeaderCustomization() {
    // Look for header customization options
    const headerOptions = document.querySelector('.header-options');
    if (!headerOptions) {
        // Create header options if they don't exist
        createHeaderOptions();
    }
    
    // Modify the existing report header or create a new one
    customizeReportHeader();
}

/**
 * Create header customization options
 */
function createHeaderOptions() {
    // Find a good place to add the header options
    const exportOptions = document.querySelector('.export-options');
    if (!exportOptions) return;
    
    // Create header options container
    const headerOptions = document.createElement('div');
    headerOptions.className = 'header-options';
    headerOptions.innerHTML = `
        <div class="header-options-title">Header Options:</div>
        <div class="header-option">
            <label for="header-title">Report Title:</label>
            <input type="text" id="header-title" class="form-control" value="Preventative Maintenance Report">
        </div>
        <div class="header-option">
            <label for="header-color">Header Color:</label>
            <input type="color" id="header-color" class="form-control" value="#1f2937">
        </div>
        <div class="header-option">
            <input type="checkbox" id="include-logo" checked>
            <label for="include-logo">Include Company Logo</label>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .header-options {
            margin-bottom: 15px;
            padding: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            background-color: #f9fafb;
        }
        .header-options-title {
            font-weight: 500;
            margin-bottom: 8px;
        }
        .header-option {
            margin-bottom: 10px;
        }
        .header-option label {
            margin-bottom: 5px;
            display: inline-block;
        }
        .header-option input[type="text"] {
            width: 100%;
            padding: 5px;
            border: 1px solid #d1d5db;
            border-radius: 3px;
        }
    `;
    document.head.appendChild(style);
    
    // Insert before the format selector
    const formatSelector = exportOptions.querySelector('.format-selector');
    if (formatSelector) {
        exportOptions.insertBefore(headerOptions, formatSelector);
    } else {
        exportOptions.appendChild(headerOptions);
    }
    
    // Add event listeners for header options
    const headerTitle = document.getElementById('header-title');
    const headerColor = document.getElementById('header-color');
    const includeLogo = document.getElementById('include-logo');
    
    if (headerTitle) {
        headerTitle.addEventListener('change', customizeReportHeader);
    }
    
    if (headerColor) {
        headerColor.addEventListener('change', customizeReportHeader);
    }
    
    if (includeLogo) {
        includeLogo.addEventListener('change', customizeReportHeader);
    }
}

/**
 * Customize the report header based on user selections
 */
function customizeReportHeader() {
    // Get the report header
    const reportContainer = document.querySelector('.report-preview');
    if (!reportContainer) return;
    
    let reportHeader = reportContainer.querySelector('.report-header');
    
    // Get header options
    const headerTitle = document.getElementById('header-title');
    const headerColor = document.getElementById('header-color');
    const includeLogo = document.getElementById('include-logo');
    
    // If header exists, update it
    if (reportHeader) {
        // Update title if option exists
        if (headerTitle) {
            const titleElement = reportHeader.querySelector('h2');
            if (titleElement) {
                titleElement.textContent = headerTitle.value;
            }
        }
        
        // Update color if option exists
        if (headerColor) {
            reportHeader.style.borderBottomColor = headerColor.value;
            
            // Update heading color too
            const titleElement = reportHeader.querySelector('h2');
            if (titleElement) {
                titleElement.style.color = headerColor.value;
            }
        }
        
        // Update logo visibility if option exists
        if (includeLogo) {
            const logoContainer = reportHeader.querySelector('.report-logo');
            if (logoContainer) {
                logoContainer.style.display = includeLogo.checked ? 'block' : 'none';
            }
        }
    }
}

/**
 * Enable syntax highlighting for code snippets in PDFs
 */
function enableSyntaxHighlighting() {
    // Load highlight.js if needed
    if (typeof hljs === 'undefined') {
        // Load the library
        const highlightScript = document.createElement('script');
        highlightScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js';
        highlightScript.async = true;
        document.head.appendChild(highlightScript);
        
        // Load the stylesheet
        const highlightCss = document.createElement('link');
        highlightCss.rel = 'stylesheet';
        highlightCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css';
        document.head.appendChild(highlightCss);
        
        // Initialize once loaded
        highlightScript.onload = function() {
            applyCodeHighlighting();
        };
    } else {
        applyCodeHighlighting();
    }
}

/**
 * Apply syntax highlighting to code snippets
 */
function applyCodeHighlighting() {
    if (typeof hljs === 'undefined') return;
    
    // Find code elements
    const codeElements = document.querySelectorAll('pre code');
    
    // Initialize highlighting
    codeElements.forEach(block => {
        hljs.highlightElement(block);
    });
}