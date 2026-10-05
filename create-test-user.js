const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./functions/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createTestUser() {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  if (!email || !password) {
    console.error('Set TEST_USER_EMAIL and TEST_USER_PASSWORD in the environment first.');
    process.exit(1);
  }
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: true
    });

    console.log('✅ Successfully created test user:', userRecord.uid);
    console.log('Email:', userRecord.email);
    console.log('\nYou can now login with:');
    console.log('Email:', email);

    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('ℹ️  User already exists with email: ' + email);
      console.log('You can login with the existing credentials.');
    } else {
      console.error('❌ Error creating user:', error.message);
    }
    process.exit(1);
  }
}

createTestUser();
