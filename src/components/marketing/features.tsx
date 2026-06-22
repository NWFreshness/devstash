import { Code2, MessageSquare, Search, Terminal, Paperclip, FolderOpen } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const FEATURES: { icon: LucideIcon; title: string; desc: string; accent: string }[] = [
  {
    icon: Code2,
    title: "Code Snippets",
    desc: "Save reusable code blocks with syntax highlighting. Stop rewriting the same logic twice.",
    accent: "#3b82f6",
  },
  {
    icon: MessageSquare,
    title: "AI Prompts",
    desc: "Build a library of prompts that work. Share them across projects and teams.",
    accent: "#f59e0b",
  },
  {
    icon: Search,
    title: "Instant Search",
    desc: "⌘K command palette finds anything across all your items in milliseconds.",
    accent: "#22c55e",
  },
  {
    icon: Terminal,
    title: "Commands",
    desc: "Never dig through bash history again. Store CLI commands with descriptions and tags.",
    accent: "#06b6d4",
  },
  {
    icon: Paperclip,
    title: "Files & Docs",
    desc: "Upload PDFs, templates, and reference documents. Keep context files close.",
    accent: "#64748b",
  },
  {
    icon: FolderOpen,
    title: "Collections",
    desc: 'Group related items into collections. "React Patterns", "Onboarding Docs", "My AI Stack".',
    accent: "#6366f1",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-[#0d0d0f]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16 animate-on-scroll">
          Everything a developer needs,{" "}
          <span className="bg-gradient-to-r from-[#6366f1] to-[#3b82f6] bg-clip-text text-transparent">
            in one place
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="animate-on-scroll rounded-xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-colors"
                style={{ borderTopColor: f.accent }}
              >
                <div className="mb-3">
                  <Icon size={24} style={{ color: f.accent }} aria-hidden />
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
