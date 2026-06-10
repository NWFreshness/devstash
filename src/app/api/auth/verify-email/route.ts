import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid-token", origin));
  }

  let record;
  try {
    record = await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    });
  } catch {
    return NextResponse.redirect(new URL("/sign-in?error=invalid-token", origin));
  }

  if (record.expires < new Date()) {
    return NextResponse.redirect(new URL("/sign-in?error=token-expired", origin));
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  return NextResponse.redirect(new URL("/sign-in?verified=true", origin));
}
