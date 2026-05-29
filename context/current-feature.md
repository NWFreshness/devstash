# Current Feature

Audit Cleanup: Dashboard Data-Fetching & Display Fixes

## Status

In Progress

## Goals

Address findings from the full-codebase audit. Four items:

1. Eliminate redundant user-lookup queries (High severity, medium risk to fix)
   - Each DB helper independently resolves the demo user by email before its real
     query, so a single dashboard render fires 6 identical `user.findUnique`
     lookups (2 from layout, 3 from page, 1 from StatCards).
   - Files: src/lib/db/collections.ts:37, :80; src/lib/db/items.ts:47, :69, :96, :135
   - Fix: have each helper accept `userId: string` as a parameter; call
     `getDemoUserId()` once at the layout/page level and pass it down. Update call
     sites in layout.tsx, page.tsx, and stat-cards.tsx.

5. Move `PrismaNeon` adapter inside the singleton guard (Low risk) — DROPPED
   - Adapter is recreated on every hot-reload; no fail-fast if `DATABASE_URL` is unset.
   - File: src/lib/prisma.ts:13
   - Dropped: the fail-fast `throw` broke `npm run build` — the production build
     evaluates the prisma module during the "Collecting page data" phase where
     `DATABASE_URL` is not present in the env, so the assertion threw and failed
     the build. Without the throw, moving the adapter into a function is
     functionally identical to the original (only avoids adapter recreation on dev
     hot-reload), so it had no real benefit. prisma.ts is left unchanged.

6. Fix `formatDate` timezone handling (Low risk)
   - `getMonth()`/`getDate()` use server-local timezone on UTC dates, causing
     off-by-one display for users west of UTC.
   - File: src/components/dashboard/item-row.tsx:14-16
   - Fix: use `toLocaleDateString("en-US", { month: "short", day: "numeric" })`
     or the UTC date methods for consistency with the stored value.

7. Show real user identity in sidebar footer (Low risk)
   - Footer renders hardcoded "John Doe" / "john@example.com" from mock-data while
     the rest of the dashboard shows the seeded `demo@devstash.io` user.
   - File: src/components/dashboard/app-sidebar.tsx:176-188
   - Fix: pass the display user (name, email, image) as a prop from DashboardLayout,
     sourced from the same `getDemoUserId` lookup; remove the mock-data import.

## Notes

Items numbered to match the original audit report (1, 5, 6, 7). Item 1 is High
severity but medium risk to fix; items 5-7 are low risk. Audit Medium-severity
items 2-4 (Promise.all in getItemTypeCounts, dead code in type-icons.ts, missing
`@@index([userId, isPinned])`) are intentionally excluded from this feature.

Run `npm run build` and verify in the browser before committing.

Build status: `npm run build` passes. The earlier prerender failure on
`/dashboard` (`prisma:error undefined`) was caused by Next.js statically
prerendering the page at build time, which ran the Prisma queries against a DB
that is not reachable during the build. Fixed by adding
`export const dynamic = "force-dynamic"` to `src/app/dashboard/layout.tsx`, which
makes the whole dashboard segment render on demand (it is per-user, DB-backed
data that should never be prerendered). `/dashboard` now builds as `ƒ (Dynamic)`.
Lint is clean for all changed files; the one lint error (src/hooks/use-mobile.ts)
is pre-existing shadcn code, untouched here.

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Initial Next.js and Tailwind setup
- Dashboard UI Phase 1: ShadCN init, /dashboard route, shell layout (top bar + sidebar/main placeholders), dark mode default
- Dashboard UI Phase 2: collapsible sidebar (shadcn) with type links, favorite/all collections, user footer, drawer toggle, mobile drawer
- Dashboard UI Phase 3: main area with 4 stat cards, recent collections grid, pinned items, and recent items list
- Prisma + Neon PostgreSQL: Prisma 7 (new prisma-client generator + Neon driver adapter), full schema with NextAuth models, prisma.config.ts, client singleton, initial migration
- Seed Data: emailVerified field + migration, bcryptjs, idempotent prisma/seed.ts (demo user, 7 system types, 5 collections, 18 items), wired into prisma.config.ts; test-db script displays seeded data
- Dashboard Collections: replaced mock collection grid with Prisma-backed data (src/lib/db/collections.ts), collection card border + folder color derived from most-used type, small icons for all types in collection, extended type-icons map for seeded icon names
- Dashboard Items: replaced mock pinned + recent item lists with Prisma-backed data (src/lib/db/items.ts), item row icon/border derived from item type, type slug rendered as colored badge alongside tag badges, pinned section hidden when empty
- Stats & Sidebar: stat cards driven by DB counts (getDashboardStats), sidebar item types via getItemTypeCounts with per-user counts and links to /items/[slug], sidebar collections via getSidebarCollections (favorites with folder/star, recents with primary-type colored circle), added "View all collections" link to /collections
- Add Pro Badge to Sidebar: subtle uppercase PRO badge (ShadCN Badge, secondary variant) rendered next to the file and image item types in the sidebar via a PRO_TYPE_SLUGS set, signaling Pro-only features
