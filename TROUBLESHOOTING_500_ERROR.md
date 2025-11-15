# Troubleshooting 500 Error on analyzeInteraction

## The Problem

You're seeing this error in the browser console:
```
us-central1-rapidpro-memphis.cloudfunctions.net/analyzeInteraction:1
Failed to load resource: the server responded with a status of 500 ()
```

## Root Cause

The `analyzeInteraction` function is failing because the **Gemini API key is not set** as a Firebase secret.

When the function tries to call `GEMINI_API_KEY.value()`, it gets `undefined`, causing the Gemini API call to fail.

## Solution: Set the Gemini API Key

### Step 1: Set the Secret

Run this command from your RapidPro directory:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

When prompted, paste your Gemini API key:
```
AIzaSyCdxHMMXI88ajTzQBzg77E-3Q8VDtGA378
```

### Step 2: Redeploy Functions

After setting the secret, redeploy to pick up the new secret:

```bash
firebase deploy --only functions
```

This will redeploy all functions with access to the GEMINI_API_KEY secret.

### Step 3: Test Again

Open browser console at https://rapidpro-memphis.web.app/public/ and test:

```javascript
const analyze = firebase.functions().httpsCallable('analyzeInteraction');

analyze({
  locationId: 'test-001',
  notesText: 'Manager interested in maintenance contract',
  efficacyScore: 4
}).then(result => {
  console.log('✅ SUCCESS:', result.data);
}).catch(err => {
  console.error('❌ Error:', err);
});
```

## Alternative: Check Firebase Console Logs

You can also view the exact error in Firebase Console:

1. Go to https://console.firebase.google.com/
2. Select your project: `rapidpro-memphis`
3. Navigate to **Functions** → **Logs**
4. Look for `analyzeInteraction` errors
5. You should see an error like:
   ```
   Error: Cannot read property 'value' of undefined
   ```

## Other Possible Issues

### Issue: Authentication Error (400)

If you see:
```
identitytoolkit.googleapis.com/v1/accounts:signUp?key=...
Failed to load resource: the server responded with a status of 400 ()
```

**Solution:** Firebase Authentication may not be properly configured.

1. Go to Firebase Console → Authentication
2. Click "Get Started" if not already enabled
3. Enable "Email/Password" sign-in method

### Issue: Content Security Policy Warnings

The warnings about `connect-src` are just informational - they don't block functionality. They're related to Firebase source maps.

To fix (optional):
1. Edit `public/index.html`
2. Update the CSP meta tag to include `https://*.gstatic.com`:

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self';
    script-src 'self' 'unsafe-inline' https://*.googleapis.com https://www.gstatic.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net wss://*.firebaseio.com https://*.gstatic.com">
```

## Quick Verification Checklist

Before testing again, verify:

- [ ] Gemini API key secret is set: `firebase functions:secrets:access GEMINI_API_KEY`
- [ ] Functions redeployed after setting secret
- [ ] Firebase Authentication is enabled in console
- [ ] User is signed in (check Firebase Auth in browser console)
- [ ] Test with simple interaction (no images first)

## Test Without Authentication (Temporary)

If you want to test the function directly without signing in, you can temporarily update the function:

**In `functions/ai-boss.js`**, change line 288-291 from:
```javascript
exports.analyzeInteraction = onCall({ enforceAppCheck: false }, async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }
```

To:
```javascript
exports.analyzeInteraction = onCall({ enforceAppCheck: false }, async (request) => {
  // Temporarily allow unauthenticated calls for testing
  const userId = request.auth?.uid || 'test-user';

  if (!request.auth) {
    console.warn('⚠️ Unauthenticated call - using test user');
  }
```

And update the function call from `request.auth.uid` to `userId`.

**WARNING:** Don't forget to revert this change before production use!

## Expected Success Response

When working correctly, you should see:

```javascript
{
  success: true,
  analysis: "Initial contact. Manager showed interest in maintenance services...",
  immediateAction: "Move to next location and continue prospecting",
  scheduledAction: {
    time: "2025-11-18T10:00:00.000Z",
    action: "Follow up with manager about maintenance contract",
    reason: "Manager requested callback after reviewing budget"
  },
  leadPriority: "high",
  nextMissionType: "scheduled-return",
  aiCommand: "🎯 GOOD LEAD! Manager is interested. I've scheduled your follow-up for Monday. Now hit the next location! 💪"
}
```

## Need More Help?

If the error persists after setting the API key:

1. Check the full error in Firebase Console Logs
2. Verify your Gemini API key is valid at https://makersuite.google.com/app/apikey
3. Check that the API key has Gemini API access enabled
4. Try calling `analyzeInteraction` with minimal data to isolate the issue

## Quick Fix Commands

```bash
# Set the secret
firebase functions:secrets:set GEMINI_API_KEY

# Redeploy
firebase deploy --only functions

# Verify secret is set
firebase functions:secrets:access GEMINI_API_KEY

# Check logs for errors
firebase functions:log
```
