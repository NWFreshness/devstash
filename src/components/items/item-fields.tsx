"use client";

import type { CREATE_ITEM_TYPES } from "@/lib/validations/item";
import { CONTENT_TYPES, LANGUAGE_TYPES, MARKDOWN_TYPES } from "@/lib/item-type-sets";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { FileUpload, type UploadedFile } from "@/components/ui/file-upload";

const FILE_TYPES = new Set(["file", "image"]);

const IMAGE_ACCEPT =
  ".png,.jpg,.jpeg,.gif,.webp,.svg,image/png,image/jpeg,image/gif,image/webp,image/svg+xml";
const FILE_ACCEPT =
  ".pdf,.txt,.md,.json,.yaml,.yml,.xml,.csv,.toml,.ini,application/pdf,text/plain,text/markdown,application/json,text/yaml,text/xml,text/csv";

export interface ItemFieldValues {
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
  uploadedFile?: UploadedFile | null;
}

export interface ItemFieldHandlers {
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onLanguageChange: (v: string) => void;
  onUrlChange: (v: string) => void;
  onTagsChange: (v: string) => void;
  onUpload?: (f: UploadedFile) => void;
  onClearUpload?: () => void;
}

interface ItemFormFieldsProps {
  typeSlug: string;
  values: ItemFieldValues;
  handlers: ItemFieldHandlers;
  idPrefix?: string;
}

export function ItemFormFields({
  typeSlug,
  values,
  handlers,
  idPrefix = "field",
}: ItemFormFieldsProps) {
  const showContent = CONTENT_TYPES.has(typeSlug);
  const showLanguage = LANGUAGE_TYPES.has(typeSlug);
  const showMarkdown = MARKDOWN_TYPES.has(typeSlug);
  const showUrl = typeSlug === "link";
  const showFileUpload = FILE_TYPES.has(typeSlug);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-title`}>Title</Label>
        <Input
          id={`${idPrefix}-title`}
          value={values.title}
          onChange={(e) => handlers.onTitleChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Textarea
          id={`${idPrefix}-description`}
          value={values.description}
          onChange={(e) => handlers.onDescriptionChange(e.target.value)}
        />
      </div>

      {showFileUpload && handlers.onUpload && handlers.onClearUpload && (
        <div className="space-y-2">
          <Label>File</Label>
          <FileUpload
            accept={typeSlug === "image" ? IMAGE_ACCEPT : FILE_ACCEPT}
            maxBytes={typeSlug === "image" ? 5 * 1024 * 1024 : 10 * 1024 * 1024}
            uploaded={values.uploadedFile ?? null}
            onUpload={handlers.onUpload}
            onClear={handlers.onClearUpload}
          />
        </div>
      )}

      {showContent && (
        <div className="space-y-2">
          <Label>Content</Label>
          {showLanguage ? (
            <CodeEditor
              value={values.content}
              onChange={handlers.onContentChange}
              language={values.language || undefined}
            />
          ) : showMarkdown ? (
            <MarkdownEditor value={values.content} onChange={handlers.onContentChange} />
          ) : (
            <Textarea
              id={`${idPrefix}-content`}
              value={values.content}
              onChange={(e) => handlers.onContentChange(e.target.value)}
              className="min-h-40 font-mono text-xs"
            />
          )}
        </div>
      )}

      {showLanguage && (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-language`}>Language</Label>
          <Input
            id={`${idPrefix}-language`}
            value={values.language}
            onChange={(e) => handlers.onLanguageChange(e.target.value)}
          />
        </div>
      )}

      {showUrl && (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-url`}>URL</Label>
          <Input
            id={`${idPrefix}-url`}
            value={values.url}
            onChange={(e) => handlers.onUrlChange(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-tags`}>Tags</Label>
        <Input
          id={`${idPrefix}-tags`}
          value={values.tags}
          onChange={(e) => handlers.onTagsChange(e.target.value)}
          placeholder="comma, separated, tags"
        />
      </div>
    </>
  );
}
