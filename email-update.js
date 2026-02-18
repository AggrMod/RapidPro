// Script to update email addresses across the site
// This file documents the email change from info@rapidpromaintenance.com to RapidPro.Memphis@gmail.com

const OLD_EMAIL = "info@rapidpromaintenance.com";
const NEW_EMAIL = "RapidPro.Memphis@gmail.com";

// Files that need to be updated:
// - index.html (multiple occurrences)
// - js/schema.js
// - 404.html
// - memphis-services.html
// - memphis-service-areas.html
// - memphis-testimonials.html

console.log(`Email update: ${OLD_EMAIL} -> ${NEW_EMAIL}`);
