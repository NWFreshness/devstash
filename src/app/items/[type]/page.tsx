import { Folder, Plus } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getItemsByType, getSystemType } from "@/lib/db/items";
import { getDemoUser } from "@/lib/db/user";
import { ITEMS_PER_PAGE, totalPages } from "@/lib/pagination";
import { CREATE_ITEM_TYPES } from "@/lib/validations/item";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { ItemCard } from "@/components/items/item-card";
import { ImageThumbnailCard } from "@/components/items/image-thumbnail-card";
import { FileListRow } from "@/components/items/file-list-row";
import { CreateItemDialog } from "@/components/items/create-item-dialog";
import { iconByName } from "@/components/dashboard/type-icons";
import { FALLBACK_COLOR } from "@/lib/item-type-sets";

const PRO_ONLY_TYPES = new Set(["file", "image"]);

export default async function ItemsByTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { type: typeSlug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const systemType = await getSystemType(typeSlug);
  if (!systemType) notFound();

  const [user, session] = await Promise.all([getDemoUser(), auth()]);
  const isPro = session?.user?.isPro ?? false;

  if (PRO_ONLY_TYPES.has(typeSlug) && !isPro) {
    redirect("/upgrade");
  }

  const { items, total } = await getItemsByType(user?.id ?? null, typeSlug, page);
  const numPages = totalPages(total, ITEMS_PER_PAGE);

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
            {total} item{total === 1 ? "" : "s"}
          </p>
        </div>
        {isCreatable && (
          <CreateItemDialog
            defaultType={typeSlug as (typeof CREATE_ITEM_TYPES)[number]}
            isPro={isPro}
            triggerElement={
              <Button size="sm">
                <Plus />
                Add {systemType.name}
              </Button>
            }
          />
        )}
      </div>

      {total === 0 ? (
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

      <Pagination page={page} totalPages={numPages} basePath={`/items/${typeSlug}`} />
    </div>
  );
}
