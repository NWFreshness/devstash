import { prisma } from "@/lib/prisma";

export async function getUserBilling(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      isPro: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      planRenewsAt: true,
    },
  });
}

export async function updateUserSubscription(
  userId: string,
  data: {
    isPro: boolean;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string | null;
    planRenewsAt?: Date | null;
  }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  return prisma.user.findUnique({
    where: { stripeCustomerId },
    select: { id: true, email: true, isPro: true },
  });
}
