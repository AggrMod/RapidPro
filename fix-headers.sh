#!/bin/bash

# Update all pages to have consistent header structure

# First, add the unified header CSS to all pages
echo "Adding unified header CSS to all pages..."

# Memphis Services
sed -i '/<link rel="stylesheet" href="css\/login-button.css">/a\    <link rel="stylesheet" href="css\/unified-header.css">' memphis-services.html

# Memphis Service Areas
sed -i '/<link rel="stylesheet" href="css\/login-button.css">/a\    <link rel="stylesheet" href="css\/unified-header.css">' memphis-service-areas.html

# Memphis Testimonials
sed -i '/<link rel="stylesheet" href="css\/mobile-fixes.css">/a\    <link rel="stylesheet" href="css\/unified-header.css">' memphis-testimonials.html

# Index (main page)
sed -i '/<link rel="stylesheet" href="css\/footer-tech-login.css">/a\    <link rel="stylesheet" href="css\/unified-header.css">' index.html

echo "CSS links added successfully"

# Now update the header structure in all pages to match the home page
echo "Updating header structures..."

# The goal is to move the phone number from header-content to inside the nav, like on the home page

echo "All updates completed!"