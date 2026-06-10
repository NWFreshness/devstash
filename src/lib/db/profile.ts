import { prisma } from "@/lib/prisma";

export interface ProfileUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
  hasPassword: boolean;
}

export async function getProfileUser(userId: string): Promise<ProfileUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true, createdAt: true, password: true },
  });
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    hasPassword: !!user.password,
  };
}

export interface ProfileStats {
  totalItems: number;
  totalCollections: number;
  typeCounts: Array<{ name: string; slug: string; count: number }>;
}

const TYPE_ORDER = ["snippet", "prompt", "command", "note", "file", "image", "link"];

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [totalItems, totalCollections, types, grouped] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({
      where: { isSystem: true },
      select: { id: true, name: true, slug: true },
    }),
    prisma.item.groupBy({ by: ["typeId"], where: { userId }, _count: { _all: true } }),
  ]);

  const countByTypeId = new Map(grouped.map((g) => [g.typeId, g._count._all]));
  const sorted = [...types].sort((a, b) => {
    const ai = TYPE_ORDER.indexOf(a.slug);
    const bi = TYPE_ORDER.indexOf(b.slug);
    return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
  });

  return {
    totalItems,
    totalCollections,
    typeCounts: sorted.map((t) => ({
      name: t.name,
      slug: t.slug,
      count: countByTypeId.get(t.id) ?? 0,
    })),
  };
}
