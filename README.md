# RapidPro Memphis - Gamified Field Operations System

## Project Overview

A single-player gamified workflow system for managing field operations at RapidPro Memphis. Transform your daily service calls into an engaging video game experience with missions, KPIs, and tactical mapping.

##  Live Deployment

- **Hosting URL**: https://rapidpro-memphis.web.app
- **Firebase Console**: https://console.firebase.google.com/project/rapidpro-memphis/overview

## What's Been Built

### Backend Infrastructure

1. **Firebase Project**: `rapidpro-memphis`
   - Firestore Database (us-central1)
   - Firebase Authentication
   - Firebase Hosting
   - Cloud Storage (pending setup)

2. **Firestore Data Schema**:
   - `users` - Player profile and settings
   - `locations` - Service locations (the "missions")
   - `interactions` - Records of visits with notes and ratings
   - `kpis` - Performance metrics and statistics

3. **Cloud Functions** (Code Ready - Requires Blaze Plan):
   - `getNextMission` - Finds nearest pending location
   - `generateIntroScript` - Creates 5-word intro phrases
   - `logInteraction` - Records visit details
   - `getKPIs` - Retrieves performance stats
   - `initializeUser` - Sets up new user data

### Frontend Application

1. **Game-Style Dashboard**:
   - Cyberpunk/tactical UI theme
   - Real-time KPI tracking
   - Mission briefing system
   - Interaction logging interface

2. **Leaflet Map Integration**:
   - OpenStreetMap tiles (no Google API needed)
   - Color-coded location markers
   - Current location tracking
   - Mission highlighting

3. **Features Implemented**:
   - User authentication
   - "Clock In" workflow
   - Next mission assignment (nearest location)
   - Auto-generated intro scripts
   - 5-star efficacy rating system
   - Notes and photo upload
   - Adaptive learning system

## Sample Data

15 Memphis commercial kitchen locations loaded, including:
- The Arcade Restaurant
- Central BBQ
- Gus's World Famous Fried Chicken
- The Peabody Memphis
- And 11 more locations across Memphis

##  Next Steps to Complete Setup

### 1. Upgrade to Blaze Plan (Required for Cloud Functions)

Visit: https://console.firebase.google.com/project/rapidpro-memphis/usage/details

Cloud Functions require the pay-as-you-go Blaze plan. The Firebase free tier includes:
- 125K invocations/month free
- 40K GB-seconds compute time free
- 2 million invocations/month free for background triggers

### 2. Enable Firebase Storage

1. Go to: https://console.firebase.google.com/project/rapidpro-memphis/storage
2. Click "Get Started"
3. Use default rules
4. Deploy storage rules: `firebase deploy --only storage`

### 3. Deploy Cloud Functions

Once on Blaze plan:
```bash
cd /home/terry/rapidpro-game
firebase deploy --only functions
```

### 4. Create Your User Account

Go to Firebase Console > Authentication:
https://console.firebase.google.com/project/rapidpro-memphis/authentication/users

Click "Add User" and create:
- Email: your@email.com
- Password: (your secure password)

### 5. Seed Location Data to Firestore

After permissions propagate (may take 5-10 minutes):
```bash
cd /home/terry/rapidpro-game/functions
node ../seed-locations.js
```

Or manually add locations via Firebase Console:
https://console.firebase.google.com/project/rapidpro-memphis/firestore

## Project Structure

```
rapidpro-game/
├── public/                 # Frontend application
│   ├── index.html         # Main HTML file
│   ├── css/
│   │   └── style.css      # Game-style UI
│   └── js/
│       ├── config.js      # Firebase config
│       ├── auth.js        # Authentication
│       ├── dashboard.js   # KPIs and stats
│       ├── map.js         # Leaflet integration
│       └── mission.js     # Mission workflow
├── functions/             # Cloud Functions
│   ├── index.js          # All function definitions
│   └── package.json      # Dependencies
├── firestore.rules       # Security rules
├── firestore.indexes.json # Database indexes
├── firebase.json         # Firebase config
└── seed-locations.js     # Sample data script
```

## How It Works

### The Game Loop

1. **Clock In**: Click the big "CLOCK IN" button
2. **Get Mission**: System finds nearest pending location using geolocation
3. **Mission Briefing**: Displays location details, distance, and auto-generated intro script
4. **Complete Mission**: Visit the location and use the intro
5. **Log Interaction**: Rate the efficacy (1-5 stars), add notes, upload photo
6. **Level Up**: KPIs update, location marked complete, new mission available

### The "Phrase Engine"

The system learns from your successful interactions:
- Tracks which intro scripts score 4-5 stars
- Adapts future scripts based on what works
- Uses power words like "save money", "prevent breakdowns", "ensure compliance"

### Geospatial Logic

- Uses device geolocation or Memphis default (35.1495, -90.0490)
- Calculates distances using Haversine formula
- Sorts locations by proximity
- Can prioritize locations not visited recently

## Tech Stack

- **Frontend**: Vanilla JavaScript, Leaflet.js, CSS Grid/Flexbox
- **Backend**: Firebase (Firestore, Auth, Functions, Storage, Hosting)
- **Maps**: OpenStreetMap via Leaflet (no API keys needed)
- **Fonts**: Google Fonts (Orbitron, Roboto)

## Local Development

To test locally with emulators:

1. Start Firebase emulators:
```bash
cd /home/terry/rapidpro-game
firebase emulators:start
```

2. Update `public/js/config.js` to use emulators (uncomment lines 18-22)

3. Open http://localhost:5000

## Firebase Security

### Firestore Rules
- Users can only read/write their own data
- Locations, interactions, KPIs require authentication
- All operations tied to authenticated user ID

### Storage Rules
- Users can only upload to their own folder
- Images stored at `/interaction-images/{userId}/`

##  Customization Ideas

1. **Add More Location Fields**:
   - Equipment types
   - Last service date
   - Priority level
   - Contact person

2. **Enhanced KPIs**:
   - Revenue per mission
   - Average travel time
   - Success rate by location type
   - Streak counters

3. **Gamification**:
   - Achievement badges
   - Daily challenges
   - Leaderboards (if multi-player)
   - Experience points/levels

4. **Route Optimization**:
   - Multi-stop missions
   - Integration with routing services
   - Traffic-aware suggestions

5. **Reporting**:
   - Weekly/monthly summaries
   - Export to CSV/PDF
   - Email reports

## Costs Estimate (Blaze Plan)

Based on moderate usage (100 missions/month):
- Firestore: ~$0.50/month
- Cloud Functions: ~$1-2/month
- Storage: ~$0.25/month
- Hosting: FREE

**Total**: ~$2-3/month

## Support & Documentation

- Firebase Docs: https://firebase.google.com/docs
- Leaflet Docs: https://leafletjs.com/reference.html
- Project Location: `/home/terry/rapidpro-game`

## License

Private project for RapidPro Memphis internal use.

---

**Built with Claude Code** | October 2025
