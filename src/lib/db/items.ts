import { prisma } from "@/lib/prisma";

const DEMO_EMAIL = "demo@devstash.io";

export interface ItemWithMeta {
  id: string;
  title: string;
  description: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: Date;
  type: { slug: string; icon: string | null; color: string | null };
  tags: string[];
}

async function getDemoUserId(): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: { id: true },
  });
  return user?.id ?? null;
}

function shape(item: {
  id: string;
  title: string;
  description: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: Date;
  type: { slug: string; icon: string | null; color: string | null };
  tags: { tag: { name: string } }[];
}): ItemWithMeta {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    isPinned: item.isPinned,
    isFavorite: item.isFavorite,
    createdAt: item.createdAt,
    type: item.type,
    tags: item.tags.map((t) => t.tag.name),
  };
}

export async function getRecentItems(limit = 10): Promise<ItemWithMeta[]> {
  const userId = await getDemoUserId();
  if (!userId) return [];

  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      type: { select: { slug: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });
  return items.map(shape);
}

export async function getPinnedItems(): Promise<ItemWithMeta[]> {
  const userId = await getDemoUserId();
  if (!userId) return [];

  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { createdAt: "desc" },
    include: {
      type: { select: { slug: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });
  return items.map(shape);
}
