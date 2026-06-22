import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { getUserByStripeCustomerId, updateUserSubscription } from "@/lib/db/billing";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const userId = checkoutSession.metadata?.userId;
      if (!userId) break;

      await updateUserSubscription(userId, {
        isPro: true,
        stripeCustomerId: checkoutSession.customer as string,
      });
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await getUserByStripeCustomerId(subscription.customer as string);
      if (!user) break;

      const isActive = subscription.status === "active" || subscription.status === "trialing";
      const periodEnd = subscription.items.data[0]?.current_period_end;
      await updateUserSubscription(user.id, {
        isPro: isActive,
        stripeSubscriptionId: subscription.id,
        planRenewsAt: periodEnd ? new Date(periodEnd * 1000) : null,
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await getUserByStripeCustomerId(subscription.customer as string);
      if (!user) break;

      await updateUserSubscription(user.id, {
        isPro: false,
        stripeSubscriptionId: null,
        planRenewsAt: null,
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
