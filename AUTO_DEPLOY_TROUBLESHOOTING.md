# 🔧 Auto-Deploy Troubleshooting Guide

**For both LOCAL and CLOUD Claude instances**

This guide covers common issues with the GitHub Actions auto-deployment workflow.

---

## ✅ Pre-Flight Checklist

Before pushing changes, ensure:

1. **pnpm lockfile is up to date:**
   ```bash
   cd functions
   pnpm install
   ```
   This updates `pnpm-lock.yaml` to match `package.json`.

2. **Changes are committed:**
   ```bash
   git add -A
   git commit -m "Your message"
   ```

3. **Push to main or dev branch:**
   ```bash
   git push origin main
   ```

---

## 🚨 Common Error 1: Lockfile Out of Sync

**Symptom:**
```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile"
because pnpm-lock.yaml is not up to date with package.json
```

**Why it happens:**
GitHub Actions runs `pnpm install` with `--frozen-lockfile` flag, which requires the lockfile to EXACTLY match package.json. If you added a new dependency, the lockfile needs to be updated.

**Fix:**
```bash
cd /c/Users/tjdot/RapidPro/functions
pnpm install                # Update lockfile
cd ..
git add functions/pnpm-lock.yaml
git commit -m "Update pnpm lockfile"
git push origin main
```

**Prevention:**
Always run `pnpm install` in the `functions/` directory after:
- Adding new dependencies: `pnpm add package-name`
- Removing dependencies: `pnpm remove package-name`
- Updating dependencies: `pnpm update`

---

## 🚨 Common Error 2: Secret Environment Variable Overlap

**Symptom:**
```
Could not create Cloud Run service. spec.template.spec.containers[0].env:
Secret environment variable overlaps non secret environment variable: GEMINI_API_KEY
```

**Why it happens:**
You tried to define GEMINI_API_KEY as both a secret (in `defineSecret()`) and a regular environment variable (in Firebase config).

**Fix:**
In `functions/ai-boss.js`, use ONLY the secret:
```javascript
const { defineSecret } = require('firebase-functions/params');
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

// DON'T also define it in process.env or firebase.json
```

**Verification:**
Check `firebase.json` - make sure there's NO `env` section defining GEMINI_API_KEY.

---

## 🚨 Common Error 3: Workflow Not Triggering

**Symptom:**
You pushed to GitHub, but no workflow appears on Actions page.

**Possible Causes:**

1. **Wrong branch:**
   - Workflow only triggers on `main` or `dev` branches
   - Check your current branch: `git branch`
   - Switch if needed: `git checkout main`

2. **No relevant file changes:**
   - Workflow only triggers if these paths changed:
     - `functions/**`
     - `public/**`
     - `firebase.json`
     - `firestore.rules`
     - `firestore.indexes.json`
   - Check what changed: `git diff origin/main`

3. **Workflow file syntax error:**
   - Check `.github/workflows/firebase-deploy.yml` for YAML syntax errors
   - Validate at: https://www.yamllint.com/

**Fix:**
Make a change to a relevant file:
```bash
echo "// Trigger deploy $(date)" >> functions/ai-boss.js
git add functions/ai-boss.js
git commit -m "Trigger workflow"
git push origin main
```

---

## 🚨 Common Error 4: FIREBASE_TOKEN Invalid

**Symptom:**
```
Error: Invalid authentication credentials
```

**Why it happens:**
- FIREBASE_TOKEN secret in GitHub Secrets is wrong or expired
- Token was generated for a different Firebase project

**Fix:**

1. **Generate new token:**
   ```bash
   firebase login:ci
   ```
   Follow the OAuth flow in browser.

2. **Update GitHub Secret:**
   - Go to: https://github.com/AggrMod/RapidPro/settings/secrets/actions
   - Click on `FIREBASE_TOKEN`
   - Click "Update secret"
   - Paste new token
   - Save

3. **Re-run failed workflow:**
   - Go to: https://github.com/AggrMod/RapidPro/actions
   - Click on the failed run
   - Click "Re-run all jobs"

---

## 🚨 Common Error 5: Node.js Version Mismatch

**Symptom:**
```
Error: Unsupported engine: wanted node ">=20.0.0"
```

**Why it happens:**
Your local Node.js version doesn't match the workflow's version (20).

**Fix:**
This error should only happen locally. GitHub Actions uses Node.js 20 automatically.

If you see this locally:
- Update Node.js: https://nodejs.org/ (download LTS version 20+)
- Or use nvm: `nvm install 20 && nvm use 20`

---

## 🚨 Common Error 6: Deployment Timeout

**Symptom:**
Workflow runs for 10+ minutes and times out.

**Why it happens:**
- Large number of functions to deploy
- Slow npm/pnpm install
- Firebase API slowness

**Fix:**

1. **Check workflow logs:**
   - See which step is hanging
   - Usually it's "Install dependencies" or "Deploy to Firebase"

2. **Try deploying specific targets:**
   Edit `.github/workflows/firebase-deploy.yml`:
   ```yaml
   - name: Deploy to Firebase
     uses: w9jds/firebase-action@master
     with:
       args: deploy --only functions:analyzeInteraction,getAICommand
   ```

3. **Increase timeout:**
   Add to the workflow job:
   ```yaml
   jobs:
     deploy:
       runs-on: ubuntu-latest
       timeout-minutes: 20  # Default is 10
   ```

---

## 📊 How to Check Deployment Status

### GitHub Actions Page
https://github.com/AggrMod/RapidPro/actions

**Status Indicators:**
- 🟡 Yellow circle = Running
- ✅ Green checkmark = Success
- ❌ Red X = Failed
- ⚪ Gray circle = Queued

### Check Deployed Functions
```bash
firebase functions:list
```

Should show:
```
analyzeInteraction (us-central1)
getAICommand (us-central1)
completeScheduledAction (us-central1)
getScheduledActions (us-central1)
```

### View Deployment Logs
**GitHub Actions logs:**
- Click on workflow run
- Click on "deploy" job
- Expand each step to see logs

**Firebase function logs:**
```bash
firebase functions:log
firebase functions:log --only analyzeInteraction
```

---

## 🧪 Test Deployment Manually

If auto-deploy fails repeatedly, test manual deployment:

```bash
cd /c/Users/tjdot/RapidPro
firebase deploy --only functions
```

**If manual deploy works but auto-deploy fails:**
- Compare the environments (Node.js versions, pnpm versions)
- Check GitHub Actions logs for differences
- Ensure FIREBASE_TOKEN has correct permissions

**If manual deploy also fails:**
- Fix the underlying issue first
- Then retry auto-deploy

---

## 🔍 Debug Workflow Step-by-Step

Add debug output to `.github/workflows/firebase-deploy.yml`:

```yaml
- name: Debug - Show environment
  run: |
    echo "Node version: $(node --version)"
    echo "pnpm version: $(pnpm --version)"
    echo "Current directory: $(pwd)"
    ls -la

- name: Debug - Show package files
  run: |
    cd functions
    echo "package.json:"
    cat package.json
    echo "pnpm-lock.yaml exists:"
    ls -la pnpm-lock.yaml
```

Commit, push, and check the logs for the debug output.

---

## ✅ Workflow Success Checklist

When deployment succeeds, verify:

1. **GitHub Actions shows green checkmark** ✅

2. **Functions are deployed:**
   ```bash
   firebase functions:list
   ```

3. **Test page works:**
   https://rapidpro-memphis.web.app/test-ai-boss-simple.html
   - Click "Test Hot Lead"
   - Verify `"success": true` and NO `"fallbackMode": true`

4. **Function logs show no errors:**
   ```bash
   firebase functions:log --only analyzeInteraction
   ```

5. **Your changes are live:**
   - Make a test call to the function
   - Verify the new behavior works as expected

---

## 🆘 When All Else Fails

1. **Check Firebase Console:**
   https://console.firebase.google.com/project/rapidpro-memphis
   - Go to Functions tab
   - Check for deployment errors
   - View logs for runtime errors

2. **Ask LOCAL Claude** (if you're CLOUD Claude):
   - LOCAL Claude can run `firebase deploy` directly
   - Can check local environment for differences

3. **Manually deploy as fallback:**
   ```bash
   firebase deploy --only functions
   ```
   Then debug the auto-deploy issue separately.

4. **Re-create workflow from scratch:**
   - Delete `.github/workflows/firebase-deploy.yml`
   - Copy from this working example:
     https://github.com/AggrMod/RapidPro/blob/main/.github/workflows/firebase-deploy.yml
   - Commit and push

---

## 📚 Additional Resources

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Firebase CLI Docs:** https://firebase.google.com/docs/cli
- **pnpm Docs:** https://pnpm.io/
- **Workflow Logs:** https://github.com/AggrMod/RapidPro/actions
- **Firebase Console:** https://console.firebase.google.com/project/rapidpro-memphis

---

**Created by:** LOCAL Claude
**Date:** November 15, 2025
**Status:** Based on real deployment issues encountered and fixed
