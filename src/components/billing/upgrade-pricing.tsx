"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

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
];

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
];

export function UpgradePricing() {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval: yearly ? "yearly" : "monthly" }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <span className={cn("text-sm transition-colors", !yearly ? "text-foreground" : "text-muted-foreground")}>
          Monthly
        </span>
        <button
          role="switch"
          aria-checked={yearly}
          onClick={() => setYearly((y) => !y)}
          className="relative w-12 h-6 rounded-full bg-muted border border-border transition-colors hover:bg-muted/80"
          aria-label="Toggle billing period"
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-violet-600 transition-transform duration-200",
              yearly && "translate-x-6"
            )}
          />
        </button>
        <span className={cn("text-sm transition-colors flex items-center gap-2", yearly ? "text-foreground" : "text-muted-foreground")}>
          Yearly
          <span className="text-[10px] font-semibold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
            Save 25%
          </span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free */}
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="font-semibold text-lg mb-4">Free</div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-muted-foreground text-sm">forever</span>
          </div>
          <div className="h-5 mb-6" />
          <ul className="flex flex-col gap-3 mb-8">
            {FREE_FEATURES.map((f) => (
              <li
                key={f.text}
                className={cn("flex items-center gap-3 text-sm", f.included ? "text-foreground" : "text-muted-foreground/50")}
              >
                <span className={f.included ? "text-green-400" : "text-muted-foreground/40"}>
                  {f.included ? "✓" : "✗"}
                </span>
                {f.text}
              </li>
            ))}
          </ul>
          <div className="w-full h-10 rounded-md border border-border flex items-center justify-center text-sm text-muted-foreground">
            Current plan
          </div>
        </div>

        {/* Pro */}
        <div className="rounded-xl border border-violet-500/50 bg-violet-500/5 p-8 relative">
          <div className="absolute top-4 right-4 text-[10px] font-semibold bg-violet-600 text-white px-2 py-0.5 rounded-full">
            Most Popular
          </div>
          <div className="font-semibold text-lg mb-4">Pro</div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-bold">{yearly ? "$6" : "$8"}</span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
          <div className="h-5 mb-6">
            {yearly && (
              <p className="text-xs text-muted-foreground">Billed $72/year</p>
            )}
          </div>
          <ul className="flex flex-col gap-3 mb-8">
            {PRO_FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-sm">
                <span className="text-green-400">✓</span>
                {f.text}
              </li>
            ))}
          </ul>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full h-10 rounded-md bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Redirecting…" : yearly ? "Upgrade — $72/yr" : "Upgrade — $8/mo"}
          </button>
        </div>
      </div>
    </div>
  );
}
