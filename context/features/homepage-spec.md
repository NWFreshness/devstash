# Homepage

## Overview

Build the public-facing homepage at `/` using the prototype in `prototypes/homepage/` as a visual reference. The page should be implemented with Next.js App Router server/client components, Tailwind CSS v4, and shadcn/ui primitives matching the rest of the app.

## Route

`src/app/(marketing)/page.tsx` — new `(marketing)` route group with its own layout (no dashboard shell). The existing `/dashboard` redirect from the root can move into middleware or the page itself (redirect authenticated users to `/dashboard`).

## Sections

### Navbar — server component
- Logo (⌗ DevStash), nav links (Features, Pricing), Sign In + Get Started buttons
- Sticky, background becomes opaque on scroll → needs a thin client wrapper (`NavbarClient`) for the scroll listener
- Sign In → `/sign-in`, Get Started → `/register`
- Mobile: hamburger toggle showing/hiding a dropdown menu (client)

### Hero — server component with client canvas
- Left: headline, subheadline, two CTAs (Get Started Free → `/register`, See Features → `#features`)
- Right: chaos canvas animation + arrow + dashboard mockup
  - `ChaosCanvas` client component (bouncing icons, mouse repel)
  - Dashboard mockup is static HTML/Tailwind — colored card borders matching item type colors from the project (`#3b82f6` snippet, `#f59e0b` prompt, `#06b6d4` command, `#22c55e` note, `#6366f1` url, `#ec4899` image)

### Features — server component
- Section heading + 6 feature cards in a responsive grid (1 col mobile, 2 col md, 3 col lg)
- Each card: accent-colored icon, title, description
- Cards: Code Snippets, AI Prompts, Instant Search, Commands, Files & Docs, Collections

### AI Section — server component
- Two-column layout: left (Pro badge, heading, checklist), right (code block mockup + AI tags demo)
- Code block is static Tailwind-styled `<pre>` (no Monaco, this is marketing)
- Checklist: Auto-tagging, AI Summaries, Explain Code, Prompt Optimizer

### Pricing — server component + client toggle
- `PricingToggle` client component: monthly/yearly billing toggle with animated thumb
  - Monthly: $8/mo | Yearly: $6/mo (billed $72/yr) with "Save 25%" badge
- Two plan cards: Free ($0) and Pro (price driven by toggle state)
- Free → Get Started → `/register`; Pro → Start Pro → `/register`
- Feature lists with ✓ / ✗ rows matching project's pricing matrix

### CTA — server component
- Centered heading + subtext + Get Started Free button → `/register`

### Footer — server component
- Logo + tagline left, three link columns right (Product, Company, Legal)
- Bottom bar with copyright year
- Placeholder `href="#"` for links that have no real destination yet (Changelog, About, Blog, Contact, Privacy, Terms)

## Component Structure

```
src/app/(marketing)/
  layout.tsx           # bare layout, no sidebar/topbar
  page.tsx             # composes all sections

src/components/marketing/
  navbar.tsx           # server shell
  navbar-client.tsx    # scroll opacity + mobile toggle (client)
  hero.tsx             # server shell
  chaos-canvas.tsx     # bouncing icons animation (client)
  features.tsx         # server
  ai-section.tsx       # server
  pricing.tsx          # server shell
  pricing-toggle.tsx   # billing toggle + price display (client)
  cta-section.tsx      # server
  footer.tsx           # server
```

## Scroll Animations

Simple fade-in-up on scroll using an `IntersectionObserver` in a single `src/components/marketing/scroll-animations.tsx` client component that adds a CSS class. Sections receive an `animate-on-scroll` data attribute; the observer adds `is-visible`. Define the keyframe in `globals.css`.

## Authenticated User Handling

If the user is already signed in (check via `auth()` in the root page server component), redirect to `/dashboard`. This replaces any existing root redirect.

## Notes

- No custom CSS files — all styling via Tailwind utilities and `globals.css` for the scroll keyframe
- Type accent colors are hardcoded constants in the marketing components (same hex values used in the dashboard)
- Chaos canvas animation: port `script.js` physics logic directly into `ChaosCanvas.tsx` using `useEffect` + `useRef` on a `<canvas>` element
- No shadcn components needed beyond `Button` (use shadcn `Button` for all CTAs) — avoid pulling in extra dependencies for a static marketing page
