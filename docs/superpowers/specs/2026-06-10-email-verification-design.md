# Email Verification on Register — Design Spec

**Date:** 2026-06-10
**Status:** Approved

---

## Overview

After a user registers with email/password, they receive a verification email via Resend. They must click the link before they can access protected routes. GitHub OAuth users are auto-verified by Auth.js. Unverified users who sign in are redirected to a `/verify-email` holding page and blocked from `/dashboard` and `/profile` by the middleware.

---

## Approach

JWT flag + middleware gate. `emailVerified` is written into the JWT on sign-in; `proxy.ts` reads the flag and redirects unverified users to `/verify-email`. This enforces verification without blocking the sign-in step itself, giving users a clear recovery path (resend button).

---

## Data & Token Flow

**Schema:** No migration required. `User.emailVerified DateTime?` and `VerificationToken` (fields: `identifier`, `token`, `expires`) are already present.

**Registration:**
1. `POST /api/auth/register` creates the user (unchanged).
2. Generates a `crypto.randomUUID()` token.
3. Writes `VerificationToken { identifier: email, token, expires: now + 24h }`.
4. Sends a Resend email to the user with link: `https://<origin>/api/auth/verify-email?token=<token>&email=<email>`.
5. Returns 201; register form redirects to `/verify-email`.

**Verification link:**
- `GET /api/auth/verify-email?token=<token>&email=<email>`
- Looks up `VerificationToken` by `{ identifier: email, token }`.
- Returns 400 if not found or expired.
- Sets `User.emailVerified = new Date()`.
- Deletes the `VerificationToken` row (single-use).
- Redirects to `/sign-in?verified=true`.

**GitHub OAuth:** `PrismaAdapter` sets `User.emailVerified` automatically on first OAuth sign-in — no changes needed.

---

## JWT & Session

`auth.ts` — `jwt` callback reads `user.emailVerified` on first sign-in and writes it to the token:

```ts
jwt({ token, user }) {
  if (user) {
    token.id = user.id;
    token.emailVerified = user.emailVerified ?? null;
  }
  return token;
}
```

`src/types/next-auth.d.ts` — augment `JWT` with `emailVerified: Date | null`.

---

## Middleware Enforcement

`proxy.ts` — two sequential guards:

1. If `!req.auth` → redirect to `/sign-in` (unchanged).
2. If `!req.auth.token?.emailVerified` → redirect to `/verify-email`.

Matcher stays: `["/dashboard/:path*", "/profile"]`.

---

## API Routes

### `GET /api/auth/verify-email`
- Params: `token`, `email` (query string)
- Validates token exists and is not expired
- Sets `User.emailVerified`, deletes token
- Redirects to `/sign-in?verified=true`

### `POST /api/auth/resend-verification`
- Body: `{ email }`
- Checks user exists and is not already verified
- Deletes any existing `VerificationToken` for that email
- Creates new token (24h expiry)
- Sends Resend email
- Returns 200; no info leaked if email doesn't exist

---

## UI Pages

### `/verify-email`
- Uses existing `(auth)` centered-card layout (no auth required)
- Message: "Check your inbox — we sent a verification link to your email."
- "Resend verification email" button (prompts for email, calls `POST /api/auth/resend-verification`)
- Shows success/error feedback inline

### `/sign-in`
- Already handles `?registered=true`
- Add `?verified=true` case: toast "Email verified! You can now sign in."

### Register form
- On success: redirect to `/verify-email` (was `/sign-in?registered=true`)

---

## Dev Database

Existing test users (`creds-test@devstash.local`, `ui-test@devstash.local`) have `emailVerified = null` and will be blocked by the middleware. Fix via a one-off SQL update on the development branch:

```sql
UPDATE "User" SET "emailVerified" = NOW() WHERE email IN ('creds-test@devstash.local', 'ui-test@devstash.local');
```

Also update `prisma/seed.ts` to set `emailVerified: new Date()` on the demo user so future reseeds don't break.

---

## Dependencies

- `resend` npm package (not yet installed)
- `RESEND_API_KEY` — already in `.env`
- `RESEND_FROM` — needs a "from" address (e.g. `noreply@devstash.local` for dev, real domain for prod); add to `.env.example`

---

## Out of Scope

- Rate limiting on resend endpoint
- Email template styling (plain text is fine for now)
- Verification on email change
