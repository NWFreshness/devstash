"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateItem } from "@/actions/items";
import type { ItemDetail } from "@/lib/db/items";
import { CONTENT_TYPES, LANGUAGE_TYPES } from "@/lib/item-type-sets";
import { parseTags } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ItemFormFields } from "@/components/items/item-fields";

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
        tags: parseTags(tags),
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
      </div>
    </>
  );
}
