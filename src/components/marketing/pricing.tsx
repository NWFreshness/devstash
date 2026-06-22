import PricingToggle from "./pricing-toggle"

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-[#0d0d0f]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12 animate-on-scroll">
          Simple, honest{" "}
          <span className="bg-gradient-to-r from-[#6366f1] to-[#3b82f6] bg-clip-text text-transparent">
            pricing
          </span>
        </h2>
        <PricingToggle />
      </div>
    </section>
  )
}
