import { prisma } from "@/lib/prisma";

const DEMO_EMAIL = "demo@devstash.io";

export interface DemoUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export async function getDemoUser(): Promise<DemoUser | null> {
  return prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: { id: true, name: true, email: true, image: true },
  });
}
