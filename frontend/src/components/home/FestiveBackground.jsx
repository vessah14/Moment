import { useEffect, useId, useRef } from 'react'

// Fond animé de l'accueil (repris du prototype) : formes de fête qui flottent sur un
// canvas (étincelles, anneaux, confettis, cœurs, petits « M », triangles toghu) et grand
// « M » du logo qui se dessine puis suit doucement le défilement et la souris.
// - pause quand le bloc sort de l'écran ou que l'onglet est caché ;
// - moins de formes sur un petit téléphone ou avec l'économiseur de données ;
// - « réduire les animations » : une seule image fixe, M déjà dessiné.

const COLORS = ['#FF7A3D', '#E2337E', '#8B6CFF', '#F5C451', '#3DD68C']

const isLite = () => {
  try {
    const c = navigator.connection
    return (
      Boolean(c && (c.saveData || /2g/.test(c.effectiveType || ''))) ||
      (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)
    )
  } catch {
    return false
  }
}

function drawShape(c, p) {
  c.save()
  c.translate(p.x, p.y)
  c.rotate(p.r)
  c.globalAlpha = p.a
  c.fillStyle = c.strokeStyle = p.col
  c.lineWidth = 1.6 * p.z
  const s = p.s
  switch (p.k) {
    case 0: // étincelle
      c.beginPath()
      for (let i = 0; i < 8; i++) {
        const rr = i % 2 ? s * 0.32 : s
        const a = (i * Math.PI) / 4
        c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
      }
      c.closePath()
      c.fill()
      break
    case 1: // anneau
      c.beginPath()
      c.arc(0, 0, s * 0.7, 0, 7)
      c.stroke()
      break
    case 2: // confetti
      c.fillRect(-s * 0.5, -s * 0.22, s, s * 0.44)
      break
    case 3: // cœur
      c.beginPath()
      c.moveTo(0, s * 0.55)
      c.bezierCurveTo(-s, -s * 0.1, -s * 0.45, -s * 0.9, 0, -s * 0.35)
      c.bezierCurveTo(s * 0.45, -s * 0.9, s, -s * 0.1, 0, s * 0.55)
      c.fill()
      break
    case 4: // petit M
      c.beginPath()
      c.moveTo(-s * 0.6, s * 0.5)
      c.lineTo(-s * 0.6, -s * 0.5)
      c.lineTo(0, s * 0.05)
      c.lineTo(s * 0.6, -s * 0.5)
      c.lineTo(s * 0.6, s * 0.5)
      c.lineJoin = 'round'
      c.lineWidth = 2.2 * p.z
      c.stroke()
      break
    case 5: // triangle toghu
      c.beginPath()
      c.moveTo(0, -s * 0.6)
      c.lineTo(s * 0.55, s * 0.45)
      c.lineTo(-s * 0.55, s * 0.45)
      c.closePath()
      c.stroke()
      break
    default: // point
      c.beginPath()
      c.arc(0, 0, s * 0.28, 0, 7)
      c.fill()
  }
  c.restore()
}

// bigM : true (grand M en fond de l'en-tête, qui suit le défilement), 'center' (M centré
// et fixe, pour une carte) ou false.
export default function FestiveBackground({ density = 17000, bigM = true }) {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const mRef = useRef(null)
  // Un identifiant de dégradé par instance (l'en-tête et la carte finale ont chacun leur M).
  const gradId = `festive-m-grad-${useId().replace(/:/g, '')}`

  useEffect(() => {
    const root = rootRef.current
    const cv = canvasRef.current
    if (!root || !cv) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lite = isLite()
    const c = cv.getContext('2d')
    let W = 0
    let H = 0
    let P = []
    let on = false
    let raf = 0
    let mx = 0
    let my = 0
    let tx = 0
    let ty = 0
    let visible = false

    const make = (y) => {
      const z = 0.45 + Math.random() * 0.75
      return {
        x: Math.random() * W,
        y: y ?? Math.random() * H,
        z,
        s: (5 + Math.random() * 9) * z,
        k: (Math.random() * 7) | 0,
        col: COLORS[(Math.random() * COLORS.length) | 0],
        a: 0.18 + 0.42 * z,
        vy: -(0.12 + Math.random() * 0.35) * z,
        sw: Math.random() * 6.28,
        sws: 0.004 + Math.random() * 0.01,
        r: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.012,
      }
    }

    const size = () => {
      const b = root.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      W = b.width
      H = b.height
      cv.width = W * dpr
      cv.height = H * dpr
      c.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.min(lite ? 14 : 48, Math.round((W * H) / (lite ? 52000 : density)))
      while (P.length < n) P.push(make())
      P.length = n
    }

    const frame = () => {
      c.clearRect(0, 0, W, H)
      tx += (mx - tx) * 0.05
      ty += (my - ty) * 0.05
      for (const p of P) {
        p.y += p.vy
        p.sw += p.sws
        p.r += p.vr
        if (p.y < -20) Object.assign(p, make(H + 20))
        const x0 = p.x
        const y0 = p.y
        p.x += Math.sin(p.sw) * 14 * p.z + tx * 26 * p.z
        p.y += ty * 18 * p.z
        drawShape(c, p)
        p.x = x0
        p.y = y0
      }
      if (on) raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (on || reduced) return
      on = true
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      on = false
      cancelAnimationFrame(raf)
    }

    size()
    if (reduced) frame()

    const onResize = () => {
      size()
      if (reduced) frame()
    }
    const onPointer = (e) => {
      mx = e.clientX / window.innerWidth - 0.5
      my = e.clientY / window.innerHeight - 0.5
    }
    const onVisibility = () => (document.hidden ? stop() : visible && start())
    const hover = window.matchMedia('(hover: hover)').matches

    // Grand M : suit le défilement et la souris (légère parallaxe).
    let mRaf = 0
    const m = mRef.current
    const followM = () => {
      if (m && window.scrollY < window.innerHeight * 1.2) {
        m.style.transform = `translate3d(${-tx * 24}px, ${window.scrollY * 0.18 - ty * 16}px, 0)`
      }
      mRaf = requestAnimationFrame(followM)
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !document.hidden) start()
      else stop()
    })
    io.observe(root)
    window.addEventListener('resize', onResize, { passive: true })
    if (hover && !reduced) window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    if (bigM === true && !reduced) mRaf = requestAnimationFrame(followM)

    return () => {
      stop()
      cancelAnimationFrame(mRaf)
      io.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [density, bigM])

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {bigM && (
        <svg ref={mRef} viewBox="-2 -2 36 36" className={bigM === 'center' ? 'festive-m festive-m-center' : 'festive-m'}>
          <defs>
            <linearGradient id={gradId} x1="0" x2="1" y1="1" y2="0">
              <stop offset="0" stopColor="#FF7A3D" />
              <stop offset=".5" stopColor="#E2337E" />
              <stop offset="1" stopColor="#8B6CFF" />
            </linearGradient>
          </defs>
          <path className="festive-m-line festive-m-glow" style={{ stroke: `url(#${gradId})` }} pathLength="1" d="M4 27V6l12 12L28 6v21" />
          <path className="festive-m-line" style={{ stroke: `url(#${gradId})` }} pathLength="1" d="M4 27V6l12 12L28 6v21" />
          <circle className="festive-m-star" cx="27" cy="4" r="1.6" />
        </svg>
      )}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
