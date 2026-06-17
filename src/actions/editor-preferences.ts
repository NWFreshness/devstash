"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { EditorPreferences } from "@/types/editor-preferences";

export async function updateEditorPreferences(
  prefs: EditorPreferences,
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { editorPreferences: prefs as unknown as Prisma.InputJsonValue },
  });

  return { success: true };
}
