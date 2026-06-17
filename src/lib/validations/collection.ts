import { z } from "zod";

const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

export const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  description: z
    .preprocess(emptyToNull, z.string().trim().nullable())
    .default(null),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

export const updateCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  description: z
    .preprocess(emptyToNull, z.string().trim().nullable())
    .default(null),
});

export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
