# RPM Rank Tracking Setup Guide

## Best FREE Options for Memphis SEO Tracking

---

## Option 1: Google Search Console (RECOMMENDED - FREE)

**Why it's best:** Direct data from Google, 100% accurate, free forever

### Setup Steps:
1. Go to https://search.google.com/search-console
2. Add property: `https://rapidpromemphis.com`
3. Verify ownership (add HTML tag or DNS record)
4. Wait 24-48 hours for data to populate

### What you get:
- Every keyword you rank for (even ones you didn't know!)
- Average position over time
- Click-through rates
- Impressions
- Which pages rank for which keywords

### How to track our target keywords:
1. Go to Performance > Search Results
2. Filter by Query containing: "commercial kitchen"
3. See exact position for each query
4. Export to Google Sheets monthly

---

## Option 2: Google Sheets + ImportXML (FREE)

Create a tracking spreadsheet that checks rankings manually.

### Google Sheet Template:

```
| Date | Keyword | Check URL | Position | Notes |
|------|---------|-----------|----------|-------|
| 12/9 | commercial kitchen equipment repair memphis | [link] | ? | Check manually |
```

### Check URLs (Click to search):

**Core Keywords:**
- [commercial kitchen equipment repair memphis](https://www.google.com/search?q=commercial+kitchen+equipment+repair+memphis&num=20&pws=0)
- [commercial oven repair memphis](https://www.google.com/search?q=commercial+oven+repair+memphis&num=20&pws=0)
- [commercial fryer repair memphis](https://www.google.com/search?q=commercial+fryer+repair+memphis&num=20&pws=0)
- [restaurant equipment repair memphis](https://www.google.com/search?q=restaurant+equipment+repair+memphis&num=20&pws=0)

**Maintenance Keywords (RPM Strength):**
- [restaurant equipment preventative maintenance memphis](https://www.google.com/search?q=restaurant+equipment+preventative+maintenance+memphis&num=20&pws=0)
- [commercial kitchen maintenance memphis](https://www.google.com/search?q=commercial+kitchen+maintenance+memphis&num=20&pws=0)
- [commercial kitchen preventative maintenance plan memphis](https://www.google.com/search?q=commercial+kitchen+preventative+maintenance+plan+memphis&num=20&pws=0)

**Equipment Keywords:**
- [commercial griddle repair memphis](https://www.google.com/search?q=commercial+griddle+repair+memphis&num=20&pws=0)
- [steam table repair memphis](https://www.google.com/search?q=steam+table+repair+memphis&num=20&pws=0)
- [commercial dishwasher repair memphis](https://www.google.com/search?q=commercial+dishwasher+repair+memphis&num=20&pws=0)
- [food warmer repair memphis](https://www.google.com/search?q=food+warmer+repair+memphis&num=20&pws=0)

**Location Keywords:**
- [commercial kitchen repair germantown tn](https://www.google.com/search?q=commercial+kitchen+repair+germantown+tn&num=20&pws=0)
- [restaurant equipment repair bartlett tn](https://www.google.com/search?q=restaurant+equipment+repair+bartlett+tn&num=20&pws=0)
- [commercial appliance repair collierville tn](https://www.google.com/search?q=commercial+appliance+repair+collierville+tn&num=20&pws=0)

---

## Option 3: Free Online Checkers (Quick Spot Checks)

### SERPRobot (Best Free)
https://www.serprobot.com/serp-check

1. Enter: `rapidpromemphis.com`
2. Enter keyword
3. Select: United States
4. Click Check
5. See position instantly

### Seobility (Alternative)
https://www.seobility.net/en/rankingcheck/

### SmallSEOTools
https://smallseotools.com/keyword-position/

---

## Option 4: Build Custom Tracker (ADVANCED)

Using our Playwright MCP wrapper, we can automate checks:

```bash
cd C:/Users/tjdot/RapidPro/tools
npx tsx rank-checker-simple.ts
```

This generates search URLs and a tracking template.

---

## Weekly Tracking Routine

### Every Monday Morning:
1. Open Google Search Console
2. Check Performance > Queries
3. Filter last 7 days
4. Note position changes for target keywords
5. Update tracking spreadsheet

### Monthly:
1. Export GSC data to Sheets
2. Compare month-over-month
3. Identify winning/losing keywords
4. Adjust content strategy

---

## FAQ Keywords to Track (Add These!)

Based on our research, these question-based keywords are gold:

- "how much does commercial oven repair cost memphis"
- "how often should commercial kitchen equipment be serviced"
- "commercial oven not heating memphis"
- "why is my commercial oven not heating evenly"
- "what is preventative maintenance for commercial kitchen"

Track these separately - they indicate high-intent searches.

---

## Current Rankings - December 9, 2025 (VERIFIED via SERPRobot)

| Keyword | Position | Status | Action |
|---------|----------|--------|--------|
| restaurant equipment preventative maintenance memphis | **#1** | 🥇 WINNING | Maintain - this is our strength! |
| commercial oven repair memphis | >100 | ❌ NOT RANKING | Page created, needs backlinks/time |
| commercial kitchen equipment repair memphis | TBD | 🔶 CHECK | Core keyword - verify manually |
| commercial fryer repair memphis | TBD | ❌ NO PAGE | Create dedicated page |
| commercial griddle repair memphis | TBD | ❌ NO PAGE | Create dedicated page |
| steam table repair memphis | TBD | ❌ NO PAGE | Create dedicated page |
| commercial dishwasher repair memphis | TBD | ❌ NO PAGE | Create dedicated page |

### Key Insight
**RPM dominates "maintenance" keywords but needs dedicated equipment repair pages!**

The oven repair page was just created - it takes 2-4 weeks for Google to index and rank new pages.

### Equipment Pages Needed (Priority Order)
1. ✅ `memphis-commercial-oven-repair.html` - DONE (with FAQ schema)
2. ⏳ `memphis-commercial-fryer-repair.html` - CREATE NEXT
3. ⏳ `memphis-commercial-griddle-repair.html`
4. ⏳ `memphis-steam-table-repair.html`
5. ⏳ `memphis-commercial-dishwasher-repair.html`

---

## Next Steps

1. **Today:** Set up Google Search Console if not already
2. **This Week:** Do baseline check for all keywords
3. **Create Pages:** Equipment-specific pages to rank for gaps
4. **Add FAQ Schema:** To existing pages for featured snippets
5. **Track Weekly:** Monday morning rank check routine

---

*"What gets measured gets managed"*
