"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Folder } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteItemRow } from "@/components/favorites/favorite-item-row";
import { iconByName } from "@/components/dashboard/type-icons";
import { FALLBACK_COLOR } from "@/lib/item-type-sets";
import type { FavoriteItem } from "@/lib/db/items";
import type { FavoriteCollection } from "@/lib/db/collections";

type ItemSortKey = "date" | "name" | "type";
type CollectionSortKey = "date" | "name";
type SortDir = "asc" | "desc";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function SortButton({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-xs px-1.5 py-0.5 rounded transition-colors ${
        active
          ? "text-foreground bg-accent"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {active && <span className="ml-1 opacity-60">{dir === "asc" ? "↑" : "↓"}</span>}
    </button>
  );
}

function useSortToggle<K extends string>(defaultKey: K) {
  const [key, setKey] = useState<K>(defaultKey);
  const [dir, setDir] = useState<SortDir>("desc");

  function toggle(next: K) {
    if (next === key) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setKey(next);
      setDir(next === "name" || next === "type" ? "asc" : "desc");
    }
  }

  return { key, dir, toggle };
}

interface Props {
  items: FavoriteItem[];
  collections: FavoriteCollection[];
}

export function FavoritesList({ items, collections }: Props) {
  const itemSort = useSortToggle<ItemSortKey>("date");
  const colSort = useSortToggle<CollectionSortKey>("date");

  const sortedItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      if (itemSort.key === "name") return a.title.localeCompare(b.title);
      if (itemSort.key === "type") return a.type.slug.localeCompare(b.type.slug);
      return a.updatedAt.getTime() - b.updatedAt.getTime();
    });
    return itemSort.dir === "desc" ? sorted.reverse() : sorted;
  }, [items, itemSort.key, itemSort.dir]);

  const sortedCollections = useMemo(() => {
    const sorted = [...collections].sort((a, b) => {
      if (colSort.key === "name") return a.name.localeCompare(b.name);
      return a.updatedAt.getTime() - b.updatedAt.getTime();
    });
    return colSort.dir === "desc" ? sorted.reverse() : sorted;
  }, [collections, colSort.key, colSort.dir]);

  return (
    <div className="max-w-3xl space-y-8">
      {items.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-xs text-muted-foreground">
              items <span className="text-foreground">{items.length}</span>
            </p>
            <div className="flex items-center gap-0.5">
              <SortButton label="date" active={itemSort.key === "date"} dir={itemSort.dir} onClick={() => itemSort.toggle("date")} />
              <SortButton label="name" active={itemSort.key === "name"} dir={itemSort.dir} onClick={() => itemSort.toggle("name")} />
              <SortButton label="type" active={itemSort.key === "type"} dir={itemSort.dir} onClick={() => itemSort.toggle("type")} />
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {sortedItems.map((item) => {
              const Icon = iconByName[item.type.icon ?? ""] ?? Folder;
              const color = item.type.color ?? FALLBACK_COLOR;
              return (
                <FavoriteItemRow
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  typeSlug={item.type.slug}
                  icon={<Icon size={14} style={{ color }} />}
                  date={formatDate(item.updatedAt)}
                />
              );
            })}
          </div>
        </section>
      )}

      {collections.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-xs text-muted-foreground">
              collections <span className="text-foreground">{collections.length}</span>
            </p>
            <div className="flex items-center gap-0.5">
              <SortButton label="date" active={colSort.key === "date"} dir={colSort.dir} onClick={() => colSort.toggle("date")} />
              <SortButton label="name" active={colSort.key === "name"} dir={colSort.dir} onClick={() => colSort.toggle("name")} />
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {sortedCollections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className="flex items-center gap-3 py-2 px-1 text-sm hover:bg-accent/40 transition-colors rounded group"
              >
                <Folder size={14} className="text-muted-foreground shrink-0" />
                <span className="font-mono flex-1 truncate">{col.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {col.itemCount} {col.itemCount === 1 ? "item" : "items"}
                </span>
                <span className="font-mono text-xs text-muted-foreground/60 w-24 text-right">
                  {formatDate(col.updatedAt)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
