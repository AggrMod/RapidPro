// ========================================
// MORNING QUEST SYSTEM - GAMIFICATION ENGINE
// ========================================

const { onCall } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
const axios = require('axios');

const db = admin.firestore();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Import distance calculation (you'll need to export this from index.js)
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
 * Call Gemini AI to generate epic mission briefings
 */
async function generateMissionBriefingWithGemini(location) {
  const prompt = `You are a tactical operations AI for a field service game. Generate a motivating 2-sentence mission briefing for visiting this business:

Business: ${location.name}
Type: ${location.type || 'commercial kitchen'}
Address: ${location.address}
Equipment: refrigeration and HVAC systems

Make it sound like a tactical operation with urgency and excitement. Be concise, powerful, and motivating. Example tone: "Operatives, intel confirms a critical asset..."`;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.data.candidates[0].content.parts[0].text.trim();
    }

    // Fallback if Gemini fails
    return `Mission Alert: ${location.name} requires immediate attention. Equipment status critical - move in and establish contact with decision maker ASAP!`;
  } catch (error) {
    console.error('Gemini API error:', error.message);
    // Fallback mission briefing
    return `Target acquired: ${location.name}. Commercial kitchen systems need your expertise. This is your territory - claim it!`;
  }
}

/**
 * Generate Daily Quests - The Quest Giver
 * Creates 3-5 optimized missions for the next day
 */
exports.generateDailyQuests = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { questDate, userLat, userLng, questCount } = request.data;
  const userId = request.auth.uid;
  const targetDate = questDate || new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const numQuests = questCount || 3; // Default 3 quests per day

  try {
    // Get pending locations
    const locationsSnapshot = await db.collection('locations')
      .where('status', '==', 'pending')
      .limit(20) // Get top 20 to select from
      .get();

    if (locationsSnapshot.empty) {
      return {
        success: false,
        message: 'No pending locations available. Territory conquered!'
      };
    }

    // Convert to array and calculate distances if location provided
    const locations = [];
    locationsSnapshot.forEach(doc => {
      const data = doc.data();
      let distance = 0;

      if (userLat && userLng) {
        distance = calculateDistance(userLat, userLng, data.lat, data.lng);
      }

      locations.push({
        id: doc.id,
        ...data,
        distance: distance
      });
    });

    // Sort by distance (nearest first)
    locations.sort((a, b) => a.distance - b.distance);

    // Select top N locations
    const selectedLocations = locations.slice(0, numQuests);

    // Generate epic mission briefings with Gemini for each quest
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
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
      })
    );

    // Store daily quests in Firestore
    const questBatchRef = db.collection('dailyQuests').doc(`${userId}_${targetDate}`);
    await questBatchRef.set({
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
      message: `🎯 ${questsWithBriefings.length} QUESTS GENERATED FOR ${targetDate}. Mission briefings ready. Get some rest, Operator - tomorrow we dominate the territory!`
    };
  } catch (error) {
    console.error('Error generating daily quests:', error);
    throw new Error('Failed to generate daily quests');
  }
});

/**
 * Scheduled Function - Runs every night at 9 PM to generate tomorrow's quests
 * This is the automation that makes the game work while you sleep!
 */
exports.scheduleDailyQuestsGeneration = onSchedule({
  schedule: '0 21 * * *', // 9:00 PM every day (cron format)
  timeZone: 'America/Chicago', // Memphis timezone
  region: 'us-central1'
}, async (event) => {
  console.log('🌙 Nightly quest generation started...');

  try {
    // Get all active users
    const usersSnapshot = await db.collection('users').get();

    if (usersSnapshot.empty) {
      console.log('No users found');
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    // Generate quests for each user
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      // Use user's last known location or Memphis default
      const userLat = userData.lastKnownLat || 35.1495;
      const userLng = userData.lastKnownLng || -90.0490;

      console.log(`Generating quests for user ${userId} for ${tomorrowDate}`);

      // Generate quests (reuse the logic from generateDailyQuests)
      const locationsSnapshot = await db.collection('locations')
        .where('status', '==', 'pending')
        .limit(20)
        .get();

      if (locationsSnapshot.empty) {
        console.log(`No pending locations for user ${userId}`);
        continue;
      }

      const locations = [];
      locationsSnapshot.forEach(doc => {
        const data = doc.data();
        const distance = calculateDistance(userLat, userLng, data.lat, data.lng);
        locations.push({
          id: doc.id,
          ...data,
          distance: distance
        });
      });

      locations.sort((a, b) => a.distance - b.distance);
      const selectedLocations = locations.slice(0, 3);

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

      // Store quests
      await db.collection('dailyQuests').doc(`${userId}_${tomorrowDate}`).set({
        userId,
        questDate: tomorrowDate,
        quests: questsWithBriefings,
        totalQuests: questsWithBriefings.length,
        completedQuests: 0,
        totalXP: questsWithBriefings.reduce((sum, q) => sum + q.xpReward, 0),
        earnedXP: 0,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active'
      });

      console.log(`✅ Generated ${questsWithBriefings.length} quests for user ${userId}`);
    }

    console.log('🎯 Nightly quest generation complete!');
    return null;
  } catch (error) {
    console.error('Error in scheduled quest generation:', error);
    throw error;
  }
});

/**
 * Get Daily Quests - Retrieve today's (or any day's) quest chain
 */
exports.getDailyQuests = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { questDate } = request.data;
  const userId = request.auth.uid;
  const targetDate = questDate || new Date().toISOString().split('T')[0];

  try {
    const questDoc = await db.collection('dailyQuests')
      .doc(`${userId}_${targetDate}`)
      .get();

    if (!questDoc.exists) {
      return {
        success: false,
        message: `No quests generated for ${targetDate}. Generate them now?`,
        questsAvailable: false
      };
    }

    const questData = questDoc.data();

    return {
      success: true,
      questsAvailable: true,
      questDate: targetDate,
      ...questData,
      message: `⚡ ${questData.totalQuests} QUESTS READY. Time remaining to start: Calculate based on your start time. LET'S MOVE!`
    };
  } catch (error) {
    console.error('Error getting daily quests:', error);
    throw new Error('Failed to get daily quests');
  }
});

/**
 * Complete a Quest - Mark quest as done and award XP
 */
exports.completeQuest = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { questDate, questNumber, xpEarned } = request.data;
  const userId = request.auth.uid;
  const targetDate = questDate || new Date().toISOString().split('T')[0];

  try {
    const questDocRef = db.collection('dailyQuests').doc(`${userId}_${targetDate}`);
    const questDoc = await questDocRef.get();

    if (!questDoc.exists) {
      throw new Error('Quest batch not found');
    }

    const questData = questDoc.data();
    const quests = questData.quests;

    // Find and update the specific quest
    const questIndex = quests.findIndex(q => q.questNumber === questNumber);
    if (questIndex === -1) {
      throw new Error('Quest not found');
    }

    quests[questIndex].status = 'completed';
    quests[questIndex].completedAt = admin.firestore.FieldValue.serverTimestamp();

    // Update quest batch
    await questDocRef.update({
      quests: quests,
      completedQuests: admin.firestore.FieldValue.increment(1),
      earnedXP: admin.firestore.FieldValue.increment(xpEarned || 75)
    });

    const completedCount = (questData.completedQuests || 0) + 1;
    const allComplete = completedCount === questData.totalQuests;

    return {
      success: true,
      message: allComplete
        ? '🏆 ALL QUESTS COMPLETE! You dominated today. Tomorrow we do it again!'
        : `✅ Quest ${questNumber} complete! +${xpEarned || 75} XP. ${questData.totalQuests - completedCount} quests remaining.`,
      questsRemaining: questData.totalQuests - completedCount,
      allComplete: allComplete
    };
  } catch (error) {
    console.error('Error completing quest:', error);
    throw new Error('Failed to complete quest');
  }
});
