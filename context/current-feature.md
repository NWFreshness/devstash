# Current Feature

<!-- Feature Name -->

Dashboard UI Phase 3

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

Phase 3 of 3 for the dashboard UI layout. See @context/features/dashboard-phase-3-spec.md.

- The main area to the right
- Recent collections
- Pinned items
- 10 recent items
- 4 stats cards at the top for number of items, collections, favorite items and favorite collections (not in screenshot)

## Notes

<!-- Any extra notes -->

Use mock data from @src/lib/mock-data.ts directly (import it) until the database is wired up.

References:

- @context/screenshots/dashboard-ui-main.png
- @context/project-overview.md
- @src/lib/mock-data.ts
- @context/features/dashboard-phase-1-spec.md
- @context/features/dashboard-phase-2-spec.md

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Initial Next.js and Tailwind setup
- Dashboard UI Phase 1: ShadCN init, /dashboard route, shell layout (top bar + sidebar/main placeholders), dark mode default
- Dashboard UI Phase 2: collapsible sidebar (shadcn) with type links, favorite/all collections, user footer, drawer toggle, mobile drawer
- Dashboard UI Phase 3: main area with 4 stat cards, recent collections grid, pinned items, and recent items list
