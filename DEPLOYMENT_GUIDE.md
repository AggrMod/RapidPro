# RapidPro Backend Deployment Guide

## 🚀 Quick Start - Get Your Backend Working

Your backend is ready to deploy! Follow these steps to get your assignment tracking system live.

---

## Prerequisites

✅ Firebase CLI installed (Done!)
⏳ Need to authenticate with Firebase
⏳ Need to set up Gemini API key
⏳ Deploy functions and rules

---

## Step 1: Authenticate with Firebase

Run this command in your terminal:

```bash
cd /home/user/RapidPro
firebase login
```

This will:
- Open a browser for Google authentication
- Link your Firebase project (`rapidpro-memphis`)
- Enable deployment commands

**Alternative (CI/CD)**: If you need non-interactive auth:
```bash
firebase login:ci
# Save the token, then set: export FIREBASE_TOKEN="your-token"
```

---

## Step 2: Install Function Dependencies

```bash
cd /home/user/RapidPro/functions
npm install
```

This installs:
- `firebase-functions` (v6.5.0)
- `firebase-admin` (v13.5.0)
- `axios` (for Gemini API calls)
- `geofire-common` (for location queries)

---

## Step 3: Set Up Gemini API Key (CRITICAL)

### Get Your Gemini API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. **Add restrictions** (important for security):
   - HTTP referrers: `*.firebaseapp.com/*`, `*.web.app/*`
   - OR Server restrictions: Your Cloud Functions region

### Set the API Key as a Firebase Secret

```bash
cd /home/user/RapidPro
firebase functions:secrets:set GEMINI_API_KEY
```

When prompted, paste your NEW Gemini API key.

**Why this matters**: Your code now uses `defineString('GEMINI_API_KEY')` instead of hardcoding the key. This keeps it secure.

---

## Step 4: Deploy Everything

### Option A: Deploy All at Once (Recommended)

```bash
cd /home/user/RapidPro
firebase deploy
```

This deploys:
- ✅ Hosting (updated website with new phone number)
- ✅ Cloud Functions (backend for assignment tracking)
- ✅ Firestore Rules (security rules)
- ✅ Storage Rules (image upload security)

### Option B: Deploy Individually

```bash
# Deploy hosting only (fixes phone number display)
firebase deploy --only hosting

# Deploy functions only (backend)
firebase deploy --only functions

# Deploy security rules only
firebase deploy --only firestore:rules,storage:rules
```

---

## Step 5: Verify Deployment

### Check Functions Deployed Successfully

```bash
firebase functions:list
```

You should see:
- ✅ `getNextMission` - Finds nearest pending location
- ✅ `generateIntroScript` - Creates intro phrases
- ✅ `logInteraction` - Records visits
- ✅ `getKPIs` - Gets performance stats
- ✅ `initializeUser` - Sets up user data
- ✅ `generateDailyQuests` - Creates daily quests
- ✅ `getDailyQuests` - Retrieves quests
- ✅ `completeQuest` - Marks quests complete
- ✅ `scheduleDailyQuestsGeneration` - Nightly automation

### Check Hosting URL

```bash
firebase hosting:sites:list
```

Your site should be live at: **https://rapidpro-memphis.web.app**

### View Function Logs

```bash
firebase functions:log
```

---

## Step 6: Test the Backend

### Test in Browser

1. **Visit**: https://rapidpro-memphis.web.app
2. **Login** with your test account: `r22subcooling@gmail.com`
3. **Click**: "CLOCK IN - GET MISSION"
4. **Verify**:
   - ✅ You get a mission assignment
   - ✅ Distance is calculated
   - ✅ Intro script is generated
   - ✅ Can log interactions
   - ✅ KPIs update after completing missions

### Test Phone Number Update

1. Hard refresh the page: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Verify phone number shows: **(901) 257-9417**
3. Check all pages:
   - Main page (index.html)
   - Services page (memphis-services.html)
   - Testimonials (memphis-testimonials.html)
   - Service Areas (memphis-service-areas.html)

---

## Troubleshooting

### Issue: "Phone number still shows old number"

**Cause**: Browser cache
**Solution**:
```bash
# Clear browser cache, then hard refresh
# OR wait 5-10 minutes for CDN to update
```

### Issue: "Function deployment failed"

**Cause**: Missing API key or dependencies
**Solution**:
```bash
# Verify API key is set
firebase functions:secrets:access GEMINI_API_KEY

# Reinstall dependencies
cd functions && npm install

# Try deploying again
firebase deploy --only functions
```

### Issue: "401 Unauthorized when calling functions"

**Cause**: User not authenticated or Firestore rules blocking
**Solution**:
```bash
# Check you're logged into the app
# Verify Firestore rules deployed
firebase deploy --only firestore:rules
```

### Issue: "No missions found"

**Cause**: Location data not seeded
**Solution**:
```bash
# Check if locations exist in Firestore Console
# Go to: https://console.firebase.google.com/project/rapidpro-memphis/firestore

# If empty, you may need to seed data
# (Check if there's a seed script in the project)
```

---

## What Each Backend Component Does

### Assignment Tracking System

**Cloud Functions**:

1. **`getNextMission`**
   - Finds nearest pending location based on your GPS
   - Uses Haversine formula for distance calculation
   - Returns location details, distance, and intro script

2. **`logInteraction`**
   - Records your visit to a location
   - Saves notes, photos, efficacy rating (1-5 stars)
   - Updates location status (pending → completed/attempted)
   - Triggers KPI updates

3. **`getKPIs`**
   - Retrieves your performance metrics
   - Missions completed, avg efficacy, total ops
   - Updates in real-time after each interaction

4. **`generateDailyQuests`**
   - Creates 3-5 daily missions with AI briefings
   - Gemini AI generates tactical mission descriptions
   - Sorts by proximity to your location

**Data Flow**:
```
You → Click "Clock In"
    → getNextMission(currentLat, currentLng)
    → Find nearest pending location
    → Generate intro script
    → Display mission briefing

You → Complete visit
    → logInteraction(locationId, efficacyScore, notes, photos)
    → Update location status
    → Update your KPIs
    → Unlock next mission
```

---

## Security Notes

### What We Fixed

✅ **Removed hardcoded API keys** - Now uses Firebase Secrets
✅ **Restricted Firestore writes** - Only Cloud Functions can modify locations/KPIs
✅ **Added input validation** - All user inputs sanitized
✅ **User-specific data** - Each user can only access their own data

### What's Protected

- **Locations**: Read-only from client, Cloud Functions manage writes
- **Interactions**: Users can only read/create their own
- **KPIs**: Read-only from client, auto-calculated by backend
- **Quests**: Read-only from client, generated by scheduled functions

---

## Cost Monitoring

### Expected Costs (100 missions/month)

- Firestore: ~$0.50/month
- Cloud Functions: ~$1.00/month
- Storage: ~$0.25/month
- Hosting: FREE
- **Total**: ~$2/month (likely within free tier)

### Set Up Billing Alerts

1. Go to: https://console.cloud.google.com/billing
2. Set budget alerts at: $5, $10, $20
3. Get email notifications before overspending

---

## Next Steps After Deployment

### Immediate
- [ ] Test complete workflow end-to-end
- [ ] Verify phone number displays correctly
- [ ] Check all functions respond without errors
- [ ] Confirm KPIs update after logging interactions

### This Week
- [ ] Set up Firebase Performance Monitoring
- [ ] Configure error tracking (Sentry)
- [ ] Add rate limiting to functions
- [ ] Review function logs for errors

### This Month
- [ ] Add unit tests
- [ ] Enable App Check for production
- [ ] Set up automated backups
- [ ] Monitor costs and usage

---

## Quick Reference Commands

```bash
# Full deployment
firebase deploy

# Deploy only hosting (website updates)
firebase deploy --only hosting

# Deploy only functions (backend)
firebase deploy --only functions

# Deploy only rules (security)
firebase deploy --only firestore:rules,storage:rules

# View logs
firebase functions:log

# Check deployment status
firebase projects:list

# See what's deployed
firebase functions:list

# Monitor in real-time
firebase functions:log --follow
```

---

## Support Resources

- **Firebase Console**: https://console.firebase.google.com/project/rapidpro-memphis
- **Hosting Dashboard**: https://console.firebase.google.com/project/rapidpro-memphis/hosting
- **Functions Dashboard**: https://console.firebase.google.com/project/rapidpro-memphis/functions
- **Firestore Dashboard**: https://console.firebase.google.com/project/rapidpro-memphis/firestore
- **Live Site**: https://rapidpro-memphis.web.app

---

## Ready to Deploy?

Run these commands in order:

```bash
# 1. Authenticate
cd /home/user/RapidPro
firebase login

# 2. Install dependencies
cd functions && npm install && cd ..

# 3. Set API key
firebase functions:secrets:set GEMINI_API_KEY

# 4. Deploy everything
firebase deploy

# 5. Test it!
# Visit: https://rapidpro-memphis.web.app
```

---

**Status**: Ready to deploy! ✅
**Phone Number Update**: Committed, pending hosting deployment
**Backend**: Code ready, needs API key + deployment
**Security Fixes**: Applied and ready to deploy

Let's get your assignment tracking system live! 🚀
