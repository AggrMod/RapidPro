# Google Search Console API Setup Guide

## Step 1: Enable the API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (or create a new one)
3. Navigate to **APIs & Services** > **Enable APIs and Services**
4. Search for "Google Search Console API"
5. Click **Enable**

## Step 2: Create Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Name it: `search-console-reader`
4. Grant role: **Viewer** (or no role needed)
5. Click **Done**

## Step 3: Download Credentials

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** > **Create New Key**
4. Choose **JSON** format
5. Save the file as: `C:\Users\tjdot\RapidPro\tools\search-console-key.json`

## Step 4: Grant Access in Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property: `rapidpromemphis.com`
3. Click **Settings** (gear icon)
4. Click **Users and permissions**
5. Click **Add user**
6. Enter the service account email (looks like: `search-console-reader@PROJECT-ID.iam.gserviceaccount.com`)
7. Grant permission: **Owner** (needed for API access)
8. Click **Add**

## Step 5: Verify Setup

Run the test script:
```bash
cd C:/Users/tjdot/RapidPro/tools
npx tsx search-console-tracker.ts
```

## What You'll Get

- **Exact keyword positions** (not estimates)
- **Click-through rates**
- **Impressions & clicks**
- **Historical data** (up to 16 months)
- **No CAPTCHA** (official API)
- **100% accurate** (Google's own data)

## Rate Limits

- 1,200 queries per minute
- Plenty for tracking 20-50 keywords
