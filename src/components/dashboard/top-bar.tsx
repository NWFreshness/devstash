import { SidebarTrigger } from "@/components/ui/sidebar";
import { CreateCollectionDialog } from "@/components/collections/create-collection-dialog";
import { CreateItemDialog } from "@/components/items/create-item-dialog";
import { SearchTrigger } from "@/components/search/search-trigger";
import type { SearchItem } from "@/lib/db/items";
import type { SearchCollection } from "@/lib/db/collections";

export function TopBar({
  collections,
  searchItems,
  searchCollections,
}: {
  collections: { id: string; name: string }[];
  searchItems: SearchItem[];
  searchCollections: SearchCollection[];
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <SearchTrigger items={searchItems} collections={searchCollections} />
      <div className="ml-auto flex items-center gap-2">
        <CreateCollectionDialog />
        <CreateItemDialog collections={collections} />
      </div>
    </header>
  );
}
