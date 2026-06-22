"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Folder, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";

import { deleteCollection, toggleCollectionFavorite } from "@/actions/collections";
import type { CollectionWithMeta } from "@/lib/db/collections";
import { iconByName } from "@/components/dashboard/type-icons";
import { EditCollectionDialog } from "@/components/collections/edit-collection-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FALLBACK_COLOR } from "@/lib/item-type-sets";

export function CollectionCard({
  collection,
  href,
}: {
  collection: CollectionWithMeta;
  href?: string;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [togglingFavorite, startToggleFavorite] = useTransition();

  const accent = collection.primaryType?.color ?? FALLBACK_COLOR;
  const cardHref = href ?? `/collections/${collection.id}`;

  function handleToggleFavorite() {
    startToggleFavorite(async () => {
      const result = await toggleCollectionFavorite(collection.id);
      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteCollection(collection.id);
      if (result.success) {
        toast.success("Collection deleted.");
        setDeleteOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleCardKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(cardHref);
    }
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className="block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        onClick={() => router.push(cardHref)}
        onKeyDown={handleCardKeyDown}
        aria-label={`Open collection ${collection.name}`}
      >
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
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Collection options"
                      />
                    }
                  >
                    <MoreHorizontal />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                      <Pencil />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleToggleFavorite}
                      disabled={togglingFavorite}
                    >
                      <Star
                        className={
                          collection.isFavorite
                            ? "fill-amber-400 text-amber-400"
                            : undefined
                        }
                      />
                      {collection.isFavorite ? "Unfavorite" : "Favorite"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2 />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
                {collection.itemCount}{" "}
                {collection.itemCount === 1 ? "item" : "items"}
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
      </div>

      <EditCollectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={collection}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this collection?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes &ldquo;{collection.name}&rdquo;. Items in this
              collection will not be deleted — they will just become unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
