"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { createItem } from "@/actions/items";
import { CREATE_ITEM_TYPES } from "@/lib/validations/item";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CONTENT_TYPES = new Set(["snippet", "prompt", "command", "note"]);
const LANGUAGE_TYPES = new Set(["snippet", "command"]);

const TYPE_LABELS: Record<(typeof CREATE_ITEM_TYPES)[number], string> = {
  snippet: "Snippet",
  prompt: "Prompt",
  command: "Command",
  note: "Note",
  link: "Link",
};

export function CreateItemDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [typeSlug, setTypeSlug] =
    useState<(typeof CREATE_ITEM_TYPES)[number]>("snippet");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");

  const showContent = CONTENT_TYPES.has(typeSlug);
  const showLanguage = LANGUAGE_TYPES.has(typeSlug);
  const showUrl = typeSlug === "link";

  function reset() {
    setTypeSlug("snippet");
    setTitle("");
    setDescription("");
    setContent("");
    setLanguage("");
    setUrl("");
    setTags("");
  }

  function save() {
    startTransition(async () => {
      const result = await createItem({
        typeSlug,
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
        toast.success("Item created.");
        setOpen(false);
        reset();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button size="lg">
            <Plus data-icon="inline-start" />
            New Item
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-type">Type</Label>
            <Select
              value={typeSlug}
              onValueChange={(value) =>
                setTypeSlug(value as (typeof CREATE_ITEM_TYPES)[number])
              }
            >
              <SelectTrigger id="create-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CREATE_ITEM_TYPES.map((slug) => (
                  <SelectItem key={slug} value={slug}>
                    {TYPE_LABELS[slug]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-title">Title</Label>
            <Input
              id="create-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-description">Description</Label>
            <Textarea
              id="create-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {showContent && (
            <div className="space-y-2">
              <Label htmlFor="create-content">Content</Label>
              <Textarea
                id="create-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-40 font-mono text-xs"
              />
            </div>
          )}

          {showLanguage && (
            <div className="space-y-2">
              <Label htmlFor="create-language">Language</Label>
              <Input
                id="create-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>
          )}

          {showUrl && (
            <div className="space-y-2">
              <Label htmlFor="create-url">URL</Label>
              <Input
                id="create-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="create-tags">Tags</Label>
            <Input
              id="create-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="comma, separated, tags"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button onClick={save} disabled={pending || title.trim() === ""}>
            {pending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
