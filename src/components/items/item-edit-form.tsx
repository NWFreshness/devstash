"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateItem } from "@/actions/items";
import type { ItemDetail } from "@/lib/db/items";
import { CONTENT_TYPES, LANGUAGE_TYPES, MARKDOWN_TYPES } from "@/lib/item-type-sets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";

export function ItemEditForm({
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
            <Label>Content</Label>
            {showLanguage ? (
              <CodeEditor
                value={content}
                onChange={setContent}
                language={language || undefined}
              />
            ) : MARKDOWN_TYPES.has(detail.type.slug) ? (
              <MarkdownEditor value={content} onChange={setContent} />
            ) : (
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-40 font-mono text-xs"
              />
            )}
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
