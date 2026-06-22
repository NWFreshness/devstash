import type { Metadata } from "next"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/marketing/navbar"
import Hero from "@/components/marketing/hero"
import Features from "@/components/marketing/features"
import AiSection from "@/components/marketing/ai-section"
import Pricing from "@/components/marketing/pricing"
import CtaSection from "@/components/marketing/cta-section"
import Footer from "@/components/marketing/footer"
import ScrollAnimations from "@/components/marketing/scroll-animations"

export const metadata: Metadata = {
  title: "DevStash — Store Smarter. Build Faster.",
  description:
    "A centralized knowledge hub for developers. Store snippets, prompts, commands, notes, and files in one searchable place. Free to start.",
}

export default async function HomePage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <div className="bg-[#09090b]">
      <Navbar />
      <main id="main-content">
      <Hero />
      <Features />
      <AiSection />
      <Pricing />
      <CtaSection />
      <Footer />
      </main>
      <ScrollAnimations />
    </div>
  )
}
