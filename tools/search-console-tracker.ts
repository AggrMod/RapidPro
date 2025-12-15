/**
 * RPM Search Console Rank Tracker
 * Uses official Google Search Console API for accurate ranking data
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

const DOMAIN = 'https://rapidpromemphis.com';
const KEY_FILE = path.join(__dirname, 'search-console-key.json');

// Target keywords
const TARGET_KEYWORDS = [
  'commercial kitchen equipment repair memphis',
  'commercial oven repair memphis',
  'commercial fryer repair memphis',
  'restaurant equipment repair memphis',
  'restaurant equipment preventative maintenance memphis',
  'commercial kitchen maintenance memphis tn',
  'commercial kitchen preventative maintenance plan memphis',
  'commercial dishwasher repair memphis',
  'ice machine repair memphis',
  'walk-in cooler repair memphis',
  'commercial griddle repair memphis',
  'steam table repair memphis',
  'food warmer repair memphis',
  'commercial kitchen equipment repair germantown tn',
  'restaurant equipment repair bartlett tn',
  'commercial appliance repair collierville tn',
  'emergency restaurant equipment repair memphis',
  '24 hour commercial kitchen repair memphis',
  'same day commercial oven repair memphis'
];

interface KeywordData {
  query: string;
  position: number;
  clicks: number;
  impressions: number;
  ctr: number;
}

async function getSearchConsoleData(): Promise<KeywordData[]> {
  // Check if key file exists
  if (!fs.existsSync(KEY_FILE)) {
    console.error('❌ Error: search-console-key.json not found!');
    console.error(`   Expected location: ${KEY_FILE}`);
    console.error('\n   Please follow the setup guide in SEARCH_CONSOLE_SETUP.md');
    process.exit(1);
  }

  // Authenticate
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const authClient = await auth.getClient();
  const webmasters = google.searchconsole({ version: 'v1', auth: authClient as any });

  // Get data for last 7 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);

  const request = {
    siteUrl: DOMAIN,
    requestBody: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      dimensions: ['query'],
      rowLimit: 1000,
      dimensionFilterGroups: [{
        filters: TARGET_KEYWORDS.map(keyword => ({
          dimension: 'query',
          operator: 'equals' as const,
          expression: keyword
        }))
      }]
    }
  };

  try {
    const response = await webmasters.searchanalytics.query(request);
    const rows = response.data.rows || [];

    return rows.map(row => ({
      query: row.keys![0],
      position: Math.round(row.position!),
      clicks: row.clicks!,
      impressions: row.impressions!,
      ctr: row.ctr! * 100
    }));

  } catch (error: any) {
    console.error('❌ Error fetching Search Console data:');
    console.error(error.message);

    if (error.message.includes('403')) {
      console.error('\n   This might mean:');
      console.error('   1. Service account not added to Search Console');
      console.error('   2. Wrong permissions (need Owner role)');
      console.error('   3. Wrong site URL (check if it matches exactly)');
    }

    throw error;
  }
}

async function main() {
  console.log('🔍 RPM Search Console Rank Tracker');
  console.log('Domain:', DOMAIN);
  console.log('='.repeat(70));

  console.log('\n📊 Fetching data from Google Search Console...\n');

  const data = await getSearchConsoleData();

  if (data.length === 0) {
    console.log('⚠️  No data found for tracked keywords');
    console.log('   This might mean:');
    console.log('   - Keywords are not generating impressions yet');
    console.log('   - Site is too new (needs time to accumulate data)');
    console.log('   - Keywords need to be adjusted');
    return;
  }

  // Sort by position (best first)
  data.sort((a, b) => a.position - b.position);

  console.log(`✅ Found data for ${data.length} keywords\n`);

  // Group by position ranges
  const top3 = data.filter(d => d.position <= 3);
  const top10 = data.filter(d => d.position > 3 && d.position <= 10);
  const top20 = data.filter(d => d.position > 10 && d.position <= 20);
  const beyond = data.filter(d => d.position > 20);

  // Display results
  console.log('🥇 TOP 3 POSITIONS (' + top3.length + ' keywords)');
  console.log('='.repeat(70));
  top3.forEach(d => {
    console.log(`#${d.position.toString().padStart(2)} | ${d.query}`);
    console.log(`     ${d.impressions} impressions | ${d.clicks} clicks | ${d.ctr.toFixed(1)}% CTR`);
  });

  console.log('\n📈 POSITIONS 4-10 (' + top10.length + ' keywords)');
  console.log('='.repeat(70));
  top10.forEach(d => {
    console.log(`#${d.position.toString().padStart(2)} | ${d.query}`);
    console.log(`     ${d.impressions} impressions | ${d.clicks} clicks | ${d.ctr.toFixed(1)}% CTR`);
  });

  console.log('\n📊 POSITIONS 11-20 (' + top20.length + ' keywords)');
  console.log('='.repeat(70));
  top20.forEach(d => {
    console.log(`#${d.position.toString().padStart(2)} | ${d.query}`);
    console.log(`     ${d.impressions} impressions | ${d.clicks} clicks | ${d.ctr.toFixed(1)}% CTR`);
  });

  if (beyond.length > 0) {
    console.log('\n⚠️  BEYOND POSITION 20 (' + beyond.length + ' keywords)');
    console.log('='.repeat(70));
    beyond.forEach(d => {
      console.log(`#${d.position.toString().padStart(2)} | ${d.query}`);
      console.log(`     ${d.impressions} impressions`);
    });
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total keywords with data: ${data.length}/${TARGET_KEYWORDS.length}`);
  console.log(`Top 3 positions: ${top3.length}`);
  console.log(`Page 1 (positions 1-10): ${top3.length + top10.length}`);
  console.log(`Top 20: ${top3.length + top10.length + top20.length}`);

  const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
  const totalImpressions = data.reduce((sum, d) => sum + d.impressions, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;

  console.log(`\nTotal clicks: ${totalClicks}`);
  console.log(`Total impressions: ${totalImpressions}`);
  console.log(`Average CTR: ${avgCTR.toFixed(2)}%`);

  // Save to file
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    domain: DOMAIN,
    summary: {
      totalKeywords: data.length,
      top3: top3.length,
      page1: top3.length + top10.length,
      top20: top3.length + top10.length + top20.length,
      totalClicks,
      totalImpressions,
      avgCTR
    },
    keywords: data
  };

  const reportPath = path.join(__dirname, 'search-console-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Report saved to: ${reportPath}`);
}

main().catch(console.error);
