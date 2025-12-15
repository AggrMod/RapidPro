/**
 * RPM Keyword Rank Tracker
 * Uses web scraping to check Google rankings for rapidpromemphis.com
 *
 * IMPORTANT: This is for personal use only. Google ToS prohibits automated scraping.
 * For production, use Google Search Console API or paid rank tracking services.
 */

import { navigate, snapshot } from '../../servers/wrappers/playwright/index.js';

interface RankResult {
  keyword: string;
  position: number | null;
  url: string | null;
  title: string | null;
  timestamp: string;
}

// Target keywords for RPM
const RPM_KEYWORDS = [
  // Priority 1 - Core services
  'commercial kitchen equipment repair memphis',
  'commercial oven repair memphis',
  'commercial fryer repair memphis',
  'restaurant equipment repair memphis',
  'commercial appliance repair memphis',

  // Priority 2 - Maintenance (RPM strength)
  'commercial kitchen maintenance memphis',
  'restaurant equipment preventative maintenance memphis',
  'commercial kitchen preventative maintenance plan memphis',

  // Priority 3 - Location specific
  'commercial kitchen repair germantown tn',
  'restaurant equipment repair bartlett tn',
  'commercial appliance repair collierville tn',

  // Priority 4 - Equipment specific
  'commercial griddle repair memphis',
  'steam table repair memphis',
  'commercial dishwasher repair memphis',

  // Priority 5 - Emergency
  'emergency restaurant equipment repair memphis',
  'same day commercial oven repair memphis'
];

const DOMAIN = 'rapidpromemphis.com';

async function checkRankForKeyword(keyword: string): Promise<RankResult> {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=20&hl=en&gl=us`;

  try {
    await navigate({ url: searchUrl });

    // Wait for results to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    const snap = await snapshot();

    // Parse the snapshot to find our domain
    // This is a simplified approach - the snapshot contains accessibility tree
    const content = JSON.stringify(snap);

    // Look for rapidpromemphis.com in the results
    const domainRegex = new RegExp(DOMAIN, 'gi');
    const matches = content.match(domainRegex);

    if (matches && matches.length > 0) {
      // Found in results - estimate position based on content structure
      // This is approximate; for accurate tracking use Search Console
      const firstIndex = content.toLowerCase().indexOf(DOMAIN.toLowerCase());
      const beforeText = content.substring(0, firstIndex);

      // Count how many result items appear before our domain
      // Look for patterns like "link" or "heading" that indicate search results
      const resultIndicators = (beforeText.match(/StaticText|link|heading/gi) || []).length;
      const estimatedPosition = Math.ceil(resultIndicators / 10); // Rough estimate

      return {
        keyword,
        position: estimatedPosition > 0 ? estimatedPosition : 1,
        url: `https://${DOMAIN}`,
        title: 'Found in results',
        timestamp: new Date().toISOString()
      };
    }

    return {
      keyword,
      position: null, // Not found in top 20
      url: null,
      title: null,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Error checking rank for "${keyword}":`, error);
    return {
      keyword,
      position: null,
      url: null,
      title: `Error: ${error}`,
      timestamp: new Date().toISOString()
    };
  }
}

async function runRankCheck(): Promise<void> {
  console.log('🔍 RPM Keyword Rank Tracker');
  console.log('=' .repeat(50));
  console.log(`Checking rankings for ${DOMAIN}`);
  console.log(`Keywords to check: ${RPM_KEYWORDS.length}`);
  console.log('=' .repeat(50));

  const results: RankResult[] = [];

  for (const keyword of RPM_KEYWORDS) {
    console.log(`\nChecking: "${keyword}"...`);

    const result = await checkRankForKeyword(keyword);
    results.push(result);

    if (result.position !== null) {
      console.log(`  ✅ Position: #${result.position}`);
    } else {
      console.log(`  ❌ Not found in top 20`);
    }

    // Delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RANKING SUMMARY');
  console.log('=' .repeat(50));

  const ranked = results.filter(r => r.position !== null);
  const notRanked = results.filter(r => r.position === null);

  console.log(`\n✅ Ranking (${ranked.length} keywords):`);
  ranked
    .sort((a, b) => (a.position || 999) - (b.position || 999))
    .forEach(r => {
      console.log(`  #${r.position}: ${r.keyword}`);
    });

  console.log(`\n❌ Not in Top 20 (${notRanked.length} keywords):`);
  notRanked.forEach(r => {
    console.log(`  - ${r.keyword}`);
  });

  // Save results to JSON
  const outputPath = 'C:/Users/tjdot/RapidPro/tools/rank-history.json';
  let history: RankResult[][] = [];

  try {
    const fs = await import('fs');
    if (fs.existsSync(outputPath)) {
      history = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    }
  } catch (e) {
    // File doesn't exist yet
  }

  history.push(results);

  const fs = await import('fs');
  fs.writeFileSync(outputPath, JSON.stringify(history, null, 2));

  console.log(`\n📁 Results saved to: ${outputPath}`);
}

// Export for use
export { checkRankForKeyword, runRankCheck, RPM_KEYWORDS };

// Run if called directly
runRankCheck().catch(console.error);
