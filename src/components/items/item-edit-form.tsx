"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateItem } from "@/actions/items";
import type { ItemDetail } from "@/lib/db/items";
import { CONTENT_TYPES, LANGUAGE_TYPES } from "@/lib/item-type-sets";
import { parseTags } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ItemFormFields } from "@/components/items/item-fields";

export function ItemEditForm({
  detail,
  onCancel,
  onSaved,
  collections,
}: {
  detail: ItemDetail;
  onCancel: () => void;
  onSaved: (detail: ItemDetail) => void;
  collections: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(detail.title);
  const [description, setDescription] = useState(detail.description ?? "");
  const [content, setContent] = useState(detail.content ?? "");
  const [language, setLanguage] = useState(detail.language ?? "");
  const [url, setUrl] = useState(detail.url ?? "");
  const [tags, setTags] = useState(detail.tags.join(", "));
  const [collectionId, setCollectionId] = useState(detail.collection?.id ?? "");

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
        tags: parseTags(tags),
        collectionId: collectionId || null,
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
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>

      <Separator />

      <div className="space-y-5 p-4">
        <ItemFormFields
          typeSlug={detail.type.slug}
          idPrefix="edit"
          values={{ title, description, content, language, url, tags }}
          handlers={{
            onTitleChange: setTitle,
            onDescriptionChange: setDescription,
            onContentChange: setContent,
            onLanguageChange: setLanguage,
            onUrlChange: setUrl,
            onTagsChange: setTags,
          }}
        />

        {collections.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="edit-collection">Collection</Label>
            <Select value={collectionId} onValueChange={(v) => setCollectionId(v ?? "")}>
              <SelectTrigger id="edit-collection" className="w-full">
                <SelectValue placeholder="No collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No collection</SelectItem>
                {collections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </>
  );
}
