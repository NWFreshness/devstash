"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import type { SearchItem } from "@/lib/db/items";
import type { SearchCollection } from "@/lib/db/collections";
import { CommandPalette } from "@/components/search/command-palette";

interface Props {
  items: SearchItem[];
  collections: SearchCollection[];
}

export function SearchTrigger({ items, collections }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex h-9 w-full max-w-md items-center rounded-md border bg-transparent px-3 py-1 text-sm text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Search className="mr-2 size-4 shrink-0" />
        <span className="flex-1 text-left">Search items...</span>
        <kbd className="ml-2 rounded border bg-muted px-1.5 py-0.5 text-[0.7rem] font-medium">
          ⌘K
        </kbd>
      </button>

      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={items}
        collections={collections}
      />
    </>
  );
}
