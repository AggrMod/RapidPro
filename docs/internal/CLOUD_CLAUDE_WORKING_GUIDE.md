# 📋 Cloud Claude Working Guide - RapidPro Project

**IMPORTANT: Read this BEFORE making any changes!**

This guide explains the correct directory structure and workflow for this project.

---

## 🏗️ Directory Structure (CRITICAL - DO NOT CHANGE!)

```
/c/Users/tjdot/RapidPro/
├── index.html                    ← Marketing site (for customers)
├── dashboard.html                ← Field Ops Dashboard (DEPLOYED - DO NOT MOVE!)
├── css/                          ← Dashboard styles (DEPLOYED - DO NOT MOVE!)
│   └── style.css
├── js/                           ← Dashboard JavaScript (DEPLOYED - DO NOT MOVE!)
│   ├── auth.js
│   ├── config.js
│   ├── dashboard.js
│   ├── map.js
│   └── mission.js               ← AI Boss integration is HERE!
├── public/                       ← Source files (NOT directly deployed)
│   ├── index.html               ← Same as root index.html
│   ├── css/
│   └── js/
├── functions/                    ← Firebase Cloud Functions
│   ├── ai-boss.js               ← AI Boss backend (Gemini 2.5 Flash)
│   ├── index.js
│   ├── package.json
│   └── pnpm-lock.yaml
├── firebase.json                 ← Hosting config: deploys from ROOT (.)
├── .github/workflows/
│   └── firebase-deploy.yml      ← Auto-deploy workflow
└── (documentation files)
```

---

## ⚠️ CRITICAL RULES

### 1. **DO NOT create subdirectories for the dashboard!**

❌ **WRONG:**
```
/dashboard/dashboard.html   ← This breaks deployment!
```

✅ **CORRECT:**
```
/dashboard.html             ← Lives in ROOT directory
```

### 2. **Files are deployed from ROOT, not /public/**

The `firebase.json` config says:
```json
"hosting": {
  "public": "."     ← This means ROOT directory
}
```

So when you make changes to dashboard files, edit these:
- `/dashboard.html` (root)
- `/css/style.css` (root)
- `/js/mission.js` (root)

**NOT** these:
- `/public/index.html` (not deployed)
- `/public/css/style.css` (not deployed)
- `/public/js/mission.js` (not deployed)

### 3. **Two sites, two entry points:**

| Site | URL | File |
|------|-----|------|
| Marketing (customers) | https://rapidpro-memphis.web.app/ | `/index.html` |
| Dashboard (technician) | https://rapidpro-memphis.web.app/dashboard.html | `/dashboard.html` |

---

## 🚀 How Auto-Deploy Works

### Workflow Triggers:

The GitHub Actions workflow (`.github/workflows/firebase-deploy.yml`) triggers on:

1. **Push to `main` or `dev` branch**
2. **Changes in these paths:**
   - `functions/**`
   - `public/**`
   - `firebase.json`
   - `firestore.rules`
   - `firestore.indexes.json`

### Deployment Process:

```
You push to main → GitHub Actions runs → Firebase deploys → Changes LIVE in ~2-3 min
```

### Check Deployment Status:

https://github.com/AggrMod/RapidPro/actions

---

## ✅ Correct Workflow for Making Changes

### Example: Change Dashboard Color Theme

**Step 1: Edit the CORRECT file**
```bash
# Edit the ROOT file that's deployed
nano /c/Users/tjdot/RapidPro/css/style.css
```

**Step 2: Make your changes**
```css
:root {
    --primary-color: #00d4ff;    /* Change this */
    --dark-bg: #0a0e1a;          /* Or this */
}
```

**Step 3: Commit to YOUR branch first (optional)**
```bash
git add css/style.css
git commit -m "Update dashboard color theme"
git push origin YOUR_BRANCH_NAME
```

**Step 4: Merge to main to deploy**
```bash
git checkout main
git merge YOUR_BRANCH_NAME
git push origin main
```

**Step 5: Wait for auto-deploy**
- Go to: https://github.com/AggrMod/RapidPro/actions
- Watch for green checkmark
- Changes will be live at: https://rapidpro-memphis.web.app/dashboard.html

---

## 🛑 Common Mistakes to AVOID

### ❌ Mistake 1: Creating subdirectories
```bash
# DON'T DO THIS:
mkdir dashboard
mv dashboard.html dashboard/
```
**Why:** Firebase deploys from ROOT. Moving files breaks URLs.

### ❌ Mistake 2: Editing /public/ files thinking they deploy
```bash
# DON'T DO THIS:
nano public/js/mission.js  # This file is NOT deployed!
```
**Why:** Only ROOT files deploy. `/public/` is just source/backup.

### ❌ Mistake 3: Deleting ROOT files
```bash
# DON'T DO THIS:
rm css/style.css
rm js/mission.js
rm dashboard.html
```
**Why:** These are the LIVE files. Deleting them breaks the site.

### ❌ Mistake 4: Pushing to your own branch and expecting it to deploy
```bash
git push origin claude/my-feature-branch
# This does NOT deploy! Only main/dev trigger deployment.
```
**Why:** Auto-deploy only watches `main` and `dev` branches.

---

## 📝 File Editing Guide

### To change dashboard HTML:
```bash
nano /c/Users/tjdot/RapidPro/dashboard.html
```

### To change dashboard styles:
```bash
nano /c/Users/tjdot/RapidPro/css/style.css
```

### To change AI Boss integration logic:
```bash
nano /c/Users/tjdot/RapidPro/js/mission.js
# Lines 150-159: AI Boss integration
# Lines 202-290: AI guidance display
```

### To change AI Boss backend logic:
```bash
nano /c/Users/tjdot/RapidPro/functions/ai-boss.js
# Lines 31-114: analyzeInteraction function
# Lines 313-400: Gemini AI integration
```

---

## 🧪 Testing Your Changes

### Option 1: Test locally before deploying
```bash
cd /c/Users/tjdot/RapidPro
firebase serve
# Open: http://localhost:5000/dashboard.html
```

### Option 2: Push to main and let auto-deploy handle it
```bash
git add .
git commit -m "Description of changes"
git push origin main
# Wait 2-3 min, then check: https://rapidpro-memphis.web.app/dashboard.html
```

---

## 🔍 How to Check What's Deployed

### See deployed files:
```bash
ls -la /c/Users/tjdot/RapidPro/*.html
ls -la /c/Users/tjdot/RapidPro/css/
ls -la /c/Users/tjdot/RapidPro/js/
```

### See what's in /public/ (NOT deployed):
```bash
ls -la /c/Users/tjdot/RapidPro/public/
```

---

## 🎯 Current Working Features (DO NOT BREAK!)

### ✅ Dashboard Features:
1. **Login System** - Firebase Auth
2. **Mission Assignment** - Get next closest location
3. **Interaction Logging** - Star ratings + notes + photo upload
4. **AI Boss Integration** - Gemini 2.5 Flash analysis
5. **Tactical Guidance Modal** - Shows after logging interactions
6. **KPI Dashboard** - Missions complete, target queue, avg efficacy
7. **Tactical Map** - Leaflet map showing locations

### ✅ AI Boss Features:
1. **Real Gemini AI** - Not fallback mode
2. **Priority Detection** - CRITICAL/HIGH/MEDIUM/LOW
3. **Tactical Analysis** - What happened and what it means
4. **Commanding Voice** - Direct orders, not suggestions
5. **Immediate Actions** - What to do RIGHT NOW
6. **Scheduled Follow-ups** - When to return and why
7. **Priority Badges** - Red pulsing for CRITICAL

### Key Files:
- `/dashboard.html` - Main dashboard UI
- `/js/mission.js` - Mission workflow + AI Boss integration
- `/css/style.css` - All styling including AI guidance modal
- `/functions/ai-boss.js` - Backend AI analysis with Gemini

---

## 🚨 Emergency: "I Accidentally Broke Something"

### If you pushed bad changes to main:

**Option 1: Revert the commit**
```bash
git revert HEAD
git push origin main
```

**Option 2: Ask LOCAL Claude to fix it**
LOCAL Claude has direct access to the machine and can:
- Manually deploy working versions
- Fix file structure issues
- Restore deleted files from git history

---

## 📊 Deployment Checklist

Before pushing to main, verify:

- [ ] Files are in ROOT directory (not subdirectories)
- [ ] You edited the correct files (ROOT, not /public/)
- [ ] You didn't delete any existing working files
- [ ] You tested changes locally (optional but recommended)
- [ ] Your branch is up to date with main
- [ ] Commit message is clear and descriptive

---

## 🤝 Working with LOCAL Claude

**LOCAL Claude** (running on Terry's machine):
- Has direct filesystem access
- Can manually deploy with `firebase deploy`
- Can fix file structure issues
- Can restore deleted files

**You (CLOUD Claude):**
- Work in isolated sandbox
- Push to GitHub
- GitHub Actions deploys automatically
- Cannot access local filesystem directly

**Communication:**
- Leave clear commit messages
- Document changes in markdown files
- Use this guide to stay in sync

---

## 📚 Important Files to Read

Before making changes, read these:

1. **CLOUD_CLAUDE_BRIEFING.md** - Full project context
2. **CLOUD_CLAUDE_QUICK_START.md** - Essential commands
3. **AUTO_DEPLOY_TROUBLESHOOTING.md** - Fix deployment issues
4. **This file (CLOUD_CLAUDE_WORKING_GUIDE.md)** - How to work correctly

---

## ✅ Summary: The Golden Rules

1. **Edit files in ROOT directory** (not /public/)
2. **Don't create subdirectories** (dashboard.html stays in root)
3. **Push to main or dev to deploy** (feature branches don't auto-deploy)
4. **Wait 2-3 min for deployment** (check GitHub Actions)
5. **Test at the live URL** (https://rapidpro-memphis.web.app/dashboard.html)
6. **Don't delete working files** (check what you're removing)
7. **Read this guide before making changes** (saves everyone time)

---

## 🎉 You're Ready!

The system is working perfectly. The AI Boss is live and functional. Follow this guide and your changes will deploy smoothly every time.

**Questions?**
- Check the troubleshooting guide: `AUTO_DEPLOY_TROUBLESHOOTING.md`
- Ask LOCAL Claude for help
- Review recent commits to see working examples

---

**Last Updated:** November 15, 2025
**By:** LOCAL Claude
**Status:** AI Boss system fully operational ✅
