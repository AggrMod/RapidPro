# 🚀 CLOUD CLAUDE - MEGA TASK LIST (50 TASKS)

**Project:** RapidPro Memphis Field Ops Dashboard
**Status:** Phase 2 - Enhanced Field Operations
**Branch Strategy:** Create feature branches, Terry/LOCAL Claude merges to main
**Preview Strategy:** Use Firebase Hosting preview channels (instructions below)

---

## 📋 CRITICAL WORKFLOW

### Before Starting ANY Task:
```bash
git checkout main
git pull origin main
git checkout -b claude/task-name-here
```

### After Completing Task:
```bash
git add .
git commit -m "Task #X: Description of what you did"
git push origin claude/task-name-here
```

### For Preview (Terry Can See Before Merge):
```bash
firebase hosting:channel:deploy preview-task-X
# This creates: https://rapidpro-memphis--preview-task-x-HASH.web.app
```

**Then tell Terry:** "Task #X complete. Preview: [URL]. Branch: claude/task-name-here"

---

## 🎯 TASK CATEGORIES

- **Mission Management** (Tasks 1-15)
- **Interaction Management** (Tasks 16-25)
- **Dashboard Enhancements** (Tasks 26-35)
- **Reporting & Analytics** (Tasks 36-42)
- **UI/UX Polish** (Tasks 43-50)

---

## 📊 MISSION MANAGEMENT (Tasks 1-15)

### Task 1: View All Pending Missions
**Priority:** CRITICAL
**Files:**
- Create: `js/missions-list.js`
- Modify: `dashboard.html`, `css/style.css`

**Description:**
Add a "VIEW ALL MISSIONS" button to the Mission Control panel that opens a modal showing all pending locations.

**Requirements:**
- Button in Mission Control panel (below CLOCK IN button)
- Modal with list of all pending missions
- Show: Location name, address, distance, last interaction date
- Sortable by: distance, name, priority
- Click on mission to see full details
- Search/filter functionality

**Backend Function:** Use existing locations from Firestore query

---

### Task 2: Mission Details View
**Priority:** CRITICAL
**Files:**
- Create: `js/mission-details.js`
- Modify: `css/style.css`

**Description:**
Detailed view modal for any mission showing full history and current status.

**Requirements:**
- Show all location details
- Show interaction history (last 5 interactions)
- Show AI Boss recommendations
- Show scheduled follow-ups
- Photos from previous visits
- Equipment list if available
- Quick action buttons (Assign to Me, Mark Priority, etc.)

---

### Task 3: Edit Mission/Location
**Priority:** HIGH
**Files:**
- Create: `js/location-editor.js`
- Modify: `dashboard.html`

**Description:**
Allow editing location details (address, notes, equipment list).

**Requirements:**
- Edit form modal
- Fields: Name, address, contact, notes, equipment list
- Save button calls Cloud Function to update Firestore
- Validation for required fields
- Success/error messaging

**Backend:** Create `updateLocation` Cloud Function

---

### Task 4: Close/Complete Mission
**Priority:** HIGH
**Files:**
- Modify: `js/mission-details.js`
- Backend: `functions/index.js`

**Description:**
Mark a location as "Completed" or "Closed" (no longer needs service).

**Requirements:**
- "Close Mission" button in mission details
- Confirmation dialog
- Reason selection (Service complete, Customer closed, etc.)
- Updates status to "completed" or "closed"
- Removes from pending queue
- Archives interaction history

**Backend:** Create `closeMission` Cloud Function

---

### Task 5: Reopen Closed Mission
**Priority:** MEDIUM
**Files:**
- Modify: `js/missions-list.js`
- Backend: `functions/index.js`

**Description:**
Allow reopening closed missions if customer returns.

**Requirements:**
- "Closed Missions" tab in missions list
- "Reopen" button for each closed mission
- Adds back to pending queue
- Preserves all history

**Backend:** Create `reopenMission` Cloud Function

---

### Task 6: Assign Mission Priority
**Priority:** MEDIUM
**Files:**
- Modify: `js/mission-details.js`
- Backend: `functions/index.js`

**Description:**
Manually set priority level for missions (CRITICAL/HIGH/MEDIUM/LOW).

**Requirements:**
- Priority selector in mission details
- Color-coded badges (red/orange/yellow/green)
- Updates Firestore `priority` field
- Affects sort order in mission list
- Shows in mission briefing

**Backend:** Create `updateMissionPriority` Cloud Function

---

### Task 7: Manual Mission Assignment
**Priority:** MEDIUM
**Files:**
- Create: `js/mission-assignment.js`
- Backend: `functions/index.js`

**Description:**
Allow manual assignment of missions to self (instead of auto "Get Next").

**Requirements:**
- "Assign to Me" button in mission details
- Sets `assignedTo` field to current user
- Shows as "My Active Mission"
- Can only have one active mission at a time
- Releases mission if canceled

**Backend:** Create `assignMission` Cloud Function

---

### Task 8: Search Missions
**Priority:** MEDIUM
**Files:**
- Modify: `js/missions-list.js`

**Description:**
Search bar in missions list to find specific locations.

**Requirements:**
- Search box at top of missions modal
- Search by: location name, address, contact
- Real-time filtering as user types
- Show result count
- Clear search button

---

### Task 9: Filter Missions by Status
**Priority:** MEDIUM
**Files:**
- Modify: `js/missions-list.js`

**Description:**
Filter tabs for different mission statuses.

**Requirements:**
- Tabs: All / Pending / In Progress / Completed / Closed
- Count badge on each tab
- Clicking tab filters list
- Default to "Pending" tab

---

### Task 10: Mission Map Integration
**Priority:** LOW
**Files:**
- Modify: `js/map.js`
- Modify: `dashboard.html`

**Description:**
Click on map marker to see mission details.

**Requirements:**
- Map markers are clickable
- Popup shows location name and quick actions
- "View Details" button opens mission details modal
- "Start Mission" button assigns and starts workflow

---

### Task 11: Bulk Mission Actions
**Priority:** LOW
**Files:**
- Create: `js/bulk-actions.js`

**Description:**
Select multiple missions and perform bulk actions.

**Requirements:**
- Checkboxes on each mission in list
- "Select All" checkbox
- Bulk actions: Close, Set Priority, Export to CSV
- Confirmation for destructive actions

**Backend:** Create `bulkUpdateMissions` Cloud Function

---

### Task 12: Mission Notes
**Priority:** MEDIUM
**Files:**
- Modify: `js/mission-details.js`
- Backend: `functions/index.js`

**Description:**
Add general notes to a mission (separate from interaction notes).

**Requirements:**
- Notes text area in mission details
- Save notes button
- Shows notes history with timestamps
- Can edit/delete own notes
- Notes persist across interactions

**Backend:** Create `addMissionNote` Cloud Function

---

### Task 13: Scheduled Missions Calendar
**Priority:** LOW
**Files:**
- Create: `js/calendar.js`
- Create: `calendar.html` section in dashboard

**Description:**
Calendar view of scheduled return visits.

**Requirements:**
- Monthly calendar view
- Shows missions with scheduled follow-ups
- Click date to see all missions that day
- Click mission to open details
- Drag-and-drop to reschedule (stretch goal)

---

### Task 14: Mission Templates
**Priority:** LOW
**Files:**
- Create: `js/mission-templates.js`
- Backend: `functions/index.js`

**Description:**
Create reusable mission templates for common scenarios.

**Requirements:**
- Templates for: PM Service, Emergency, Follow-up, New Install
- Template includes: intro script, checklist items, typical tasks
- Apply template when starting mission
- Can customize after applying

**Backend:** Create `getMissionTemplates`, `createMissionTemplate` Cloud Functions

---

### Task 15: Mission Distance Calculator
**Priority:** LOW
**Files:**
- Modify: `js/mission.js`

**Description:**
Real-time distance calculation based on current GPS location.

**Requirements:**
- Use browser geolocation API
- Calculate distance to mission
- Update distance display in real-time
- Show "Arrived" when within 100 meters
- Works even when offline (uses last known location)

---

## 💬 INTERACTION MANAGEMENT (Tasks 16-25)

### Task 16: View Interaction History
**Priority:** CRITICAL
**Files:**
- Create: `js/interaction-history.js`
- Modify: `dashboard.html`

**Description:**
View all past interactions for a location.

**Requirements:**
- "History" tab in mission details modal
- List of all interactions with dates
- Shows: date, efficacy score, notes summary, AI priority
- Click to expand full details
- Photos in expandable gallery
- Filter by date range

---

### Task 17: Edit Past Interaction
**Priority:** HIGH
**Files:**
- Create: `js/interaction-editor.js`
- Backend: `functions/index.js`

**Description:**
Edit interaction details after submission (within 24 hours).

**Requirements:**
- "Edit" button on recent interactions (< 24hrs old)
- Edit form with all fields (efficacy, notes, photos)
- Can't edit after 24 hours (shows "Locked" badge)
- Saves edit with timestamp
- Marks as "Edited" in history

**Backend:** Create `editInteraction` Cloud Function

---

### Task 18: Delete Interaction
**Priority:** MEDIUM
**Files:**
- Modify: `js/interaction-history.js`
- Backend: `functions/index.js`

**Description:**
Delete interaction (admin only or within 1 hour).

**Requirements:**
- "Delete" button on very recent interactions (< 1hr)
- Confirmation dialog with reason
- Soft delete (marks as deleted, doesn't remove)
- Can view deleted interactions in admin mode
- Updates KPIs accordingly

**Backend:** Create `deleteInteraction` Cloud Function

---

### Task 19: Add Follow-up Note
**Priority:** MEDIUM
**Files:**
- Create: `js/followup-notes.js`
- Backend: `functions/index.js`

**Description:**
Add notes to scheduled follow-ups after AI Boss creates them.

**Requirements:**
- View scheduled actions in mission details
- "Add Note" button on each scheduled action
- Notes saved to scheduled action doc
- Shows in AI Boss guidance when action is due

**Backend:** Modify `completeScheduledAction` to include notes

---

### Task 20: Mark Scheduled Action Complete
**Priority:** HIGH
**Files:**
- Create: `js/scheduled-actions.js`
- Modify: `dashboard.html`

**Description:**
Complete scheduled follow-ups created by AI Boss.

**Requirements:**
- "Scheduled Actions" button in dashboard header
- Modal showing all upcoming scheduled actions
- Sorted by date (overdue at top in red)
- "Complete" button triggers workflow
- Can add notes when completing
- Updates AI Boss system

**Backend:** Use existing `completeScheduledAction` function

---

### Task 21: Reschedule Follow-up
**Priority:** MEDIUM
**Files:**
- Modify: `js/scheduled-actions.js`
- Backend: `functions/index.js`

**Description:**
Reschedule a follow-up action to a different date/time.

**Requirements:**
- "Reschedule" button on scheduled actions
- Date/time picker
- Reason for reschedule (optional)
- Updates scheduled action document
- Sends to AI Boss for context

**Backend:** Create `rescheduleAction` Cloud Function

---

### Task 22: Photo Gallery Enhancement
**Priority:** LOW
**Files:**
- Create: `js/photo-gallery.js`
- Modify: `css/style.css`

**Description:**
Better photo viewing experience for interaction photos.

**Requirements:**
- Lightbox/modal for full-size photo viewing
- Swipe/arrow navigation between photos
- Pinch-to-zoom on mobile
- Download photo button
- Delete photo button (recent only)
- Shows photo metadata (date, interaction)

---

### Task 23: Voice Notes
**Priority:** LOW
**Files:**
- Create: `js/voice-notes.js`
- Backend: `functions/index.js`

**Description:**
Record voice notes instead of typing during interaction.

**Requirements:**
- Microphone button in interaction form
- Record up to 2 minutes
- Play back before submitting
- Saves as audio file in Storage
- AI Boss can analyze audio (stretch: transcribe)

**Backend:** Create `uploadVoiceNote` Cloud Function

---

### Task 24: Interaction Templates/Quick Notes
**Priority:** MEDIUM
**Files:**
- Create: `js/quick-notes.js`

**Description:**
Pre-written note templates for common scenarios.

**Requirements:**
- Template buttons: "All Good", "Filter Changed", "Gasket Replaced", "Needs Parts"
- Click template to auto-fill notes
- Can customize after filling
- User can create custom templates
- Saves to user preferences

---

### Task 25: Export Interaction Report
**Priority:** LOW
**Files:**
- Create: `js/interaction-export.js`
- Backend: `functions/index.js`

**Description:**
Export single interaction as PDF or email to customer.

**Requirements:**
- "Export" button in interaction details
- Options: Download PDF, Email to Customer
- PDF includes: Date, location, efficacy, notes, photos
- Branded header with RapidPro logo
- Customer signature field (for printed copies)

**Backend:** Create `exportInteractionPDF` Cloud Function

---

## 🎨 DASHBOARD ENHANCEMENTS (Tasks 26-35)

### Task 26: Quick Stats Cards
**Priority:** MEDIUM
**Files:**
- Create: `js/quick-stats.js`
- Modify: `dashboard.html`

**Description:**
Add more detailed stats cards to dashboard.

**Requirements:**
- New cards: "Today's Missions", "This Week", "Overdue Follow-ups"
- Click card to filter missions list
- Animated counters
- Color coding (green = good, red = needs attention)

---

### Task 27: Recent Activity Feed
**Priority:** MEDIUM
**Files:**
- Create: `js/activity-feed.js`
- Modify: `dashboard.html`

**Description:**
Feed showing recent interactions and system events.

**Requirements:**
- Shows last 10 activities
- Types: Interaction logged, Mission completed, AI guidance received
- Timestamps (relative: "2 hours ago")
- Click to view details
- Auto-refreshes every 30 seconds

---

### Task 28: Profile/Settings Page
**Priority:** MEDIUM
**Files:**
- Create: `js/profile.js`
- Create section in `dashboard.html`
- Backend: `functions/index.js`

**Description:**
User profile and preferences.

**Requirements:**
- Edit name, email, phone
- Notification preferences
- Default mission radius
- Quick note templates
- Theme preferences (if we add multiple themes)
- Change password

**Backend:** Create `updateUserProfile` Cloud Function

---

### Task 29: Notifications System
**Priority:** LOW
**Files:**
- Create: `js/notifications.js`

**Description:**
In-app notification bell with alerts.

**Requirements:**
- Bell icon in header with unread count badge
- Dropdown showing notifications
- Types: Overdue follow-up, New mission assigned, AI critical alert
- Mark as read
- Clear all
- Desktop notifications (with permission)

---

### Task 30: Dashboard Widgets System
**Priority:** LOW
**Files:**
- Create: `js/widgets.js`

**Description:**
Draggable/resizable dashboard widgets.

**Requirements:**
- User can add/remove widgets
- Widgets: Mission list, Map, Stats, Activity feed, Calendar
- Drag-and-drop to rearrange
- Resize widgets
- Save layout to user preferences

---

### Task 31: Dark/Light Theme Toggle
**Priority:** LOW
**Files:**
- Modify: `css/style.css`
- Create: `js/theme-switcher.js`

**Description:**
Toggle between dark and light themes (we keep testing themes!).

**Requirements:**
- Toggle switch in header or settings
- Smooth transition animation
- Saves preference to localStorage
- Separate CSS variables for each theme
- Preview both themes

---

### Task 32: Mobile Responsive Improvements
**Priority:** MEDIUM
**Files:**
- Modify: `css/style.css`

**Description:**
Better mobile experience for field technicians.

**Requirements:**
- Stack panels vertically on mobile
- Larger touch targets (buttons, inputs)
- Simplified navigation menu
- Swipe gestures for common actions
- Works in landscape and portrait
- Test on iPhone and Android

---

### Task 33: Offline Mode Indicator
**Priority:** LOW
**Files:**
- Create: `js/offline-detector.js`

**Description:**
Show banner when offline, queue actions for sync.

**Requirements:**
- Red banner at top when offline
- "You're offline" message
- Queue failed actions
- Auto-retry when back online
- Show "Syncing..." when reconnected

---

### Task 34: Keyboard Shortcuts
**Priority:** LOW
**Files:**
- Create: `js/keyboard-shortcuts.js`

**Description:**
Power user keyboard shortcuts.

**Requirements:**
- Shortcuts: G (Get Mission), M (View Missions), S (Search), ESC (Close Modal)
- Show shortcut hints in tooltips
- Help modal showing all shortcuts (press ?)
- Don't interfere with typing in inputs

---

### Task 35: Loading States & Animations
**Priority:** LOW
**Files:**
- Modify: `css/style.css`
- Modify: `js/*.js`

**Description:**
Better loading indicators and micro-animations.

**Requirements:**
- Skeleton screens while loading data
- Spinner for button actions
- Smooth transitions between screens
- Loading bar at top for background tasks
- Success/error toast notifications

---

## 📊 REPORTING & ANALYTICS (Tasks 36-42)

### Task 36: Weekly Summary Report
**Priority:** MEDIUM
**Files:**
- Create: `js/reports.js`
- Backend: `functions/index.js`

**Description:**
Generate weekly performance summary.

**Requirements:**
- Report shows: Missions completed, avg efficacy, top locations, hours worked
- Charts: Missions per day, efficacy trend
- Email report option
- Download as PDF
- Date range selector

**Backend:** Create `generateWeeklySummary` Cloud Function

---

### Task 37: Location Performance Analytics
**Priority:** LOW
**Files:**
- Create: `js/location-analytics.js`

**Description:**
Analytics for specific location over time.

**Requirements:**
- Chart showing efficacy trend
- Interaction frequency
- Common issues
- Parts replaced history
- Cost analysis (if we add parts costs)

---

### Task 38: AI Boss Insights Dashboard
**Priority:** MEDIUM
**Files:**
- Create: `js/ai-insights.js`

**Description:**
Dashboard showing AI Boss recommendations and patterns.

**Requirements:**
- Top critical locations
- Most common AI commands
- Scheduled actions completion rate
- AI accuracy metrics (user feedback)
- Trend analysis

---

### Task 39: Export Data (CSV/Excel)
**Priority:** LOW
**Files:**
- Create: `js/data-export.js`

**Description:**
Export mission and interaction data.

**Requirements:**
- Export missions list as CSV
- Export interactions with date range
- Export AI Boss recommendations
- Format selection (CSV, Excel, JSON)
- Includes photos as ZIP download option

---

### Task 40: Custom Date Range Reports
**Priority:** LOW
**Files:**
- Modify: `js/reports.js`

**Description:**
Generate reports for custom date ranges.

**Requirements:**
- Date range picker (from/to)
- Presets: Today, This Week, This Month, Last 30 Days, Custom
- Filter by location, efficacy, priority
- Show comparison to previous period

---

### Task 41: Leaderboard/Gamification
**Priority:** LOW
**Files:**
- Create: `js/leaderboard.js`

**Description:**
Leaderboard showing top performers (if multiple techs).

**Requirements:**
- Rankings by: Missions completed, Avg efficacy, Critical saves
- Badges/achievements
- Weekly/monthly/all-time views
- Friendly competition
- Privacy controls

---

### Task 42: Print-Friendly Reports
**Priority:** LOW
**Files:**
- Create: `print.css`
- Modify: `js/reports.js`

**Description:**
Print-optimized versions of reports.

**Requirements:**
- Print stylesheet
- Removes navigation/buttons
- Proper page breaks
- Black & white friendly
- Company logo on each page

---

## ✨ UI/UX POLISH (Tasks 43-50)

### Task 43: Tooltips & Help Text
**Priority:** MEDIUM
**Files:**
- Create: `js/tooltips.js`
- Modify: `css/style.css`

**Description:**
Helpful tooltips throughout the app.

**Requirements:**
- Hover tooltips on all icons/buttons
- "What's this?" icons with explanations
- Context-sensitive help
- Keyboard shortcut hints in tooltips

---

### Task 44: Empty States
**Priority:** LOW
**Files:**
- Modify: `css/style.css`
- Modify: `js/*.js`

**Description:**
Better empty state messages.

**Requirements:**
- "No missions yet" with helpful next steps
- "No interactions" with encouragement
- "No photos" with camera icon
- Friendly illustrations or icons
- Clear call-to-action

---

### Task 45: Error Handling Improvements
**Priority:** MEDIUM
**Files:**
- Create: `js/error-handler.js`

**Description:**
Better error messages and recovery.

**Requirements:**
- User-friendly error messages (not technical)
- Retry buttons for failed actions
- Show what went wrong and how to fix
- Auto-retry for network errors
- Error logging to backend

---

### Task 46: Confirmation Dialogs
**Priority:** MEDIUM
**Files:**
- Create: `js/confirm-dialog.js`

**Description:**
Reusable confirmation dialogs.

**Requirements:**
- Used for: Delete, Close mission, Logout
- Show impact of action
- Cancel button is prominent
- Destructive actions require typing confirmation
- Keyboard accessible (Enter/Esc)

---

### Task 47: Breadcrumb Navigation
**Priority:** LOW
**Files:**
- Create: `js/breadcrumbs.js`
- Modify: `dashboard.html`

**Description:**
Breadcrumb trail showing current location in app.

**Requirements:**
- Shows: Dashboard > Missions > [Location Name] > History
- Clickable to navigate back
- Updates when navigating
- Mobile-friendly (abbreviates on small screens)

---

### Task 48: Search Everything
**Priority:** LOW
**Files:**
- Create: `js/global-search.js`

**Description:**
Global search bar (Cmd/Ctrl + K).

**Requirements:**
- Searches: Missions, Interactions, Notes, AI commands
- Fuzzy search
- Shows results grouped by type
- Keyboard navigation
- Recent searches

---

### Task 49: Accessibility Improvements
**Priority:** MEDIUM
**Files:**
- Modify: `css/style.css`
- Modify: `dashboard.html`

**Description:**
Better accessibility for all users.

**Requirements:**
- Proper ARIA labels
- Keyboard navigation for all actions
- Focus indicators
- Screen reader friendly
- High contrast mode option
- Proper heading hierarchy

---

### Task 50: Performance Optimization
**Priority:** LOW
**Files:**
- Modify: All JS files

**Description:**
Speed up the dashboard.

**Requirements:**
- Lazy load images
- Debounce search inputs
- Virtual scrolling for long lists
- Cache frequently accessed data
- Minimize API calls
- Code splitting/bundling

---

## 🔍 PREVIEW WORKFLOW FOR TERRY

### How Cloud Claude Creates Previews:

After completing a task and pushing to branch:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Deploy to preview channel
firebase hosting:channel:deploy preview-task-X

# Output will be:
# ✔ hosting:channel: Channel URL (preview-task-X):
#   https://rapidpro-memphis--preview-task-x-abc123.web.app [expires 2025-11-22]
```

### How Terry Views Before Merging:

1. Cloud Claude provides preview URL
2. Terry opens URL in browser
3. Terry tests the changes
4. If good → Terry tells LOCAL Claude to merge
5. If needs changes → Terry tells Cloud Claude what to fix

### How LOCAL Claude Merges:

```bash
git checkout main
git pull origin main
git merge origin/claude/task-name --no-edit
git push origin main
# Auto-deploys to production in 2-3 min
```

---

## 📝 TASK FORMAT FOR CLOUD CLAUDE

When starting a task, respond with:

```
Starting Task #X: [Task Name]

Files I'll modify:
- [file1]
- [file2]

Changes I'm making:
1. [Change 1]
2. [Change 2]

Branch: claude/task-X-short-description
Estimated completion: [timeframe]
```

When completing a task:

```
✅ Task #X Complete: [Task Name]

Changes made:
- [Summary of changes]

Testing done:
- [What you tested]

Branch: claude/task-X-short-description

Preview URL: [Firebase preview URL]

Ready for review! Merge with:
git merge origin/claude/task-X-short-description
```

---

## 🎯 PRIORITY GUIDE

**CRITICAL** = Core functionality, needed ASAP
**HIGH** = Important for usability
**MEDIUM** = Nice to have, improves experience
**LOW** = Polish, can wait

**Suggested order:** Do all CRITICAL first, then HIGH, then MEDIUM, then LOW.

---

**Created by:** LOCAL Claude
**For:** Cloud Claude
**Total Tasks:** 50
**Estimated Total Time:** 40-60 hours of work
**Status:** Ready to start!
