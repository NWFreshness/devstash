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
