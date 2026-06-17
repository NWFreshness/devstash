"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { createItem } from "@/actions/items";
import { CREATE_ITEM_TYPES } from "@/lib/validations/item";
import { parseTags } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ItemFormFields } from "@/components/items/item-fields";
import type { UploadedFile } from "@/components/ui/file-upload";

const TYPE_LABELS: Record<(typeof CREATE_ITEM_TYPES)[number], string> = {
  snippet: "Snippet",
  prompt: "Prompt",
  command: "Command",
  note: "Note",
  link: "Link",
  file: "File",
  image: "Image",
};

interface CreateItemDialogProps {
  defaultType?: (typeof CREATE_ITEM_TYPES)[number];
  triggerElement?: React.ReactElement;
  collections?: { id: string; name: string }[];
}

export function CreateItemDialog({
  defaultType = "snippet",
  triggerElement,
  collections = [],
}: CreateItemDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [typeSlug, setTypeSlug] =
    useState<(typeof CREATE_ITEM_TYPES)[number]>(defaultType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const showUrl = typeSlug === "link";
  const showFileUpload = typeSlug === "file" || typeSlug === "image";

  function reset() {
    setTypeSlug(defaultType);
    setTitle("");
    setDescription("");
    setContent("");
    setLanguage("");
    setUrl("");
    setTags("");
    setCollectionId("");
    setUploadedFile(null);
  }

  const canCreate =
    !pending &&
    title.trim() !== "" &&
    (!showUrl || url !== "") &&
    (!showFileUpload || uploadedFile !== null);

  function save() {
    startTransition(async () => {
      const result = await createItem({
        typeSlug,
        title,
        description,
        content: content || null,
        language: language || null,
        url: showUrl ? url : null,
        fileUrl: uploadedFile?.key ?? null,
        fileName: uploadedFile?.fileName ?? null,
        fileSize: uploadedFile?.fileSize ?? null,
        mimeType: uploadedFile?.mimeType ?? null,
        tags: parseTags(tags),
        collectionId: collectionId || null,
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
          triggerElement ?? (
            <Button size="lg">
              <Plus data-icon="inline-start" />
              New Item
            </Button>
          )
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

          <ItemFormFields
            typeSlug={typeSlug}
            idPrefix="create"
            values={{ title, description, content, language, url, tags, uploadedFile }}
            handlers={{
              onTitleChange: setTitle,
              onDescriptionChange: setDescription,
              onContentChange: setContent,
              onLanguageChange: setLanguage,
              onUrlChange: setUrl,
              onTagsChange: setTags,
              onUpload: setUploadedFile,
              onClearUpload: () => setUploadedFile(null),
            }}
          />

          {collections.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="create-collection">Collection</Label>
              <Select value={collectionId} onValueChange={(v) => setCollectionId(v ?? "")}>
                <SelectTrigger id="create-collection" className="w-full">
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

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button onClick={save} disabled={!canCreate}>
            {pending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
