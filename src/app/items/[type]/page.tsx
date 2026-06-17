import { Folder, Plus } from "lucide-react";
import { notFound } from "next/navigation";

import { getItemsByType, getSystemType } from "@/lib/db/items";
import { getDemoUser } from "@/lib/db/user";
import { CREATE_ITEM_TYPES } from "@/lib/validations/item";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/items/item-card";
import { ImageThumbnailCard } from "@/components/items/image-thumbnail-card";
import { FileListRow } from "@/components/items/file-list-row";
import { CreateItemDialog } from "@/components/items/create-item-dialog";
import { iconByName } from "@/components/dashboard/type-icons";
import { FALLBACK_COLOR } from "@/lib/item-type-sets";

export default async function ItemsByTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: typeSlug } = await params;

  const systemType = await getSystemType(typeSlug);
  if (!systemType) notFound();

  const user = await getDemoUser();
  const items = await getItemsByType(user?.id ?? null, typeSlug);

  const Icon = iconByName[systemType.icon ?? ""] ?? Folder;
  const color = systemType.color ?? FALLBACK_COLOR;
  const isCreatable = (CREATE_ITEM_TYPES as readonly string[]).includes(
    typeSlug
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-muted">
          <Icon className="size-5" style={{ color }} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {systemType.name}
          </h1>
          <p className="text-muted-foreground">
            {items.length} item{items.length === 1 ? "" : "s"}
          </p>
        </div>
        {isCreatable && (
          <CreateItemDialog
            defaultType={typeSlug as (typeof CREATE_ITEM_TYPES)[number]}
            triggerElement={
              <Button size="sm">
                <Plus />
                Add {systemType.name}
              </Button>
            }
          />
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground">
          No {systemType.name.toLowerCase()} yet.
        </p>
      ) : typeSlug === "image" ? (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ImageThumbnailCard key={item.id} item={item} />
          ))}
        </div>
      ) : typeSlug === "file" ? (
        <div className="flex flex-col">
          {items.map((item) => (
            <FileListRow key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
