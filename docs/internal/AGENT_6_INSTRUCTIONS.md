# Agent 6: Customer Lifecycle Module - Your Task

**Great research!** You found the right tasks. Here's exactly what to build:

---

## Your Mission: Customer Pipeline Dashboard

Build a visual dashboard that shows Terry's entire customer funnel from first door-knock to recurring revenue.

---

## Create These Files:

### 1. `js/customer-lifecycle.js` (START HERE - Priority 1)

**Purpose:** Visual pipeline showing customer journey

**The Pipeline Stages:**
```
Prospect → Lead → First Job → Repeat Customer → PM Contract
```

**Dashboard View:**

```
┌─────────────────────────────────────────────────────┐
│         CUSTOMER ACQUISITION PIPELINE               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Prospects (150)  →  Leads (23)  →  Customers (8)  │
│      📋              🎯             💰             │
│                                                     │
│  Conversion Rate:    15.3%          34.8%          │
│                                                     │
│  PM Contracts (2)  ←  Repeat (5)                   │
│      🔄               ⭐                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Metrics to Calculate:**
- Total prospects (from locations collection, status: "pending")
- Total leads (status: "interested" or first contact logged)
- Total customers (at least one completed job)
- Total repeat customers (2+ jobs)
- Total PM contracts (active maintenance contracts)
- Conversion rates between each stage
- Average time in each stage
- Revenue per customer
- Lifetime value per customer

**Firestore Queries:**
```javascript
// Count prospects
db.collection('locations').where('status', '==', 'pending').count()

// Count leads
db.collection('locations').where('status', '==', 'interested').count()

// Count customers
db.collection('interactions').select('locationId').distinct().count()

// Count PM contracts
db.collection('maintenanceContracts').where('status', '==', 'active').count()
```

**UI Elements:**
- Button in dashboard: "CUSTOMER PIPELINE"
- Opens modal showing pipeline visualization
- Click each stage → See list of customers in that stage
- Show revenue at each stage
- AI Boss recommendations: "3 leads ready for follow-up call"

---

### 2. `js/conversion-funnel.js` (Priority 2)

**Purpose:** Track conversion rates and identify bottlenecks

**Features:**
- Conversion rate: Prospect → Lead (how many door-knocks convert?)
- Conversion rate: Lead → Customer (how many quotes accepted?)
- Conversion rate: Customer → Repeat (how many come back?)
- Conversion rate: Repeat → PM Contract (recurring revenue!)

**Identify Bottlenecks:**
- "Only 10% of leads convert - need better quotes?"
- "80% repeat rate - excellent service quality!"
- "Low PM contract conversion - pricing too high?"

**Dashboard Widget:**
```
CONVERSION FUNNEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Prospects (150)
   ↓ 15.3% convert
Leads (23)
   ↓ 34.8% convert
Customers (8)
   ↓ 62.5% repeat
Repeat (5)
   ↓ 40% contract
PM Contracts (2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL REVENUE: $2,450
MONTHLY RECURRING: $400
```

---

### 3. `js/customer-analytics.js` (Priority 3)

**Purpose:** AI Boss insights and recommendations

**AI Boss Analysis:**
- "You have 5 leads that haven't been contacted in 7+ days - follow up!"
- "Customer 'Memphis BBQ Co' is 45 days since last visit - time for check-in"
- "3 customers have had 2+ emergency calls - offer PM contract"
- "Your prospect→lead conversion is 15% (industry avg: 20%) - improve door-knock script?"

**Metrics Dashboard:**
- Average job value: $306
- Customer lifetime value: $850
- Customer acquisition cost: 2.5 hours per customer
- Retention rate: 62%
- PM contract value: $200/month

---

## Dashboard Integration

**Add to `dashboard.html`:**

```html
<!-- In the KPI section, add: -->
<div class="kpi-card" onclick="showCustomerPipeline()">
    <div class="kpi-label">PIPELINE</div>
    <div class="kpi-value" id="pipeline-total">23</div>
    <div class="kpi-sublabel">Active Leads</div>
</div>
```

**Modal Structure:**
```html
<div id="customer-pipeline-modal" class="modal">
    <div class="modal-content">
        <h2>Customer Acquisition Pipeline</h2>

        <!-- Pipeline visualization -->
        <div class="pipeline-stages">
            <!-- Stages with counts and conversion rates -->
        </div>

        <!-- Conversion funnel -->
        <div class="conversion-metrics">
            <!-- Bottleneck analysis -->
        </div>

        <!-- AI Boss recommendations -->
        <div class="ai-recommendations">
            <!-- Action items -->
        </div>
    </div>
</div>
```

---

## Your Branch

```bash
git checkout main
git pull origin main
git checkout -b agent6-lifecycle/pipeline-dashboard
```

---

## Build Priority

**Day 1: Customer Lifecycle Pipeline**
- Count customers at each stage
- Show conversion rates
- Basic pipeline visualization

**Day 2: Conversion Funnel**
- Calculate conversion rates
- Identify bottlenecks
- Revenue tracking

**Day 3: AI Boss Integration**
- Pull AI recommendations
- Show action items
- Highlight opportunities

---

## Data You'll Use

**Firestore Collections:**
- `locations` - All prospects/leads
- `interactions` - Customer service history
- `maintenanceContracts` - PM contracts (from Agent 5)
- `workOrders` - Completed jobs (from Agent 3)
- `quotes` - Quote acceptance rate (from Agent 2)

**Cloud Function to Create:**
`functions/customer-analytics.js`
- Calculate pipeline metrics
- Run AI Boss analysis
- Return recommendations

---

## Don't Touch

- ❌ Other agents' files
- ❌ Core dashboard structure
- ❌ Existing KPI calculations

---

## When Done

```bash
git add js/customer-lifecycle.js js/conversion-funnel.js js/customer-analytics.js
git add functions/customer-analytics.js
git commit -m "Agent 6: Customer lifecycle pipeline and conversion analytics"
git push origin agent6-lifecycle/pipeline-dashboard
```

Tell Terry: "Agent 6 complete. Branch: agent6-lifecycle/pipeline-dashboard"

---

## The Big Picture

**You're building:** The strategic dashboard Terry uses to grow the business

**Shows him:**
- How many prospects he has
- How well he's converting leads
- Where the bottlenecks are
- What AI Boss recommends doing next
- Total revenue and growth trajectory

**This is the "business intelligence" layer** - helps Terry make smart decisions!

Go build! 🚀
