import Link from "next/link";
import { Star } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CreateCollectionDialog } from "@/components/collections/create-collection-dialog";
import { CreateItemDialog } from "@/components/items/create-item-dialog";
import { SearchTrigger } from "@/components/search/search-trigger";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SearchItem } from "@/lib/db/items";
import type { SearchCollection } from "@/lib/db/collections";

export function TopBar({
  collections,
  searchItems,
  searchCollections,
  isPro,
}: {
  collections: { id: string; name: string }[];
  searchItems: SearchItem[];
  searchCollections: SearchCollection[];
  isPro: boolean;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <SearchTrigger items={searchItems} collections={searchCollections} />
      <div className="ml-auto flex items-center gap-2">
        {!isPro && (
          <Link
            href="/upgrade"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground hover:text-foreground")}
          >
            Upgrade
          </Link>
        )}
        <Link
          href="/favorites"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Favorites"
          title="Favorites"
        >
          <Star size={16} aria-hidden />
        </Link>
        <CreateCollectionDialog />
        <CreateItemDialog collections={collections} />
      </div>
    </header>
  );
}
