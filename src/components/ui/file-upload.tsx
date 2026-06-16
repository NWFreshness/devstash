"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface UploadedFile {
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface FileUploadProps {
  accept: string;
  maxBytes: number;
  onUpload: (result: UploadedFile) => void;
  onClear: () => void;
  uploaded: UploadedFile | null;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  accept,
  maxBytes,
  onUpload,
  onClear,
  uploaded,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    setError(null);
    if (file.size > maxBytes) {
      setError(`File too large (max ${formatBytes(maxBytes)})`);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      setProgress(null);
      try {
        if (xhr.status === 200) {
          onUpload(JSON.parse(xhr.responseText) as UploadedFile);
        } else {
          const body = JSON.parse(xhr.responseText) as { error?: string };
          setError(body.error ?? "Upload failed");
        }
      } catch {
        setError("Upload failed");
      }
    };

    xhr.onerror = () => {
      setProgress(null);
      setError("Upload failed");
    };

    setProgress(0);
    xhr.send(formData);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  if (uploaded) {
    return (
      <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
        <span className="truncate text-foreground">{uploaded.fileName}</span>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-muted-foreground">{formatBytes(uploaded.fileSize)}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => { onClear(); setError(null); }}
          >
            <X className="size-3.5" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-sm transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/20 hover:bg-muted/40"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {progress !== null ? (
          <div className="w-full space-y-1.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Uploading... {progress}%
            </p>
          </div>
        ) : (
          <>
            <Upload className="size-5 text-muted-foreground" />
            <p className="text-muted-foreground">
              Drop a file here or{" "}
              <span className="text-primary underline-offset-2 hover:underline">
                browse
              </span>
            </p>
          </>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
