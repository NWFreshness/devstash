import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CreateCollectionDialog } from "@/components/collections/create-collection-dialog";
import { CreateItemDialog } from "@/components/items/create-item-dialog";

/** Dashboard top bar. Search is display only; the trigger toggles the sidebar. */
export function TopBar({
  collections,
}: {
  collections: { id: string; name: string }[];
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search items..."
          className="h-9 pr-14 pl-9"
          readOnly
        />
        <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-[0.7rem] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <CreateCollectionDialog />
        <CreateItemDialog collections={collections} />
      </div>
    </header>
  );
}
