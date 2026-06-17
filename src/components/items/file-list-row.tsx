"use client";

import { Download, File, FileText, FileCode, Archive, Pin, Star } from "lucide-react";

import type { ItemWithMeta } from "@/lib/db/items";
import { useItemDrawer } from "@/components/items/item-drawer";
import { formatBytes } from "@/lib/utils";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function fileIcon(fileName: string | null) {
  const ext = fileName?.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return FileText;
  if (["zip", "gz", "tar", "rar", "7z"].includes(ext)) return Archive;
  if (["js", "ts", "tsx", "jsx", "py", "rb", "go", "rs", "cs", "java", "php", "sh"].includes(ext)) return FileCode;
  return File;
}

export function FileListRow({ item }: { item: ItemWithMeta }) {
  const openItem = useItemDrawer();
  const Icon = fileIcon(item.fileName);

  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    if (!item.fileUrl) return;
    const a = document.createElement("a");
    a.href = `/api/download/${item.fileUrl}`;
    a.download = item.fileName ?? item.title;
    a.click();
  }

  return (
    <button
      type="button"
      onClick={() => openItem(item.id)}
      className="group flex w-full items-center gap-4 rounded-lg border border-transparent px-4 py-3 text-left transition-colors hover:border-border hover:bg-muted/50"
    >
      <Icon className="size-5 shrink-0 text-muted-foreground" />

      <span className="flex-1 truncate font-medium text-sm">
        {item.fileName ?? item.title}
      </span>

      <span className="hidden shrink-0 text-xs text-muted-foreground sm:block w-20 text-right">
        {formatBytes(item.fileSize)}
      </span>

      <span className="hidden shrink-0 text-xs text-muted-foreground md:block w-24 text-right">
        {formatDate(item.createdAt)}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        {item.isPinned && (
          <Pin className="size-3.5 text-muted-foreground" />
        )}
        {item.isFavorite && (
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
        )}
        <button
          type="button"
          onClick={handleDownload}
          aria-label="Download"
          className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        >
          <Download className="size-4" />
        </button>
      </div>
    </button>
  );
}
