
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
