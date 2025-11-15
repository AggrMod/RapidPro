# 🎯 SIMPLE AGENT ASSIGNMENTS - Stay In Your Lane

**Rule:** One agent = One module = One set of files = Zero conflicts

---

## 🚀 AGENT 1: Lead Tracking Module
**Branch:** `agent1-leads/`
**Files You Own:**
- `js/lead-tracker.js` (you create this)
- `js/door-knock-logger.js` (you create this)
- `functions/leads.js` (you create this)

**Your Job:**
1. Track door-knock attempts
2. Log contact outcomes (No answer / Interested / Not interested)
3. GPS & timestamp each attempt
4. Route optimization view
5. Daily target list

**Don't Touch:** Anything else! Just YOUR files!

**Briefing Doc:** `/docs/internal/AGENT_1_LEADS.md`

---

## 🚀 AGENT 2: Quote & Sales Module
**Branch:** `agent2-quotes/`
**Files You Own:**
- `js/quote-generator.js` (you create this)
- `js/pricing-calculator.js` (you create this)
- `functions/quotes.js` (you create this)

**Your Job:**
1. Build quote generation system
2. Pricing templates (labor + parts)
3. PDF quote generation
4. Email/text quotes to customers
5. Track quote status (Sent / Accepted / Rejected)

**Don't Touch:** Anything else! Just YOUR files!

**Briefing Doc:** `/docs/internal/AGENT_2_QUOTES.md`

---

## 🚀 AGENT 3: Work Orders Module
**Branch:** `agent3-workorders/`
**Files You Own:**
- `js/work-orders.js` (you create this)
- `js/job-scheduler.js` (you create this)
- `functions/workorders.js` (you create this)

**Your Job:**
1. Convert accepted quotes → work orders
2. Schedule appointments
3. Parts ordering workflow
4. Pre-work checklists
5. Job assignment system

**Don't Touch:** Anything else! Just YOUR files!

**Briefing Doc:** `/docs/internal/AGENT_3_WORKORDERS.md`

---

## 🚀 AGENT 4: Invoicing Module
**Branch:** `agent4-invoicing/`
**Files You Own:**
- `js/invoice-generator.js` (you create this)
- `js/payment-tracker.js` (you create this)
- `functions/invoicing.js` (you create this)

**Your Job:**
1. Generate invoices from completed work orders
2. Track payments (cash/check)
3. Receipt generation
4. Revenue reporting
5. Outstanding balance tracking

**Don't Touch:** Anything else! Just YOUR files!

**Briefing Doc:** `/docs/internal/AGENT_4_INVOICING.md`

---

## 🚀 AGENT 5: Preventive Maintenance Module
**Branch:** `agent5-pm/`
**Files You Own:**
- `js/pm-contracts.js` (you create this)
- `js/recurring-scheduler.js` (you create this)
- `functions/pm.js` (you create this)

**Your Job:**
1. PM contract creation & management
2. Recurring service scheduling
3. Auto-reminders for PM visits
4. Contract renewal system
5. PM pricing calculator

**Don't Touch:** Anything else! Just YOUR files!

**Briefing Doc:** `/docs/internal/AGENT_5_PM.md`

---

## 🚀 AGENT 6: Customer Lifecycle Module
**Branch:** `agent6-lifecycle/`
**Files You Own:**
- `js/customer-lifecycle.js` (you create this)
- `js/conversion-funnel.js` (you create this)
- `functions/analytics.js` (you create this)

**Your Job:**
1. Pipeline dashboard (Prospect → Lead → Customer → Contract)
2. Conversion rate tracking
3. Revenue per customer
4. Lifetime value calculation
5. AI Boss recommendations for moving customers through pipeline

**Don't Touch:** Anything else! Just YOUR files!

**Briefing Doc:** `/docs/internal/AGENT_6_LIFECYCLE.md`

---

## 📋 THE SIMPLE RULE

**Each agent:**
- Creates NEW files only (no editing shared files)
- Works in their own module
- Uses their own Cloud Functions
- Pushes to their own branch

**Result:**
- Zero merge conflicts (different files!)
- Parallel work (all at same time!)
- Easy to fix (just talk to the agent who owns that module!)

---

## 🔄 When You Need Changes Later

**Example:** Need to change how quotes work?

**Just call back Agent 2:**
- "Hey Agent 2, read `/docs/internal/AGENT_2_QUOTES.md`"
- "We need to add tax calculation to quotes"
- Agent 2 already knows the quote module (they built it!)
- Agent 2 makes the change
- Boom, done!

**No context switching!** Each agent is the expert in their module!

---

## 🚀 Launch Strategy

**Tomorrow you can:**
1. Open 6 browser tabs (claude.ai)
2. Tab 1: "Read `/docs/internal/AGENT_1_LEADS.md` and start working"
3. Tab 2: "Read `/docs/internal/AGENT_2_QUOTES.md` and start working"
4. Tab 3: "Read `/docs/internal/AGENT_3_WORKORDERS.md` and start working"
5. Tabs 4-6: Same pattern

**All 6 working simultaneously!**

**End of day:**
- Tell me which agents are done
- I merge their branches (no conflicts, different files!)
- Deploy everything at once
- You just shipped 6 features in one day!

---

**Ready for me to create the 6 individual briefing docs?**

Each one will be dead simple:
- Your module name
- Your files (create these)
- Your tasks (5-10 specific things)
- Don't touch anything else!

Say the word and I'll build them!
