import { getAllCollections } from "@/lib/db/collections";
import { getDemoUser } from "@/lib/db/user";
import { CollectionCard } from "@/components/dashboard/collection-card";

export default async function CollectionsPage() {
  const user = await getDemoUser();
  const collections = await getAllCollections(user?.id ?? null);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
        <p className="text-muted-foreground">
          {collections.length} {collections.length === 1 ? "collection" : "collections"}
        </p>
      </div>

      {collections.length === 0 ? (
        <p className="text-muted-foreground">No collections yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              href={`/collections/${collection.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
