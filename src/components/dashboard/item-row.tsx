import { Pin, Star } from "lucide-react";

import type { Item } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { typeColor, typeIcon } from "@/components/dashboard/type-icons";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Formats an ISO date (yyyy-mm-dd) as "Mon D" without timezone shifts. */
function formatDate(iso: string) {
  const [, month, day] = iso.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}`;
}

export function ItemRow({ item }: { item: Item }) {
  const Icon = typeIcon(item.typeSlug);
  const color = typeColor(item.typeSlug);
  return (
    <div
      className="flex items-start gap-3 rounded-lg border-l-2 p-3 ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
      style={{ borderLeftColor: color }}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-4" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-medium">{item.title}</span>
          {item.isPinned && (
            <Pin className="size-3.5 shrink-0 text-muted-foreground" />
          )}
          {item.isFavorite && (
            <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
          )}
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {item.description}
        </p>
        {item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <time className="shrink-0 text-xs text-muted-foreground">
        {formatDate(item.createdAt)}
      </time>
    </div>
  );
}
