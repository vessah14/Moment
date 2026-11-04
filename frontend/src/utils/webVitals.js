import { API_URL } from '../api/client'

// Vitesse réelle vue par les visiteurs (Core Web Vitals) : LCP, CLS, INP, FCP et TTFB,
// mesurés par le navigateur et envoyés une fois, quand la page passe en arrière-plan.
// Aucun identifiant ni cookie : seulement la valeur, le type de page et le réseau.
// Le backend les range dans Prometheus (web_vitals_*), lisibles dans Grafana.

export function pageGroup(pathname) {
  if (pathname === '/') return 'accueil'
  if (/^\/e\/[^/]+\/?$/.test(pathname)) return 'evenement'
  if (pathname.startsWith('/e/')) return 'mur'
  if (pathname.startsWith('/invitation/')) return 'invitation'
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/builder')) return 'tableau-de-bord'
  return 'autre'
}

// CLS : plus grande « fenêtre » de décalages (moins d'1 s entre deux, 5 s au plus),
// hors décalages qui suivent une action de l'utilisateur.
export function clsFromShifts(entries) {
  let best = 0
  let current = 0
  let first = 0
  let last = 0
  for (const e of entries) {
    if (e.hadRecentInput) continue
    if (current && e.startTime - last < 1000 && e.startTime - first < 5000) {
      current += e.value
    } else {
      current = e.value
      first = e.startTime
    }
    last = e.startTime
    best = Math.max(best, current)
  }
  return best
}

function observe(type, callback, options = {}) {
  try {
    const po = new PerformanceObserver((list) => callback(list.getEntries()))
    po.observe({ type, buffered: true, ...options })
    return po
  } catch {
    return null
  }
}

export function startWebVitals() {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined' || !navigator.sendBeacon) return
  // Page d'arrivée : celle que mesurent LCP, FCP et TTFB (même si l'on navigue ensuite).
  const page = pageGroup(location.pathname)
  const metrics = {}
  const shifts = []
  let inp = 0

  const nav = performance.getEntriesByType?.('navigation')?.[0]
  if (nav?.responseStart > 0) metrics.ttfb = nav.responseStart
  observe('paint', (entries) => {
    const fcp = entries.find((e) => e.name === 'first-contentful-paint')
    if (fcp) metrics.fcp = fcp.startTime
  })
  observe('largest-contentful-paint', (entries) => {
    const lcp = entries.at(-1)
    if (lcp) metrics.lcp = lcp.startTime
  })
  observe('layout-shift', (entries) => shifts.push(...entries))
  // INP (approché) : la plus longue interaction de la visite.
  observe('event', (entries) => {
    for (const e of entries) if (e.interactionId) inp = Math.max(inp, e.duration)
  }, { durationThreshold: 40 })

  let sent = false
  const send = () => {
    if (sent || document.visibilityState !== 'hidden') return
    sent = true
    metrics.cls = clsFromShifts(shifts)
    if (inp) metrics.inp = inp
    const payload = {
      page,
      net: navigator.connection?.effectiveType || '',
      ...Object.fromEntries(Object.entries(metrics).map(([k, v]) => [k, Math.round(v * 1000) / 1000])),
    }
    // text/plain : requête « simple », sans prévol CORS, que sendBeacon accepte vers l'API.
    navigator.sendBeacon(`${API_URL}/vitals`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }))
  }
  addEventListener('visibilitychange', send)
  addEventListener('pagehide', () => {
    if (document.visibilityState !== 'hidden') return
    send()
  })
}
