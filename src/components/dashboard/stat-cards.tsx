import { Files, FolderHeart, FolderOpen, Star } from "lucide-react";

import { getDashboardStats } from "@/lib/db/items";
import { Card, CardContent } from "@/components/ui/card";

export async function StatCards({ userId }: { userId: string | null }) {
  const stats = await getDashboardStats(userId);
  const cards = [
    { label: "Items", value: stats.itemCount, icon: Files },
    { label: "Collections", value: stats.collectionCount, icon: FolderOpen },
    { label: "Favorite Items", value: stats.favoriteItemCount, icon: Star },
    {
      label: "Favorite Collections",
      value: stats.favoriteCollectionCount,
      icon: FolderHeart,
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon }) => (
        <Card key={label} size="sm">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-semibold">{value}</p>
            </div>
            <Icon className="size-5 text-muted-foreground" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
