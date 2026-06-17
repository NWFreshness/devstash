import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const emailVerificationEnabled =
  process.env.EMAIL_VERIFICATION_ENABLED !== "false";

export const proxy = auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }
  if (emailVerificationEnabled && !req.auth.user?.emailVerified) {
    return NextResponse.redirect(new URL("/verify-email", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/items/:path*", "/collections/:path*", "/profile", "/settings"],
};
