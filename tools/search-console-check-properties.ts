/**
 * List all Search Console properties to find the right one
 */

import { google } from 'googleapis';
import * as path from 'path';

const KEY_FILE = path.join(__dirname, 'search-console-key.json');

async function listProperties() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const authClient = await auth.getClient();
  const webmasters = google.searchconsole({ version: 'v1', auth: authClient as any });

  console.log('🔍 Listing all Search Console properties...\n');

  try {
    const response = await webmasters.sites.list({});
    const sites = response.data.siteEntry || [];

    if (sites.length === 0) {
      console.log('❌ No properties found!');
      console.log('   Make sure the service account has been added as Owner in Search Console.');
      return;
    }

    console.log(`✅ Found ${sites.length} properties:\n`);

    for (const site of sites) {
      console.log(`Property: ${site.siteUrl}`);
      console.log(`Permission: ${site.permissionLevel}`);
      console.log('-'.repeat(70));

      // Try to get data for this property
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 28); // 28 days

      try {
        const dataResponse = await webmasters.searchanalytics.query({
          siteUrl: site.siteUrl,
          requestBody: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            dimensions: ['query'],
            rowLimit: 10
          }
        });

        const rows = dataResponse.data.rows || [];
        console.log(`  📊 Data available: ${rows.length} queries (last 28 days)`);

        if (rows.length > 0) {
          console.log(`  Top query: "${rows[0].keys![0]}" - Position #${Math.round(rows[0].position!)}`);
        }
      } catch (error: any) {
        console.log(`  ⚠️  Cannot fetch data: ${error.message}`);
      }

      console.log('');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

listProperties().catch(console.error);
