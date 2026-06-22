"use client"

import { useEffect } from "react"

export default function ScrollAnimations() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".animate-on-scroll")
    // Apply hidden state via JS only — elements are visible by default for SSR/crawlers
    els.forEach((el) => el.classList.add("anim-ready"))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove("anim-ready")
            e.target.classList.add("is-visible")
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return null
}
