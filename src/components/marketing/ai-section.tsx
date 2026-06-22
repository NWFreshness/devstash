const CHECKLIST = [
  { title: "Auto-tagging",      desc: "Generate relevant tags from your content automatically" },
  { title: "AI Summaries",      desc: "Get a TL;DR for long notes and documents" },
  { title: "Explain Code",      desc: "Natural language walkthrough of any snippet" },
  { title: "Prompt Optimizer",  desc: "Refine your LLM prompts for better results" },
]

const CODE_LINES = [
  { parts: [{ text: "function ", cls: "text-[#c792ea]" }, { text: "useDebounce", cls: "text-[#82aaff]" }, { text: "<", cls: "text-white/70" }, { text: "T", cls: "text-[#ffcb6b]" }, { text: ">", cls: "text-white/70" }, { text: "(", cls: "text-white/70" }] },
  { parts: [{ text: "  value", cls: "text-[#f07178]" }, { text: ": ", cls: "text-white/70" }, { text: "T", cls: "text-[#ffcb6b]" }, { text: ",", cls: "text-white/70" }] },
  { parts: [{ text: "  delay", cls: "text-[#f07178]" }, { text: ": ", cls: "text-white/70" }, { text: "number", cls: "text-[#ffcb6b]" }] },
  { parts: [{ text: "): ", cls: "text-white/70" }, { text: "T", cls: "text-[#ffcb6b]" }, { text: " {", cls: "text-white/70" }] },
  { parts: [{ text: "  const ", cls: "text-[#c792ea]" }, { text: "[debouncedValue, set] =", cls: "text-white/80" }] },
  { parts: [{ text: "    useState", cls: "text-[#82aaff]" }, { text: "<", cls: "text-white/70" }, { text: "T", cls: "text-[#ffcb6b]" }, { text: ">(value);", cls: "text-white/70" }] },
  { parts: [{ text: "", cls: "" }] },
  { parts: [{ text: "  useEffect", cls: "text-[#82aaff]" }, { text: "(() => {", cls: "text-white/70" }] },
  { parts: [{ text: "    const ", cls: "text-[#c792ea]" }, { text: "timer = ", cls: "text-white/80" }, { text: "setTimeout", cls: "text-[#82aaff]" }, { text: "(...);", cls: "text-white/70" }] },
  { parts: [{ text: "    return ", cls: "text-[#c792ea]" }, { text: "() => clearTimeout(timer);", cls: "text-white/70" }] },
  { parts: [{ text: "  }, [value, delay]);", cls: "text-white/70" }] },
  { parts: [{ text: "  return ", cls: "text-[#c792ea]" }, { text: "debouncedValue;", cls: "text-white/70" }] },
  { parts: [{ text: "}", cls: "text-white/70" }] },
]

export default function AiSection() {
  return (
    <section id="ai" className="py-24 bg-[#09090b]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Left */}
          <div className="flex-1 animate-on-scroll">
            <div className="inline-block text-xs font-semibold text-[#6366f1] bg-[#6366f1]/15 px-3 py-1 rounded-full mb-6">
              Pro Feature
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Let AI do the{" "}
              <span className="bg-gradient-to-r from-[#6366f1] to-[#3b82f6] bg-clip-text text-transparent">
                heavy lifting
              </span>
            </h2>
            <ul className="flex flex-col gap-6">
              {CHECKLIST.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="text-[#22c55e] text-lg font-bold mt-0.5">✓</span>
                  <div>
                    <strong className="text-white font-semibold">{item.title}</strong>
                    <p className="text-sm text-white/50 mt-1">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: code mockup */}
          <div className="flex-1 w-full animate-on-scroll" style={{ animationDelay: "0.15s" }}>
            <div className="rounded-xl border border-white/10 bg-[#1e1e1e] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#2d2d2d] border-b border-white/10">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="ml-auto text-xs text-white/40">typescript</span>
              </div>
              <pre
                role="img"
                aria-label="TypeScript code example showing a useDebounce hook with generic type parameter"
                className="p-4 text-sm font-mono overflow-x-auto leading-relaxed"
              >
                <code>
                  {CODE_LINES.map((line, i) => (
                    <div key={i}>
                      {line.parts.map((p, j) => (
                        <span key={j} className={p.cls}>{p.text}</span>
                      ))}
                    </div>
                  ))}
                </code>
              </pre>
              <div className="px-4 pb-4 pt-2 border-t border-white/10">
                <div className="text-xs text-white/40 mb-2">AI Generated Tags</div>
                <div className="flex flex-wrap gap-2">
                  {["react", "hooks", "typescript", "performance", "debounce"].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-[#6366f1]/20 text-[#818cf8] border border-[#6366f1]/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
