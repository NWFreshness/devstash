import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { getRecentCollections } from "@/lib/db/collections";
import { getPinnedItems, getRecentItems } from "@/lib/db/items";
import { getDemoUser } from "@/lib/db/user";
import { DASHBOARD_COLLECTIONS_LIMIT, DASHBOARD_RECENT_ITEMS_LIMIT } from "@/lib/pagination";
import { CollectionCard } from "@/components/dashboard/collection-card";
import { ItemRow } from "@/components/dashboard/item-row";
import { StatCards } from "@/components/dashboard/stat-cards";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await getDemoUser();
  const userId = user?.id ?? null;
  const [collections, pinnedItems, recentItems] = await Promise.all([
    getRecentCollections(userId, DASHBOARD_COLLECTIONS_LIMIT),
    getPinnedItems(userId),
    getRecentItems(userId, DASHBOARD_RECENT_ITEMS_LIMIT),
  ]);

  const isEmpty = collections.length === 0 && recentItems.length === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your developer knowledge hub</p>
      </div>

      <StatCards userId={userId} />

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-center">
          <div className="rounded-full bg-muted p-4">
            <PlusCircle className="size-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Nothing here yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first item or collection to get started.
            </p>
          </div>
          <div className="flex gap-3">
            <Button render={<Link href="/items/snippet" />} size="sm">
              Browse snippets
            </Button>
          </div>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Recent Collections</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  href={`/collections/${collection.id}`}
                />
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
        </>
      )}
    </div>
  );
}
