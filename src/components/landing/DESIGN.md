# Birdieboard Landing Page — Design Specification v2.0

> **Design Direction:** Light, warm, community-first golf platform
> **Inspiration:** Strava (community-powered motivation), Garmin Connect (activity dashboard), 18Birdies (golf credibility)
> **Anti-patterns:** No glassmorphism, no aurora effects, no dark backgrounds, no "AI-powered" language, no tech-startup aesthetic

---

## Table of Contents

1. [Visual Direction](#1-visual-direction)
2. [Component Breakdown](#2-component-breakdown)
3. [Section 1: Navbar](#3-section-1-navbar)
4. [Section 2: Hero](#4-section-2-hero)
5. [Section 3: Social Proof Bar](#5-section-3-social-proof-bar)
6. [Section 4: Features Grid](#6-section-4-features-grid)
7. [Section 5: Testimonials](#7-section-5-testimonials)
8. [Section 6: Final CTA](#8-section-6-final-cta)
9. [Section 7: Footer](#9-section-7-footer)
10. [Responsive Strategy](#10-responsive-strategy)
11. [Animation & Interaction](#11-animation--interaction)
12. [Accessibility Notes](#12-accessibility-notes)
13. [CSS Changes Required](#13-css-changes-required)

---

## 1. Visual Direction

### Color Usage on Landing Page

| Role                  | Color           | Tailwind Class          | Hex       |
|-----------------------|-----------------|-------------------------|-----------|
| Page background       | White           | `bg-white`              | #FFFFFF   |
| Alt section bg        | Off-white green | `bg-golf-light/10`      | ~#F5FAF7  |
| Primary text          | Dark charcoal   | `text-gray-900`         | #111827   |
| Secondary text        | Medium gray     | `text-gray-600`         | #4B5563   |
| Muted text            | Light gray      | `text-gray-400`         | #9CA3AF   |
| Primary accent        | Golf green      | `text-golf-green`       | #2D6A4F   |
| Secondary accent      | Fairway         | `text-golf-fairway`     | #40916C   |
| Light green accents   | Light           | `text-golf-light`       | #95D5B2   |
| Warm accent           | Sand            | `text-golf-sand`        | #DDB892   |
| Info accent           | Sky             | `text-golf-sky`         | #89C2D9   |
| CTA background        | Green gradient  | Custom                  | #2D6A4F → #40916C |
| CTA text              | White           | `text-white`            | #FFFFFF   |
| Card background       | White           | `bg-white`              | #FFFFFF   |
| Card border           | Light gray      | `border-gray-100`       | #F3F4F6   |
| Card shadow           | Subtle          | `shadow-sm`             | --        |

### Typography Scale

| Element           | Classes                                           | Size     |
|-------------------|---------------------------------------------------|----------|
| Hero headline     | `text-4xl md:text-5xl lg:text-6xl font-bold`      | 36-60px  |
| Section headline  | `text-3xl md:text-4xl font-bold`                   | 30-36px  |
| Subheadline       | `text-lg md:text-xl text-gray-600`                 | 18-20px  |
| Feature title     | `text-xl font-semibold`                            | 20px     |
| Body text         | `text-base text-gray-600`                          | 16px     |
| Small/label       | `text-sm text-gray-500`                            | 14px     |
| Stat number       | `text-3xl md:text-4xl font-bold text-golf-green`   | 30-36px  |

### Overall Tone

- **Warm and welcoming**, like walking into a clubhouse
- **Clean white space** — let content breathe
- **Rounded corners** everywhere (cards: `rounded-2xl`, buttons: `rounded-xl`)
- **Subtle shadows** over borders (prefer `shadow-sm` and `shadow-md` over hard borders)
- **Green accents** draw the eye to key elements without overwhelming
- **Photography feel** — imagery should suggest real golfers on real courses
- **No gradients on text** — solid colors only for readability

---

## 2. Component Breakdown

### File Structure

```
src/components/landing/
  DESIGN.md              ← This file
  landing-navbar.tsx     ← Sticky navigation bar
  landing-hero.tsx       ← Hero section with headline + CTA
  social-proof-bar.tsx   ← Stats counters bar
  features-grid.tsx      ← 6-feature grid section
  testimonials.tsx       ← Testimonial cards section
  final-cta.tsx          ← Bottom call-to-action banner
  landing-footer.tsx     ← Site footer
```

### Page Assembly (`src/app/(landing)/page.tsx`)

The page.tsx will be refactored to import and compose these components:

```tsx
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingHero } from '@/components/landing/landing-hero';
import { SocialProofBar } from '@/components/landing/social-proof-bar';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { Testimonials } from '@/components/landing/testimonials';
import { FinalCta } from '@/components/landing/final-cta';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <main>
        <LandingHero />
        <SocialProofBar />
        <FeaturesGrid />
        <Testimonials />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
```

**Note:** The page itself is a Server Component (no `'use client'`). Only `LandingNavbar` needs `'use client'` for scroll detection. The rest are pure presentational.

---

## 3. Section 1: Navbar

### File: `landing-navbar.tsx`

**Behavior:**
- Fixed at top (`fixed top-0 z-50 w-full`)
- On load: transparent background, no shadow
- On scroll (past ~50px): white background with subtle shadow and bottom border
- Smooth transition between states

**Layout:**

```
DESKTOP (≥768px)
┌─────────────────────────────────────────────────────────────────┐
│  [⛳ Birdieboard]                        [Sign In]  [Get Started]│
└─────────────────────────────────────────────────────────────────┘

MOBILE (<768px)
┌─────────────────────────────────────────────────────────────────┐
│  [⛳ Birdieboard]                                   [Get Started]│
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**

```
Container:     max-w-6xl mx-auto px-6 py-4
Logo:          flex items-center gap-2
               IconGolf h-7 w-7 text-golf-green
               "Birdieboard" text-xl font-bold text-gray-900

Sign In:       text-sm font-medium text-gray-600 hover:text-golf-green
               transition-colors
               Hidden on mobile (hidden md:inline-flex)

Get Started:   bg-golf-green text-white text-sm font-semibold
               px-5 py-2.5 rounded-xl
               hover:bg-golf-fairway transition-colors
               shadow-sm hover:shadow-md

Background:
  Default:     bg-transparent
  Scrolled:    bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100
  Transition:  transition-all duration-300
```

**Implementation Notes:**
- Use `'use client'` directive — needs `useEffect` + `useState` for scroll listener
- `window.addEventListener('scroll', ...)` with cleanup
- Track `isScrolled` boolean state (threshold: 50px)
- On mobile, hide "Sign In" to keep navbar minimal; the "Get Started" button leads to the auth page where sign-in is also available

---

## 4. Section 2: Hero

### File: `landing-hero.tsx`

**Visual Direction:**
This is the first impression. It should immediately communicate: "This is a place for golfers to connect and improve together." No tech jargon, no dark mysterious vibes. Think: bright morning on the first tee with your group.

**Layout:**

```
DESKTOP (≥1024px)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                     pt-32 pb-20                                 │
│                                                                 │
│         Track Your Game.                                        │
│         Share Your Journey.                                     │
│                                                                 │
│         The golf community where you track rounds,              │
│         compare stats, and improve together with friends.       │
│                                                                 │
│         [ Start Tracking Free → ]    [ See Features ↓ ]         │
│                                                                 │
│                                                                 │
│              ┌─────────────────────────────┐                    │
│              │                             │                    │
│              │    App Screenshot / Hero    │                    │
│              │    Image Placeholder        │                    │
│              │                             │                    │
│              └─────────────────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

MOBILE (<768px)
┌───────────────────────────┐
│        pt-28 pb-16        │
│                           │
│   Track Your Game.        │
│   Share Your Journey.     │
│                           │
│   The golf community      │
│   where you track rounds, │
│   compare stats, and      │
│   improve together.       │
│                           │
│ [ Start Tracking Free → ] │
│                           │
│   ┌───────────────────┐   │
│   │  App Screenshot   │   │
│   │  Placeholder      │   │
│   └───────────────────┘   │
│                           │
└───────────────────────────┘
```

**Specifications:**

```
Section:        bg-white pt-32 pb-20 px-6
                (pt-32 accounts for fixed navbar height)

Container:      max-w-4xl mx-auto text-center

Headline:       text-4xl md:text-5xl lg:text-6xl
                font-bold text-gray-900
                leading-tight tracking-tight
                Line 1: "Track Your Game."
                Line 2: "Share Your Journey."

Subheadline:    mt-6 text-lg md:text-xl
                text-gray-600 max-w-2xl mx-auto
                leading-relaxed

CTA container:  mt-10 flex flex-col sm:flex-row
                items-center justify-center gap-4

Primary CTA:    inline-flex items-center gap-2
                bg-golf-green text-white
                text-base font-semibold
                px-8 py-3.5 rounded-xl
                hover:bg-golf-fairway
                shadow-md hover:shadow-lg
                transition-all duration-200
                Text: "Start Tracking Free"
                Icon: IconArrowRight h-5 w-5

Secondary CTA:  inline-flex items-center gap-2
                text-golf-green font-semibold
                px-6 py-3.5 rounded-xl
                border-2 border-golf-green/20
                hover:border-golf-green/40
                hover:bg-golf-green/5
                transition-all duration-200
                Text: "See Features"
                Icon: IconChevronDown h-5 w-5
                Hidden on mobile (hidden sm:inline-flex)

Hero image:     mt-16 max-w-3xl mx-auto
                rounded-2xl shadow-2xl
                border border-gray-100
                overflow-hidden
                Aspect ratio: 16:9 or similar
                (Placeholder: a light gray box with
                 "App Screenshot" text centered)
```

**Copy Options (Headline Alternatives):**

1. "Track Your Game. Share Your Journey." (recommended — simple, community-focused)
2. "Play Together. Improve Together."
3. "Your Golf. Your Friends. Your Stats."
4. "Where Golfers Come Together."

**Copy: Subheadline**

"The golf community where you track rounds, compare stats with friends, and watch your handicap drop — all in one place."

**Note on Hero Image:**
The hero image placeholder should eventually be replaced with either:
- A screenshot of the Birdieboard dashboard/scorecard (shows the product)
- An illustration of golfers on a course with data overlays (shows the vibe)
- For the initial implementation, use a clean placeholder with a subtle golf-green background and descriptive text

---

## 5. Section 3: Social Proof Bar

### File: `social-proof-bar.tsx`

**Purpose:** Build trust and convey momentum. Show that Birdieboard is an active, growing community.

**Layout:**

```
DESKTOP
┌─────────────────────────────────────────────────────────────────┐
│                      bg-gray-50 py-12                           │
│                                                                 │
│      500+              10,000+              200+                 │
│     Golfers         Rounds Tracked         Courses              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

MOBILE
┌───────────────────────────┐
│        bg-gray-50 py-10   │
│                           │
│    500+     10,000+       │
│   Golfers   Rounds        │
│                           │
│         200+              │
│        Courses            │
│                           │
└───────────────────────────┘
```

**Specifications:**

```
Section:        bg-gray-50 py-12 px-6
                border-y border-gray-100

Container:      max-w-4xl mx-auto

Grid:           grid grid-cols-2 md:grid-cols-3 gap-8

Stat item:      text-center

Number:         text-3xl md:text-4xl font-bold text-golf-green

Label:          mt-1 text-sm text-gray-500 font-medium

Dividers:       On desktop, use vertical dividers between items
                (optional: divide-x divide-gray-200 on the grid,
                 or simply rely on spacing)
```

**Stats Data:**

| Number   | Label           |
|----------|-----------------|
| 500+     | Active Golfers  |
| 10,000+  | Rounds Tracked  |
| 200+     | Courses Played  |

**Implementation Note:** These are static numbers for now. In the future, they could be fetched from an API endpoint that returns actual counts. Keep the data as a simple array at the top of the component for easy updates.

---

## 6. Section 4: Features Grid

### File: `features-grid.tsx`

**Visual Direction:** Warm, inviting cards with green accent icons. Each card should feel approachable, not clinical. Think of these as "reasons to join" rather than a "feature list."

**Layout:**

```
DESKTOP (≥1024px)
┌─────────────────────────────────────────────────────────────────┐
│                     bg-white py-24 px-6                         │
│                                                                 │
│              Everything You Need on the Course                  │
│         Built by golfers who understand the game.               │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│   │  ⛳          │  │  📊         │  │  👥          │            │
│   │ Track Every │  │ Know Your  │  │ Play With   │            │
│   │ Round       │  │ Game       │  │ Friends     │            │
│   │             │  │            │  │             │            │
│   │ description │  │ description│  │ description │            │
│   └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│   │  🏆         │  │  🏌️         │  │  🎯         │            │
│   │ Run Tours  │  │ Manage Your│  │ Improve     │            │
│   │            │  │ Bag        │  │ Your Game   │            │
│   │ description│  │ description│  │ description │            │
│   └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

MOBILE (<768px)
┌───────────────────────────┐
│       py-16 px-6          │
│                           │
│  Everything You Need      │
│  on the Course            │
│                           │
│  ┌─────────────────────┐  │
│  │ ⛳ Track Every Round │  │
│  │ description...       │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 📊 Know Your Game   │  │
│  │ description...       │  │
│  └─────────────────────┘  │
│                           │
│  (... 4 more cards)       │
│                           │
└───────────────────────────┘
```

**Specifications:**

```
Section:        bg-white py-24 px-6

Container:      max-w-6xl mx-auto

Section title:  text-center mb-4
                text-3xl md:text-4xl font-bold text-gray-900
                "Everything You Need on the Course"

Section sub:    text-center mb-16
                text-lg text-gray-600 max-w-xl mx-auto
                "Built by golfers who understand the game."

Grid:           grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
                gap-6 md:gap-8

Card:           bg-white rounded-2xl p-8
                border border-gray-100
                shadow-sm
                hover:shadow-md hover:border-golf-light/50
                transition-all duration-200

Icon wrapper:   mb-5
                inline-flex items-center justify-center
                w-12 h-12 rounded-xl
                bg-golf-green/10
                (icon inside: h-6 w-6 text-golf-green)

Card title:     text-xl font-semibold text-gray-900 mb-2

Card desc:      text-base text-gray-600 leading-relaxed
```

**Features Data (updated copy — warmer, community-focused):**

```typescript
const features = [
  {
    icon: IconGolf,
    title: 'Track Every Round',
    description:
      'Log your scores hole by hole with a quick, thumb-friendly scorecard designed for on-course use.',
  },
  {
    icon: IconChartBar,
    title: 'Know Your Game',
    description:
      'See your handicap trend, scoring patterns, and where your game is improving over time.',
  },
  {
    icon: IconUsers,
    title: 'Play With Friends',
    description:
      'Connect with your golf buddies, create matches, and see who takes bragging rights on the leaderboard.',
  },
  {
    icon: IconTrophy,
    title: 'Run Tours & Competitions',
    description:
      'Organize your own tournament series with custom scoring, standings, and season-long rivalries.',
  },
  {
    icon: IconShoe, // or IconDeviceGamepad — keep consistent with dashboard nav
    title: 'Manage Your Bag',
    description:
      'Keep track of every club — brand, model, and carry distances — so you always know your numbers.',
  },
  {
    icon: IconTargetArrow,
    title: 'Improve Together',
    description:
      'Compare stats with friends, celebrate personal bests, and find the parts of your game to work on.',
  },
];
```

**Note:** Changed "Improve Your Game" to "Improve Together" and removed any mention of "AI-powered" recommendations. Changed the description to be community-oriented ("Compare stats with friends") rather than tech-oriented ("AI-powered club recommendations").

---

## 7. Section 5: Testimonials

### File: `testimonials.tsx`

**Visual Direction:** Real-feeling quotes from golfers of various skill levels. Each testimonial should mention something specific about the app that resonated with them. Show diversity in handicap levels to communicate "this is for everyone."

**Layout:**

```
DESKTOP (≥1024px)
┌─────────────────────────────────────────────────────────────────┐
│                     bg-gray-50 py-24 px-6                       │
│                                                                 │
│                  What Golfers Are Saying                         │
│                                                                 │
│   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│   │ "quote..."    │ │ "quote..."    │ │ "quote..."    │         │
│   │               │ │               │ │               │         │
│   │ [avatar]      │ │ [avatar]      │ │ [avatar]      │         │
│   │ Name          │ │ Name          │ │ Name          │         │
│   │ 14.2 HCP      │ │ 8.1 HCP       │ │ 22.5 HCP      │         │
│   └───────────────┘ └───────────────┘ └───────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

MOBILE
┌───────────────────────────┐
│      bg-gray-50 py-16     │
│                           │
│  What Golfers Are Saying  │
│                           │
│  ┌─────────────────────┐  │
│  │ "quote..."          │  │
│  │ [avatar] Name       │  │
│  │          14.2 HCP   │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ "quote..."          │  │
│  │ [avatar] Name       │  │
│  │          8.1 HCP    │  │
│  └─────────────────────┘  │
│                           │
│  (... more cards)         │
│                           │
└───────────────────────────┘
```

**Specifications:**

```
Section:         bg-gray-50 py-24 px-6
                 border-y border-gray-100 (optional, subtle)

Container:       max-w-6xl mx-auto

Section title:   text-center mb-16
                 text-3xl md:text-4xl font-bold text-gray-900
                 "What Golfers Are Saying"

Grid:            grid grid-cols-1 md:grid-cols-3 gap-8

Card:            bg-white rounded-2xl p-8
                 shadow-sm border border-gray-100

Quote:           text-gray-700 text-base leading-relaxed
                 mb-6 italic
                 (Wrap in <blockquote> for semantics)

Attribution:     flex items-center gap-3 mt-auto

Avatar:          w-10 h-10 rounded-full
                 bg-golf-green/20
                 flex items-center justify-center
                 text-golf-green font-semibold text-sm
                 (Show initials, e.g., "ML" for Marcus Lindqvist)

Name:            text-sm font-semibold text-gray-900

Handicap:        text-sm text-gray-500
```

**Testimonials Data:**

```typescript
const testimonials = [
  {
    quote:
      'Finally an app that makes it easy to log rounds right on the course. I used to forget my scores by the time I got home — now it takes seconds per hole.',
    name: 'Marcus Lindqvist',
    initials: 'ML',
    handicap: '14.2',
  },
  {
    quote:
      'The friend competitions are what keep me coming back. My Saturday group has a season-long rivalry going and the leaderboard makes every round count.',
    name: 'Sarah Chen',
    initials: 'SC',
    handicap: '8.1',
  },
  {
    quote:
      'I never tracked my stats before Birdieboard. Seeing my handicap drop from 28 to 22 over six months gave me motivation I didn\'t know I needed.',
    name: 'David Ekström',
    initials: 'DE',
    handicap: '22.5',
  },
  {
    quote:
      'Simple, clean, and built for golfers — not tech people. I recommended it to everyone in my club and now we all track together.',
    name: 'Anna Johansson',
    initials: 'AJ',
    handicap: '18.4',
  },
];
```

**Note on testimonials:** These are fabricated for design purposes. The names use Scandinavian names to match the likely primary audience. Four testimonials are provided; on desktop, show 3 in a row (the 4th wraps to center on a second row, or hide the 4th on desktop and show all on mobile as a vertical list). Alternatively, display all 4 in a 2x2 grid on tablet.

**Responsive grid adjustment:**
```
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
```
Or for 3 prominent + 1 hidden on desktop:
```
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8
(4th card: hidden lg:block if using 4-col, or always visible)
```

Recommended: Use a 3-column grid on desktop with the first 3 testimonials. Show all 4 on mobile (stacked). This keeps the desktop layout balanced.

---

## 8. Section 6: Final CTA

### File: `final-cta.tsx`

**Visual Direction:** A confident, warm closing section with a green background that invites users to join. This is the "one last push" — should feel like an invitation, not a sales pitch.

**Layout:**

```
DESKTOP
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│            ┌─────────────────────────────────────┐              │
│            │        bg-golf-green py-20 px-8     │              │
│            │        rounded-3xl                  │              │
│            │                                     │              │
│            │    Ready to Join the Fairway?        │              │
│            │                                     │              │
│            │    Start tracking your rounds and    │              │
│            │    connect with golfers who share    │              │
│            │    your passion for the game.        │              │
│            │                                     │              │
│            │    [ Get Started — It's Free → ]     │              │
│            │                                     │              │
│            └─────────────────────────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

MOBILE
┌───────────────────────────┐
│                           │
│  ┌─────────────────────┐  │
│  │  bg-golf-green      │  │
│  │  rounded-2xl py-14  │  │
│  │                     │  │
│  │  Ready to Join      │  │
│  │  the Fairway?       │  │
│  │                     │  │
│  │  Start tracking...  │  │
│  │                     │  │
│  │  [Get Started →]    │  │
│  │                     │  │
│  └─────────────────────┘  │
│                           │
└───────────────────────────┘
```

**Specifications:**

```
Section:         py-24 px-6

Container:       max-w-4xl mx-auto

CTA card:        bg-golf-green rounded-2xl md:rounded-3xl
                 px-8 md:px-16 py-16 md:py-20
                 text-center

Headline:        text-3xl md:text-4xl font-bold text-white
                 mb-4
                 "Ready to Join the Fairway?"

Description:     text-lg text-white/80 max-w-lg mx-auto mb-10
                 "Start tracking your rounds and connect with
                  golfers who share your passion for the game."

CTA button:      inline-flex items-center gap-2
                 bg-white text-golf-green
                 text-base font-semibold
                 px-8 py-3.5 rounded-xl
                 hover:bg-gray-50
                 shadow-lg hover:shadow-xl
                 transition-all duration-200
                 Text: "Get Started — It's Free"
                 Icon: IconArrowRight h-5 w-5
```

**Copy Alternatives:**

| Headline                          | Subtext                                                          |
|-----------------------------------|------------------------------------------------------------------|
| "Ready to Join the Fairway?"      | "Start tracking your rounds and connect with golfers..."         |
| "Your Foursome is Waiting"        | "Join the community and start improving together."               |
| "Tee Up With Birdieboard"         | "Free to use. Built for golfers who love the game."              |

**Recommended:** "Ready to Join the Fairway?" — golf metaphor, warm invitation, not pushy.

---

## 9. Section 7: Footer

### File: `landing-footer.tsx`

**Visual Direction:** Simple, understated, trustworthy. A light gray background separates it from the content. Include OSC branding as required.

**Layout:**

```
DESKTOP
┌─────────────────────────────────────────────────────────────────┐
│  bg-gray-50 border-t border-gray-200                            │
│                                                                 │
│  [⛳ Birdieboard]              Features  About  Privacy  Terms  │
│  Track, play, improve.                                          │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  © 2026 Birdieboard. Built with Open Source Cloud.              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

MOBILE
┌───────────────────────────┐
│  bg-gray-50 border-t      │
│                           │
│  [⛳ Birdieboard]          │
│  Track, play, improve.    │
│                           │
│  Features                 │
│  About                    │
│  Privacy                  │
│  Terms                    │
│                           │
│  ───────────────────────  │
│                           │
│  © 2026 Birdieboard.      │
│  Built with Open Source   │
│  Cloud.                   │
│                           │
└───────────────────────────┘
```

**Specifications:**

```
Section:         bg-gray-50 border-t border-gray-200

Container:       max-w-6xl mx-auto px-6

Top row:         py-12
                 flex flex-col md:flex-row
                 md:items-start md:justify-between
                 gap-8

Logo area:
  Logo:          flex items-center gap-2
                 IconGolf h-6 w-6 text-golf-green
                 "Birdieboard" text-lg font-bold text-gray-900
  Tagline:       mt-2 text-sm text-gray-500
                 "Track, play, improve."

Links area:
  Container:     flex flex-wrap gap-x-8 gap-y-2
  Link:          text-sm text-gray-600
                 hover:text-golf-green transition-colors

Divider:         border-t border-gray-200

Bottom row:      py-6 text-center md:text-left
  Text:          text-sm text-gray-400
                 "© 2026 Birdieboard. Built with Open Source Cloud."
```

**Footer Links:**

```typescript
const footerLinks = [
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#' },       // placeholder
  { label: 'Privacy', href: '#' },      // placeholder
  { label: 'Terms', href: '#' },        // placeholder
];
```

---

## 10. Responsive Strategy

### Breakpoint Behavior

| Breakpoint | Tailwind | Navbar        | Hero         | Features    | Testimonials |
|------------|----------|---------------|--------------|-------------|--------------|
| < 640px    | default  | Logo + CTA    | Stacked, 1col| 1 column    | 1 column     |
| 640-767px  | `sm:`    | Logo + CTA    | Wider, 2 CTA | 1 column    | 1 column     |
| 768-1023px | `md:`    | Full nav      | Centered     | 2 columns   | 2 columns    |
| ≥ 1024px   | `lg:`    | Full nav      | Large hero   | 3 columns   | 3 columns    |

### Key Responsive Decisions

1. **Navbar:** On mobile, hide "Sign In" text link. "Get Started" button is always visible.
2. **Hero:** Single column always. Headline scales from `text-4xl` to `text-6xl`. Secondary CTA hidden on smallest screens.
3. **Social Proof:** 2-column grid on mobile (third stat wraps), 3-column on `md:`.
4. **Features:** Single column on mobile ensures each card gets full attention. 2-col on `md:`, 3-col on `lg:`.
5. **Testimonials:** Single column on mobile, 2-col on `md:`, 3-col on `lg:`. Show only 3 on `lg:`.
6. **CTA:** Padding reduces on mobile. `rounded-2xl` on mobile, `rounded-3xl` on desktop.
7. **Footer:** Stack vertically on mobile, horizontal on desktop.

### Max-Width Strategy

- Content areas: `max-w-6xl` (1152px) for grids, `max-w-4xl` (896px) for text-heavy sections
- All sections: `px-6` horizontal padding
- Hero text: `max-w-4xl` for headline, `max-w-2xl` for subheadline

---

## 11. Animation & Interaction

### Scroll-Triggered Animations

Use CSS-only animations where possible. If Framer Motion is used, keep it simple.

**Approach:** Intersection Observer-based fade-in for sections. Each section fades up slightly on scroll into view.

```
Animation:    opacity 0 → 1, translateY(20px) → 0
Duration:     500ms
Easing:       ease-out
Trigger:      When element enters viewport (50% threshold)
Stagger:      Cards in grids stagger by 100ms each
```

**Existing class to reuse:** The codebase already has `.animate-fade-in-up` in `globals.css`. This can be reused, but it triggers on mount, not on scroll. For scroll-triggered animations, either:
1. Use the existing class + Intersection Observer to add it when visible
2. Use Framer Motion's `whileInView` (already in the project deps)

**Recommended:** Use Framer Motion `whileInView` for the features grid and testimonials. Keep the hero animation as CSS (triggers on mount).

### Hover Interactions

| Element          | Hover Effect                                          |
|------------------|-------------------------------------------------------|
| Nav CTA button   | `bg-golf-fairway` (slightly lighter green)            |
| Feature cards    | `shadow-md`, border shifts to `border-golf-light/50`  |
| Testimonial card | Subtle `shadow-md` lift                               |
| Footer links     | Color shift to `text-golf-green`                      |
| Final CTA button | `bg-gray-50` + larger shadow                          |

### No Animation

- Social proof numbers: static, no counting animation (adds unnecessary JS complexity)
- Navbar: only the background transition on scroll (already described)
- No parallax, no floating elements, no particle effects

### Reduced Motion

Respect `prefers-reduced-motion` (already handled in `globals.css`). All Framer Motion animations should check for this preference.

---

## 12. Accessibility Notes

### WCAG 2.2 AA Compliance

**Color Contrast (must verify):**

| Combination                         | Expected Ratio | Passes? |
|-------------------------------------|----------------|---------|
| `text-gray-900` on `bg-white`       | ~17.1:1        | Yes     |
| `text-gray-600` on `bg-white`       | ~5.7:1         | Yes     |
| `text-golf-green` on `bg-white`     | ~5.8:1         | Yes     |
| `text-white` on `bg-golf-green`     | ~5.8:1         | Yes     |
| `text-white/80` on `bg-golf-green`  | ~4.6:1         | Check   |
| `text-gray-500` on `bg-gray-50`     | ~4.6:1         | Check   |

**Note:** `text-white/80` on `bg-golf-green` is borderline for AA large text but needs verification for normal body text. If it fails, bump to `text-white/90` or `text-white`.

**Semantic HTML:**

```
<header>           → Navbar
<main>             → Page content
  <section>        → Each content section with aria-labelledby
    <h2>           → Section titles (Features, Testimonials, etc.)
  <section>
<footer>           → Footer

<blockquote>       → Testimonial quotes
<nav>              → Footer links grouped in nav

All links:         Descriptive text, no "click here"
All images:        alt text describing content
CTA buttons:       <a> with role="button" or actual <Link>
```

**Focus Indicators:**

- All interactive elements must have visible focus rings
- Use Tailwind's `focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-2`
- Navbar links, CTA buttons, footer links all need focus styles

**Landmarks:**

- `<header>` — banner landmark
- `<main>` — main landmark
- `<footer>` — contentinfo landmark
- `<nav>` — navigation landmark (in header and footer)

**Skip Link:**

Add a visually hidden skip link at the very top of the page:
```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-golf-green focus:font-semibold">
  Skip to main content
</a>
```

---

## 13. CSS Changes Required

### What to Remove from globals.css

The following classes are only used by the current dark landing page and should be removed (or scoped) once the new landing page replaces it:

- `.aurora-bg` and `@keyframes aurora-shift` — dark aurora background
- `.glass-card` and `.glass-card-hover` — glassmorphism cards
- `.text-glow` and `@keyframes text-shimmer` — gradient text glow
- `.icon-glow` — icon glow filter
- `.gradient-border` — gradient border effect

**Important:** Do NOT remove these yet. They may be referenced elsewhere. Instead, add new light-theme button classes alongside the existing ones. The dark styles can be removed in a cleanup pass after the landing page is fully migrated and tested.

### New CSS Classes to Add

Add these to `globals.css` under a new section `/* ─── Landing Page (Light Theme) ─── */`:

```css
/* ─── Landing Page (Light Theme) ─── */
@layer components {
  .btn-landing-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background-color: #2D6A4F;
    color: #fff;
    font-weight: 600;
    padding: 0.875rem 2rem;
    border-radius: 0.75rem;
    border: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease-out;
    cursor: pointer;
    text-decoration: none;
  }

  .btn-landing-primary:hover {
    background-color: #40916C;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  .btn-landing-primary:active {
    transform: scale(0.98);
  }

  .btn-landing-primary-lg {
    padding: 1rem 2.5rem;
    font-size: 1.125rem;
  }

  .btn-landing-outline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: transparent;
    color: #2D6A4F;
    font-weight: 600;
    padding: 0.875rem 1.5rem;
    border-radius: 0.75rem;
    border: 2px solid rgba(45, 106, 79, 0.2);
    transition: all 0.2s ease-out;
    cursor: pointer;
    text-decoration: none;
  }

  .btn-landing-outline:hover {
    border-color: rgba(45, 106, 79, 0.4);
    background: rgba(45, 106, 79, 0.05);
    transform: translateY(-1px);
  }

  .btn-landing-outline:active {
    transform: scale(0.98);
  }

  .btn-landing-white {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: #fff;
    color: #2D6A4F;
    font-weight: 600;
    padding: 0.875rem 2rem;
    border-radius: 0.75rem;
    border: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease-out;
    cursor: pointer;
    text-decoration: none;
  }

  .btn-landing-white:hover {
    background: #f9fafb;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  .btn-landing-white:active {
    transform: scale(0.98);
  }
}
```

**Alternatively:** These button styles could be expressed purely with Tailwind utility classes inline (as shown in the section specs above) rather than custom CSS classes. The inline approach is recommended for this landing page since each button instance is unique and the page is simple. The CSS classes above are provided as a reference if the frontend-dev prefers extracting them.

### Focus Styles

Add universal focus-visible styles if not already present:

```css
/* Already using Tailwind's focus-visible utilities inline */
/* No additional CSS needed if using Tailwind classes */
```

---

## Design Rationale

### Why Light Theme?

1. **Trust and openness** — Light backgrounds communicate transparency and approachability
2. **Golf association** — Golf is played in daylight; bright greens, blue skies, and warm sand are the sport's visual language
3. **Strava precedent** — The most successful sports community app uses a clean, light design with bold accent colors
4. **Contrast with dashboard** — The dashboard uses dark mode for focused data viewing; the landing page should feel different — welcoming and public-facing

### Why No Glassmorphism?

1. **Dated aesthetic** — Glassmorphism peaked in 2021-2022 and is now associated with generic "AI-generated" designs
2. **Readability issues** — Blurred backgrounds reduce text contrast, especially on varied background colors
3. **Community disconnect** — Glass effects feel cold and technical; golf communities are warm and personal
4. **Performance** — `backdrop-filter: blur()` is GPU-intensive and can cause jank on older mobile devices

### Why Community-First Copy?

1. **Strava's success formula** — "Community-powered motivation" outperforms "feature-powered tracking"
2. **Golf is social** — Most golfers play in groups; the app should reflect that
3. **Retention** — Social features (friends, leaderboards, competitions) drive long-term engagement more than solo tracking
4. **Differentiation** — Most golf apps lead with GPS/tech features; Birdieboard leads with community

---

## Implementation Priority

1. **Phase 1:** Create component files, build static layout with placeholder content
2. **Phase 2:** Refine copy, add scroll animations, implement responsive behavior
3. **Phase 3:** Add hero image/screenshot, test accessibility, polish interactions
4. **Phase 4:** Remove old dark-theme landing CSS (after verification)

---

## Quick Reference: Tailwind Classes by Section

| Section       | Background        | Text Primary     | Text Secondary  | Accent             |
|---------------|-------------------|------------------|-----------------|---------------------|
| Navbar        | `bg-white/95`     | `text-gray-900`  | `text-gray-600` | `bg-golf-green`     |
| Hero          | `bg-white`        | `text-gray-900`  | `text-gray-600` | `bg-golf-green`     |
| Social Proof  | `bg-gray-50`      | `text-golf-green` | `text-gray-500` | —                   |
| Features      | `bg-white`        | `text-gray-900`  | `text-gray-600` | `bg-golf-green/10`  |
| Testimonials  | `bg-gray-50`      | `text-gray-900`  | `text-gray-700` | `bg-golf-green/20`  |
| Final CTA     | `bg-golf-green`   | `text-white`     | `text-white/80` | `bg-white`          |
| Footer        | `bg-gray-50`      | `text-gray-900`  | `text-gray-500` | `text-golf-green`   |
