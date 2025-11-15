# Agent 1 - Task 1: First Contact Tracker

**Welcome back!** Your lead conversion system is deployed and working great. Time for the next piece.

---

## Your Job: Build the Door-Knock Logger

**File to create:** `js/first-contact-tracker.js`

**What it does:** Lets Terry quickly log door-knock attempts on mobile/tablet

---

## The Interface

```
┌─────────────────────────────────────┐
│  DOOR KNOCK LOGGER                  │
├─────────────────────────────────────┤
│                                     │
│  📍 Memphis BBQ Company             │
│  📍 123 Beale St                    │
│                                     │
│  OUTCOME:                           │
│  ┌──────────┐  ┌──────────┐        │
│  │NO ANSWER │  │NOT INTER │        │
│  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐        │
│  │INTERESTED│  │CALL BACK │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  Quick Notes: (optional)            │
│  ┌─────────────────────────────┐   │
│  │ Owner arrives at 2pm        │   │
│  └─────────────────────────────┘   │
│                                     │
│  [ LOG & NEXT LOCATION ]            │
└─────────────────────────────────────┘
```

---

## 4 Outcomes to Handle

### 1. NO ANSWER
- Save attempt
- Show in dashboard as "needs retry"
- Suggest: Try again in 3 days

### 2. NOT INTERESTED
- Save attempt with status: "rejected"
- Ask: "Rejection reason?" (optional dropdown)
- Remove from active target list

### 3. INTERESTED ⭐
- Save attempt with status: "interested"
- **Launch your lead conversion flow!** (you already built this)
- Create the lead record

### 4. CALL BACK LATER
- Save attempt
- Ask: "When to return?" (date/time picker)
- Create reminder

---

## Data to Save

**Firestore Collection:** `contactAttempts`

```javascript
{
  locationId: "abc123",
  attemptDate: timestamp,
  outcome: "no_answer" | "not_interested" | "interested" | "callback",
  notes: "Owner arrives at 2pm",
  gps: { lat: 35.1474, lng: -90.0489 },
  nextAttemptDate: timestamp (if callback),
  rejectionReason: "Already has provider" (if rejected)
}
```

---

## Dashboard Integration

**Add button in Mission Control panel:**

```html
<button class="action-btn" onclick="showDoorKnockLogger()">
  📋 LOG DOOR KNOCK
</button>
```

**Modal shows:**
1. Current location from GPS (or let Terry search)
2. Big buttons for 4 outcomes
3. Optional notes field
4. Submit → Log it → Show next closest location

---

## Mobile-First Design

**Must work on phone!**
- Large tap targets (buttons 60px+ height)
- Minimal typing required
- GPS auto-detection
- Quick submit (2 taps max for simple "no answer")

---

## Your Branch

```bash
git checkout main
git pull origin main
git checkout -b agent1-leads/door-knock-logger

# Build js/first-contact-tracker.js
# Add button to dashboard.html
# Add CSS styles

git add .
git commit -m "Agent 1: First contact door-knock tracker"
git push origin agent1-leads/door-knock-logger
```

---

## When You're Done

Tell Terry: **"Agent 1: Door-knock logger complete. Branch: agent1-leads/door-knock-logger"**

---

## Success Criteria

✅ Terry can log door-knocks in under 5 seconds
✅ Works on mobile phone
✅ GPS location captured
✅ "Interested" outcome launches lead conversion
✅ Data saves to Firestore

---

**Focus on this ONE task.** Build it well. Keep it simple. Make it fast.

Go! 🚀
