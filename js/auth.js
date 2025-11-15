// Authentication Logic

let currentUser = null;

// Set persistence to LOCAL so users stay logged in after refresh
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    // Check auth state on page load
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        currentUser = user;
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