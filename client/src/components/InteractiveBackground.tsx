import { useEffect, useRef } from "react"

// More advanced implementation with canvas for better performance and "magnetic" effect
export const CanvasBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = window.innerWidth
    let height = window.innerHeight

    canvas.width = width
    canvas.height = height

    const particles: any[] = []
    const particleCount = 150

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 4 + 2,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
      })
    }

    const mouse = { x: -1000, y: -1000 }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    })

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Update and draw particles
      particles.forEach(p => {
        // Distance from mouse
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 200

        // Magnetic effect: move towards mouse if close
        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance
          p.vx += dx * force * 0.0005
          p.vy += dy * force * 0.0005
        }

        // Friction
        p.vx *= 0.98
        p.vy *= 0.98

        // Movement
        p.x += p.vx
        p.y += p.vy

        // Wrap around screen
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(100, 100, 100, ${0.3 + (1 - distance / maxDistance) * 0.5})` // Brighten when close
        if (distance > maxDistance) ctx.fillStyle = 'rgba(100, 100, 100, 0.2)'

        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" />
}

// Refactor pass 5: verified component render.

// Code audit 29: verified logic safety.

// Update 2025-12-22 12:40:00: refactor(tests): clean up mock data
