# Current Feature

<!-- Feature name goes here when active -->

## Status

Not Started

## Goals

<!-- Bullet points of what success looks like -->

## Notes

<!-- Additional context, constraints, or details from spec -->

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
- Audit Cleanup - Dashboard Data-Fetching & Display Fixes: DB helpers now accept `userId` (new `getDemoUser()` in src/lib/db/user.ts) so layout/page resolve the user once and pass it down (6 user.findUnique lookups per render reduced to 2); StatCards takes userId as a prop; formatDate uses UTC date methods to fix off-by-one display; sidebar footer shows the real seeded user and the hardcoded mock `currentUser`/`User` is removed; dashboard segment forced to dynamic rendering (`export const dynamic = "force-dynamic"`) so per-user DB data is never statically prerendered, fixing the `npm run build` prerender failure. Audit item 5 (PrismaNeon adapter) dropped; medium-severity items 2-4 excluded.
- Auth Setup - NextAuth + GitHub Provider (auth phase 1): Auth.js v5 (next-auth@5 beta) with @auth/prisma-adapter, using the split config pattern. `src/auth.config.ts` holds the edge-safe GitHub provider; `src/auth.ts` adds PrismaAdapter (reusing the Neon prisma singleton) + JWT session strategy with jwt/session callbacks exposing `user.id`; `src/app/api/auth/[...nextauth]/route.ts` exports GET/POST from handlers; `src/proxy.ts` (Next 16 renamed middleware, named `proxy` export) builds its own edge-safe auth from auth.config and redirects unauthenticated `/dashboard/*` to NextAuth's default sign-in page with a callbackUrl; `src/types/next-auth.d.ts` augments Session.user.id and JWT.id. AUTH_SECRET/AUTH_GITHUB_ID/AUTH_GITHUB_SECRET documented in .env.example. Build passes; verified redirect-to-signin and GitHub OAuth handoff (302 to github.com with correct client_id/redirect_uri). Note: a wedged Turbopack dev server can surface a misleading "Jest worker encountered child process exceptions" 500 on auth routes - restart the dev server to clear it.
