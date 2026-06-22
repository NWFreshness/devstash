"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai";
import { checkAiRateLimit } from "@/lib/rate-limit";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const generateDescriptionSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  url: z.string().optional(),
  typeSlug: z.string().min(1),
});

export async function generateDescription(
  input: unknown,
): Promise<ActionResult<string>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }
  if (!session.user.isPro) {
    return { success: false, error: "AI descriptions are a Pro feature. Upgrade to use it." };
  }

  const parsed = generateDescriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const rateLimitError = await checkAiRateLimit(session.user.id);
  if (rateLimitError) {
    return { success: false, error: rateLimitError };
  }

  const { title, content, url, typeSlug } = parsed.data;
  const truncatedContent = (content ?? "").slice(0, 2000);

  const contextParts = [`Title: ${title}`];
  if (url) contextParts.push(`URL: ${url}`);
  if (truncatedContent) contextParts.push(`Content: ${truncatedContent}`);

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer knowledge base assistant. Write a concise 1-2 sentence description for the given item. Return only the description text — no labels, quotes, or extra formatting.",
      input: `Write a short description for this ${typeSlug}:\n${contextParts.join("\n")}`,
    });

    const description = response.output_text.trim();
    if (!description) {
      return { success: false, error: "No description generated. Please try again." };
    }
    return { success: true, data: description };
  } catch {
    return { success: false, error: "AI service error. Please try again." };
  }
}

const explainCodeSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  typeSlug: z.enum(["snippet", "command"]),
  language: z.string().optional(),
});

export async function explainCode(
  input: unknown,
): Promise<ActionResult<string>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }
  if (!session.user.isPro) {
    return { success: false, error: "AI features require Pro subscription." };
  }

  const parsed = explainCodeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const rateLimitError = await checkAiRateLimit(session.user.id);
  if (rateLimitError) {
    return { success: false, error: rateLimitError };
  }

  const { title, content, typeSlug, language } = parsed.data;
  const truncatedContent = content.slice(0, 3000);
  const langHint = language && language !== "plaintext" ? ` (${language})` : "";

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer assistant. Explain the given code or command concisely in 200-300 words. Cover what it does, how it works, and any key concepts. Use markdown formatting.",
      input: `Explain this ${typeSlug}${langHint}:\nTitle: ${title}\n\n\`\`\`\n${truncatedContent}\n\`\`\``,
    });

    const explanation = response.output_text.trim();
    if (!explanation) {
      return { success: false, error: "No explanation generated. Please try again." };
    }
    return { success: true, data: explanation };
  } catch {
    return { success: false, error: "AI service error. Please try again." };
  }
}

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
      input: `Suggest tags for this ${typeSlug} and return json:\nTitle: ${title}${truncatedContent ? `\nContent: ${truncatedContent}` : ""}`,
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
