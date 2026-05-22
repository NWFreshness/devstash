import {
  Code,
  FileText,
  Folder,
  Image as ImageIcon,
  Link as LinkIcon,
  type LucideIcon,
  MessageSquare,
  Paperclip,
  Terminal,
} from "lucide-react";

import { itemTypes } from "@/lib/mock-data";

/** Lucide component for each mock-data icon name. */
export const iconByName: Record<string, LucideIcon> = {
  Code,
  MessageSquare,
  Terminal,
  FileText,
  Paperclip,
  Image: ImageIcon,
  Link: LinkIcon,
};

const iconNameBySlug = new Map(itemTypes.map((type) => [type.slug, type.icon]));

/** Resolve a Lucide icon component from an item type slug. */
export function typeIcon(slug: string): LucideIcon {
  return iconByName[iconNameBySlug.get(slug) ?? ""] ?? Folder;
}
