# Stripe Integration — Phase 1: Core Infrastructure

## Overview

Install the Stripe SDK and wire up the foundational plumbing needed before any billing flows can work: the client singleton, DB helpers, session exposure of `isPro`, and a testable `usage-limits` module with unit tests. No API routes or UI in this phase.

## Requirements

- Install `stripe` npm package
- Create `src/lib/stripe.ts` singleton
- Create `src/lib/db/billing.ts` DB helpers
- Expose `isPro` on the JWT and session (auth.ts + type augmentation)
- Extract free-tier limit logic into `src/lib/usage-limits.ts` with Vitest unit tests
- Document Stripe env vars in `.env.example`

## Files to Create

1. `src/lib/stripe.ts` — Stripe SDK singleton + `STRIPE_PRICE_IDS` constant
2. `src/lib/db/billing.ts` — `getUserBilling`, `updateUserSubscription`, `getUserByStripeCustomerId`
3. `src/lib/usage-limits.ts` — pure functions `isAtItemLimit` and `isAtCollectionLimit`; no Prisma imports (takes counts as args so they're unit-testable)
4. `src/lib/usage-limits.test.ts` — Vitest unit tests for the above

## Files to Modify

1. `src/auth.ts` — JWT callback: sync `isPro` from DB on every token refresh; session callback: expose `session.user.isPro`
2. `src/types/next-auth.d.ts` — add `isPro: boolean` to `Session["user"]` and `JWT`
3. `.env.example` — add Stripe and `NEXT_PUBLIC_APP_URL` vars

## Key Details

### `src/lib/stripe.ts`

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
  typescript: true,
});

export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
} as const;
```

### `src/lib/usage-limits.ts`

Pure functions — no DB calls, no imports from Prisma. Callers are responsible for fetching the count.

```typescript
export const FREE_ITEM_LIMIT = 50;
export const FREE_COLLECTION_LIMIT = 3;

export function isAtItemLimit(isPro: boolean, itemCount: number): boolean {
  return !isPro && itemCount >= FREE_ITEM_LIMIT;
}

export function isAtCollectionLimit(isPro: boolean, collectionCount: number): boolean {
  return !isPro && collectionCount >= FREE_COLLECTION_LIMIT;
}
```

### `src/lib/usage-limits.test.ts`

Test all boundary conditions for both functions (at limit, below limit, above limit, pro user).

### Auth changes (`src/auth.ts`)

JWT callback — add DB sync after the initial `user` block:

```typescript
if (token.sub) {
  const dbUser = await prisma.user.findUnique({
    where: { id: token.sub },
    select: { isPro: true },
  });
  token.isPro = dbUser?.isPro ?? false;
}
```

Session callback — add:

```typescript
session.user.isPro = (token.isPro as boolean) ?? false;
```

## Environment Variables to Add

```bash
# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_MONTHLY="price_..."
STRIPE_PRICE_ID_YEARLY="price_..."

# App URL (used for Stripe redirect URLs)
NEXT_PUBLIC_APP_URL="http://localhost:3333"
```

## Testing

1. `npm install stripe` succeeds
2. `npm test` — new usage-limits tests pass; all existing tests remain green
3. `npm run build` passes with no type errors
4. `session.user.isPro` is accessible (TypeScript, no red squiggles) in a server component

## Notes

- The `isPro` DB sync on every JWT validation adds one `SELECT` per authenticated request. Acceptable cost for guaranteed consistency after webhook updates — no manual session refresh needed.
- `usage-limits.ts` is intentionally pure so it can be tested without mocking Prisma.
- The demo user (`getDemoUser()`) is still used for data queries; limit checks will also use `demoUser.id` for counts until multi-user data lands.
