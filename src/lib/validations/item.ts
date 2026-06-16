import { z } from "zod";

// Treat blank/whitespace-only strings as null so optional fields clear cleanly.
const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

export const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z
    .preprocess(emptyToNull, z.string().trim().nullable())
    .default(null),
  // Content preserves whitespace (it may be code) — no trim.
  content: z.preprocess(emptyToNull, z.string().nullable()).default(null),
  url: z
    .preprocess(emptyToNull, z.url("Must be a valid URL.").nullable())
    .default(null),
  language: z
    .preprocess(emptyToNull, z.string().trim().nullable())
    .default(null),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;
