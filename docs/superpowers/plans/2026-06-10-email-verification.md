# Email Verification on Register — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send a verification email via Resend after registration; block unverified credential users from `/dashboard` and `/profile` via the Next.js middleware until they click the link.

**Architecture:** A `VerificationToken` row is created on register and emailed via Resend. Clicking the link calls `GET /api/auth/verify-email` which sets `User.emailVerified` and deletes the token. `emailVerified` is written into the JWT on sign-in and propagated to the session; `proxy.ts` reads it and redirects unverified users to `/verify-email`.

**Tech Stack:** Next.js 16 App Router, Auth.js v5 (JWT strategy), Prisma 7 + Neon, Resend SDK, Zod 4, TypeScript strict

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/lib/email.ts` | Resend client + `sendVerificationEmail` helper |
| Modify | `src/types/next-auth.d.ts` | Augment `User`, `Session`, and `JWT` with `emailVerified` |
| Modify | `src/auth.config.ts` | Add edge-safe `session` callback to expose `emailVerified` for the proxy |
| Modify | `src/auth.ts` | Add `emailVerified` to `jwt` + `session` callbacks; return it from credentials `authorize` |
| Modify | `src/proxy.ts` | Second gate: redirect unverified users to `/verify-email` |
| Create | `src/app/api/auth/verify-email/route.ts` | `GET` — validate token, set `emailVerified`, redirect to sign-in |
| Modify | `src/app/api/auth/register/route.ts` | Create token row + send email after user creation |
| Create | `src/app/api/auth/resend-verification/route.ts` | `POST` — delete old token, create new one, resend email |
| Create | `src/components/auth/verify-email-form.tsx` | Client component: "check your inbox" + resend form |
| Create | `src/app/(auth)/verify-email/page.tsx` | Page wrapper using existing `(auth)` layout |
| Modify | `src/components/auth/register-form.tsx` | Redirect to `/verify-email?email=<email>` after register |
| Modify | `src/app/(auth)/sign-in/page.tsx` | Pass `verified` prop from `?verified=true` query param |
| Modify | `src/components/auth/sign-in-form.tsx` | Show "Email verified" toast when `verified` prop is true |
| Modify | `prisma/seed.ts` | Set `emailVerified: new Date()` on the demo user |
| Modify | `.env.example` | Document `RESEND_FROM` variable |

---

## Task 1: Install Resend + Create Email Utility

**Files:**
- Create: `src/lib/email.ts`

- [ ] **Step 1: Install the resend package**

```bash
npm install resend
```

Expected output: `added 1 package` (or similar — no errors).

- [ ] **Step 2: Add `RESEND_FROM` to your `.env` file**

Open `.env` and add:

```
RESEND_FROM=onboarding@resend.dev
```

> Note: `onboarding@resend.dev` is Resend's shared sandbox address — works for testing without a verified domain. Replace with your own domain address before going to production.

- [ ] **Step 3: Create `src/lib/email.ts`**

```ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "onboarding@resend.dev";

export async function sendVerificationEmail(
  to: string,
  token: string,
  origin: string,
) {
  const url = new URL("/api/auth/verify-email", origin);
  url.searchParams.set("token", token);
  url.searchParams.set("email", to);

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your DevStash email",
    text: `Welcome to DevStash!\n\nClick the link below to verify your email address:\n\n${url.toString()}\n\nThis link expires in 24 hours. If you didn't create an account, you can ignore this email.`,
  });
}
```

- [ ] **Step 4: Update `.env.example` to document the new variable**

Open `.env.example` and add after `RESEND_API_KEY`:

```
RESEND_FROM="onboarding@resend.dev"
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors related to `src/lib/email.ts`.

---

## Task 2: Augment Auth Types

**Files:**
- Modify: `src/types/next-auth.d.ts`

- [ ] **Step 1: Replace the contents of `src/types/next-auth.d.ts`**

```ts
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    emailVerified?: Date | null;
  }
  interface Session {
    user: {
      id: string;
      emailVerified: Date | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    emailVerified: Date | null;
  }
}
```

The `User` augmentation lets the credentials `authorize` return `emailVerified` without a type error.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 3: Update `auth.config.ts` — Edge-Safe Session Callback

**Files:**
- Modify: `src/auth.config.ts`

The proxy uses `NextAuth(authConfig)` and reads `req.auth.user.emailVerified`. This session callback runs in the edge runtime, reading `emailVerified` from the JWT token (no DB access).

- [ ] **Step 1: Replace the contents of `src/auth.config.ts`**

```ts
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: () => null,
    }),
  ],
  callbacks: {
    session({ session, token }) {
      session.user.emailVerified = (token.emailVerified as Date | null) ?? null;
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 4: Update `auth.ts` — JWT + Session Callbacks

**Files:**
- Modify: `src/auth.ts`

The credentials `authorize` now returns `emailVerified`. The `jwt` callback writes it to the token; the `session` callback exposes it on the session.

- [ ] **Step 1: Replace the contents of `src/auth.ts`**

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { signInSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: authConfig.providers.map((provider) =>
    typeof provider === "function" || provider.id !== "credentials"
      ? provider
      : Credentials({
          credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
          },
          authorize: async (credentials) => {
            const parsed = signInSchema.safeParse(credentials);
            if (!parsed.success) return null;
            const { email, password } = parsed.data;

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user?.password) return null;

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return null;

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              emailVerified: user.emailVerified,
            };
          },
        }),
  ),
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.emailVerified = user.emailVerified ?? null;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.emailVerified = token.emailVerified;
      return session;
    },
  },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 5: Update Middleware — Gate Unverified Users

**Files:**
- Modify: `src/proxy.ts`

- [ ] **Step 1: Replace the contents of `src/proxy.ts`**

```ts
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }
  if (!req.auth.user?.emailVerified) {
    return NextResponse.redirect(new URL("/verify-email", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/profile"],
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 6: Create Verification Link Handler

**Files:**
- Create: `src/app/api/auth/verify-email/route.ts`

- [ ] **Step 1: Create `src/app/api/auth/verify-email/route.ts`**

```ts
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid-token", origin));
  }

  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  });

  if (!record || record.expires < new Date()) {
    return NextResponse.redirect(new URL("/sign-in?error=token-expired", origin));
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    }),
  ]);

  return NextResponse.redirect(new URL("/sign-in?verified=true", origin));
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 7: Update Register Route — Create Token + Send Email

**Files:**
- Modify: `src/app/api/auth/register/route.ts`

- [ ] **Step 1: Replace the contents of `src/app/api/auth/register/route.ts`**

```ts
import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "A user with this email already exists." },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  const origin = new URL(req.url).origin;
  await sendVerificationEmail(email, token, origin);

  return NextResponse.json(
    { success: true, user: { id: user.id, email: user.email } },
    { status: 201 },
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 8: Create Resend Verification Route

**Files:**
- Create: `src/app/api/auth/resend-verification/route.ts`

- [ ] **Step 1: Create `src/app/api/auth/resend-verification/route.ts`**

```ts
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Return 200 regardless — don't leak whether the email exists or is verified.
  if (!user || user.emailVerified) {
    return NextResponse.json({ success: true });
  }

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  const origin = new URL(req.url).origin;
  await sendVerificationEmail(email, token, origin);

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 9: Create `/verify-email` Page

**Files:**
- Create: `src/components/auth/verify-email-form.tsx`
- Create: `src/app/(auth)/verify-email/page.tsx`

- [ ] **Step 1: Create `src/components/auth/verify-email-form.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold">Check your inbox</h1>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to your email. Click it to activate your
          account.
        </p>
      </div>

      <form onSubmit={handleResend} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {status === "sent" && (
          <p className="text-sm text-green-500">Verification email sent.</p>
        )}
        {status === "error" && (
          <p className="text-sm text-destructive">
            Something went wrong. Try again.
          </p>
        )}
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Sending..." : "Resend verification email"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already verified?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/(auth)/verify-email/page.tsx`**

`useSearchParams` must be inside a `Suspense` boundary in Next.js App Router.

```tsx
import { Suspense } from "react";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 10: Update Register Form + Sign-In Page

**Files:**
- Modify: `src/components/auth/register-form.tsx`
- Modify: `src/app/(auth)/sign-in/page.tsx`
- Modify: `src/components/auth/sign-in-form.tsx`

- [ ] **Step 1: Update the redirect in `src/components/auth/register-form.tsx`**

Find this line (around line 48):
```ts
router.push("/sign-in?registered=true");
```

Replace with:
```ts
router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
```

- [ ] **Step 2: Update `src/app/(auth)/sign-in/page.tsx` to pass `verified` prop**

Replace the file contents:

```tsx
import { SignInForm } from "@/components/auth/sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string; verified?: string }>;
}) {
  const { callbackUrl, registered, verified } = await searchParams;
  return (
    <SignInForm
      callbackUrl={callbackUrl ?? "/dashboard"}
      registered={registered === "true"}
      verified={verified === "true"}
    />
  );
}
```

- [ ] **Step 3: Update `src/components/auth/sign-in-form.tsx` to handle the `verified` prop**

Change the component signature (around line 34):

```ts
export function SignInForm({
  callbackUrl,
  registered,
  verified,
}: {
  callbackUrl: string;
  registered?: boolean;
  verified?: boolean;
}) {
```

Add a `verified` toast in the `useEffect` (around lines 39–43):

```ts
useEffect(() => {
  if (registered) {
    toast.success("Account created! You can now sign in.");
  }
  if (verified) {
    toast.success("Email verified! You can now sign in.");
  }
}, [registered, verified]);
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 11: Fix Dev Database + Update Seed

**Files:**
- Modify: `prisma/seed.ts`

Existing dev test users (`creds-test@devstash.local`, `ui-test@devstash.local`) have `emailVerified = null` and will be blocked by the middleware after this change.

- [ ] **Step 1: Run the one-off SQL to mark existing test users as verified on the development branch**

Open the Neon MCP tool (or run via `npm run test-db` prompt) and execute against `branchId: "br-hidden-night-akzayhct"`:

```sql
UPDATE "User"
SET "emailVerified" = NOW()
WHERE email IN ('creds-test@devstash.local', 'ui-test@devstash.local', 'demo@devstash.local');
```

- [ ] **Step 2: Update `prisma/seed.ts` — set `emailVerified` on the demo user so future reseeds don't break**

Find the `prisma.user.upsert` call for `demo@devstash.local`. In the `create` and `update` data blocks, add:

```ts
emailVerified: new Date(),
```

- [ ] **Step 3: Verify seed still runs cleanly**

```bash
npx prisma db seed
```

Expected: seed output with no errors.

---

## Task 12: Full Build + Browser Verification

- [ ] **Step 1: Run the production build**

```bash
npm run build
```

Expected: exits 0, no TypeScript or Next.js errors.

- [ ] **Step 2: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 3: Verify the registration → verification flow**

1. Go to `http://localhost:3333/register`
2. Register with a new email address (use a real email you can check, or use a Resend test address)
3. Should redirect to `/verify-email?email=<your-email>`
4. Check your inbox — you should receive a "Verify your DevStash email" email
5. Click the link — should redirect to `/sign-in?verified=true`
6. The sign-in page should show "Email verified! You can now sign in." toast
7. Sign in with the new credentials — should reach `/dashboard` successfully

- [ ] **Step 4: Verify middleware blocks unverified users**

1. Create another test user via `POST /api/auth/register` (don't click the verification link)
2. Sign in with those credentials
3. Navigating to `/dashboard` should redirect to `/verify-email`

- [ ] **Step 5: Verify resend works**

1. On `/verify-email`, enter the email of the unverified user
2. Click "Resend verification email"
3. Should show "Verification email sent." message
4. Check inbox for a new verification email

- [ ] **Step 6: Verify GitHub OAuth users are unaffected**

1. Sign in with GitHub
2. Should land on `/dashboard` without hitting `/verify-email` (GitHub sets `emailVerified` automatically via PrismaAdapter)

- [ ] **Step 7: Verify `?error=token-expired` handling**

1. Manually call the verify-email URL with a fake token: `http://localhost:3333/api/auth/verify-email?token=bad&email=test@example.com`
2. Should redirect to `/sign-in?error=token-expired`

- [ ] **Step 8: Commit**

```bash
git add \
  src/lib/email.ts \
  src/types/next-auth.d.ts \
  src/auth.config.ts \
  src/auth.ts \
  src/proxy.ts \
  src/app/api/auth/verify-email/route.ts \
  src/app/api/auth/register/route.ts \
  src/app/api/auth/resend-verification/route.ts \
  src/components/auth/verify-email-form.tsx \
  "src/app/(auth)/verify-email/page.tsx" \
  src/components/auth/register-form.tsx \
  "src/app/(auth)/sign-in/page.tsx" \
  src/components/auth/sign-in-form.tsx \
  prisma/seed.ts \
  .env.example \
  docs/superpowers/specs/2026-06-10-email-verification-design.md \
  docs/superpowers/plans/2026-06-10-email-verification.md
git commit -m "feat: email verification on register via Resend"
```
