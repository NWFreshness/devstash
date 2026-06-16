"use server";

import { auth } from "@/auth";
import {
  deleteItem as deleteItemQuery,
  updateItem as updateItemQuery,
  type ItemDetail,
} from "@/lib/db/items";
import { getDemoUser } from "@/lib/db/user";
import { updateItemSchema } from "@/lib/validations/item";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

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

export async function deleteItem(
  itemId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Items are seeded under the demo user, matching the rest of the app.
  const demoUser = await getDemoUser();
  const deleted = await deleteItemQuery(demoUser?.id ?? null, itemId);
  if (!deleted) {
    return { success: false, error: "Item not found." };
  }

  return { success: true };
}
