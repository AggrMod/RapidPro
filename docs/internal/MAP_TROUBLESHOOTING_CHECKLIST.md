# 🗺️ RapidPro Memphis Map Troubleshooting Checklist

## Browser Console Checks (F12)

### 1. **Check for JavaScript Errors**
- [ ] Open browser console (F12)
- [ ] Look for red error messages
- [ ] Check if there are any CSP (Content Security Policy) errors
- [ ] Verify no "blocked by CORS" errors
- [ ] Check for "Failed to load resource" errors
- [ ] Look for "Uncaught ReferenceError" messages
- [ ] Check for "Uncaught TypeError" messages

### 2. **Map Container Checks**
- [ ] Verify `<div id="map">` element exists in HTML
- [ ] Check if map container has height set in CSS
- [ ] Confirm map container has width set in CSS
- [ ] Check if map container is visible (not display:none)
- [ ] Verify map container is not hidden by parent element
- [ ] Check z-index of map container
- [ ] Verify no overlapping elements blocking map

### 3. **Leaflet Library Loading**
- [ ] Check if Leaflet CSS is loaded (Network tab)
- [ ] Verify Leaflet JS is loaded (Network tab)
- [ ] Check Leaflet version in console: `L.version`
- [ ] Verify no 404 errors for Leaflet files
- [ ] Check if CDN is accessible (try URL in browser)
- [ ] Verify Leaflet object exists: `typeof L !== 'undefined'`
- [ ] Check if L.map is a function: `typeof L.map === 'function'`

### 4. **Firebase Connection**
- [ ] Verify Firebase is initialized: `firebase.apps.length > 0`
- [ ] Check Firestore connection: `db` object exists
- [ ] Verify Firebase config is correct
- [ ] Check if user is authenticated
- [ ] Test Firestore query manually in console
- [ ] Verify API keys are correct
- [ ] Check Firebase project ID matches

### 5. **Map Initialization**
- [ ] Check if `initMap()` function is called
- [ ] Verify `initMap()` runs without errors
- [ ] Check if `L.map('map')` executes successfully
- [ ] Verify map center coordinates are valid
- [ ] Check zoom level is reasonable (10-15)
- [ ] Confirm tile layer is added to map
- [ ] Verify tile URLs are loading (Network tab)

### 6. **Location Data Loading**
- [ ] Check console for "Loading locations..." message
- [ ] Verify "Loaded X locations" appears
- [ ] Check if Firestore query returns data
- [ ] Verify locations have `lat` and `lng` fields
- [ ] Check if coordinates are valid numbers
- [ ] Confirm coordinates are in Memphis area (lat ~35, lng ~-90)
- [ ] Verify location data structure matches code expectations

### 7. **Marker Creation**
- [ ] Check if markers are being created in loop
- [ ] Verify marker icons are defined (pendingIcon, completedIcon)
- [ ] Check if `L.marker()` is called for each location
- [ ] Verify markers are added to map with `.addTo(map)`
- [ ] Check if marker array/object is populated
- [ ] Verify no errors during marker creation
- [ ] Check if popups are bound to markers

### 8. **CSS Issues**
- [ ] Verify map container has CSS class: `.leaflet-container`
- [ ] Check if map height is set (e.g., `height: 600px`)
- [ ] Confirm no `display: none` on map or parents
- [ ] Verify no `visibility: hidden` on map
- [ ] Check if `position: relative` or `absolute` is needed
- [ ] Verify no CSS conflicts overriding map styles
- [ ] Check if Leaflet CSS is not being blocked

### 9. **Tile Layer Loading**
- [ ] Verify OpenStreetMap tile URLs work in browser
- [ ] Check Network tab for tile requests (should see many)
- [ ] Look for 403/404 errors on tile requests
- [ ] Verify attribution text appears
- [ ] Check if tiles are being blocked by CSP
- [ ] Try alternative tile provider (Mapbox, CartoDB)
- [ ] Verify maxZoom setting is reasonable

### 10. **Map Container Visibility**
- [ ] Check if dashboard screen is active (not login screen)
- [ ] Verify user is logged in
- [ ] Check if map section is visible on page
- [ ] Verify scroll position doesn't hide map
- [ ] Check if map is in a collapsed/hidden section
- [ ] Verify no parent elements have `overflow: hidden`
- [ ] Check viewport size is sufficient

## Specific File Checks

### 11. **public/index.html**
- [ ] Verify `<div id="map"></div>` exists
- [ ] Check Leaflet CSS link is correct
- [ ] Verify Leaflet JS script is loaded
- [ ] Check script loading order (Firebase before map.js)
- [ ] Verify no typos in element IDs
- [ ] Check if map is in correct screen div
- [ ] Verify HTML structure is valid

### 12. **public/js/config.js**
- [ ] Verify Firebase config object is complete
- [ ] Check apiKey is correct
- [ ] Verify authDomain matches project
- [ ] Check projectId matches Firebase project
- [ ] Verify storageBucket is correct
- [ ] Check messagingSenderId is correct
- [ ] Verify appId is correct

### 13. **public/js/map.js**
- [ ] Verify `initMap()` function is defined
- [ ] Check `loadLocations()` function is defined
- [ ] Verify map variable is global
- [ ] Check icon definitions are correct
- [ ] Verify event listeners are attached
- [ ] Check for syntax errors
- [ ] Verify function calls are in correct order

### 14. **public/css/style.css**
- [ ] Check `#map` selector exists
- [ ] Verify height is set (e.g., `height: 600px`)
- [ ] Check width is set (e.g., `width: 100%`)
- [ ] Verify no conflicting styles
- [ ] Check border or background for debugging
- [ ] Verify no `display: none` or `visibility: hidden`

## Firebase/Firestore Checks

### 15. **Firestore Database**
- [ ] Open Firebase Console
- [ ] Navigate to Firestore Database
- [ ] Verify `locations` collection exists
- [ ] Check if collection has documents
- [ ] Verify document structure has `lat`, `lng`, `name`, `address`
- [ ] Check if coordinates are numbers (not strings)
- [ ] Verify status field exists ('pending' or 'completed')

### 16. **Firestore Rules**
- [ ] Check Firestore security rules allow read
- [ ] Verify user authentication is working
- [ ] Test rules in Firebase Console simulator
- [ ] Check if rules are too restrictive
- [ ] Verify timestamp-based rules aren't blocking access
- [ ] Check if email verification is required but not met

### 17. **Firebase Authentication**
- [ ] Verify user is logged in
- [ ] Check Firebase Auth in console
- [ ] Verify email/password provider is enabled
- [ ] Check if user session is active
- [ ] Verify auth state listener is working
- [ ] Check if user object is available in code

## Network & Deployment Checks

### 18. **Firebase Hosting**
- [ ] Verify site is deployed to Firebase Hosting
- [ ] Check if latest code is deployed
- [ ] Run `firebase deploy --only hosting` recently
- [ ] Verify deployment completed successfully
- [ ] Check if cache is cleared (hard refresh)
- [ ] Verify CDN has propagated changes

### 19. **Content Security Policy**
- [ ] Check CSP headers in Network tab
- [ ] Verify `'unsafe-eval'` is in script-src
- [ ] Check if external scripts are allowed
- [ ] Verify Leaflet CDN is whitelisted
- [ ] Check if inline styles are allowed
- [ ] Verify blob: and data: are allowed for images

### 20. **Network Requests**
- [ ] Open Network tab in DevTools
- [ ] Check if Leaflet CSS loads (200 status)
- [ ] Verify Leaflet JS loads (200 status)
- [ ] Check if tile images load (200 status)
- [ ] Verify Firebase SDK loads
- [ ] Check if Firestore queries complete
- [ ] Look for any failed requests (red)

## Code Execution Order

### 21. **Script Loading Sequence**
- [ ] Firebase SDK loads first
- [ ] Firebase config.js loads second
- [ ] Leaflet library loads before map.js
- [ ] map.js loads before initialization
- [ ] DOM is ready before init
- [ ] Check for race conditions
- [ ] Verify async/await is handled correctly

### 22. **Initialization Timing**
- [ ] Check if `initMap()` is called on page load
- [ ] Verify map initializes after DOM ready
- [ ] Check if Firebase initializes before map
- [ ] Verify auth state is checked before loading data
- [ ] Check if `loadLocations()` is called after init
- [ ] Verify no premature function calls

## Debugging Steps

### 23. **Console Logging**
- [ ] Add `console.log('Map init started')` in initMap()
- [ ] Log map object after creation: `console.log(map)`
- [ ] Log location data: `console.log(locations)`
- [ ] Log marker creation: `console.log('Marker created', marker)`
- [ ] Check if logs appear in expected order
- [ ] Verify data structures match expectations

### 24. **Manual Testing**
- [ ] Open browser console
- [ ] Run `initMap()` manually
- [ ] Check if error is thrown
- [ ] Try creating map manually: `L.map('map').setView([35.1495, -90.0490], 12)`
- [ ] Test tile layer manually
- [ ] Try adding a test marker
- [ ] Check if map appears after manual init

### 25. **Simplified Test**
- [ ] Create minimal HTML page with just map
- [ ] Use only Leaflet, no Firebase
- [ ] Add hardcoded markers
- [ ] Verify map works in isolation
- [ ] Gradually add complexity back
- [ ] Identify where it breaks

## Browser-Specific Checks

### 26. **Browser Compatibility**
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Edge
- [ ] Test in Safari (if Mac available)
- [ ] Check mobile browser
- [ ] Verify browser version is recent
- [ ] Check for browser-specific console errors

### 27. **Browser Settings**
- [ ] Verify JavaScript is enabled
- [ ] Check if ad blockers are blocking resources
- [ ] Verify browser extensions aren't interfering
- [ ] Check if private/incognito mode works
- [ ] Clear browser cache completely
- [ ] Disable all extensions temporarily

## Performance & Resources

### 28. **Memory & Performance**
- [ ] Check if browser is out of memory
- [ ] Verify no infinite loops in code
- [ ] Check if too many markers (>1000)
- [ ] Verify images/tiles are loading efficiently
- [ ] Check browser performance tab
- [ ] Look for memory leaks

### 29. **File Paths & URLs**
- [ ] Verify all script src paths are correct
- [ ] Check CSS href paths
- [ ] Verify CDN URLs are complete (https://)
- [ ] Check for typos in file paths
- [ ] Verify case sensitivity in paths
- [ ] Check if files exist at specified paths

## Specific Error Messages

### 30. **Common Leaflet Errors**
- [ ] "Map container not found" - check div ID
- [ ] "Map container has zero height" - add CSS height
- [ ] "Invalid LatLng object" - check coordinate format
- [ ] "Cannot read property of undefined" - check object exists
- [ ] "Tile loading error" - check tile URL
- [ ] "Attribution prefix undefined" - Leaflet version issue

### 31. **Firebase Errors**
- [ ] "Permission denied" - check Firestore rules
- [ ] "User not authenticated" - verify login
- [ ] "Collection not found" - check collection name
- [ ] "Invalid API key" - verify Firebase config
- [ ] "Quota exceeded" - check Firebase usage
- [ ] "Network request failed" - check internet connection

## Advanced Debugging

### 32. **Breakpoint Debugging**
- [ ] Set breakpoint in initMap()
- [ ] Step through code line by line
- [ ] Watch variables during execution
- [ ] Check call stack
- [ ] Verify execution reaches marker creation
- [ ] Check if loops execute correctly

### 33. **Network Throttling**
- [ ] Test with slow 3G
- [ ] Check if resources timeout
- [ ] Verify progressive loading works
- [ ] Test offline behavior
- [ ] Check service worker cache

### 34. **Mobile Debugging**
- [ ] Use Chrome remote debugging
- [ ] Check mobile viewport
- [ ] Verify touch events work
- [ ] Test different screen sizes
- [ ] Check mobile console for errors

## Configuration Files

### 35. **firebase.json**
- [ ] Verify hosting config is correct
- [ ] Check public directory is set to "." or "public"
- [ ] Verify CSP headers are set
- [ ] Check rewrites are correct
- [ ] Verify ignore patterns don't exclude needed files

### 36. **.firebaserc**
- [ ] Verify project ID is correct
- [ ] Check default project is set
- [ ] Verify project exists in Firebase Console

## Data Validation

### 37. **Location Data Structure**
- [ ] Each location has `lat` field (number)
- [ ] Each location has `lng` field (number)
- [ ] Each location has `name` field (string)
- [ ] Each location has `address` field (string)
- [ ] Each location has `status` field ('pending' or 'completed')
- [ ] No null or undefined values
- [ ] Coordinates are within valid range (-90 to 90 lat, -180 to 180 lng)

### 38. **Data Type Checks**
- [ ] Latitude is typeof 'number'
- [ ] Longitude is typeof 'number'
- [ ] Name is typeof 'string'
- [ ] Status is typeof 'string'
- [ ] No string coordinates like "35.1495"
- [ ] No array coordinates like [35, -90]

## Visual Debugging

### 39. **Add Debug Borders**
- [ ] Add `border: 2px solid red` to #map
- [ ] Check if map container is visible
- [ ] Verify container size is correct
- [ ] Check position on page

### 40. **Background Color**
- [ ] Set map background to bright color
- [ ] Verify color shows (container exists)
- [ ] Check if tiles overlay background

## Function Call Verification

### 41. **Call Stack**
- [ ] Verify initMap() is called
- [ ] Check loadLocations() is called
- [ ] Verify markers are created in loop
- [ ] Check if event listeners fire
- [ ] Verify callbacks execute

### 42. **Async Operations**
- [ ] Check if promises resolve
- [ ] Verify async/await syntax is correct
- [ ] Check for unhandled promise rejections
- [ ] Verify .then() chains complete
- [ ] Check if async functions return values

## Environment Checks

### 43. **Local vs Production**
- [ ] Test on localhost
- [ ] Test on live Firebase Hosting URL
- [ ] Check if behavior differs
- [ ] Verify environment variables are set
- [ ] Check if production uses correct config

### 44. **HTTPS/Security**
- [ ] Verify site uses HTTPS
- [ ] Check for mixed content warnings
- [ ] Verify secure contexts
- [ ] Check SSL certificate is valid

## Tile Provider Issues

### 45. **OpenStreetMap Tiles**
- [ ] Verify tile URL format: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- [ ] Check if OSM is blocking requests (rate limit)
- [ ] Try different tile subdomain (a, b, c)
- [ ] Verify attribution is included

### 46. **Alternative Tile Providers**
- [ ] Try CartoDB tiles: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`
- [ ] Try Mapbox (requires API key)
- [ ] Test with simpler tile provider
- [ ] Check if any tiles load

## Code Quality Checks

### 47. **Syntax Errors**
- [ ] Run code through JSHint/ESLint
- [ ] Check for missing semicolons
- [ ] Verify bracket matching
- [ ] Check for typos in variable names
- [ ] Verify function names match calls

### 48. **Scope Issues**
- [ ] Check if variables are in correct scope
- [ ] Verify map is globally accessible
- [ ] Check if functions can access needed variables
- [ ] Verify no shadowing of variables

## Testing Checklist

### 49. **Incremental Testing**
- [ ] Test map creation alone
- [ ] Add tiles
- [ ] Add one hardcoded marker
- [ ] Add Firebase connection
- [ ] Load data from Firestore
- [ ] Add all markers dynamically

### 50. **Regression Testing**
- [ ] Check if map worked before
- [ ] Review recent code changes
- [ ] Test previous deployment
- [ ] Compare working vs broken versions

## Quick Fixes to Try

### 51. **Common Quick Fixes**
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Clear all browser cache
- [ ] Redeploy to Firebase
- [ ] Restart browser
- [ ] Try incognito mode
- [ ] Restart computer
- [ ] Try different network
- [ ] Update browser
- [ ] Disable browser extensions
- [ ] Check internet connection

---

## Most Common Issues & Solutions

### ⚠️ TOP 5 MOST LIKELY PROBLEMS:

1. **Map container has no height**
   - Solution: Add `#map { height: 600px; }` to CSS

2. **Map initialized before DOM ready**
   - Solution: Wrap initMap() in DOMContentLoaded event

3. **Firestore permissions deny read**
   - Solution: Update security rules or verify authentication

4. **CSP blocking Leaflet eval()**
   - Solution: Add 'unsafe-eval' to script-src directive

5. **Coordinates are strings not numbers**
   - Solution: Parse coordinates: `parseFloat(lat)`, `parseFloat(lng)`

---

## Next Steps After Checklist

1. Go through each item systematically
2. Note which checks FAIL
3. Focus on first failure found
4. Fix that issue
5. Redeploy and test
6. Repeat until map works

Good luck! 🚀
