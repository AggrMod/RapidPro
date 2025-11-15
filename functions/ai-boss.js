// ========================================
// AI BOSS SYSTEM - DECISION ENGINE
// ========================================

const { onCall } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Get shared instances from main index.js
// Note: admin.initializeApp() is called in index.js, so we just use admin here
const db = admin.firestore();
const GEMINI_API_KEY = defineString('GEMINI_API_KEY');

/**
 * AI Boss - Analyze Interaction and Provide Tactical Guidance (Internal)
 * This is the core AI decision engine that tells you what to do next
 * Can be called from other Cloud Functions
 */
async function analyzeInteractionInternal(userId, locationId, notesText, efficacyScore, timestamp) {
  if (!userId || !locationId || !notesText || efficacyScore === undefined) {
    throw new Error('userId, locationId, notesText, and efficacyScore are required');
  }

  console.log('AI Boss analyzing interaction:', { locationId, efficacyScore });

  try {
    // Get location details
    const locationDoc = await db.collection('locations').doc(locationId).get();
    if (!locationDoc.exists) {
      throw new Error('Location not found');
    }
    const location = locationDoc.data();

    // Get interaction history for this location
    const interactionsSnapshot = await db.collection('interactions')
      .where('locationId', '==', locationId)
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();

    const interactionHistory = interactionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        date: data.timestamp?.toDate?.() || new Date(),
        note: data.notesText || '',
        score: data.efficacyScore || 0
      };
    });

    // Get current customer stats
    const pendingSnapshot = await db.collection('locations')
      .where('status', '==', 'pending')
      .count()
      .get();
    const pendingCount = pendingSnapshot.data().count;

    const activeSnapshot = await db.collection('locations')
      .where('status', '==', 'completed')
      .count()
      .get();
    const activeCustomers = activeSnapshot.data().count;

    // Build Gemini prompt
    const currentTime = new Date(timestamp || Date.now());
    const timeString = currentTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const prompt = `You are the AI Boss for a refrigeration technician doing cold calls to acquire commercial kitchen customers. Analyze this field interaction and provide clear tactical guidance.

CONTEXT:
- Current time: ${timeString}
- Location: ${location.name} (${location.type || 'commercial kitchen'})
- Address: ${location.address}
- Current active customers: ${activeCustomers}
- Pending locations remaining: ${pendingCount}
- Primary goal: Acquire paying customers through field visits

INTERACTION JUST LOGGED:
"${notesText}"

EFFICACY SCORE: ${efficacyScore}/5
(1=rejected, 2=polite brush-off, 3=neutral/info gathered, 4=interested, 5=ready to buy)

PREVIOUS INTERACTIONS AT THIS LOCATION:
${interactionHistory.length > 0
  ? interactionHistory.map(i => `- ${i.date.toLocaleDateString()}: "${i.note}" (Score: ${i.score}/5)`).join('\n')
  : 'None - this is first contact'}

ANALYZE AND PROVIDE TACTICAL GUIDANCE:

1. **What happened?** (2-3 sentence interpretation)
2. **What should the tech do RIGHT NOW?** (immediate next action in next 5 minutes)
3. **Should we schedule a follow-up?** (if yes, when exactly and why)
4. **How urgent is this lead?** (critical/high/medium/low priority)
5. **What type of mission should be next?** (scheduled-return, new-contact, follow-up)

RESPOND IN VALID JSON FORMAT ONLY (no markdown, no explanation):
{
  "analysis": "string - 2-3 sentence interpretation of what actually happened",
  "immediateAction": "string - clear instruction for what to do in next 5 minutes",
  "scheduledAction": {
    "time": "ISO timestamp like ${new Date(currentTime.getTime() + 3600000).toISOString()}",
    "action": "string - specific action to take",
    "reason": "string - why this timing matters"
  } OR null,
  "leadPriority": "critical" OR "high" OR "medium" OR "low",
  "nextMissionType": "scheduled-return" OR "new-contact" OR "follow-up",
  "aiCommand": "string - what to display to user in commanding, motivational voice (2-4 sentences max, use emojis)"
}`;

    // Call Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log('Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    console.log('Gemini response received:', responseText.substring(0, 200));

    // Parse JSON from response (handle markdown code blocks)
    let jsonText = responseText.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const aiDecision = JSON.parse(jsonText);

    // Validate response structure
    if (!aiDecision.analysis || !aiDecision.immediateAction || !aiDecision.leadPriority) {
      throw new Error('Invalid AI response structure');
    }

    console.log('AI Decision:', aiDecision.leadPriority, 'priority,', aiDecision.nextMissionType);

    // Store AI decision for learning
    await db.collection('aiDecisions').add({
      locationId,
      userId: userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      input: {
        note: notesText,
        efficacyScore,
        locationName: location.name
      },
      output: aiDecision,
      context: {
        activeCustomers,
        pendingCount,
        interactionCount: interactionHistory.length
      }
    });

    // If scheduled action exists, create it
    if (aiDecision.scheduledAction && aiDecision.scheduledAction.time) {
      const scheduledTime = new Date(aiDecision.scheduledAction.time);

      await db.collection('scheduledActions').add({
        locationId,
        locationName: location.name,
        locationAddress: location.address,
        userId: userId,
        scheduledTime: scheduledTime,
        action: aiDecision.scheduledAction.action,
        reason: aiDecision.scheduledAction.reason,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('Scheduled action created for', scheduledTime.toLocaleString());
    }

    // Update location with AI analysis results
    await db.collection('locations').doc(locationId).update({
      priority: aiDecision.leadPriority,
      lastAIAnalysis: admin.firestore.FieldValue.serverTimestamp(),
      lastInteractionScore: efficacyScore,
      interactionCount: admin.firestore.FieldValue.increment(1)
    });

    return {
      success: true,
      ...aiDecision
    };

  } catch (error) {
    console.error('Error in analyzeInteraction:', error);

    // Return a fallback response if AI fails
    return {
      success: false,
      error: error.message,
      fallbackGuidance: {
        analysis: 'AI analysis temporarily unavailable',
        immediateAction: 'Continue to next nearest pending location',
        scheduledAction: null,
        leadPriority: efficacyScore >= 4 ? 'high' : efficacyScore >= 3 ? 'medium' : 'low',
        nextMissionType: 'new-contact',
        aiCommand: '⚠️ AI Boss system experiencing issues. Proceed with standard protocol: move to next location and log all interactions. 💪'
      }
    };
  }
}

/**
 * AI Boss - Analyze Interaction (Cloud Function wrapper)
 */
exports.analyzeInteraction = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { locationId, notesText, efficacyScore, timestamp } = request.data;

  if (!locationId || !notesText || efficacyScore === undefined) {
    throw new Error('locationId, notesText, and efficacyScore are required');
  }

  return await analyzeInteractionInternal(
    request.auth.uid,
    locationId,
    notesText,
    efficacyScore,
    timestamp
  );
});

// Export internal function for use by other Cloud Functions
exports.analyzeInteractionInternal = analyzeInteractionInternal;

/**
 * Get AI Command - What should I do right now?
 * Checks for scheduled actions due now, or gets next best mission
 */
exports.getAICommand = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const userId = request.auth.uid;
  const currentTime = new Date();

  console.log('Getting AI command for user:', userId);

  try {
    // Check for scheduled actions due now (within next 15 minutes)
    const upcomingWindow = new Date(currentTime.getTime() + 15 * 60000);

    const upcomingActionsSnapshot = await db.collection('scheduledActions')
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .where('scheduledTime', '<=', upcomingWindow)
      .orderBy('scheduledTime', 'asc')
      .limit(1)
      .get();

    if (!upcomingActionsSnapshot.empty) {
      const actionDoc = upcomingActionsSnapshot.docs[0];
      const scheduledAction = actionDoc.data();
      const timeUntil = Math.round((scheduledAction.scheduledTime.toDate() - currentTime) / 60000);

      return {
        type: 'scheduled-action',
        priority: 'critical',
        command: `🚨 SCHEDULED MISSION ${timeUntil <= 0 ? 'DUE NOW' : `IN ${timeUntil} MIN`}!\n\n${scheduledAction.action}\n\nLocation: ${scheduledAction.locationName}\nReason: ${scheduledAction.reason}\n\nThis is time-sensitive. Execute immediately! 💪`,
        location: {
          name: scheduledAction.locationName,
          address: scheduledAction.locationAddress,
          id: scheduledAction.locationId
        },
        actionId: actionDoc.id,
        scheduledTime: scheduledAction.scheduledTime.toDate().toISOString()
      };
    }

    // No urgent scheduled actions - check for high-priority leads
    const highPrioritySnapshot = await db.collection('locations')
      .where('priority', '==', 'critical')
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (!highPrioritySnapshot.empty) {
      const location = highPrioritySnapshot.docs[0].data();
      return {
        type: 'high-priority-lead',
        priority: 'critical',
        command: `🔥 CRITICAL LEAD REQUIRES ATTENTION!\n\nLocation: ${location.name}\nLast contact scored high - follow up ASAP.\n\nThis lead is HOT. Move on it now! 🚀`,
        location: location,
        locationId: highPrioritySnapshot.docs[0].id
      };
    }

    // Default: Get nearest pending location
    return {
      type: 'new-contact',
      priority: 'normal',
      command: `🎯 CONTINUE COLD CALL CAMPAIGN\n\nReady for next mission. Click "CLOCK IN" to get nearest pending location.\n\nLet's acquire more customers! 💪`,
      location: null
    };

  } catch (error) {
    console.error('Error getting AI command:', error);
    return {
      type: 'error',
      priority: 'normal',
      command: '⚠️ AI Boss system temporarily offline. Use manual mission selection. Continue the grind! 💪',
      error: error.message
    };
  }
});

/**
 * Complete Scheduled Action
 * Marks a scheduled action as completed
 */
exports.completeScheduledAction = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { actionId } = request.data;

  if (!actionId) {
    throw new Error('actionId is required');
  }

  try {
    await db.collection('scheduledActions').doc(actionId).update({
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedBy: request.auth.uid
    });

    return {
      success: true,
      message: 'Scheduled action marked complete'
    };
  } catch (error) {
    console.error('Error completing scheduled action:', error);
    throw new Error('Failed to complete scheduled action');
  }
});

/**
 * Get Upcoming Scheduled Actions
 * Returns all pending scheduled actions for a user
 */
exports.getScheduledActions = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const userId = request.auth.uid;

  try {
    const snapshot = await db.collection('scheduledActions')
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .orderBy('scheduledTime', 'asc')
      .limit(10)
      .get();

    const actions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledTime: doc.data().scheduledTime.toDate().toISOString()
    }));

    return {
      success: true,
      actions: actions,
      count: actions.length
    };
  } catch (error) {
    console.error('Error getting scheduled actions:', error);
    throw new Error('Failed to get scheduled actions');
  }
});
