# Rapid Pro Maintenance Website

This is a single-page responsive website for Rapid Pro Maintenance, a commercial kitchen equipment maintenance service.

## Setup Instructions

1. All files in this directory should be uploaded to your web hosting service.
2. The website uses the following directory structure:
   - index.html
   - css/styles.css
   - js/ (for future JavaScript files)
   - images/ (for image assets)

## Image Setup

The website is designed to prioritize human-focused imagery:

- **Primary Image (Recommended)**: For the best user experience, add a technician photo
  - Place an image file at `images/technician-service.jpg`
  - Show a professional technician working on commercial refrigeration equipment
  - Image should be high-quality (recommended size: at least 1600-1920px wide)
  - For best results, choose an image with good lighting and composition

- **Fallback SVG**: The site includes a built-in SVG illustration of a commercial cooler
  - Located at `images/kitchen-cooler.svg`
  - Will be used automatically if the technician image isn't found

- **Without Images**: The site has a fallback gradient design that works in all scenarios

See `images/README-images.md` for detailed image requirements.

## Image Troubleshooting

If you're having issues with image loading:

1. Make sure the `images` directory exists and has correct permissions
2. Verify that your image file is named correctly: `kitchen-cooler.jpg` or `kitchen-cooler.svg`
3. Try converting your image to a different format (JPG, PNG, or SVG)
4. Check the web server logs for any file access issues
5. For testing, you can use the included debugging file: `debug-images.html`

## Customization

- All styling is contained in the `styles.css` file
- The website uses the Inter font from Google Fonts
- The color scheme uses the following colors:
  - Background: #f5f5f5 (light gray)
  - Accent: #1f2937 (charcoal/dark slate)
  - Secondary Accent: #facc15 (yellow/gold safety hue)# RapidPro
