import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkAiRateLimit: vi.fn() }));
vi.mock("@/lib/openai", () => ({
  AI_MODEL: "gpt-5-nano",
  getOpenAIClient: vi.fn(),
}));

import { auth } from "@/auth";
import { checkAiRateLimit } from "@/lib/rate-limit";
import { getOpenAIClient } from "@/lib/openai";
import { generateAutoTags } from "./ai";

const mockAuth = vi.mocked(auth);
const mockCheckAiRateLimit = vi.mocked(checkAiRateLimit);
const mockGetOpenAIClient = vi.mocked(getOpenAIClient);

function makeSession(isPro = true) {
  return { user: { id: "user-1", isPro } };
}

function makeClient(outputText: string) {
  return {
    responses: {
      create: vi.fn().mockResolvedValue({ output_text: outputText }),
    },
  };
}

describe("generateAutoTags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckAiRateLimit.mockResolvedValue(null);
  });

  it("returns Unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await generateAutoTags({ title: "test", typeSlug: "snippet" });
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns Pro gate error for free users", async () => {
    mockAuth.mockResolvedValue(makeSession(false) as never);
    const result = await generateAutoTags({ title: "test", typeSlug: "snippet" });
    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toContain("Pro feature");
  });

  it("returns validation error for empty title", async () => {
    mockAuth.mockResolvedValue(makeSession() as never);
    const result = await generateAutoTags({ title: "", typeSlug: "snippet" });
    expect(result.success).toBe(false);
  });

  it("returns rate limit error when limit exceeded", async () => {
    mockAuth.mockResolvedValue(makeSession() as never);
    mockCheckAiRateLimit.mockResolvedValue("AI rate limit reached. Please try again in 30 minutes.");
    const result = await generateAutoTags({ title: "test", typeSlug: "snippet" });
    expect(result).toEqual({
      success: false,
      error: "AI rate limit reached. Please try again in 30 minutes.",
    });
  });

  it("returns tags from {tags: [...]} response shape", async () => {
    mockAuth.mockResolvedValue(makeSession() as never);
    mockGetOpenAIClient.mockReturnValue(
      makeClient(JSON.stringify({ tags: ["react", "hooks", "typescript"] })) as never,
    );
    const result = await generateAutoTags({ title: "React hooks guide", typeSlug: "snippet" });
    expect(result).toEqual({ success: true, data: ["react", "hooks", "typescript"] });
  });

  it("returns tags from array response shape", async () => {
    mockAuth.mockResolvedValue(makeSession() as never);
    mockGetOpenAIClient.mockReturnValue(
      makeClient(JSON.stringify(["python", "async", "api"])) as never,
    );
    const result = await generateAutoTags({ title: "Python async example", typeSlug: "snippet" });
    expect(result).toEqual({ success: true, data: ["python", "async", "api"] });
  });

  it("normalizes tags to lowercase", async () => {
    mockAuth.mockResolvedValue(makeSession() as never);
    mockGetOpenAIClient.mockReturnValue(
      makeClient(JSON.stringify({ tags: ["React", "TypeScript", "NODE"] })) as never,
    );
    const result = await generateAutoTags({ title: "test", typeSlug: "snippet" });
    expect(result).toEqual({ success: true, data: ["react", "typescript", "node"] });
  });

  it("caps tags at 5", async () => {
    mockAuth.mockResolvedValue(makeSession() as never);
    mockGetOpenAIClient.mockReturnValue(
      makeClient(JSON.stringify({ tags: ["a", "b", "c", "d", "e", "f", "g"] })) as never,
    );
    const result = await generateAutoTags({ title: "test", typeSlug: "snippet" });
    expect(result.success).toBe(true);
    expect((result as { success: true; data: string[] }).data).toHaveLength(5);
  });

  it("returns AI service error on OpenAI failure", async () => {
    mockAuth.mockResolvedValue(makeSession() as never);
    mockGetOpenAIClient.mockReturnValue({
      responses: {
        create: vi.fn().mockRejectedValue(new Error("network error")),
      },
    } as never);
    const result = await generateAutoTags({ title: "test", typeSlug: "snippet" });
    expect(result).toEqual({ success: false, error: "AI service error. Please try again." });
  });
});
