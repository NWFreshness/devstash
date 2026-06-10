import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Return 200 regardless — don't leak whether the email exists or is verified.
  if (!user || user.emailVerified) {
    return NextResponse.json({ success: true });
  }

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  const origin = new URL(req.url).origin;
  await sendVerificationEmail(email, token, origin);

  return NextResponse.json({ success: true });
}
