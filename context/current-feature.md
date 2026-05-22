# Current Feature

<!-- Feature Name -->

Prisma + Neon PostgreSQL Setup

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

Set up Prisma ORM with Neon PostgreSQL (serverless). See @context/features/database-spec.md.

- Use Neon PostgreSQL (serverless)
- Create initial schema based on data models in @context/project-overview.md (this will evolve)
- Include NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes

## Notes

<!-- Any extra notes -->

- Use Prisma 7 (breaking changes) — read the upgrade guide before writing code: https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
- Setup reference: https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres
- Dev branch goes in DATABASE_URL, with a separate production branch. ALWAYS create migrations; never push directly unless specified.

References:

- @context/features/database-spec.md
- @context/project-overview.md
- @context/coding-standards.md

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Initial Next.js and Tailwind setup
- Dashboard UI Phase 1: ShadCN init, /dashboard route, shell layout (top bar + sidebar/main placeholders), dark mode default
- Dashboard UI Phase 2: collapsible sidebar (shadcn) with type links, favorite/all collections, user footer, drawer toggle, mobile drawer
- Dashboard UI Phase 3: main area with 4 stat cards, recent collections grid, pinned items, and recent items list
- Prisma + Neon PostgreSQL: Prisma 7 (new prisma-client generator + Neon driver adapter), full schema with NextAuth models, prisma.config.ts, client singleton, initial migration
