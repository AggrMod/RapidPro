// Inject the quick-fixes.css file into all pages
document.addEventListener('DOMContentLoaded', function() {
    // Create a link element for the CSS
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'css/quick-fixes.css';
    
    // Append it to the head
    document.head.appendChild(linkElement);
    
    console.log('Quick fixes CSS has been injected');
});