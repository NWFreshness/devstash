# Current Feature

<!-- Feature Name -->

Stats & Sidebar

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

Show the stats in the main area from the data in the database instead of the @src/lib/mock-data.ts file.

Show the system item types in the sidebar and the actual collection data from the database.

- Display stats pertaining to database data, keeping the current design/layout
- Display item types in sidebar with their icons, linking to `/items/[typename]`
- Add "View all collections" link under the collections list that goes to `/collections`
- Keep the star icons for favorite collections, but for recents each collection should show a colored circle based on the most-used item type in that collection
- Add database functions for stats and item types/sidebar collections (note: `src/lib/db/items.ts` already exists from the previous feature — extend it / add `src/lib/db/stats.ts` and `src/lib/db/item-types.ts` as needed; use `@src/lib/db/collections.ts` as reference)

## Notes

<!-- Any extra notes -->

References:

- @context/features/stats-sidebar-spec.md
- @src/lib/db/collections.ts
- @src/lib/db/items.ts
- @context/project-overview.md
- @context/coding-standards.md
- @prisma/schema.prisma
- @src/lib/mock-data.ts

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
