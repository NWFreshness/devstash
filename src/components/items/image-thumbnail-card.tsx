"use client";

import { Pin, Star } from "lucide-react";

import type { ItemWithMeta } from "@/lib/db/items";
import { useItemDrawer } from "@/components/items/item-drawer";

export function ImageThumbnailCard({ item }: { item: ItemWithMeta }) {
  const openItem = useItemDrawer();

  return (
    <button
      type="button"
      onClick={() => openItem(item.id)}
      className="group relative overflow-hidden rounded-lg ring-1 ring-foreground/10 transition-shadow hover:ring-foreground/25"
    >
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {item.fileUrl ? (
          <img
            src={`/api/download/${item.fileUrl}`}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
            No preview
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 p-2">
        <span className="flex-1 truncate text-left text-sm font-medium">
          {item.title}
        </span>
        {item.isPinned && (
          <Pin className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        {item.isFavorite && (
          <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
        )}
      </div>
    </button>
  );
}
