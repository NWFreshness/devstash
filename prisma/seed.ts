import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const DEMO_EMAIL = "demo@devstash.io";

const SYSTEM_TYPES = [
  { name: "snippet", icon: "Code", color: "#3b82f6" },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "command", icon: "Terminal", color: "#f97316" },
  { name: "note", icon: "StickyNote", color: "#fde047" },
  { name: "file", icon: "File", color: "#6b7280" },
  { name: "image", icon: "Image", color: "#ec4899" },
  { name: "link", icon: "Link", color: "#10b981" },
];

type SeedItem = {
  title: string;
  type: string; // type slug
  description?: string;
  content?: string;
  language?: string;
  url?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
};

type SeedCollection = {
  name: string;
  description: string;
  icon: string;
  isFavorite?: boolean;
  items: SeedItem[];
};

const COLLECTIONS: SeedCollection[] = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    icon: "Component",
    isFavorite: true,
    items: [
      {
        title: "useDebounce",
        type: "snippet",
        language: "typescript",
        description: "Debounce a fast-changing value",
        isPinned: true,
        isFavorite: true,
        content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}`,
      },
      {
        title: "ThemeProvider (Context pattern)",
        type: "snippet",
        language: "tsx",
        description: "Typed React context provider + hook",
        content: `import { createContext, useContext, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}`,
      },
      {
        title: "cn() class merge utility",
        type: "snippet",
        language: "typescript",
        description: "Merge Tailwind classes safely",
        content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,
      },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    icon: "Sparkles",
    items: [
      {
        title: "Code review prompt",
        type: "prompt",
        isPinned: true,
        description: "Structured PR review",
        content: `Act as a senior engineer reviewing a pull request. Review the diff below for:
1. Correctness and edge cases
2. Security and input validation
3. Readability and naming
4. Performance concerns

For each issue, give the file/line, severity (low/med/high), and a concrete fix.

DIFF:
"""
{{diff}}
"""`,
      },
      {
        title: "Documentation generation prompt",
        type: "prompt",
        description: "Generate docs from source",
        content: `You are a technical writer. Given the source file below, produce:
- A one-paragraph summary
- A usage example
- A parameters/returns table for each exported function

Keep it concise and accurate. Do not invent behavior that isn't in the code.

SOURCE:
"""
{{code}}
"""`,
      },
      {
        title: "Refactoring assistance prompt",
        type: "prompt",
        description: "Safe, incremental refactor",
        content: `Refactor the following code for clarity and maintainability without changing behavior.
Constraints:
- Keep the public API identical
- Prefer small, named functions
- Explain each change in one line before the final code

CODE:
"""
{{code}}
"""`,
      },
    ],
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    icon: "Server",
    items: [
      {
        title: "Dockerfile (Node multi-stage)",
        type: "snippet",
        language: "dockerfile",
        description: "Slim production Node image",
        isFavorite: true,
        content: `FROM node:22-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-slim AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
CMD ["npm", "start"]`,
      },
      {
        title: "Deploy to Vercel (production)",
        type: "command",
        language: "bash",
        description: "Build and deploy a prod release",
        content: "npx vercel pull --yes --environment=production && npx vercel build --prod && npx vercel deploy --prebuilt --prod",
      },
      {
        title: "Docker documentation",
        type: "link",
        description: "Official Docker reference",
        url: "https://docs.docker.com",
      },
      {
        title: "GitHub Actions documentation",
        type: "link",
        description: "CI/CD workflows reference",
        url: "https://docs.github.com/actions",
      },
    ],
  },
  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    icon: "Terminal",
    items: [
      {
        title: "Amend last commit without editing message",
        type: "command",
        language: "bash",
        content: "git commit --amend --no-edit",
      },
      {
        title: "Remove unused Docker data",
        type: "command",
        language: "bash",
        content: "docker system prune -af --volumes",
      },
      {
        title: "Find and kill process on a port",
        type: "command",
        language: "bash",
        content: "lsof -ti:3000 | xargs kill -9",
      },
      {
        title: "List outdated npm packages",
        type: "command",
        language: "bash",
        content: "npm outdated --long",
      },
    ],
  },
  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    icon: "Palette",
    items: [
      {
        title: "Tailwind CSS docs",
        type: "link",
        description: "Utility-first CSS reference",
        isFavorite: true,
        url: "https://tailwindcss.com/docs",
      },
      {
        title: "shadcn/ui",
        type: "link",
        description: "Accessible component library",
        url: "https://ui.shadcn.com",
      },
      {
        title: "Radix UI",
        type: "link",
        description: "Unstyled, accessible primitives",
        url: "https://www.radix-ui.com",
      },
      {
        title: "Lucide icons",
        type: "link",
        description: "Open-source icon set",
        url: "https://lucide.dev",
      },
    ],
  },
];

async function main() {
  // Idempotent: clear seedable content, then recreate. Keeps the demo user row.
  await prisma.itemTag.deleteMany();
  await prisma.item.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.itemType.deleteMany();

  const password = await bcrypt.hash("12345678", 12);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: "Demo User", password, isPro: false, emailVerified: new Date() },
    create: {
      email: DEMO_EMAIL,
      name: "Demo User",
      password,
      isPro: false,
      emailVerified: new Date(),
    },
  });

  const typeBySlug = new Map<string, string>();
  for (const t of SYSTEM_TYPES) {
    const created = await prisma.itemType.create({
      data: { name: t.name, slug: t.name, icon: t.icon, color: t.color, isSystem: true },
    });
    typeBySlug.set(t.name, created.id);
  }

  for (const col of COLLECTIONS) {
    const collection = await prisma.collection.create({
      data: {
        name: col.name,
        description: col.description,
        icon: col.icon,
        isFavorite: col.isFavorite ?? false,
        userId: user.id,
      },
    });

    for (const item of col.items) {
      await prisma.item.create({
        data: {
          title: item.title,
          description: item.description,
          contentType: "text",
          content: item.content,
          language: item.language,
          url: item.url,
          isPinned: item.isPinned ?? false,
          isFavorite: item.isFavorite ?? false,
          userId: user.id,
          typeId: typeBySlug.get(item.type)!,
          collectionId: collection.id,
        },
      });
    }
  }

  const counts = {
    users: await prisma.user.count(),
    itemTypes: await prisma.itemType.count(),
    collections: await prisma.collection.count(),
    items: await prisma.item.count(),
  };
  console.log("Seed complete:");
  console.table(counts);
}

main()
  .catch((e) => {
    console.error("Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
