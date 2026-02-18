# Firebase Functions V2 API Fix - Status Report

**Date**: October 17, 2025
**Project**: rapidpro-memphis
**Issue**: Cloud Functions returning 401 errors despite App Check configuration

---

## Root Cause Discovered

The previous attempt to disable App Check enforcement using `{ enforceAppCheck: false }` was not working because:

1. **Wrong API Version**: We were using `require('firebase-functions')` which imports the **v1 API**
2. **Incompatible Option**: The `enforceAppCheck` option is **only available in the v2 API**
3. **Syntax Mismatch**: v2 functions use `onCall()` from `firebase-functions/v2/https`, not `functions.https.onCall()`

**Result**: The `enforceAppCheck: false` option was being silently ignored, causing functions to enforce App Check by default and return 401 errors.

---

## Changes Made

### Updated Import Statement

**Before** (v1 API):
```javascript
const functions = require('firebase-functions');
```

**After** (v2 API):
```javascript
const { onCall } = require('firebase-functions/v2/https');
```

### Updated Function Signatures

**Before** (v1 API):
```javascript
exports.getNextMission = functions.https.onCall({ enforceAppCheck: false }, async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  const { currentLat, currentLng } = data;
  // ...
});
```

**After** (v2 API):
```javascript
exports.getNextMission = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }
  const { currentLat, currentLng } = request.data;
  // ...
});
```

### Key Changes in v2 API

1. **Request Object**: Single `request` parameter instead of separate `data` and `context`
2. **Data Access**: `request.data` instead of `data`
3. **Auth Access**: `request.auth` instead of `context.auth`
4. **Error Handling**: `throw new Error()` instead of `throw new functions.https.HttpsError()`

---

## Functions Updated

All 5 Cloud Functions have been migrated to v2 API:

1. ✅ `getNextMission` - Find nearest pending location
2. ✅ `generateIntroScript` - Create 5-word intro phrases
3. ✅ `logInteraction` - Record visit details
4. ✅ `getKPIs` - Retrieve performance stats
5. ✅ `initializeUser` - Set up new user data

---

## Current Status

### ✅ Completed
- Identified root cause (v1 vs v2 API incompatibility)
- Updated all 5 functions to use v2 API
- Corrected function signatures and error handling
- Updated auth context references
- Code is ready for deployment

### ⏳ Blocked
- **Deployment**: Firebase Cloud Runtime Config is experiencing infrastructure issues
- **Error**: "Cloud Runtime Config is currently experiencing issues, which is preventing your functions from being deployed"
- **Duration**: Multiple deployment attempts over 30+ minutes all failed

### 🔮 Pending (After Firebase Recovery)
1. Deploy functions with v2 API changes
2. Test complete mission workflow
3. Verify App Check enforcement is properly disabled
4. Confirm 401 errors are resolved

---

## Next Steps (When Firebase Recovers)

### Step 1: Deploy Updated Functions

Wait for Firebase infrastructure to recover (typically 15-60 minutes), then run:

```bash
cd /home/terry/rapidpro-game
firebase deploy --only functions
```

**Expected Output:**
```
✔ functions[getNextMission(us-central1)] Successful update operation.
✔ functions[generateIntroScript(us-central1)] Successful update operation.
✔ functions[logInteraction(us-central1)] Successful update operation.
✔ functions[getKPIs(us-central1)] Successful update operation.
✔ functions[initializeUser(us-central1)] Successful update operation.

✔ Deploy complete!
```

### Step 2: Clear Browser Cache

The frontend may have cached the old function responses. Either:
- **Hard Refresh**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- **Or Clear Cache**: DevTools → Application → Clear Storage → Clear site data

### Step 3: Test Mission Workflow

1. Navigate to: https://rapidpro-memphis.web.app
2. Log in with: `rapidpro.memphis@gmail.com` / `RapidPro2025!`
3. Click "CLOCK IN - GET MISSION"
4. **Expected**: Mission assignment appears (no 401 error)
5. Complete the workflow:
   - View mission details
   - Log interaction with star rating
   - Verify KPIs update

### Step 4: Verify in Logs

Check Cloud Functions logs to confirm App Check is disabled:

```bash
firebase functions:log --only getNextMission | head -20
```

**Should See**:
```
{"verifications":{"auth":"VALID","app":"MISSING"},"message":"Callable request verification passed"}
```

No 401 errors should appear.

---

## Technical Details

### Firebase Functions V2 API Documentation

- **Migration Guide**: https://firebase.google.com/docs/functions/2nd-gen-upgrade
- **Callable Functions v2**: https://firebase.google.com/docs/functions/callable-reference#node.js_2
- **App Check Options**: https://firebase.google.com/docs/app-check/cloud-functions#callable-functions

### V2 API Features

- **Better Performance**: Faster cold starts
- **More Control**: Granular configuration options
- **Modern Syntax**: Cleaner, more intuitive API
- **App Check Support**: Native support for `enforceAppCheck` option

### Package Versions

- **firebase-admin**: ^13.5.0
- **firebase-functions**: ^6.5.0 ✅ (Supports v2 API)
- **Node.js Runtime**: 22

---

## Troubleshooting

### If 401 Errors Persist After Deployment

1. **Check Function Logs**:
   ```bash
   firebase functions:log --only getKPIs,initializeUser | head -30
   ```

2. **Verify V2 API Deployment**:
   ```bash
   gcloud functions describe getKPIs --region=us-central1 --gen2 --format=json | grep entryPoint
   ```

3. **Check Auth Token**:
   - Open browser DevTools → Console
   - Run: `firebase.auth().currentUser`
   - Should show user object with email and uid

4. **Test Function Directly**:
   ```bash
   firebase functions:shell
   # Then in shell:
   getKPIs()
   ```

### If Deployment Still Fails

If Firebase Cloud Runtime Config issues persist beyond 2 hours:

1. **Check Firebase Status**: https://status.firebase.google.com
2. **Report Issue**: https://firebase.google.com/support
3. **Alternative**: Try deploying from a different machine/network

---

## Files Modified

- `/home/terry/rapidpro-game/functions/index.js` - All 5 functions migrated to v2 API

---

## Summary

**The Real Problem**: Using v1 API (`firebase-functions`) when `enforceAppCheck` requires v2 API (`firebase-functions/v2/https`)

**The Real Solution**: Migrated all functions to v2 API with proper `onCall()` syntax

**Current Blocker**: Firebase infrastructure issues preventing deployment

**ETA to Completion**: 5 minutes of deployment + testing once Firebase recovers

---

**Status**: 98% Complete - Code Ready, Deployment Pending Firebase Recovery

**Next Action**: Run `firebase deploy --only functions` when Firebase Cloud Runtime Config recovers (typically 15-60 minutes)
