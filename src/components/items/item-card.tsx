"use client";

import { Copy, Folder, Pin, Star } from "lucide-react";

import type { ItemWithMeta } from "@/lib/db/items";
import { Badge } from "@/components/ui/badge";
import { iconByName } from "@/components/dashboard/type-icons";
import { useItemDrawer } from "@/components/items/item-drawer";
import { FALLBACK_COLOR } from "@/lib/item-type-sets";

export function ItemCard({ item }: { item: ItemWithMeta }) {
  const Icon = iconByName[item.type.icon ?? ""] ?? Folder;
  const color = item.type.color ?? FALLBACK_COLOR;
  const openItem = useItemDrawer();

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    const text = item.content ?? item.url ?? item.title;
    navigator.clipboard.writeText(text);
  }

  return (
    <button
      type="button"
      onClick={() => openItem(item.id)}
      className="group flex flex-col gap-3 rounded-lg border-l-2 p-4 text-left ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="size-4" style={{ color }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-medium">{item.title}</span>
            {item.isPinned && (
              <Pin className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            {item.isFavorite && (
              <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
            )}
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy"
              className="ml-auto rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
            >
              <Copy className="size-3.5" />
            </button>
          </div>
          {item.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        <Badge
          variant="secondary"
          style={{ color, borderColor: color }}
          className="border bg-transparent"
        >
          {item.type.slug}
        </Badge>
        {item.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
    </button>
  );
}
