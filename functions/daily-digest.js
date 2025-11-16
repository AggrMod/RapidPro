/**
 * DAILY DIGEST SYSTEM - Human-Centered AI Assistant
 *
 * Purpose: Generate friendly, helpful morning summaries for field technicians
 * Philosophy: AI suggests, never commands. Human always has final say.
 * Tone: Conversational colleague, not robotic boss
 */

const { onCall } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get Firestore instance
const getDb = () => admin.firestore();

/**
 * SCHEDULED FUNCTION: Generate Daily Digest
 * Runs every morning at 7 AM (Memphis time)
 * Creates personalized morning summary for each user
 */
exports.generateDailyDigest = onSchedule({
  schedule: '0 7 * * *', // 7:00 AM every day
  timeZone: 'America/Chicago', // Memphis timezone
  region: 'us-central1'
}, async (event) => {
  console.log('🌅 Daily Digest generation started...');

  try {
    // Get all active users
    const usersSnapshot = await getDb().collection('users').get();

    if (usersSnapshot.empty) {
      console.log('No users found');
      return null;
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Generate digest for each user
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      console.log(`Generating digest for user ${userId}`);

      try {
        // Check if user has digest enabled
        const prefs = await getUserPreferences(userId);
        if (!prefs.dailyDigest.enabled) {
          console.log(`User ${userId} has digest disabled - skipping`);
          continue;
        }

        // Generate the digest
        const digest = await generateDigestForUser(userId, userData);

        // Store in Firestore
        await getDb().collection('dailyDigests').doc(`${userId}_${today}`).set({
          userId,
          date: today,
          generatedAt: admin.firestore.FieldValue.serverTimestamp(),
          dismissed: false,
          viewedAt: null,
          ...digest
        });

        console.log(`✅ Digest generated for user ${userId}`);

      } catch (userError) {
        console.error(`Error generating digest for user ${userId}:`, userError);
        // Continue with next user
      }
    }

    console.log('🎯 Daily Digest generation complete!');
    return null;

  } catch (error) {
    console.error('Error in scheduled digest generation:', error);
    throw error;
  }
});

/**
 * CALLABLE FUNCTION: Get Daily Digest
 * Retrieves today's digest for display in dashboard
 */
exports.getDailyDigest = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const userId = request.auth.uid;
  const today = new Date().toISOString().split('T')[0];

  try {
    // Get today's digest
    const digestDoc = await getDb().collection('dailyDigests')
      .doc(`${userId}_${today}`)
      .get();

    if (!digestDoc.exists) {
      // Generate on-demand if doesn't exist
      console.log(`No digest found for ${userId}, generating now...`);
      const userData = await getDb().collection('users').doc(userId).get();
      const digest = await generateDigestForUser(userId, userData.data() || {});

      // Store it
      await getDb().collection('dailyDigests').doc(`${userId}_${today}`).set({
        userId,
        date: today,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        dismissed: false,
        viewedAt: null,
        ...digest
      });

      return { success: true, digest, generatedNow: true };
    }

    // Mark as viewed if first time
    const digestData = digestDoc.data();
    if (!digestData.viewedAt) {
      await digestDoc.ref.update({
        viewedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return { success: true, digest: digestData, generatedNow: false };

  } catch (error) {
    console.error('Error getting daily digest:', error);
    throw new Error('Failed to get daily digest');
  }
});

/**
 * CALLABLE FUNCTION: Dismiss Daily Digest
 * Marks digest as dismissed (user chose not to view)
 */
exports.dismissDailyDigest = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const userId = request.auth.uid;
  const { date } = request.data;

  try {
    await getDb().collection('dailyDigests')
      .doc(`${userId}_${date}`)
      .update({
        dismissed: true,
        dismissedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    return { success: true };

  } catch (error) {
    console.error('Error dismissing digest:', error);
    throw new Error('Failed to dismiss digest');
  }
});

/**
 * CALLABLE FUNCTION: Record Digest Feedback
 * Learns from user responses to suggestions
 */
exports.recordDigestFeedback = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const userId = request.auth.uid;
  const { digestId, itemFeedback, overallHelpfulness, userComments } = request.data;

  try {
    // Store feedback
    const feedbackRef = await getDb().collection('digestFeedback').add({
      digestId,
      userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      itemFeedback: itemFeedback || [],
      overallHelpfulness: overallHelpfulness || 'neutral',
      userComments: userComments || ''
    });

    // Update suggestion accuracy metrics
    if (itemFeedback && itemFeedback.length > 0) {
      await updateSuggestionAccuracy(userId, itemFeedback);
    }

    return {
      success: true,
      message: "Thanks for the feedback! I'm learning from you. 🙏",
      feedbackId: feedbackRef.id
    };

  } catch (error) {
    console.error('Error recording feedback:', error);
    throw new Error('Failed to record feedback');
  }
});

/**
 * CALLABLE FUNCTION: Get User Preferences
 * Retrieves user's AI feature settings
 */
exports.getUserPreferences = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const userId = request.auth.uid;

  try {
    const prefs = await getUserPreferences(userId);
    return { success: true, preferences: prefs };

  } catch (error) {
    console.error('Error getting preferences:', error);
    throw new Error('Failed to get preferences');
  }
});

/**
 * CALLABLE FUNCTION: Update User Preferences
 * Saves user's AI feature settings
 */
exports.updateUserPreferences = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const userId = request.auth.uid;
  const { preferences } = request.data;

  if (!preferences) {
    throw new Error('Preferences object required');
  }

  try {
    await getDb().collection('userPreferences').doc(userId).set(
      preferences,
      { merge: true }
    );

    return { success: true, message: 'Preferences updated successfully' };

  } catch (error) {
    console.error('Error updating preferences:', error);
    throw new Error('Failed to update preferences');
  }
});

/**
 * HELPER FUNCTIONS
 */

/**
 * Generate digest for a specific user
 */
async function generateDigestForUser(userId, userData) {
  // Gather all the data needed for digest
  const context = await gatherDigestContext(userId, userData);

  // Identify time-sensitive items
  const timeSensitive = await identifyTimeSensitiveItems(userId, context);

  // Identify hot leads
  const hotLeads = await identifyHotLeads(userId, context);

  // Generate ideas (route optimization, timing suggestions, etc.)
  const ideas = await generateIdeas(userId, context);

  // Identify patterns from recent interactions
  const patterns = await identifyPatterns(userId, context);

  // Call Gemini to format as conversational summary
  const digestContent = await callGeminiForDigest({
    userId,
    userName: userData.name || 'there',
    timeSensitive,
    hotLeads,
    ideas,
    patterns,
    context
  });

  return digestContent;
}

/**
 * Gather all context needed for digest generation
 */
async function gatherDigestContext(userId, userData) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get all pending locations
  const pendingSnapshot = await getDb().collection('locations')
    .where('status', '==', 'pending')
    .get();

  const pendingLocations = pendingSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Get scheduled actions for today
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));

  const scheduledSnapshot = await getDb().collection('scheduledActions')
    .where('userId', '==', userId)
    .where('status', '==', 'pending')
    .where('scheduledTime', '>=', todayStart)
    .where('scheduledTime', '<=', todayEnd)
    .get();

  const scheduledActions = scheduledSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Get recent interactions (last 7 days)
  const interactionsSnapshot = await getDb().collection('interactions')
    .where('userId', '==', userId)
    .where('timestamp', '>=', sevenDaysAgo)
    .orderBy('timestamp', 'desc')
    .get();

  const recentInteractions = interactionsSnapshot.docs.map(doc => doc.data());

  // Get completed locations count
  const completedSnapshot = await getDb().collection('locations')
    .where('status', '==', 'completed')
    .get();

  return {
    pendingLocations,
    scheduledActions,
    recentInteractions,
    activeCustomers: completedSnapshot.size,
    userLocation: userData.lastKnownLat && userData.lastKnownLng
      ? { lat: userData.lastKnownLat, lng: userData.lastKnownLng }
      : { lat: 35.1495, lng: -90.0490 }, // Memphis default
    currentTime: new Date()
  };
}

/**
 * Identify time-sensitive items for today
 */
async function identifyTimeSensitiveItems(userId, context) {
  const timeSensitive = [];

  // Add scheduled actions
  for (const action of context.scheduledActions) {
    const location = context.pendingLocations.find(loc => loc.id === action.locationId);

    if (location) {
      timeSensitive.push({
        type: 'scheduled_followup',
        locationId: action.locationId,
        locationName: location.name || action.locationName,
        message: action.action,
        context: action.reason,
        urgency: 'high',
        suggestedAction: `Visit at ${new Date(action.scheduledTime.toDate()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
        reasoning: 'Scheduled commitment - they\'re expecting you'
      });
    }
  }

  // Find locations with recent high-engagement (efficacy 4-5) but no follow-up yet
  const recentHighEngagement = context.recentInteractions.filter(i =>
    i.efficacyScore >= 4 &&
    new Date(i.timestamp.toDate()) > new Date(Date.now() - 48 * 60 * 60 * 1000) // Last 48 hours
  );

  for (const interaction of recentHighEngagement) {
    const location = context.pendingLocations.find(loc => loc.id === interaction.locationId);

    if (location) {
      // Check if not already in scheduled actions
      const alreadyScheduled = context.scheduledActions.some(a => a.locationId === location.id);

      if (!alreadyScheduled) {
        timeSensitive.push({
          type: 'hot_lead_followup',
          locationId: location.id,
          locationName: location.name,
          message: `Strong engagement ${Math.round((Date.now() - interaction.timestamp.toDate().getTime()) / (60 * 60 * 1000))} hours ago`,
          context: interaction.note,
          urgency: 'medium',
          suggestedAction: 'Follow up while interest is fresh',
          reasoning: `${interaction.efficacyScore}/5 rating indicates interest`
        });
      }
    }
  }

  return timeSensitive;
}

/**
 * Identify hot leads that need attention
 */
async function identifyHotLeads(userId, context) {
  const hotLeads = [];

  // Find interactions where user mentioned estimate, quote, or pricing
  const estimateRequests = context.recentInteractions.filter(i => {
    const note = (i.notesText || '').toLowerCase();
    return note.includes('estimate') ||
           note.includes('quote') ||
           note.includes('pricing') ||
           note.includes('interested') ||
           note.includes('owner');
  });

  for (const interaction of estimateRequests) {
    const location = context.pendingLocations.find(loc => loc.id === interaction.locationId);

    if (location) {
      const hoursSince = Math.round((Date.now() - interaction.timestamp.toDate().getTime()) / (60 * 60 * 1000));

      hotLeads.push({
        locationId: location.id,
        locationName: location.name,
        message: `Requested estimate ${hoursSince} hours ago`,
        lastInteraction: interaction.timestamp,
        suggestedAction: hoursSince > 24 ? 'Follow up today' : 'Prepare and send estimate',
        draftEmailAvailable: true,
        confidence: 'high',
        reasoning: 'Direct request for pricing indicates buying intent'
      });
    }
  }

  return hotLeads;
}

/**
 * Generate optimization ideas
 */
async function generateIdeas(userId, context) {
  const ideas = [];

  // Route clustering idea
  if (context.pendingLocations.length > 5 && context.userLocation) {
    const clusters = findGeographicClusters(context.pendingLocations, context.userLocation);

    if (clusters.length > 0) {
      const bestCluster = clusters[0];

      ideas.push({
        type: 'route_optimization',
        message: `${bestCluster.locations.length} locations clustered within ${bestCluster.radiusMiles.toFixed(1)} miles`,
        suggestion: 'Visit these in one trip to save drive time',
        potentialValue: `${bestCluster.locations.length} contacts in one route`,
        effort: 'low',
        reasoning: 'Geographic clustering detected - efficient routing opportunity',
        locations: bestCluster.locations.map(l => l.name)
      });
    }
  }

  // Day-of-week pattern idea
  const dayPatterns = analyzeDayOfWeekPatterns(context.recentInteractions);
  if (dayPatterns.bestDay) {
    ideas.push({
      type: 'timing_suggestion',
      message: `${dayPatterns.bestDay}s have shown ${dayPatterns.improvementPct}% better results`,
      suggestion: `Consider scheduling important follow-ups on ${dayPatterns.bestDay}s`,
      potentialValue: `Higher engagement on ${dayPatterns.bestDay}s`,
      effort: 'low',
      reasoning: `Based on ${dayPatterns.sampleSize} interactions`
    });
  }

  return ideas;
}

/**
 * Identify patterns from recent interactions
 */
async function identifyPatterns(userId, context) {
  const patterns = [];

  if (context.recentInteractions.length < 5) {
    return patterns; // Not enough data
  }

  // Time-of-day pattern
  const timePattern = analyzeTimeOfDayPatterns(context.recentInteractions);
  if (timePattern.significant) {
    patterns.push({
      type: 'timing_pattern',
      observation: `${timePattern.bestTime} visits: ${timePattern.bestAvg.toFixed(1)}★ avg, ${timePattern.worstTime} visits: ${timePattern.worstAvg.toFixed(1)}★ avg`,
      suggestion: `Maybe timing matters? Just an observation`,
      dataPoints: context.recentInteractions.length,
      confidence: 'medium',
      tone: 'humble_observation'
    });
  }

  // Location type pattern
  const typePattern = analyzeLocationTypePatterns(context.recentInteractions, context.pendingLocations);
  if (typePattern.significant) {
    patterns.push({
      type: 'location_type_pattern',
      observation: `${typePattern.bestType} locations: ${typePattern.bestAvg.toFixed(1)}★ avg, ${typePattern.worstType}: ${typePattern.worstAvg.toFixed(1)}★ avg`,
      suggestion: `${typePattern.bestType} businesses might be responding better`,
      dataPoints: typePattern.sampleSize,
      confidence: 'medium',
      tone: 'humble_observation'
    });
  }

  return patterns;
}

/**
 * Call Gemini to format digest in conversational tone
 */
async function callGeminiForDigest(data) {
  const currentHour = new Date().getHours();
  const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';

  const prompt = `You are a helpful assistant for a field technician named ${data.userName}. Create a friendly morning summary of their pipeline.

CURRENT TIME: ${timeOfDay}
DATE: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}

TIME-SENSITIVE ITEMS:
${data.timeSensitive.length > 0 ? JSON.stringify(data.timeSensitive, null, 2) : 'None'}

HOT LEADS:
${data.hotLeads.length > 0 ? JSON.stringify(data.hotLeads, null, 2) : 'None'}

IDEAS:
${data.ideas.length > 0 ? JSON.stringify(data.ideas, null, 2) : 'None'}

PATTERNS:
${data.patterns.length > 0 ? JSON.stringify(data.patterns, null, 2) : 'None'}

ADDITIONAL CONTEXT:
- Active customers: ${data.context.activeCustomers}
- Pending locations: ${data.context.pendingLocations.length}
- Recent interactions (7 days): ${data.context.recentInteractions.length}

GUIDELINES FOR YOUR RESPONSE:
1. Tone: Conversational, friendly, like a helpful colleague (not a robot or boss)
2. Use "I noticed" not "You must" - you're making suggestions, not giving orders
3. Explain your reasoning - show your thinking
4. Be humble - acknowledge uncertainty ("might be worth trying", "I'm seeing a pattern")
5. Keep it brief but informative - respect their time
6. Use emojis very sparingly (max 3 total)
7. End with an encouraging but casual sign-off

IMPORTANT:
- If there's nothing urgent or interesting, say so honestly - don't make stuff up
- Present as suggestions/observations, NEVER as commands
- Acknowledge that they know their business better than you
- Make it easy to ignore if they want to do their own thing

RESPOND IN JSON FORMAT:
{
  "greeting": "Personalized morning greeting (friendly, not formal)",
  "summary": "One sentence overview of today's situation",
  "timeSensitive": [
    {
      "title": "Short title",
      "message": "Conversational explanation",
      "suggestion": "What you might want to do (as a suggestion)",
      "why": "Brief reasoning"
    }
  ],
  "hotLeads": [
    {
      "title": "Lead name",
      "message": "What's happening",
      "suggestion": "Possible action (as suggestion)",
      "why": "Brief reasoning"
    }
  ],
  "ideas": [
    {
      "title": "Idea title",
      "message": "The idea explained conversationally",
      "suggestion": "How to act on it (optional)",
      "value": "What they might gain"
    }
  ],
  "patterns": [
    {
      "title": "Pattern title",
      "observation": "What you noticed",
      "suggestion": "What might be worth trying (humble tone)",
      "confidence": "How sure you are (low/medium/high)"
    }
  ],
  "closingMessage": "Encouraging but casual sign-off that gives them full autonomy"
}

REMEMBER: You're a helpful assistant, not the boss. They're in charge - you just provide information and ideas.`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Gemini response did not contain valid JSON:', responseText);
      // Return fallback digest
      return generateFallbackDigest(data);
    }

    const digestContent = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!digestContent.greeting || !digestContent.closingMessage) {
      console.error('Gemini response missing required fields');
      return generateFallbackDigest(data);
    }

    return digestContent;

  } catch (error) {
    console.error('Gemini AI call failed for digest:', error);
    return generateFallbackDigest(data);
  }
}

/**
 * Generate fallback digest if Gemini fails
 */
function generateFallbackDigest(data) {
  return {
    greeting: `Good morning, ${data.userName}!`,
    summary: `You have ${data.timeSensitive.length} time-sensitive items and ${data.hotLeads.length} hot leads to follow up on.`,
    timeSensitive: data.timeSensitive.map(item => ({
      title: item.locationName,
      message: item.message,
      suggestion: item.suggestedAction,
      why: item.reasoning
    })),
    hotLeads: data.hotLeads.map(lead => ({
      title: lead.locationName,
      message: lead.message,
      suggestion: lead.suggestedAction,
      why: lead.reasoning
    })),
    ideas: data.ideas.map(idea => ({
      title: idea.type.replace('_', ' '),
      message: idea.message,
      suggestion: idea.suggestion,
      value: idea.potentialValue
    })),
    patterns: data.patterns.map(pattern => ({
      title: pattern.type.replace('_', ' '),
      observation: pattern.observation,
      suggestion: pattern.suggestion,
      confidence: pattern.confidence
    })),
    closingMessage: "This is just info - you do you! 👍"
  };
}

/**
 * Get user preferences (with defaults if not found)
 */
async function getUserPreferences(userId) {
  const prefsDoc = await getDb().collection('userPreferences').doc(userId).get();

  if (!prefsDoc.exists) {
    // Return defaults
    return {
      dailyDigest: {
        enabled: true,
        frequency: 'daily',
        deliveryTime: '07:00',
        notificationMethod: 'dashboard',
        tone: 'conversational'
      },
      insights: {
        enabled: true,
        threshold: 3,
        interruptLevel: 'low'
      },
      aiSuggestions: {
        leadScoring: true,
        routeOptimization: true,
        timingSuggestions: true,
        draftAssistance: true
      },
      learningPreferences: {
        askForFeedback: true,
        feedbackFrequency: 'sometimes',
        adaptToPreferences: true
      }
    };
  }

  return prefsDoc.data();
}

/**
 * Update suggestion accuracy based on feedback
 */
async function updateSuggestionAccuracy(userId, itemFeedback) {
  for (const feedback of itemFeedback) {
    try {
      await getDb().collection('suggestionHistory').add({
        userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        itemType: feedback.itemType,
        itemId: feedback.itemId,
        userAction: feedback.feedback, // followed, ignored, modified
        outcome: feedback.outcome, // positive, negative, neutral
        notes: feedback.notes,
        efficacyScore: feedback.efficacyScore
      });
    } catch (error) {
      console.error('Error updating suggestion history:', error);
    }
  }
}

/**
 * PATTERN ANALYSIS HELPERS
 */

function findGeographicClusters(locations, userLocation) {
  // Simple clustering: find groups of 3+ locations within 2 miles of each other
  const clusters = [];
  const clustered = new Set();

  for (let i = 0; i < locations.length; i++) {
    if (clustered.has(locations[i].id)) continue;

    const cluster = [locations[i]];
    clustered.add(locations[i].id);

    for (let j = i + 1; j < locations.length; j++) {
      if (clustered.has(locations[j].id)) continue;

      const distance = calculateDistance(
        locations[i].lat,
        locations[i].lng,
        locations[j].lat,
        locations[j].lng
      );

      if (distance < 3.2) { // 2 miles in km
        cluster.push(locations[j]);
        clustered.add(locations[j].id);
      }
    }

    if (cluster.length >= 3) {
      const avgLat = cluster.reduce((sum, loc) => sum + loc.lat, 0) / cluster.length;
      const avgLng = cluster.reduce((sum, loc) => sum + loc.lng, 0) / cluster.length;
      const radiusKm = Math.max(...cluster.map(loc =>
        calculateDistance(avgLat, avgLng, loc.lat, loc.lng)
      ));

      clusters.push({
        locations: cluster,
        center: { lat: avgLat, lng: avgLng },
        radiusKm: radiusKm,
        radiusMiles: radiusKm * 0.621371
      });
    }
  }

  return clusters.sort((a, b) => b.locations.length - a.locations.length);
}

function analyzeTimeOfDayPatterns(interactions) {
  const morningInteractions = interactions.filter(i => {
    const hour = new Date(i.timestamp.toDate()).getHours();
    return hour >= 6 && hour < 12;
  });

  const afternoonInteractions = interactions.filter(i => {
    const hour = new Date(i.timestamp.toDate()).getHours();
    return hour >= 12 && hour < 17;
  });

  if (morningInteractions.length < 3 || afternoonInteractions.length < 3) {
    return { significant: false };
  }

  const morningAvg = morningInteractions.reduce((sum, i) => sum + (i.efficacyScore || 0), 0) / morningInteractions.length;
  const afternoonAvg = afternoonInteractions.reduce((sum, i) => sum + (i.efficacyScore || 0), 0) / afternoonInteractions.length;

  const difference = Math.abs(morningAvg - afternoonAvg);

  if (difference > 1.0) { // Significant if more than 1 star difference
    return {
      significant: true,
      bestTime: morningAvg > afternoonAvg ? 'Morning' : 'Afternoon',
      worstTime: morningAvg > afternoonAvg ? 'Afternoon' : 'Morning',
      bestAvg: Math.max(morningAvg, afternoonAvg),
      worstAvg: Math.min(morningAvg, afternoonAvg)
    };
  }

  return { significant: false };
}

function analyzeLocationTypePatterns(interactions, locations) {
  const typeScores = {};
  const typeCounts = {};

  interactions.forEach(interaction => {
    const location = locations.find(loc => loc.id === interaction.locationId);
    if (location && location.type) {
      const type = location.type;
      if (!typeScores[type]) {
        typeScores[type] = 0;
        typeCounts[type] = 0;
      }
      typeScores[type] += interaction.efficacyScore || 0;
      typeCounts[type]++;
    }
  });

  const types = Object.keys(typeScores).filter(type => typeCounts[type] >= 3);

  if (types.length < 2) {
    return { significant: false };
  }

  const averages = types.map(type => ({
    type,
    avg: typeScores[type] / typeCounts[type],
    count: typeCounts[type]
  }));

  averages.sort((a, b) => b.avg - a.avg);

  const difference = averages[0].avg - averages[averages.length - 1].avg;

  if (difference > 1.0) {
    return {
      significant: true,
      bestType: averages[0].type,
      worstType: averages[averages.length - 1].type,
      bestAvg: averages[0].avg,
      worstAvg: averages[averages.length - 1].avg,
      sampleSize: averages.reduce((sum, a) => sum + a.count, 0)
    };
  }

  return { significant: false };
}

function analyzeDayOfWeekPatterns(interactions) {
  const dayScores = {};
  const dayCounts = {};
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  interactions.forEach(interaction => {
    const dayIndex = new Date(interaction.timestamp.toDate()).getDay();
    const dayName = dayNames[dayIndex];

    if (!dayScores[dayName]) {
      dayScores[dayName] = 0;
      dayCounts[dayName] = 0;
    }
    dayScores[dayName] += interaction.efficacyScore || 0;
    dayCounts[dayName]++;
  });

  const days = Object.keys(dayScores).filter(day => dayCounts[day] >= 2);

  if (days.length < 2) {
    return {};
  }

  const averages = days.map(day => ({
    day,
    avg: dayScores[day] / dayCounts[day],
    count: dayCounts[day]
  }));

  averages.sort((a, b) => b.avg - a.avg);

  const bestDay = averages[0];
  const avgDay = averages[Math.floor(averages.length / 2)];

  const improvement = ((bestDay.avg - avgDay.avg) / avgDay.avg) * 100;

  if (improvement > 20) { // 20% improvement
    return {
      bestDay: bestDay.day,
      improvementPct: Math.round(improvement),
      sampleSize: bestDay.count
    };
  }

  return {};
}

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

// Export all functions
module.exports = {
  generateDailyDigest: exports.generateDailyDigest,
  getDailyDigest: exports.getDailyDigest,
  dismissDailyDigest: exports.dismissDailyDigest,
  recordDigestFeedback: exports.recordDigestFeedback,
  getUserPreferences: exports.getUserPreferences,
  updateUserPreferences: exports.updateUserPreferences
};
