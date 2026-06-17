import { prisma } from "@/lib/prisma";
import type { CreateCollectionInput } from "@/lib/validations/collection";

/** Returns the item with the highest occurrence count, or null if empty. */
function topByCount<T>(items: T[], key: (item: T) => string | null): T | null {
  const counts = new Map<string, { item: T; count: number }>();
  for (const item of items) {
    const k = key(item);
    if (!k) continue;
    const entry = counts.get(k);
    if (entry) entry.count += 1;
    else counts.set(k, { item, count: 1 });
  }
  let top: T | null = null;
  let topCount = 0;
  for (const { item, count } of counts.values()) {
    if (count > topCount) { topCount = count; top = item; }
  }
  return top;
}

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

export async function getCollectionsForSelect(
  userId: string | null,
): Promise<{ id: string; name: string }[]> {
  if (!userId) return [];
  return prisma.collection.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function createCollection(
  userId: string | null,
  data: CreateCollectionInput,
): Promise<{ id: string; name: string } | null> {
  if (!userId) return null;
  return prisma.collection.create({
    data: { userId, name: data.name, description: data.description },
    select: { id: true, name: true },
  });
}

export async function getSidebarCollections(
  userId: string | null,
  recentLimit = 8,
): Promise<SidebarCollections> {
  if (!userId) return { favorites: [], recents: [] };

  const cols = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      items: {
        select: { type: { select: { color: true } } },
      },
    },
  });

  const shaped: SidebarCollection[] = cols.map((col) => ({
    id: col.id,
    name: col.name,
    isFavorite: col.isFavorite,
    itemCount: col.items.length,
    primaryColor: topByCount(col.items, ({ type }) => type.color)?.type.color ?? null,
  }));

  return {
    favorites: shaped.filter((c) => c.isFavorite),
    recents: shaped.filter((c) => !c.isFavorite).slice(0, recentLimit),
  };
}

function shapeCollection(col: {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  items: { type: { slug: string; icon: string | null; color: string | null } }[];
}): CollectionWithMeta {
  const primaryType = topByCount(col.items, ({ type }) => type.slug)?.type ?? null;
  const seen = new Set<string>();
  const types: CollectionTypeMeta[] = [];
  for (const { type } of col.items) {
    if (!seen.has(type.slug)) { seen.add(type.slug); types.push(type); }
  }
  return {
    id: col.id,
    name: col.name,
    description: col.description,
    isFavorite: col.isFavorite,
    itemCount: col.items.length,
    primaryType,
    types,
  };
}

const COLLECTION_ITEMS_SELECT = {
  select: { type: { select: { slug: true, icon: true, color: true } } },
} as const;

export async function getRecentCollections(
  userId: string | null,
  limit = 6,
): Promise<CollectionWithMeta[]> {
  if (!userId) return [];

  const cols = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: { items: COLLECTION_ITEMS_SELECT },
  });

  return cols.map(shapeCollection);
}

export async function getAllCollections(
  userId: string | null,
): Promise<CollectionWithMeta[]> {
  if (!userId) return [];

  const cols = await prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    take: 200,
    include: { items: COLLECTION_ITEMS_SELECT },
  });

  return cols.map(shapeCollection);
}

export async function getCollectionById(
  userId: string | null,
  collectionId: string,
): Promise<CollectionWithMeta | null> {
  if (!userId) return null;

  const col = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    include: { items: COLLECTION_ITEMS_SELECT },
  });
  if (!col) return null;

  return shapeCollection(col);
}
