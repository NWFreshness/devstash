"use client";

import { Copy, Folder, Pin, Star } from "lucide-react";

import type { ItemWithMeta } from "@/lib/db/items";
import { Badge } from "@/components/ui/badge";
import { iconByName } from "@/components/dashboard/type-icons";
import { useItemDrawer } from "@/components/items/item-drawer";
import { FALLBACK_COLOR } from "@/lib/item-type-sets";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const CURRENT_YEAR = new Date().getFullYear();

function formatDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = MONTHS[date.getUTCMonth()];
  const day = date.getUTCDate();
  return year !== CURRENT_YEAR ? `${month} ${day}, ${year}` : `${month} ${day}`;
}

export function ItemRow({ item }: { item: ItemWithMeta }) {
  const Icon = iconByName[item.type.icon ?? ""] ?? Folder;
  const color = item.type.color ?? FALLBACK_COLOR;
  const openItem = useItemDrawer();

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    const text = item.content ?? item.url ?? item.title;
    navigator.clipboard.writeText(text);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openItem(item.id);
    }
  }

  return (
    // div instead of button to avoid invalid nested-button HTML (Copy is a child button)
    <div
      role="button"
      tabIndex={0}
      onClick={() => openItem(item.id)}
      onKeyDown={handleKeyDown}
      className="group flex w-full cursor-pointer items-start gap-3 rounded-lg border-l-2 p-3 text-left ring-1 ring-foreground/10 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ borderLeftColor: color }}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-4" style={{ color }} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-medium">{item.title}</span>
          {item.isPinned && (
            <Pin className="size-3.5 shrink-0 text-muted-foreground" aria-label="Pinned" />
          )}
          {item.isFavorite && (
            <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" aria-label="Favorited" />
          )}
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy ${item.title}`}
            className="ml-auto rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Copy className="size-3.5" aria-hidden />
          </button>
        </div>
        {item.description && (
          <p className="truncate text-sm text-muted-foreground">
            {item.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-1">
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
      </div>
      <time
        className="shrink-0 text-xs text-muted-foreground"
        dateTime={item.createdAt.toISOString()}
      >
        {formatDate(item.createdAt)}
      </time>
    </div>
  );
}
