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
