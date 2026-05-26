import { prisma } from "@/lib/prisma";

const DEMO_EMAIL = "demo@devstash.io";

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

export async function getRecentCollections(limit = 6): Promise<CollectionWithMeta[]> {
  const user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user) return [];

  const cols = await prisma.collection.findMany({
    where: { userId: user.id },
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
