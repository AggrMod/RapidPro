// Leaflet Map Logic

let map = null;
let markers = {};
let currentMissionMarker = null;
let userLocationMarker = null;

// Initialize map
function initMap() {
  // Center on Memphis
  map = L.map('map').setView([35.1495, -90.0490], 12);

  // Use OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Custom icon definitions
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
}

// Load all locations and display on map
async function loadLocations() {
  try {
    const snapshot = await db.collection('locations').get();

    // Clear existing markers
    Object.values(markers).forEach(marker => marker.remove());
    markers = {};

    snapshot.forEach(doc => {
      const location = doc.data();
      const icon = location.status === 'completed' ? window.completedIcon : window.pendingIcon;

      const marker = L.marker([location.lat, location.lng], { icon })
        .bindPopup(`
          <strong>${location.name}</strong><br>
          ${location.address}<br>
          <em>Status: ${location.status}</em>
        `)
        .addTo(map);

      markers[doc.id] = marker;
    });
  } catch (error) {
    console.error('Error loading locations:', error);
  }
}

// Update user location on map
function updateUserLocation(lat, lng) {
  if (userLocationMarker) {
    userLocationMarker.remove();
  }

  userLocationMarker = L.marker([lat, lng], { icon: window.userIcon })
    .bindPopup('Your Location')
    .addTo(map);
}

// Highlight current mission on map
function highlightMission(location) {
  // Remove previous mission marker
  if (currentMissionMarker) {
    currentMissionMarker.remove();
  }

  // Add new mission marker
  currentMissionMarker = L.marker([location.lat, location.lng], { icon: window.currentIcon })
    .bindPopup(`
      <strong>CURRENT MISSION</strong><br>
      ${location.name}<br>
      ${location.address}
    `)
    .addTo(map);

  // Pan to mission
  map.setView([location.lat, location.lng], 14);

  currentMissionMarker.openPopup();
}

// Initialize map when dashboard is shown
setTimeout(() => {
  if (document.getElementById('dashboard-screen').classList.contains('active')) {
    initMap();
  }
}, 100);

// Re-initialize if screen changes
const observer = new MutationObserver(() => {
  if (document.getElementById('dashboard-screen').classList.contains('active') && !map) {
    initMap();
  }
});

observer.observe(document.getElementById('dashboard-screen'), {
  attributes: true,
  attributeFilter: ['class']
});
