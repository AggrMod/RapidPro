# 📋 RapidPro Customer Acquisition Roadmap

**Business Model:** Commercial Appliance Repair (Restaurants, Commercial Kitchens)
**NOT advertising:** HVAC services (requires special licensing)
**Strategy:** Build relationships through appliance repair, expand services organically

---

## 🎯 PHASE 1: Foundation (Zero to First Customers)

### Task 1: Update Marketing Materials - Remove HVAC References
**Priority:** CRITICAL - Legal Compliance
**Files to modify:**
- `index.html` - Main marketing page
- `memphis-services.html` - Services page
- Any other marketing pages

**Action Items:**
- [ ] Remove all "HVAC" language
- [ ] Focus messaging on: Commercial Appliance Repair
- [ ] Emphasize: Walk-in coolers, freezers, ice machines, kitchen equipment
- [ ] Update taglines to appliance-specific language
- [ ] Check all meta descriptions and titles

**Example Changes:**
- ❌ "HVAC and Refrigeration Services"
- ✅ "Commercial Refrigeration & Appliance Repair"

---

### Task 2: Create Initial Target List (Firestore Seed Data)
**Priority:** CRITICAL
**Files:**
- Create: `scripts/seed-target-locations.js`
- Firestore collection: `locations`

**Action Items:**
- [ ] Identify 50-100 local restaurants with walk-in coolers
- [ ] Add to Firestore with status: "pending"
- [ ] Include: Name, address, phone, equipment type (estimated)
- [ ] Set priority levels based on: size, chain vs independent
- [ ] Add notes field for initial research

**Data Structure:**
```javascript
{
  name: "Memphis BBQ Company",
  address: "123 Beale St, Memphis, TN 38103",
  phone: "(901) 555-0123",
  equipmentNotes: "Walk-in cooler (estimated), commercial refrigeration",
  status: "pending",
  priority: "medium",
  targetType: "restaurant",
  lastAttempt: null,
  interactions: []
}
```

---

### Task 3: Build Door-Knocking Script Generator
**Priority:** HIGH
**Files:**
- Modify: `functions/ai-boss.js`
- Create: Cloud Function `generateDoorKnockScript`

**Action Items:**
- [ ] AI-generated personalized intro scripts
- [ ] Input: Business name, type, equipment
- [ ] Output: 30-second elevator pitch
- [ ] Include: Problem identification, value prop, call-to-action
- [ ] Store in dashboard for field tech to review before visit

**Example Output:**
> "Hi, I'm Terry with RapidPro. We specialize in keeping commercial refrigeration running 24/7 - walk-in coolers, freezers, ice machines. I'm in the neighborhood today doing preventive maintenance for a few restaurants. Would you have 2 minutes to discuss your refrigeration setup? I can do a quick visual inspection while I'm here - no charge."

---

### Task 4: First Contact Tracking System
**Priority:** HIGH
**Files:**
- Create: `js/first-contact.js`
- Modify: `dashboard.html`
- Cloud Function: `logFirstContact`

**Action Items:**
- [ ] Quick-log door knock attempts
- [ ] Outcomes: No answer, Not interested, Interested, Scheduled visit
- [ ] Voice notes capability (mobile)
- [ ] Photo of location/equipment (if allowed)
- [ ] GPS timestamp
- [ ] AI Boss analyzes rejection reasons

**Dashboard View:**
- [ ] List view: Today's target list
- [ ] Map view: Route optimization
- [ ] Status badges: Not attempted / No answer / Interested / Rejected
- [ ] Follow-up reminders

---

### Task 5: "Interested" Lead Conversion Flow
**Priority:** CRITICAL
**Files:**
- Create: `js/lead-conversion.js`
- Cloud Function: `convertLeadToCustomer`

**Action Items:**
- [ ] When customer says "interested" → Capture details
- [ ] Equipment survey form (on tablet/phone)
- [ ] Make/model/age of equipment
- [ ] Current service provider (if any)
- [ ] Pain points (frequent breakdowns, high bills, etc.)
- [ ] Best contact method
- [ ] Schedule initial assessment
- [ ] Auto-generate follow-up tasks

---

## 🎯 PHASE 2: First Customer Experience (1-10 Customers)

### Task 6: Initial Assessment Workflow
**Priority:** CRITICAL
**Files:**
- Create: `js/assessment-form.js`
- Modify: `dashboard.html`

**Action Items:**
- [ ] Structured assessment checklist
- [ ] Photo documentation required
- [ ] Equipment tag/serial number capture
- [ ] Identify immediate issues
- [ ] Identify preventive maintenance opportunities
- [ ] Generate quote on-site (simple items)
- [ ] Schedule follow-up for complex items

---

### Task 7: Quote Generation System
**Priority:** HIGH
**Files:**
- Create: `js/quote-generator.js`
- Cloud Function: `generateQuote`

**Action Items:**
- [ ] Template-based quotes
- [ ] Common repairs pre-priced
- [ ] Labor rates configurable
- [ ] Parts markup configurable
- [ ] PDF generation
- [ ] Email/text quote to customer
- [ ] Track quote status: Sent / Viewed / Accepted / Rejected

---

### Task 8: Work Order System
**Priority:** CRITICAL
**Files:**
- Create: `js/work-orders.js`
- Firestore collection: `workOrders`

**Action Items:**
- [ ] Convert accepted quote → work order
- [ ] Assign to technician (you)
- [ ] Schedule appointment
- [ ] Parts ordering workflow
- [ ] Pre-work checklist
- [ ] Safety notes
- [ ] Access instructions

---

### Task 9: Job Completion & Invoice
**Priority:** CRITICAL
**Files:**
- Create: `js/invoice-generator.js`
- Cloud Function: `generateInvoice`

**Action Items:**
- [ ] Mark work order complete
- [ ] Photo documentation (before/after)
- [ ] Parts used tracking
- [ ] Time tracking
- [ ] Generate invoice
- [ ] Payment collection (cash/check initially)
- [ ] Email receipt
- [ ] Request review/testimonial

---

### Task 10: Customer Satisfaction & Follow-up
**Priority:** HIGH
**Files:**
- Modify: `functions/ai-boss.js`
- Create: `js/customer-feedback.js`

**Action Items:**
- [ ] Post-job satisfaction survey
- [ ] 1-week follow-up: "Is everything still working?"
- [ ] 30-day follow-up: "Time for preventive maintenance?"
- [ ] AI Boss: Analyze feedback, suggest improvements
- [ ] Track Net Promoter Score
- [ ] Identify upsell opportunities

---

## 🎯 PHASE 3: Growth Engine (10-50 Customers)

### Task 11: Preventive Maintenance Program
**Priority:** HIGH
**Files:**
- Create: `js/pm-program.js`
- Firestore collection: `maintenanceContracts`

**Action Items:**
- [ ] Monthly/quarterly PM plans
- [ ] Recurring service scheduling
- [ ] Auto-billing
- [ ] Reminder emails/texts
- [ ] Track completion rate
- [ ] Discount for contract customers

**Value Prop:**
- Prevent breakdowns before they happen
- Priority emergency service
- Discounted parts
- Extended equipment life

---

### Task 12: Referral & Word-of-Mouth System
**Priority:** MEDIUM
**Files:**
- Create: `js/referral-program.js`

**Action Items:**
- [ ] "Refer a restaurant, get $50 credit"
- [ ] Track referral source
- [ ] Auto-apply credit when referral converts
- [ ] Thank you email to referrer
- [ ] Leaderboard of top referrers

---

### Task 13: Emergency Service Premium
**Priority:** MEDIUM
**Files:**
- Create: `js/emergency-dispatch.js`

**Action Items:**
- [ ] 24/7 emergency hotline (phone number)
- [ ] Premium pricing for after-hours
- [ ] Rapid response SLA (2 hours?)
- [ ] Track emergency response time
- [ ] Convert emergency calls to PM contracts

---

### Task 14: Customer Lifecycle Dashboard
**Priority:** MEDIUM
**Files:**
- Create: `js/customer-lifecycle.js`
- Modify: `dashboard.html`

**Action Items:**
- [ ] Visual pipeline: Prospect → Lead → Customer → Contract
- [ ] Track conversion rates at each stage
- [ ] Identify bottlenecks
- [ ] AI Boss: Recommend actions to move customers through pipeline
- [ ] Revenue tracking by customer
- [ ] Lifetime value calculation

---

### Task 15: Equipment History Database
**Priority:** MEDIUM
**Files:**
- Create: `js/equipment-history.js`
- Firestore collection: `equipmentRecords`

**Action Items:**
- [ ] Track every piece of equipment worked on
- [ ] Make/model/serial/age
- [ ] Service history
- [ ] Parts replaced
- [ ] Predict when equipment needs replacement
- [ ] Proactive outreach: "Your 15-year-old walk-in is due for replacement"

---

## 🎯 PHASE 4: Scaling (50-200 Customers)

### Task 16: Multi-Technician Dispatching
**Priority:** LOW (future)
**Files:**
- Create: `js/dispatch-system.js`

**Action Items:**
- [ ] When you hire help, assign jobs to specific techs
- [ ] Route optimization
- [ ] Load balancing
- [ ] Performance tracking per tech
- [ ] Customer ratings per tech

---

### Task 17: Inventory Management
**Priority:** LOW (future)
**Files:**
- Create: `js/inventory.js`
- Firestore collection: `inventory`

**Action Items:**
- [ ] Track parts on truck
- [ ] Track parts in warehouse
- [ ] Auto-reorder when low
- [ ] Parts usage analytics
- [ ] Most common failures → stock more

---

### Task 18: Customer Portal
**Priority:** LOW (future)
**Files:**
- Create: `customer-portal.html`

**Action Items:**
- [ ] Customers can view service history
- [ ] Request service online
- [ ] View invoices
- [ ] Pay online
- [ ] Schedule PM appointments

---

## 📊 METRICS TO TRACK (AI Boss Analytics)

### Acquisition Metrics:
- [ ] Door knocks per day
- [ ] Conversion rate: Door knock → Interested lead
- [ ] Conversion rate: Lead → First customer
- [ ] Cost per acquisition (your time)

### Customer Metrics:
- [ ] Number of active customers
- [ ] Average job value
- [ ] Repeat customer rate
- [ ] Customer lifetime value
- [ ] PM contract conversion rate

### Operational Metrics:
- [ ] Jobs completed per week
- [ ] Average response time
- [ ] First-time fix rate
- [ ] Customer satisfaction score
- [ ] Revenue per hour worked

### Growth Metrics:
- [ ] Month-over-month revenue growth
- [ ] Referral rate
- [ ] Customer churn rate
- [ ] Emergency call volume
- [ ] PM contract renewals

---

## 🎯 IMMEDIATE PRIORITY ORDER

**Week 1:**
1. Task 1: Remove HVAC references (legal compliance)
2. Task 2: Create initial target list (50 restaurants)
3. Task 3: Door-knocking script generator

**Week 2:**
4. Task 4: First contact tracking
5. Task 5: Lead conversion flow
6. Task 6: Initial assessment workflow

**Week 3:**
7. Task 7: Quote generation
8. Task 8: Work order system
9. Task 9: Invoice generation

**Week 4:**
10. Task 10: Customer satisfaction & follow-up
11. Task 11: PM program launch
12. Task 14: Customer lifecycle dashboard

---

## 🚀 ZERO TO REVENUE PATH

**Day 1-7:** Get legally compliant, build target list, generate scripts
**Day 8-30:** Door knock, log attempts, convert first leads
**Day 31-60:** Complete first jobs, generate invoices, collect payment
**Day 61-90:** Launch PM program, get referrals, scale operations
**Day 91-180:** Systematize, track metrics, optimize conversion funnel
**Day 181+:** Hire help, expand territory, build real business

---

**Last Updated:** November 15, 2025
**By:** LOCAL Claude
**For:** Terry (Field Technician → Business Owner)
**Goal:** Zero customers → Significant customer base (appliance repair only)
