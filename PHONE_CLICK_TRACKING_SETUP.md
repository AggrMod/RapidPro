# 📞 Phone Click Tracking Setup Guide

## Problem:
You're getting 2 calls but can't see which pages or links people clicked to call you.

## Solution:
Add Google Analytics event tracking to all phone number links.

---

## Quick Fix (5 Minutes):

### Step 1: Add This Script to Your HTML

Find the Google Analytics script in your `index.html` (around line 3-10) and add this AFTER it:

```html
<!-- Phone Click Tracking -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Track all phone number clicks
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

    phoneLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const phoneNumber = this.href.replace('tel:', '');
            const linkText = this.textContent.trim();
            const linkLocation = this.className || 'unknown';

            // Send event to Google Analytics
            gtag('event', 'phone_click', {
                'event_category': 'Contact',
                'event_label': phoneNumber,
                'phone_location': linkLocation,
                'link_text': linkText,
                'page_path': window.location.pathname
            });

            console.log('Phone click tracked:', {
                number: phoneNumber,
                location: linkLocation,
                page: window.location.pathname
            });
        });
    });
});
</script>
```

### Step 2: Where to Add It

In your `index.html`, add this script right after line 11 (after the Google Analytics config).

It should look like this:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YN82WFKX62"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-YN82WFKX62');
</script>

<!-- Phone Click Tracking -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // ... (phone tracking code from above)
});
</script>
```

---

## What This Does:

1. **Finds all phone links** (`tel:` links) on your page
2. **Tracks clicks** when someone clicks any phone number
3. **Sends to Google Analytics** with these details:
   - Which phone number was clicked
   - Which page they were on
   - What the link text was (e.g., "Emergency Phone", "Call Now")
   - Where on the page (e.g., "emergency-banner", "sticky-call")

---

## How to See the Data:

### In Google Analytics (After you add the code):

1. Go to: https://analytics.google.com
2. Click "Reports" → "Engagement" → "Events"
3. Look for event called: **phone_click**
4. Click it to see:
   - How many phone clicks total
   - Which pages generated clicks
   - Which link location (emergency banner, nav, footer, etc.)

---

## Your 5 Phone Links That Will Be Tracked:

1. **Emergency Banner** (line 1515)
   - Link: `tel:+19012579417`
   - Text: "📞 Call Now: (901) 257-9417"
   - Location: `emergency-phone`

2. **Navigation Menu** (line 1550)
   - Link: `tel:+19012579417`
   - Text: Phone number in nav
   - Location: `phone-number nav-call`

3. **CTA Button** (line 1911)
   - Link: `tel:+19012579417`
   - Text: CTA button
   - Location: `cta-btn cta-btn-secondary`

4. **Footer** (line 1927)
   - Link: `tel:+19012579417`
   - Text: "(901) 257-9417"
   - Location: (footer link)

5. **Sticky Call Button** (line 1943)
   - Link: `tel:+19012579417`
   - Text: Floating call button
   - Location: `sticky-call`

---

## Testing:

After adding the code:

1. Open your site: https://rapidpromemphis.com (or local file)
2. Open browser console (F12)
3. Click any phone number
4. You should see: `Phone click tracked: {number: '+19012579417', location: 'emergency-phone', page: '/'}`
5. Check Google Analytics in 24 hours to see the `phone_click` event

---

## Advanced: Track Which Link Converts Best

Once you have this data, you can see:

- **Emergency banner** vs **Sticky button** vs **Footer** - which gets more clicks?
- **Homepage** vs **Service pages** - which drives more calls?
- **Mobile** vs **Desktop** - where do calls come from?

This helps you optimize which pages/links to promote!

---

## Why This Matters:

**Current situation:**
- ✅ 2 calls came in
- ❌ No idea which page they were on
- ❌ No idea which link they clicked
- ❌ Can't optimize what you can't measure

**After tracking:**
- ✅ Know exactly which pages drive calls
- ✅ Know which phone link placement works best
- ✅ Can double down on what works
- ✅ Can improve pages that don't convert

---

## Next Steps:

1. **Add the tracking script** (5 minutes)
2. **Test it** (click a phone link, check console)
3. **Wait 24-48 hours** for data in Google Analytics
4. **Check Events report** to see phone click data

---

Want me to add this tracking code to your index.html right now?
