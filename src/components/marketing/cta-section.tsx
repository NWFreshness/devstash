import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CtaSection() {
  return (
    <section className="py-24 bg-[#09090b]">
      <div className="max-w-6xl mx-auto px-6 text-center animate-on-scroll">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to organize your{" "}
          <span className="bg-gradient-to-r from-[#6366f1] to-[#3b82f6] bg-clip-text text-transparent">
            developer knowledge?
          </span>
        </h2>
        <p className="text-white/50 mb-8 text-lg">
          Join developers who stopped losing their best work.
        </p>
        <Link
          href="/register"
          className={cn(buttonVariants({ size: "lg" }), "bg-[#6366f1] text-white hover:bg-[#4f46e5] px-8 h-12 text-base")}
        >
          Get Started Free
        </Link>
      </div>
    </section>
  )
}
