import { describe, it, expect } from "vitest";
import {
  isAtItemLimit,
  isAtCollectionLimit,
  FREE_ITEM_LIMIT,
  FREE_COLLECTION_LIMIT,
} from "./usage-limits";

describe("isAtItemLimit", () => {
  it("returns false for pro user regardless of count", () => {
    expect(isAtItemLimit(true, FREE_ITEM_LIMIT)).toBe(false);
    expect(isAtItemLimit(true, FREE_ITEM_LIMIT + 100)).toBe(false);
  });

  it("returns false when free user is below limit", () => {
    expect(isAtItemLimit(false, 0)).toBe(false);
    expect(isAtItemLimit(false, FREE_ITEM_LIMIT - 1)).toBe(false);
  });

  it("returns true when free user is at limit", () => {
    expect(isAtItemLimit(false, FREE_ITEM_LIMIT)).toBe(true);
  });

  it("returns true when free user is above limit", () => {
    expect(isAtItemLimit(false, FREE_ITEM_LIMIT + 1)).toBe(true);
  });
});

describe("isAtCollectionLimit", () => {
  it("returns false for pro user regardless of count", () => {
    expect(isAtCollectionLimit(true, FREE_COLLECTION_LIMIT)).toBe(false);
    expect(isAtCollectionLimit(true, FREE_COLLECTION_LIMIT + 100)).toBe(false);
  });

  it("returns false when free user is below limit", () => {
    expect(isAtCollectionLimit(false, 0)).toBe(false);
    expect(isAtCollectionLimit(false, FREE_COLLECTION_LIMIT - 1)).toBe(false);
  });

  it("returns true when free user is at limit", () => {
    expect(isAtCollectionLimit(false, FREE_COLLECTION_LIMIT)).toBe(true);
  });

  it("returns true when free user is above limit", () => {
    expect(isAtCollectionLimit(false, FREE_COLLECTION_LIMIT + 1)).toBe(true);
  });
});
