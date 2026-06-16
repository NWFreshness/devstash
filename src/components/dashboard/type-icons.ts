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

/** Lucide component for each known icon name (DB-seeded types). */
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
  Folder,
};
