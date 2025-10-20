const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const functions = require('firebase-functions-test')();
const myFunctions = require('./functions/index');

async function testQuestGeneration() {
  console.log('🎯 Testing Quest Generation...\n');
  
  const result = await myFunctions.generateDailyQuests({
    auth: { uid: 'test-user-id' },
    data: {
      userLat: 35.1495,  // Memphis downtown
      userLng: -90.0490,
      questCount: 3,
      questDate: new Date().toISOString().split('T')[0]
    }
  });
  
  console.log('\n✅ SUCCESS!\n');
  console.log('Generated Quests:');
  result.quests.forEach((quest, i) => {
    console.log(`\n📍 QUEST ${quest.questNumber}: ${quest.location.name}`);
    console.log(`   Distance: ${quest.distanceMiles} miles`);
    console.log(`   Mission Briefing: "${quest.missionBriefing}"`);
    console.log(`   XP Reward: ${quest.xpReward}`);
  });
  
  process.exit(0);
}

testQuestGeneration().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
