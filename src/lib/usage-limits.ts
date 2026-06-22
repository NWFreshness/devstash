export const FREE_ITEM_LIMIT = 50;
export const FREE_COLLECTION_LIMIT = 3;

export function isAtItemLimit(isPro: boolean, itemCount: number): boolean {
  return !isPro && itemCount >= FREE_ITEM_LIMIT;
}

export function isAtCollectionLimit(isPro: boolean, collectionCount: number): boolean {
  return !isPro && collectionCount >= FREE_COLLECTION_LIMIT;
}
