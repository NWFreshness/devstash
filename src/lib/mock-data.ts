/**
 * Single source of truth for mock data used by the dashboard UI.
 * Temporary — replace with database queries once Prisma is wired up.
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

export interface Collection {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  isFavorite: boolean;
  color: string; // hex accent color for the collection
}

export interface Item {
  id: string;
  title: string;
  description: string;
  typeSlug: string; // matches ItemType.slug
  collectionId: string | null;
  tags: string[];
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string; // ISO date
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

export const collections: Collection[] = [
  {
    id: "col_react",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    itemCount: 12,
    isFavorite: true,
    color: "#2dd4bf",
  },
  {
    id: "col_python",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    itemCount: 8,
    isFavorite: false,
    color: "#4ade80",
  },
  {
    id: "col_context",
    name: "Context Files",
    description: "AI context files for projects",
    itemCount: 5,
    isFavorite: true,
    color: "#a78bfa",
  },
  {
    id: "col_interview",
    name: "Interview Prep",
    description: "Technical interview preparation",
    itemCount: 24,
    isFavorite: false,
    color: "#facc15",
  },
  {
    id: "col_git",
    name: "Git Commands",
    description: "Frequently used git commands",
    itemCount: 15,
    isFavorite: true,
    color: "#fb923c",
  },
  {
    id: "col_ai",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    itemCount: 18,
    isFavorite: false,
    color: "#60a5fa",
  },
];

export const items: Item[] = [
  {
    id: "item_useauth",
    title: "useAuth Hook",
    description: "Custom authentication hook for React applications",
    typeSlug: "snippet",
    collectionId: "col_react",
    tags: ["react", "auth", "hooks"],
    language: "ts",
    isFavorite: true,
    isPinned: true,
    createdAt: "2026-01-15",
  },
  {
    id: "item_api_error",
    title: "API Error Handling Pattern",
    description: "Fetch wrapper with exponential backoff retry logic",
    typeSlug: "snippet",
    collectionId: "col_react",
    tags: ["fetch", "errors", "retry"],
    language: "ts",
    isFavorite: false,
    isPinned: true,
    createdAt: "2026-01-12",
  },
  {
    id: "item_git_undo",
    title: "Undo Last Commit",
    description: "Reset the last commit while keeping your changes staged",
    typeSlug: "command",
    collectionId: "col_git",
    tags: ["git", "reset"],
    language: "bash",
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-01-10",
  },
  {
    id: "item_prompt_review",
    title: "Code Review Prompt",
    description: "Prompt for thorough LLM-assisted code reviews",
    typeSlug: "prompt",
    collectionId: "col_ai",
    tags: ["review", "llm"],
    language: null,
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-01-08",
  },
  {
    id: "item_py_decorator",
    title: "Timing Decorator",
    description: "Measure function execution time with a simple decorator",
    typeSlug: "snippet",
    collectionId: "col_python",
    tags: ["python", "decorator"],
    language: "py",
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-01-05",
  },
];
