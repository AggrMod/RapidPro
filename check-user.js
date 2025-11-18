const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkUser() {
  try {
    // Get all users from Authentication
    const users = await admin.auth().listUsers();
    const targetUser = users.users.find(u => u.email === 'r22subcooling@gmail.com');
    
    if (!targetUser) {
      console.log('❌ User not found in Authentication');
      return;
    }
    
    console.log('✅ User found in Authentication:');
    console.log('  UID:', targetUser.uid);
    console.log('  Email:', targetUser.email);
    
    // Check if user document exists in Firestore
    const userDoc = await db.collection('users').doc(targetUser.uid).get();
    
    if (!userDoc.exists) {
      console.log('❌ User document DOES NOT exist in Firestore');
      console.log('\n🔧 Creating user document with role...');
      
      await db.collection('users').doc(targetUser.uid).set({
        email: targetUser.email,
        role: 'technician',
        name: 'Field Technician',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ User document created successfully!');
    } else {
      console.log('✅ User document exists in Firestore:');
      console.log(JSON.stringify(userDoc.data(), null, 2));
      
      const data = userDoc.data();
      if (!data.role) {
        console.log('\n⚠️ User document missing role field');
        console.log('🔧 Adding role field...');
        
        await db.collection('users').doc(targetUser.uid).update({
          role: 'technician'
        });
        
        console.log('✅ Role field added successfully!');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

checkUser();
