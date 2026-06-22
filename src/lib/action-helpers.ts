import { z } from "zod";

import { auth } from "@/auth";

export async function getAuthSession() {
  const session = await auth();
  return session?.user?.id ? session : null;
}

type ParseResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function parseOrError<T>(schema: z.ZodType<T>, input: unknown): ParseResult<T> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  return { ok: true, data: parsed.data };
}
