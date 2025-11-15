const { onCall } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
const { getDistanceFromLatLonInKm } = require('geofire-common');
const axios = require('axios');

// AI Boss integration
const aiBoss = require('./ai-boss');
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
// MORNING QUEST SYSTEM - GAMIFICATION ENGINE

// ========================================
// MORNING QUEST SYSTEM - GAMIFICATION ENGINE  
// ========================================

const GEMINI_API_KEY = 'AIzaSyB6Mq0Hp2GCrwAO--bxseCEgFBiIEdBLPE';
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


// ========================================
// QUOTE GENERATION SYSTEM
// ========================================

/**
 * Generate Quote
 * Creates a quote for commercial appliance repair services
 */
exports.generateQuote = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const {
    customerName,
    customerAddress,
    customerPhone,
    customerEmail,
    locationId,
    lineItems,
    serviceFees,
    isEmergency,
    notes,
    validUntil,
    equipmentType
  } = request.data;

  // Validation
  if (!customerName || !customerAddress || !lineItems || lineItems.length === 0) {
    throw new Error('Customer name, address, and line items are required');
  }

  try {
    // Calculate totals
    let subtotal = 0;
    lineItems.forEach(item => {
      subtotal += item.total || 0;
    });

    // Add service fees
    let serviceFeeTotal = 0;
    if (serviceFees && serviceFees.length > 0) {
      serviceFees.forEach(fee => {
        serviceFeeTotal += fee.amount || 0;
      });
    }

    subtotal += serviceFeeTotal;

    // Apply emergency service multiplier if applicable
    let emergencyFee = 0;
    if (isEmergency) {
      emergencyFee = Math.round(subtotal * 0.5); // 50% premium
      subtotal += emergencyFee;
    }

    // Create quote document
    const quoteData = {
      // Customer info
      customerName,
      customerAddress,
      customerPhone: customerPhone || '',
      customerEmail: customerEmail || '',

      // Location reference
      locationId: locationId || null,

      // Quote details
      lineItems,
      serviceFees: serviceFees || [],
      isEmergency: isEmergency || false,
      emergencyFee,
      subtotal: Math.round(subtotal),
      total: Math.round(subtotal),

      // Equipment type
      equipmentType: equipmentType || 'commercial-appliance',

      // Metadata
      notes: notes || '',
      validUntil: validUntil || null,
      status: 'draft', // draft, sent, viewed, accepted, rejected
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: request.auth.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),

      // Tracking
      viewedAt: null,
      acceptedAt: null,
      rejectedAt: null,
      sentAt: null
    };

    // Save to Firestore
    const quoteRef = await db.collection('quotes').add(quoteData);

    // Update location with quote reference if locationId provided
    if (locationId) {
      const locationRef = db.collection('locations').doc(locationId);
      await locationRef.update({
        lastQuoteId: quoteRef.id,
        lastQuoteDate: admin.firestore.FieldValue.serverTimestamp(),
        lastQuoteAmount: Math.round(subtotal)
      });
    }

    return {
      success: true,
      quoteId: quoteRef.id,
      total: Math.round(subtotal),
      message: 'Quote generated successfully'
    };
  } catch (error) {
    console.error('Error generating quote:', error);
    throw new Error('Failed to generate quote: ' + error.message);
  }
});

/**
 * Send Quote
 * Sends a quote to customer via email/text
 */
exports.sendQuote = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { quoteId, email, phone } = request.data;

  if (!quoteId) {
    throw new Error('Quote ID is required');
  }

  if (!email && !phone) {
    throw new Error('Email or phone number is required');
  }

  try {
    // Get quote data
    const quoteDoc = await db.collection('quotes').doc(quoteId).get();

    if (!quoteDoc.exists) {
      throw new Error('Quote not found');
    }

    const quoteData = quoteDoc.data();

    // Update quote status to 'sent'
    await db.collection('quotes').doc(quoteId).update({
      status: 'sent',
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      sentTo: {
        email: email || null,
        phone: phone || null
      }
    });

    // TODO: Integrate with email/SMS service (SendGrid, Twilio, etc.)
    // For now, we'll just mark it as sent
    console.log('Quote would be sent to:', email || phone);
    console.log('Quote data:', {
      customerName: quoteData.customerName,
      total: quoteData.total,
      lineItems: quoteData.lineItems.length
    });

    return {
      success: true,
      message: 'Quote sent successfully (marked as sent - email/SMS integration pending)',
      quoteId,
      sentTo: email || phone
    };
  } catch (error) {
    console.error('Error sending quote:', error);
    throw new Error('Failed to send quote: ' + error.message);
  }
});

/**
 * Get Quotes
 * Retrieves quotes with optional filters
 */
exports.getQuotes = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { locationId, status, limit } = request.data;

  try {
    let query = db.collection('quotes');

    // Apply filters
    if (locationId) {
      query = query.where('locationId', '==', locationId);
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    // Order by creation date, most recent first
    query = query.orderBy('createdAt', 'desc');

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    } else {
      query = query.limit(50); // Default limit
    }

    const quotesSnapshot = await query.get();

    const quotes = [];
    quotesSnapshot.forEach(doc => {
      quotes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      quotes,
      count: quotes.length
    };
  } catch (error) {
    console.error('Error getting quotes:', error);
    throw new Error('Failed to get quotes: ' + error.message);
  }
});

/**
 * Update Quote Status
 * Updates the status of a quote (viewed, accepted, rejected)
 */
exports.updateQuoteStatus = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { quoteId, status } = request.data;

  if (!quoteId || !status) {
    throw new Error('Quote ID and status are required');
  }

  const validStatuses = ['draft', 'sent', 'viewed', 'accepted', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status. Must be one of: ' + validStatuses.join(', '));
  }

  try {
    const updateData = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Add timestamp for specific statuses
    if (status === 'viewed') {
      updateData.viewedAt = admin.firestore.FieldValue.serverTimestamp();
    } else if (status === 'accepted') {
      updateData.acceptedAt = admin.firestore.FieldValue.serverTimestamp();
    } else if (status === 'rejected') {
      updateData.rejectedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await db.collection('quotes').doc(quoteId).update(updateData);

    return {
      success: true,
      message: 'Quote status updated to: ' + status,
      quoteId,
      status
    };
  } catch (error) {
    console.error('Error updating quote status:', error);
    throw new Error('Failed to update quote status: ' + error.message);
  }
});

// AI Boss exports
exports.analyzeInteraction = aiBoss.analyzeInteraction;
exports.getAICommand = aiBoss.getAICommand;
exports.completeScheduledAction = aiBoss.completeScheduledAction;
exports.getScheduledActions = aiBoss.getScheduledActions;
