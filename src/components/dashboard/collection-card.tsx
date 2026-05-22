import { Folder, MoreHorizontal, Star } from "lucide-react";

import type { Collection } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Card
      size="sm"
      className="border-l-2 transition-colors hover:bg-muted/30"
      style={{ borderLeftColor: collection.color }}
    >
      <CardHeader>
        <CardTitle className="flex min-w-0 items-center gap-2">
          <Folder className="size-4 shrink-0" style={{ color: collection.color }} />
          <span className="truncate">{collection.name}</span>
          {collection.isFavorite && (
            <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
          )}
        </CardTitle>
        <CardAction>
          <Button variant="ghost" size="icon-xs" aria-label="Collection options">
            <MoreHorizontal />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-xs text-muted-foreground">{collection.itemCount} items</p>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {collection.description}
        </p>
      </CardContent>
    </Card>
  );
}
