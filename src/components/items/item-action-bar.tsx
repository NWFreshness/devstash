"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Download, Pencil, Pin, Star, Trash2 } from "lucide-react";

import { deleteItem } from "@/actions/items";
import type { ItemDetail } from "@/lib/db/items";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ItemActionBarProps {
  detail: ItemDetail;
  onEdit: () => void;
  onDeleted: () => void;
}

export function ItemActionBar({ detail, onEdit, onDeleted }: ItemActionBarProps) {
  const router = useRouter();
  const [deleting, startDelete] = useTransition();

  function copyContent() {
    const text = detail.content ?? detail.url ?? "";
    if (text) navigator.clipboard.writeText(text);
  }

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteItem(detail.id);
      if (result.success) {
        toast.success("Item deleted.");
        onDeleted();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <Button variant="ghost" size="sm">
        <Star
          className={
            detail.isFavorite ? "fill-amber-400 text-amber-400" : undefined
          }
        />
        Favorite
      </Button>
      <Button variant="ghost" size="sm">
        <Pin className={detail.isPinned ? "text-foreground" : undefined} />
        Pin
      </Button>
      <Button variant="ghost" size="sm" onClick={copyContent}>
        <Copy />
        Copy
      </Button>
      {detail.fileUrl && (
        <Button
          variant="ghost"
          size="sm"
          render={
            <a
              href={`/api/download/${detail.fileUrl}`}
              download={detail.fileName ?? undefined}
            />
          }
        >
          <Download />
          Download
        </Button>
      )}
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil />
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
              />
            }
          >
            <Trash2 />
            <span className="sr-only">Delete</span>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this item?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes &ldquo;{detail.title}&rdquo;. This
                action cannot be undone.
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
      </div>
    </div>
  );
}
