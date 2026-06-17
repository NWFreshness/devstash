import { Folder } from "lucide-react";
import { notFound } from "next/navigation";

import { getCollectionById } from "@/lib/db/collections";
import { getItemsByCollection } from "@/lib/db/items";
import { getDemoUser } from "@/lib/db/user";
import { FALLBACK_COLOR } from "@/lib/item-type-sets";
import { ItemCard } from "@/components/items/item-card";
import { ImageThumbnailCard } from "@/components/items/image-thumbnail-card";
import { FileListRow } from "@/components/items/file-list-row";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getDemoUser();

  const [collection, items] = await Promise.all([
    getCollectionById(user?.id ?? null, id),
    getItemsByCollection(user?.id ?? null, id),
  ]);

  if (!collection) notFound();

  const accent = collection.primaryType?.color ?? FALLBACK_COLOR;

  const imageItems = items.filter((i) => i.type.slug === "image");
  const fileItems = items.filter((i) => i.type.slug === "file");
  const otherItems = items.filter(
    (i) => i.type.slug !== "image" && i.type.slug !== "file",
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-muted">
          <Folder className="size-5" style={{ color: accent }} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-muted-foreground">{collection.description}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground">No items in this collection yet.</p>
      ) : (
        <div className="space-y-8">
          {imageItems.length > 0 && (
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
              {imageItems.map((item) => (
                <ImageThumbnailCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {fileItems.length > 0 && (
            <div className="flex flex-col">
              {fileItems.map((item) => (
                <FileListRow key={item.id} item={item} />
              ))}
            </div>
          )}

          {otherItems.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {otherItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
