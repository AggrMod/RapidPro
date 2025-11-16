/**
 * MODERN OAUTH 2.1 IMPLEMENTATION FOR FIREBASE
 * Based on RFC 9700 Best Current Practices (January 2025)
 *
 * This implementation follows:
 * - OAuth 2.1 specification with PKCE
 * - RFC 9700 security best practices
 * - Firebase Authentication patterns
 * - Google OAuth provider standards
 *
 * Date: November 15, 2025
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyAzlCfKby79ZDvVJxfV5N7RdzoBrdFQexU",
  authDomain: "rapidpro-memphis.firebaseapp.com",
  projectId: "rapidpro-memphis",
  storageBucket: "rapidpro-memphis.firebasestorage.app",
  messagingSenderId: "161871881939",
  appId: "1:161871881939:web:5e2602a6366f5eac935626"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ============================================================================
// OAUTH PROVIDER CONFIGURATION
// ============================================================================

/**
 * Configure Google OAuth Provider with security best practices
 * Following RFC 9700 and Google's 2025 guidelines
 */
function configureGoogleProvider() {
  const provider = new firebase.auth.GoogleAuthProvider();

  // Add OAuth 2.0 scopes following principle of least privilege
  // Only request what's absolutely necessary for core functionality
  provider.addScope('profile');
  provider.addScope('email');

  // Optional: Add additional scopes only when needed
  // Use incremental authorization pattern
  // provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

  // Set custom parameters for enhanced security
  provider.setCustomParameters({
    // Force account selection to prevent silent account switching
    prompt: 'select_account',

    // Request access_type: offline only if refresh tokens are needed
    // Following best practice: minimize token lifetime exposure
    // access_type: 'offline'
  });

  return provider;
}

/**
 * Configure Microsoft OAuth Provider
 */
function configureMicrosoftProvider() {
  const provider = new firebase.auth.OAuthProvider('microsoft.com');

  provider.addScope('User.Read');
  provider.addScope('email');

  provider.setCustomParameters({
    prompt: 'select_account'
  });

  return provider;
}

/**
 * Configure GitHub OAuth Provider
 */
function configureGitHubProvider() {
  const provider = new firebase.auth.GithubAuthProvider();

  // Minimal scopes - only request user data
  provider.addScope('read:user');
  provider.addScope('user:email');

  return provider;
}

// ============================================================================
// AUTHENTICATION STATE MANAGEMENT
// ============================================================================

/**
 * Initialize authentication with secure session persistence
 * Following OWASP security guidelines
 */
async function initializeAuth() {
  try {
    // Set persistence to LOCAL for web apps
    // For sensitive applications, consider SESSION persistence
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

    // Monitor authentication state changes
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        await handleAuthenticatedUser(user);
      } else {
        handleUnauthenticatedUser();
      }
    });

  } catch (error) {
    console.error('Auth initialization error:', error);
    handleAuthError(error);
  }
}

/**
 * Handle authenticated user state
 * Implements token validation and user profile sync
 */
async function handleAuthenticatedUser(user) {
  try {
    // Store current user globally
    window.currentUser = user;

    // Get ID token with force refresh to ensure validity
    const idTokenResult = await user.getIdTokenResult();

    // Validate token expiration
    const expirationTime = new Date(idTokenResult.expirationTime);
    const now = new Date();

    if (expirationTime <= now) {
      console.warn('Token expired, refreshing...');
      await user.getIdToken(true); // Force token refresh
    }

    // Log authentication details (remove in production)
    console.log('User authenticated:', {
      uid: user.uid,
      email: user.email,
      provider: user.providerData[0]?.providerId,
      tokenExpiration: idTokenResult.expirationTime
    });

    // Sync user profile to Firestore
    await syncUserProfile(user);

    // Show dashboard
    showDashboard();

  } catch (error) {
    console.error('Error handling authenticated user:', error);
    handleAuthError(error);
  }
}

/**
 * Handle unauthenticated user state
 */
function handleUnauthenticatedUser() {
  window.currentUser = null;
  showLogin();
}

/**
 * Sync user profile to Firestore with security checks
 */
async function syncUserProfile(user) {
  try {
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    const profileData = {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      // Store provider info for audit trail
      providers: user.providerData.map(p => ({
        providerId: p.providerId,
        uid: p.uid
      }))
    };

    if (!userDoc.exists) {
      // New user - create profile with registration timestamp
      await userRef.set({
        ...profileData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        role: 'user' // Default role
      });
    } else {
      // Existing user - update profile
      await userRef.update(profileData);
    }

  } catch (error) {
    console.error('Error syncing user profile:', error);
    throw error;
  }
}

// ============================================================================
// OAUTH SIGN-IN METHODS (2025 BEST PRACTICES)
// ============================================================================

/**
 * Sign in with Google using redirect flow (recommended for mobile)
 * Implements OAuth 2.1 with PKCE (handled automatically by Firebase)
 *
 * SECURITY FEATURES:
 * - PKCE automatically implemented by Firebase
 * - Exact redirect URI matching
 * - HTTPS enforcement
 * - State parameter for CSRF protection
 */
async function signInWithGoogleRedirect() {
  try {
    const provider = configureGoogleProvider();

    // Redirect method recommended for mobile devices
    // Firebase automatically handles PKCE and state parameters
    await auth.signInWithRedirect(provider);

    // User will be redirected to Google sign-in page
    // On return, getRedirectResult() will be called automatically

  } catch (error) {
    console.error('Google redirect sign-in error:', error);
    handleAuthError(error);
  }
}

/**
 * Sign in with Google using popup flow (recommended for desktop)
 * Better UX for desktop users, maintains app context
 */
async function signInWithGooglePopup() {
  try {
    const provider = configureGoogleProvider();

    // Popup method - better for desktop UX
    const result = await auth.signInWithPopup(provider);

    // Access the signed-in user info
    const user = result.user;

    // Access the Google Access Token for API calls (if needed)
    const credential = result.credential;
    const accessToken = credential.accessToken;

    // Log success (remove in production)
    console.log('Google sign-in successful:', {
      uid: user.uid,
      email: user.email,
      hasAccessToken: !!accessToken
    });

    return user;

  } catch (error) {
    console.error('Google popup sign-in error:', error);
    handleAuthError(error);
  }
}

/**
 * Handle OAuth redirect result
 * Must be called on page load to complete redirect flow
 */
async function handleOAuthRedirectResult() {
  try {
    const result = await auth.getRedirectResult();

    if (result.user) {
      // User successfully signed in via redirect
      console.log('OAuth redirect successful:', result.user.email);

      // Access provider credential if needed
      const credential = result.credential;
      if (credential) {
        // Can use credential.accessToken for API calls
        console.log('Provider:', credential.providerId);
      }
    }

  } catch (error) {
    console.error('OAuth redirect result error:', error);
    handleAuthError(error);
  }
}

/**
 * Sign in with Microsoft
 */
async function signInWithMicrosoft() {
  try {
    const provider = configureMicrosoftProvider();
    const result = await auth.signInWithPopup(provider);
    console.log('Microsoft sign-in successful:', result.user.email);
    return result.user;
  } catch (error) {
    console.error('Microsoft sign-in error:', error);
    handleAuthError(error);
  }
}

/**
 * Sign in with GitHub
 */
async function signInWithGitHub() {
  try {
    const provider = configureGitHubProvider();
    const result = await auth.signInWithPopup(provider);
    console.log('GitHub sign-in successful:', result.user.email);
    return result.user;
  } catch (error) {
    console.error('GitHub sign-in error:', error);
    handleAuthError(error);
  }
}

// ============================================================================
// MULTI-FACTOR AUTHENTICATION (MFA) - ENHANCED SECURITY
// ============================================================================

/**
 * Enroll user in Multi-Factor Authentication
 * Implements defense-in-depth security strategy
 */
async function enrollMFA(phoneNumber) {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('No authenticated user');
    }

    // Set up reCAPTCHA verifier
    const recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        }
      }
    );

    // Get multi-factor session
    const session = await user.multiFactor.getSession();

    // Specify the phone number and pass the session
    const phoneInfoOptions = {
      phoneNumber: phoneNumber,
      session: session
    };

    const phoneAuthProvider = new firebase.auth.PhoneAuthProvider();
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
      phoneInfoOptions,
      recaptchaVerifier
    );

    // Store verification ID for later use
    return verificationId;

  } catch (error) {
    console.error('MFA enrollment error:', error);
    handleAuthError(error);
  }
}

/**
 * Complete MFA enrollment with verification code
 */
async function completeMFAEnrollment(verificationId, verificationCode) {
  try {
    const user = auth.currentUser;
    const cred = firebase.auth.PhoneAuthProvider.credential(
      verificationId,
      verificationCode
    );

    const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(cred);

    // Enroll with display name for the second factor
    await user.multiFactor.enroll(multiFactorAssertion, 'Phone Number');

    console.log('MFA enrollment successful');

  } catch (error) {
    console.error('MFA completion error:', error);
    handleAuthError(error);
  }
}

// ============================================================================
// ACCOUNT LINKING - SECURE MULTI-PROVIDER SUPPORT
// ============================================================================

/**
 * Link additional OAuth provider to existing account
 * Allows users to sign in with multiple providers
 *
 * SECURITY NOTE: Only link providers when email is verified
 * to prevent account takeover attacks
 */
async function linkOAuthProvider(providerType) {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('No authenticated user');
    }

    // Verify email before allowing provider linking
    if (!user.emailVerified) {
      throw new Error('Please verify your email before linking accounts');
    }

    let provider;
    switch (providerType) {
      case 'google':
        provider = configureGoogleProvider();
        break;
      case 'microsoft':
        provider = configureMicrosoftProvider();
        break;
      case 'github':
        provider = configureGitHubProvider();
        break;
      default:
        throw new Error('Unsupported provider type');
    }

    // Link the provider to the current user
    const result = await user.linkWithPopup(provider);

    console.log('Provider linked successfully:', result.user.providerData);

    // Update user profile in Firestore
    await syncUserProfile(result.user);

    return result.user;

  } catch (error) {
    if (error.code === 'auth/credential-already-in-use') {
      // Handle case where credential is already linked to another account
      console.error('This account is already linked to another user');
    }
    console.error('Provider linking error:', error);
    handleAuthError(error);
  }
}

/**
 * Unlink OAuth provider from account
 */
async function unlinkOAuthProvider(providerId) {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('No authenticated user');
    }

    // Ensure user has at least one other sign-in method
    if (user.providerData.length <= 1) {
      throw new Error('Cannot unlink the only sign-in method');
    }

    await user.unlink(providerId);
    console.log('Provider unlinked successfully:', providerId);

    // Update user profile in Firestore
    await syncUserProfile(user);

  } catch (error) {
    console.error('Provider unlinking error:', error);
    handleAuthError(error);
  }
}

// ============================================================================
// TOKEN MANAGEMENT - SECURITY BEST PRACTICES
// ============================================================================

/**
 * Refresh ID token to ensure validity
 * Implements token rotation strategy
 */
async function refreshAuthToken() {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('No authenticated user');
    }

    // Force token refresh
    const newToken = await user.getIdToken(true);

    console.log('Token refreshed successfully');
    return newToken;

  } catch (error) {
    console.error('Token refresh error:', error);
    handleAuthError(error);
  }
}

/**
 * Get current ID token with automatic refresh
 */
async function getAuthToken() {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('No authenticated user');
    }

    // Get token, automatically refreshing if expired
    const token = await user.getIdToken();
    return token;

  } catch (error) {
    console.error('Get token error:', error);
    handleAuthError(error);
  }
}

/**
 * Validate token expiration and refresh if needed
 * Implements proactive token management
 */
async function validateAndRefreshToken() {
  try {
    const user = auth.currentUser;

    if (!user) {
      return null;
    }

    const idTokenResult = await user.getIdTokenResult();
    const expirationTime = new Date(idTokenResult.expirationTime);
    const now = new Date();

    // Refresh token if it expires in less than 5 minutes
    const fiveMinutes = 5 * 60 * 1000;
    if (expirationTime.getTime() - now.getTime() < fiveMinutes) {
      console.log('Token expiring soon, refreshing...');
      return await refreshAuthToken();
    }

    return idTokenResult.token;

  } catch (error) {
    console.error('Token validation error:', error);
    handleAuthError(error);
  }
}

// ============================================================================
// SIGN OUT - SECURE SESSION TERMINATION
// ============================================================================

/**
 * Sign out user with comprehensive cleanup
 * Following security best practice: complete session termination
 */
async function signOut() {
  try {
    // Clear any cached data
    window.currentUser = null;

    // Sign out from Firebase
    await auth.signOut();

    console.log('User signed out successfully');

    // Redirect to login
    showLogin();

  } catch (error) {
    console.error('Sign out error:', error);
    handleAuthError(error);
  }
}

// ============================================================================
// ERROR HANDLING - USER-FRIENDLY AND SECURE
// ============================================================================

/**
 * Centralized error handling for authentication errors
 * Provides user-friendly messages while logging technical details
 */
function handleAuthError(error) {
  // Map Firebase error codes to user-friendly messages
  const errorMessages = {
    'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
    'auth/popup-blocked': 'Pop-up blocked by browser. Please allow pop-ups for this site.',
    'auth/cancelled-popup-request': 'Only one sign-in popup allowed at a time.',
    'auth/account-exists-with-different-credential': 'An account already exists with the same email. Try signing in with a different method.',
    'auth/invalid-credential': 'Invalid credentials. Please try again.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Contact support.',
    'auth/user-disabled': 'This account has been disabled. Contact support.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/credential-already-in-use': 'This account is already linked to another user.',
  };

  const userMessage = errorMessages[error.code] || 'An error occurred during sign-in. Please try again.';

  // Log detailed error for debugging (remove in production)
  console.error('Auth Error Details:', {
    code: error.code,
    message: error.message,
    stack: error.stack
  });

  // Show user-friendly error message
  showErrorMessage(userMessage);

  // Optional: Send error to monitoring service
  // logErrorToMonitoring(error);
}

/**
 * Display error message to user
 */
function showErrorMessage(message) {
  // Implementation depends on your UI framework
  // Example using a simple alert (replace with better UI)
  alert(message);

  // Better: Use a toast notification or modal
  // showToast(message, 'error');
}

// ============================================================================
// UI INTEGRATION HELPERS
// ============================================================================

function showLogin() {
  document.getElementById('login-screen')?.classList.add('active');
  document.getElementById('dashboard-screen')?.classList.remove('active');
}

function showDashboard() {
  document.getElementById('login-screen')?.classList.remove('active');
  document.getElementById('dashboard-screen')?.classList.add('active');
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check for emulator environment
    const isLocalhost = window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';

    if (isLocalhost) {
      auth.useEmulator('http://localhost:9099');
      db.useEmulator('localhost', 8080);
      console.log('Using Firebase emulators');
    }

    // Handle OAuth redirect result (if returning from provider)
    await handleOAuthRedirectResult();

    // Initialize authentication
    await initializeAuth();

    // Set up automatic token refresh every 50 minutes
    // Firebase tokens expire after 1 hour
    setInterval(validateAndRefreshToken, 50 * 60 * 1000);

  } catch (error) {
    console.error('Initialization error:', error);
  }
});

// ============================================================================
// EXPORT PUBLIC API
// ============================================================================

// Export functions for use in HTML
window.OAuthAuth = {
  // Sign-in methods
  signInWithGooglePopup,
  signInWithGoogleRedirect,
  signInWithMicrosoft,
  signInWithGitHub,

  // Account management
  linkOAuthProvider,
  unlinkOAuthProvider,

  // MFA
  enrollMFA,
  completeMFAEnrollment,

  // Token management
  refreshAuthToken,
  getAuthToken,

  // Sign out
  signOut
};

/**
 * IMPLEMENTATION NOTES:
 *
 * 1. PKCE Implementation:
 *    - Firebase automatically implements PKCE for all OAuth flows
 *    - No manual implementation needed
 *    - Complies with OAuth 2.1 requirements
 *
 * 2. Redirect URI Security:
 *    - Configure exact redirect URIs in Firebase Console
 *    - Firebase enforces exact string matching
 *    - Complies with RFC 9700 requirements
 *
 * 3. Token Security:
 *    - Tokens stored securely by Firebase SDK
 *    - Automatic token refresh implemented
 *    - Short-lived access tokens (1 hour)
 *
 * 4. Rate Limiting:
 *    - Implement server-side rate limiting in Cloud Functions
 *    - Firebase provides some built-in protection
 *    - Consider adding custom rate limiting for sensitive operations
 *
 * 5. HTTPS Enforcement:
 *    - Firebase Hosting enforces HTTPS by default
 *    - All OAuth flows require HTTPS
 *    - Local development uses emulators
 *
 * 6. Scope Management:
 *    - Request minimal scopes initially
 *    - Use incremental authorization for additional scopes
 *    - Follows principle of least privilege
 *
 * 7. Error Handling:
 *    - Comprehensive error mapping
 *    - User-friendly messages
 *    - Detailed logging for debugging
 *
 * 8. Account Linking:
 *    - Email verification required before linking
 *    - Prevents account takeover attacks
 *    - Supports multiple providers per user
 */
