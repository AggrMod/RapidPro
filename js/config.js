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
