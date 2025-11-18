const { onCall } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
const { getDistanceFromLatLonInKm } = require('geofire-common');
const axios = require('axios');

// AI Boss integration
const aiBoss = require('./ai-boss');
// Daily Digest integration (Human-Centered AI)
const dailyDigest = require('./daily-digest');
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
      // Check if role exists, add if missing
      const data = userDoc.data();
      if (!data.role) {
        await userRef.update({ role: 'technician' });
      }
      return { success: true, message: 'User already initialized' };
    }

    // Create user profile WITH ROLE
    await userRef.set({
      uid: userId,
      email: request.auth.token.email,
      role: 'technician',  // ADD THIS LINE
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
// MORNING QUEST SYSTEM - GAMIFICATION ENGINE

// ========================================
// MORNING QUEST SYSTEM - GAMIFICATION ENGINE  
// ========================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function generateMissionBriefingWithGemini(location) {
  const prompt = 'You are a tactical operations AI. Generate a 2-sentence mission briefing for: ' + location.name + ' at ' + location.address + '. Make it tactical and exciting.';

  try {
    const response = await axios.post(
      GEMINI_API_URL + '?key=' + GEMINI_API_KEY,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.data.candidates[0].content.parts[0].text.trim();
    }
    return 'Mission Alert: ' + location.name + ' requires immediate attention!';
  } catch (error) {
    console.error('Gemini API error:', error.message);
    return 'Target acquired: ' + location.name + '. Move in!';
  }
}

exports.generateDailyQuests = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) throw new Error('User must be authenticated');

  const { questDate, userLat, userLng, questCount } = request.data;
  const userId = request.auth.uid;
  const targetDate = questDate || new Date().toISOString().split('T')[0];
  const numQuests = questCount || 3;

  try {
    const locationsSnapshot = await db.collection('locations').where('status', '==', 'pending').limit(20).get();
    if (locationsSnapshot.empty) return { success: false, message: 'No pending locations!' };

    const locations = [];
    locationsSnapshot.forEach(doc => {
      const data = doc.data();
      const distance = (userLat && userLng) ? calculateDistance(userLat, userLng, data.lat, data.lng) : 0;
      locations.push({ id: doc.id, ...data, distance });
    });

    locations.sort((a, b) => a.distance - b.distance);
    const selectedLocations = locations.slice(0, numQuests);

    const questsWithBriefings = await Promise.all(
      selectedLocations.map(async (location, index) => {
        const briefing = await generateMissionBriefingWithGemini(location);
        return {
          questNumber: index + 1,
          locationId: location.id,
          location: {
            name: location.name,
            address: location.address,
            type: location.type,
            lat: location.lat,
            lng: location.lng
          },
          distanceKm: location.distance.toFixed(2),
          distanceMiles: (location.distance * 0.621371).toFixed(2),
          missionBriefing: briefing,
          estimatedDuration: '10-15 minutes',
          xpReward: 75,
          status: 'pending'
        };
      })
    );

    await db.collection('dailyQuests').doc(userId + '_' + targetDate).set({
      userId,
      questDate: targetDate,
      quests: questsWithBriefings,
      totalQuests: questsWithBriefings.length,
      completedQuests: 0,
      totalXP: questsWithBriefings.reduce((sum, q) => sum + q.xpReward, 0),
      earnedXP: 0,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active'
    });

    return {
      success: true,
      questDate: targetDate,
      quests: questsWithBriefings,
      message: questsWithBriefings.length + ' QUESTS READY!'
    };
  } catch (error) {
    console.error('Error generating quests:', error);
    throw new Error('Failed to generate quests');
  }
});

exports.getDailyQuests = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) throw new Error('User must be authenticated');

  const { questDate } = request.data;
  const userId = request.auth.uid;
  const targetDate = questDate || new Date().toISOString().split('T')[0];

  try {
    const questDoc = await db.collection('dailyQuests').doc(userId + '_' + targetDate).get();
    if (!questDoc.exists) return { success: false, message: 'No quests generated', questsAvailable: false };

    const questData = questDoc.data();
    return { success: true, questsAvailable: true, questDate: targetDate, ...questData };
  } catch (error) {
    console.error('Error getting quests:', error);
    throw new Error('Failed to get quests');
  }
});

exports.completeQuest = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) throw new Error('User must be authenticated');

  const { questDate, questNumber, xpEarned } = request.data;
  const userId = request.auth.uid;
  const targetDate = questDate || new Date().toISOString().split('T')[0];

  try {
    const questDocRef = db.collection('dailyQuests').doc(userId + '_' + targetDate);
    const questDoc = await questDocRef.get();
    if (!questDoc.exists) throw new Error('Quest not found');

    const questData = questDoc.data();
    const quests = questData.quests;
    const questIndex = quests.findIndex(q => q.questNumber === questNumber);
    if (questIndex === -1) throw new Error('Quest not found');

    quests[questIndex].status = 'completed';
    quests[questIndex].completedAt = admin.firestore.FieldValue.serverTimestamp();

    await questDocRef.update({
      quests: quests,
      completedQuests: admin.firestore.FieldValue.increment(1),
      earnedXP: admin.firestore.FieldValue.increment(xpEarned || 75)
    });

    const completedCount = (questData.completedQuests || 0) + 1;
    const allComplete = completedCount === questData.totalQuests;

    return {
      success: true,
      message: allComplete ? 'ALL QUESTS COMPLETE!' : 'Quest ' + questNumber + ' complete!',
      questsRemaining: questData.totalQuests - completedCount,
      allComplete: allComplete
    };
  } catch (error) {
    console.error('Error completing quest:', error);
    throw new Error('Failed to complete quest');
  }
});


/**
 * Convert Lead to Customer
 * Takes an "interested" prospect and converts them into a qualified lead with equipment survey
 */
exports.convertLeadToCustomer = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const {
    locationId,
    equipmentSurvey,
    painPoints,
    notes,
    currentProvider,
    assessmentDateTime,
    contactMethod,
    contactInfo,
    accessNotes,
    priority,
    status
  } = request.data;

  if (!locationId || !equipmentSurvey || !assessmentDateTime) {
    throw new Error('Location ID, equipment survey, and assessment date/time required');
  }

  try {
    const userId = request.auth.uid;
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    // Create lead record
    const leadData = {
      locationId,
      userId,
      equipmentSurvey,
      painPoints: painPoints || [],
      notes: notes || '',
      currentProvider: currentProvider || 'unknown',
      assessmentDateTime,
      contactMethod: contactMethod || 'phone',
      contactInfo,
      accessNotes: accessNotes || '',
      priority: priority || 'medium',
      status: status || 'assessment-scheduled',
      convertedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const leadRef = await db.collection('leads').add(leadData);

    // Update location status to "lead"
    await db.collection('locations').doc(locationId).update({
      status: 'lead',
      leadId: leadRef.id,
      priority: priority || 'medium',
      updatedAt: timestamp
    });

    // Generate follow-up tasks
    const followUpTasks = [];

    // Task 1: Confirm assessment appointment
    const confirmDate = new Date(assessmentDateTime);
    confirmDate.setDate(confirmDate.getDate() - 1); // Day before
    followUpTasks.push({
      type: 'confirm-appointment',
      description: `Confirm assessment appointment with ${contactInfo}`,
      scheduledFor: confirmDate.toISOString(),
      priority: 'high',
      status: 'pending'
    });

    // Task 2: Prepare for assessment
    const prepDate = new Date(assessmentDateTime);
    prepDate.setHours(prepDate.getHours() - 2); // 2 hours before
    followUpTasks.push({
      type: 'prepare-assessment',
      description: `Review equipment list and prepare tools for ${locationId}`,
      scheduledFor: prepDate.toISOString(),
      priority: 'high',
      status: 'pending'
    });

    // Task 3: Conduct assessment
    followUpTasks.push({
      type: 'conduct-assessment',
      description: `On-site equipment assessment at ${locationId}`,
      scheduledFor: assessmentDateTime,
      priority: 'critical',
      status: 'pending'
    });

    // Task 4: Critical equipment follow-up (if any critical items)
    const criticalEquipment = equipmentSurvey.filter(e => e.condition === 'critical');
    if (criticalEquipment.length > 0) {
      followUpTasks.push({
        type: 'critical-equipment',
        description: `URGENT: ${criticalEquipment.length} critical equipment items need immediate attention`,
        scheduledFor: new Date().toISOString(), // Immediate
        priority: 'critical',
        status: 'pending'
      });
    }

    // Create follow-up tasks in database
    const taskPromises = followUpTasks.map(task =>
      db.collection('followUpTasks').add({
        ...task,
        leadId: leadRef.id,
        locationId,
        userId,
        createdAt: timestamp
      })
    );

    await Promise.all(taskPromises);

    // Create assessment reminder
    const assessmentReminder = {
      leadId: leadRef.id,
      locationId,
      userId,
      type: 'assessment',
      scheduledFor: assessmentDateTime,
      contactMethod,
      contactInfo,
      accessNotes,
      createdAt: timestamp
    };

    await db.collection('reminders').add(assessmentReminder);

    // Update KPIs - track lead conversion
    const kpisRef = db.collection('kpis').doc(userId);
    const kpisDoc = await kpisRef.get();

    if (kpisDoc.exists) {
      await kpisRef.update({
        totalLeads: admin.firestore.FieldValue.increment(1),
        leadsThisMonth: admin.firestore.FieldValue.increment(1),
        lastLeadConversion: timestamp
      });
    } else {
      await kpisRef.set({
        userId,
        totalLeads: 1,
        leadsThisMonth: 1,
        lastLeadConversion: timestamp,
        createdAt: timestamp
      });
    }

    return {
      success: true,
      leadId: leadRef.id,
      message: 'Lead converted successfully',
      followUpTasks: followUpTasks.map(t => t.description),
      assessmentReminder
    };

  } catch (error) {
    console.error('Error converting lead:', error);
    throw new Error('Failed to convert lead: ' + error.message);
  }
});

// AI Boss exports
exports.analyzeInteraction = aiBoss.analyzeInteraction;
exports.analyzeEquipmentPhoto = aiBoss.analyzeEquipmentPhoto;
exports.getAICommand = aiBoss.getAICommand;
exports.completeScheduledAction = aiBoss.completeScheduledAction;
exports.getScheduledActions = aiBoss.getScheduledActions;

// Daily Digest exports (Human-Centered AI Assistant)
exports.generateDailyDigest = dailyDigest.generateDailyDigest;
exports.getDailyDigest = dailyDigest.getDailyDigest;
exports.dismissDailyDigest = dailyDigest.dismissDailyDigest;
exports.recordDigestFeedback = dailyDigest.recordDigestFeedback;
exports.getUserPreferences = dailyDigest.getUserPreferences;
exports.updateUserPreferences = dailyDigest.updateUserPreferences;
