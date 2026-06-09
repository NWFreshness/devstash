import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

// Edge-compatible config: providers only, no adapter or database access.
// Imported by both auth.ts (full config) and proxy.ts (route protection).
// GitHub auto-reads AUTH_GITHUB_ID and AUTH_GITHUB_SECRET from the environment.
//
// The Credentials provider here is a placeholder with `authorize: () => null` so
// this file stays edge-safe (no bcrypt or Prisma imports). auth.ts overrides it
// with the real bcrypt validation logic.
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
} satisfies NextAuthConfig;

export default authConfig;
