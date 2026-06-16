"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Folder, Pencil, Pin, Star, Trash2 } from "lucide-react";

import { updateItem } from "@/actions/items";
import type { ItemDetail } from "@/lib/db/items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { iconByName } from "@/components/dashboard/type-icons";

const CONTENT_TYPES = new Set(["snippet", "prompt", "command", "note"]);
const LANGUAGE_TYPES = new Set(["snippet", "command"]);

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
            <ItemDetailView detail={detail} onUpdated={setDetail} />
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

function ItemDetailView({
  detail,
  onUpdated,
}: {
  detail: ItemDetail;
  onUpdated: (detail: ItemDetail) => void;
}) {
  const [editing, setEditing] = useState(false);
  const Icon = iconByName[detail.type.icon ?? ""] ?? Folder;
  const color = detail.type.color ?? FALLBACK_COLOR;

  function copyContent() {
    const text = detail.content ?? detail.url ?? "";
    if (text) navigator.clipboard.writeText(text);
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
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
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

function ItemEditForm({
  detail,
  onCancel,
  onSaved,
}: {
  detail: ItemDetail;
  onCancel: () => void;
  onSaved: (detail: ItemDetail) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(detail.title);
  const [description, setDescription] = useState(detail.description ?? "");
  const [content, setContent] = useState(detail.content ?? "");
  const [language, setLanguage] = useState(detail.language ?? "");
  const [url, setUrl] = useState(detail.url ?? "");
  const [tags, setTags] = useState(detail.tags.join(", "));

  const showContent = CONTENT_TYPES.has(detail.type.slug);
  const showLanguage = LANGUAGE_TYPES.has(detail.type.slug);
  const showUrl = detail.type.slug === "link";

  function save() {
    startTransition(async () => {
      const result = await updateItem(detail.id, {
        title,
        description,
        content: showContent ? content : null,
        language: showLanguage ? language : null,
        url: showUrl ? url : null,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });

      if (result.success) {
        toast.success("Item updated.");
        onSaved(result.data);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <SheetHeader className="pr-12">
        <SheetTitle>Edit item</SheetTitle>
      </SheetHeader>

      <Separator />

      <div className="flex items-center gap-1 px-4 py-2">
        <Button
          size="sm"
          onClick={save}
          disabled={pending || title.trim() === ""}
        >
          {pending ? "Saving..." : "Save"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>

      <Separator />

      <div className="space-y-5 p-4">
        <div className="space-y-2">
          <Label htmlFor="edit-title">Title</Label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-description">Description</Label>
          <Textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {showContent && (
          <div className="space-y-2">
            <Label htmlFor="edit-content">Content</Label>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-40 font-mono text-xs"
            />
          </div>
        )}

        {showLanguage && (
          <div className="space-y-2">
            <Label htmlFor="edit-language">Language</Label>
            <Input
              id="edit-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </div>
        )}

        {showUrl && (
          <div className="space-y-2">
            <Label htmlFor="edit-url">URL</Label>
            <Input
              id="edit-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="edit-tags">Tags</Label>
          <Input
            id="edit-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="comma, separated, tags"
          />
        </div>
      </div>
    </>
  );
}
