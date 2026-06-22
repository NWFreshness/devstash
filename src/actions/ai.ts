"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai";
import { checkAiRateLimit } from "@/lib/rate-limit";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const generateAutoTagsSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  typeSlug: z.string().min(1),
});

export async function generateAutoTags(
  input: unknown,
): Promise<ActionResult<string[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }
  if (!session.user.isPro) {
    return { success: false, error: "Auto-tagging is a Pro feature. Upgrade to use it." };
  }

  const parsed = generateAutoTagsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const rateLimitError = await checkAiRateLimit(session.user.id);
  if (rateLimitError) {
    return { success: false, error: rateLimitError };
  }

  const { title, content, typeSlug } = parsed.data;
  const truncatedContent = (content ?? "").slice(0, 2000);

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer knowledge base assistant. Return a JSON object with a 'tags' array of 3-5 short, relevant tags. Tags must be lowercase; use hyphens for multi-word tags.",
      input: `Suggest tags for this ${typeSlug}:\nTitle: ${title}${truncatedContent ? `\nContent: ${truncatedContent}` : ""}`,
      text: { format: { type: "json_object" } },
    });

    const raw: unknown = JSON.parse(response.output_text);
    const arr = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as Record<string, unknown>)?.tags)
        ? ((raw as Record<string, unknown>).tags as unknown[])
        : [];

    const tags = arr
      .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      .map((t) => t.toLowerCase().trim())
      .slice(0, 5);

    return { success: true, data: tags };
  } catch {
    return { success: false, error: "AI service error. Please try again." };
  }
}
