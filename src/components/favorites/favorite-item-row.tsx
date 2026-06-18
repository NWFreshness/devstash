"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { useItemDrawer } from "@/components/items/item-drawer";

interface Props {
  id: string;
  title: string;
  typeSlug: string;
  icon: ReactNode;
  date: string;
}

export function FavoriteItemRow({ id, title, typeSlug, icon, date }: Props) {
  const openItem = useItemDrawer();

  return (
    <button
      onClick={() => openItem(id)}
      className="flex w-full items-center gap-3 py-2 px-1 text-sm text-left hover:bg-accent/40 transition-colors rounded group"
    >
      <span className="shrink-0">{icon}</span>
      <span className="font-mono flex-1 truncate">{title}</span>
      <Badge variant="secondary" className="font-mono text-xs shrink-0">
        {typeSlug}
      </Badge>
      <span className="font-mono text-xs text-muted-foreground/60 w-24 text-right shrink-0">
        {date}
      </span>
    </button>
  );
}
