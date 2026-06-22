import Link from "next/link"

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing",  href: "#pricing" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About",   href: "#" },
      { label: "Blog",    href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms",   href: "#" },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#0d0d0f] border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-10 md:gap-8 justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white mb-3">
              <span className="text-[#6366f1]">⌗</span>
              <span>DevStash</span>
            </Link>
            <p className="text-sm text-white/40">Store Smarter. Build Faster.</p>
          </div>
          <div className="flex flex-wrap gap-10">
            {FOOTER_LINKS.map((col) => (
              <div key={col.heading} className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  {col.heading}
                </h4>
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-white/40 hover:text-white/80 transition-colors py-1"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} DevStash. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
