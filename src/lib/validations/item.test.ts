import { describe, it, expect } from "vitest";
import { createItemSchema, updateItemSchema } from "@/lib/validations/item";

describe("updateItemSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = updateItemSchema.parse({ title: "My Item" });
    expect(result).toEqual({
      title: "My Item",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    });
  });

  it("trims the title", () => {
    expect(updateItemSchema.parse({ title: "  Hello  " }).title).toBe("Hello");
  });

  it("rejects an empty title", () => {
    expect(updateItemSchema.safeParse({ title: "   " }).success).toBe(false);
  });

  it("coerces blank optional strings to null", () => {
    const result = updateItemSchema.parse({
      title: "x",
      description: "   ",
      language: "",
    });
    expect(result.description).toBeNull();
    expect(result.language).toBeNull();
  });

  it("preserves content whitespace (no trim)", () => {
    const result = updateItemSchema.parse({ title: "x", content: "  code  " });
    expect(result.content).toBe("  code  ");
  });

  it("accepts a valid URL and rejects an invalid one", () => {
    expect(
      updateItemSchema.safeParse({ title: "x", url: "https://example.com" })
        .success,
    ).toBe(true);
    expect(
      updateItemSchema.safeParse({ title: "x", url: "not a url" }).success,
    ).toBe(false);
  });

  it("treats a blank URL as null", () => {
    expect(updateItemSchema.parse({ title: "x", url: "" }).url).toBeNull();
  });

  it("accepts an array of tags and rejects blank tag entries", () => {
    expect(
      updateItemSchema.parse({ title: "x", tags: ["a", "b"] }).tags,
    ).toEqual(["a", "b"]);
    expect(
      updateItemSchema.safeParse({ title: "x", tags: ["ok", ""] }).success,
    ).toBe(false);
  });
});

describe("createItemSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = createItemSchema.parse({
      typeSlug: "snippet",
      title: "My Item",
    });
    expect(result).toEqual({
      typeSlug: "snippet",
      title: "My Item",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
      fileUrl: null,
      fileName: null,
      fileSize: null,
      mimeType: null,
    });
  });

  it("rejects an unknown type slug", () => {
    expect(
      createItemSchema.safeParse({ typeSlug: "regex", title: "x" }).success,
    ).toBe(false);
  });

  it("rejects an empty title", () => {
    expect(
      createItemSchema.safeParse({ typeSlug: "note", title: "   " }).success,
    ).toBe(false);
  });

  it("requires a URL for link items", () => {
    expect(
      createItemSchema.safeParse({ typeSlug: "link", title: "x" }).success,
    ).toBe(false);
    expect(
      createItemSchema.safeParse({
        typeSlug: "link",
        title: "x",
        url: "https://example.com",
      }).success,
    ).toBe(true);
  });

  it("does not require a URL for non-link items", () => {
    expect(
      createItemSchema.safeParse({ typeSlug: "snippet", title: "x" }).success,
    ).toBe(true);
  });

  it("preserves content whitespace (no trim)", () => {
    const result = createItemSchema.parse({
      typeSlug: "snippet",
      title: "x",
      content: "  code  ",
    });
    expect(result.content).toBe("  code  ");
  });
});
