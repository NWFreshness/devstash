"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Download, Folder, Pencil, Pin, Star, Trash2 } from "lucide-react";

import { deleteItem } from "@/actions/items";
import type { ItemDetail } from "@/lib/db/items";
import { LANGUAGE_TYPES, MARKDOWN_TYPES } from "@/lib/item-type-sets";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { iconByName } from "@/components/dashboard/type-icons";
import { ItemEditForm } from "@/components/items/item-edit-form";

const FALLBACK_COLOR = "var(--muted-foreground)";

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function ItemDetailView({
  detail,
  onUpdated,
  onDeleted,
}: {
  detail: ItemDetail;
  onUpdated: (detail: ItemDetail) => void;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, startDelete] = useTransition();
  const Icon = iconByName[detail.type.icon ?? ""] ?? Folder;
  const color = detail.type.color ?? FALLBACK_COLOR;

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

  if (editing) {
    return (
      <ItemEditForm
        detail={detail}
        onCancel={() => setEditing(false)}
        onSaved={(updated) => {
          onUpdated(updated);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <>
      <SheetHeader className="gap-2 pr-12">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
            <Icon className="size-4" style={{ color }} />
          </div>
          <SheetTitle className="truncate">{detail.title}</SheetTitle>
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge
            variant="secondary"
            style={{ color, borderColor: color }}
            className="border bg-transparent"
          >
            {detail.type.slug}
          </Badge>
          {detail.language && (
            <Badge variant="secondary">{detail.language}</Badge>
          )}
        </div>
      </SheetHeader>

      <Separator />

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
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
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
                <AlertDialogCancel disabled={deleting}>
                  Cancel
                </AlertDialogCancel>
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

      <Separator />

      <div className="space-y-5 p-4">
        {detail.description && (
          <Section title="Description">
            <p className="text-sm">{detail.description}</p>
          </Section>
        )}

        {detail.type.slug === "image" && detail.fileUrl && (
          <Section title="Preview">
            <img
              src={`/api/download/${detail.fileUrl}`}
              alt={detail.title}
              className="max-h-64 w-full rounded-md border object-contain"
            />
          </Section>
        )}

        {detail.type.slug === "file" && detail.fileName && (
          <Section title="File">
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
              <span className="truncate text-foreground">{detail.fileName}</span>
              {detail.fileSize !== null && (
                <span className="ml-2 shrink-0 text-muted-foreground">
                  {detail.fileSize < 1024 * 1024
                    ? `${(detail.fileSize / 1024).toFixed(1)} KB`
                    : `${(detail.fileSize / (1024 * 1024)).toFixed(1)} MB`}
                </span>
              )}
            </div>
          </Section>
        )}

        {detail.content && (
          <Section title="Content">
            {LANGUAGE_TYPES.has(detail.type.slug) ? (
              <CodeEditor
                value={detail.content}
                language={detail.language ?? undefined}
                readOnly
              />
            ) : MARKDOWN_TYPES.has(detail.type.slug) ? (
              <MarkdownEditor value={detail.content} readOnly />
            ) : (
              <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
                <code>{detail.content}</code>
              </pre>
            )}
          </Section>
        )}

        {detail.url && (
          <Section title="URL">
            <a
              href={detail.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              {detail.url}
            </a>
          </Section>
        )}

        {detail.tags.length > 0 && (
          <Section title="Tags">
            <div className="flex flex-wrap gap-1">
              {detail.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </Section>
        )}

        {detail.collection && (
          <Section title="Collection">
            <Badge variant="secondary">{detail.collection.name}</Badge>
          </Section>
        )}

        <Section title="Details">
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDate(detail.createdAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{formatDate(detail.updatedAt)}</dd>
            </div>
          </dl>
        </Section>
      </div>
    </>
  );
}
