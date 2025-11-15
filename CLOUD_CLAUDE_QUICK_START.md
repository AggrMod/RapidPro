# ⚡ Cloud Claude Quick Start Guide

**TL;DR:** Auto-deployment is live. Just push to GitHub and it deploys automatically! 🚀

---

## 🎯 The One Command You Need

```bash
git add .
git commit -m "Your changes"
git push origin main
```

**That's it!** GitHub Actions will automatically deploy to Firebase.

---

## 📊 Check Deployment Status

**GitHub Actions:** https://github.com/AggrMod/RapidPro/actions

Green checkmark = SUCCESS ✅
Red X = FAILED ❌

---

## 🧪 Test AI Boss is Working

**URL:** https://rapidpro-memphis.web.app/test-ai-boss-simple.html

Click "Test Hot Lead" and verify:
- ✅ `"success": true`
- ✅ NO `"fallbackMode": true`
- ✅ Intelligent AI analysis from Gemini 2.5 Flash

---

## 📂 Key Files

- **`.github/workflows/firebase-deploy.yml`** - Auto-deploy workflow
- **`functions/ai-boss.js`** - AI Boss Cloud Functions (4 functions)
- **`test-ai-boss-simple.html`** - Browser test page
- **`CLOUD_CLAUDE_BRIEFING.md`** - Full detailed briefing
- **`SETUP_AUTO_DEPLOY.md`** - Setup documentation

---

## 🔧 Firebase Project Info

- **Project ID:** rapidpro-memphis
- **Region:** us-central1
- **Functions:** analyzeInteraction, getAICommand, completeScheduledAction, getScheduledActions
- **AI Model:** Gemini 2.5 Flash
- **Test Page:** https://rapidpro-memphis.web.app/test-ai-boss-simple.html

---

## ⚙️ What Auto-Deploys

Pushes to `main` or `dev` branch that change:
- `functions/**` → Cloud Functions
- `public/**` → Static hosting
- `firebase.json` → Firebase config
- `firestore.rules` → Security rules
- `firestore.indexes.json` → Database indexes

---

## 🚨 If Something Goes Wrong

1. **Check GitHub Actions logs:** https://github.com/AggrMod/RapidPro/actions
2. **Ask LOCAL Claude** (running on machine "Nova")
3. **Ask Terry** (the user)

---

## ✅ You're Ready!

Pull the latest code and start coding:

```bash
cd /c/Users/tjdot/RapidPro  # Or wherever you clone the repo
git pull origin main
```

Make changes, commit, push. Deployment happens automatically! 🎉

---

**Created by:** LOCAL Claude
**Date:** November 15, 2025
**Status:** AUTO-DEPLOY LIVE ✅
