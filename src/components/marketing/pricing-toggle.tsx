"use client"

import { useState } from "react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const FREE_FEATURES = [
  { text: "50 items", included: true },
  { text: "3 collections", included: true },
  { text: "Snippets, prompts, notes, URLs", included: true },
  { text: "Image uploads", included: true },
  { text: "Command palette", included: true },
  { text: "Dark mode", included: true },
  { text: "File uploads", included: false },
  { text: "AI features", included: false },
  { text: "Custom item types", included: false },
]

const PRO_FEATURES = [
  { text: "Unlimited items", included: true },
  { text: "Unlimited collections", included: true },
  { text: "Everything in Free", included: true },
  { text: "File uploads (PDFs, zips…)", included: true },
  { text: "AI auto-tagging", included: true },
  { text: "AI summaries", included: true },
  { text: "Explain Code", included: true },
  { text: "Prompt optimizer", included: true },
  { text: "Export (JSON / ZIP)", included: true },
]

export default function PricingToggle() {
  const [yearly, setYearly] = useState(false)

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12 animate-on-scroll">
        <span className={cn("text-sm transition-colors", !yearly ? "text-white" : "text-white/50")}>
          Monthly
        </span>
        <button
          role="switch"
          aria-checked={yearly}
          onClick={() => setYearly((y) => !y)}
          className="relative w-12 h-6 rounded-full bg-white/10 border border-white/20 transition-colors hover:bg-white/20"
          aria-label="Toggle billing period"
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[#6366f1] transition-transform duration-200",
              yearly && "translate-x-6"
            )}
          />
        </button>
        <span className={cn("text-sm transition-colors flex items-center gap-2", yearly ? "text-white" : "text-white/50")}>
          Yearly
          <span className="text-[10px] font-semibold bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full">
            Save 25%
          </span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free */}
        <div className="animate-on-scroll rounded-xl border border-white/10 bg-white/[0.03] p-8">
          <div className="text-white font-semibold text-lg mb-4">Free</div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-bold text-white">$0</span>
            <span className="text-white/50 text-sm">forever</span>
          </div>
          <div className="h-5 mb-6" />
          <ul className="flex flex-col gap-3 mb-8">
            {FREE_FEATURES.map((f) => (
              <li key={f.text} className={cn("flex items-center gap-3 text-sm", f.included ? "text-white/80" : "text-white/30")}>
                <span className={f.included ? "text-[#22c55e]" : "text-white/30"}>
                  {f.included ? "✓" : "✗"}
                </span>
                {f.text}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center border-white/20 text-white hover:bg-white/10 h-10")}
          >
            Get Started
          </Link>
        </div>

        {/* Pro */}
        <div className="animate-on-scroll rounded-xl border border-[#6366f1]/50 bg-[#6366f1]/5 p-8 relative">
          <div className="absolute top-4 right-4 text-[10px] font-semibold bg-[#6366f1] text-white px-2 py-0.5 rounded-full">
            Most Popular
          </div>
          <div className="text-white font-semibold text-lg mb-4">Pro</div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-bold text-white">{yearly ? "$6" : "$8"}</span>
            <span className="text-white/50 text-sm">/month</span>
          </div>
          <div className="h-5 mb-6">
            {yearly && (
              <p className="text-xs text-white/40">Billed $72/year</p>
            )}
          </div>
          <ul className="flex flex-col gap-3 mb-8">
            {PRO_FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-sm text-white/80">
                <span className="text-[#22c55e]">✓</span>
                {f.text}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className={cn(buttonVariants(), "w-full justify-center bg-[#6366f1] text-white hover:bg-[#4f46e5] h-10")}
          >
            Start Pro
          </Link>
        </div>
      </div>
    </div>
  )
}
