import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

// Edge-compatible config: providers only, no adapter or database access.
// Imported by both auth.ts (full config) and proxy.ts (route protection).
// GitHub auto-reads AUTH_GITHUB_ID and AUTH_GITHUB_SECRET from the environment.
export const authConfig = {
  providers: [GitHub],
} satisfies NextAuthConfig;

export default authConfig;
