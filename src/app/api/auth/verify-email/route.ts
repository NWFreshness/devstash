import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid-token", origin));
  }

  // Check expiry before consuming the token so an expired token is not silently discarded.
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  });
  if (!record) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid-token", origin));
  }
  if (record.expires < new Date()) {
    return NextResponse.redirect(new URL("/sign-in?error=token-expired", origin));
  }

  try {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    });
  } catch {
    // Token was already consumed by a concurrent request — treat as invalid.
    return NextResponse.redirect(new URL("/sign-in?error=invalid-token", origin));
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  return NextResponse.redirect(new URL("/sign-in?verified=true", origin));
}
