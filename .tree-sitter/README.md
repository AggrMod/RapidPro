# RapidPro Testing & Analysis Tools

This directory contains local development tools that are NOT pushed to the repository.

## Quick Test Scripts

### `quick-test-submit.js`
**Purpose:** One-click automation to get to the interaction form SUBMIT button state

**Usage with Playwright:**
```javascript
// In browser console or Playwright test:
await eval(await fs.readFile('.tree-sitter/quick-test-submit.js', 'utf8'));
```

**What it does:**
1. Navigates to dashboard
2. Clicks "CLOCK IN - GET MISSION"
3. Clicks "LOG INTERACTION"
4. Selects 5-star efficacy score
5. Fills in test notes
6. Leaves you ready to test SUBMIT button behavior

**Why we need this:**
Testing the SUBMIT button bug requires going through multiple steps every time. This script gets us to the testing state in seconds instead of manually clicking through the entire flow.

## Analysis Files

### `ANALYSIS_NOTES.md`
Complete documentation of:
- Tree Sitter project statistics
- Bug analysis and root cause findings
- Code flow traces
- Proposed fixes
- Tool status and usage notes

## Files Ignored by Git

See `.gitignore` for the full list:
- `.tree-sitter/` - This entire directory
- `*.ast.json` - AST dumps
- `*.symbols.json` - Symbol tables
- `code-analysis/` - Analysis output
- `TREE_SITTER_NOTES.md` - Local notes
