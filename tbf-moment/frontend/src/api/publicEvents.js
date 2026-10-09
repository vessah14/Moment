import { apiFetch } from './client'

export function getPublicEvent(slug) {
  return apiFetch(`/public/events/${slug}`, { auth: false })
}

export function getPublicSite(slug) {
  return apiFetch(`/public/events/${slug}/site`, { auth: false })
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
