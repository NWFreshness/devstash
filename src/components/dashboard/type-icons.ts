import {
  Code,
  File as FileIcon,
  FileText,
  Folder,
  Image as ImageIcon,
  Link as LinkIcon,
  type LucideIcon,
  MessageSquare,
  Paperclip,
  Sparkles,
  StickyNote,
  Terminal,
} from "lucide-react";

import { itemTypes } from "@/lib/mock-data";

/** Lucide component for each known icon name (mock-data + DB-seeded types). */
export const iconByName: Record<string, LucideIcon> = {
  Code,
  MessageSquare,
  Terminal,
  FileText,
  Paperclip,
  Image: ImageIcon,
  Link: LinkIcon,
  Sparkles,
  StickyNote,
  File: FileIcon,
};

const iconNameBySlug = new Map(itemTypes.map((type) => [type.slug, type.icon]));
const colorBySlug = new Map(itemTypes.map((type) => [type.slug, type.color]));

/** Resolve a Lucide icon component from an item type slug. */
export function typeIcon(slug: string): LucideIcon {
  return iconByName[iconNameBySlug.get(slug) ?? ""] ?? Folder;
}

/** Resolve the hex accent color for an item type slug. */
export function typeColor(slug: string): string {
  return colorBySlug.get(slug) ?? "var(--muted-foreground)";
}
