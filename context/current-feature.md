# Current Feature

<!-- Feature Name -->

Dashboard Collections

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

Replace the dummy collection data displayed in the main area of the dashboard (right side) with actual data from the database. It should look how it does now with the 6 cards of recent collections, but instead of using data from @src/lib/mock-data.ts, it should be from our Neon database using Prisma.

Do not add the items underneath yet. We will do that later.

- Create `src/lib/db/collections.ts` with data fetching functions
- Fetch collections directly in server component
- Collection card border color derived from most-used content type in that collection
- Show small icons of all types in that collection
- Keep the current design (reference `@context/screenshots/dashboard-ui-main.png` if needed)
- Update collection stats display

## Notes

<!-- Any extra notes -->

References:

- @context/features/dashboard-collections-spec.md
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
