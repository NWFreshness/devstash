/**
 * Mock data still used by the dashboard sidebar (current user + item type
 * icons/colors). Most data is now DB-backed via src/lib/db; these remain until
 * the user/session and type styling are sourced from elsewhere.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isPro: boolean;
}

export interface ItemType {
  id: string;
  name: string;
  slug: string;
  icon: string; // lucide-react icon name
  count: number;
  color: string; // hex accent color for the type
}

export const currentUser: User = {
  id: "user_1",
  name: "John Doe",
  email: "john@example.com",
  image: null,
  isPro: true,
};

export const itemTypes: ItemType[] = [
  { id: "type_snippet", name: "Snippets", slug: "snippet", icon: "Code", count: 24, color: "#2dd4bf" },
  { id: "type_prompt", name: "Prompts", slug: "prompt", icon: "MessageSquare", count: 18, color: "#a78bfa" },
  { id: "type_command", name: "Commands", slug: "command", icon: "Terminal", count: 15, color: "#fb923c" },
  { id: "type_note", name: "Notes", slug: "note", icon: "FileText", count: 12, color: "#60a5fa" },
  { id: "type_file", name: "Files", slug: "file", icon: "Paperclip", count: 5, color: "#f472b6" },
  { id: "type_image", name: "Images", slug: "image", icon: "Image", count: 3, color: "#4ade80" },
  { id: "type_link", name: "Links", slug: "link", icon: "Link", count: 8, color: "#38bdf8" },
];
