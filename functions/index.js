const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { getDistanceFromLatLonInKm } = require('geofire-common');

admin.initializeApp();
const db = admin.firestore();

/**
 * Calculate distance between two geographic points
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Get Next Mission - The Mission Giver
 * Finds the nearest pending location to the user's current position
 */
exports.getNextMission = onCall({ enforceAppCheck: false }, async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { currentLat, currentLng } = request.data;

  if (!currentLat || !currentLng) {
    throw new Error('Current location required');
  }

  try {
    // Get all pending locations
    const locationsSnapshot = await db.collection('locations')
      .where('status', '==', 'pending')
      .get();

    if (locationsSnapshot.empty) {
      return {
        success: false,
        message: 'No pending locations found. Great job!'
      };
    }

    // Calculate distances and find nearest
    let nearestLocation = null;
    let shortestDistance = Infinity;

    locationsSnapshot.forEach(doc => {
      const location = doc.data();
      const distance = calculateDistance(
        currentLat,
        currentLng,
        location.lat,
        location.lng
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestLocation = {
          id: doc.id,
          ...location,
          distance: distance.toFixed(2)
        };
      }
    });

    // Generate intro script for this location
    const scriptResult = await generateIntroScriptInternal(nearestLocation);

    return {
      success: true,
      mission: {
        ...nearestLocation,
        introScript: scriptResult.script,
        distanceKm: shortestDistance.toFixed(2),
        distanceMiles: (shortestDistance * 0.621371).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Error getting next mission:', error);
    throw new Error('Failed to get next mission');
  }
});

/**
 * Generate Five-Word Intro Script - The Phrase Engine
 * Creates a compelling 5-word introduction based on location data and past success
 */
async function generateIntroScriptInternal(location) {
  // Word library categorized by effectiveness
  const powerWords = {
    openers: ['Hey', 'Hi', 'Hello', 'Good morning', 'Quick question'],
    values: ['save money', 'prevent breakdowns', 'reduce costs', 'ensure compliance', 'maximize uptime'],
    actions: ['maintenance plan', 'service check', 'inspection offer', 'free consultation', 'quick review'],
    urgency: ['today', 'this week', 'right now', 'immediately', 'soon']
  };

  // Get past successful interactions for this location type/industry
  const successfulInteractions = await db.collection('interactions')
    .where('efficacyScore', '>=', 4)
    .orderBy('efficacyScore', 'desc')
    .limit(10)
    .get();

  // Analyze successful scripts (simplified adaptive learning)
  let topWords = [];
  successfulInteractions.forEach(doc => {
    const interaction = doc.data();
    if (interaction.introScriptUsed) {
      topWords = topWords.concat(interaction.introScriptUsed.split(' '));
    }
  });

  // Generate script - for now using template, but adaptive over time
  const opener = powerWords.openers[Math.floor(Math.random() * powerWords.openers.length)];
  const value = powerWords.values[Math.floor(Math.random() * powerWords.values.length)];
  const action = powerWords.actions[Math.floor(Math.random() * powerWords.actions.length)];

  const script = `${opener}, commercial kitchen ${action}?`;

  return {
    script,
    confidence: successfulInteractions.size > 5 ? 'high' : 'medium'
  };
}

exports.generateIntroScript = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { locationId } = request.data;

  if (!locationId) {
    throw new Error('Location ID required');
  }

  try {
    const locationDoc = await db.collection('locations').doc(locationId).get();

    if (!locationDoc.exists) {
      throw new Error('Location not found');
    }

    const result = await generateIntroScriptInternal(locationDoc.data());
    return { success: true, ...result };
  } catch (error) {
    console.error('Error generating script:', error);
    throw new Error('Failed to generate script');
  }
});

/**
 * Log Interaction
 * Records details of a location visit including notes, images, and efficacy rating
 */
exports.logInteraction = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const {
    locationId,
    introScriptUsed,
    efficacyScore,
    notesText,
    notesImageUrls,
    outcome
  } = request.data;

  if (!locationId || efficacyScore === undefined) {
    throw new Error('Location ID and efficacy score required');
  }

  try {
    // Create interaction record
    const interaction = {
      locationId,
      userId: request.auth.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      introScriptUsed: introScriptUsed || '',
      efficacyScore: parseInt(efficacyScore),
      notesText: notesText || '',
      notesImageUrls: notesImageUrls || [],
      outcome: outcome || 'visited'
    };

    const interactionRef = await db.collection('interactions').add(interaction);

    // Update location status
    const locationRef = db.collection('locations').doc(locationId);
    await locationRef.update({
      status: efficacyScore >= 4 ? 'completed' : 'attempted',
      lastVisited: admin.firestore.FieldValue.serverTimestamp(),
      lastEfficacyScore: parseInt(efficacyScore)
    });

    // Update KPIs
    await updateKPIsInternal(request.auth.uid, efficacyScore);

    return {
      success: true,
      interactionId: interactionRef.id,
      message: 'Interaction logged successfully'
    };
  } catch (error) {
    console.error('Error logging interaction:', error);
    throw new Error('Failed to log interaction');
  }
});

/**
 * Update KPIs
 * Calculates and updates key performance indicators
 */
async function updateKPIsInternal(userId, newEfficacyScore) {
  const kpisRef = db.collection('kpis').doc(userId);

  const kpisDoc = await kpisRef.get();

  if (!kpisDoc.exists) {
    // Initialize KPIs
    await kpisRef.set({
      userId,
      totalPending: 0,
      totalCompleted: 1,
      totalAttempted: 0,
      avgEfficacyScore: newEfficacyScore,
      lastClockInTime: admin.firestore.FieldValue.serverTimestamp(),
      totalInteractions: 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } else {
    // Update existing KPIs
    const currentKPIs = kpisDoc.data();
    const totalInteractions = (currentKPIs.totalInteractions || 0) + 1;
    const currentAvg = currentKPIs.avgEfficacyScore || 0;
    const newAvg = ((currentAvg * (totalInteractions - 1)) + newEfficacyScore) / totalInteractions;

    await kpisRef.update({
      totalCompleted: admin.firestore.FieldValue.increment(newEfficacyScore >= 4 ? 1 : 0),
      totalAttempted: admin.firestore.FieldValue.increment(newEfficacyScore < 4 ? 1 : 0),
      avgEfficacyScore: newAvg,
      totalInteractions: totalInteractions,
      lastClockInTime: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  // Update pending count
  const pendingCount = await db.collection('locations')
    .where('status', '==', 'pending')
    .count()
    .get();

  await kpisRef.update({
    totalPending: pendingCount.data().count
  });
}

exports.getKPIs = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  try {
    const kpisDoc = await db.collection('kpis').doc(request.auth.uid).get();

    if (!kpisDoc.exists) {
      // Return empty KPIs if none exist yet
      return {
        success: true,
        kpis: {
          totalPending: 0,
          totalCompleted: 0,
          totalAttempted: 0,
          avgEfficacyScore: 0,
          totalInteractions: 0
        }
      };
    }

    return {
      success: true,
      kpis: kpisDoc.data()
    };
  } catch (error) {
    console.error('Error getting KPIs:', error);
    throw new Error('Failed to get KPIs');
  }
});

/**
 * Initialize user data - called once when user first signs up
 */
exports.initializeUser = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  try {
    const userId = request.auth.uid;
    const userRef = db.collection('users').doc(userId);

    const userDoc = await userRef.get();
    if (userDoc.exists) {
      return { success: true, message: 'User already initialized' };
    }

    // Create user profile
    await userRef.set({
      uid: userId,
      email: request.auth.token.email,
      currentLocationId: null,
      totalMissionsCompleted: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Initialize KPIs
    await db.collection('kpis').doc(userId).set({
      userId,
      totalPending: 0,
      totalCompleted: 0,
      totalAttempted: 0,
      avgEfficacyScore: 0,
      totalInteractions: 0,
      lastClockInTime: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, message: 'User initialized successfully' };
  } catch (error) {
    console.error('Error initializing user:', error);
    throw new Error('Failed to initialize user');
  }
});

exports.createUser = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated to create other users');
  }

  const { email, password } = request.data;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });
    return { success: true, uid: userRecord.uid, email: userRecord.email };
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
});
