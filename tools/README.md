# RPM Rank Tracking Tools

## Google Search Console API Tracker (Recommended)

**Why use this?**
- ✅ Official Google API (no CAPTCHA)
- ✅ 100% accurate positions
- ✅ Real click/impression data
- ✅ Historical trends
- ✅ Free forever

### Quick Setup (5 minutes)

1. **Follow the setup guide**: Open `SEARCH_CONSOLE_SETUP.md`

2. **Run the tracker**:
```bash
cd C:/Users/tjdot/RapidPro/tools
npx tsx search-console-tracker.ts
```

### What You'll See

```
🔍 RPM Search Console Rank Tracker
Domain: https://rapidpromemphis.com
======================================================================

🥇 TOP 3 POSITIONS (4 keywords)
======================================================================
#1 | rapidpromemphis.com
    523 impressions | 45 clicks | 8.6% CTR
#1 | restaurant equipment preventative maintenance memphis
    189 impressions | 12 clicks | 6.3% CTR
...

📊 SUMMARY
======================================================================
Total keywords with data: 15/19
Top 3 positions: 4
Page 1 (positions 1-10): 11
Total clicks: 234
Total impressions: 4,521
Average CTR: 5.17%
```

### Automated Daily Tracking

Set up a daily cron job or Windows Task Scheduler:

**Windows Task Scheduler**:
1. Open Task Scheduler
2. Create Basic Task
3. Name: "RPM Rank Check"
4. Trigger: Daily at 9:00 AM
5. Action: Start a program
6. Program: `npx`
7. Arguments: `tsx C:/Users/tjdot/RapidPro/tools/search-console-tracker.ts`
8. Start in: `C:/Users/tjdot/RapidPro/tools`

---

## Legacy Web Scraper (Not Recommended)

The old `rank-tracker.ts` uses web scraping which:
- ❌ Triggers Google CAPTCHA
- ❌ Gets blocked frequently
- ❌ Only estimates positions
- ❌ No click/impression data

**Use Search Console API instead!**
