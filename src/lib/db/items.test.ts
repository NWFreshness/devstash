import { beforeEach, describe, expect, it, vi } from "vitest";

import { getItemDetail } from "./items";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: { item: { findFirst: vi.fn() } },
}));

const findFirst = vi.mocked(prisma.item.findFirst);

beforeEach(() => {
  findFirst.mockReset();
});

describe("getItemDetail", () => {
  it("returns null without querying when userId is null", async () => {
    const result = await getItemDetail(null, "item-1");

    expect(result).toBeNull();
    expect(findFirst).not.toHaveBeenCalled();
  });

  it("scopes the query to both id and userId", async () => {
    findFirst.mockResolvedValue(null);

    await getItemDetail("user-1", "item-1");

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item-1", userId: "user-1" } }),
    );
  });

  it("returns null when the item is not found", async () => {
    findFirst.mockResolvedValue(null);

    expect(await getItemDetail("user-1", "missing")).toBeNull();
  });

  it("shapes the item, flattening tags and passing through collection", async () => {
    const created = new Date("2026-06-15T00:00:00Z");
    const updated = new Date("2026-06-16T00:00:00Z");
    findFirst.mockResolvedValue({
      id: "item-1",
      title: "useDebounce",
      description: "Debounce a value",
      content: "export const x = 1;",
      language: "typescript",
      url: null,
      isFavorite: true,
      isPinned: false,
      type: { name: "Snippet", slug: "snippet", icon: "code", color: "#fff" },
      collection: { name: "React Patterns" },
      tags: [{ tag: { name: "react" } }, { tag: { name: "hooks" } }],
      createdAt: created,
      updatedAt: updated,
    } as never);

    const result = await getItemDetail("user-1", "item-1");

    expect(result).toEqual({
      id: "item-1",
      title: "useDebounce",
      description: "Debounce a value",
      content: "export const x = 1;",
      language: "typescript",
      url: null,
      isFavorite: true,
      isPinned: false,
      type: { name: "Snippet", slug: "snippet", icon: "code", color: "#fff" },
      collection: { name: "React Patterns" },
      tags: ["react", "hooks"],
      createdAt: created,
      updatedAt: updated,
    });
  });

  it("returns an empty tags array and null collection when there are none", async () => {
    findFirst.mockResolvedValue({
      id: "item-2",
      title: "Standalone",
      description: null,
      content: null,
      language: null,
      url: "https://example.com",
      isFavorite: false,
      isPinned: false,
      type: { name: "URL", slug: "link", icon: "link", color: null },
      collection: null,
      tags: [],
      createdAt: new Date("2026-06-15T00:00:00Z"),
      updatedAt: new Date("2026-06-15T00:00:00Z"),
    } as never);

    const result = await getItemDetail("user-1", "item-2");

    expect(result?.tags).toEqual([]);
    expect(result?.collection).toBeNull();
  });
});
