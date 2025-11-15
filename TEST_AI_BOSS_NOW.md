# 🧪 TEST AI BOSS - Quick Start Guide

## ✅ AI Boss is Deployed and Ready!

Your AI Boss system is live in production. Let's test it right now!

---

## 🎯 Option 1: Use the Interactive Test Suite (EASIEST)

I've created a beautiful test page with 5 comprehensive tests.

### Step 1: Deploy the Test Page

```bash
cd /c/Users/tjdot/RapidPro
firebase deploy --only hosting
```

### Step 2: Open the Test Page

Navigate to: **https://rapidpro-memphis.web.app/test-ai-boss.html**

### Step 3: Run Tests

Click the buttons to run each test:

1. **Test 1: Hot Lead** - Manager with urgent equipment failure
2. **Test 2: Warm Lead** - Manager wants callback on Friday
3. **Test 3: Rejection** - Already has vendor under contract
4. **Test 4: Get AI Command** - What should tech do RIGHT NOW?
5. **Test 5: Scheduled Actions** - View upcoming follow-ups

Or click **"Run All Tests"** to execute all 5 sequentially!

---

## 🎯 Option 2: Test from Browser Console (QUICK)

### Step 1: Open Dashboard

Go to: **https://rapidpro-memphis.web.app/public/**

### Step 2: Open Browser Console

Press **F12** → Click **Console** tab

### Step 3: Run This Code

```javascript
// Test Hot Lead Analysis
const analyzeInteraction = firebase.functions().httpsCallable('analyzeInteraction');

analyzeInteraction({
  locationId: 'test-hot-lead-001',
  note: 'Manager Sarah said walk-in cooler failing. Food safety issue. Needs service TODAY!',
  efficacyScore: 5,
  timestamp: new Date().toISOString()
}).then(result => {
  console.log('🤖 AI BOSS RESPONSE:');
  console.log('Analysis:', result.data.analysis);
  console.log('Command:', result.data.aiCommand);
  console.log('Priority:', result.data.leadPriority);
  console.log('Scheduled:', result.data.scheduledAction);
}).catch(err => {
  console.error('Error:', err);
});
```

### Step 4: Check the Response

You should see output like:
```
🤖 AI BOSS RESPONSE:
Analysis: "CRITICAL: Equipment failure affecting food safety. Manager Sarah is highly motivated..."
Command: "🚨 CRITICAL LEAD! Food safety issue = immediate opportunity. Get contact info NOW..."
Priority: "critical"
Scheduled: {time: "2025-11-16T09:00:00Z", action: "Follow up with emergency service quote", ...}
```

---

## 🎯 Option 3: Test from Your Phone (REAL WORLD)

### Step 1: Login to Dashboard

Open **https://rapidpro-memphis.web.app/public/** on your phone

Login with: **r22subcooling@gmail.com**

### Step 2: Get a Mission

Click **"CLOCK IN - GET MISSION"**

### Step 3: Log an Interaction

1. Go to a location (or pretend you did)
2. Fill out the interaction form:
   - **Notes:** "Manager very interested. Equipment old and breaking down. Wants estimate."
   - **Rating:** ⭐⭐⭐⭐⭐ (5 stars)
3. Click **"SUBMIT"**

### Step 4: Check Firestore

Go to Firebase Console → Firestore Database

You should see:
- **`interactions`** collection - Your logged interaction
- **`aiDecisions`** collection - AI Boss analysis
- **`scheduledActions`** collection - Scheduled follow-up (if AI recommended one)

---

## 📊 What to Expect from Each Test

### Test 1: Hot Lead (Critical Priority)

**Input:** Urgent equipment failure, food safety concern, efficacy 5/5

**Expected AI Response:**
```
Priority: CRITICAL
Immediate Action: Get contact info, offer same-day service
Scheduled: Follow-up within 24 hours
AI Command: "🚨 CRITICAL LEAD! Food safety = hot opportunity!..."
```

### Test 2: Warm Lead (High Priority)

**Input:** Manager interested, requests Friday callback, efficacy 4/5

**Expected AI Response:**
```
Priority: HIGH
Immediate Action: Move to next location, don't wait
Scheduled: Call Friday 2-4 PM as requested
AI Command: "Good contact! I've scheduled Friday callback. Keep momentum!..."
```

### Test 3: Rejection (Low Priority)

**Input:** Already has vendor, not interested, efficacy 1/5

**Expected AI Response:**
```
Priority: LOW
Immediate Action: Move to next location immediately
Scheduled: Check back in 6 months (or 2 years when contract expires)
AI Command: "Rejection noted. Don't dwell - volume is key. Next!..."
```

### Test 4: Get AI Command

**Expected Response (if no scheduled actions):**
```
Type: volume-phase
Command: "🎯 READY FOR NEW MISSION. Click GET MISSION to continue..."
```

**Expected Response (if scheduled action due soon):**
```
Type: scheduled-action
Urgency: "🚨 CRITICAL" or "⚡ URGENT" or "⏰ UPCOMING"
Minutes Until: 5
Command: "🚨 CRITICAL - SCHEDULED ACTION IN 5 MINUTES! [Action details]..."
```

### Test 5: Scheduled Actions

**Expected Response:**
```
{
  success: true,
  actions: [
    {
      locationName: "Test Location 001",
      scheduledTime: "2025-11-16T15:00:00Z",
      action: "Call manager Sarah...",
      reason: "She requested Friday callback",
      status: "pending"
    }
  ]
}
```

---

## 🔍 How to Verify It's Working

### Check 1: Firebase Functions Logs

```bash
cd /c/Users/tjdot/RapidPro
firebase functions:log --only analyzeInteraction
```

You should see:
- ✅ Function execution started
- ✅ Gemini API called
- ✅ Response received
- ✅ Firestore writes completed

### Check 2: Firestore Database

Go to: **https://console.firebase.google.com/project/rapidpro-memphis/firestore**

You should see new data in:
- **`aiDecisions`** - Contains AI analysis results
- **`scheduledActions`** - Contains scheduled follow-ups
- **`locations`** - Priority field updated

### Check 3: Function Response Time

In browser console, check response time:
```javascript
const start = Date.now();
analyzeInteraction({...}).then(result => {
  console.log(`⏱️ Response time: ${Date.now() - start}ms`);
});
```

Expected:
- First call (cold start): 2-5 seconds
- Subsequent calls (warm): 1-3 seconds

---

## 🐛 Troubleshooting

### Issue: "Function not found"

**Wait 2 minutes** - Functions take time to propagate after deployment.

### Issue: "User must be authenticated"

**Solution:** Make sure you're logged in:
```javascript
firebase.auth().signInAnonymously().then(() => {
  console.log('Authenticated!');
  // Now run your test
});
```

### Issue: "Secret GEMINI_API_KEY not found"

**Solution:** Verify secret is set:
```bash
firebase functions:secrets:access GEMINI_API_KEY
```

Should output: `AIzaSyB6Mq0Hp2GCrwAO--bxseCEgFBiIEdBLPE`

### Issue: AI returns fallback guidance

**Symptoms:** Response includes `"fallbackMode": true`

**Check logs:**
```bash
firebase functions:log --only analyzeInteraction --limit 50
```

Look for Gemini API errors. Common fixes:
- Verify API key is correct
- Check Gemini API quota
- Ensure Gemini API is enabled in Google Cloud Console

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ `analyzeInteraction` returns structured JSON with:
   - `analysis` (AI interpretation)
   - `immediateAction` (what to do now)
   - `aiCommand` (commanding voice guidance)
   - `leadPriority` (critical/high/medium/low)
   - `scheduledAction` (optional follow-up)

2. ✅ Firestore shows new documents in:
   - `aiDecisions` collection
   - `scheduledActions` collection

3. ✅ Response time is reasonable (1-5 seconds)

4. ✅ AI guidance makes sense for the scenario

---

## 🚀 Next Steps After Testing

Once you've verified the backend works:

### Option A: Deploy Test Page to Production

```bash
cd /c/Users/tjdot/RapidPro
firebase deploy --only hosting
```

Then share with your team: **https://rapidpro-memphis.web.app/test-ai-boss.html**

### Option B: Start Phase 2 Frontend

I can build the dashboard UI to:
- Display AI commands in real-time
- Show scheduled actions calendar
- Add photo upload to interaction form
- Auto-trigger AI analysis after every log

Estimated time: 6-8 hours

### Option C: Test with Real Field Data

Go out and log some real interactions! The AI will analyze them and provide actual tactical guidance.

---

## 📝 Test Results Template

After testing, note your results:

```
TEST RESULTS - [Date]

Test 1 (Hot Lead): ✅ PASS / ❌ FAIL
- Priority assigned: _______
- Scheduled action created: ✅ YES / ❌ NO
- AI command made sense: ✅ YES / ❌ NO

Test 2 (Warm Lead): ✅ PASS / ❌ FAIL
- Priority assigned: _______
- Scheduled action created: ✅ YES / ❌ NO
- AI command made sense: ✅ YES / ❌ NO

Test 3 (Rejection): ✅ PASS / ❌ FAIL
- Priority assigned: _______
- Scheduled action created: ✅ YES / ❌ NO
- AI command made sense: ✅ YES / ❌ NO

Test 4 (Get Command): ✅ PASS / ❌ FAIL
- Command type: _______
- Made sense: ✅ YES / ❌ NO

Test 5 (Scheduled Actions): ✅ PASS / ❌ FAIL
- Actions retrieved: _______
- Data structure correct: ✅ YES / ❌ NO

Notes:
_______________________________________
```

---

**Ready to test? Start with Option 1 (Interactive Test Suite) - it's the easiest!**

Questions? Check the troubleshooting section or review the function logs.

🤖 Your AI Boss is waiting to guide your field operations! 🚀
