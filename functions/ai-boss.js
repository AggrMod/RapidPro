/**
 * AI BOSS - Autonomous Decision Engine for Field Operations
 *
 * This module provides AI-powered tactical guidance for field technicians.
 * It analyzes interaction notes, determines next best actions, schedules follow-ups,
 * and prioritizes leads automatically using Google Gemini AI.
 */

const { onCall } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get Firestore instance - will be initialized by index.js
const getDb = () => admin.firestore();
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

/**
 * analyzeInteraction - Core AI Boss Function
 *
 * Analyzes field interaction notes and provides tactical guidance.
 *
 * @param {Object} request.data
 * @param {string} request.data.locationId - Firestore location document ID
 * @param {string} request.data.note - Interaction notes from field tech
 * @param {number} request.data.efficacyScore - Rating 1-5
 * @param {string} request.data.timestamp - ISO timestamp of interaction
 *
 * @returns {Object} AI guidance with analysis, actions, and priority
 */
exports.analyzeInteraction = onCall({
  enforceAppCheck: false,
  secrets: [GEMINI_API_KEY]
}, async (request) => {
  // Get userId from auth or use 'anonymous' for testing
  const userId = request.auth ? request.auth.uid : 'anonymous';

  const { locationId, note, efficacyScore, timestamp } = request.data;

  if (!locationId || !note) {
    throw new Error('locationId and note are required');
  }

  try {
    // 1. Gather context (optional - use empty context if location not found)
    let context;
    try {
      context = await gatherContext(locationId, userId);
    } catch (contextError) {
      console.log('Context gathering failed, using minimal context:', contextError.message);
      context = {
        location: { name: locationId },
        interactionCount: 0,
        lastInteraction: null,
        activeCustomers: 0,
        pendingCount: 0,
        interactionHistory: []
      };
    }

    // 2. Analyze with Gemini AI
    const aiGuidance = await callGeminiAI(note, efficacyScore, context, timestamp);

    // 3. Store AI decision for learning
    await getDb().collection('aiDecisions').add({
      locationId,
      userId: userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      input: { note, efficacyScore },
      output: aiGuidance,
      context: {
        activeCustomers: context.activeCustomers,
        pendingCount: context.pendingCount
      }
    });

    // 4. Create scheduled action if recommended
    if (aiGuidance.scheduledAction) {
      await getDb().collection('scheduledActions').add({
        locationId,
        locationName: context.location.name,
        userId: userId,
        scheduledTime: new Date(aiGuidance.scheduledAction.time),
        action: aiGuidance.scheduledAction.action,
        reason: aiGuidance.scheduledAction.reason,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // 5. Update location with AI insights (optional - skip if location doesn't exist)
    try {
      await getDb().collection('locations').doc(locationId).update({
        priority: aiGuidance.leadPriority || 'medium',
        lastAIAnalysis: admin.firestore.FieldValue.serverTimestamp(),
        interactionCount: admin.firestore.FieldValue.increment(1)
      });
    } catch (updateError) {
      console.log('Could not update location (may not exist):', updateError.message);
      // This is okay - we still have the AI analysis
    }

    return {
      success: true,
      ...aiGuidance
    };

  } catch (error) {
    console.error('AI Boss error:', error);

    // Graceful fallback - return rule-based guidance
    return generateFallbackGuidance(note, efficacyScore);
  }
});

/**
 * getAICommand - Get current tactical command for tech
 *
 * Returns the most urgent action the tech should take RIGHT NOW.
 * Prioritizes: scheduled actions due soon > high-priority leads > new contacts
 *
 * @returns {Object} Current command with type, message, and location details
 */
exports.getAICommand = onCall({ enforceAppCheck: false }, async (request) => {
  // Get userId from auth or use 'anonymous' for testing
  const userId = request.auth ? request.auth.uid : 'anonymous';
  const currentTime = new Date();
  const upcomingWindow = new Date(currentTime.getTime() + 30 * 60000); // 30 min window

  try {
    // Check for scheduled actions due in next 30 minutes
    const upcomingActionsSnapshot = await getDb().collection('scheduledActions')
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .where('scheduledTime', '<=', upcomingWindow)
      .orderBy('scheduledTime', 'asc')
      .limit(1)
      .get();

    if (!upcomingActionsSnapshot.empty) {
      const actionDoc = upcomingActionsSnapshot.docs[0];
      const action = actionDoc.data();
      const minutesUntil = Math.round((action.scheduledTime.toDate() - currentTime) / 60000);

      const urgency = minutesUntil <= 5 ? '🚨 CRITICAL' : minutesUntil <= 15 ? '⚡ URGENT' : '⏰ UPCOMING';

      return {
        type: 'scheduled-action',
        urgency: urgency,
        minutesUntil: minutesUntil,
        command: `${urgency} - SCHEDULED ACTION IN ${minutesUntil} MINUTES!\n\n${action.action}\n\nLocation: ${action.locationName}\nReason: ${action.reason}\n\nExecute immediately! 💪`,
        locationName: action.locationName,
        locationId: action.locationId,
        actionId: actionDoc.id,
        scheduledTime: action.scheduledTime.toDate().toISOString()
      };
    }

    // No urgent scheduled actions - check for high-priority leads
    const highPrioritySnapshot = await getDb().collection('locations')
      .where('priority', '==', 'high')
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (!highPrioritySnapshot.empty) {
      const location = highPrioritySnapshot.docs[0].data();
      const locationId = highPrioritySnapshot.docs[0].id;

      // Get last interaction for context
      const lastInteraction = await getDb().collection('interactions')
        .where('locationId', '==', locationId)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      let contextNote = '';
      if (!lastInteraction.empty) {
        const interaction = lastInteraction.docs[0].data();
        contextNote = `\n\nLast contact: ${interaction.note.substring(0, 100)}...`;
      }

      return {
        type: 'high-priority-lead',
        command: `🔥 HIGH-PRIORITY LEAD\n\nLocation: ${location.name}\nAddress: ${location.address}\nType: ${location.type}${contextNote}\n\nThis lead is hot. Follow up ASAP! 🎯`,
        locationId: locationId,
        location: location
      };
    }

    // Default: suggest getting next new contact mission
    return {
      type: 'volume-phase',
      command: `🎯 READY FOR NEW MISSION\n\nNo urgent actions right now. Click "GET MISSION" to continue your cold call volume phase.\n\nFocus: Maximize contacts. Every door you knock builds the pipeline! 💪`
    };

  } catch (error) {
    console.error('Error getting AI command:', error);
    throw new Error('Failed to get AI command');
  }
});

/**
 * completeScheduledAction - Mark scheduled action as complete
 *
 * @param {string} request.data.actionId - Scheduled action document ID
 */
exports.completeScheduledAction = onCall({ enforceAppCheck: false }, async (request) => {
  // Get userId from auth or use 'anonymous' for testing
  const userId = request.auth ? request.auth.uid : 'anonymous';

  const { actionId } = request.data;

  if (!actionId) {
    throw new Error('actionId is required');
  }

  try {
    await getDb().collection('scheduledActions').doc(actionId).update({
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, message: 'Scheduled action marked complete' };
  } catch (error) {
    console.error('Error completing scheduled action:', error);
    throw new Error('Failed to complete scheduled action');
  }
});

/**
 * getScheduledActions - Get all upcoming scheduled actions for user
 *
 * @returns {Array} List of scheduled actions sorted by time
 */
exports.getScheduledActions = onCall({ enforceAppCheck: false }, async (request) => {
  // Get userId from auth or use 'anonymous' for testing
  const userId = request.auth ? request.auth.uid : 'anonymous';

  try {
    const snapshot = await getDb().collection('scheduledActions')
      .where('userId', '==', request.auth.uid)
      .where('status', '==', 'pending')
      .orderBy('scheduledTime', 'asc')
      .get();

    const actions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledTime: doc.data().scheduledTime.toDate().toISOString()
    }));

    return { success: true, actions };
  } catch (error) {
    console.error('Error getting scheduled actions:', error);
    throw new Error('Failed to get scheduled actions');
  }
});

/**
 * HELPER FUNCTIONS
 */

/**
 * Gather context for AI analysis
 */
async function gatherContext(locationId, userId) {
  // Get location details
  const locationDoc = await getDb().collection('locations').doc(locationId).get();
  if (!locationDoc.exists) {
    throw new Error('Location not found');
  }
  const location = locationDoc.data();

  // Get interaction history for this location
  const interactionsSnapshot = await getDb().collection('interactions')
    .where('locationId', '==', locationId)
    .orderBy('timestamp', 'desc')
    .limit(5)
    .get();

  const interactionHistory = interactionsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      date: data.timestamp ? new Date(data.timestamp._seconds * 1000).toLocaleDateString() : 'Unknown',
      note: data.note,
      efficacyScore: data.efficacyScore || 0
    };
  });

  // Get current customer counts
  const completedSnapshot = await getDb().collection('locations')
    .where('status', '==', 'completed')
    .get();
  const activeCustomers = completedSnapshot.size;

  const pendingSnapshot = await getDb().collection('locations')
    .where('status', '==', 'pending')
    .get();
  const pendingCount = pendingSnapshot.size;

  return {
    location,
    interactionHistory,
    activeCustomers,
    pendingCount
  };
}

/**
 * Call Gemini AI for tactical analysis
 */
async function callGeminiAI(note, efficacyScore, context, timestamp) {
  const currentTime = new Date(timestamp || Date.now());

  // Build comprehensive prompt
  const prompt = `You are the AI Boss for a refrigeration technician doing cold calls to acquire commercial kitchen customers. Analyze this field interaction and provide tactical guidance.

CURRENT CONTEXT:
- Current time: ${currentTime.toLocaleTimeString()} on ${currentTime.toLocaleDateString()}
- Location: ${context.location.name} (${context.location.type || 'commercial kitchen'})
- Address: ${context.location.address}
- Current customer count: ${context.activeCustomers}
- Pending locations: ${context.pendingCount}
- Business goal: Acquire active customers through field visits

INTERACTION JUST LOGGED:
"${note}"

EFFICACY SCORE: ${efficacyScore}/5

PREVIOUS INTERACTIONS AT THIS LOCATION:
${context.interactionHistory.length > 0
  ? context.interactionHistory.map(i => `- ${i.date}: "${i.note}" (Score: ${i.efficacyScore}/5)`).join('\n')
  : 'None - this is the first contact attempt'}

YOUR JOB:
Analyze what just happened and provide clear, actionable tactical guidance. Be direct and commanding - you're the boss giving orders, not making suggestions.

THINK THROUGH:
1. What actually happened in this interaction?
2. What does the efficacy score tell us about how it went?
3. Is this a hot lead (ready to buy), warm lead (interested but needs nurturing), or cold (rejected/not interested)?
4. Should the tech follow up? If yes, WHEN EXACTLY (provide specific date/time)?
5. What should the tech do RIGHT NOW (next 5 minutes)?

RESPOND IN VALID JSON FORMAT (no markdown, no extra text):
{
  "analysis": "2-3 sentence analysis of what happened and what it means",
  "immediateAction": "Clear order for what tech should do right now (next 5 min)",
  "scheduledAction": {
    "time": "ISO 8601 timestamp (e.g., 2025-01-15T15:30:00Z) or null if no follow-up needed",
    "action": "What to do at that time",
    "reason": "Why this timing is strategic"
  },
  "leadPriority": "critical|high|medium|low",
  "nextMissionType": "new-contact|follow-up|scheduled-return|nurture",
  "aiCommand": "What to show tech in commanding, motivational voice (2-4 sentences, use emojis sparingly)"
}

IMPORTANT RULES:
- If efficacy score is 1-2: Likely rejection, set priority to "low", schedule long-term nurture if any follow-up
- If efficacy score is 3: Neutral contact, assess based on note content
- If efficacy score is 4-5: Strong contact, likely hot/warm lead, prioritize follow-up
- If note mentions "owner interested" or "wants estimate": CRITICAL priority, immediate follow-up
- If note mentions "call back at X time" or "come back at X": Schedule return for that EXACT time (or 10 min before)
- If note mentions "already have vendor" or "not interested": Low priority, schedule 6-month check-in
- Always be specific with times - no vague "later" or "soon"
- Commands should be direct orders, not suggestions: "Move to next location" not "You might want to consider..."

RESPOND NOW WITH VALID JSON ONLY:`;

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response (Gemini sometimes wraps it in markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Gemini response did not contain valid JSON:', responseText);
      throw new Error('Invalid Gemini response format');
    }

    const aiGuidance = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!aiGuidance.analysis || !aiGuidance.immediateAction || !aiGuidance.aiCommand) {
      throw new Error('Gemini response missing required fields');
    }

    return aiGuidance;

  } catch (error) {
    console.error('Gemini AI call failed:', error);
    throw error;
  }
}

/**
 * Rule-based fallback guidance when AI fails
 */
function generateFallbackGuidance(note, efficacyScore) {
  let guidance = {
    analysis: "AI analysis unavailable. Using rule-based guidance.",
    immediateAction: "Move to next location and continue volume phase.",
    scheduledAction: null,
    leadPriority: "medium",
    nextMissionType: "new-contact",
    aiCommand: "Interaction logged. Continue to next location. 💪"
  };

  // Simple rules based on efficacy score
  if (efficacyScore >= 4) {
    guidance.leadPriority = "high";
    guidance.aiCommand = "🔥 Strong contact! Follow up within 48 hours. For now, move to next location.";
  } else if (efficacyScore <= 2) {
    guidance.leadPriority = "low";
    guidance.aiCommand = "Contact logged. Move to next location and maintain momentum. 💪";
  }

  // Check for common keywords in note
  const noteLower = note.toLowerCase();

  if (noteLower.includes('owner') && (noteLower.includes('interested') || noteLower.includes('estimate'))) {
    guidance.leadPriority = "critical";
    guidance.nextMissionType = "follow-up";
    guidance.aiCommand = "🚨 HOT LEAD! Owner is interested. Prepare estimate ASAP. This is a priority!";
  }

  if (noteLower.includes('call back') || noteLower.includes('come back')) {
    guidance.leadPriority = "high";
    guidance.nextMissionType = "scheduled-return";
    guidance.aiCommand = "⏰ Follow-up requested. Note the timing and return as promised. Move to next location now.";
  }

  if (noteLower.includes('not interested') || noteLower.includes('have someone')) {
    guidance.leadPriority = "low";
    guidance.aiCommand = "Polite rejection noted. Don't dwell - volume is key. Next location! 💪";
  }

  return {
    success: true,
    fallbackMode: true,
    ...guidance
  };
}

module.exports = {
  analyzeInteraction: exports.analyzeInteraction,
  getAICommand: exports.getAICommand,
  completeScheduledAction: exports.completeScheduledAction,
  getScheduledActions: exports.getScheduledActions
};
