// Leaflet Map Logic

let map = null;
let markers = {};
let currentMissionMarker = null;
let userLocationMarker = null;

// Initialize map
function initMap() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('Map container (#map) not found!');
    return;
  }

  if (map) {
    console.log('Map already initialized');
    return;
  }

  console.log('Creating Leaflet map...');

  try {
    map = L.map('map').setView([35.1495, -90.0490], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    window.pendingIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background: #ff6b00; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(255, 107, 0, 0.5);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    window.completedIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background: #00ff88; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    window.currentIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background: #00d4ff; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 20px rgba(0, 212, 255, 0.8);"></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    window.userIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background: #ff3366; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(255, 51, 102, 0.5);"></div>',
      iconSize: [15, 15],
      iconAnchor: [7.5, 7.5]
    });

    console.log('Map initialized successfully');
  } catch (error) {
    console.error('Error creating map:', error);
    map = null;
  }
}

async function loadLocations() {
  console.log('Loading locations...');

  if (!map) {
    console.warn('Map not initialized, trying to initialize...');
    initMap();
    await new Promise(resolve => setTimeout(resolve, 100));
    if (!map) {
      console.error('Cannot load locations: map failed to initialize');
      return;
    }
  }

  try {
    const snapshot = await db.collection('locations').get();
    console.log('Found ' + snapshot.size + ' locations');

    Object.values(markers).forEach(marker => marker.remove());
    markers = {};

    if (snapshot.empty) {
      console.warn('No locations in database');
      return;
    }

    snapshot.forEach(doc => {
      const location = doc.data();
      const icon = location.status === 'completed' ? window.completedIcon : window.pendingIcon;

      const marker = L.marker([location.lat, location.lng], { icon })
        .bindPopup('<strong>' + location.name + '</strong><br>' + location.address + '<br><em>Status: ' + location.status + '</em>')
        .addTo(map);

      markers[doc.id] = marker;
    });

    console.log('Added markers to map');
  } catch (error) {
    console.error('Error loading locations:', error);
    if (error.code === 'permission-denied') {
      console.error('Permission denied - check auth and Firestore rules');
    }
  }
}

function updateUserLocation(lat, lng) {
  if (!map) return;

  if (userLocationMarker) {
    userLocationMarker.remove();
  }

  userLocationMarker = L.marker([lat, lng], { icon: window.userIcon })
    .bindPopup('Your Location')
    .addTo(map);
}

function highlightMission(location) {
  if (!map) return;

  if (currentMissionMarker) {
    currentMissionMarker.remove();
  }

  currentMissionMarker = L.marker([location.lat, location.lng], { icon: window.currentIcon })
    .bindPopup('<strong>CURRENT MISSION</strong><br>' + location.name + '<br>' + location.address)
    .addTo(map);

  map.setView([location.lat, location.lng], 14);
  currentMissionMarker.openPopup();
}

function initializeMapIfReady() {
  const dashboardScreen = document.getElementById('dashboard-screen');
  if (dashboardScreen && dashboardScreen.classList.contains('active') && !map) {
    console.log('Dashboard active, initializing map...');
    initMap();
  }
}

setTimeout(initializeMapIfReady, 500);
setTimeout(initializeMapIfReady, 1000);

const observer = new MutationObserver(initializeMapIfReady);
const dashboardScreen = document.getElementById('dashboard-screen');
if (dashboardScreen) {
  observer.observe(dashboardScreen, { attributes: true, attributeFilter: ['class'] });
}
