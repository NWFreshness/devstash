import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, "resetPassword");
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { token, password } = parsed.data;

  // Atomic claim: find and delete in a single transaction to prevent concurrent use.
  let record;
  try {
    record = await prisma.$transaction(async (tx) => {
      const r = await tx.verificationToken.findFirst({
        where: { token, identifier: { startsWith: "reset:" } },
      });
      if (!r) throw new Error("not found");
      await tx.verificationToken.delete({
        where: { identifier_token: { identifier: r.identifier, token } },
      });
      return r;
    });
  } catch {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
  }

  if (record.expires < new Date()) {
    return NextResponse.json({ error: "Reset link has expired." }, { status: 400 });
  }

  const email = record.identifier.replace(/^reset:/, "");
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { email }, data: { password: hashed } });

  return NextResponse.json({ ok: true });
}
