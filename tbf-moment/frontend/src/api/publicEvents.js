import { apiFetch } from './client'

export function getPublicEvent(slug) {
  return apiFetch(`/public/events/${slug}`, { auth: false })
}

export function getPublicSite(slug) {
  return apiFetch(`/public/events/${slug}/site`, { auth: false })
}
