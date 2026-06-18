"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import { auth } from "@/auth";
import { b2, B2_BUCKET } from "@/lib/b2";
import {
  createItem as createItemQuery,
  deleteItem as deleteItemQuery,
  toggleItemFavorite as toggleItemFavoriteQuery,
  updateItem as updateItemQuery,
  type ItemDetail,
} from "@/lib/db/items";
import { getDemoUser } from "@/lib/db/user";
import { createItemSchema, updateItemSchema } from "@/lib/validations/item";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createItem(
  input: unknown,
): Promise<ActionResult<ItemDetail>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = createItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Items are seeded under the demo user, matching the rest of the app.
  const demoUser = await getDemoUser();
  const created = await createItemQuery(demoUser?.id ?? null, parsed.data);
  if (!created) {
    return { success: false, error: "Could not create item." };
  }

  return { success: true, data: created };
}

export async function updateItem(
  itemId: string,
  input: unknown,
): Promise<ActionResult<ItemDetail>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = updateItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Items are seeded under the demo user, matching the rest of the app.
  const demoUser = await getDemoUser();
  const updated = await updateItemQuery(
    demoUser?.id ?? null,
    itemId,
    parsed.data,
  );
  if (!updated) {
    return { success: false, error: "Item not found." };
  }

  return { success: true, data: updated };
}

export async function toggleItemFavorite(
  itemId: string,
): Promise<ActionResult<{ isFavorite: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const demoUser = await getDemoUser();
  const result = await toggleItemFavoriteQuery(demoUser?.id ?? null, itemId);
  if (!result) return { success: false, error: "Item not found." };
  return { success: true, data: result };
}

export async function deleteItem(
  itemId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

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
