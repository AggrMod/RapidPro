# 🎯 MORNING QUEST SYSTEM - USER GUIDE

## ✅ Status: DEPLOYED & LIVE

All Morning Quest functions are deployed to Firebase Cloud Functions at `rapidpro-memphis`.

---

## 🚀 What's Been Built

### 1. **Gemini AI Mission Briefings**
Every quest gets an epic tactical briefing like:
> "Operatives, intel confirms a critical asset: The Arcade, Memphis's oldest restaurant. Move out now to acquire essential intel and establish contact!"

### 2. **Daily Quest Generator** (`generateDailyQuests`)
- Selects 3-5 nearest pending locations
- Generates AI briefings with Gemini 2.5 Flash
- Calculates distances from your position
- Awards 75 XP per quest
- Stores in Firestore: `dailyQuests/{userId}_{date}`

### 3. **Quest Retrieval** (`getDailyQuests`)
- Fetches today's quest chain
- Shows progress: completed vs total
- Displays earned XP and remaining quests

### 4. **Quest Completion** (`completeQuest`)
- Marks individual quests complete
- Awards XP immediately
- Celebrates when ALL quests done

---

## 📱 How To Use (Frontend Integration)

### Generate Today's Quests

```javascript
const firebase = getFirebaseApp();
const functions = getFunctions(firebase);
const generateQuests = httpsCallable(functions, 'generateDailyQuests');

const result = await generateQuests({
  userLat: 35.1495,     // Your current latitude
  userLng: -90.0490,    // Your current longitude
  questCount: 3,         // How many quests (default: 3)
  questDate: '2025-10-20'  // Optional, defaults to today
});

console.log(result.data.message);  // "3 QUESTS READY!"
console.log(result.data.quests);   // Array of quest objects
```

### Get Today's Quests

```javascript
const getQuests = httpsCallable(functions, 'getDailyQuests');

const result = await getQuests({
  questDate: '2025-10-20'  // Optional, defaults to today
});

if (result.data.questsAvailable) {
  console.log(`You have ${result.data.totalQuests} quests today`);
  console.log(`Completed: ${result.data.completedQuests}`);
  console.log(`XP Earned: ${result.data.earnedXP} / ${result.data.totalXP}`);

  result.data.quests.forEach(quest => {
    console.log(`\n📍 Quest ${quest.questNumber}: ${quest.location.name}`);
    console.log(`Distance: ${quest.distanceMiles} miles`);
    console.log(`Mission: ${quest.missionBriefing}`);
    console.log(`Status: ${quest.status}`);  // pending or completed
  });
}
```

### Complete a Quest

```javascript
const completeQuest = httpsCallable(functions, 'completeQuest');

const result = await completeQuest({
  questNumber: 1,           // Which quest (1, 2, 3...)
  xpEarned: 75,            // XP to award
  questDate: '2025-10-20'  // Optional
});

console.log(result.data.message);  // "Quest 1 complete! +75 XP"
console.log(result.data.questsRemaining);  // 2
console.log(result.data.allComplete);  // false
```

---

## 🎮 The Complete Quest Flow

### **Night Before (9 PM)**
- ⏰ Scheduled function runs automatically
- 🎯 Generates tomorrow's quests for all users
- 📬 (TODO: Send push notification)

### **Morning (User Opens App)**
1. Call `getDailyQuests()`
2. If no quests exist: Call `generateDailyQuests()`
3. Display quest list with mission briefings
4. Show giant "START QUEST CHAIN" button

### **During The Day**
1. User completes a visit
2. Call `completeQuest(questNumber: 1, xpEarned: 75)`
3. Show celebration: "✅ Quest 1 complete! +75 XP"
4. Update UI: 2 quests remaining
5. Repeat for each quest

### **End of Day**
- All quests complete: "🏆 ALL QUESTS COMPLETE! Tomorrow we dominate again!"
- Some incomplete: "You completed 2/3 quests today. 150 XP earned!"

---

## 🔥 Quest Object Structure

```javascript
{
  questNumber: 1,
  locationId: "abc123",
  location: {
    name: "The Arcade Restaurant",
    address: "540 S Main St, Memphis, TN",
    type: "restaurant",
    lat: 35.1436,
    lng: -90.0520
  },
  distanceKm: "1.2",
  distanceMiles: "0.75",
  missionBriefing: "Operatives, intel confirms...",
  estimatedDuration: "10-15 minutes",
  xpReward: 75,
  status: "pending",  // or "completed"
  completedAt: timestamp  // only when completed
}
```

---

## 🎯 Daily Quest Batch Structure

Stored in Firestore: `dailyQuests/{userId}_{date}`

```javascript
{
  userId: "user123",
  questDate: "2025-10-20",
  quests: [ ...array of quest objects... ],
  totalQuests: 3,
  completedQuests: 1,
  totalXP: 225,  // 3 quests × 75 XP
  earnedXP: 75,
  generatedAt: timestamp,
  status: "active"
}
```

---

## 🚧 TODO: Frontend Features

### Immediate Priority (MVP)
1. **Morning Notification**: "⚡ 3 QUESTS READY - START IN 30 MIN"
2. **One-Button Start**: Giant "START QUEST CHAIN" button
3. **Quest List UI**: Display all quests with briefings
4. **Navigation Integration**: Launch GPS to first location
5. **Quest Completion Button**: Quick XP award

### Phase 2
6. **Voice Logging**: After-visit voice debrief
7. **Streak Counter**: "18-Day Quest Streak!"
8. **XP Progress Bar**: Visual feedback
9. **Territory Map**: Color-coded Memphis map
10. **Celebration Animations**: Confetti on completion

### Phase 3
11. **Push Notifications**: Night before + morning reminder
12. **Quest Preview**: See tomorrow's quests tonight
13. **Energy System**: High/low energy day scaling
14. **Boss Battles**: Special high-value Friday targets

---

## 🧪 Testing Commands

### Test Quest Generation (via Firebase Console)
1. Go to: https://console.firebase.google.com/project/rapidpro-memphis/functions
2. Click on `generateDailyQuests`
3. Test with payload:
```json
{
  "data": {
    "userLat": 35.1495,
    "userLng": -90.0490,
    "questCount": 3
  }
}
```

### Check Firestore
1. Go to: https://console.firebase.google.com/project/rapidpro-memphis/firestore
2. Look for collection: `dailyQuests`
3. Find document: `{userId}_2025-10-20`

---

## 💡 Next Steps

1. **Frontend Integration**: Add quest UI to `public/index.html`
2. **Test with Real User**: Generate quests for `rapidpro.memphis@gmail.com`
3. **Add Notifications**: Firebase Cloud Messaging setup
4. **Scheduled Function**: Test nightly generation (currently set for 9 PM)
5. **Voice Logging**: Add speech-to-text for mission debriefs

---

## 🎉 What Makes This Special

**Before**: "I should probably visit some businesses today... but which ones? Maybe later..."

**After**:
- 🔔 Phone buzzes: "3 QUESTS READY IN 30 MINUTES"
- 📱 Open app: See glowing map with 3 targets
- 🎯 Tap "START": GPS launches to The Arcade (0.3 mi)
- 🎤 Mission briefing plays: "Operatives, intel confirms..."
- ✅ Visit, complete, +75 XP instantly
- 🔥 2 more to go, can't stop now!

**The game removes decision fatigue and provides instant dopamine.**

---

**Built with Claude Code & Gemini AI** | October 2025
