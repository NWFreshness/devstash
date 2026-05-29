import { prisma } from "@/lib/prisma";

export interface CollectionTypeMeta {
  slug: string;
  icon: string | null;
  color: string | null;
}

export interface CollectionWithMeta {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  /** Type with the highest item count in this collection — drives accent color. */
  primaryType: CollectionTypeMeta | null;
  /** All distinct types present, ordered by descending count. */
  types: CollectionTypeMeta[];
}

export interface SidebarCollection {
  id: string;
  name: string;
  isFavorite: boolean;
  itemCount: number;
  primaryColor: string | null;
}

export interface SidebarCollections {
  favorites: SidebarCollection[];
  recents: SidebarCollection[];
}

export async function getSidebarCollections(
  userId: string | null,
  recentLimit = 8,
): Promise<SidebarCollections> {
  if (!userId) return { favorites: [], recents: [] };

  const cols = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      items: {
        select: { type: { select: { color: true } } },
      },
    },
  });

  const shaped: SidebarCollection[] = cols.map((col) => {
    const colorCounts = new Map<string, number>();
    for (const { type } of col.items) {
      if (!type.color) continue;
      colorCounts.set(type.color, (colorCounts.get(type.color) ?? 0) + 1);
    }
    let primaryColor: string | null = null;
    let topCount = 0;
    for (const [color, count] of colorCounts) {
      if (count > topCount) {
        topCount = count;
        primaryColor = color;
      }
    }
    return {
      id: col.id,
      name: col.name,
      isFavorite: col.isFavorite,
      itemCount: col.items.length,
      primaryColor,
    };
  });

  return {
    favorites: shaped.filter((c) => c.isFavorite),
    recents: shaped.filter((c) => !c.isFavorite).slice(0, recentLimit),
  };
}

export async function getRecentCollections(
  userId: string | null,
  limit = 6,
): Promise<CollectionWithMeta[]> {
  if (!userId) return [];

  const cols = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      items: {
        select: {
          type: { select: { slug: true, icon: true, color: true } },
        },
      },
    },
  });

  return cols.map((col) => {
    const counts = new Map<string, { meta: CollectionTypeMeta; count: number }>();
    for (const { type } of col.items) {
      const entry = counts.get(type.slug);
      if (entry) entry.count += 1;
      else counts.set(type.slug, { meta: type, count: 1 });
    }
    const types = Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .map((t) => t.meta);

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col.items.length,
      primaryType: types[0] ?? null,
      types,
    };
  });
}
