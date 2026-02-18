# Gemini Testing Todo List - RapidPro Memphis

**URL**: https://rapidpro-memphis.web.app
**Email**: `rapidpro.memphis@gmail.com`
**Password**: `RapidPro2025!`

---

## 🎯 Quick Testing Checklist

### Setup (1 minute)
- [ ] Open https://rapidpro-memphis.web.app in browser
- [ ] Have login credentials ready
- [ ] Open browser console (F12) to monitor for errors

---

### Test 1: Login & Authentication
- [ ] Enter email: `rapidpro.memphis@gmail.com`
- [ ] Enter password: `RapidPro2025!`
- [ ] Click "ACCESS SYSTEM"
- [ ] ✅ Verify dashboard loads (3-5 seconds)
- [ ] ✅ Verify email shown in header
- [ ] ✅ Verify no errors in console

**Tests**: Cloud Function #5 (initializeUser)

---

### Test 2: KPI Dashboard
- [ ] ✅ Verify 4 KPI cards visible:
  - [ ] MISSIONS COMPLETE: `____`
  - [ ] TARGET QUEUE: `____`
  - [ ] AVG EFFICACY: `____`
  - [ ] TOTAL OPS: `____`
- [ ] ✅ All values are numbers (not errors)

**Tests**: Cloud Function #4 (getKPIs)

---

### Test 3: Map Display
- [ ] ✅ Map loads showing Memphis area
- [ ] ✅ Multiple location markers visible (count: `____`)
- [ ] ✅ Can zoom in/out with +/- buttons
- [ ] ✅ Legend shows: Pending, Completed, Current Mission

**Tests**: Frontend, Firestore location data

---

### Test 4: Get Mission
- [ ] Click "⚡ CLOCK IN - GET MISSION"
- [ ] **Allow location permission if prompted**
- [ ] Wait 5-10 seconds
- [ ] ✅ Verify "ACTIVE MISSION" appears with:
  - [ ] TARGET: `____________________`
  - [ ] ADDRESS: `____________________`
  - [ ] DISTANCE: `____` mi
  - [ ] TYPE: `____________________`
- [ ] ✅ Verify "RECOMMENDED INTRO:" shows script
  - Script: `____________________`
- [ ] ✅ Map highlights current mission marker

**Tests**: Cloud Function #1 (getNextMission), #2 (generateIntroScript)

---

### Test 5: Log Interaction
- [ ] Click "✓ LOG INTERACTION"
- [ ] ✅ Form appears with stars, notes field, submit button
- [ ] Click the 5th star (★★★★★) for 5-star rating
- [ ] Type notes: "Gemini test - All functions verified working"
- [ ] Click "SUBMIT"
- [ ] ✅ Success message appears OR form closes
- [ ] ✅ No errors in console

**Tests**: Cloud Function #3 (logInteraction)

---

### Test 6: Verify KPI Updates
- [ ] Wait 5 seconds after submitting interaction
- [ ] Check KPIs again and compare to Test 2:
  - [ ] MISSIONS COMPLETE: `____` (was: ____, should be +1)
  - [ ] TARGET QUEUE: `____` (was: ____, should be -1)
  - [ ] AVG EFFICACY: `____` (was: ____, should update)
  - [ ] TOTAL OPS: `____` (was: ____, should be +1)
- [ ] ✅ All KPIs updated correctly

**Tests**: Cloud Function #3 (logInteraction), #4 (getKPIs), KPI calculations

---

### Test 7: Second Mission (Optional)
- [ ] Click "CLOCK IN - GET MISSION" again
- [ ] ✅ New mission assigned OR "No pending locations" message
- [ ] If new mission:
  - [ ] Complete interaction with 4 stars
  - [ ] Verify KPIs update again

**Tests**: Multiple sequential operations, data consistency

---

### Test 8: Console Check
- [ ] Open browser console (F12)
- [ ] Look for red error messages
- [ ] ✅ No 401 errors
- [ ] ✅ No "User must be authenticated" errors
- [ ] ✅ No critical JavaScript errors

**Tests**: Frontend-backend communication, authentication

---

### Test 9: Logout
- [ ] Click "LOGOUT" button
- [ ] ✅ Redirected to login screen
- [ ] Try accessing dashboard without login
- [ ] ✅ Cannot access, shows login screen

**Tests**: Session management, auth protection

---

## 📊 Quick Results Summary

**Overall Status**: ✅ ALL PASS / ❌ SOME FAIL

**Functions Tested**:
- [ ] ✅ #1 getNextMission (assigns nearest location)
- [ ] ✅ #2 generateIntroScript (creates intro phrase)
- [ ] ✅ #3 logInteraction (logs visit, updates KPIs)
- [ ] ✅ #4 getKPIs (retrieves metrics)
- [ ] ✅ #5 initializeUser (sets up new user)

**Issues Found**:
1. `____________________`
2. `____________________`
3. `____________________`

**System Status**:
- [ ] ✅ Ready for production
- [ ] ⚠️ Minor issues found (describe above)
- [ ] ❌ Major issues found (describe above)

---

## ⏱️ Time Estimate

- **Quick Test** (Tests 1-6 only): 10 minutes
- **Full Test** (All tests): 15-20 minutes

---

## 🆘 Quick Troubleshooting

**Login fails**: Check credentials exactly as written (case-sensitive)
**No mission**: All locations may be completed (this is success!)
**Map doesn't load**: Refresh page, check internet connection
**Location denied**: Click address bar icon, allow location, refresh

---

## 📋 Expected Results (All Should Pass)

✅ Login works instantly
✅ KPIs display numbers
✅ Map shows 14-15 markers
✅ Mission assigned in <10 seconds
✅ Intro script is meaningful text
✅ Interaction logs successfully
✅ KPIs update after logging
✅ No console errors
✅ Logout works

**If all above pass → System is 100% functional!** 🎉

---

## 📖 Reference Documents

For detailed info, see:
- `GEMINI_TESTING_INSTRUCTIONS.md` - Full testing guide
- `CLOUD_FUNCTIONS_TEST_REPORT.md` - Expected behavior
- `MISSION_COMPLETE.md` - Project overview

---

**Testing Goal**: Independently verify all 5 Cloud Functions work correctly after the v1→v2 API migration fix. Claude Code completed manual testing successfully - your verification provides additional confirmation.

**Start Here**: Test 1 → Login & Authentication
