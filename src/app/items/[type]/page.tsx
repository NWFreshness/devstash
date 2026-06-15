import { Folder } from "lucide-react";
import { notFound } from "next/navigation";

import { getItemsByType, getSystemType } from "@/lib/db/items";
import { getDemoUser } from "@/lib/db/user";
import { ItemCard } from "@/components/items/item-card";
import { iconByName } from "@/components/dashboard/type-icons";

const FALLBACK_COLOR = "var(--muted-foreground)";

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

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-muted">
          <Icon className="size-5" style={{ color }} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {systemType.name}
          </h1>
          <p className="text-muted-foreground">
            {items.length} item{items.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground">
          No {systemType.name.toLowerCase()} yet.
        </p>
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
