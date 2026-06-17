"use server";

import { auth } from "@/auth";
import { createCollection as createCollectionQuery } from "@/lib/db/collections";
import { getDemoUser } from "@/lib/db/user";
import { createCollectionSchema } from "@/lib/validations/collection";

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
