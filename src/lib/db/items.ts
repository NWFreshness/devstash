import { prisma } from "@/lib/prisma";
import type { CreateItemInput, UpdateItemInput } from "@/lib/validations/item";
import { ITEMS_PER_PAGE, COLLECTIONS_PER_PAGE } from "@/lib/pagination";

export interface ItemWithMeta {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: Date;
  type: { slug: string; icon: string | null; color: string | null };
  tags: string[];
}

function shape(item: {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: Date;
  type: { slug: string; icon: string | null; color: string | null };
  tags: { tag: { name: string } }[];
}): ItemWithMeta {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    isPinned: item.isPinned,
    isFavorite: item.isFavorite,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
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
  page = 1,
): Promise<{ items: ItemWithMeta[]; total: number }> {
  if (!userId) return { items: [], total: 0 };

  const where = { userId, type: { slug: typeSlug } };
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        type: { select: { slug: true, icon: true, color: true } },
        tags: { include: { tag: { select: { name: true } } } },
      },
    }),
    prisma.item.count({ where }),
  ]);
  return { items: items.map(shape), total };
}

export async function getItemsByCollection(
  userId: string | null,
  collectionId: string,
  page = 1,
): Promise<{ items: ItemWithMeta[]; total: number }> {
  if (!userId) return { items: [], total: 0 };

  const where = { userId, collectionId };
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * COLLECTIONS_PER_PAGE,
      take: COLLECTIONS_PER_PAGE,
      include: {
        type: { select: { slug: true, icon: true, color: true } },
        tags: { include: { tag: { select: { name: true } } } },
      },
    }),
    prisma.item.count({ where }),
  ]);
  return { items: items.map(shape), total };
}

export interface ItemDetail {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  language: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  type: { name: string; slug: string; icon: string | null; color: string | null };
  collection: { id: string; name: string } | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export async function getItemDetail(
  userId: string | null,
  itemId: string,
): Promise<ItemDetail | null> {
  if (!userId) return null;

  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    include: {
      type: { select: { name: true, slug: true, icon: true, color: true } },
      collection: { select: { id: true, name: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });
  if (!item) return null;

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    language: item.language,
    url: item.url,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    mimeType: item.mimeType,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    type: item.type,
    collection: item.collection,
    tags: item.tags.map((t) => t.tag.name),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function createItem(
  userId: string | null,
  data: CreateItemInput,
): Promise<ItemDetail | null> {
  if (!userId) return null;

  const type = await prisma.itemType.findFirst({
    where: { slug: data.typeSlug, isSystem: true },
    select: { id: true },
  });
  if (!type) return null;

  const isFileType = data.typeSlug === "file" || data.typeSlug === "image";
  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      contentType: isFileType ? "file" : "text",
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      userId,
      typeId: type.id,
      collectionId: data.collectionId,
      tags: {
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { userId_name: { userId, name } },
              create: { name, userId },
            },
          },
        })),
      },
    },
    select: { id: true },
  });

  return getItemDetail(userId, item.id);
}

export async function updateItem(
  userId: string | null,
  itemId: string,
  data: UpdateItemInput,
): Promise<ItemDetail | null> {
  if (!userId) return null;

  // Scope by userId so the update is the ownership check (returns null if not owned).
  const existing = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { id: true },
  });
  if (!existing) return null;

  await prisma.item.update({
    where: { id: itemId },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      collectionId: data.collectionId,
      tags: {
        deleteMany: {},
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { userId_name: { userId, name } },
              create: { name, userId },
            },
          },
        })),
      },
    },
  });

  return getItemDetail(userId, itemId);
}

export async function deleteItem(
  userId: string | null,
  itemId: string,
): Promise<{ deleted: boolean; fileUrl: string | null }> {
  if (!userId) return { deleted: false, fileUrl: null };

  // Grab fileUrl before deletion so the caller can clean up B2.
  const existing = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { fileUrl: true },
  });
  if (!existing) return { deleted: false, fileUrl: null };

  await prisma.item.delete({ where: { id: itemId } });
  return { deleted: true, fileUrl: existing.fileUrl };
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

export interface SearchItem {
  id: string;
  title: string;
  type: { slug: string; icon: string | null; color: string | null };
}

export async function getSearchItems(userId: string | null): Promise<SearchItem[]> {
  if (!userId) return [];
  const items = await prisma.item.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      type: { select: { slug: true, icon: true, color: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 500,
  });
  return items;
}

export interface FavoriteItem {
  id: string;
  title: string;
  updatedAt: Date;
  type: { slug: string; icon: string | null; color: string | null };
}

export async function getFavoriteItems(userId: string | null): Promise<FavoriteItem[]> {
  if (!userId) return [];
  return prisma.item.findMany({
    where: { userId, isFavorite: true },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      type: { select: { slug: true, icon: true, color: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function toggleItemFavorite(
  userId: string | null,
  itemId: string,
): Promise<{ isFavorite: boolean } | null> {
  if (!userId) return null;
  const existing = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { isFavorite: true },
  });
  if (!existing) return null;
  const updated = await prisma.item.update({
    where: { id: itemId },
    data: { isFavorite: !existing.isFavorite },
    select: { isFavorite: true },
  });
  return { isFavorite: updated.isFavorite };
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
