import { apiFetch, isAuthenticated } from './client'

const PUBLIC_SITE_CACHE_PREFIX = 'tbf_public_site_'
const PUBLIC_SITE_CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000
const PUBLIC_SITE_CACHE_MAX_LENGTH = 750_000
const PUBLIC_SITE_TIMEOUT_MS = 8000
const PUBLIC_SITE_RETRY_DELAYS_MS = [400, 1000]
const prefetchedPublicSites = new Map()

export function getPublicEvent(slug) {
  return apiFetch(`/public/events/${slug}`, { auth: false })
}

function cacheKey(slug) {
  return `${PUBLIC_SITE_CACHE_PREFIX}${slug}`
}

function isPublicSite(value) {
  return Boolean(value?.event && Array.isArray(value.blocks))
}

export function getCachedPublicSite(slug) {
  try {
    const raw = window.sessionStorage.getItem(cacheKey(slug))
    if (!raw) return null

    const cached = JSON.parse(raw)
    const age = Date.now() - cached?.savedAt
    if (
      !cached ||
      !Number.isFinite(cached.savedAt) ||
      age < 0 ||
      age > PUBLIC_SITE_CACHE_MAX_AGE_MS ||
      !isPublicSite(cached.data)
    ) {
      window.sessionStorage.removeItem(cacheKey(slug))
      return null
    }

    return cached.data
  } catch {
    return null
  }
}

export function clearCachedPublicSite(slug) {
  try {
    window.sessionStorage.removeItem(cacheKey(slug))
  } catch {
    // Le cache ne doit jamais empêcher l'affichage d'une erreur de publication.
  }
}

function cachePublicSite(slug, site) {
  try {
    const value = JSON.stringify({ savedAt: Date.now(), data: site })
    if (value.length > PUBLIC_SITE_CACHE_MAX_LENGTH) return
    window.sessionStorage.setItem(cacheKey(slug), value)
  } catch {
    // Le cache est facultatif : le chargement réseau reste prioritaire.
  }
}

function isTransientPublicSiteError(error) {
  return error?.status === 0 || error?.status === 408 || error?.status >= 500
}

function createTimeoutError() {
  const error = new Error('Le chargement du site prend trop de temps.')
  error.name = 'TimeoutError'
  error.status = 0
  return error
}

function waitForRetry(delay, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
      return
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }, delay)
    const abort = () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', abort, { once: true })
  })
}

async function requestPublicSite(slug, { signal } = {}) {
  let lastError

  for (let attempt = 0; attempt <= PUBLIC_SITE_RETRY_DELAYS_MS.length; attempt += 1) {
    if (signal?.aborted) {
      throw signal.reason ?? new DOMException('Aborted', 'AbortError')
    }

    const controller = new AbortController()
    let timedOut = false
    const forwardAbort = () => controller.abort(signal.reason)
    signal?.addEventListener('abort', forwardAbort, { once: true })
    const timeout = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, PUBLIC_SITE_TIMEOUT_MS)
    let retryDelay = null

    try {
      const site = await apiFetch(`/public/events/${encodeURIComponent(slug)}/site`, {
        auth: false,
        signal: controller.signal,
      })
      if (!isPublicSite(site)) {
        const error = new Error('La réponse du site événementiel est invalide.')
        error.status = 502
        throw error
      }
      cachePublicSite(slug, site)
      return site
    } catch (error) {
      if (signal?.aborted) throw error
      lastError = timedOut ? createTimeoutError() : error
      if (!isTransientPublicSiteError(lastError) || attempt === PUBLIC_SITE_RETRY_DELAYS_MS.length) {
        throw lastError
      }
      retryDelay = PUBLIC_SITE_RETRY_DELAYS_MS[attempt]
    } finally {
      clearTimeout(timeout)
      signal?.removeEventListener('abort', forwardAbort)
    }

    if (retryDelay !== null) await waitForRetry(retryDelay, signal)
  }

  throw lastError
}

export function getPublicSite(slug, { signal, force = false } = {}) {
  const prefetched = prefetchedPublicSites.get(slug)
  if (!force && prefetched) return prefetched

  const request = requestPublicSite(slug, { signal })
  prefetchedPublicSites.set(slug, request)
  return request
}

export function clearPrefetchedPublicSite(slug) {
  prefetchedPublicSites.delete(slug)
}

export function prefetchPublicSite(slug, options) {
  return getPublicSite(slug, options)
}

// Messages du livre d'or validés, actualisés pendant qu'un invité consulte l'événement.
export function getPublicGuestBookEntries(slug) {
  return apiFetch(`/public/events/${encodeURIComponent(slug)}/guest-book`, { auth: false })
}

// Mur du jour J : dernières photos et derniers messages validés.
export function getPublicWall(slug) {
  return apiFetch(`/public/events/${encodeURIComponent(slug)}/wall`, { auth: false })
}

// Album des invités : la photo attend la validation de l'organisateur avant d'être visible.
export function uploadGuestPhoto(slug, file, name) {
  const formData = new FormData()
  formData.append('file', file)
  if (name?.trim()) formData.append('name', name.trim())
  return apiFetch(`/public/events/${encodeURIComponent(slug)}/photos`, { method: 'POST', body: formData, auth: false })
}

export function submitPublicEventRsvp(slug, dto) {
  return apiFetch(`/public/events/${encodeURIComponent(slug)}/rsvp`, { method: 'POST', body: dto, auth: false })
}

// Message d'un invité dans le livre d'or : publié seulement après validation de l'organisateur.
export function signPublicGuestBook(slug, dto) {
  return apiFetch(`/public/events/${encodeURIComponent(slug)}/guest-book`, { method: 'POST', body: dto, auth: false })
}

// Plan de table public : tables sans noms d'invités, et recherche par nom complet.
export function getPublicSeating(slug) {
  return apiFetch(`/public/events/${encodeURIComponent(slug)}/seating`, { auth: false })
}

export function findPublicSeat(slug, name) {
  return apiFetch(
    `/public/events/${encodeURIComponent(slug)}/seating/find?name=${encodeURIComponent(name)}`,
    { auth: false },
  )
}

// Statistiques du site public (page Statistiques de l'organisateur) : une visite par
// session de navigateur, un partage à chaque partage effectif. Jamais bloquant.
export function trackPublicEvent(slug, type) {
  if (!slug) return
  if (type === 'visit') {
    // L'organisateur connecté qui regarde son propre site ne compte pas comme visiteur.
    if (isAuthenticated()) return
    const key = `tbf_visit_${slug}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      // sessionStorage indisponible : on compte quand même la visite.
    }
  }
  apiFetch(`/public/events/${encodeURIComponent(slug)}/track`, { method: 'POST', body: { type }, auth: false }).catch(() => {})
}

// « Signaler cette page » : envoyé à l'équipe TBF MOMENT, jamais à l'organisateur.
export function reportPublicPage(slug, { reason, message, contact }) {
  return apiFetch(`/public/events/${encodeURIComponent(slug)}/report`, {
    method: 'POST',
    body: { reason, message, contact },
    auth: false,
  })
}
