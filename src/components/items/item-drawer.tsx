"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Copy, Folder, Pencil, Pin, Star, Trash2 } from "lucide-react";

import type { ItemDetail } from "@/lib/db/items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { iconByName } from "@/components/dashboard/type-icons";

const FALLBACK_COLOR = "var(--muted-foreground)";

const ItemDrawerContext = createContext<(id: string) => void>(() => {});

export function useItemDrawer() {
  return useContext(ItemDrawerContext);
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function ItemDrawerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const openItem = useCallback(async (id: string) => {
    setDetail(null);
    setLoading(true);
    setOpen(true);
    const res = await fetch(`/api/items/${id}`);
    if (res.ok) setDetail(await res.json());
    setLoading(false);
  }, []);

  return (
    <ItemDrawerContext.Provider value={openItem}>
      {children}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-lg">
          {loading || !detail ? (
            <DrawerSkeleton />
          ) : (
            <ItemDetailView detail={detail} />
          )}
        </SheetContent>
      </Sheet>
    </ItemDrawerContext.Provider>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
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

function ItemDetailView({ detail }: { detail: ItemDetail }) {
  const Icon = iconByName[detail.type.icon ?? ""] ?? Folder;
  const color = detail.type.color ?? FALLBACK_COLOR;

  function copyContent() {
    const text = detail.content ?? detail.url ?? "";
    if (text) navigator.clipboard.writeText(text);
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
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Pencil />
            Edit
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-destructive">
            <Trash2 />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-5 p-4">
        {detail.description && (
          <Section title="Description">
            <p className="text-sm">{detail.description}</p>
          </Section>
        )}

        {detail.content && (
          <Section title="Content">
            <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
              <code>{detail.content}</code>
            </pre>
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
