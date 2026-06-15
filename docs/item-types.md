# Item Types

DevStash ships **7 built-in (system) item types**. Every `Item` belongs to exactly
one `ItemType` via `Item.typeId`. Pro users may also define custom types
(`ItemType.userId` set, `isSystem = false`), but those are out of scope here.

> **Source note:** The research prompt pointed at `src/lib/constants.tsx`, which does
> not exist. The authoritative type data lives in two places that currently
> **disagree** on icons and colors:
>
> - **`prisma/seed.ts`** — the values actually written to the database (`ItemType.icon`, `ItemType.color`).
> - **`src/lib/mock-data.ts`** (`itemTypes`) — a legacy UI list used only as a fallback by `src/components/dashboard/type-icons.ts`.
>
> See [Icon & color discrepancy](#icon--color-discrepancy) below. Where they differ,
> the **DB-seeded** values are what the app stores and should be treated as canonical.

---

## The 7 types

### 1. Snippet (`snippet`)

- **Display name:** Snippets
- **Icon (DB):** `Code` · **Icon (mock):** `Code`
- **Color (DB):** `#3b82f6` (blue) · **Color (mock):** `#2dd4bf` (teal)
- **Purpose:** Reusable code blocks with syntax highlighting.
- **Key fields:** `content` (text), `language` (e.g. `typescript`, `tsx`, `dockerfile`), `description`. `contentType = "text"`.

### 2. Prompt (`prompt`)

- **Display name:** Prompts
- **Icon (DB):** `Sparkles` · **Icon (mock):** `MessageSquare`
- **Color (DB):** `#8b5cf6` (violet) · **Color (mock):** `#a78bfa` (light violet)
- **Purpose:** LLM prompts and prompt chains (often with `{{placeholder}}` templating).
- **Key fields:** `content` (text), `description`. `language` typically unused. `contentType = "text"`.

### 3. Command (`command`)

- **Display name:** Commands
- **Icon (DB):** `Terminal` · **Icon (mock):** `Terminal`
- **Color (DB):** `#f97316` (orange) · **Color (mock):** `#fb923c` (light orange)
- **Purpose:** Terminal / CLI commands.
- **Key fields:** `content` (the command string), `language` (usually `bash`), `description`. `contentType = "text"`.

### 4. Note (`note`)

- **Display name:** Notes
- **Icon (DB):** `StickyNote` · **Icon (mock):** `FileText`
- **Color (DB):** `#fde047` (yellow) · **Color (mock):** `#60a5fa` (blue)
- **Purpose:** Markdown notes and docs.
- **Key fields:** `content` (markdown text), `description`. `contentType = "text"`.

### 5. File (`file`) — Pro

- **Display name:** Files
- **Icon (DB):** `File` · **Icon (mock):** `Paperclip`
- **Color (DB):** `#6b7280` (gray) · **Color (mock):** `#f472b6` (pink)
- **Purpose:** Uploaded files (PDFs, zips, templates). Pro-only feature.
- **Key fields:** File metadata — `fileUrl`, `fileName`, `fileSize`, `mimeType` (Cloudflare R2). `contentType = "file"`. `content` is null.

### 6. Image (`image`)

- **Display name:** Images
- **Icon (DB):** `Image` · **Icon (mock):** `Image`
- **Color (DB):** `#ec4899` (pink) · **Color (mock):** `#4ade80` (green)
- **Purpose:** Screenshots, diagrams. Available on the Free tier.
- **Key fields:** File metadata — `fileUrl`, `fileName`, `fileSize`, `mimeType`. `contentType = "file"`.

### 7. Link / URL (`link`)

- **Display name:** Links
- **Icon (DB):** `Link` · **Icon (mock):** `Link`
- **Color (DB):** `#10b981` (emerald) · **Color (mock):** `#38bdf8` (sky)
- **Purpose:** Bookmarks and references.
- **Key fields:** `url`, `description`. `contentType = "text"`; `content` unused.

> The project overview labels this type **URL** (icon 🔗); the codebase uses the
> slug **`link`** everywhere (seed, mock-data, type-icons). Treat them as the same type.

---

## Classification: text vs file vs URL

`Item.contentType` is a free-form string column holding `"text"` or `"file"`. It
determines where an item's payload lives, independent of the type's slug.

| Class | `contentType` | Payload fields | Types |
|---|---|---|---|
| **Text** | `"text"` | `content` (+ `language` for snippets) | snippet, prompt, command, note |
| **File** | `"file"` | `fileUrl`, `fileName`, `fileSize`, `mimeType` | file, image |
| **URL** | `"text"` | `url` | link |

Notes:

- The seed script writes **`contentType = "text"` for every seeded item**, including `link` items. URL items are therefore a text-class item whose payload is the `url` column, not `content`.
- File-class items (file, image) are the only ones that set `contentType = "file"` and populate the R2 metadata columns. `file` is Pro-only; `image` is Free.
- There is no separate `url`/`image`/`file` enum — classification is derived from `contentType` plus which columns are populated.

---

## Shared properties

Every item, regardless of type, carries the same `Item` columns
([`prisma/schema.prisma`](../prisma/schema.prisma)):

- **Identity & metadata:** `id`, `title`, `description`, `createdAt`, `updatedAt`, `lastUsedAt`.
- **Flags:** `isFavorite`, `isPinned` (both default `false`).
- **Relations:** `userId` (owner, cascade delete), `typeId` (→ `ItemType`), `collectionId` (optional, `SetNull` on delete), `tags` (many-to-many via `ItemTag`).
- **Content union:** `contentType`, `content`, `language`, `url`, and the file group (`fileUrl`, `fileName`, `fileSize`, `mimeType`) — all nullable; which ones are used depends on the type.

Indexes are all `userId`-scoped (`userId`, `userId+typeId`, `userId+collectionId`,
`userId+isFavorite`, `userId+lastUsedAt`), reflecting that every query is per-user.

---

## Display differences

Icon and color come from the item's type, resolved in
[`src/components/dashboard/type-icons.ts`](../src/components/dashboard/type-icons.ts):

- `typeIcon(slug)` maps a type slug → icon name → Lucide component, falling back to `Folder`.
- `typeColor(slug)` maps a type slug → hex color, falling back to `var(--muted-foreground)`.
- Both lookups are built from `itemTypes` in `mock-data.ts`, **not** from the DB-seeded `ItemType` rows.

Per-type rendering intent:

- **Snippet / command** — render `content` as code with syntax highlighting (Shiki), keyed off `language`.
- **Note / prompt** — render `content` as markdown / plain text.
- **Link** — render `url` as a clickable bookmark (title + description + external link).
- **Image** — render the uploaded asset inline from `fileUrl`.
- **File** — render a download affordance using `fileName` / `fileSize` / `mimeType` (Pro).
- In the sidebar, `file` and `image` carry a **PRO** badge driven by a `PRO_TYPE_SLUGS` set, signaling Pro-gated upload features.

---

## Icon & color discrepancy

`prisma/seed.ts` and `src/lib/mock-data.ts` define **different icons and colors** for
the same slugs. Because `type-icons.ts` derives display values from `mock-data.ts`,
the UI currently renders the **mock** icon/color even though the DB stores the
**seed** values.

| Slug | Icon (DB / seed) | Icon (mock / UI) | Color (DB / seed) | Color (mock / UI) |
|---|---|---|---|---|
| snippet | `Code` | `Code` | `#3b82f6` | `#2dd4bf` |
| prompt | `Sparkles` | `MessageSquare` | `#8b5cf6` | `#a78bfa` |
| command | `Terminal` | `Terminal` | `#f97316` | `#fb923c` |
| note | `StickyNote` | `FileText` | `#fde047` | `#60a5fa` |
| file | `File` | `Paperclip` | `#6b7280` | `#f472b6` |
| image | `Image` | `Image` | `#ec4899` | `#4ade80` |
| link | `Link` | `Link` | `#10b981` | `#38bdf8` |

Only `snippet`, `command`, `image`, and `link` agree on icon; **no** slug agrees on
color. This is worth reconciling — a single source of truth for type icon/color
(ideally the DB rows) would remove the divergence.

---

## Sources

- [`context/project-overview.md`](../context/project-overview.md) — type catalog, Free/Pro matrix, data model.
- [`prisma/schema.prisma`](../prisma/schema.prisma) — `Item` / `ItemType` columns and indexes.
- [`prisma/seed.ts`](../prisma/seed.ts) — DB-seeded system types (canonical icon/color) and sample items.
- [`src/lib/mock-data.ts`](../src/lib/mock-data.ts) — `itemTypes` UI list (display names, fallback icon/color).
- [`src/components/dashboard/type-icons.ts`](../src/components/dashboard/type-icons.ts) — `typeIcon()` / `typeColor()` resolution.
