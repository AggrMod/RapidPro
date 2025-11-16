# OAuth Quick Start Guide
**Get OAuth running in 15 minutes**

---

## Prerequisites

- ✅ Firebase project configured (you already have this)
- ✅ Firebase Authentication enabled
- ✅ Access to Firebase Console
- ✅ Basic understanding of JavaScript

---

## Step 1: Enable Google OAuth (2 minutes)

### Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **rapidpro-memphis**
3. Navigate to **Authentication** → **Sign-in method**
4. Click **Add new provider**
5. Select **Google**
6. Toggle **Enable**
7. Click **Save**

**That's it!** Firebase automatically creates and configures the OAuth client for you.

---

## Step 2: Add OAuth Code (3 minutes)

### Copy the implementation file

```bash
# The file is already in your examples directory
cp examples/oauth-implementation-2025.js js/oauth-auth.js
```

### Add to your HTML

Open `dashboard.html` and add before the closing `</body>` tag:

```html
<!-- Add OAuth module -->
<script src="js/oauth-auth.js"></script>
```

---

## Step 3: Add OAuth Buttons to UI (5 minutes)

### Add to login screen

Find your login form in `dashboard.html` and add this before or after the email/password form:

```html
<!-- OAuth Sign-in Buttons -->
<div class="oauth-buttons" style="margin: 20px 0;">
  <button onclick="handleGoogleSignIn()" class="oauth-btn" style="
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    padding: 12px;
    border: 2px solid #4285f4;
    border-radius: 8px;
    background: white;
    color: #333;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s;
  ">
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    Sign in with Google
  </button>
</div>

<script>
async function handleGoogleSignIn() {
  try {
    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Use redirect for mobile
      await window.OAuthAuth.signInWithGoogleRedirect();
    } else {
      // Use popup for desktop
      await window.OAuthAuth.signInWithGooglePopup();
    }
  } catch (error) {
    alert('Sign-in failed: ' + error.message);
  }
}
</script>
```

---

## Step 4: Test Locally (5 minutes)

### Start Firebase emulators

```bash
# If you're using emulators for local development
firebase emulators:start
```

### Or serve directly

```bash
# Serve your app
firebase serve
# or
npm start
# or just open dashboard.html in your browser
```

### Test the flow

1. Open `http://localhost:5000/dashboard.html` (or your local URL)
2. Click **"Sign in with Google"**
3. A popup should appear with Google sign-in
4. Select your Google account
5. You should be redirected to the dashboard

### Verify in console

Open browser DevTools console and check:

```javascript
// Check current user
console.log(firebase.auth().currentUser);

// Should see:
// {
//   uid: "...",
//   email: "your@gmail.com",
//   displayName: "Your Name",
//   photoURL: "https://...",
//   providerData: [{providerId: "google.com", ...}]
// }
```

---

## Step 5: Deploy (Optional)

If everything works locally:

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Your OAuth will work at:
# https://rapidpro-memphis.web.app/dashboard.html
```

---

## Troubleshooting

### "Popup blocked by browser"

**Solution**: Click the browser's popup blocker icon and allow popups for your site.

**Alternative**: Use redirect flow instead:
```javascript
await window.OAuthAuth.signInWithGoogleRedirect();
```

### "This app is not verified"

**Expected**: Your app shows a warning screen in development.

**Solution**:
1. Click "Advanced"
2. Click "Go to [your app] (unsafe)"
3. This only happens in development

**For production**: Submit your app for Google OAuth verification (optional, not required for internal apps).

### "auth/popup-closed-by-user"

**Cause**: User closed the popup before completing sign-in.

**Solution**: No action needed, user can try again.

### "auth/account-exists-with-different-credential"

**Cause**: User already has an account with the same email but different provider.

**Solution**: Implement account linking (already in the sample code):

```javascript
try {
  await window.OAuthAuth.signInWithGooglePopup();
} catch (error) {
  if (error.code === 'auth/account-exists-with-different-credential') {
    // Show message: "Please sign in with [original provider] first,
    // then link your Google account in settings"
  }
}
```

### OAuth not working in emulator

**Cause**: OAuth doesn't work well in Firebase emulators.

**Solution**: Test OAuth against the live Firebase project:

```javascript
// In js/config.js, temporarily disable emulator for auth
const isLocalhost = window.location.hostname === 'localhost';
if (isLocalhost) {
  // Comment out this line for OAuth testing
  // auth.useEmulator('http://localhost:9099');

  db.useEmulator('localhost', 8080);
  // ... other emulators
}
```

---

## What's Next?

### Add More Providers

Once Google is working, adding other providers is easy:

#### Microsoft

1. Firebase Console → Authentication → Add provider → Microsoft
2. Follow the setup wizard
3. Add button to UI:

```html
<button onclick="window.OAuthAuth.signInWithMicrosoft()">
  Sign in with Microsoft
</button>
```

#### GitHub

1. Firebase Console → Authentication → Add provider → GitHub
2. Create OAuth App in GitHub Settings
3. Copy Client ID and Secret to Firebase
4. Add button:

```html
<button onclick="window.OAuthAuth.signInWithGitHub()">
  Sign in with GitHub
</button>
```

### Add Multi-Factor Authentication

See `OAUTH_COMPARISON_REPORT.md` for MFA implementation guide.

### Add Account Linking

Users can link multiple providers to one account:

```javascript
// In user settings/profile page
await window.OAuthAuth.linkOAuthProvider('google');
await window.OAuthAuth.linkOAuthProvider('microsoft');
```

---

## Best Practices Checklist

- ✅ **Use popup for desktop, redirect for mobile**
  ```javascript
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    await signInWithGoogleRedirect();
  } else {
    await signInWithGooglePopup();
  }
  ```

- ✅ **Request minimal scopes**
  ```javascript
  // Only request what you need
  provider.addScope('profile');
  provider.addScope('email');
  // Don't request calendar, drive, etc. unless absolutely necessary
  ```

- ✅ **Handle errors gracefully**
  ```javascript
  try {
    await signIn();
  } catch (error) {
    // Show user-friendly message
    showError('Sign-in failed. Please try again.');
    // Log technical details
    console.error(error);
  }
  ```

- ✅ **Verify email before account linking**
  ```javascript
  // Included in sample code
  if (!user.emailVerified) {
    throw new Error('Please verify your email first');
  }
  ```

- ✅ **Always use HTTPS in production**
  ```javascript
  // Firebase Hosting enforces this automatically
  ```

---

## Security Notes

### What Firebase Handles Automatically

✅ **PKCE**: Implemented automatically for all OAuth flows
✅ **State parameter**: CSRF protection built-in
✅ **Token storage**: Secure storage in browser
✅ **Token refresh**: Automatic refresh before expiry
✅ **HTTPS enforcement**: Required for all OAuth flows

### What You Should Do

🔒 **Never commit secrets**: Keep Firebase config secure (it's OK to expose in frontend)
🔒 **Validate on server**: Always verify tokens in Cloud Functions
🔒 **Implement rate limiting**: Add rate limiting to prevent abuse
🔒 **Monitor auth logs**: Check Firebase Console → Authentication → Users for suspicious activity
🔒 **Enable MFA**: Implement multi-factor auth for sensitive accounts

---

## Complete Example

Here's a complete, minimal `dashboard.html` with OAuth:

```html
<!DOCTYPE html>
<html>
<head>
  <title>RapidPro - Dashboard</title>
</head>
<body>

  <!-- Login Screen -->
  <div id="login-screen">
    <h1>Sign In</h1>

    <!-- Google OAuth Button -->
    <button onclick="handleGoogleSignIn()" style="
      display: block;
      width: 100%;
      max-width: 300px;
      margin: 20px auto;
      padding: 12px;
      border: 2px solid #4285f4;
      border-radius: 8px;
      background: white;
      color: #333;
      font-size: 16px;
      cursor: pointer;
    ">
      🔵 Sign in with Google
    </button>

    <p style="text-align: center; color: #999;">or</p>

    <!-- Email/Password Form (existing) -->
    <form id="email-login" style="max-width: 300px; margin: 0 auto;">
      <input type="email" placeholder="Email" required style="
        display: block;
        width: 100%;
        margin: 10px 0;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
      ">
      <input type="password" placeholder="Password" required style="
        display: block;
        width: 100%;
        margin: 10px 0;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
      ">
      <button type="submit" style="
        display: block;
        width: 100%;
        margin: 10px 0;
        padding: 12px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      ">
        Sign In
      </button>
    </form>
  </div>

  <!-- Dashboard Screen -->
  <div id="dashboard-screen" style="display: none;">
    <h1>Dashboard</h1>
    <div id="user-info"></div>
    <button onclick="window.OAuthAuth.signOut()">Sign Out</button>
  </div>

  <!-- Firebase SDK -->
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

  <!-- Your existing auth.js (email/password) -->
  <script src="js/auth.js"></script>

  <!-- New OAuth module -->
  <script src="js/oauth-auth.js"></script>

  <!-- OAuth Handler -->
  <script>
    async function handleGoogleSignIn() {
      try {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
          await window.OAuthAuth.signInWithGoogleRedirect();
        } else {
          await window.OAuthAuth.signInWithGooglePopup();
        }
      } catch (error) {
        alert('Sign-in failed: ' + error.message);
        console.error(error);
      }
    }

    // Email login handler
    document.getElementById('email-login').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = e.target[0].value;
      const password = e.target[1].value;

      try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
      } catch (error) {
        alert('Sign-in failed: ' + error.message);
      }
    });

    // Show/hide screens based on auth state
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard-screen').style.display = 'block';
        document.getElementById('user-info').textContent = `Welcome, ${user.displayName || user.email}!`;
      } else {
        document.getElementById('login-screen').style.display = 'block';
        document.getElementById('dashboard-screen').style.display = 'none';
      }
    });
  </script>

</body>
</html>
```

---

## Need Help?

### Resources

- 📖 **Full Documentation**: See `OAUTH_COMPARISON_REPORT.md`
- 🔧 **Sample Code**: See `oauth-implementation-2025.js`
- 🎨 **UI Example**: See `oauth-login-example.html`
- 🔥 **Firebase Docs**: https://firebase.google.com/docs/auth/web/google-signin

### Common Questions

**Q: Do I need to implement PKCE manually?**
A: No! Firebase implements PKCE automatically for all OAuth flows.

**Q: Can I use OAuth with email/password at the same time?**
A: Yes! They work side-by-side. Users can sign in with either method.

**Q: Do I need a backend server?**
A: No! OAuth works entirely client-side with Firebase. Your Cloud Functions act as the backend.

**Q: Is this production-ready?**
A: Yes! The sample code follows RFC 9700 best practices (January 2025 standard).

**Q: What about privacy/GDPR?**
A: OAuth with Google only shares basic profile info (name, email, photo). You control what scopes to request.

---

**Happy coding! 🚀**

*Last updated: November 15, 2025*
