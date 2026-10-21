// Effets des modèles premium : particules de fond (canvas), explosion festive et
// musique d'ambiance générée en direct (Web Audio, aucun fichier audio).

const COUNT = { or: 60, petales: 24, confetti: 38, ballons: 9, etoiles: 46, bulles: 20, braises: 30, neige: 70 }

// ---------- Particules de fond ----------
export function createParticles(canvas, kind) {
  const ctx = canvas.getContext('2d')
  let W = 0
  let H = 0
  let P = []
  let raf = 0
  let colors = ['#ffffff']
  const r = Math.random

  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = window.innerWidth
    H = window.innerHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const spawn = (init) => {
    const up = ['or', 'ballons', 'etoiles', 'bulles', 'braises'].includes(kind)
    const b = {
      x: r() * W,
      y: init ? r() * H : up ? H + 40 : -40,
      c: colors[(r() * colors.length) | 0],
      rot: r() * 6.28,
      vr: (r() - 0.5) * 0.02,
      ph: r() * 6.28,
    }
    if (kind === 'or') return { ...b, s: r() * 2.2 + 0.6, vy: -(r() * 0.35 + 0.1), vx: (r() - 0.5) * 0.15 }
    if (kind === 'petales') return { ...b, s: r() * 6 + 5, vy: r() * 0.6 + 0.35, vx: r() * 0.4 - 0.1 }
    if (kind === 'confetti') return { ...b, s: r() * 6 + 4, vy: r() * 1 + 0.6, vx: (r() - 0.5) * 0.6, vr: (r() - 0.5) * 0.15 }
    if (kind === 'ballons') return { ...b, s: r() * 14 + 18, vy: -(r() * 0.35 + 0.25), vx: 0 }
    if (kind === 'bulles') return { ...b, s: r() * 16 + 6, vy: -(r() * 0.3 + 0.15), vx: 0 }
    if (kind === 'braises') return { ...b, s: r() * 1.6 + 0.6, vy: -(r() * 0.25 + 0.08), vx: (r() - 0.5) * 0.1 }
    if (kind === 'neige') return { ...b, s: r() * 2.6 + 1, vy: r() * 0.55 + 0.25, vx: (r() - 0.5) * 0.2 }
    return { ...b, s: r() * 3 + 1.5, vy: -(r() * 0.1 + 0.02), vx: 0 }
  }

  const star = (x, y, s) => {
    ctx.beginPath()
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4
      const rr = i % 2 ? s * 0.35 : s
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
    }
    ctx.closePath()
    ctx.fill()
  }

  const frame = () => {
    ctx.clearRect(0, 0, W, H)
    for (const p of P) {
      p.ph += 0.02
      p.rot += p.vr
      p.y += p.vy
      p.x += p.vx + (kind === 'petales' || kind === 'ballons' ? Math.sin(p.ph) * 0.4 : 0)
      ctx.fillStyle = p.c
      ctx.save()
      if (kind === 'or') {
        ctx.globalAlpha = 0.35 + 0.55 * Math.abs(Math.sin(p.ph))
        ctx.shadowColor = p.c
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.s, 0, 7)
        ctx.fill()
      } else if (kind === 'petales') {
        ctx.globalAlpha = 0.7
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.beginPath()
        ctx.ellipse(0, 0, p.s * 0.45, p.s, 0, 0, 7)
        ctx.fill()
      } else if (kind === 'confetti') {
        ctx.globalAlpha = 0.85
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.scale(1, Math.cos(p.ph * 3))
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2)
      } else if (kind === 'ballons') {
        ctx.globalAlpha = 0.5
        ctx.translate(p.x, p.y)
        ctx.beginPath()
        ctx.ellipse(0, 0, p.s * 0.8, p.s, 0, 0, 7)
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(-4, p.s)
        ctx.lineTo(4, p.s)
        ctx.lineTo(0, p.s - 5)
        ctx.fill()
        ctx.strokeStyle = p.c
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, p.s)
        ctx.bezierCurveTo(8, p.s + 15, -8, p.s + 30, 0, p.s + 45)
        ctx.stroke()
        ctx.globalAlpha = 0.35
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.ellipse(-p.s * 0.3, -p.s * 0.4, p.s * 0.15, p.s * 0.25, -0.5, 0, 7)
        ctx.fill()
      } else if (kind === 'bulles') {
        p.x += Math.sin(p.ph) * 0.3
        ctx.globalAlpha = 0.45
        ctx.strokeStyle = p.c
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.s, 0, 7)
        ctx.stroke()
        ctx.globalAlpha = 0.5
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(p.x - p.s * 0.35, p.y - p.s * 0.35, p.s * 0.18, 0, 7)
        ctx.fill()
      } else if (kind === 'neige') {
        p.x += Math.sin(p.ph) * 0.35
        ctx.globalAlpha = 0.55 + 0.35 * Math.abs(Math.sin(p.ph * 0.5))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.s, 0, 7)
        ctx.fill()
      } else if (kind === 'braises') {
        ctx.globalAlpha = 0.15 + 0.4 * Math.abs(Math.sin(p.ph * 0.6))
        ctx.shadowColor = p.c
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.s, 0, 7)
        ctx.fill()
      } else {
        ctx.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin(p.ph))
        star(p.x, p.y, p.s * 2)
      }
      ctx.restore()
      if (p.y < -60 || p.y > H + 60 || p.x < -60 || p.x > W + 60) Object.assign(p, spawn(false))
    }
    raf = requestAnimationFrame(frame)
  }

  const onVisibility = () => {
    cancelAnimationFrame(raf)
    if (!document.hidden && P.length) raf = requestAnimationFrame(frame)
  }

  size()
  window.addEventListener('resize', size)
  document.addEventListener('visibilitychange', onVisibility)

  return {
    setColors(next) {
      colors = next?.length ? next : colors
      P.forEach((p) => {
        p.c = colors[(r() * colors.length) | 0]
      })
    },
    start() {
      cancelAnimationFrame(raf)
      const n = Math.round((COUNT[kind] ?? 30) * Math.max(0.55, Math.min(1.2, W / 1200)))
      P = Array.from({ length: n }, () => spawn(true))
      raf = requestAnimationFrame(frame)
    },
    destroy() {
      cancelAnimationFrame(raf)
      P = []
      ctx.clearRect(0, 0, W, H)
      window.removeEventListener('resize', size)
      document.removeEventListener('visibilitychange', onVisibility)
    },
  }
}

// ---------- Explosion festive (réponse envoyée, cadeau ouvert) ----------
export function burst(canvas, x, y, kind, colors) {
  // Modèles sobres (hommage) : aucune explosion festive.
  if (!kind || kind === 'none') return
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = window.innerWidth
  const H = window.innerHeight
  canvas.width = W * dpr
  canvas.height = H * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const P = Array.from({ length: 110 }, () => {
    const a = Math.random() * 6.28
    const v = Math.random() * 9 + 4
    return {
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 5,
      s: Math.random() * 7 + 5,
      c: colors[(Math.random() * colors.length) | 0],
      r: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.3,
    }
  })
  let t = 0
  const step = () => {
    ctx.clearRect(0, 0, W, H)
    for (const p of P) {
      p.vy += 0.28
      p.vx *= 0.985
      p.x += p.vx
      p.y += p.vy
      p.r += p.vr
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.r)
      ctx.fillStyle = p.c
      ctx.globalAlpha = Math.max(0, 1 - t / 130)
      if (kind === 'coeurs') {
        const s = p.s
        ctx.beginPath()
        ctx.moveTo(0, s * 0.35)
        ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.45, -s, 0, -s * 0.4)
        ctx.bezierCurveTo(s * 0.45, -s, s, -s * 0.3, 0, s * 0.35)
        ctx.fill()
      } else if (kind === 'etoiles') {
        ctx.beginPath()
        for (let i = 0; i < 10; i++) {
          const a = (i * Math.PI) / 5
          const rr = i % 2 ? p.s * 0.4 : p.s
          ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
        }
        ctx.fill()
      } else {
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2)
      }
      ctx.restore()
    }
    if (++t < 130) requestAnimationFrame(step)
    else ctx.clearRect(0, 0, W, H)
  }
  step()
}

// ---------- Musique générée en direct ----------
const STYLES = {
  harpe: { bpm: 76, root: 57, prog: [0, 9, 5, 7], q: [0, 1, 0, 0], arp: [0, 1, 2, 3, 2, 1, 2, 1], decay: 1.8, bright: 2, pad: true },
  balafon: { bpm: 112, root: 57, prog: [0, 8, 3, 10], q: [1, 0, 0, 0], arp: [0, null, 2, 1, null, 3, 2, 1], decay: 0.32, bright: 4, perc: 'tam' },
  kalimba: { bpm: 118, root: 62, prog: [0, 7, 9, 5], q: [0, 0, 1, 0], arp: [0, 2, 1, 3, 0, 2, 3, 1], decay: 0.9, bright: 3, perc: 'shaker' },
  lounge: { bpm: 84, root: 55, prog: [0, 9, 2, 7], q: [0, 1, 1, 0], chords: [[0, 4, 7, 11], [0, 3, 7, 10], [0, 3, 7, 10], [0, 4, 7, 10]], arp: [0, 2, 1, 3, null, 2, 3, 1], decay: 1.3, bright: 2, pad: true, perc: 'brush', swing: 0.2 },
  pulse: { bpm: 122, root: 57, prog: [0, 8, 3, 10], q: [1, 0, 0, 0], arp: [0, 2, 3, 2, 0, 2, 3, 1], decay: 0.28, bright: 2, perc: 'four' },
  clochettes: { bpm: 104, root: 64, prog: [0, 5, 7, 0], q: [0, 0, 0, 0], arp: [0, 2, 3, 2, 1, 2, 3, null], decay: 1.4, bright: 4.2, pad: true, perc: 'shaker' },
  recueil: { bpm: 54, root: 50, prog: [0, 5, 9, 7], q: [0, 0, 1, 0], arp: [0, null, 2, null, 1, null, 3, null], decay: 2.8, bright: 2, pad: true },
}

export function createMusic(styleId, onChange) {
  const s = STYLES[styleId]
  let ac
  let out
  let timer
  let noiseBuf
  let playing = false
  let step = 0
  let nextT = 0
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12)

  const init = () => {
    ac = new (window.AudioContext || window.webkitAudioContext)()
    const comp = ac.createDynamicsCompressor()
    out = ac.createGain()
    out.gain.value = 0
    const dl = ac.createDelay(1)
    const fb = ac.createGain()
    const lp = ac.createBiquadFilter()
    dl.delayTime.value = 0.27
    fb.gain.value = 0.3
    lp.type = 'lowpass'
    lp.frequency.value = 2200
    out.connect(comp)
    out.connect(dl)
    dl.connect(lp)
    lp.connect(fb)
    fb.connect(dl)
    lp.connect(comp)
    comp.connect(ac.destination)
  }

  const pluck = (m, t, dur, vel = 1) => {
    const freq = hz(m)
    const g = ac.createGain()
    const g2 = ac.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.2 * vel, t + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur)
    const o1 = ac.createOscillator()
    o1.type = 'sine'
    o1.frequency.value = freq
    const o2 = ac.createOscillator()
    o2.type = styleId === 'balafon' ? 'sine' : 'triangle'
    o2.frequency.value = freq * s.bright
    g2.gain.setValueAtTime(0.3, t)
    g2.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.35)
    o1.connect(g)
    o2.connect(g2)
    g2.connect(g)
    g.connect(out)
    o1.start(t)
    o2.start(t)
    o1.stop(t + dur + 0.05)
    o2.stop(t + dur + 0.05)
  }

  const pad = (ms, t, dur) => {
    ms.forEach((m) => {
      const o = ac.createOscillator()
      const g = ac.createGain()
      o.type = 'sine'
      o.frequency.value = hz(m)
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.035, t + dur * 0.4)
      g.gain.linearRampToValueAtTime(0, t + dur)
      o.connect(g)
      g.connect(out)
      o.start(t)
      o.stop(t + dur + 0.05)
    })
  }

  const kick = (t, v = 1) => {
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.frequency.setValueAtTime(140, t)
    o.frequency.exponentialRampToValueAtTime(48, t + 0.18)
    g.gain.setValueAtTime(0.45 * v, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
    o.connect(g)
    g.connect(out)
    o.start(t)
    o.stop(t + 0.32)
  }

  const shaker = (t, v = 1) => {
    if (!noiseBuf) {
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.2, ac.sampleRate)
      const d = noiseBuf.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    }
    const n = ac.createBufferSource()
    const fl = ac.createBiquadFilter()
    const g = ac.createGain()
    n.buffer = noiseBuf
    fl.type = 'highpass'
    fl.frequency.value = 6000
    g.gain.setValueAtTime(0.1 * v, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
    n.connect(fl)
    fl.connect(g)
    g.connect(out)
    n.start(t)
    n.stop(t + 0.1)
  }

  const schedule = () => {
    const spb = 60 / s.bpm / 2
    while (nextT < ac.currentTime + 0.2) {
      const bar = Math.floor(step / 8) % 4
      const i = step % 8
      const root = s.root + s.prog[bar]
      const tri = s.chords ? s.chords[bar] : s.q[bar] ? [0, 3, 7, 12] : [0, 4, 7, 12]
      const a = s.arp[i]
      const tt = nextT + (s.swing && i % 2 ? spb * s.swing : 0)
      if (a !== null) pluck(root + 12 + tri[a], tt, s.decay, i % 2 ? 0.7 : 1)
      if (s.perc === 'four') {
        if (i % 2 === 0) kick(nextT, 0.9)
        else shaker(nextT, 1)
      }
      if (s.perc === 'brush') {
        if (i === 0 || i === 4) kick(nextT, 0.45)
        if (i % 2) shaker(tt, 0.55)
      }
      if (styleId === 'balafon' && (i === 3 || i === 7))
        pluck(root + 24 + tri[(a ?? 1) % 4], nextT + spb / 2, 0.22, 0.5)
      if (i === 0) {
        pluck(root - 12, nextT, s.decay * 1.6, 0.9)
        if (s.pad) pad(tri.slice(0, 3).map((x) => root + x), nextT, spb * 8)
      }
      if (s.perc === 'tam') {
        if (i === 0 || i === 3 || i === 6) kick(nextT, i === 0 ? 1 : 0.6)
        if (i % 2) shaker(nextT, 0.8)
      }
      if (s.perc === 'shaker') {
        if (i === 0 || i === 4) kick(nextT, 0.7)
        shaker(nextT, i % 2 ? 1 : 0.5)
      }
      nextT += spb
      step++
    }
  }

  const setPlaying = (value) => {
    playing = value
    onChange?.(value)
  }

  const onVisibility = () => {
    if (!ac || !playing) return
    if (document.hidden) ac.suspend()
    else ac.resume()
  }
  document.addEventListener('visibilitychange', onVisibility)

  return {
    available: Boolean(s),
    play() {
      if (!s) return
      try {
        if (!ac) init()
        ac.resume()
        if (nextT < ac.currentTime) nextT = ac.currentTime + 0.1
        out.gain.cancelScheduledValues(ac.currentTime)
        out.gain.setTargetAtTime(0.6, ac.currentTime, 0.6)
        clearInterval(timer)
        timer = setInterval(schedule, 40)
        schedule()
        setPlaying(true)
      } catch {
        setPlaying(false)
      }
    },
    pause() {
      if (!ac) return
      out.gain.setTargetAtTime(0, ac.currentTime, 0.25)
      setPlaying(false)
      setTimeout(() => {
        if (!playing) {
          clearInterval(timer)
          ac.suspend()
        }
      }, 900)
    },
    toggle() {
      if (playing) this.pause()
      else this.play()
    },
    destroy() {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
      ac?.close?.()
    },
  }
}
