/**
 * Get ALL Search Console data (no filters)
 */

import { google } from 'googleapis';
import * as path from 'path';

const DOMAIN = 'https://rapidpromemphis.com';
const KEY_FILE = path.join(__dirname, 'search-console-key.json');

async function getAllData() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const authClient = await auth.getClient();
  const webmasters = google.searchconsole({ version: 'v1', auth: authClient as any });

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);

  const request = {
    siteUrl: DOMAIN,
    requestBody: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      dimensions: ['query'],
      rowLimit: 50
    }
  };

  const response = await webmasters.searchanalytics.query(request);
  const rows = response.data.rows || [];

  console.log('🔍 Top 50 Queries from Search Console');
  console.log('Domain:', DOMAIN);
  console.log('Date Range:', startDate.toISOString().split('T')[0], 'to', endDate.toISOString().split('T')[0]);
  console.log('='.repeat(70));
  console.log(`Total queries found: ${rows.length}\n`);

  rows.forEach((row, i) => {
    const pos = Math.round(row.position!);
    const query = row.keys![0];
    const clicks = row.clicks!;
    const impressions = row.impressions!;
    const ctr = (row.ctr! * 100).toFixed(1);

    console.log(`${(i + 1).toString().padStart(2)}. [#${pos.toString().padStart(2)}] ${query}`);
    console.log(`    ${impressions} impressions | ${clicks} clicks | ${ctr}% CTR`);
  });
}

getAllData().catch(console.error);
