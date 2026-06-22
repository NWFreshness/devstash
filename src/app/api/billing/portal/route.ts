import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { getUserBilling } from "@/lib/db/billing";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const billing = await getUserBilling(session.user.id);
  if (!billing?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3333";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: billing.stripeCustomerId,
    return_url: `${appUrl}/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
