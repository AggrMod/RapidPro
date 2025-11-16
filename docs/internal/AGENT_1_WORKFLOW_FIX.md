# Agent 1 - Fix "Interested" Workflow

**Issue Found:** When you log a door-knock as "INTERESTED", the system currently wants to move to the next location. But in real field service work, if a customer needs help NOW, you need to start the job immediately and track billable hours.

---

## The Problem

**Current Flow:**
1. Door knock → "INTERESTED"
2. Log equipment survey
3. System says: "Move to next location"

**What SHOULD Happen:**
1. Door knock → "INTERESTED"
2. Ask: "Start work NOW or schedule later?"
3. If NOW → Create work order, start time tracker, BEGIN BILLABLE HOURS
4. If LATER → Schedule appointment, then move to next location

---

## Industry Standard Workflow

Based on field service management best practices (ServiceTitan, Fieldpoint, etc):

### Job Status Progression:
```
Lead/Prospect
    ↓
Scheduled
    ↓
In Progress ← Billable hours START here
    ↓
Work Complete
    ↓
Invoiced
    ↓
Closed/Paid
```

**Key Insight:** When you're on-site and customer says "yes, help me now", you immediately transition from Lead → In Progress and start tracking billable time.

---

## Your Task: Fix the "Interested" Flow

### File to Modify: `js/lead-conversion.js`

**Current code (around line 600-650):**
After lead conversion completes, it probably says something like:
```javascript
showSuccessMessage("Lead created! Moving to next location...");
```

**Change it to:**

### Step 1: Add "Start Work?" Decision Point

After the equipment survey is complete, show this modal:

```
┌─────────────────────────────────────┐
│  LEAD CONVERTED! ✅                 │
├─────────────────────────────────────┤
│                                     │
│  Customer: Memphis BBQ Company      │
│  Issue: Walk-in cooler not cooling  │
│                                     │
│  What do you want to do?            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🔧 START WORK NOW          │   │
│  │  Begin billable hours       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📅 SCHEDULE FOR LATER      │   │
│  │  Pick appointment time      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ❌ JUST LOG & MOVE ON      │   │
│  │  Go to next location        │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

### Step 2: If "START WORK NOW" Selected

**Create a new file:** `js/work-order-quick-start.js`

**Purpose:** Immediately start a work order and time tracker

**What it does:**

#### A. Create Work Order in Firestore

Collection: `workOrders`

```javascript
{
  id: "WO-" + Date.now(),
  customerId: leadId,
  locationId: locationId,
  status: "in_progress",

  // Job details
  jobType: "service_call",
  description: "Walk-in cooler not cooling properly",
  equipmentList: [...from lead conversion],
  priority: "high", // if critical equipment

  // Billing tracking
  startTime: timestamp,
  endTime: null,
  billableHours: 0,
  hourlyRate: 125, // configurable

  // Parts tracking
  partsUsed: [],
  laborCost: 0,
  partsCost: 0,
  totalCost: 0,

  // Technician
  technicianId: currentUser.uid,
  technicianName: currentUser.displayName,

  // GPS
  jobLocation: { lat, lng },

  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### B. Start Time Tracker

**Show live timer in dashboard:**

```
┌─────────────────────────────────────┐
│  🔧 ACTIVE JOB                      │
├─────────────────────────────────────┤
│                                     │
│  Memphis BBQ Company                │
│  Walk-in cooler repair              │
│                                     │
│  ⏱️  TIME: 00:23:45                 │
│  💰 BILLABLE: $49.38 ($125/hr)      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ⏸️  PAUSE TIMER             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ✅ JOB COMPLETE            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📦 ADD PARTS USED          │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Timer updates every second:**
- Shows elapsed time (HH:MM:SS)
- Calculates billable amount in real-time
- Persists to Firestore every 60 seconds (so if browser closes, time isn't lost)

#### C. Dashboard Integration

**Add to dashboard.html:**

```html
<!-- Active Job Widget (shows when work order in progress) -->
<div id="active-job-widget" class="active-job-panel" style="display: none;">
    <div class="job-header">
        <h3>🔧 ACTIVE JOB</h3>
        <div class="job-timer" id="job-timer">00:00:00</div>
    </div>
    <div class="job-details" id="job-details">
        <!-- Customer name, job description -->
    </div>
    <div class="job-actions">
        <button onclick="pauseJob()">⏸️ PAUSE</button>
        <button onclick="completeJob()">✅ COMPLETE</button>
        <button onclick="addParts()">📦 ADD PARTS</button>
    </div>
</div>
```

**Show this widget:**
- When work order status = "in_progress"
- Replaces or overlays the normal "Get Mission" button
- Stays visible until job is completed

---

### Step 3: If "SCHEDULE FOR LATER" Selected

**Show date/time picker:**

```
┌─────────────────────────────────────┐
│  📅 SCHEDULE APPOINTMENT            │
├─────────────────────────────────────┤
│                                     │
│  Customer: Memphis BBQ Company      │
│                                     │
│  Date:                              │
│  ┌─────────────────────────────┐   │
│  │  [Date Picker]              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Time:                              │
│  ┌──────┐  ┌──────┐  ┌──────┐     │
│  │ 10:00│  │ 10:30│  │ 11:00│     │
│  └──────┘  └──────┘  └──────┘     │
│                                     │
│  [ SCHEDULE & CONTINUE ]            │
└─────────────────────────────────────┘
```

**Creates work order with:**
- Status: "scheduled"
- scheduledDate: selected date/time
- Adds to calendar/reminders
- Then moves to next door-knock location

---

### Step 4: If "JUST LOG & MOVE ON"

**This is the current behavior:**
- Lead is saved with equipment survey
- Status: "interested"
- No work order created
- User can follow up later
- Move to next location

---

## Time Tracking Implementation

### Create: `js/time-tracker.js`

**Features:**

#### Start Timer:
```javascript
function startJobTimer(workOrderId) {
  const startTime = Date.now();

  // Store in memory
  activeTimer = {
    workOrderId,
    startTime,
    elapsed: 0
  };

  // Update UI every second
  timerInterval = setInterval(() => {
    updateTimerDisplay();
  }, 1000);

  // Save to Firestore every 60 seconds
  persistInterval = setInterval(() => {
    saveTimerToFirestore();
  }, 60000);
}
```

#### Pause Timer:
```javascript
function pauseJobTimer() {
  clearInterval(timerInterval);
  clearInterval(persistInterval);
  saveTimerToFirestore(); // Save immediately

  // Update work order status
  db.collection('workOrders').doc(workOrderId).update({
    status: 'paused',
    pausedAt: timestamp,
    billableHours: calculateHours()
  });
}
```

#### Resume Timer:
```javascript
function resumeJobTimer() {
  // Restart intervals
  // Continue from paused time
}
```

#### Complete Job:
```javascript
function completeJob() {
  clearInterval(timerInterval);
  clearInterval(persistInterval);

  const totalHours = calculateHours();
  const laborCost = totalHours * hourlyRate;

  // Show completion modal with summary
  showJobCompletionModal({
    totalTime: formatTime(totalHours),
    laborCost: laborCost,
    partsUsed: [...],
    totalCost: laborCost + partsCost
  });
}
```

---

## Data Structure

### Firestore Collection: `workOrders`

**Document Fields:**

```javascript
{
  // Work Order ID
  id: "WO-1731705600000",

  // Customer/Location
  customerId: "abc123",
  locationId: "xyz789",
  customerName: "Memphis BBQ Company",
  address: "123 Beale St",

  // Job Details
  jobType: "service_call", // service_call, installation, pm
  description: "Walk-in cooler not cooling",
  equipmentAffected: "Walk-in cooler (True T-49F)",
  priority: "high", // critical, high, medium, low

  // Status Tracking
  status: "in_progress", // scheduled, in_progress, paused, work_complete, invoiced, closed

  // Time Tracking
  startTime: timestamp,
  pausedAt: timestamp (if paused),
  endTime: timestamp (when completed),
  totalSeconds: 5430, // 1.5 hours = 5400 seconds
  billableHours: 1.51, // rounded to nearest 0.01

  // Billing
  hourlyRate: 125,
  laborCost: 188.75, // billableHours * hourlyRate
  partsUsed: [
    {
      name: "Compressor relay",
      partNumber: "TR-456",
      quantity: 1,
      cost: 45.00
    }
  ],
  partsCost: 45.00,
  totalCost: 233.75, // laborCost + partsCost

  // Technician
  technicianId: "user123",
  technicianName: "Terry",

  // Location
  jobLocation: { lat: 35.1474, lng: -90.0489 },

  // Photos/Notes
  photos: ["url1", "url2"],
  notes: "Replaced faulty relay, tested for 30 min",

  // Customer Signature
  customerSignature: "data:image/png;base64...",
  customerName: "John Smith (Manager)",
  signedAt: timestamp,

  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## Implementation Checklist

### Phase 1: Decision Modal ✅
- [ ] Modify `js/lead-conversion.js` to show 3-option modal after lead creation
- [ ] Add buttons: "Start Work Now", "Schedule Later", "Log & Move On"
- [ ] Style modal (mobile-friendly)

### Phase 2: Start Work Now Flow ✅
- [ ] Create `js/work-order-quick-start.js`
- [ ] Create `js/time-tracker.js`
- [ ] Function: `createWorkOrder(leadData)`
- [ ] Function: `startJobTimer(workOrderId)`
- [ ] Dashboard widget for active job
- [ ] Real-time timer display
- [ ] Firestore persistence every 60 seconds

### Phase 3: Schedule Later Flow ✅
- [ ] Date/time picker modal
- [ ] Create work order with status: "scheduled"
- [ ] Add to calendar/reminders
- [ ] Return to door-knock workflow

### Phase 4: Time Tracker Features ✅
- [ ] Pause/resume functionality
- [ ] Calculate billable hours
- [ ] Display running total cost
- [ ] Add parts during job
- [ ] Job completion modal

### Phase 5: Job Completion ✅
- [ ] Summary screen (time, parts, total cost)
- [ ] Customer signature capture
- [ ] Photo documentation
- [ ] Generate invoice
- [ ] Update KPIs

---

## Success Criteria

**When you're done, Terry should be able to:**

1. ✅ Door-knock location
2. ✅ Customer says "my cooler is broken, can you help now?"
3. ✅ Log as "INTERESTED" → Equipment survey
4. ✅ Click "START WORK NOW"
5. ✅ Timer starts immediately (00:00:01, 00:00:02...)
6. ✅ Dashboard shows "ACTIVE JOB" with running timer
7. ✅ Terry fixes the cooler (1.5 hours)
8. ✅ Click "JOB COMPLETE"
9. ✅ See summary: 1.5 hrs × $125/hr = $187.50
10. ✅ Add parts if needed
11. ✅ Customer signs
12. ✅ Invoice generated
13. ✅ Revenue tracked

**This matches industry standard field service workflow!**

---

## Your Branch

```bash
git checkout main
git pull origin main
git checkout -b agent1-leads/fix-interested-workflow

# Modify: js/lead-conversion.js
# Create: js/work-order-quick-start.js
# Create: js/time-tracker.js
# Modify: dashboard.html (add active job widget)
# Create: css/work-order.css

git add .
git commit -m "Agent 1: Fix interested workflow - add start work now option with time tracking"
git push origin agent1-leads/fix-interested-workflow
```

---

## Notes

**This is a BIG task** - probably 2-3 hours of work. The time tracker is the trickiest part because it needs to:
- Run in real-time (setInterval)
- Persist to Firestore periodically
- Handle browser refresh (restore timer from Firestore)
- Calculate billable hours accurately
- Show running total cost

**But this is CRITICAL functionality** - without it, Terry can't track billable time or create invoices!

Take your time, build it right. This is core business logic.

---

**Priority:** CRITICAL
**Complexity:** HIGH
**Estimated Time:** 2-3 hours
**Value:** This enables the entire revenue tracking system!

Go build! 🔥
