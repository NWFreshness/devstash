# Current Feature

<!-- Feature Name -->

Seed Data

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

Create a seed script (`prisma/seed.ts`) to populate the database with sample data for development and demos. See @context/features/seed-spec.md.

- Demo user (demo@devstash.io, password hashed with bcryptjs 12 rounds, isPro false, emailVerified set)
- 7 system item types (snippet, prompt, command, note, file, image, link) with Lucide icon names + colors, isSystem true
- 5 collections with items: React Patterns (3 snippets), AI Workflows (3 prompts), DevOps (1 snippet, 1 command, 2 links), Terminal Commands (4 commands), Design Resources (4 links)
- Use real URLs for link items

## Notes

<!-- Any extra notes -->

- Wire up the seed in prisma.config.ts (`migrations.seed`) so `prisma db seed` runs it via tsx.
- Make the seed idempotent (upsert) so it can be re-run safely.

References:

- @context/features/seed-spec.md
- @context/project-overview.md
- @context/coding-standards.md
- @prisma/schema.prisma

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Initial Next.js and Tailwind setup
- Dashboard UI Phase 1: ShadCN init, /dashboard route, shell layout (top bar + sidebar/main placeholders), dark mode default
- Dashboard UI Phase 2: collapsible sidebar (shadcn) with type links, favorite/all collections, user footer, drawer toggle, mobile drawer
- Dashboard UI Phase 3: main area with 4 stat cards, recent collections grid, pinned items, and recent items list
- Prisma + Neon PostgreSQL: Prisma 7 (new prisma-client generator + Neon driver adapter), full schema with NextAuth models, prisma.config.ts, client singleton, initial migration
- Seed Data: emailVerified field + migration, bcryptjs, idempotent prisma/seed.ts (demo user, 7 system types, 5 collections, 18 items), wired into prisma.config.ts; test-db script displays seeded data
