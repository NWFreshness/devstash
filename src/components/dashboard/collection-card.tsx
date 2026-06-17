import Link from "next/link";
import { Folder, MoreHorizontal, Star } from "lucide-react";

import type { CollectionWithMeta } from "@/lib/db/collections";
import { iconByName } from "@/components/dashboard/type-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FALLBACK_COLOR } from "@/lib/item-type-sets";

export function CollectionCard({
  collection,
  href,
}: {
  collection: CollectionWithMeta;
  href?: string;
}) {
  const accent = collection.primaryType?.color ?? FALLBACK_COLOR;
  const Wrapper = href ? Link : "div";

  return (
    <Wrapper href={href as string} className={href ? "block" : undefined}>
    <Card
      size="sm"
      className="border-l-2 transition-colors hover:bg-muted/30"
      style={{ borderLeftColor: accent }}
    >
      <CardHeader>
        <CardTitle className="flex min-w-0 items-center gap-2">
          <Folder className="size-4 shrink-0" style={{ color: accent }} />
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
      <CardContent className="space-y-2">
        {collection.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {collection.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
          </p>
          {collection.types.length > 0 && (
            <div className="flex items-center gap-1">
              {collection.types.map((type) => {
                const Icon = iconByName[type.icon ?? ""] ?? Folder;
                return (
                  <Icon
                    key={type.slug}
                    className="size-3.5"
                    style={{ color: type.color ?? FALLBACK_COLOR }}
                    aria-label={type.slug}
                  />
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </Wrapper>
  );
}
