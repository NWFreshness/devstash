import { prisma } from "@/lib/prisma";

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

export async function getRecentItems(
  userId: string | null,
  limit = 10,
): Promise<ItemWithMeta[]> {
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

export interface SystemType {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
}

export async function getSystemType(slug: string): Promise<SystemType | null> {
  return prisma.itemType.findFirst({
    where: { slug, isSystem: true },
    select: { id: true, name: true, slug: true, icon: true, color: true },
  });
}

export async function getItemsByType(
  userId: string | null,
  typeSlug: string,
): Promise<ItemWithMeta[]> {
  if (!userId) return [];

  const items = await prisma.item.findMany({
    where: { userId, type: { slug: typeSlug } },
    orderBy: { createdAt: "desc" },
    include: {
      type: { select: { slug: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });
  return items.map(shape);
}

export interface DashboardStats {
  itemCount: number;
  collectionCount: number;
  favoriteItemCount: number;
  favoriteCollectionCount: number;
}

export async function getDashboardStats(
  userId: string | null,
): Promise<DashboardStats> {
  if (!userId) {
    return { itemCount: 0, collectionCount: 0, favoriteItemCount: 0, favoriteCollectionCount: 0 };
  }
  const [itemCount, collectionCount, favoriteItemCount, favoriteCollectionCount] =
    await Promise.all([
      prisma.item.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
      prisma.item.count({ where: { userId, isFavorite: true } }),
      prisma.collection.count({ where: { userId, isFavorite: true } }),
    ]);
  return { itemCount, collectionCount, favoriteItemCount, favoriteCollectionCount };
}

export interface ItemTypeWithCount {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  count: number;
}

const SYSTEM_TYPE_ORDER = ["snippet", "prompt", "command", "note", "file", "image", "link"];

export async function getItemTypeCounts(
  userId: string | null,
): Promise<ItemTypeWithCount[]> {
  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
  });
  types.sort((a, b) => {
    const ai = SYSTEM_TYPE_ORDER.indexOf(a.slug);
    const bi = SYSTEM_TYPE_ORDER.indexOf(b.slug);
    return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
  });

  if (!userId) {
    return types.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      icon: t.icon,
      color: t.color,
      count: 0,
    }));
  }

  const grouped = await prisma.item.groupBy({
    by: ["typeId"],
    where: { userId },
    _count: { _all: true },
  });
  const countByTypeId = new Map(grouped.map((g) => [g.typeId, g._count._all]));

  return types.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    icon: t.icon,
    color: t.color,
    count: countByTypeId.get(t.id) ?? 0,
  }));
}

export async function getPinnedItems(
  userId: string | null,
): Promise<ItemWithMeta[]> {
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
