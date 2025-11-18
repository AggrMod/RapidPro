# RapidPro Memphis - AI Assistant Guide

## Project Overview

RapidPro is an AI-powered field operations platform for refrigeration and HVAC service technicians. It combines gamification, real-time tactical AI guidance, and geospatial mission assignment to optimize customer acquisition and service delivery.

**Production URL**: https://rapidpro-memphis.web.app/
**Dashboard**: https://rapidpro-memphis.web.app/dashboard.html
**Project Type**: Firebase web application (hosting + cloud functions + Firestore)
**Target Users**: Field service technicians in the HVAC/refrigeration industry

## Architecture Overview

### Tech Stack

**Backend/Infrastructure**:
- Firebase Hosting (static site hosting)
- Firebase Cloud Functions (Node.js 22 runtime)
- Firestore Database (NoSQL document database)
- Firebase Authentication (user auth)
- Firebase Storage (photo uploads)
- Google Gemini 2.5 Flash AI (tactical decision engine)
- pnpm (package manager - preferred over npm)

**Frontend**:
- Vanilla JavaScript (ES6+, no frameworks)
- Leaflet.js (interactive maps)
- OpenStreetMap (map tiles, no API key required)
- Firebase SDK v9 (compat mode)

**Development Tools**:
- GitHub Actions (CI/CD)
- Cypress (E2E testing)
- Firebase Emulators (local development)

### Key Design Principles

1. **AI-First Decision Making**: Gemini AI makes ALL tactical decisions (where to go, when to follow up, priority levels)
2. **Zero Framework Frontend**: Vanilla JS for simplicity, fast load times, minimal dependencies
3. **Gamification Layer**: Field work treated like video game missions with XP, quests, and tactical briefings
4. **Modular Architecture**: Feature-specific JS/CSS files instead of monoliths
5. **Root-Level Deployment**: Files deploy from repository root (`.`), NOT `/public/`

## File Structure

```
/home/user/RapidPro/
├── functions/              # Firebase Cloud Functions (backend)
│   ├── index.js           # Main functions (712 lines)
│   ├── ai-boss.js         # AI tactical engine (454 lines)
│   ├── morning-quest-system.js  # Quest generation (12,349 lines)
│   └── quest-functions-append.js  # Quest helpers (5,927 lines)
│
├── js/                    # Frontend JavaScript modules (24 files)
│   ├── config.js          # Firebase configuration
│   ├── auth.js            # Authentication logic
│   ├── dashboard.js       # KPI loading & hero card
│   ├── mission.js         # Mission workflow & AI Boss (307 lines)
│   ├── map.js             # Leaflet map integration
│   ├── client-data-manager.js    # Enterprise client data (1053 lines)
│   ├── lead-conversion.js        # Lead conversion workflow (993 lines)
│   ├── missions-list.js          # Mission list modal (382 lines)
│   ├── first-contact-tracker.js  # Door knock logging (547 lines)
│   └── [20 more modules...]
│
├── css/                   # Modular stylesheets (28 files)
│   ├── style.css          # Main dashboard styles (29,963 lines)
│   ├── styles.css         # Marketing site styles (13,020 lines)
│   ├── lead-conversion.css
│   ├── door-knock.css
│   └── [24 more files...]
│
├── docs/internal/         # Development documentation (50+ files)
│   ├── CLOUD_CLAUDE_WORKING_GUIDE.md
│   ├── AI_BOSS_SYSTEM_DESIGN.md
│   ├── AUTO_DEPLOY_TROUBLESHOOTING.md
│   └── [47 more docs...]
│
├── .github/workflows/     # CI/CD automation
│   └── firebase-deploy.yml
│
├── cypress/e2e/          # End-to-end tests
│   └── all-cloud-functions.cy.js
│
├── *.html                # HTML pages (13 files)
│   ├── index.html        # Marketing website
│   ├── dashboard.html    # Field ops dashboard
│   ├── test-ai-boss.html # AI testing page
│   └── [10 more pages...]
│
├── firebase.json         # Firebase project config
├── firestore.rules       # Database security rules
├── firestore.indexes.json # Database indexes
└── .firebaserc           # Project alias
```

### CRITICAL: Deployment Directory Structure

**FILES DEPLOY FROM ROOT DIRECTORY (`.`), NOT `/public/`**

- Edit files at: `/home/user/RapidPro/dashboard.html`
- NOT at: `/home/user/RapidPro/public/dashboard.html` (this is backup/source only)
- Production URLs: `https://rapidpro-memphis.web.app/dashboard.html` (served from root)

**firebase.json hosting config**:
```json
{
  "hosting": {
    "public": ".",  // Root directory!
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**", "functions/**", "cypress/**", "docs/**", "*.md"]
  }
}
```

## Database Schema

### Firestore Collections

#### `users` - User Profiles
```javascript
{
  uid: string,                    // Firebase Auth UID
  email: string,
  currentLocationId: string | null,  // Active mission
  totalMissionsCompleted: number,
  createdAt: timestamp
}
```

#### `locations` - Service Locations (Missions)
```javascript
{
  name: string,                   // Business name
  address: string,
  type: string,                   // "commercial kitchen", "restaurant"
  lat: number,                    // Latitude
  lng: number,                    // Longitude
  status: string,                 // "pending", "attempted", "completed", "lead", "interested"
  priority: string,               // "critical", "high", "medium", "low" (AI-assigned)
  lastVisited: timestamp | null,
  lastEfficacyScore: number | null,  // 1-5 stars
  lastAIAnalysis: timestamp | null,
  interactionCount: number,
  leadId: string | null           // Reference to leads collection
}
```

#### `interactions` - Field Visit Records
```javascript
{
  locationId: string,
  userId: string,
  timestamp: timestamp,
  introScriptUsed: string,        // 5-word cold call opener
  efficacyScore: number,          // 1-5 stars
  notesText: string,              // Technician notes
  notesImageUrls: array<string>,  // Photo evidence
  outcome: string,                // "visited", "success", "attempted"
  note: string                    // Full notes for AI analysis
}
```

#### `kpis` - Key Performance Indicators
```javascript
{
  userId: string,
  totalPending: number,
  totalCompleted: number,
  totalAttempted: number,
  totalLeads: number,
  leadsThisMonth: number,
  avgEfficacyScore: number,
  totalInteractions: number,
  lastClockInTime: timestamp,
  lastLeadConversion: timestamp,
  createdAt: timestamp
}
```

#### `scheduledActions` - AI-Generated Follow-ups
```javascript
{
  locationId: string,
  locationName: string,
  userId: string,
  scheduledTime: timestamp,       // Exact future time (AI-determined)
  action: string,                 // What to do
  reason: string,                 // Why this timing is strategic
  status: string,                 // "pending", "completed"
  createdAt: timestamp,
  completedAt: timestamp | null
}
```

#### `aiDecisions` - AI Analysis History
```javascript
{
  locationId: string,
  userId: string,
  timestamp: timestamp,
  input: {
    note: string,
    efficacyScore: number
  },
  output: {
    analysis: string,             // AI interpretation
    immediateAction: string,      // Next tactical move
    scheduledAction: object | null,
    leadPriority: string,
    nextMissionType: string,
    aiCommand: string             // Direct command to technician
  },
  context: {
    activeCustomers: number,
    pendingCount: number
  }
}
```

#### `dailyQuests` - Gamification Quests
```javascript
{
  userId: string,
  questDate: string,              // "2025-01-15"
  quests: array<{
    questNumber: number,
    locationId: string,
    location: object,
    distanceKm: string,
    distanceMiles: string,
    missionBriefing: string,      // AI-generated tactical briefing
    estimatedDuration: string,
    xpReward: number,
    status: string                // "pending", "completed"
  }>,
  totalQuests: number,
  completedQuests: number,
  totalXP: number,
  earnedXP: number,
  generatedAt: timestamp,
  status: string                  // "active"
}
```

#### `leads` - Converted Qualified Leads
```javascript
{
  locationId: string,
  userId: string,
  equipmentSurvey: array<{
    type: string,
    brand: string,
    model: string,
    age: string,
    condition: string             // "good", "fair", "poor", "critical"
  }>,
  painPoints: array<string>,
  notes: string,
  currentProvider: string,
  assessmentDateTime: string,
  contactMethod: string,
  contactInfo: string,
  accessNotes: string,
  priority: string,               // AI-assigned
  status: string,                 // "assessment-scheduled", "in-progress"
  convertedAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `contactAttempts` - Door Knock Records
```javascript
{
  locationId: string,
  userId: string,
  timestamp: timestamp,
  status: string,                 // "interested", "not-home", "not-interested"
  notes: string,
  photoUrl: string | null,
  lat: number | null,
  lng: number | null
}
```

### Firestore Indexes

**Required indexes** (from `firestore.indexes.json`):

1. **Top-rated interactions**: `efficacyScore DESC, timestamp DESC`
2. **Scheduled actions by user**: `userId ASC, status ASC, scheduledTime ASC`
3. **Location interaction history**: `locationId ASC, timestamp DESC`
4. **Priority-based locations**: `priority ASC, status ASC`

## Cloud Functions (Backend)

**Location**: `/home/user/RapidPro/functions/index.js`
**Runtime**: Node.js 22
**Package Manager**: pnpm (NOT npm)

### Available Functions

#### Mission/Location Functions
- `getNextMission` - Finds nearest pending location using device GPS + Haversine distance
- `generateIntroScript` - Creates 5-word cold call opener phrases
- `logInteraction` - Records field visit with rating, notes, photos
- `getKPIs` - Retrieves performance metrics for dashboard

#### AI Boss Functions (Gemini-powered)
- `analyzeInteraction` - AI analyzes field notes, provides tactical guidance
- `getAICommand` - Returns current priority command for technician
- `completeScheduledAction` - Marks follow-up action as complete
- `getScheduledActions` - Lists upcoming scheduled follow-ups

#### User Management
- `initializeUser` - Sets up new user profile and KPIs
- `createUser` - Creates Firebase Auth user

#### Gamification
- `generateDailyQuests` - Creates morning quest list (Gemini-generated)
- `getDailyQuests` - Retrieves today's quests
- `completeQuest` - Marks quest as complete

#### Lead Conversion
- `convertLeadToCustomer` - Converts interested prospect to qualified lead

### Cloud Function Patterns

**Authentication Check** (ALL functions):
```javascript
if (!request.auth) {
  throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
}
const userId = request.auth.uid;
```

**AI Integration Pattern**:
```javascript
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
const prompt = `STRICT JSON FORMAT REQUIRED...`;
const result = await model.generateContent(prompt);
const text = result.response.text();
// Extract JSON from markdown-wrapped response
const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
const data = JSON.parse(jsonMatch ? jsonMatch[1] : text);
```

**Geospatial Calculations**:
```javascript
const { distanceBetween } = require('geofire-common');
const distance = distanceBetween([userLat, userLng], [locationLat, locationLng]);
```

**Error Handling**:
```javascript
try {
  // ... function logic
} catch (error) {
  console.error('Error in functionName:', error);
  throw new functions.https.HttpsError('internal', error.message);
}
```

## Frontend Architecture

### JavaScript Modules (Vanilla ES6+)

**Core Pattern**: Modular, functional, event-driven architecture WITHOUT frameworks

**Example Module Structure** (`js/mission.js`):
```javascript
// Firebase imports
import { db, auth } from './config.js';
import { collection, doc, getDoc } from 'firebase/firestore';

// Module-level state
let currentMission = null;
let currentUser = null;

// Initialization
export function initMission() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      currentUser = user;
      loadCurrentMission();
    }
  });

  attachEventListeners();
}

// Event listeners
function attachEventListeners() {
  document.getElementById('clock-in-btn')?.addEventListener('click', handleClockIn);
  document.getElementById('log-interaction-btn')?.addEventListener('click', handleLogInteraction);
}

// Feature functions
async function handleClockIn() {
  // ... implementation
}
```

### Key Frontend Modules

**`js/config.js`** - Firebase initialization and emulator detection:
```javascript
const isLocalhost = window.location.hostname === 'localhost';
if (isLocalhost) {
  auth.useEmulator('http://localhost:9099');
  db.useEmulator('localhost', 8080);
  functions.useEmulator('localhost', 5001);
}
```

**`js/mission.js`** - Mission workflow and AI Boss integration:
- Clock in/out functionality
- Interaction logging (5-star rating + notes + photos)
- AI Boss modal (shows tactical guidance after logging interaction)
- Mission marker highlighting on map

**`js/lead-conversion.js`** - Lead conversion workflow:
- Multi-step modal: AI guidance → Equipment survey → Pain points → Assessment scheduling
- Equipment types: Reach-in cooler, Walk-in freezer, Ice machine, etc.
- Auto-generates follow-up tasks (confirmation, prep, assessment)
- Priority detection: CRITICAL/HIGH/MEDIUM/LOW

**`js/dashboard.js`** - KPI loading and hero card:
- Auto-refresh every 30 seconds
- Retry logic for transient failures
- Collapsible stats drawer
- Hero mission card (action-oriented above fold)

**`js/map.js`** - Leaflet map integration:
- Color-coded markers: pending=orange, completed=green, current=blue, user=red
- Interactive popups with location details
- Auto-centering on current mission
- OpenStreetMap tiles (no API key)

### CSS Architecture

**Design System** (CSS variables):
```css
:root {
  --primary-color: #00d4ff;      /* Cyan */
  --secondary-color: #ff6b00;    /* Orange */
  --success-color: #00ff88;      /* Green */
  --danger-color: #ff3366;       /* Red */
  --dark-bg: #0a0e1a;            /* Dark navy */
  --panel-bg: #131829;           /* Panel background */
  --card-bg: #1a1f35;            /* Card background */
}
```

**Theme**: Cyberpunk/tactical operations aesthetic (dark backgrounds, neon accents, gaming UI)

**Modular Organization** (28 separate CSS files):
- Core: `style.css` (dashboard), `styles.css` (marketing)
- Features: `lead-conversion.css`, `door-knock.css`, `click-to-call.css`
- UI: `3d-effects.css`, `premium-effects.css`, `theme-switcher.css`
- Mobile: `mobile-fixes.css`, `mobile-menu-fix.css`

## Development Workflows

### Local Development

**Start Firebase Emulators**:
```bash
firebase emulators:start
```

**Emulator URLs**:
- Hosting: http://localhost:5000
- Firestore: http://localhost:8080
- Functions: http://localhost:5001
- Auth: http://localhost:9099
- Emulator UI: http://localhost:4000

**Serve Hosting Only**:
```bash
firebase serve
```

**Auto-Detection**: Frontend automatically detects localhost and connects to emulators (see `js/config.js`)

### Testing

**Cypress E2E Tests**:
```bash
npx cypress open
```

**Test Files**:
- `/cypress/e2e/all-cloud-functions.cy.js` - Cloud function integration tests

**Manual Test Pages**:
- `test-ai-boss.html` - AI Boss testing
- `test-ai-boss-simple.html` - Simplified AI testing
- `test-deployment.html` - Deployment verification
- `hello-claude.html` - Development test page

### Deployment

**CI/CD Pipeline** (GitHub Actions):

**Trigger Conditions**:
- Push to `main` or `dev` branches
- Changes in: `functions/`, `js/`, `css/`, `*.html`, `firebase.json`, `firestore.rules`
- Manual trigger via workflow_dispatch

**Deployment Steps** (`.github/workflows/firebase-deploy.yml`):
1. Checkout code
2. Setup Node.js 20
3. Install pnpm globally
4. Install functions dependencies: `cd functions && pnpm install`
5. Deploy to Firebase: `firebase deploy`

**Timeline**: 2-3 minutes from push to live

**Manual Deployment**:
```bash
# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# Deploy only Firestore rules
firebase deploy --only firestore:rules
```

### Git Workflow

**Branch Strategy**:
- `main` - Production (auto-deploys to https://rapidpro-memphis.web.app)
- `dev` - Development (auto-deploys to dev environment)
- `claude/*` - Feature branches (manual deploy or preview channels)

**Standard Workflow**:
```bash
# Create feature branch
git checkout -b feature/new-dashboard-widget

# Make changes to ROOT files (not /public/)
# Edit: /home/user/RapidPro/dashboard.html
# NOT: /home/user/RapidPro/public/dashboard.html

# Commit changes
git add .
git commit -m "feat: Add new dashboard widget for lead tracking"

# Push to remote
git push -u origin feature/new-dashboard-widget

# Merge to main when ready (triggers auto-deploy)
```

## Key Conventions and Best Practices

### Naming Conventions

**JavaScript**:
- Functions: `camelCase` (`getUserLocation`, `loadKPIs`)
- Constants: `UPPER_SNAKE_CASE` (`EQUIPMENT_TYPES`, `PAIN_POINTS`)
- Classes: `PascalCase` (`ClientDataManager`)
- Variables: `camelCase` (`currentMission`, `userLocation`)

**CSS**:
- Classes: `kebab-case` (`mission-briefing`, `ai-guidance-modal`)
- IDs: `kebab-case` (`clock-in-btn`, `hero-card`)
- CSS variables: `--kebab-case` (`--primary-color`, `--dark-bg`)

**Files**:
- JavaScript: `kebab-case.js` (`lead-conversion.js`, `client-data-manager.js`)
- CSS: `kebab-case.css` (`door-knock.css`, `mobile-fixes.css`)
- HTML: `kebab-case.html` (`test-ai-boss.html`, `memphis-services.html`)

### Code Style

**ES6+ JavaScript**:
```javascript
// Arrow functions
const handleClick = async () => { ... };

// Async/await (NOT .then chains)
const data = await getDoc(docRef);

// Template literals
const message = `Welcome, ${user.email}!`;

// Destructuring
const { lat, lng, name } = location;

// Optional chaining
const email = user?.email;

// Nullish coalescing
const count = userCount ?? 0;
```

**Functional Programming**:
```javascript
// Pure functions where possible
function calculateDistance(point1, point2) {
  // No side effects
  return Math.sqrt(...);
}

// Array methods (map, filter, reduce)
const pendingLocations = locations.filter(loc => loc.status === 'pending');
const names = locations.map(loc => loc.name);
```

**Event-Driven Architecture**:
```javascript
// DOM event listeners
document.getElementById('btn')?.addEventListener('click', handleClick);

// Auth state change
auth.onAuthStateChanged((user) => { ... });

// Firebase snapshot listeners
onSnapshot(collection(db, 'locations'), (snapshot) => { ... });
```

### Security Patterns

**Cloud Functions Authentication**:
```javascript
// ALWAYS check auth first
if (!request.auth) {
  throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
}
const userId = request.auth.uid;

// User-scoped queries
const userDoc = await admin.firestore().collection('users').doc(userId).get();
```

**Firestore Security Rules**:
```javascript
// User can only read/write their own user document
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Authenticated users can read/write all locations
match /locations/{locationId} {
  allow read, write: if request.auth != null;
}
```

**No Client-Side Secrets**:
- Firebase API keys are public and restricted by Firebase console settings
- Gemini API key stored ONLY in Cloud Function environment variables
- No `.env` files in client-side code

### AI Integration Patterns

**Structured Prompts**:
```javascript
const prompt = `
STRICT JSON FORMAT REQUIRED. Respond ONLY with valid JSON.

CONTEXT:
- Technician visited location: "${locationName}"
- Interaction notes: "${notes}"
- Efficacy rating: ${efficacyScore}/5 stars
- Active customers: ${activeCustomers}
- Pending locations: ${pendingCount}

TASK:
Analyze the interaction and provide tactical guidance.

REQUIRED JSON FORMAT:
{
  "analysis": "string - What happened and why it matters",
  "immediateAction": "string - Direct, commanding next step",
  "scheduledAction": {
    "action": "string",
    "scheduledTime": "ISO 8601 timestamp",
    "reason": "string"
  } | null,
  "leadPriority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "nextMissionType": "follow-up" | "new-prospect",
  "aiCommand": "string - Direct command in military voice"
}
`;
```

**Response Validation**:
```javascript
// Extract JSON from markdown-wrapped responses
const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
const data = JSON.parse(jsonMatch ? jsonMatch[1] : text);

// Validate required fields
if (!data.analysis || !data.immediateAction) {
  throw new Error('Invalid AI response format');
}
```

**Fallback Logic**:
```javascript
try {
  const aiResponse = await getGeminiAnalysis(notes, efficacyScore);
  return aiResponse;
} catch (error) {
  console.error('AI analysis failed, using rule-based fallback:', error);
  return getRuleBasedGuidance(efficacyScore);
}
```

### UI/UX Patterns

**Modal Overlays**:
```javascript
// Show modal
modal.classList.remove('hidden');
modal.style.display = 'flex';

// Close modal
modal.classList.add('hidden');
modal.style.display = 'none';
```

**Loading States**:
```javascript
// Before async operation
button.textContent = 'LOADING...';
button.disabled = true;

// After completion
button.textContent = 'SUBMIT';
button.disabled = false;
```

**Error Handling**:
```javascript
try {
  await submitData();
  showSuccessMessage('Data saved successfully!');
} catch (error) {
  console.error('Error:', error);
  showErrorMessage('Failed to save data. Please try again.');
}
```

**Progressive Disclosure**:
```javascript
// Collapsible sections
toggle.addEventListener('click', () => {
  content.classList.toggle('collapsed');
  icon.classList.toggle('rotated');
});
```

## Common Pitfalls and Troubleshooting

### Deployment Issues

**Problem**: Changes not appearing on production site
**Solution**:
- Verify you edited ROOT files (`/dashboard.html`), NOT `/public/dashboard.html`
- Check GitHub Actions status: https://github.com/AggrMod/RapidPro/actions
- Wait 2-3 minutes after push for deployment to complete
- Clear browser cache (Ctrl+Shift+R)

**Problem**: Deployment fails with "pnpm not found"
**Solution**:
- GitHub Actions installs pnpm globally in workflow
- For local deployment: `npm install -g pnpm` first

**Problem**: Functions deployment fails
**Solution**:
- Check Node.js version: `node -v` (should be 20 or 22)
- Verify dependencies: `cd functions && pnpm install`
- Check Firebase console for quota limits

### Firebase Issues

**Problem**: "Permission denied" errors in console
**Solution**:
- Check Firestore rules in `firestore.rules`
- Verify user is authenticated: `auth.currentUser`
- Ensure security rules allow the operation

**Problem**: Functions return "unauthenticated" error
**Solution**:
- Verify user is signed in before calling function
- Check auth state: `auth.onAuthStateChanged((user) => { ... })`
- Ensure Firebase Auth emulator is running for local dev

**Problem**: Emulators not connecting
**Solution**:
- Verify hostname is `localhost` (not `127.0.0.1`)
- Check emulator ports in `firebase.json`
- Start emulators: `firebase emulators:start`

### AI Integration Issues

**Problem**: AI Boss returns generic/unhelpful responses
**Solution**:
- Check Gemini API key in Cloud Function config: `firebase functions:config:get`
- Verify prompt includes sufficient context (location, notes, efficacy score)
- Check AI decision history in `aiDecisions` collection for patterns

**Problem**: AI response parsing fails
**Solution**:
- AI may wrap JSON in markdown (````json ... ````)
- Use regex to extract: `text.match(/```json\s*([\s\S]*?)\s*```/)`
- Fallback to direct parse if no markdown wrapper

**Problem**: Scheduled actions have incorrect times
**Solution**:
- AI returns ISO 8601 timestamps
- Parse with: `new Date(scheduledTime)`
- Verify timezone handling in Firestore

### Map Issues

**Problem**: Map not loading or showing blank
**Solution**:
- Check OpenStreetMap tile URL: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- Verify Leaflet.js is loaded before `map.js`
- Check browser console for CORS errors

**Problem**: Markers not appearing
**Solution**:
- Verify location has valid `lat` and `lng` fields
- Check marker creation in `map.js`: `L.marker([lat, lng])`
- Ensure map is initialized before adding markers

**Problem**: User location not detected
**Solution**:
- User must grant location permission
- Fallback to Memphis coordinates: `[35.1495, -90.0490]`
- Use HTTPS (required for geolocation API)

### Data Issues

**Problem**: KPIs not loading
**Solution**:
- Check KPI document exists: `/kpis/{userId}`
- Verify `getKPIs` function is deployed
- Check retry logic in `dashboard.js` (auto-retries twice)

**Problem**: Missions not appearing
**Solution**:
- Verify locations collection has documents with `status: 'pending'`
- Check geospatial calculations in `getNextMission`
- Ensure user has granted location permission

## Quick Reference

### Environment Variables

**Cloud Functions** (set via Firebase CLI):
```bash
firebase functions:config:set gemini.api_key="YOUR_API_KEY"
firebase functions:config:get  # View current config
```

### Firebase Commands

```bash
# Local development
firebase emulators:start
firebase serve

# Deployment
firebase deploy
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules

# Functions
firebase functions:log  # View function logs
firebase functions:config:get  # View config

# Authentication
firebase auth:import users.json  # Import users
```

### Project URLs

**Production**:
- Marketing Site: https://rapidpro-memphis.web.app/
- Dashboard: https://rapidpro-memphis.web.app/dashboard.html

**Local Development**:
- Hosting: http://localhost:5000
- Emulator UI: http://localhost:4000
- Firestore: http://localhost:8080
- Functions: http://localhost:5001
- Auth: http://localhost:9099

### Key File Locations

**Configuration**:
- Firebase config: `firebase.json`
- Firestore rules: `firestore.rules`
- Firestore indexes: `firestore.indexes.json`
- Firebase SDK init: `js/config.js`

**Cloud Functions**:
- Main exports: `functions/index.js`
- AI Boss: `functions/ai-boss.js`
- Quest system: `functions/morning-quest-system.js`
- Dependencies: `functions/package.json`

**Frontend**:
- Dashboard page: `dashboard.html`
- Marketing page: `index.html`
- Core JS modules: `js/` directory
- Core styles: `css/` directory

**Documentation**:
- Internal docs: `docs/internal/` (50+ files)
- This guide: `CLAUDE.md`
- README: `README.md`

### Code Snippets

**Call Cloud Function**:
```javascript
import { functions } from './config.js';
import { httpsCallable } from 'firebase/functions';

const myFunction = httpsCallable(functions, 'functionName');
const result = await myFunction({ param: 'value' });
console.log(result.data);
```

**Query Firestore**:
```javascript
import { db } from './config.js';
import { collection, query, where, getDocs } from 'firebase/firestore';

const q = query(
  collection(db, 'locations'),
  where('status', '==', 'pending')
);
const snapshot = await getDocs(q);
snapshot.forEach(doc => console.log(doc.data()));
```

**Upload to Storage**:
```javascript
import { storage } from './config.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storageRef = ref(storage, `interactions/${userId}/${Date.now()}.jpg`);
await uploadBytes(storageRef, file);
const url = await getDownloadURL(storageRef);
```

**Auth Check**:
```javascript
import { auth } from './config.js';

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User signed in:', user.email);
  } else {
    window.location.href = 'index.html';
  }
});
```

## Additional Resources

### Internal Documentation

Comprehensive guides in `/docs/internal/`:
- `CLOUD_CLAUDE_WORKING_GUIDE.md` - Workflow for AI assistants
- `AI_BOSS_SYSTEM_DESIGN.md` - AI Boss architecture
- `AUTO_DEPLOY_TROUBLESHOOTING.md` - Deployment debugging
- `AUTOMATIC_CUSTOMER_ACQUISITION_FLOW.md` - Lead conversion flow
- `CLOUD_FUNCTIONS_TEST_REPORT.md` - Testing guide

### External Resources

**Firebase**:
- Firebase Docs: https://firebase.google.com/docs
- Cloud Functions: https://firebase.google.com/docs/functions
- Firestore: https://firebase.google.com/docs/firestore

**AI Integration**:
- Gemini API: https://ai.google.dev/docs
- Generative AI SDK: https://www.npmjs.com/package/@google/generative-ai

**Frontend Libraries**:
- Leaflet.js: https://leafletjs.com/
- OpenStreetMap: https://www.openstreetmap.org/

---

**Last Updated**: 2025-11-18
**Version**: 1.0
**Maintained By**: RapidPro Development Team
