import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { signInSchema } from "@/lib/validations/auth";

// Full config: adds the Prisma adapter and JWT session strategy on top of the
// edge-safe providers in auth.config.ts. Import this throughout the app
// (server components, route handlers) — but NOT in proxy.ts.
//
// The Credentials provider from auth.config.ts is a no-op placeholder; here we
// swap it for one that validates email/password against the database with
// bcrypt (these imports keep this file off the edge runtime).
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
            };
          },
        }),
  ),
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
});
