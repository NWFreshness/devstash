"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import { b2, B2_BUCKET } from "@/lib/b2";
import { getAuthSession, parseOrError } from "@/lib/action-helpers";
import {
  createItem as createItemQuery,
  deleteItem as deleteItemQuery,
  toggleItemFavorite as toggleItemFavoriteQuery,
  toggleItemPin as toggleItemPinQuery,
  updateItem as updateItemQuery,
  type ItemDetail,
} from "@/lib/db/items";
import { getDemoUser } from "@/lib/db/user";
import { prisma } from "@/lib/prisma";
import { isAtItemLimit } from "@/lib/usage-limits";
import { createItemSchema, updateItemSchema } from "@/lib/validations/item";
import type { ActionResult } from "@/types/actions";

export async function createItem(
  input: unknown,
): Promise<ActionResult<ItemDetail>> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const createParsed = parseOrError(createItemSchema, input);
  if (!createParsed.ok) return { success: false, error: createParsed.error };

  // Items are seeded under the demo user, matching the rest of the app.
  const demoUser = await getDemoUser();

  if (!session.user.isPro) {
    const itemCount = await prisma.item.count({ where: { userId: demoUser?.id ?? "" } });
    if (isAtItemLimit(false, itemCount)) {
      return { success: false, error: "Free plan limit reached (50 items). Upgrade to Pro for unlimited items." };
    }
  }

  const created = await createItemQuery(demoUser?.id ?? null, createParsed.data);
  if (!created) {
    return { success: false, error: "Could not create item." };
  }

  return { success: true, data: created };
}

export async function updateItem(
  itemId: string,
  input: unknown,
): Promise<ActionResult<ItemDetail>> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const updateParsed = parseOrError(updateItemSchema, input);
  if (!updateParsed.ok) return { success: false, error: updateParsed.error };

  // Items are seeded under the demo user, matching the rest of the app.
  const demoUser = await getDemoUser();
  const updated = await updateItemQuery(
    demoUser?.id ?? null,
    itemId,
    updateParsed.data,
  );
  if (!updated) {
    return { success: false, error: "Item not found." };
  }

  return { success: true, data: updated };
}

export async function toggleItemFavorite(
  itemId: string,
): Promise<ActionResult<{ isFavorite: boolean }>> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const demoUser = await getDemoUser();
  const result = await toggleItemFavoriteQuery(demoUser?.id ?? null, itemId);
  if (!result) return { success: false, error: "Item not found." };
  return { success: true, data: result };
}

export async function toggleItemPin(
  itemId: string,
): Promise<ActionResult<{ isPinned: boolean }>> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const demoUser = await getDemoUser();
  const result = await toggleItemPinQuery(demoUser?.id ?? null, itemId);
  if (!result) return { success: false, error: "Item not found." };
  return { success: true, data: result };
}

export async function deleteItem(
  itemId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: "Unauthorized" };

  // Items are seeded under the demo user, matching the rest of the app.
  const demoUser = await getDemoUser();
  const result = await deleteItemQuery(demoUser?.id ?? null, itemId);
  if (!result.deleted) {
    return { success: false, error: "Item not found." };
  }

  if (result.fileUrl) {
    await b2
      .send(new DeleteObjectCommand({ Bucket: B2_BUCKET, Key: result.fileUrl }))
      .catch(() => {
        // B2 deletion is best-effort; DB row is already gone.
      });
  }

  return { success: true };
}
