"use server";

import { getOpenAIClient, AI_MODEL } from "@/lib/openai";
import { checkAiRateLimit } from "@/lib/rate-limit";
import { getAuthSession, parseOrError } from "@/lib/action-helpers";
import type { ActionResult } from "@/types/actions";
import { z } from "zod";

async function callOpenAI(
  instructions: string,
  input: string,
  format?: { type: "json_object" },
): Promise<{ text: string } | { error: string }> {
  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions,
      input,
      ...(format ? { text: { format } } : {}),
    });
    const text = response.output_text.trim();
    if (!text) return { error: "No response generated. Please try again." };
    return { text };
  } catch {
    return { error: "AI service error. Please try again." };
  }
}

const generateDescriptionSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  url: z.string().optional(),
  typeSlug: z.string().min(1),
});

export async function generateDescription(
  input: unknown,
): Promise<ActionResult<string>> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: "Unauthorized" };
  if (!session.user.isPro) {
    return { success: false, error: "AI descriptions are a Pro feature. Upgrade to use it." };
  }

  const descParsed = parseOrError(generateDescriptionSchema, input);
  if (!descParsed.ok) return { success: false, error: descParsed.error };

  const rateLimitError = await checkAiRateLimit(session.user.id);
  if (rateLimitError) return { success: false, error: rateLimitError };

  const { title, content, url, typeSlug } = descParsed.data;
  const truncatedContent = (content ?? "").slice(0, 2000);
  const contextParts = [`Title: ${title}`];
  if (url) contextParts.push(`URL: ${url}`);
  if (truncatedContent) contextParts.push(`Content: ${truncatedContent}`);

  const result = await callOpenAI(
    "You are a developer knowledge base assistant. Write a concise 1-2 sentence description for the given item. Return only the description text — no labels, quotes, or extra formatting.",
    `Write a short description for this ${typeSlug}:\n${contextParts.join("\n")}`,
  );
  if ("error" in result) return { success: false, error: result.error };
  return { success: true, data: result.text };
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
  const session = await getAuthSession();
  if (!session) return { success: false, error: "Unauthorized" };
  if (!session.user.isPro) {
    return { success: false, error: "AI features require Pro subscription." };
  }

  const explainParsed = parseOrError(explainCodeSchema, input);
  if (!explainParsed.ok) return { success: false, error: explainParsed.error };

  const rateLimitError = await checkAiRateLimit(session.user.id);
  if (rateLimitError) return { success: false, error: rateLimitError };

  const { title, content, typeSlug, language } = explainParsed.data;
  const truncatedContent = content.slice(0, 3000);
  const langHint = language && language !== "plaintext" ? ` (${language})` : "";

  const result = await callOpenAI(
    "You are a developer assistant. Explain the given code or command concisely in 200-300 words. Cover what it does, how it works, and any key concepts. Use markdown formatting.",
    `Explain this ${typeSlug}${langHint}:\nTitle: ${title}\n\n\`\`\`\n${truncatedContent}\n\`\`\``,
  );
  if ("error" in result) return { success: false, error: result.error };
  return { success: true, data: result.text };
}

const optimizePromptSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  typeSlug: z.literal("prompt"),
});

export async function optimizePrompt(
  input: unknown,
): Promise<ActionResult<string>> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: "Unauthorized" };
  if (!session.user.isPro) {
    return { success: false, error: "AI features require Pro subscription." };
  }

  const optimizeParsed = parseOrError(optimizePromptSchema, input);
  if (!optimizeParsed.ok) return { success: false, error: optimizeParsed.error };

  const rateLimitError = await checkAiRateLimit(session.user.id);
  if (rateLimitError) return { success: false, error: rateLimitError };

  const { title, content } = optimizeParsed.data;
  const truncatedContent = content.slice(0, 3000);

  const result = await callOpenAI(
    "You are a prompt engineering expert. Rewrite the given LLM prompt to be clearer, more specific, and more effective. Preserve the original intent. Return only the improved prompt text — no explanations, no labels, no quotes.",
    `Optimize this prompt:\nTitle: ${title}\n\n${truncatedContent}`,
  );
  if ("error" in result) return { success: false, error: result.error };
  return { success: true, data: result.text };
}

const generateAutoTagsSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  typeSlug: z.string().min(1),
});

export async function generateAutoTags(
  input: unknown,
): Promise<ActionResult<string[]>> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: "Unauthorized" };
  if (!session.user.isPro) {
    return { success: false, error: "Auto-tagging is a Pro feature. Upgrade to use it." };
  }

  const tagsParsed = parseOrError(generateAutoTagsSchema, input);
  if (!tagsParsed.ok) return { success: false, error: tagsParsed.error };

  const rateLimitError = await checkAiRateLimit(session.user.id);
  if (rateLimitError) return { success: false, error: rateLimitError };

  const { title, content, typeSlug } = tagsParsed.data;
  const truncatedContent = (content ?? "").slice(0, 2000);

  const result = await callOpenAI(
    "You are a developer knowledge base assistant. Return a JSON object with a 'tags' array of 3-5 short, relevant tags. Tags must be lowercase; use hyphens for multi-word tags.",
    `Suggest tags for this ${typeSlug} and return json:\nTitle: ${title}${truncatedContent ? `\nContent: ${truncatedContent}` : ""}`,
    { type: "json_object" },
  );
  if ("error" in result) return { success: false, error: result.error };

  try {
    const raw: unknown = JSON.parse(result.text);
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
