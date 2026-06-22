"use client";

import { createContext, useCallback, useContext, useState } from "react";

import type { ItemDetail } from "@/lib/db/items";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { ItemDetailView } from "@/components/items/item-detail-view";

const ItemDrawerContext = createContext<(id: string) => void>(() => {});

export function useItemDrawer() {
  return useContext(ItemDrawerContext);
}

function DrawerSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export function ItemDrawerProvider({
  children,
  collections,
  isPro = false,
}: {
  children: React.ReactNode;
  collections: { id: string; name: string }[];
  isPro?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const openItem = useCallback(async (id: string) => {
    setDetail(null);
    setLoading(true);
    setOpen(true);
    const res = await fetch(`/api/items/${id}`);
    if (res.ok) setDetail(await res.json());
    setLoading(false);
  }, []);

  return (
    <ItemDrawerContext.Provider value={openItem}>
      {children}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-lg">
          {loading || !detail ? (
            <DrawerSkeleton />
          ) : (
            <ItemDetailView
              detail={detail}
              onUpdated={setDetail}
              onDeleted={() => setOpen(false)}
              collections={collections}
              isPro={isPro}
            />
          )}
        </SheetContent>
      </Sheet>
    </ItemDrawerContext.Provider>
  );
}
