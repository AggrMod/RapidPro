const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./functions/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createTestUser() {
  try {
    const userRecord = await admin.auth().createUser({
      email: 'rapidpro.memphis@gmail.com',
      password: 'RapidPro2025!',
      emailVerified: true
    });

    console.log('✅ Successfully created test user:', userRecord.uid);
    console.log('Email:', userRecord.email);
    console.log('\nYou can now login with:');
    console.log('Email: rapidpro.memphis@gmail.com');
    console.log('Password: RapidPro2025!');

    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('ℹ️  User already exists with email: rapidpro.memphis@gmail.com');
      console.log('You can login with the existing credentials.');
    } else {
      console.error('❌ Error creating user:', error.message);
    }
    process.exit(1);
  }
}

createTestUser();
