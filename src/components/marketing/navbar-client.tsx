"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NavbarClient() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#09090b]/95 backdrop-blur-sm border-b border-white/10"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="text-[#6366f1]">⌗</span>
          <span>DevStash</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-white/70 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#ai" className="text-sm text-white/70 hover:text-white transition-colors">
            AI
          </Link>
          <Link href="#pricing" className="text-sm text-white/70 hover:text-white transition-colors">
            Pricing
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-white/80 hover:text-white")}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "sm" }), "bg-[#6366f1] text-white hover:bg-[#4f46e5]")}
          >
            Get Started
          </Link>
        </div>

        <button
          className="md:hidden text-white/80 hover:text-white p-2 rounded-md"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#09090b]/98 border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          <Link
            href="#features"
            className="text-sm text-white/70 hover:text-white py-1"
            onClick={() => setMobileOpen(false)}
          >
            Features
          </Link>
          <Link
            href="#ai"
            className="text-sm text-white/70 hover:text-white py-1"
            onClick={() => setMobileOpen(false)}
          >
            AI
          </Link>
          <Link
            href="#pricing"
            className="text-sm text-white/70 hover:text-white py-1"
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </Link>
          <Link href="/sign-in" className="text-sm text-white/70 hover:text-white py-1">
            Sign In
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "sm" }), "bg-[#6366f1] text-white hover:bg-[#4f46e5] text-center justify-center")}
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  )
}
