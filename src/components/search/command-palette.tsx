"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Folder, Search } from "lucide-react";

import type { SearchItem } from "@/lib/db/items";
import type { SearchCollection } from "@/lib/db/collections";
import { useItemDrawer } from "@/components/items/item-drawer";
import { iconByName } from "@/components/dashboard/type-icons";
import { FALLBACK_COLOR } from "@/lib/item-type-sets";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SearchItem[];
  collections: SearchCollection[];
}

export function CommandPalette({ open, onOpenChange, items, collections }: Props) {
  const router = useRouter();
  const openItem = useItemDrawer();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  function selectItem(id: string) {
    onOpenChange(false);
    openItem(id);
  }

  function selectCollection(id: string) {
    onOpenChange(false);
    router.push(`/collections/${id}`);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border bg-popover shadow-2xl">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search items and collections..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        <Command.List className="max-h-[360px] overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          {items.length > 0 && (
            <Command.Group
              heading="Items"
              className="[&_[cmdk-group-heading]]:mb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              {items.map((item) => {
                const Icon = item.type.icon ? iconByName[item.type.icon] : null;
                const color = item.type.color ?? FALLBACK_COLOR;
                return (
                  <Command.Item
                    key={item.id}
                    value={`item:${item.id}:${item.title}:${item.type.slug}`}
                    onSelect={() => selectItem(item.id)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    <span
                      className="flex size-6 shrink-0 items-center justify-center rounded"
                      style={{ backgroundColor: color + "22", color }}
                    >
                      {Icon ? <Icon className="size-3.5" /> : null}
                    </span>
                    <span className="truncate">{item.title}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {item.type.slug}
                    </span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}

          {collections.length > 0 && (
            <Command.Group
              heading="Collections"
              className="[&_[cmdk-group-heading]]:mb-1 [&_[cmdk-group-heading]]:mt-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              {collections.map((col) => (
                <Command.Item
                  key={col.id}
                  value={`collection:${col.id}:${col.name}`}
                  onSelect={() => selectCollection(col.id)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                    <Folder className="size-3.5" />
                  </span>
                  <span className="truncate">{col.name}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {col.itemCount} {col.itemCount === 1 ? "item" : "items"}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
