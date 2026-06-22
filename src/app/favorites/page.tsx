import { Star } from "lucide-react";
import { getDemoUser } from "@/lib/db/user";
import { getFavoriteItems } from "@/lib/db/items";
import { getFavoriteCollections } from "@/lib/db/collections";
import { FavoritesList } from "@/components/favorites/favorites-list";

export default async function FavoritesPage() {
  const demoUser = await getDemoUser();
  const userId = demoUser?.id ?? null;

  const [items, collections] = await Promise.all([
    getFavoriteItems(userId),
    getFavoriteCollections(userId),
  ]);

  const isEmpty = items.length === 0 && collections.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
        <Star size={32} strokeWidth={1.5} />
        <p className="font-mono text-sm">No favorites yet</p>
        <p className="font-mono text-xs">Star items or collections to find them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-mono text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        Favorites
      </h1>
      <FavoritesList items={items} collections={collections} />
    </div>
  );
}
