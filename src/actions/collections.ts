"use server";

import { auth } from "@/auth";
import {
  createCollection as createCollectionQuery,
  deleteCollection as deleteCollectionQuery,
  toggleCollectionFavorite as toggleCollectionFavoriteQuery,
  updateCollection as updateCollectionQuery,
} from "@/lib/db/collections";
import { getDemoUser } from "@/lib/db/user";
import { createCollectionSchema, updateCollectionSchema } from "@/lib/validations/collection";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createCollection(
  input: unknown,
): Promise<ActionResult<{ id: string; name: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = createCollectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const demoUser = await getDemoUser();
  const created = await createCollectionQuery(demoUser?.id ?? null, parsed.data);
  if (!created) {
    return { success: false, error: "Could not create collection." };
  }

  return { success: true, data: created };
}

export async function updateCollection(
  collectionId: string,
  input: unknown,
): Promise<ActionResult<{ id: string; name: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = updateCollectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const demoUser = await getDemoUser();
  const updated = await updateCollectionQuery(
    demoUser?.id ?? null,
    collectionId,
    parsed.data,
  );
  if (!updated) {
    return { success: false, error: "Collection not found." };
  }

  return { success: true, data: updated };
}

export async function toggleCollectionFavorite(
  collectionId: string,
): Promise<ActionResult<{ isFavorite: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const demoUser = await getDemoUser();
  const result = await toggleCollectionFavoriteQuery(demoUser?.id ?? null, collectionId);
  if (!result) return { success: false, error: "Collection not found." };
  return { success: true, data: result };
}

export async function deleteCollection(
  collectionId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const demoUser = await getDemoUser();
  const deleted = await deleteCollectionQuery(demoUser?.id ?? null, collectionId);
  if (!deleted) {
    return { success: false, error: "Collection not found." };
  }

  return { success: true };
}
