// Mission Workflow Logic

let currentMission = null;
let currentLocation = { lat: 35.1495, lng: -90.0490 }; // Default to Memphis downtown
let selectedEfficacyScore = 0;

// Get user's current location
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          updateUserLocation(currentLocation.lat, currentLocation.lng);
          resolve(currentLocation);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Use default location if geolocation fails
          resolve(currentLocation);
        }
      );
    } else {
      resolve(currentLocation);
    }
  });
}

// Clock In - Get Next Mission
document.getElementById('clock-in-btn').addEventListener('click', async () => {
  const btn = document.getElementById('clock-in-btn');
  btn.disabled = true;
  btn.textContent = 'LOADING MISSION...';

  try {
    // Get current location
    const location = await getUserLocation();

    // Call Cloud Function to get next mission
    const result = await functions.httpsCallable('getNextMission')({
      currentLat: location.lat,
      currentLng: location.lng
    });

    if (result.data.success) {
      currentMission = result.data.mission;
      displayMission(currentMission);
      highlightMission(currentMission);
    } else {
      alert(result.data.message || 'No pending missions found!');
      btn.disabled = false;
      btn.innerHTML = '<span class="btn-icon">⚡</span> CLOCK IN - GET MISSION';
    }
  } catch (error) {
    console.error('Error getting mission:', error);
    alert('Error getting mission: ' + error.message);
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">⚡</span> CLOCK IN - GET MISSION';
  }
});

// Display mission briefing
function displayMission(mission) {
  // Hide clock-in button
  document.getElementById('clock-in-btn').classList.add('hidden');

  // Show mission briefing
  const briefing = document.getElementById('mission-briefing');
  briefing.classList.remove('hidden');

  // Populate mission details
  document.getElementById('mission-name').textContent = mission.name;
  document.getElementById('mission-address').textContent = mission.address;
  document.getElementById('mission-distance').textContent = `${mission.distanceMiles} mi`;
  document.getElementById('mission-type').textContent = mission.type || 'commercial kitchen';
  document.getElementById('intro-script').textContent = mission.introScript;
}

// Complete Mission - Show Interaction Form
document.getElementById('complete-mission-btn').addEventListener('click', () => {
  // Hide mission briefing
  document.getElementById('mission-briefing').classList.add('hidden');

  // Show interaction form
  document.getElementById('interaction-form').classList.remove('hidden');

  // Reset form
  selectedEfficacyScore = 0;
  document.querySelectorAll('.star-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('interaction-notes').value = '';
  document.getElementById('photo-upload').value = '';
});

// Star rating system
document.querySelectorAll('.star-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const rating = parseInt(btn.dataset.rating);
    selectedEfficacyScore = rating;

    // Update visual state
    document.querySelectorAll('.star-btn').forEach((star, index) => {
      if (index < rating) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  });
});

// Submit Interaction
document.getElementById('submit-interaction-btn').addEventListener('click', async () => {
  if (selectedEfficacyScore === 0) {
    alert('Please select an efficacy rating');
    return;
  }

  const btn = document.getElementById('submit-interaction-btn');
  btn.disabled = true;
  btn.textContent = 'SUBMITTING...';

  try {
    const notes = document.getElementById('interaction-notes').value;
    const photoFile = document.getElementById('photo-upload').files[0];

    let photoUrls = [];

    // Upload photo if provided
    if (photoFile) {
      const photoRef = storage.ref(`interaction-images/${currentUser.uid}/${Date.now()}_${photoFile.name}`);
      await photoRef.put(photoFile);
      const photoUrl = await photoRef.getDownloadURL();
      photoUrls.push(photoUrl);
    }

    // Log interaction
    const result = await functions.httpsCallable('logInteraction')({
      locationId: currentMission.id,
      introScriptUsed: currentMission.introScript,
      efficacyScore: selectedEfficacyScore,
      notesText: notes,
      notesImageUrls: photoUrls,
      outcome: selectedEfficacyScore >= 4 ? 'success' : 'attempted'
    });

    if (result.data.success) {
      alert('✓ Mission Complete! Great work!');

      // Reset UI
      resetMissionUI();

      // Reload data
      loadKPIs();
      loadLocations();

      // Clear current mission marker
      if (currentMissionMarker) {
        currentMissionMarker.remove();
        currentMissionMarker = null;
      }
    }
  } catch (error) {
    console.error('Error logging interaction:', error);
    alert('Error logging interaction: ' + error.message);
    btn.disabled = false;
    btn.textContent = 'SUBMIT';
  }
});

// Cancel Interaction
document.getElementById('cancel-interaction-btn').addEventListener('click', () => {
  if (confirm('Cancel this interaction? You can come back to it later.')) {
    resetMissionUI();
  }
});

// Reset mission UI
function resetMissionUI() {
  // Hide forms
  document.getElementById('mission-briefing').classList.add('hidden');
  document.getElementById('interaction-form').classList.add('hidden');

  // Show clock-in button
  const btn = document.getElementById('clock-in-btn');
  btn.classList.remove('hidden');
  btn.disabled = false;
  btn.innerHTML = '<span class="btn-icon">⚡</span> CLOCK IN - GET MISSION';

  // Clear current mission
  currentMission = null;
}

// Try to get user location on load
setTimeout(() => {
  if (currentUser) {
    getUserLocation();
  }
}, 1000);
