/**
 * RPM Simple Rank Checker
 * Uses free SERP checking services via their web interfaces
 *
 * Run: npx tsx C:/Users/tjdot/RapidPro/tools/rank-checker-simple.ts
 */

import { navigate, snapshot } from '../../servers/wrappers/playwright/index.js';

const DOMAIN = 'rapidpromemphis.com';

// Priority keywords to track
const KEYWORDS = [
  // MUST WIN
  'commercial kitchen equipment repair memphis',
  'commercial oven repair memphis',
  'restaurant equipment repair memphis',

  // CURRENTLY WINNING (verify)
  'restaurant equipment preventative maintenance memphis',
  'commercial kitchen maintenance memphis',

  // GROWTH TARGETS
  'commercial fryer repair memphis',
  'commercial griddle repair memphis',
  'commercial dishwasher repair memphis',
  'steam table repair memphis',

  // LOCATION EXPANSION
  'commercial kitchen repair germantown tn',
  'restaurant equipment repair bartlett tn',
  'commercial appliance repair collierville tn',
];

interface RankCheck {
  keyword: string;
  position: number | null;
  checkedAt: string;
}

async function checkWithSerpRobot(keyword: string): Promise<number | null> {
  /**
   * SERPRobot approach - navigate to their free checker
   * URL format: https://www.serprobot.com/serp-check?q=KEYWORD&gl=us
   */

  const url = `https://www.serprobot.com/serp-check?url=${encodeURIComponent(DOMAIN)}&q=${encodeURIComponent(keyword)}&gl=us`;

  console.log(`  Checking via SERPRobot...`);

  try {
    await navigate({ url });
    await new Promise(r => setTimeout(r, 5000)); // Wait for results

    const snap = await snapshot();
    const content = JSON.stringify(snap);

    // Look for position indicators in the result
    // SERPRobot shows "Position: X" or similar
    const posMatch = content.match(/position[:\s]+(\d+)/i);
    if (posMatch) {
      return parseInt(posMatch[1], 10);
    }

    // Check if "not found" or similar
    if (content.toLowerCase().includes('not found') || content.toLowerCase().includes('not ranking')) {
      return null;
    }

    return null;
  } catch (e) {
    console.log(`  Error: ${e}`);
    return null;
  }
}

async function manualGoogleCheck(keyword: string): Promise<void> {
  /**
   * Opens Google search for manual verification
   * Best approach for accuracy without ToS issues
   */
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=20&hl=en&gl=us&pws=0`;

  console.log(`\n🔍 Keyword: "${keyword}"`);
  console.log(`   Google URL: ${searchUrl}`);
  console.log(`   Look for: ${DOMAIN}`);
}

async function runChecks(): Promise<void> {
  console.log('=' .repeat(60));
  console.log('🎯 RPM RANK CHECKER - Memphis SEO Tracking');
  console.log('=' .repeat(60));
  console.log(`Domain: ${DOMAIN}`);
  console.log(`Keywords: ${KEYWORDS.length}`);
  console.log(`Date: ${new Date().toLocaleDateString()}`);
  console.log('=' .repeat(60));

  const results: RankCheck[] = [];

  for (const keyword of KEYWORDS) {
    console.log(`\n📊 "${keyword}"`);

    // Generate Google search URL for manual check
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=20&hl=en&gl=us&pws=0`;
    console.log(`   🔗 ${googleUrl}`);

    results.push({
      keyword,
      position: null, // Will be filled in manually or via API
      checkedAt: new Date().toISOString()
    });
  }

  // Output as markdown table for easy tracking
  console.log('\n' + '=' .repeat(60));
  console.log('📋 TRACKING TEMPLATE (Copy to keyword-database.md)');
  console.log('=' .repeat(60));
  console.log('\n| Keyword | Position | Date |');
  console.log('|---------|----------|------|');

  for (const r of results) {
    console.log(`| ${r.keyword} | ___ | ${new Date().toLocaleDateString()} |`);
  }

  console.log('\n');
  console.log('💡 TIP: Use Google Search Console for accurate daily tracking');
  console.log('   https://search.google.com/search-console');
}

// Run
runChecks();
