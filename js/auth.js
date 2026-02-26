// Authentication Logic

let currentUser = null;
window.currentUser = null;  // Make globally accessible
// Keep this allowlist aligned with Cloud Functions/firestore.rules.
const INTERNAL_DASHBOARD_EMAILS = (window.INTERNAL_DASHBOARD_EMAILS || [
  'r22subcooling@gmail.com',
  'rapidpro.memphis@gmail.com',
  'test@rapidpro.com'
]).map((email) => String(email).trim().toLowerCase());

function isInternalDashboardUser(email) {
  return INTERNAL_DASHBOARD_EMAILS.includes(String(email || '').trim().toLowerCase());
}

// Set persistence to LOCAL so users stay logged in after refresh
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    // Check auth state on page load
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const normalizedEmail = String(user.email || '').trim().toLowerCase();
        if (!isInternalDashboardUser(normalizedEmail)) {
          await auth.signOut();
          showLogin();
          document.getElementById('login-error').textContent = 'Access restricted to internal staff.';
          return;
        }

        currentUser = user;
        window.currentUser = user;  // Update global reference
        showDashboard();
        document.getElementById('user-email').textContent = user.email;

        // Initialize user if first time
        try {
          await functions.httpsCallable('initializeUser')();
        } catch (error) {
          console.log('User already initialized or error:', error);
        }

        // Wait a moment for auth token to be fully ready
        await new Promise(resolve => setTimeout(resolve, 500));

        // Load dashboard data
        loadKPIs();
        loadLocations();
      } else {
        currentUser = null;
        window.currentUser = null;  // Clear global reference
        showLogin();
      }
    });
  })
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

// Login
document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('login-error');

  try {
    // Ensure persistence is set before signing in
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    await auth.signInWithEmailAndPassword(email, password);
    errorMsg.textContent = '';
  } catch (error) {
    errorMsg.textContent = error.message;
  }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  }
});

// Screen management
function showLogin() {
  document.getElementById('login-screen').classList.add('active');
  document.getElementById('dashboard-screen').classList.remove('active');
}

function showDashboard() {
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('dashboard-screen').classList.add('active');
}

// Allow Enter key to submit login
document.getElementById('password').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('login-btn').click();
  }
});
