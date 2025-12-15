# Tree Sitter Code Analysis Notes
**Project:** RapidPro Memphis Field Service Management
**Last Updated:** 2025-11-15

---

## Project Statistics

Tree Sitter detected:
- **JavaScript:** 2,637 lines
- **TypeScript:** 2,195 lines
- **HTML:** 16 files
- **JSON:** 470 lines
- **CSS:** 31 lines
- **Markdown:** 516 lines

---

## Critical Bug Analysis: Button Reset Issue

### Discovery Method
Used Tree Sitter's `find_text` tool to trace code flow:

1. Found `displayAIGuidance` call at `js/mission.js:175`
2. Found `finally` block at `js/mission.js:185`
3. Found form hide logic at `js/mission.js:223`

### Root Cause Identified

**File:** `js/mission.js`

**The Problem:**
The submit button appears stuck on "SUBMITTING..." because the form is hidden BEFORE the finally block can reset the button's visible state.

**Code Flow:**
```
Line 175: displayAIGuidance(aiResult.data) is called
  ↓
Line 223: document.getElementById('interaction-form').classList.add('hidden')
  ↓ Form is now HIDDEN (button not visible)
  ↓
Lines 186-188: finally { btn.disabled = false; btn.textContent = 'SUBMIT'; }
  ↓ Button IS reset, but user can't see it because form is hidden!
```

**Why Backend Works But UI Appears Broken:**
- ✅ `logInteraction` returns 200 SUCCESS
- ✅ `analyzeInteraction` returns 200 SUCCESS
- ✅ KPIs update from 16 → 17 completed missions
- ✅ `finally` block executes and resets button
- ❌ User sees "stuck" button because form is hidden

### Code Locations

**Submit Handler:** `js/mission.js:121-190`
```javascript
document.getElementById('submit-interaction-btn').addEventListener('click', async () => {
  // ... submission logic ...
  try {
    displayAIGuidance(aiResult.data); // Line 175
  } catch (guidanceError) {
    console.error('Error displaying AI guidance:', guidanceError);
    resetMissionUI();
  }
} finally {
  btn.disabled = false;
  btn.textContent = 'SUBMIT';
}
```

**displayAIGuidance Function:** `js/mission.js:221-256`
```javascript
function displayAIGuidance(aiData) {
  // Line 223: THIS IS THE PROBLEM
  document.getElementById('interaction-form').classList.add('hidden');

  // Creates modal with AI analysis
  const modal = document.createElement('div');
  modal.className = 'ai-guidance-modal';
  // ... modal content ...

  // Acknowledge button calls resetMissionUI()
  document.getElementById('ai-acknowledge-btn').addEventListener('click', () => {
    modal.remove();
    resetMissionUI();
  });
}
```

### Proposed Fix

**Option 1:** Reset button BEFORE hiding form
```javascript
// In submit handler, before displayAIGuidance:
btn.disabled = false;
btn.textContent = 'SUBMIT';
displayAIGuidance(aiResult.data);
```

**Option 2:** Don't hide form until modal is acknowledged
```javascript
// Move form hide to acknowledge button:
document.getElementById('ai-acknowledge-btn').addEventListener('click', () => {
  document.getElementById('interaction-form').classList.add('hidden');
  modal.remove();
  resetMissionUI();
});
```

**Option 3:** Reset button visibility state inside displayAIGuidance BEFORE hiding
```javascript
function displayAIGuidance(aiData) {
  // Reset button first
  const submitBtn = document.getElementById('submit-interaction-btn');
  submitBtn.disabled = false;
  submitBtn.textContent = 'SUBMIT';

  // Then hide form
  document.getElementById('interaction-form').classList.add('hidden');
  // ... rest of function
}
```

---

## Tree Sitter Tool Status

### ✅ Working Tools
- `find_text` - Fast text search with context lines
- `get_file` - Read files with line ranges
- `list_files` - Find files by glob pattern
- `analyze_project` - Project statistics
- `register_project_tool` - Register codebases

### ❌ Broken Tools (Compatibility Issue)
- `get_symbols` - Error: 'tree_sitter.Query' object has no attribute 'captures'
- `run_query` - Same error as get_symbols
- `analyze_complexity` - Depends on broken get_symbols

**Note:** The text search and file reading capabilities are sufficient for effective debugging on Windows.

---

## Useful Tree Sitter Commands

### Search for function calls:
```
find_text(pattern="functionName", context_lines=5)
```

### Get code section with line numbers:
```
get_file(path="js/mission.js", start_line=220, max_lines=50)
```

### Find all files matching pattern:
```
list_files(pattern="**/*.js")
```

---

## Quick Test Script - VERIFIED WORKING

**Location:** `.tree-sitter/quick-test-submit.js`

**Status:** ✅ All steps manually tested and verified with Playwright

**What it does:**
1. Navigate to dashboard.html (already authenticated)
2. Click "CLOCK IN - GET MISSION"
3. Click "LOG INTERACTION"
4. Select 3 stars
5. Fill notes: "Testing Gemini AI response"
6. Ready to click SUBMIT

**Verification Screenshots:**
- `step1-dashboard-loaded.png` - Dashboard loaded successfully
- `step3-log-interaction-form.png` - Form opened
- `step4-selected-3-stars.png` - 3 stars selected (cyan highlight)
- `step5-notes-entered-ready-to-submit.png` - Notes filled, ready to test

**Usage:** Copy script contents and paste into Playwright browser console

---

## Next Steps

1. ✅ Identified root cause with Tree Sitter
2. ✅ Created verified quick-test script
3. ⏳ Implement fix (Option 1 recommended)
4. ⏳ Deploy to production
5. ⏳ Test with hard refresh (v=3 cache bust)
6. ⏳ Verify modal appears and button resets properly
