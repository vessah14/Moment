import { apiFetch } from './client'

export function getEventStats(eventId) {
  return apiFetch(`/events/${eventId}/stats`)
}
