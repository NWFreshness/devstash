import Link from "next/link";
import { Folder, Star } from "lucide-react";
import { getDemoUser } from "@/lib/db/user";
import { getFavoriteItems } from "@/lib/db/items";
import { getFavoriteCollections } from "@/lib/db/collections";
import { iconByName } from "@/components/dashboard/type-icons";
import { FALLBACK_COLOR } from "@/lib/item-type-sets";
import { FavoriteItemRow } from "@/components/favorites/favorite-item-row";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

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
    <div className="max-w-3xl space-y-8">
      <h1 className="font-mono text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        Favorites
      </h1>

      {items.length > 0 && (
        <section>
          <p className="font-mono text-xs text-muted-foreground mb-2">
            items <span className="text-foreground">{items.length}</span>
          </p>
          <div className="divide-y divide-border/50">
            {items.map((item) => {
              const Icon = iconByName[item.type.icon ?? ""] ?? Folder;
              const color = item.type.color ?? FALLBACK_COLOR;
              return (
                <FavoriteItemRow
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  typeSlug={item.type.slug}
                  icon={<Icon size={14} style={{ color }} />}
                  date={formatDate(item.updatedAt)}
                />
              );
            })}
          </div>
        </section>
      )}

      {collections.length > 0 && (
        <section>
          <p className="font-mono text-xs text-muted-foreground mb-2">
            collections <span className="text-foreground">{collections.length}</span>
          </p>
          <div className="divide-y divide-border/50">
            {collections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className="flex items-center gap-3 py-2 px-1 text-sm hover:bg-accent/40 transition-colors rounded group"
              >
                <Folder size={14} className="text-muted-foreground shrink-0" />
                <span className="font-mono flex-1 truncate">{col.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {col.itemCount} {col.itemCount === 1 ? "item" : "items"}
                </span>
                <span className="font-mono text-xs text-muted-foreground/60 w-24 text-right">
                  {formatDate(col.updatedAt)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
