import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import ChaosCanvas from "./chaos-canvas"

const DASH_CARDS = [
  { title: "useDebounce hook",    badge: "snippet", color: "#3b82f6" },
  { title: "GPT-4 System Prompt", badge: "prompt",  color: "#f59e0b" },
  { title: "git stash pop",       badge: "command", color: "#06b6d4" },
  { title: "Setup Notes",         badge: "note",    color: "#22c55e" },
  { title: "MDN CSS Grid",        badge: "url",     color: "#6366f1" },
  { title: "Architecture.png",    badge: "image",   color: "#ec4899" },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 pb-12 overflow-hidden bg-[#09090b]">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

          {/* Left: headline + CTAs */}
          <div className="flex-1 animate-on-scroll">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Stop Losing Your<br />
              <span className="bg-gradient-to-r from-[#6366f1] to-[#3b82f6] bg-clip-text text-transparent">
                Developer Knowledge
              </span>
            </h1>
            <p className="text-lg text-white/60 mb-8 max-w-lg leading-relaxed">
              Your snippets are in VS Code. Your prompts are in chat threads. Your commands are in bash history. Sound familiar?
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className={cn(buttonVariants({ size: "lg" }), "bg-[#6366f1] text-white hover:bg-[#4f46e5] px-6 h-11")}
              >
                Get Started Free
              </Link>
              <Link
                href="#features"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-white border-white/20 hover:bg-white/10 px-6 h-11")}
              >
                See Features
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/35">
              <span>Free to start</span>
              <span aria-hidden>·</span>
              <span>No credit card required</span>
              <span aria-hidden>·</span>
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Right: chaos + arrow + dashboard */}
          <div className="flex-1 flex flex-col lg:flex-row items-center gap-4 w-full animate-on-scroll" style={{ animationDelay: "0.15s" }}>

            {/* Chaos box */}
            <div className="flex-1 w-full lg:max-w-[240px]">
              <div className="text-xs text-white/40 text-center mb-2">Your knowledge today...</div>
              <div className="relative h-52 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <ChaosCanvas />
              </div>
            </div>

            {/* Arrow */}
            <div className="flex lg:flex-col items-center justify-center gap-1 text-white/40 rotate-90 lg:rotate-0">
              <div className="w-8 h-px bg-white/20 lg:w-px lg:h-8" />
              <span className="text-lg">→</span>
              <div className="w-8 h-px bg-white/20 lg:hidden" />
            </div>

            {/* Dashboard mockup */}
            <div className="flex-1 w-full lg:max-w-[260px]">
              <div className="text-xs text-white/40 text-center mb-2">...with DevStash</div>
              <div className="rounded-xl border border-white/10 bg-[#111113] overflow-hidden h-52">
                <div className="flex h-full">
                  {/* Sidebar */}
                  <div className="w-24 border-r border-white/10 bg-[#0d0d0f] p-2 flex flex-col gap-1">
                    {["All Items", "Snippets", "Prompts", "Commands", "Collections"].map((item, i) => (
                      <div
                        key={item}
                        className={cn(
                          "text-[9px] px-2 py-1 rounded text-white/50",
                          i === 0 && "bg-white/10 text-white/80"
                        )}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  {/* Cards */}
                  <div className="flex-1 p-2 grid grid-cols-2 gap-1.5 content-start overflow-hidden">
                    {DASH_CARDS.map((card) => (
                      <div
                        key={card.title}
                        className="rounded bg-white/5 p-1.5 border-l-2"
                        style={{ borderLeftColor: card.color }}
                      >
                        <div className="text-[8px] text-white/70 font-medium leading-tight mb-0.5 truncate">
                          {card.title}
                        </div>
                        <div
                          className="text-[7px] font-medium px-1 py-0.5 rounded-sm inline-block"
                          style={{ color: card.color, backgroundColor: `${card.color}20` }}
                        >
                          {card.badge}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
