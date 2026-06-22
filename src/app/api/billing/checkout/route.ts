import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { getUserBilling } from "@/lib/db/billing";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const raw = body?.interval;
  if (raw !== "monthly" && raw !== "yearly") {
    return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
  }
  const interval: "monthly" | "yearly" = raw;

  const billing = await getUserBilling(session.user.id);
  const priceId = STRIPE_PRICE_IDS[interval];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3333";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer: billing?.stripeCustomerId ?? undefined,
    metadata: { userId: session.user.id },
    subscription_data: { metadata: { userId: session.user.id } },
    success_url: `${appUrl}/settings?billing=success`,
    cancel_url: `${appUrl}/settings`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
