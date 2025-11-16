# Human-Centered AI Architecture

## Core Philosophy: AI-Assisted Choice, Not AI-Dictated

**Last Updated:** 2025-11-15
**Status:** ✅ Implemented in Production
**Implementation:** `js/lead-conversion.js` - AI Tactical Guidance Modal

---

## Design Principle

> **"Don't have the AI decide for the human. Have the AI *inform* the human so they can make the best decision."**
>
> — Gemini AI Boss Recommendation (2025-11-15)

The RapidPro Memphis system implements a **human-centered AI architecture** where:

1. **AI provides context** - Schedule analysis, priority assessment, recommendations
2. **Human makes decision** - Technician chooses final action based on AI insights + ground reality
3. **System executes choice** - Immediate action routing based on human decision

This balances **data-driven intelligence** with **human judgment**, creating a collaborative decision-making model.

---

## Implementation: AI Tactical Guidance Modal

### Use Case: Interested Door Knock Lead

When a technician logs a door knock as **INTERESTED**, the system needs to determine next steps:

- Start work immediately?
- Schedule for later?
- Just log interest and continue route?

### The AI-Assisted Workflow

#### 1. **AI Analysis Phase**

```javascript
// js/lead-conversion.js:112-200
async function getAITacticalAnalysis(locationId, locationData) {
  // Gather context
  const userEmail = window.currentUser?.email;
  const scheduledJobs = await db.collection('scheduledActions')
    .where('assignedTo', '==', userEmail)
    .where('scheduledFor', '>=', todayStart)
    .where('scheduledFor', '<', todayEnd)
    .get();

  // Call Gemini AI for tactical recommendation
  const prompt = `
TACTICAL DECISION REQUIRED:

Location: ${locationData.name}
Address: ${locationData.address}
Current Status: Customer expressed interest during door-knock

Tech Schedule Today:
- Scheduled jobs: ${scheduleInfo.jobsToday}
- Next job at: ${scheduleInfo.nextJobTime}

Question: Should the technician:
1. START WORK NOW - Begin service immediately
2. SCHEDULE FOR LATER - Proper assessment with equipment survey
3. ACKNOWLEDGE & NEXT - Log interest, move to next target

Provide recommendation, reasoning, and priority level.
  `;

  const geminiResponse = await window.geminiAnalyzeDecision(prompt);

  return {
    recommendation: 'start_now' | 'schedule_later' | 'acknowledge_next',
    scheduleStatus: '0 jobs scheduled today',
    priority: 'critical' | 'high' | 'medium' | 'low',
    reasoning: geminiResponse
  };
}
```

**AI Analyzes:**
- ✅ Current technician schedule
- ✅ Existing job commitments
- ✅ Time windows available
- ✅ Priority conflicts
- ✅ Business context (zero customers = capture every lead)

#### 2. **AI Presentation Phase**

The modal displays:

```
┌─────────────────────────────────────────┐
│  🤖 AI BOSS - TACTICAL GUIDANCE         │
├─────────────────────────────────────────┤
│                                         │
│  📊 Situation Analysis                  │
│  Your schedule is clear for the next    │
│  3 hours. No priority conflicts. This   │
│  is an immediate revenue opportunity.   │
│                                         │
│  📅 Your Schedule: 0 jobs today         │
│                                         │
│  💡 AI Recommendation:                  │
│  🚀 START WORK NOW                      │
│                                         │
│  ℹ️ Final decision is yours - AI        │
│     provides context to help choose.    │
│                                         │
├─────────────────────────────────────────┤
│  [🚀 START WORK NOW]                    │
│  [📅 SCHEDULE FOR LATER]                │
│  [✅ ACKNOWLEDGE & NEXT MISSION]        │
└─────────────────────────────────────────┘
```

#### 3. **Human Decision Phase**

Technician Terry sees:
- **AI recommendation** (highlighted but not forced)
- **Schedule context** (clear data about current workload)
- **Three equal options** (all buttons same size, Terry chooses)

Terry can:
- ✅ **Follow AI recommendation** (AI says start now, Terry agrees)
- ✅ **Override AI recommendation** (AI says schedule, but Terry sees urgency and starts now)
- ✅ **Use ground truth** (AI doesn't know customer is aggressive, Terry chooses to schedule)

#### 4. **System Execution Phase**

Based on Terry's choice:

**Option 1: START WORK NOW**
```javascript
async function startWorkNow(locationId) {
  // Create work order immediately
  const workOrder = {
    locationId: locationId,
    status: 'in-progress',
    startedAt: new Date().toISOString(),
    startedBy: window.currentUser?.email,
    type: 'emergency-service',
    billable: true
  };

  await db.collection('workOrders').add(workOrder);

  // Update location status
  await db.collection('locations').doc(locationId).update({
    status: 'active-work-order',
    currentWorkOrderId: workOrderRef.id
  });

  // Show work started confirmation
  showWorkStartedModal(workOrderRef.id, currentLead);
}
```

**Option 2: SCHEDULE FOR LATER**
```javascript
async function scheduleLater(locationId) {
  // Open full lead conversion flow
  showLeadConversionModal();
  // - Equipment survey (3-step wizard)
  // - Pain points assessment
  // - Assessment scheduling
}
```

**Option 3: ACKNOWLEDGE & NEXT**
```javascript
async function acknowledgeAndNext(locationId) {
  // Mark as interested, continue route
  await db.collection('locations').doc(locationId).update({
    status: 'interested',
    followUpNeeded: true
  });

  // Log AI decision for analytics
  await db.collection('aiDecisions').add({
    locationId: locationId,
    decision: 'acknowledge-and-continue',
    decidedAt: new Date().toISOString(),
    decidedBy: window.currentUser?.email
  });

  // Return to dashboard
  loadKPIs();
}
```

---

## Why This Architecture Works

### 1. **Empowers Field Technicians**

Terry is on the ground. He can:
- Read customer tone and urgency
- Assess job complexity visually
- Factor in unstated considerations (weather, traffic, personal energy)

**The AI can't see these factors.** Terry's judgment is critical.

### 2. **Provides Data-Driven Context**

Without AI, Terry might:
- Forget he has a job in 1 hour
- Not realize his schedule is wide open
- Miss that this customer is high-priority

**AI fills knowledge gaps** that humans naturally have.

### 3. **Builds Trust Through Transparency**

The modal shows:
- ✅ **What AI knows** (schedule data)
- ✅ **Why AI recommends** (reasoning displayed)
- ✅ **Human has final say** (explicit message)

This creates **collaborative intelligence**, not automation anxiety.

### 4. **Captures Business Context**

At zero customers, the AI understands:
> "A bird in the hand is worth two in the bush"

AI recommendation: **START WORK NOW** when schedule is clear, because:
- Revenue opportunity is immediate
- Customer is hot and ready
- No conflicts exist
- Building customer base is priority #1

But if Terry sees the job is complex and he's unprepared, **he can override and schedule**.

---

## Anti-Patterns to Avoid

### ❌ AI-Dictated Actions

**Bad Implementation:**
```javascript
// DON'T DO THIS
const aiDecision = await getAIRecommendation();
if (aiDecision === 'start_now') {
  await startWorkNow(locationId);  // No human choice!
}
```

**Why it fails:**
- Removes human agency
- Can't factor ground truth
- Creates resentment toward AI
- Misses edge cases AI can't see

### ❌ AI Without Context

**Bad Implementation:**
```
┌──────────────────────┐
│ What do you want?    │
│ [ Start Now ]        │
│ [ Schedule Later ]   │
└──────────────────────┘
```

**Why it fails:**
- Human doesn't know their schedule
- Can't make informed decision
- No better than random choice
- Wastes AI's analytical power

### ❌ Hidden AI Reasoning

**Bad Implementation:**
```
AI Recommendation: START WORK NOW
(No explanation why)
```

**Why it fails:**
- Human can't validate recommendation
- No trust in AI judgment
- Can't learn from AI insights
- "Black box" decision-making

---

## Design Patterns

### ✅ Pattern 1: AI as Informed Advisor

```
AI Role: Analyst + Advisor
Human Role: Decision Maker
System Role: Executor

Flow: Context → Analysis → Recommendation → Human Choice → Action
```

### ✅ Pattern 2: Graduated Autonomy

**Current Stage (Phase 1):**
- AI recommends
- Human chooses
- System tracks decisions

**Future Stage (Phase 2):**
- AI learns from human choices
- Improves recommendations over time
- Identifies patterns in overrides

**Future Stage (Phase 3):**
- AI can auto-execute low-risk decisions
- Human reviews and can override
- High-risk decisions always require human approval

### ✅ Pattern 3: Transparent Reasoning

Always show:
1. **What data AI used** ("Your schedule: 0 jobs today")
2. **Why AI recommends** ("Immediate revenue opportunity")
3. **Confidence level** (High priority badge)
4. **Human override path** (All buttons equally accessible)

---

## Technical Implementation Details

### Files Modified

**Primary Implementation:**
- `js/lead-conversion.js` (+335 lines)
  - `showAITacticalGuidance()` - Modal display
  - `getAITacticalAnalysis()` - AI analysis engine
  - `displayAIGuidance()` - Recommendation presentation
  - `startWorkNow()` - Immediate work order creation
  - `scheduleLater()` - Lead conversion flow
  - `acknowledgeAndNext()` - Pipeline logging

**Styling:**
- `css/lead-conversion.css` (+277 lines)
  - AI modal layout
  - Priority color coding
  - Loading spinner
  - Toast notifications
  - Mobile-responsive design

**Security:**
- `firestore.rules` - Added `workOrders` collection rules

### Dependencies

**Required:**
- Gemini AI integration (`window.geminiAnalyzeDecision`)
- Firebase Firestore (schedule queries)
- Firebase Auth (user context)

**Graceful Degradation:**
If Gemini unavailable:
```javascript
if (!window.geminiAnalyzeDecision) {
  return {
    recommendation: 'Schedule for proper assessment',
    scheduleStatus: 'Gemini AI not available',
    priority: 'medium',
    reasoning: 'New lead requires detailed equipment survey'
  };
}
```

### Data Flow

```
Door Knock Logger
    ↓
Select "INTERESTED"
    ↓
initializeLeadConversion()
    ↓
showAITacticalGuidance()
    ↓
getAITacticalAnalysis()
    ├→ Query Firestore (schedule)
    ├→ Call Gemini AI
    └→ Return recommendation
    ↓
displayAIGuidance()
    ↓
[Terry sees modal with 3 options]
    ↓
Terry clicks button
    ↓
├→ startWorkNow() → Work Order created
├→ scheduleLater() → Lead conversion wizard
└→ acknowledgeAndNext() → Log + Continue route
```

---

## Future Enhancements

### Phase 2: Learning Loop

Track human overrides:
```javascript
await db.collection('aiDecisions').add({
  aiRecommendation: 'start_now',
  humanChoice: 'schedule_later',
  context: {
    jobsScheduled: 0,
    timeOfDay: '2:00 PM',
    customerType: 'restaurant'
  },
  outcome: 'successful' // Updated after job completion
});
```

Analyze patterns:
- When does Terry override "start now"?
- What factors predict successful overrides?
- Can AI learn Terry's preferences?

### Phase 3: Predictive Scheduling

AI suggests optimal time slots:
```
💡 AI Suggestion:
Based on similar jobs, this will take 2-3 hours.
Your optimal slots:
- Tomorrow 9am-12pm (no conflicts)
- Friday 1pm-4pm (near another job, efficient routing)
```

### Phase 4: Multi-Tech Coordination

AI considers team capacity:
```
⚠️ AI Alert:
Mike is available now and 10 minutes away.
You have a priority job in 1 hour.
Recommend: Assign to Mike, you continue route.
```

---

## Metrics & Success Criteria

### Track Effectiveness

**AI Recommendation Accuracy:**
```sql
SELECT
  ai_recommendation,
  human_choice,
  COUNT(*) as decision_count,
  AVG(CASE WHEN ai_recommendation = human_choice THEN 1 ELSE 0 END) as agreement_rate
FROM ai_decisions
GROUP BY ai_recommendation, human_choice;
```

**Override Analysis:**
```sql
SELECT
  context->>'jobsScheduled' as schedule_load,
  ai_recommendation,
  human_choice,
  outcome
FROM ai_decisions
WHERE ai_recommendation != human_choice;
```

**Business Impact:**
```sql
SELECT
  decision_type,
  AVG(revenue_generated) as avg_revenue,
  AVG(customer_satisfaction) as avg_satisfaction
FROM jobs
JOIN ai_decisions ON jobs.decision_id = ai_decisions.id
GROUP BY decision_type;
```

### Success Indicators

✅ **High Agreement Rate** (70-85%)
- AI recommendations align with human judgment
- System is learning correct patterns

✅ **Low Regret Rate** (<10%)
- When humans override AI, outcomes are positive
- Human judgment is validated

✅ **Revenue Capture** (>90%)
- "Start now" decisions convert to completed jobs
- Minimal lost opportunities

✅ **Tech Satisfaction** (4.5/5 stars)
- Terry trusts AI recommendations
- Feels empowered, not replaced
- Uses system regularly

---

## Conclusion

The human-centered AI architecture creates a **collaborative intelligence system** where:

1. **AI does what AI does best:** Analyze data, identify patterns, provide recommendations
2. **Humans do what humans do best:** Read situations, apply judgment, make final decisions
3. **System does what systems do best:** Execute chosen actions reliably and consistently

This architecture respects human agency while amplifying human capability through AI assistance.

**Result:** Better decisions than either AI or human could make alone.

---

## References

- **Gemini AI Boss Recommendation:** "Give Terry the choice, assisted by the AI" (2025-11-15)
- **Implementation Commit:** fc243d8 - "feat: Add AI-assisted decision modal for interested leads"
- **Related Docs:**
  - `docs/internal/AI_BOSS_SYSTEM_DESIGN.md` - Overall AI Boss architecture
  - `docs/internal/AI_BOSS_PHASE1_DEPLOYED.md` - Phase 1 deployment notes

---

**Document Owner:** Claude (Anthropic AI Assistant)
**Last Updated:** 2025-11-15
**Next Review:** After 100 AI-assisted decisions logged
