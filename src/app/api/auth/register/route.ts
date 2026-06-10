import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { sendVerificationEmail } from "@/lib/email";
import { EMAIL_VERIFICATION_ENABLED } from "@/lib/flags";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, "register");
  if (limited) return limited;
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

  let user;
  if (EMAIL_VERIFICATION_ENABLED) {
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    [user] = await prisma.$transaction([
      prisma.user.create({
        data: { name, email, password: hashedPassword },
      }),
      prisma.verificationToken.create({
        data: { identifier: email, token, expires },
      }),
    ]);
    const origin = new URL(req.url).origin;
    await sendVerificationEmail(email, token, origin).catch(() => {
      // Token is in the DB — user can request a resend from /verify-email
    });
  } else {
    user = await prisma.user.create({
      data: { name, email, password: hashedPassword, emailVerified: new Date() },
    });
  }

  return NextResponse.json(
    { success: true, user: { id: user.id, email: user.email } },
    { status: 201 },
  );
}
