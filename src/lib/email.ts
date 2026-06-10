import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "onboarding@resend.dev";

export async function sendVerificationEmail(
  to: string,
  token: string,
  origin: string,
) {
  const url = new URL("/api/auth/verify-email", origin);
  url.searchParams.set("token", token);
  url.searchParams.set("email", to);

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your DevStash email",
    text: `Welcome to DevStash!\n\nClick the link below to verify your email address:\n\n${url.toString()}\n\nThis link expires in 24 hours. If you didn't create an account, you can ignore this email.`,
  });
}
