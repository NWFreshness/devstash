import { collections, items } from "@/lib/mock-data";
import { CollectionCard } from "@/components/dashboard/collection-card";
import { ItemRow } from "@/components/dashboard/item-row";
import { StatCards } from "@/components/dashboard/stat-cards";

export default function DashboardPage() {
  const recentItems = [...items]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);
  const pinnedItems = items.filter((item) => item.isPinned);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your developer knowledge hub</p>
      </div>

      <StatCards />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Collections</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      {pinnedItems.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Pinned</h2>
          <div className="space-y-2">
            {pinnedItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Items</h2>
        <div className="space-y-2">
          {recentItems.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
