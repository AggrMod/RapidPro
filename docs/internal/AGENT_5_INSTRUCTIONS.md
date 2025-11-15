# Agent 5: PM Module - Your Task

**Good find!** You discovered old PM files in `/dashboard-framework/`. Those are experimental code that was never deployed.

---

## Your Task: Build New PM Contract System

**Don't use the old files** - they're for field PM workflows (different purpose).

**What you're building:** PM Contract & Recurring Revenue System

---

## Create These NEW Files:

### 1. `js/pm-contracts.js`
**Purpose:** Manage preventive maintenance contracts

**Features:**
- Create new PM contract (Monthly / Quarterly / Annual)
- Customer info + equipment list
- Pricing (monthly recurring charge)
- Contract status (Active / Expired / Cancelled)
- Auto-renewal toggle
- Contract start/end dates

**Firestore Collection:** `maintenanceContracts`

**Structure:**
```javascript
{
  customerId: "abc123",
  customerName: "Memphis BBQ Co",
  contractType: "monthly", // monthly, quarterly, annual
  monthlyPrice: 199.99,
  equipmentCovered: ["Walk-in cooler #1", "Ice machine #2"],
  status: "active",
  startDate: timestamp,
  endDate: timestamp,
  autoRenew: true,
  nextServiceDate: timestamp,
  servicesCompleted: 3,
  servicesRemaining: 9
}
```

---

### 2. `js/recurring-scheduler.js`
**Purpose:** Auto-schedule PM visits

**Features:**
- Generate service schedule for active contracts
- Monthly contracts → Schedule 1st of every month
- Quarterly contracts → Schedule every 3 months
- Show upcoming PM visits (next 30 days)
- Send reminder 3 days before
- Mark service complete → Auto-schedule next one

**Cloud Function:** Create `functions/pm-scheduler.js`

---

### 3. Dashboard Integration

**Add to `dashboard.html`:**
- "PM CONTRACTS" button in Mission Control panel
- Opens modal showing:
  - Active contracts (count)
  - Upcoming PM visits (this week)
  - Revenue from contracts (monthly recurring)
  - Button: "CREATE NEW CONTRACT"

**UI:**
- List all active PM contracts
- Click contract → See details
- Button to schedule ad-hoc PM visit
- Button to cancel/pause contract

---

## Your Branch

```bash
git checkout main
git pull origin main
git checkout -b agent5-pm/contract-system
```

---

## What to Build

**Priority 1: Contract Creation**
- Form to create new PM contract
- Save to Firestore
- Calculate monthly/quarterly/annual pricing

**Priority 2: Contract List View**
- Show all active contracts
- Filter by status
- Search by customer name

**Priority 3: Auto-Scheduling**
- Generate upcoming PM visits
- Show on dashboard
- Mark complete → Schedule next

**Priority 4: Revenue Tracking**
- Total monthly recurring revenue
- Revenue per customer
- Contract renewal rate

---

## Don't Touch

- ❌ `/dashboard-framework/pm-*.js` (old experimental code)
- ❌ Any other agent's files
- ❌ `dashboard.html` structure (just add your button/modal)

---

## When Done

```bash
git add js/pm-contracts.js js/recurring-scheduler.js
git commit -m "Agent 5: PM contract and recurring revenue system"
git push origin agent5-pm/contract-system
```

Then tell Terry: "Agent 5 complete. Branch: agent5-pm/contract-system"

---

## Questions?

If unclear, just ask Terry or LOCAL Claude!

**Focus:** New PM contract system for recurring revenue, NOT the old field PM workflow files.

Go build! 🚀
