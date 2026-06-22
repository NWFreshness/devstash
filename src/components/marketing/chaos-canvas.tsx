"use client"

import { useEffect, useRef } from "react"

const ICONS = [
  { label: "N",  color: "#ffffff", size: 32, font: "bold" },
  { label: "⌥",  color: "#ffffff", size: 34, font: "normal" },
  { label: "⎋",  color: "#4ade80", size: 34, font: "normal" },
  { label: "#",  color: "#db4437", size: 34, font: "bold" },
  { label: "⌗",  color: "#6366f1", size: 36, font: "normal" },
  { label: "⇥",  color: "#f59e0b", size: 34, font: "normal" },
  { label: "✎",  color: "#94a3b8", size: 34, font: "normal" },
  { label: "⊛",  color: "#06b6d4", size: 34, font: "normal" },
]

export default function ChaosCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    let animId: number
    let mouse = { x: -9999, y: -9999 }
    type Ball = {
      x: number; y: number; vx: number; vy: number
      rot: number; rotV: number; scale: number; t: number
      radius: number; label: string; color: string; size: number; font: string
    }
    let balls: Ball[] = []

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      canvas!.width = rect.width
      canvas!.height = rect.height
    }

    function initBalls() {
      const W = canvas!.width, H = canvas!.height
      balls = ICONS.map((icon) => ({
        x: 40 + Math.random() * (W - 80),
        y: 40 + Math.random() * (H - 80),
        vx: (Math.random() - 0.5) * 1.4,
        vy: (Math.random() - 0.5) * 1.4,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.02,
        scale: 0.9 + Math.random() * 0.3,
        t: Math.random() * Math.PI * 2,
        radius: Math.round(icon.size * 0.6),
        ...icon,
      }))
    }

    function draw() {
      const W = canvas!.width, H = canvas!.height
      ctx.clearRect(0, 0, W, H)

      balls.forEach((b) => {
        b.t += 0.025
        const s = b.scale + Math.sin(b.t) * 0.08

        const dx = b.x - mouse.x, dy = b.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const repelRadius = 90
        if (dist < repelRadius && dist > 0) {
          const force = ((repelRadius - dist) / repelRadius) * 2.5
          b.vx += (dx / dist) * force * 0.12
          b.vy += (dy / dist) * force * 0.12
        }

        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy)
        if (speed > 2.4) { b.vx *= 2.4 / speed; b.vy *= 2.4 / speed }

        b.x += b.vx; b.y += b.vy; b.rot += b.rotV
        b.vx *= 0.98; b.vy *= 0.98

        const r = b.radius
        if (b.x < r)     { b.x = r;     b.vx = Math.abs(b.vx) }
        if (b.x > W - r) { b.x = W - r; b.vx = -Math.abs(b.vx) }
        if (b.y < r)     { b.y = r;     b.vy = Math.abs(b.vy) }
        if (b.y > H - r) { b.y = H - r; b.vy = -Math.abs(b.vy) }

        ctx.save()
        ctx.translate(b.x, b.y)
        ctx.rotate(b.rot)
        ctx.scale(s, s)
        ctx.globalAlpha = 0.85
        ctx.font = `${b.font} ${b.size}px system-ui, sans-serif`
        ctx.fillStyle = b.color
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(b.label, 0, 0)
        ctx.restore()
      })

      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i], b = balls[j]
          const dx = b.x - a.x, dy = b.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const minDist = a.radius + b.radius
          if (dist < minDist && dist > 0) {
            const nx = dx / dist, ny = dy / dist
            const overlap = (minDist - dist) * 0.5
            a.x -= nx * overlap; a.y -= ny * overlap
            b.x += nx * overlap; b.y += ny * overlap
            const dot = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
            if (dot < 0) {
              a.vx += dot * nx; a.vy += dot * ny
              b.vx -= dot * nx; b.vy -= dot * ny
            }
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onMouseLeave() { mouse = { x: -9999, y: -9999 } }
    function onTouchMove(e: TouchEvent) {
      const rect = canvas!.getBoundingClientRect()
      mouse = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
      e.preventDefault()
    }

    canvas.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("mouseleave", onMouseLeave)
    canvas.addEventListener("touchmove", onTouchMove, { passive: false })
    canvas.addEventListener("touchend", onMouseLeave)

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(animId)
      resize(); initBalls(); draw()
    })
    ro.observe(canvas)

    resize(); initBalls(); draw()

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      canvas.removeEventListener("mousemove", onMouseMove)
      canvas.removeEventListener("mouseleave", onMouseLeave)
      canvas.removeEventListener("touchmove", onTouchMove)
      canvas.removeEventListener("touchend", onMouseLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
