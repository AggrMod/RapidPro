/**
 * RPM SERP Rank Checker - Fetch Based
 * Uses free SERP checking service
 *
 * Run: cd C:/Users/tjdot/RapidPro/tools && npx tsx serp-checker.ts
 */

import * as fs from 'fs';

const DOMAIN = 'rapidpromemphis.com';

const KEYWORDS = [
  // Core - MUST WIN
  'commercial kitchen equipment repair memphis',
  'commercial oven repair memphis',
  'restaurant equipment repair memphis',

  // Maintenance - RPM Strength
  'restaurant equipment preventative maintenance memphis',
  'commercial kitchen maintenance memphis',

  // Equipment specific
  'commercial fryer repair memphis',
  'commercial griddle repair memphis',
  'commercial dishwasher repair memphis',
  'steam table repair memphis',

  // Locations
  'commercial kitchen repair germantown tn',
  'restaurant equipment repair bartlett tn',
  'commercial appliance repair collierville tn',
];

interface RankResult {
  keyword: string;
  position: number | null;
  checkedAt: string;
  method: string;
}

/**
 * Check rank using SERPRobot's free API-like endpoint
 * This is a workaround - they don't have a public API but we can use their checker
 */
async function checkWithGoogle(keyword: string): Promise<RankResult> {
  // Google blocks automated requests, so we'll use a simple fetch
  // to at least try - this may not work consistently
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=20`;

  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const html = await response.text();

    // Look for our domain in the HTML
    const domainIndex = html.toLowerCase().indexOf(DOMAIN.toLowerCase());

    if (domainIndex > -1) {
      // Rough position estimate based on where domain appears
      // Count how many <div class="g"> (result containers) appear before our result
      const beforeDomain = html.substring(0, domainIndex);
      const resultDivs = (beforeDomain.match(/<div class="g"/gi) || []).length;

      return {
        keyword,
        position: Math.max(1, resultDivs),
        checkedAt: new Date().toISOString(),
        method: 'google-fetch'
      };
    }

    return {
      keyword,
      position: null,
      checkedAt: new Date().toISOString(),
      method: 'google-fetch'
    };

  } catch (error: any) {
    console.log(`   Error: ${error.message}`);
    return {
      keyword,
      position: null,
      checkedAt: new Date().toISOString(),
      method: 'error'
    };
  }
}

/**
 * Alternative: Use whatsmyserp.com free checker
 */
async function checkWithWhatsmyserp(keyword: string): Promise<RankResult> {
  // This service allows checking without auth
  const url = `https://whatsmyserp.com/serpcheck?keyword=${encodeURIComponent(keyword)}&domain=${encodeURIComponent(DOMAIN)}&location=United+States`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const data = await response.text();

    // Parse response for rank info
    const rankMatch = data.match(/rank[:\s]*(\d+)/i);
    if (rankMatch) {
      return {
        keyword,
        position: parseInt(rankMatch[1], 10),
        checkedAt: new Date().toISOString(),
        method: 'whatsmyserp'
      };
    }

    return {
      keyword,
      position: null,
      checkedAt: new Date().toISOString(),
      method: 'whatsmyserp'
    };

  } catch (error) {
    return {
      keyword,
      position: null,
      checkedAt: new Date().toISOString(),
      method: 'error'
    };
  }
}

async function main() {
  console.log('═'.repeat(60));
  console.log('🎯 RPM SERP RANK CHECKER (Fetch-based)');
  console.log('═'.repeat(60));
  console.log(`Domain: ${DOMAIN}`);
  console.log(`Keywords: ${KEYWORDS.length}`);
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log('═'.repeat(60));

  const results: RankResult[] = [];

  for (const keyword of KEYWORDS) {
    console.log(`\n🔍 "${keyword}"`);

    const result = await checkWithGoogle(keyword);
    results.push(result);

    if (result.position) {
      console.log(`   ✅ Position: #${result.position}`);
    } else {
      console.log(`   ❌ Not found / Blocked`);
    }

    // Delay between requests
    await new Promise(r => setTimeout(r, 2000));
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 RESULTS SUMMARY');
  console.log('═'.repeat(60));

  const found = results.filter(r => r.position !== null);
  const notFound = results.filter(r => r.position === null);

  if (found.length > 0) {
    console.log(`\n✅ FOUND (${found.length}):`);
    found.forEach(r => console.log(`   #${r.position}: ${r.keyword}`));
  }

  if (notFound.length > 0) {
    console.log(`\n❌ NOT FOUND / BLOCKED (${notFound.length}):`);
    notFound.forEach(r => console.log(`   • ${r.keyword}`));
  }

  // Save markdown report
  const reportPath = 'C:/Users/tjdot/RapidPro/tools/serp-results.md';
  let md = `# SERP Check - ${new Date().toLocaleDateString()}\n\n`;
  md += `| Keyword | Position |\n`;
  md += `|---------|----------|\n`;
  results.forEach(r => {
    md += `| ${r.keyword} | ${r.position ?? '>20 / blocked'} |\n`;
  });
  md += `\n*Note: Google often blocks automated requests. For accurate tracking, use Google Search Console.*\n`;

  fs.writeFileSync(reportPath, md);
  console.log(`\n📁 Saved: ${reportPath}`);

  console.log('\n' + '═'.repeat(60));
  console.log('💡 For reliable tracking, use these FREE options:');
  console.log('   1. Google Search Console (most accurate)');
  console.log('   2. https://www.serprobot.com (free manual checks)');
  console.log('   3. https://www.seobility.net/en/rankingcheck/');
  console.log('═'.repeat(60));
}

main().catch(console.error);
