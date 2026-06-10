import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { signInSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";

class RateLimitError extends CredentialsSignin {
  code = "rate_limit";
}

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
          authorize: async (credentials, request) => {
            const parsed = signInSchema.safeParse(credentials);
            if (!parsed.success) return null;
            const { email, password } = parsed.data;

            const limited = await checkRateLimit(request, "login", email);
            if (limited) throw new RateLimitError();

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
      session.user.id = token.id as string;
      session.user.emailVerified = token.emailVerified as Date | null;
      return session;
    },
  },
});
