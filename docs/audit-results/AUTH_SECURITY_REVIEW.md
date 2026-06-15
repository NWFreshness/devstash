# Auth Security Review

**Last audit:** 2026-06-10  
**Auditor:** auth-auditor subagent  
**Scope:** Credentials provider, email verification, password reset, profile mutations, session validation

---

## Critical

None found.

---

## High

### No rate limiting on sensitive authentication endpoints

- **File:** `src/app/api/auth/register/route.ts`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/resend-verification/route.ts`; credentials `authorize` in `src/auth.ts`
- **Line(s):** All POST handlers — no rate-limiting code present in any file
- **Issue:** None of the sensitive endpoints implement rate limiting or throttling. An attacker can enumerate passwords against the credentials `authorize` handler at full database query speed, issue unlimited password reset emails to exhaust Resend's sending quota, or flood the register endpoint to create junk accounts. The project spec notes Upstash Redis as the intended rate-limiting backend; it is not yet wired up.
- **Fix:** Add an IP-based (and optionally email-based) rate limiter using the Upstash Redis `@upstash/ratelimit` package in front of at minimum: `POST /api/auth/register` (e.g., 5 per hour per IP), `POST /api/auth/forgot-password` (e.g., 3 per hour per IP+email), and `POST /api/auth/resend-verification` (e.g., 3 per hour per IP). Auth.js credentials sign-in can be rate-limited at the middleware layer before the request reaches `authorize`.
- **Risk to fix:** medium

---

## Medium

### Register endpoint leaks email existence (user enumeration)

- **File:** `src/app/api/auth/register/route.ts`
- **Line(s):** 21-24
- **Issue:** When an email is already registered, the endpoint returns HTTP 409 with the message "A user with this email already exists." This allows an unauthenticated attacker to enumerate which email addresses are registered by submitting registration requests and observing the response code and body. All other auth endpoints (forgot-password, resend-verification) correctly return 200 regardless of whether the email exists.
- **Fix:** Return HTTP 200 with a generic response such as `{ success: true }` when a duplicate email is detected, and send a transactional email to the address informing the owner that someone attempted to register with it (common pattern). Alternatively, return 409 but with a generic message like "If this address is not already registered, your account has been created." The client-side UX can remain the same (redirect to `/verify-email`).
- **Risk to fix:** low

### `change-password` route does not guard against malformed JSON body

- **File:** `src/app/api/profile/change-password/route.ts`
- **Line(s):** 16
- **Issue:** `const body = await req.json()` is called without a `.catch()` guard. If the request body is not valid JSON (e.g., empty body, mangled content-type), `req.json()` throws an unhandled exception, causing the route to return a 500 Internal Server Error rather than a 400. Every other auth route in the project uses `req.json().catch(() => null)` followed by a null check. This is an inconsistency that results in unnecessary 500 responses and may leak stack traces in non-production environments.
- **Fix:** Change line 16 to `const body = await req.json().catch(() => null);` and add a null check: `if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });` — matching the pattern used in every other route.
- **Risk to fix:** low

### Password reset token claim is not a single atomic database operation

- **File:** `src/app/api/auth/reset-password/route.ts`
- **Line(s):** 21-27
- **Issue:** The code performs a `findFirst` followed by a separate `delete`. Although the comment reads "delete-first atomicity," the two-step sequence is not a single atomic operation. In a high-concurrency scenario both requests can pass the `findFirst` check concurrently; only the second `delete` will fail, so double-use is functionally prevented in practice. However, the correct and idiomatic pattern for single-use token claim is a single `delete` call (as done correctly in `src/app/api/auth/verify-email/route.ts`), which is genuinely atomic: if the record does not exist the call throws and the handler returns 400, with no intermediate read that could be observed by a concurrent request. The current pattern also requires the `findFirst` to locate the identifier (since only the token value is known), which is the reason for the two-step approach — but this can be resolved by including the `reset:` prefix search in a single `deleteFirst`-style call using `findFirst` + `delete` wrapped in a `$transaction`.
- **Fix:** Wrap both the `findFirst` and the `delete` in a `prisma.$transaction(async (tx) => { ... })` block so they execute within a serializable transaction, eliminating the race window. Alternatively, if the Prisma schema is adjusted to allow token-only lookup, a single `delete` would suffice.
- **Risk to fix:** low

### Forgot-password and resend-verification token replacement is not atomic

- **File:** `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/resend-verification/route.ts`
- **Line(s):** `forgot-password/route.ts:23-24`; `resend-verification/route.ts:25-30`
- **Issue:** Both routes use a `deleteMany` followed by a separate `create` to replace an existing token. These are not wrapped in a transaction. Two concurrent requests for the same email would both execute `deleteMany` (clearing the first token) and then both successfully `create` new tokens (since each has a unique random value), leaving two valid tokens in the database simultaneously. An attacker who can trigger simultaneous requests (e.g., a script) could obtain two valid reset/verification tokens for the same account. Only one would actually be used, but having multiple valid tokens for a single account increases the attack surface window.
- **Fix:** Wrap `deleteMany` + `create` in `prisma.$transaction([...])` in both routes. This does not eliminate both tokens being created in a race, but it serializes each individual request's delete+create pair, reducing the window. Alternatively, use an upsert with a deterministic token derivation, or use `createOrUpdate` logic within a transaction.
- **Risk to fix:** low

---

## Low

### Email verification token uses UUID; reset token uses `crypto.randomBytes` — inconsistent entropy

- **File:** `src/app/api/auth/register/route.ts`, `src/app/api/auth/resend-verification/route.ts`
- **Line(s):** `register/route.ts:32`; `resend-verification/route.ts:27`
- **Issue:** Email verification tokens are generated with `crypto.randomUUID()` (Web Crypto API, 122 bits of entropy). Password reset tokens use `crypto.randomBytes(32).toString("hex")` (256 bits of entropy). Both sources are cryptographically secure, so neither is weak. However, the inconsistency is worth noting: UUID v4 includes 6 fixed version/variant bits, yielding 122 random bits, which is sufficient but lower than the 256 bits used for reset tokens. Standardizing on `crypto.randomBytes(32).toString("hex")` across both flows would eliminate the inconsistency and slightly raise the entropy floor for verification tokens.
- **Fix:** Replace `crypto.randomUUID()` with `crypto.randomBytes(32).toString("hex")` in `register/route.ts` (line 32) and `resend-verification/route.ts` (line 27). Update the `sendVerificationEmail` URL construction to pass the token as a plain hex string rather than a UUID; no schema change required since the `VerificationToken.token` field is `String`.
- **Risk to fix:** low

### `callbackUrl` is set to the full absolute URL in the middleware redirect

- **File:** `src/proxy.ts`
- **Line(s):** 13
- **Issue:** The middleware sets `callbackUrl` to `req.nextUrl.href`, which is the full absolute URL (e.g., `https://app.devstash.com/dashboard`). This value is passed through to the sign-in page and then to the client component. The client-side `safeRelative` function in `sign-in-form.tsx` (lines 15-23) correctly strips this to a same-origin relative path before use, so the open redirect is mitigated in the normal code path. The remaining concern is that `callbackUrl` could be set to an arbitrary external URL by crafting a link to `/sign-in?callbackUrl=https://evil.com`, and if `safeRelative` were ever bypassed (e.g., by a future developer using `callbackUrl` directly), the redirect would be external. The server never validates or sanitizes the query parameter before passing it to the component.
- **Fix:** Add a server-side sanitization step in `src/app/(auth)/sign-in/page.tsx` before passing `callbackUrl` to `SignInForm`. A simple check: if `callbackUrl` starts with `http://` or `https://` and its origin does not match the app's known origin, replace it with `/dashboard`. This makes the defense server-side and not solely reliant on the client component.
- **Risk to fix:** low

---

## Passed Checks

- **bcrypt cost factor** (`src/app/api/auth/register/route.ts:28`, `src/app/api/profile/change-password/route.ts:31`, `src/app/api/auth/reset-password/route.ts:37`) — All password hashing operations use bcryptjs with cost factor 10, which is an appropriate value for bcrypt (OWASP recommends minimum 10).
- **No plaintext password storage** (`src/auth.ts:29`, `src/app/api/auth/register/route.ts:28`) — Passwords are always compared via `bcrypt.compare` and stored only as bcrypt hashes; the plaintext is never written to the database or logged.
- **Timing-safe password comparison** (`src/auth.ts:29`) — `bcrypt.compare` performs a constant-time comparison internally, preventing timing attacks on credential validation.
- **Email verification token single-use enforcement** (`src/app/api/auth/verify-email/route.ts:15-19`) — The token is claimed with a single atomic `prisma.verificationToken.delete()` call. If the record does not exist (already used or never created), Prisma throws and the handler returns an error, correctly preventing reuse.
- **Email verification token expiry check** (`src/app/api/auth/verify-email/route.ts:22-24`) — Expiry is checked after the atomic delete; an expired token is consumed and the user is redirected with an error, forcing a resend.
- **Password reset token expiry** (`src/app/api/auth/forgot-password/route.ts:20`) — Reset tokens expire in 1 hour, which is the industry-standard short window for password reset links.
- **Password reset avoids user enumeration** (`src/app/api/auth/forgot-password/route.ts:17-27`) — The endpoint always returns `{ ok: true }` regardless of whether the email exists; the email is only sent when the user exists.
- **Resend verification avoids user enumeration** (`src/app/api/auth/resend-verification/route.ts:20-23`) — Returns `{ success: true }` without revealing whether the email is registered or already verified.
- **Password reset includes new password validation** (`src/lib/validations/auth.ts:26-35`, `src/app/api/auth/reset-password/route.ts:8-13`) — The `resetPasswordSchema` enforces minimum length 8 and password match before the reset is processed.
- **Session validated before profile mutations** (`src/app/api/profile/change-password/route.ts:13-14`, `src/app/api/profile/route.ts:6-7`) — Both the change-password and delete-account endpoints call `auth()` and return 401 if no session is present.
- **Current password verified before change** (`src/app/api/profile/change-password/route.ts:28-29`) — The endpoint fetches the user's stored hash and calls `bcrypt.compare` before allowing a password change; it returns 400 on mismatch.
- **Zod input validation on all API routes** (`src/lib/validations/auth.ts`, all route files) — Every POST handler validates its body against a Zod schema before performing any database operations. Unexpected fields are stripped by Zod's default behavior.
- **Open redirect mitigation on sign-in client** (`src/components/auth/sign-in-form.tsx:15-23`) — The `safeRelative` helper validates `callbackUrl` against `window.location.origin` and falls back to `/dashboard` for cross-origin values; it is applied consistently before both credentials and GitHub OAuth redirects.
- **GitHub OAuth `redirectTo` sanitized** (`src/components/auth/sign-in-form.tsx:130`) — The GitHub sign-in button passes `safeRelative(callbackUrl)` as the `redirectTo`, preventing OAuth-initiated open redirects.
- **Middleware protects all authenticated routes** (`src/proxy.ts:21-23`) — The matcher covers `/dashboard/:path*` and `/profile`; unauthenticated requests are redirected to `/sign-in`.
- **Email verification gate in middleware** (`src/proxy.ts:16-18`) — When `EMAIL_VERIFICATION_ENABLED` is true, authenticated but unverified users are redirected to `/verify-email` rather than reaching protected routes.
- **OAuth users auto-verified** — PrismaAdapter sets `emailVerified` automatically for GitHub OAuth sign-ins, so those users are not incorrectly blocked by the verification gate.
- **Credential sign-in error is generic** (`src/components/auth/sign-in-form.tsx:75`) — The UI displays "Invalid email or password." for any sign-in failure, not distinguishing between unknown email and wrong password.
- **Delete account cascades user data** (`src/app/api/profile/route.ts:9`) — `prisma.user.delete()` triggers `onDelete: Cascade` on all related models (items, collections, tags, etc.), leaving no orphaned data.

---

## Notes

- The `src/proxy.ts` middleware uses the `proxy` named export (not `middleware`) as required by the project's Next.js 16 configuration. This is intentional and correct for this setup.
- The Upstash Redis instance listed in `.env.example` is documented as "optional." Rate limiting cannot be implemented without it (or an alternative store). This audit treats the absence of rate limiting as a real gap because all the infrastructure prerequisites are described in the project spec.
- The `EMAIL_VERIFICATION_ENABLED` flag can be set to `"false"` in `.env`, which disables both the email send and the middleware gate. This is intentional for local development but should never be set to `false` in production. No audit finding is raised because the flag is an explicit design decision.
- The Prisma `VerificationToken` model's unique constraint is `@@unique([identifier, token])`. Using the same `identifier` prefix (`reset:<email>`) for password reset tokens and bare email for verification tokens provides adequate namespace separation and prevents cross-flow token confusion.
- This audit did not review Stripe webhook handlers, AI endpoints, or item/collection CRUD routes — those are outside the auth scope defined for this review.
