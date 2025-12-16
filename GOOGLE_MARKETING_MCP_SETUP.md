# Google Marketing MCP Setup Guide

This MCP server provides unified access to:
- Google Analytics 4 (GA4)
- Google Search Console
- Google AdSense

**Status:** Installed but needs OAuth credentials to work.

---

## Why This MCP?

Instead of using the existing `search-console-all.ts` script, this MCP provides:
1. **Unified interface** for GA4 + Search Console + AdSense
2. **Automatic token refresh** (no manual OAuth every time)
3. **MCP wrapper integration** (fits your existing architecture)
4. **Better error handling** and rate limiting

---

## Step 1: Google Cloud Console Setup

### 1.1 Go to Google Cloud Console
https://console.cloud.google.com

### 1.2 Create or Select Project
- If you have an existing project (e.g., `gen-lang-client-0142728869`), select it
- OR create a new project: "RapidPro Analytics"

### 1.3 Enable Required APIs
Click "APIs & Services" → "Enable APIs and Services" and enable:

1. **Google Analytics Admin API**
   - https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com

2. **Google Analytics Data API**
   - https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com

3. **Google Search Console API**
   - https://console.cloud.google.com/apis/library/searchconsole.googleapis.com

4. **AdSense Management API** (optional if you use AdSense)
   - https://console.cloud.google.com/apis/library/adsense.googleapis.com

---

## Step 2: Create OAuth 2.0 Credentials

### 2.1 Go to Credentials
- https://console.cloud.google.com/apis/credentials

### 2.2 Configure OAuth Consent Screen (if not done yet)
1. Click "OAuth consent screen"
2. Select **External** (unless you have Google Workspace)
3. Fill required fields:
   - App name: `RapidPro MCP`
   - User support email: Your email
   - Developer contact: Your email
4. Click "Save and Continue"

### 2.3 Add Scopes
Click "Add or Remove Scopes" and add:
- `https://www.googleapis.com/auth/analytics.edit`
- `https://www.googleapis.com/auth/analytics.readonly`
- `https://www.googleapis.com/auth/webmasters`
- `https://www.googleapis.com/auth/adsense.readonly`

Click "Save and Continue"

### 2.4 Add Test Users
Add your Google account email as a test user (required for External apps)

Click "Save and Continue"

### 2.5 Create OAuth Credentials
1. Go back to "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Desktop app**
4. Name: `MCP Google Marketing`
5. Click "Create"

### 2.6 Download Credentials
You'll see a popup with:
- **Client ID:** `123456789-abc123.apps.googleusercontent.com`
- **Client Secret:** `GOCSPX-abc123xyz...`

**SAVE THESE!** You'll need them in the next step.

---

## Step 3: Set Environment Variables

### 3.1 Create .env file (Windows)
```bash
cd C:/Users/tjdot/servers
```

Create or edit `.env` file and add:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Replace with your actual values from Step 2.6!**

### 3.2 Verify .env file
```bash
cat .env
```

You should see your credentials (NOT the placeholder text).

---

## Step 4: Authenticate the MCP

### 4.1 Run authentication command
```bash
cd C:/Users/tjdot/servers
npx mcp-google-marketing auth
```

This will:
1. Open your browser
2. Ask you to sign in with Google
3. Request permission to access Analytics, Search Console, etc.
4. Save tokens to `.credentials/tokens.json`

### 4.2 Grant permissions
In the browser:
1. Select your Google account
2. Click "Continue" (ignore "This app isn't verified" warning - it's your own app!)
3. Click "Allow" for all requested permissions
4. You should see "Authentication successful!"

### 4.3 Verify authentication
```bash
npx mcp-google-marketing auth --status
```

Should show: "Authenticated as: your-email@gmail.com"

---

## Step 5: Update mcp-servers.json

The MCP is already added to your config, but needs environment variables:

```json
{
  "google-marketing": {
    "command": "npx",
    "args": ["-y", "mcp-google-marketing"],
    "description": "Google Analytics 4, Search Console, AdSense",
    "env": {
      "GOOGLE_CLIENT_ID": "${GOOGLE_CLIENT_ID}",
      "GOOGLE_CLIENT_SECRET": "${GOOGLE_CLIENT_SECRET}"
    }
  }
}
```

**This step is already done** - the MCP router will read from your .env file.

---

## Step 6: Test the MCP

Run the test script:
```bash
cd C:/Users/tjdot/servers
npx tsx test-google-marketing-mcp.ts
```

You should see:
- List of available tools
- Search Console data for rapidpromemphis.com
- GA4 data for your property

---

## Available Tools

Once authenticated, you'll have access to:

### Search Console Tools:
- `search_console_query` - Get search performance data
- `search_console_sites` - List verified sites
- `search_console_sitemaps` - Check sitemap status

### Google Analytics 4 Tools:
- `ga4_run_report` - Get custom reports
- `ga4_list_properties` - List GA4 properties
- `ga4_get_metadata` - Get available dimensions/metrics

### AdSense Tools (if enabled):
- `adsense_get_account` - Get account info
- `adsense_run_report` - Get earnings reports

---

## Troubleshooting

### Error: "Connection closed"
- Make sure you ran `npx mcp-google-marketing auth` first
- Check that .env file exists with correct credentials

### Error: "Access denied"
- You didn't click "Allow" in the OAuth consent screen
- Re-run `npx mcp-google-marketing auth`

### Error: "API not enabled"
- Go back to Step 1.3 and enable all required APIs

### Error: "This app isn't verified"
- Click "Advanced" → "Go to [App Name] (unsafe)"
- This is normal for personal OAuth apps

---

## Using with Your Existing Scripts

Once authenticated, you can replace this:
```typescript
// OLD: C:/Users/tjdot/RapidPro/tools/search-console-all.ts
const { google } = require('googleapis');
// Manual OAuth setup every time...
```

With this:
```typescript
// NEW: Use MCP wrapper
import { callMCPTool } from './src/client.js';

const data = await callMCPTool('mcp__google-marketing__search_console_query', {
  siteUrl: 'https://rapidpromemphis.com',
  startDate: '2024-11-16',
  endDate: '2024-12-16',
  dimensions: ['query'],
  rowLimit: 50
});
```

**Benefits:**
- No manual authentication each time
- Automatic token refresh
- Consistent with your other MCP wrappers
- Better error handling

---

## Next Steps

1. **Complete Steps 1-4** to authenticate
2. **Run test script** to verify it works
3. **Create MCP wrapper** at `C:/Users/tjdot/servers/wrappers/google-marketing/`
4. **Replace old scripts** with MCP-based versions

---

## Credentials Security

**Your credentials are stored:**
- OAuth secrets: `C:/Users/tjdot/servers/.env` (gitignored)
- Access tokens: `C:/Users/tjdot/servers/.credentials/tokens.json` (auto-refreshed)

**NEVER commit these files to git!**

Add to `.gitignore`:
```
.env
.credentials/
```

---

## Cost

This MCP uses Google Cloud APIs. For typical usage:
- **Analytics API:** Free (1 million requests/day)
- **Search Console API:** Free (unlimited)
- **AdSense API:** Free (unlimited)

You won't hit limits for RapidPro's traffic volume.

---

**Ready to set up?** Start with Step 1!
