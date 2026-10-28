import { apiFetch, isAuthenticated } from './client'

export function getPublicEvent(slug) {
  return apiFetch(`/public/events/${slug}`, { auth: false })
}

export function getPublicSite(slug) {
  return apiFetch(`/public/events/${slug}/site`, { auth: false })
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
