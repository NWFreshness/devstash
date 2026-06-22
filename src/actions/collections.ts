"use server";

import { getAuthSession, parseOrError } from "@/lib/action-helpers";
import {
  createCollection as createCollectionQuery,
  deleteCollection as deleteCollectionQuery,
  toggleCollectionFavorite as toggleCollectionFavoriteQuery,
  updateCollection as updateCollectionQuery,
} from "@/lib/db/collections";
import { getDemoUser } from "@/lib/db/user";
import { prisma } from "@/lib/prisma";
import { isAtCollectionLimit } from "@/lib/usage-limits";
import { createCollectionSchema, updateCollectionSchema } from "@/lib/validations/collection";
import type { ActionResult } from "@/types/actions";

export async function createCollection(
  input: unknown,
): Promise<ActionResult<{ id: string; name: string }>> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const createParsed = parseOrError(createCollectionSchema, input);
  if (!createParsed.ok) return { success: false, error: createParsed.error };

  const demoUser = await getDemoUser();

  if (!session.user.isPro) {
    const collectionCount = await prisma.collection.count({ where: { userId: demoUser?.id ?? "" } });
    if (isAtCollectionLimit(false, collectionCount)) {
      return { success: false, error: "Free plan limit reached (3 collections). Upgrade to Pro for unlimited collections." };
    }
  }

  const created = await createCollectionQuery(demoUser?.id ?? null, createParsed.data);
  if (!created) {
    return { success: false, error: "Could not create collection." };
  }

  return { success: true, data: created };
}

export async function updateCollection(
  collectionId: string,
  input: unknown,
): Promise<ActionResult<{ id: string; name: string }>> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const updateParsed = parseOrError(updateCollectionSchema, input);
  if (!updateParsed.ok) return { success: false, error: updateParsed.error };

  const demoUser = await getDemoUser();
  const updated = await updateCollectionQuery(
    demoUser?.id ?? null,
    collectionId,
    updateParsed.data,
  );
  if (!updated) {
    return { success: false, error: "Collection not found." };
  }

  return { success: true, data: updated };
}

export async function toggleCollectionFavorite(
  collectionId: string,
): Promise<ActionResult<{ isFavorite: boolean }>> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const demoUser = await getDemoUser();
  const result = await toggleCollectionFavoriteQuery(demoUser?.id ?? null, collectionId);
  if (!result) return { success: false, error: "Collection not found." };
  return { success: true, data: result };
}

export async function deleteCollection(
  collectionId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const demoUser = await getDemoUser();
  const deleted = await deleteCollectionQuery(demoUser?.id ?? null, collectionId);
  if (!deleted) {
    return { success: false, error: "Collection not found." };
  }

  return { success: true };
}
