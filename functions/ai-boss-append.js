
/**
 * generateMissionIntel - Pre-Mission Intelligence
 *
 * Generates a tactical briefing BEFORE the tech visits a location.
 * Analyzes the business name and type to predict equipment and suggest talking points.
 */
exports.generateMissionIntel = onCall({ enforceAppCheck: false }, async (request) => {
    const { locationId, locationName, locationAddress, locationType } = request.data;
    const userId = request.auth ? request.auth.uid : 'anonymous';

    if (!locationName) {
        throw new Error('Location name is required');
    }

    // Rate limiting
    const hourAgo = Date.now() - 60 * 60 * 1000;
    const recentCalls = await getDb().collection('aiMissionIntel')
        .where('userId', '==', userId)
        .where('timestamp', '>', new Date(hourAgo))
        .count()
        .get();

    if (recentCalls.data().count >= 50) {
        console.warn('Rate limit exceeded for mission intel. Using fallback.');
        return generateFallbackIntel(locationName, locationType);
    }

    // Check cache
    const cacheKey = `intel-${locationId || locationName.replace(/\s+/g, '-').toLowerCase()}`;
    const cached = await getCachedResponse(cacheKey);
    if (cached) {
        return { success: true, cached: true, ...cached };
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are the AI Boss providing pre-mission intelligence for a refrigeration technician.
Target: "${locationName}"
Address: "${locationAddress || 'Unknown'}"
Type: "${locationType || 'Commercial Business'}"

Your goal: Equip the tech with specific knowledge to impress this specific potential customer.

1. PREDICT EQUIPMENT: Based on the business name (e.g., "Sushi Bar" vs "Burger King" vs "Flower Shop"), what specific refrigeration/HVAC equipment do they likely have?
2. PAIN POINTS: What are the specific headaches for this type of business? (e.g., Florist = humidity control; Sushi = precise temps).
3. OPENER: A generic "hello" fails. Give a custom one-liner demonstrating you understand their business.

Respond in valid JSON:
{
  "briefing": "2-sentence hook about why they need us SPECIFICALLY.",
  "likelyEquipment": ["Item 1", "Item 2", "Item 3"],
  "painPoints": ["Pain 1", "Pain 2"],
  "suggestedOpener": "The specific one-liner script to use."
}`;

        const result = await retryWithBackoff(async () => {
            return await model.generateContent(prompt);
        });

        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('Invalid AI response format');
        }

        const intel = JSON.parse(jsonMatch[0]);

        // Cache the result
        await setCachedResponse(cacheKey, intel);

        // Track usage
        await getDb().collection('aiMissionIntel').add({
            locationId: locationId || 'unknown',
            userId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            locationName,
            intel
        });

        return { success: true, ...intel };

    } catch (error) {
        console.error('AI Mission Intel error:', error);
        return generateFallbackIntel(locationName, locationType);
    }
});

function generateFallbackIntel(name, type) {
    return {
        success: true,
        fallback: true,
        briefing: `Target is ${name}. Standard commercial refrigeration setup likely.`,
        likelyEquipment: ["Walk-in Cooler", "Reach-in Freezer", "Ice Machine"],
        painPoints: ["High energy bills", "Health department compliance"],
        suggestedOpener: `Hi, checking if your refrigeration equipment is ready for the upcoming season?`
    };
}
