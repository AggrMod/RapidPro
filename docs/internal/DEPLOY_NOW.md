# 🚀 DEPLOY RAPIDPRO MEMPHIS - COMPLETE GUIDE

## ⚠️ CURRENT STATUS
- ✅ Code updated with phone number (901) 257-9417
- ✅ Map.js improved with better error handling
- ✅ CSP headers fixed
- ✅ Cloud Functions ready
- ✅ Dependencies installed
- ⚠️ **NOT DEPLOYED YET** - Map won't work until deployed!

---

## 🎯 STEP 1: Login to Firebase (Required First!)

```bash
cd C:\Users\tjdot\RapidPro
firebase login
```

**This will:**
- Open a browser window
- Ask you to sign in with Google
- Authorize Firebase CLI

---

## 🎯 STEP 2: Set Gemini API Key

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

**When prompted, paste this:**
```
AIzaSyB6Mq0Hp2GCrwAO--bxseCEgFBiIEdBLPE
```

**What this enables:**
- AI-powered daily quest generation
- Smart mission suggestions
- Automated field ops tasks

---

## 🎯 STEP 3: Deploy Everything

```bash
firebase deploy
```

**This deploys:**
- ✅ Website (hosting) - Updated phone number & map fixes
- ✅ Cloud Functions - Mission system backend
- ✅ Firestore Rules - Security settings
- ✅ Storage Rules - File permissions

**Expected output:**
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/rapidpro-memphis/overview
Hosting URL: https://rapidpro-memphis.web.app
```

---

## 🎯 STEP 4: Seed Location Data

### Option A: Using Firebase Console (Easy - No Service Account Needed)

1. Go to: https://console.firebase.google.com/project/rapidpro-memphis/firestore
2. Click "Start collection"
3. Collection ID: `locations`
4. Add first document with these fields:

```
name: "The Arcade Restaurant"
address: "540 S Main St, Memphis, TN 38103"
lat: 35.1385
lng: -90.0525
status: "pending"
type: "restaurant"
industry: "casual dining"
createdAt: [Click "Add field" → Type: timestamp → Click "Server timestamp"]
lastVisited: null
lastEfficacyScore: null
```

5. Click "Save"
6. Repeat for more locations (or continue to Option B)

### Option B: Using Seed Script (Faster - Adds 15 locations at once)

**First, get a service account key:**

1. Go to: https://console.firebase.google.com/project/rapidpro-memphis/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Download the JSON file
4. Save it as `service-account-key.json` in your RapidPro folder

**Then run the seed script:**

```bash
cd C:\Users\tjdot\RapidPro
node seed-locations.js
```

**Expected output:**
```
Starting to seed locations...
Added: The Arcade Restaurant
Added: Central BBQ
Added: Gus's World Famous Fried Chicken
...
✓ Successfully seeded 15 locations!
Total locations in database: 15
```

---

## 🎯 STEP 5: Test the Map

1. **Visit:** https://rapidpro-memphis.web.app
2. **Login with:** RapidPro.Memphis@gmail.com
3. **Press F12** to open browser console
4. **Look for these success messages:**

```
✅ Dashboard active, initializing map...
✅ Creating Leaflet map...
✅ Map initialized successfully
✅ Loading locations...
✅ Found 15 locations (or however many you seeded)
✅ Filtered to 15 locations
✅ Added markers to map
```

5. **You should see:**
   - Map of Memphis with markers
   - Orange circles = Pending locations
   - Green circles = Completed locations
   - Click markers to see location info

---

## 🚨 TROUBLESHOOTING

### Problem: "Permission denied" error
**Solution:** Firestore rules deployed - should work. If not:
```bash
firebase deploy --only firestore:rules
```

### Problem: "Found 0 locations"
**Solution:** No data in Firestore. Seed the data (Step 4)

### Problem: Map container is blank
**Solution:** Check console for errors. Most likely:
1. Hard refresh: Ctrl+Shift+R
2. Clear cache
3. Check if deployment completed

### Problem: "User not authenticated"
**Solution:** Log out and log back in to the dashboard

### Problem: CSP errors still showing
**Solution:** Deployment propagation delay. Wait 5 minutes, then hard refresh.

---

## 📊 WHAT YOU'LL HAVE AFTER DEPLOYMENT

### ✅ Main Website (https://rapidpro-memphis.web.app)
- Updated phone number: (901) 257-9417
- Memphis service pages
- All marketing content

### ✅ Dashboard (https://rapidpro-memphis.web.app/dashboard/)
- Working map with Memphis locations
- Mission assignment system
- KPI tracking dashboard
- Interaction logging
- Daily quest system (AI-powered)

### ✅ Backend (Cloud Functions)
- `getNextMission` - Assigns nearest location
- `logInteraction` - Records field visits
- `getKPIs` - Performance metrics
- `generateDailyQuests` - AI quest generation
- `getDailyQuests` - Quest retrieval
- `completeQuest` - Quest completion

---

## 🎯 COMPLETE COMMAND SEQUENCE

**Copy/paste these commands one at a time:**

```bash
# 1. Navigate to project
cd C:\Users\tjdot\RapidPro

# 2. Login to Firebase
firebase login

# 3. Set Gemini API key
firebase functions:secrets:set GEMINI_API_KEY
# Paste: AIzaSyB6Mq0Hp2GCrwAO--bxseCEgFBiIEdBLPE

# 4. Deploy everything
firebase deploy

# 5. (Optional) Seed locations if using script method
node seed-locations.js
```

---

## 📝 VERIFICATION CHECKLIST

After deployment, verify:

- [ ] Website loads at https://rapidpro-memphis.web.app
- [ ] Phone number shows (901) 257-9417
- [ ] Can login to dashboard
- [ ] Map displays Memphis
- [ ] Console shows "Map initialized successfully"
- [ ] Console shows "Found X locations"
- [ ] Markers appear on map
- [ ] Can click markers for popups
- [ ] KPI cards show data
- [ ] No red errors in console

---

## 🆘 NEED HELP?

If you see errors after deployment:

1. **Open browser console (F12)**
2. **Copy the error messages**
3. **Share them with me**
4. **I'll help you fix it**

Common errors and solutions are in the TROUBLESHOOTING section above.

---

## 🎉 SUCCESS INDICATORS

You'll know it's working when you see:

✅ Map loads with Memphis visible
✅ Orange/green markers scattered across Memphis
✅ Can click markers to see business names
✅ "CLOCK IN - GET MISSION" button works
✅ Dashboard shows your stats
✅ No errors in browser console

---

## ⏱️ ESTIMATED TIME

- Step 1 (Login): 1 minute
- Step 2 (API Key): 1 minute
- Step 3 (Deploy): 3-5 minutes
- Step 4 (Seed Data): 2 minutes or 1 second (script)
- Step 5 (Test): 2 minutes

**Total: ~10 minutes** 🚀

---

## 🔥 DO THIS NOW

1. Open your terminal
2. Run: `firebase login`
3. Follow the prompts
4. Come back here for next steps

**Let's get your map working!** 🗺️
