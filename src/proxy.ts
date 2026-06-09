import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Build an edge-safe auth instance from the adapter-free config (the v5 docs
// say not to import auth.ts here). With the JWT strategy, this reads the
// session from the cookie without touching the database.
const { auth } = NextAuth(authConfig);

// Protect /dashboard/* and /profile — unauthenticated users go to the custom
// sign-in page with a callbackUrl so they return after signing in.
export const proxy = auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/profile"],
};
