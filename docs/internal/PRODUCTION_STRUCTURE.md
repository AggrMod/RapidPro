# 🏗️ RapidPro Production Structure

**Clean, Simple, Easy to Understand**

---

## 📁 Directory Structure

```
/RapidPro/
├── index.html              ← Marketing Website (deployed)
├── dashboard.html          ← Field Ops Dashboard (deployed)
│
├── css/
│   └── style.css          ← Main dashboard styles (deployed)
│   └── (other CSS for marketing site)
│
├── js/
│   ├── auth.js            ← Firebase authentication
│   ├── config.js          ← Firebase config
│   ├── dashboard.js       ← Dashboard KPIs and data loading
│   ├── map.js             ← Leaflet map integration
│   └── mission.js         ← Mission workflow + AI Boss integration
│
├── functions/
│   ├── index.js           ← All Cloud Functions
│   ├── ai-boss.js         ← AI Boss Gemini integration
│   ├── package.json       ← Dependencies
│   └── pnpm-lock.yaml     ← Lock file (keep in sync!)
│
├── firebase.json          ← Hosting & functions config
├── firestore.rules        ← Database security rules
├── .github/workflows/
│   └── firebase-deploy.yml ← Auto-deployment
│
└── docs/                   ← Documentation
    ├── CLOUD_CLAUDE_MEGA_TASKLIST.md
    ├── CLOUD_CLAUDE_WORKING_GUIDE.md
    └── (other docs)
```

---

## 🎯 What's What

### Marketing Site
- **Entry:** `index.html`
- **URL:** https://rapidpro-memphis.web.app/
- **Purpose:** Customer-facing marketing website

### Field Ops Dashboard
- **Entry:** `dashboard.html`
- **URL:** https://rapidpro-memphis.web.app/dashboard.html
- **Purpose:** Technician field operations dashboard
- **Features:**
  - Login/auth
  - Mission assignment (Get Next Mission)
  - Interaction logging (5-star rating + notes + photos)
  - AI Boss tactical guidance (Gemini 2.5 Flash)
  - KPI tracking
  - Interactive map

---

## 🚀 What Was Removed

### Deleted Directories:
- `/public/` - Duplicate files, not deployed (confusing)
- `/dashboard/` - Old experimental dashboard, not deployed (confusing)

### Why?
These directories caused confusion about which files were actually deployed. Firebase deploys from **ROOT (.)** not subdirectories.

---

## 🔧 Deployment

### Auto-Deployment (Main & Dev Branches)
When you push to `main` or `dev`, GitHub Actions automatically deploys:
- Hosting (HTML/CSS/JS)
- Cloud Functions

**Check status:** https://github.com/AggrMod/RapidPro/actions

### Manual Deployment (LOCAL Claude Only)
```bash
firebase deploy --only hosting    # Deploy frontend
firebase deploy --only functions  # Deploy backend
firebase deploy                   # Deploy everything
```

---

## 👥 Workflow for Cloud Claude

### Before Starting Work:
```bash
git checkout main
git pull origin main
git checkout -b claude/task-name
```

### After Completing Work:
```bash
git add .
git commit -m "Task #X: Description"
git push origin claude/task-name
```

### Tell Terry:
"Task #X complete. Branch: claude/task-name"

### LOCAL Claude Will:
1. Deploy preview channel for testing
2. Merge to main when approved
3. Auto-deployment handles the rest

---

## ⚠️ Important Rules

1. **Edit ROOT files** - Dashboard files are in ROOT, not subdirectories
2. **Keep lockfile in sync** - Run `pnpm install` after changing package.json
3. **Test before merging** - Use Firebase preview channels
4. **Pull before work** - Always start with latest main
5. **Don't edit locally without pulling** - Both Claudes follow this rule

---

## 🧪 Testing

### Production URLs:
- Marketing: https://rapidpro-memphis.web.app/
- Dashboard: https://rapidpro-memphis.web.app/dashboard.html

### Test AI Boss:
- https://rapidpro-memphis.web.app/test-ai-boss-simple.html

### Local Testing:
```bash
firebase serve
# Dashboard: http://localhost:5000/dashboard.html
```

---

## 📊 Firebase Resources

### Cloud Functions (13 deployed):
- `getNextMission` - Finds closest pending location
- `logInteraction` - Logs field visit
- `analyzeInteraction` - AI Boss analysis (Gemini)
- `getAICommand` - Gets AI tactical command
- `completeScheduledAction` - Completes follow-up
- `getScheduledActions` - Gets upcoming actions
- `getKPIs` - Dashboard stats
- `generateIntroScript` - Creates intro script
- `initializeUser` - Sets up new user
- `createUser` - Creates auth user
- `generateDailyQuests` - Morning quest system
- `getDailyQuests` - Fetches quests
- `completeQuest` - Marks quest complete

### Firestore Collections:
- `locations` - All target locations (pending missions)
- `users` - User profiles
- `interactions` - Logged field visits
- `scheduledActions` - AI Boss follow-up actions
- `dailyQuests` - Gamification quests

---

## 🎨 Current Theme

Dark blue/cyan tactical theme with gaming aesthetics.

To change colors, edit `/css/style.css` lines 8-20 (CSS variables).

---

## 📝 Next Steps (Task List)

See `CLOUD_CLAUDE_MEGA_TASKLIST.md` for 50 organized tasks to build out the dashboard.

**Current priority:**
- Task #1: View All Missions ✅ (In progress by Cloud Claude)
- Task #2: Mission Details View
- Task #3: Edit Mission/Location
- Task #4: Close/Complete Mission
- Task #5: Reopen Closed Mission

---

**Last Cleaned:** November 15, 2025
**By:** LOCAL Claude
**Status:** ✅ Production-ready, clean structure
