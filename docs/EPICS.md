# RapidPro Memphis - Frontend Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for the RapidPro Memphis frontend rebuild ("RPM"). The goal is to transform the current site into a **premium, high-performance web application** that dominates the local market. 

We will adopt the **BMAD methodology** to decompose requirements into implementable stories. The target state is a modern **Next.js** application leveraging **Vanilla CSS** with a sophisticated design system, ensuring lightning-fast performance, superior SEO features, and a "wow" visual experience.

---

## Product Vision

**Rapid Pro Maintenance** serves Memphis-area food service businesses with elite commercial kitchen equipment repair. The frontend must reflect this "elite" status—leaving competitors looking outdated.

**The "Ideal" Experience:**
1.  **Visually Stunning**: Glassmorphism effects, smooth page transitions, and rich, deep colors (dark mode accents) that feel premium.
2.  **Conversion Focused**: Smart sticky elements, frictionless contact forms, and instant click-to-call.
3.  **Technically Superior**: >95 Lighthouse scores, instant navigation (SPA feel), and perfect schema implementation.
4.  **Local Authority**: unmistakably "Memphis" with hyper-local content and map integrations.

---

## Requirements Inventory

### Functional Requirements (FR)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Click-to-call functionality always visible | Critical |
| FR-2 | Smart Service Request Form (wizard interface) | High |
| FR-3 | Interactive Service Area Map with "Time to Arrival" tooltips | Medium |
| FR-4 | Emergency Service Status Indicator/Badge | High |
| FR-5 | Verified Testimonial System with Schema | High |
| FR-6 | Dedicated Landing Pages for all 7 major equipment types | Critical |
| FR-7 | Geo-targeted Landing Pages for all 5 major suburbs | Critical |
| FR-8 | Rich FAQ Sections (Accordion style) with JSON-LD | High |
| FR-9 | "Before & After" Repair Gallery with Slider | Medium |
| FR-10 | Real-time "Open Now / Emergency" Status | Low |

### Non-Functional Requirements (NFR)

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Page Load Performance | < 1.5s LCP |
| NFR-2 | Visual Aesthetics | "Premium" (Glassmorphism, Animations) |
| NFR-3 | Mobile Experience | Native-app feel |
| NFR-4 | SEO Technicals | 100% Schema Coverage, Perfect Core Web Vitals |
| NFR-5 | Accessibility | WCAG 2.1 AA Compliant |

### Technical Requirements (TR)

| ID | Requirement | Implementation |
|----|-------------|----------------|
| TR-1 | Framework | **Next.js** (React) for SSG/ISR |
| TR-2 | Hosting | Netlify (git-based deployment) |
| TR-3 | Styling | **Vanilla CSS** (Variables + Modules), No Tailwind |
| TR-4 | Analytics | GA4 + GTM |
| TR-5 | Content | MDX for blog/service pages |

### FR Coverage Map

| Feature/FR | Epic | Stories |
|------------|------|---------|
| Click-to-call | Epic 1, 2 | 1.6, 2.6 |
| Service Form | Epic 6 | 6.1, 6.2 |
| Interactive Map | Epic 2, 8 | 2.4, 8.1 |
| Emergency Badge | Epic 2 | 2.2 |
| Testimonials | Epic 2, 5 | 2.5, 5.1 |
| Equipment Pages | Epic 3 | 3.1 - 3.7 |
| Location Pages | Epic 4 | 4.1 - 4.5 |
| FAQs | Epic 3 | All equipment stories |
| Gallery | Epic 8 | 8.3 |

---

## Epic List

| Epic | Title | Priority | Status |
|------|-------|----------|--------|
| 1 | **Premium Design System** | MVP | Ready |
| 2 | **Homepage Experience** | MVP | Ready |
| 3 | **Equipment Service Hubs** | MVP | Ready |
| 4 | **Local Domination (Geo Pages)** | MVP | Ready |
| 5 | **Trust & Authority Assets** | MVP | Ready |
| 6 | **Conversion Engine (Lead Capture)** | MVP | Ready |
| 7 | **Technical SEO Core** | MVP | Ready |
| 8 | **Interactive Engagement** | Post-MVP | Planned |
| 9 | **Content & CMS** | Post-MVP | Planned |

---

## Epic 1: Premium Design System

**Goal:** Build a bespoke, high-end visual language using Vanilla CSS variables that screams "Quality". Avoid generic templates.

### Story 1.1: Brand Identity & Color System
**As a** developer/designer,
**I want** a rich, HSL-based color system,
**So that** the site looks harmonious and premium.

**Acceptance Criteria:**
- **Given** I open `index.css`
- **When** I check `:root` variables
- **Then** I see `white`, `black`, and `primary` defined in HSL
- **And** `primary` is a high-contrast Yellow/Gold (#facc15 equivalent)
- **And** `surface` colors (dark grays) are defined for "Dark Mode" feel sections
- **And** gradients are defined for buttons and hero overlays

### Story 1.2: Typography & Readability
**As a** user,
**I want** crisp, modern typography,
**So that** the content feels professional and easy to read.

**Acceptance Criteria:**
- **Given** the font loads
- **Then** standard text is `Inter` or `Outfit` (Google Fonts)
- **And** Headings use a bold, tight tracking style
- **And** Fluid typography (clamp()) is used for responsiveness
- **And** `line-height` is optimized for readability (1.6 for body)

### Story 1.3: "Glassmorphism" UI Components
**As a** user,
**I want** modern UI elements like glass cards,
**So that** the interface feels deeper and clearer.

**Acceptance Criteria:**
- **Given** a card or sticky header requires a background
- **Then** use `backdrop-filter: blur(10px)`
- **And** use semi-transparent backgrounds (rgba/hsla)
- **And** add subtle 1px white borders with low opacity for the "glass edge" effect
- **And** verify support across Chrome, Safari, Firefox

### Story 1.4: Micro-Interactions & Animation
**As a** user,
**I want** the site to feel "alive",
**So that** interacting with it is satisfying.

**Acceptance Criteria:**
- **Given** I hover over a button
- **Then** it scales up slightly (`transform: scale(1.05)`)
- **And** box-shadow glows stronger
- **When** I scroll down
- **Then** elements "fade up" into view (Intersection Observer)
- **When** I click a link
- **Then** page transition is smooth (no hard white flash)

---

## Epic 2: Homepage Experience

**Goal:** A "Wow" first impression that converts immediately.

### Story 2.1: Cinematic Hero Section
**As a** visitor,
**I want** to see professionalism immediately,
**So that** I stop searching for other companies.

**Acceptance Criteria:**
- **Given** the homepage loads
- **Then** high-quality video background (muted, looped) of commercial kitchen repair plays
- **And** a dark gradient overlay ensures text readability
- **And** H1 "Memphis Commercial Kitchen Repair" is prominent
- **And** Main CTA "Call Now" pulses subtly
- **And** secondary CTA "Get a Quote" uses the "glass" style

### Story 2.2: The "Trust Grid"
**As a** visitor,
**I want** to see immediate reasons to trust you,
**So that** I feel safe calling.

**Acceptance Criteria:**
- **Then** display a 4-column grid of Trust Badges
- **Badges:** "24/7 Emergency", "EPA Certified", "Locally Owned", "Same Day Service"
- **And** use custom SVG icons with brand colors
- **And** hover effects "lift" the badges

### Story 2.3: Sticky Conversion Bar (Mobile)
**As a** mobile user,
**I want** the phone number always under my thumb,
**So that** I can call without scrolling back up.

**Acceptance Criteria:**
- **Given** I scroll past the hero interactions
- **Then** a fixed bottom bar slides up
- **And** it contains a full-width "Call Tech Now" button
- **And** it uses looking-glass background
- **And** it does not cover the footer content when at bottom

---

## Epic 3: Equipment Service Hubs

**Goal:** SEO powerhouses. Dedicated, content-rich pages for each machine type.

### Stories 3.1 - 3.7 (Equipment Specifics)
*Standardized format for: Oven, Fryer, Griddle, Dishwasher, Ice Machine, Walk-in, Steam Table*

**As a** user with broken [Equipment],
**I want** a page specifically about [Equipment] repair,
**So that** I know you are an expert in *this specific* machine.

**Acceptance Criteria (for all):**
- **URL**: `/services/[equipment]-repair-memphis`
- **H1**: "Commercial [Equipment] Repair in Memphis"
- **Content**:
  - Common problems fixed (e.g. "Not heating", "Leaking")
  - Brands serviced (Vulcan, Hobart, etc.)
  - FAQ Grid (Accordion style)
- **Tech**: FAQ Schema (`FAQPage`) injected via JSON-LD

---

## Epic 4: Local Domination (Geo Pages)

**Goal:** Capture "near me" searches in affluent suburbs.

### Stories 4.1 - 4.5 (Location Specifics)
*Germantown, Collierville, Bartlett, Cordova, Southaven*

**As a** restaurant manager in [City],
**I want** to know you come to me specifically,
**So that** I don't pay excessive travel fees.

**Acceptance Criteria:**
- **URL**: `/locations/[city]-restaurant-equipment-repair`
- **Dynamic Map**: Show route from HQ to [City] center
- **Local Context**: Mention [City] landmarks or specific health codes
- **Schema**: `areaServed` property tailored to [City]

---

## Epic 5: Trust & Authority Assets

### Story 5.1: The "Wall of Love" (Testimonials)
**As a** skeptic,
**I want** to see other local restaurant owners' reviews,
**So that** I know you are real.

**Acceptance Criteria:**
- **Component**: Masonry grid of review cards
- **Content**: Stars + Text + "Verified Business" badge
- **Source**: Mix of Google Reviews and direct feedback
- **Tech**: `Review` schema markup for aggregate rating

### Story 5.2: Certifications Page
**As a** facility manager,
**I want** to see your license and insurance,
**So that** I can approve you as a vendor.

**Acceptance Criteria:**
- **Display**: High-res images of EPA 608 cards, Business License, Insurance Cert snippet
- **Download**: "W-9" download link for new vendors

---

## Epic 6: Conversion Engine

### Story 6.1: The "Emergency" Logic Form
**As a** user,
**I want** the form to understand if I have an emergency,
**So that** I get the right response speed.

**Acceptance Criteria:**
- **Field**: "Is this an Emergency?" toggle
- **Logic**:
  - If YES: Show modal "For Emergencies, Calling is Faster! [Call Button]"
  - If NO: Show standard date picker
- **Design**: Multi-step wizard (Step 1: Equipment, Step 2: Issue, Step 3: Contact)
- **Feedback**: Success slate with "Tech Dispatched" feel

---

## Epic 7: Technical SEO Core

### Story 7.1: Next.js SEO & Performance
**As a** search engine,
**I want** perfectly optimized code,
**So that** I verify this site as high quality.

**Acceptance Criteria:**
- **Images**: Use `next/image` for auto-WebP/AVIF and size generation
- **Dynamic Imports**: Lazy load non-critical components (Map, Reviews)
- **Meta**: Dynamic `metadata` API in Next.js for Titles/Descriptions
- **Sitemap**: Auto-generated via `next-sitemap`

---

## Architecture Recommendation

### Stack Selection
- **Core**: **Next.js 14+** (App Router)
  - *Why*: Best-in-class SEO, easy routing for 16+ pages, optimizers built-in.
- **Styling**: **Vanilla CSS Modules** + CSS Variables
  - *Why*: Granular control, "Rich Aesthetics" via custom classes, no Tailwind bloat.
- **Animation**: **Framer Motion** (optional) or **CSS Keyframes**
  - *Why*: For the "wow" micro-interactions and page reveals.
- **Deployment**: **Netlify**
  - *Why*: Fast global CDN, seamless reliable hosting.

### File Structure (Proposed)
```text
src/
  app/
    layout.tsx        # Global glassmorphism UI, Font load
    page.tsx          # Hero Video Homepage
    services/
      [slug]/page.tsx # Dynamic Equipment Pages
    locations/
      [slug]/page.tsx # Dynamic Location Pages
  components/
    ui/
      GlassCard.tsx
      NeonButton.tsx
    sections/
      Hero.tsx
      TrustGrid.tsx
  styles/
    globals.css       # HSL Variables, Resets
    animations.css    # Keyframes
```

---

## Epic 8: Interactive Engagement (Post-MVP)

**Goal:** Add "wow factor" interactive features that differentiate RPM from cookie-cutter competitor sites.

### Story 8.1: Interactive Service Area Map
**As a** visitor,
**I want** to explore the service coverage visually,
**So that** I know exactly how fast you can reach me.

**Acceptance Criteria:**
- **Given** I view the service area section
- **Then** an interactive Leaflet/Mapbox map displays Memphis metro
- **And** hovering over zones shows "Est. Response Time: 30 min"
- **And** clicking a zone links to that location's page
- **And** map lazy-loads to preserve performance

### Story 8.2: Equipment Troubleshooting Wizard
**As a** DIY-minded manager,
**I want** quick troubleshooting tips,
**So that** I can try a simple fix before calling (builds trust).

**Acceptance Criteria:**
- **Given** I access the troubleshooting tool
- **Then** I select my equipment type from a visual grid
- **And** I select my symptom ("Not heating", "Making noise", etc.)
- **Then** I see 2-3 quick checks ("Check pilot light", "Reset breaker")
- **And** final CTA: "Still not working? Call us now"

### Story 8.3: Before/After Repair Gallery
**As a** potential customer,
**I want** to see repair quality,
**So that** I trust your workmanship.

**Acceptance Criteria:**
- **Component**: Image comparison slider (drag to reveal)
- **Content**: 6-10 before/after repair photos
- **Filter**: By equipment type
- **Caption**: Equipment type + problem fixed

### Story 8.4: Live Chat Integration
**As a** visitor with a quick question,
**I want** to chat without calling,
**So that** I can get info while at work.

**Acceptance Criteria:**
- **Tool**: Tawk.to or Crisp (free tier)
- **Trigger**: Chat bubble appears after 30s on site
- **Fallback**: If offline, show "Leave a message" form

---

## Epic 9: Content & CMS (Post-MVP)

**Goal:** Enable ongoing content updates without developer involvement.

### Story 9.1: Blog/Resource Center
**As a** content marketer,
**I want** to publish maintenance tips and guides,
**So that** we rank for informational keywords.

**Acceptance Criteria:**
- **URL**: `/blog/[slug]`
- **Format**: MDX files in `/content/blog/`
- **Features**: Categories, tags, related posts
- **SEO**: Auto-generated meta, Article schema

### Story 9.2: Service Update Announcements
**As a** business owner,
**I want** to post seasonal announcements,
**So that** customers know about holiday hours or new services.

**Acceptance Criteria:**
- **Component**: Alert banner at top of site
- **Content**: Editable via JSON config file
- **Dismissal**: User can close, preference saved in localStorage

### Story 9.3: Testimonial Management System
**As an** admin,
**I want** to add new testimonials easily,
**So that** fresh reviews appear without code changes.

**Acceptance Criteria:**
- **Data**: `/content/testimonials.json`
- **Fields**: Name, business, quote, rating, date, photo (optional)
- **Display**: Auto-sorts by date, newest first

---

## Epic Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                        MVP FOUNDATION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Epic 1 (Design System) ──────┬──────────────────────────────  │
│          │                     │                                │
│          ▼                     ▼                                │
│   Epic 2 (Homepage)     Epic 7 (SEO Core)                       │
│          │                     │                                │
│          ├─────────────────────┤                                │
│          ▼                     ▼                                │
│   Epic 3 (Equipment)    Epic 4 (Locations)                      │
│          │                     │                                │
│          └─────────┬───────────┘                                │
│                    ▼                                            │
│             Epic 5 (Trust)                                      │
│                    │                                            │
│                    ▼                                            │
│             Epic 6 (Lead Capture)                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                        POST-MVP                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Epic 8 (Interactive) ────► Epic 9 (CMS)                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Success Metrics & KPIs

| Metric | Current State | MVP Target | 6-Month Goal |
|--------|---------------|------------|--------------|
| **Lighthouse Performance** | ~75 | >90 | >95 |
| **Lighthouse SEO** | ~85 | 100 | 100 |
| **Time to Interactive** | ~4s | <2s | <1.5s |
| **Mobile Bounce Rate** | Unknown | <50% | <40% |
| **Avg Session Duration** | Unknown | >90s | >2 min |
| **Call Conversion Rate** | Unknown | >3% | >5% |
| **Form Conversion Rate** | N/A | >1% | >2% |
| **Google Rankings** | #1 (1 keyword) | Top 10 (10 keywords) | Top 5 (20 keywords) |

### Target Keywords (MVP)

| Keyword | Current Rank | Target |
|---------|--------------|--------|
| restaurant equipment preventative maintenance memphis | #1 | Maintain |
| commercial oven repair memphis | Unknown | Top 5 |
| commercial fryer repair memphis | Unknown | Top 5 |
| commercial dishwasher repair memphis | Unknown | Top 5 |
| ice machine repair memphis | Unknown | Top 5 |
| walk-in cooler repair memphis | Unknown | Top 5 |
| kitchen equipment repair germantown tn | Unknown | Top 3 |
| restaurant equipment repair bartlett tn | Unknown | Top 3 |

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Initialize Next.js 14 project with App Router
- [ ] Set up Vanilla CSS design system (variables, resets)
- [ ] Create core components (GlassCard, Button, Header, Footer)
- [ ] Configure Netlify deployment pipeline
- [ ] Migrate existing assets (logo, images, video)

### Phase 2: Core Pages (Week 3-4)
- [ ] Build Homepage with Hero, Trust Grid, Services Grid
- [ ] Implement responsive navigation with mobile drawer
- [ ] Create Equipment page template with FAQ accordion
- [ ] Build all 7 equipment pages from template
- [ ] Add JSON-LD schema to all pages

### Phase 3: Local & Trust (Week 5)
- [ ] Create Location page template
- [ ] Build all 5 location pages
- [ ] Build Testimonials section/page
- [ ] Add Review schema markup
- [ ] Implement service area visualization

### Phase 4: Conversion & Polish (Week 6)
- [ ] Build multi-step quote form
- [ ] Implement sticky mobile CTA bar
- [ ] Add micro-interactions and animations
- [ ] Performance optimization pass
- [ ] Cross-browser testing
- [ ] Lighthouse audit and fixes

### Phase 5: Launch & Monitor (Week 7)
- [ ] Final QA testing
- [ ] DNS cutover to new site
- [ ] Set up GA4 conversion tracking
- [ ] Submit updated sitemap to Google Search Console
- [ ] Monitor Core Web Vitals

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Video file too large, hurts LCP | High | Medium | Use compressed WebM, poster image fallback |
| Glassmorphism effects not supported | Medium | Low | Progressive enhancement, solid fallback |
| Form submissions lost | High | Low | Netlify Forms with email backup |
| SEO rankings drop during migration | High | Medium | Keep URL structure, implement redirects |
| Mobile menu usability issues | Medium | Medium | User testing before launch |

---

## Definition of Done (DoD)

A story is complete when:
- [ ] Code is written and committed to feature branch
- [ ] Component renders correctly on Chrome, Safari, Firefox, Edge
- [ ] Mobile responsive (tested on 375px, 768px, 1024px, 1440px)
- [ ] Lighthouse Performance >90, Accessibility >90
- [ ] Schema markup validates in Google Rich Results Test
- [ ] No console errors
- [ ] PR reviewed and merged to main
- [ ] Deployed to Netlify preview, verified working

---

## Glossary

| Term | Definition |
|------|------------|
| **Glassmorphism** | UI design trend using frosted-glass effect (backdrop blur + transparency) |
| **LCP** | Largest Contentful Paint - Core Web Vital measuring load speed |
| **JSON-LD** | Structured data format for schema.org markup |
| **SSG** | Static Site Generation - pre-rendering pages at build time |
| **CTA** | Call to Action - buttons/links prompting user action |
| **MVP** | Minimum Viable Product - essential features for launch |

---

*Epic breakdown follows BMAD Method v6 principles*
*Document Version: 1.1*
*Last Updated: December 10, 2025*
