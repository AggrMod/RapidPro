/**
 * PDF Export Functionality
 * Handles PDF generation and export for Preventative Maintenance reports
 * Using jsPDF and html2canvas libraries for PDF generation
 */

// Check if required libraries are loaded
function checkRequiredLibraries() {
    if (typeof jsPDF === 'undefined') {
        console.error('jsPDF library is required for PDF generation');
        return false;
    }
    
    if (typeof html2canvas === 'undefined') {
        console.error('html2canvas library is required for PDF generation');
        return false;
    }
    
    return true;
}

/**
 * Initialize PDF export functionality for PM reports
 */
function initializePdfExport() {
    // If libraries aren't loaded, try to load them
    if (!checkRequiredLibraries()) {
        loadRequiredLibraries();
        return;
    }
    
    // Set up event listeners for PDF export buttons
    setupPdfExportButtons();
    
    console.log('PDF export functionality initialized');
}

/**
 * Load required libraries dynamically if not already available
 */
function loadRequiredLibraries() {
    // Load jsPDF if not already loaded
    if (typeof jsPDF === 'undefined') {
        const jsPdfScript = document.createElement('script');
        jsPdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        jsPdfScript.async = true;
        jsPdfScript.onload = checkAndContinueInitialization;
        document.head.appendChild(jsPdfScript);
    }
    
    // Load html2canvas if not already loaded
    if (typeof html2canvas === 'undefined') {
        const html2canvasScript = document.createElement('script');
        html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        html2canvasScript.async = true;
        html2canvasScript.onload = checkAndContinueInitialization;
        document.head.appendChild(html2canvasScript);
    }
}

/**
 * Check if all libraries are loaded and continue initialization
 */
function checkAndContinueInitialization() {
    // Wait for both libraries to be loaded
    if (typeof jsPDF !== 'undefined' && typeof html2canvas !== 'undefined') {
        setupPdfExportButtons();
    }
}

/**
 * Set up event listeners for PDF export buttons
 */
function setupPdfExportButtons() {
    // Preview PDF button
    const previewPdfBtn = document.getElementById('preview-pdf-btn');
    if (previewPdfBtn) {
        previewPdfBtn.addEventListener('click', function() {
            generatePdf(true);
        });
    }
    
    // Download PDF button
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', function() {
            generatePdf(false);
        });
    }
    
    // Add a "Print PDF" button if it exists
    const printPdfBtn = document.getElementById('print-pdf-btn');
    if (printPdfBtn) {
        printPdfBtn.addEventListener('click', function() {
            printReport();
        });
    }
}

/**
 * Generate a PDF from the report preview
 * @param {boolean} preview - Whether to preview or download the PDF
 */
function generatePdf(preview = false) {
    // Show a loading indicator
    showLoadingIndicator();
    
    // Get the report container
    const reportContainer = document.querySelector('.report-preview');
    if (!reportContainer) {
        hideLoadingIndicator();
        alert('Error: Report container not found');
        return;
    }
    
    // Get report metadata
    const businessName = getReportMetaValue('Customer') || 'Customer';
    const dateStr = getReportMetaValue('Date') || new Date().toLocaleDateString();
    
    // Create a clone of the report to avoid modifying the original
    const reportClone = reportContainer.cloneNode(true);
    
    // Apply print-specific styling to the clone
    applyPrintStyling(reportClone);
    
    // Add a temporary container for the report clone
    const tempContainer = document.createElement('div');
    tempContainer.className = 'pdf-export-container';
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '794px'; // A4 width at 96 DPI
    tempContainer.appendChild(reportClone);
    document.body.appendChild(tempContainer);
    
    // Generate PDF using html2canvas and jsPDF
    setTimeout(() => {
        // Use Promise to wait for all pages to be rendered
        const generatePages = () => {
            return html2canvas(reportClone, {
                scale: 2, // Higher resolution
                useCORS: true,
                logging: false,
                allowTaint: true
            }).then(canvas => {
                // Calculate dimensions
                const imgWidth = 210; // A4 width in mm
                const imgHeight = canvas.height * imgWidth / canvas.width;
                
                // Initialize jsPDF
                const pdf = new jsPDF('p', 'mm', 'a4');
                
                // Add the canvas as an image
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                
                // Set document properties
                pdf.setProperties({
                    title: `PM Report - ${businessName}`,
                    subject: 'Preventative Maintenance Report',
                    author: 'Rapid Pro Maintenance',
                    keywords: 'maintenance, report, inspection',
                    creator: 'Rapid Pro Maintenance System'
                });
                
                // Generate filename
                const cleanBusinessName = businessName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
                const fileName = `PM_Report_${cleanBusinessName}_${dateStr.replace(/\//g, '-')}.pdf`;
                
                // Clean up
                document.body.removeChild(tempContainer);
                hideLoadingIndicator();
                
                // Preview or download the PDF
                if (preview) {
                    previewPdf(pdf);
                } else {
                    // Download the PDF
                    pdf.save(fileName);
                }
                
                return pdf;
            }).catch(error => {
                console.error('Error generating PDF:', error);
                hideLoadingIndicator();
                alert('Error generating PDF. Please try again.');
            });
        };
        
        generatePages();
    }, 500);
}

/**
 * Print the report directly
 */
function printReport() {
    // Get the report container
    const reportContainer = document.querySelector('.report-preview');
    if (!reportContainer) {
        alert('Error: Report container not found');
        return;
    }
    
    // Create a print-specific version of the report
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    document.body.appendChild(printFrame);
    
    printFrame.onload = function() {
        // Get document from iframe
        const doc = printFrame.contentDocument || printFrame.contentWindow.document;
        
        // Write report HTML to iframe
        doc.open();
        doc.write('<html><head><title>PM Report</title>');
        
        // Add base styles
        doc.write('<style>');
        doc.write(`
            body { font-family: Arial, sans-serif; margin: 20mm; line-height: 1.5; color: #000; }
            h2, h3, h4 { margin-top: 10px; margin-bottom: 5px; }
            ul { padding-left: 20px; }
            table { width: 100%; border-collapse: collapse; }
            .report-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1f2937; padding-bottom: 10px; margin-bottom: 20px; }
            .report-section-preview { margin-bottom: 20px; }
            .report-section-preview h4 { border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .condition.excellent { color: #10b981; }
            .condition.good { color: #3b82f6; }
            .condition.attention { color: #f59e0b; }
            .priority.high { color: #ef4444; }
            .priority.medium { color: #f59e0b; }
            .priority.low { color: #3b82f6; }
            .signature-block { width: 45%; }
            .signature-line { height: 1px; background-color: #000; margin-bottom: 5px; }
            .signature-label { font-size: 12px; text-align: center; }
            .report-signatures { display: flex; justify-content: space-between; margin-top: 50px; }
            @page { size: A4; margin: 10mm; }
        `);
        doc.write('</style>');
        doc.write('</head><body>');
        
        // Clone and append report content
        const reportClone = reportContainer.cloneNode(true);
        doc.write(reportClone.outerHTML);
        
        doc.write('</body></html>');
        doc.close();
        
        // Print and remove iframe
        setTimeout(() => {
            printFrame.contentWindow.print();
            document.body.removeChild(printFrame);
        }, 500);
    };
}

/**
 * Preview the PDF in a new window or browser tab
 * @param {Object} pdf - The generated jsPDF object
 */
function previewPdf(pdf) {
    // Convert PDF to data URL
    const pdfDataUrl = pdf.output('datauristring');
    
    // Open new window with PDF viewer
    const previewWindow = window.open();
    if (!previewWindow) {
        alert('PDF preview blocked by your browser. Please allow popups and try again.');
        return;
    }
    
    // Create PDF viewer HTML
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>PM Report Preview</title>
            <style>
                body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
                .pdf-container { width: 100%; height: 100%; }
                iframe { width: 100%; height: 100%; border: none; }
            </style>
        </head>
        <body>
            <div class="pdf-container">
                <iframe src="${pdfDataUrl}"></iframe>
            </div>
        </body>
        </html>
    `);
}

/**
 * Apply print-specific styling to the report
 * @param {HTMLElement} reportElement - The report element to style
 */
function applyPrintStyling(reportElement) {
    // Ensure report fits well on PDF
    reportElement.style.padding = '0';
    reportElement.style.margin = '0';
    reportElement.style.width = '100%';
    reportElement.style.boxShadow = 'none';
    
    // Make sure text is black and background is white for printing
    reportElement.style.color = '#000000';
    reportElement.style.backgroundColor = '#ffffff';
    
    // Ensure all images and content are visible
    const images = reportElement.querySelectorAll('img');
    images.forEach(img => {
        // Ensure logo fits properly
        if (img.classList.contains('logo') || img.parentElement.classList.contains('report-logo')) {
            img.style.maxHeight = '40px';
            img.style.maxWidth = '100%';
            img.style.objectFit = 'contain';
        }
    });
    
    // Format lists and text for better print layout
    const lists = reportElement.querySelectorAll('ul, ol');
    lists.forEach(list => {
        list.style.paddingLeft = '20px';
        list.style.margin = '8px 0';
    });
    
    // Format sections for consistent printing
    const sections = reportElement.querySelectorAll('.report-section-preview');
    sections.forEach(section => {
        section.style.marginBottom = '15px';
        section.style.pageBreakInside = 'avoid';
    });
}

/**
 * Show a loading indicator while the PDF is being generated
 */
function showLoadingIndicator() {
    // Create loading overlay if it doesn't exist
    let loadingOverlay = document.getElementById('pdf-loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'pdf-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">Generating PDF...</div>
        `;
        
        // Style the overlay
        loadingOverlay.style.position = 'fixed';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.flexDirection = 'column';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.zIndex = '9999';
        loadingOverlay.style.color = 'white';
        
        // Style the spinner
        const style = document.createElement('style');
        style.textContent = `
            .loading-spinner {
                border: 5px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top: 5px solid white;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin-bottom: 10px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .loading-text {
                font-family: Arial, sans-serif;
                font-size: 16px;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(loadingOverlay);
    } else {
        loadingOverlay.style.display = 'flex';
    }
}

/**
 * Hide the loading indicator
 */
function hideLoadingIndicator() {
    const loadingOverlay = document.getElementById('pdf-loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

/**
 * Get a report metadata value by label
 * @param {string} label - The label to find (e.g., 'Customer', 'Date')
 * @returns {string} The corresponding metadata value
 */
function getReportMetaValue(label) {
    const metaItems = document.querySelectorAll('.meta-item');
    for (let i = 0; i < metaItems.length; i++) {
        const metaLabel = metaItems[i].querySelector('.meta-label');
        if (metaLabel && metaLabel.textContent.trim().replace(':', '') === label) {
            const metaValue = metaItems[i].querySelector('.meta-value');
            return metaValue ? metaValue.textContent.trim() : '';
        }
    }
    return '';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePdfExport();
});