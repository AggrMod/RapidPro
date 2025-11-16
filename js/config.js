// Firebase Configuration
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

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const functions = firebase.functions();
// Set the region for Cloud Functions
functions.useFunctionsEmulator = undefined; // Clear any emulator setting
// Note: us-central1 is the default region for Cloud Functions

// For local development, uncomment to use emulators:
// Detect if running locally
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

if (isLocalhost) {
  console.log('🔧 Using Firebase Emulators (Local Development)');
  auth.useEmulator('http://localhost:9099');
  db.useEmulator('localhost', 8080);
  storage.useEmulator('localhost', 9199);
  functions.useEmulator('localhost', 5001);
} else {
  console.log('☁️ Using Production Firebase');
}

// Firebase Connection Monitoring
let connectionCheckInterval = null;
let isConnected = true;

// Function to check Firebase connection
async function checkFirebaseConnection() {
  try {
    // Try to read from Firestore as a connection test
    await db.collection('_connection_test').limit(1).get();
    if (!isConnected) {
      // Connection restored
      isConnected = true;
      showConnectionStatus(true, '✅ Connected to Firebase');
      setTimeout(hideConnectionStatus, 3000);
    }
    return true;
  } catch (error) {
    console.error('Firebase connection error:', error);
    isConnected = false;

    let errorMessage = 'Unable to connect to Firebase. ';

    if (error.code === 'unavailable' || error.message.includes('fetch')) {
      errorMessage += 'Please check your internet connection.';
    } else if (error.code === 'permission-denied') {
      errorMessage += 'Authentication required. Please log in again.';
    } else if (error.code === 'failed-precondition') {
      errorMessage += 'Service is currently unavailable. Please try again later.';
    } else {
      errorMessage += 'Please try again later.';
    }

    showConnectionStatus(false, errorMessage);
    return false;
  }
}

// Function to show connection status banner
function showConnectionStatus(success, message) {
  const banner = document.getElementById('firebase-status-banner');
  const messageEl = banner?.querySelector('.status-message');
  const iconEl = banner?.querySelector('.status-icon');

  if (!banner) return;

  banner.classList.remove('hidden');
  if (success) {
    banner.classList.add('success');
    if (iconEl) iconEl.textContent = '✅';
  } else {
    banner.classList.remove('success');
    if (iconEl) iconEl.textContent = '⚠️';
  }

  if (messageEl) messageEl.textContent = message;
}

// Function to hide connection status banner
function hideConnectionStatus() {
  const banner = document.getElementById('firebase-status-banner');
  if (banner) {
    banner.classList.add('hidden');
  }
}

// Retry connection button handler
function setupConnectionRetry() {
  const retryBtn = document.getElementById('retry-connection-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', async () => {
      retryBtn.textContent = 'Checking...';
      retryBtn.disabled = true;

      const connected = await checkFirebaseConnection();

      if (connected) {
        setTimeout(hideConnectionStatus, 2000);
      }

      retryBtn.textContent = 'Retry';
      retryBtn.disabled = false;
    });
  }
}

// Start connection monitoring when page loads
window.addEventListener('DOMContentLoaded', () => {
  // Initial connection check after a brief delay
  setTimeout(() => {
    checkFirebaseConnection();
  }, 2000);

  // Setup retry button
  setupConnectionRetry();

  // Periodic connection check (every 30 seconds)
  connectionCheckInterval = setInterval(checkFirebaseConnection, 30000);
});

// Listen for online/offline events
window.addEventListener('online', () => {
  console.log('Internet connection restored');
  checkFirebaseConnection();
});

window.addEventListener('offline', () => {
  console.log('Internet connection lost');
  isConnected = false;
  showConnectionStatus(false, 'No internet connection. Please check your network.');
});
