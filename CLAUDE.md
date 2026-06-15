# DevStash

A developer knowledge hub for snippets, commands, prompots, notes, files, images, links and custom types. 

## Context Files

Read the following to tget the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> The import above is the single most important rule: this is a modified Next.js
> with breaking changes from public docs. Before writing any Next.js code, read
> the relevant guide under `node_modules/next/dist/docs/` (App Router docs live in
> `01-app/`). Do not rely on training-data knowledge of Next.js APIs.

## Stack

- Next.js 16.2.6 (App Router), React 19.2.4, TypeScript (strict)
- Tailwind CSS v4 — configured via PostCSS (`@tailwindcss/postcss`); `globals.css`
  pulls everything in with a single `@import "tailwindcss"` (no `tailwind.config`,
  no `@tailwind` directives)

## Commands

- `npm run dev` — dev server on **port 3333** (not 3000; the README is stale)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (flat config via `eslint-config-next`)
- `npm test` — Vitest unit tests (server actions + utilities only); watch: `npm run test:watch`

## Neon MCP

When using the Neon MCP for this project, ALWAYS target:

- Project: `devstash` (projectId: `fancy-pine-37054808`)
- Branch: `development` (branchId: `br-hidden-night-akzayhct`)

Pass `branchId: "br-hidden-night-akzayhct"` on every Neon call (run_sql,
get_database_tables, etc.).

### Production is off-limits

NEVER touch the `production` branch (`br-holy-frost-ak7wdano`) — no reads,
no writes, no schema inspection — unless I explicitly name "production" in my
request. Default to `development` for everything. If a task seems to require
production, STOP and ask me first.

NEVER run destructive SQL (DROP, DELETE, TRUNCATE, UPDATE/INSERT without my
go-ahead) — ask first, even on the development branch.

## Behavioral Guidelines

Guidelines to reduce common LLM coding mistakes.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
