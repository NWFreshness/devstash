# Item CRUD Architecture

A unified design for creating, reading, updating, and deleting all 7 item types
([snippet, prompt, command, note, file, image, link](./item-types.md)) without a
per-type explosion of routes, actions, or components. **One** mutation file, query
helpers in `lib/db`, **one** dynamic route, and shared components that adapt by type.

> **Status:** design proposal. No item CRUD exists yet — the dashboard is read-only
> against seeded data. This documents the target shape and grounds it in patterns
> already in the codebase.
>
> **Source-prompt corrections:** the prompt cited `docs/content-types.md` (actual file
> is [`docs/item-types.md`](./item-types.md)) and `src/lib/constants.tsx` (does not
> exist — type metadata lives in [`prisma/seed.ts`](../prisma/seed.ts) for the DB and
> [`src/lib/mock-data.ts`](../src/lib/mock-data.ts) for the UI fallback).

---

## Guiding principles (from the codebase, not invented)

1. **Queries are direct, mutations go through actions.** Per
   [`context/coding-standards.md`](../context/coding-standards.md): server components
   fetch with Prisma directly; client components mutate via Server Actions. The
   existing read path already does this — `dashboard/page.tsx` calls `lib/db`
   helpers directly. Item CRUD adds the missing **write** path as Server Actions.
2. **`lib/db` returns shaped DTOs, not raw Prisma rows.** See
   [`src/lib/db/items.ts`](../src/lib/db/items.ts): a `shape()` maps the Prisma row to
   an `ItemWithMeta` interface (flattening `tags`, selecting only needed `type`
   fields). New queries follow the same shape-and-return pattern.
3. **Every query/mutation is `userId`-scoped.** All `Item` indexes are `userId`-first.
   Reads take a `userId` param (already the convention); writes resolve the user from
   the session (`auth()`) and never trust a client-supplied owner.
4. **One job per component.** Type-specific rendering/editing is isolated in small
   per-type components; the shared shell never grows a 7-way `if`.

---

## File structure

```
src/
├── actions/
│   └── items.ts                 # ALL item mutations (create/update/delete/toggles)
├── lib/
│   ├── db/
│   │   └── items.ts             # ALL item queries (extend existing file)
│   └── validations/
│       └── item.ts              # Zod schemas (one base + per-type refinements)
├── app/
│   └── dashboard/
│       └── items/
│           ├── [type]/
│           │   └── page.tsx     # list view, filtered by type slug
│           └── [type]/[id]/
│               └── page.tsx     # detail / editor view (optional, see Routing)
└── components/
    └── items/
        ├── item-list.tsx        # renders ItemRow[] (reuses dashboard/item-row)
        ├── item-form.tsx        # shared create/edit shell; dispatches by type
        ├── item-actions.tsx     # client: favorite/pin/delete buttons → actions
        └── fields/
            ├── text-fields.tsx  # snippet/prompt/command/note (content + language)
            ├── file-fields.tsx  # file/image (upload → fileUrl/fileName/…)
            └── url-fields.tsx   # link (url)
```

Three rules this layout encodes:

- **Mutations live in exactly one file** — `src/actions/items.ts`. No `actions/items/`
  subfolder, no per-type action files.
- **Queries live in exactly one file** — extend the existing
  [`src/lib/db/items.ts`](../src/lib/db/items.ts) rather than adding `items-by-type.ts`.
- **Type-specific code lives only under `components/items/fields/`** — actions and
  queries stay type-agnostic.

---

## `lib/db` — data fetching (called directly from server components)

Extend [`src/lib/db/items.ts`](../src/lib/db/items.ts). It already exports
`ItemWithMeta`, `getRecentItems`, `getPinnedItems`, `getItemTypeCounts`. Add:

```ts
// List view: items of one type for a user (null userId → [])
export async function getItemsByType(
  userId: string | null,
  typeSlug: string,
  opts?: { collectionId?: string; q?: string },
): Promise<ItemWithMeta[]>;

// Detail/edit view: a single owned item with full content union
export async function getItemForEdit(
  userId: string | null,
  id: string,
): Promise<ItemDetail | null>;   // includes content, language, url, file* fields

// Resolve a type slug → ItemType row (for the page header + form defaults)
export async function getSystemType(slug: string): Promise<ItemTypeMeta | null>;
```

- `getItemsByType` reuses the existing `shape()` and `include` (type + tags). Filter
  is `where: { userId, type: { slug: typeSlug } }`, ordered by `createdAt desc` (or
  `lastUsedAt`).
- `getItemForEdit` returns a **wider** DTO (`ItemDetail`) than `ItemWithMeta` because
  the editor needs `content`, `language`, `url`, and the file group — the list does
  not. Keep the list DTO lean.
- All take `userId | null` and short-circuit to `[]`/`null`, matching the current
  helpers so pages stay uniform.

Server components call these directly:

```tsx
// app/dashboard/items/[type]/page.tsx
const items = await getItemsByType(userId, type);
```

---

## `actions/items.ts` — mutations (one file, type-agnostic)

Server Actions following the project's `{ success, data?, error? }` convention
(from `coding-standards.md`) and the auth/validate/scope pattern already used by
[`api/profile/change-password/route.ts`](../src/app/api/profile/change-password/route.ts):

```ts
"use server";

export async function createItem(input: CreateItemInput): Promise<ActionResult<{ id: string }>>;
export async function updateItem(id: string, input: UpdateItemInput): Promise<ActionResult>;
export async function deleteItem(id: string): Promise<ActionResult>;
export async function toggleFavorite(id: string): Promise<ActionResult>;
export async function togglePinned(id: string): Promise<ActionResult>;
```

Each action does the same four steps, **none of which branch on type**:

1. **Authenticate** — `const session = await auth();` → reject if no `session.user.id`.
2. **Validate** — `itemSchema.safeParse(input)` (Zod, see below). The schema, not the
   action body, enforces type-specific field requirements.
3. **Scope every write to the owner** — `where: { id, userId: session.user.id }` on
   update/delete/toggle so a user can never mutate another user's item. On create,
   set `userId` from the session and `typeId` by looking up the submitted type slug.
4. **Revalidate** — `revalidatePath("/dashboard/items/[type]")` (and the item detail
   path) so the server-rendered list refreshes.

Why type logic stays **out** of actions: the only type-dependent thing a mutation
does is decide *which columns are non-null* (`content`/`language` vs `fileUrl`/… vs
`url`). That decision is data, not control flow — the validated payload already
carries exactly the right fields, so the action just spreads it into
`prisma.item.create/update`. `contentType` (`"text"` | `"file"`) is derived from the
type slug in the validation layer (file/image → `"file"`, everything else → `"text"`),
per [`docs/item-types.md`](./item-types.md#classification-text-vs-file-vs-url).

### Validation (`lib/validations/item.ts`)

One base schema + a discriminated union on type, mirroring the existing Zod style in
[`lib/validations/auth.ts`](../src/lib/validations/auth.ts):

```ts
const base = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  typeSlug: z.enum(["snippet","prompt","command","note","file","image","link"]),
  collectionId: z.string().optional(),
  tags: z.array(z.string()).default([]),
});
// refined per class: text → content required; link → url required (z.url());
// file/image → fileUrl/fileName/mimeType required.
```

This is the **single place** type-specific required-field rules live for writes.

---

## Routing — how `/items/[type]` works

The sidebar already links to **`/items/${type.slug}`**
([`app-sidebar.tsx:93`](../src/components/dashboard/app-sidebar.tsx#L93)), one entry per
system type. A single dynamic segment `[type]` serves all 7:

```
/dashboard/items/snippet     → page.tsx with params.type = "snippet"
/dashboard/items/prompt      → params.type = "prompt"
/dashboard/items/link        → params.type = "link"   … etc.
```

`app/dashboard/items/[type]/page.tsx`:

1. Resolve the user (session or, currently, `getDemoUser()`), read `params.type`.
2. `getSystemType(params.type)` → if null, `notFound()` (guards bad slugs).
3. `getItemsByType(userId, params.type)` → render `<ItemList items={…} />`.
4. Header uses the type's name/icon/color via `typeIcon()/typeColor()`
   ([`type-icons.ts`](../src/components/dashboard/type-icons.ts)).

Optional detail/editor: `app/dashboard/items/[type]/[id]/page.tsx` for full-screen
view/edit (the spec's "full-screen editor"). Create can be a dedicated
`.../[type]/new` page or a modal launched from the list — either way it renders the
same `<ItemForm />`.

> **Two real gaps to resolve when implementing** (both present today):
>
> 1. **Shell + auth placement.** The sidebar links to top-level `/items/[slug]`, but
>    the dashboard shell (sidebar + top bar) lives in
>    [`app/dashboard/layout.tsx`](../src/app/dashboard/layout.tsx) and the proxy auth
>    matcher only covers `["/dashboard/:path*", "/profile"]`
>    ([`proxy.ts:22`](../src/proxy.ts#L22)). A top-level `/items/*` route would render
>    **without** the sidebar **and without** auth protection. **Recommendation:** put
>    item routes under the dashboard segment (`/dashboard/items/[type]`, as above) so
>    they inherit both the shell and the matcher, and update the sidebar `href` to
>    `/dashboard/items/${slug}`. (Alternative: introduce a shared `(app)` route group
>    holding the shell for both `dashboard` and `items`, and extend the proxy matcher
>    to `/items/:path*` — more moving parts.)
> 2. **`force-dynamic`.** The dashboard layout sets `export const dynamic =
>    "force-dynamic"`; nesting item routes under it inherits that, which is what we
>    want for per-user data.

---

## Where type-specific logic lives — components, not actions

| Concern | Type-agnostic? | Where |
|---|---|---|
| Auth, ownership scoping, revalidation | ✅ agnostic | `actions/items.ts` |
| Required-field rules per type | ⚠️ data-driven | `lib/validations/item.ts` (discriminated union) |
| Queries (list/detail) | ✅ agnostic | `lib/db/items.ts` |
| Routing | ✅ agnostic (one `[type]`) | `app/dashboard/items/[type]/` |
| **Rendering & input controls per type** | ❌ type-specific | `components/items/fields/*` |

The shared `<ItemForm>` renders common fields (title, description, tags, collection)
and then **switches once** on the type's content class to mount the right field group:

```tsx
// components/items/item-form.tsx (sketch)
{class === "text" && <TextFields ... />}   // snippet/prompt/command/note
{class === "file" && <FileFields ... />}   // file/image
{class === "url"  && <UrlFields ... />}    // link
```

This is the **only** place a type branch exists, and it is in a presentational
component — exactly the prompt's intent ("type-specific logic lives in components,
not actions"). Adding a future custom type means adding a field group, not touching
actions or queries.

---

## Component responsibilities

| Component | Server/Client | Responsibility |
|---|---|---|
| `items/[type]/page.tsx` | Server | Resolve user + type, call `lib/db`, render header + `ItemList`. No mutations. |
| `items/[type]/[id]/page.tsx` | Server | Fetch one item via `getItemForEdit`, render `ItemForm` in edit mode. |
| `item-list.tsx` | Server | Map items → `ItemRow` (reuse existing [`dashboard/item-row.tsx`](../src/components/dashboard/item-row.tsx)). Empty state. |
| `item-row.tsx` (existing) | Server | Display one item: type icon/color, title, pin/star, type badge + tags, date. **Already built.** |
| `item-form.tsx` | Client | Common fields + one switch on content class → field group. Calls `createItem`/`updateItem`, shows toast (Sonner) + redirect on result. |
| `fields/text-fields.tsx` | Client | `content` editor (+ `language` select for snippet/command). Markdown for note/prompt. |
| `fields/file-fields.tsx` | Client | Upload widget → presigned R2 URL; sets `fileUrl/fileName/fileSize/mimeType`. (file = Pro) |
| `fields/url-fields.tsx` | Client | Single `url` input with validation. |
| `item-actions.tsx` | Client | Favorite / pin / delete buttons → `toggleFavorite`/`togglePinned`/`deleteItem`; delete uses the existing `alert-dialog` pattern from [`profile/delete-account-section.tsx`](../src/components/profile/delete-account-section.tsx). |

Display differences per type are driven by the type's `icon`/`color` (already wired
through `type-icons.ts`) and the chosen field group — no per-type list or row
components are needed.

---

## End-to-end flow (create a snippet)

```
User on /dashboard/items/snippet clicks "New"
  → <ItemForm typeSlug="snippet"> (client)
      common fields + <TextFields> (content + language)
  → submit → createItem({ typeSlug:"snippet", title, content, language, tags })  [action]
      auth() → itemSchema.safeParse → prisma.item.create({ userId, typeId, contentType:"text", ... })
      revalidatePath("/dashboard/items/snippet")
  → toast success, redirect to list (or detail)
  → server component re-fetches via getItemsByType → ItemRow shows the new snippet
```

The same path serves a `link` (UrlFields, `contentType:"text"`, `url` set) or an
`image` (FileFields, `contentType:"file"`, file metadata set) with **zero** changes to
the action or the query — only the field group differs.

---

## Sources

- [`context/project-overview.md`](../context/project-overview.md) — API surface, folder structure, Server-Action guidance.
- [`docs/item-types.md`](./item-types.md) — the 7 types, content classification, shared columns.
- [`prisma/schema.prisma`](../prisma/schema.prisma) — `Item`/`ItemType` shape, `userId`-scoped indexes.
- [`src/lib/db/items.ts`](../src/lib/db/items.ts) — existing query + `shape()` DTO pattern to extend.
- [`src/lib/validations/auth.ts`](../src/lib/validations/auth.ts) — Zod schema style to mirror.
- [`src/app/api/profile/change-password/route.ts`](../src/app/api/profile/change-password/route.ts) — auth → validate → scope → mutate pattern.
- [`src/components/dashboard/item-row.tsx`](../src/components/dashboard/item-row.tsx) / [`type-icons.ts`](../src/components/dashboard/type-icons.ts) — existing display component + icon/color resolution to reuse.
- [`src/app/dashboard/layout.tsx`](../src/app/dashboard/layout.tsx) / [`src/proxy.ts`](../src/proxy.ts) — shell + auth-matcher placement that constrains where item routes must live.
