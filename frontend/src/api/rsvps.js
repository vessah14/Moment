import { apiFetch } from './client'

export function listRsvps({ eventId, guestId } = {}) {
  const params = new URLSearchParams()
  if (eventId) params.set('eventId', eventId)
  if (guestId) params.set('guestId', guestId)
  const query = params.toString() ? `?${params.toString()}` : ''
  return apiFetch(`/rsvps${query}`)
}

export function getRsvp(id) {
  return apiFetch(`/rsvps/${id}`)
}

export function createRsvp(dto, { guestId, eventId }) {
  const params = new URLSearchParams({ guestId, eventId })
  return apiFetch(`/rsvps?${params.toString()}`, { method: 'POST', body: dto })
}

export function updateRsvp(id, dto) {
  return apiFetch(`/rsvps/${id}`, { method: 'PUT', body: dto })
}

export function deleteRsvp(id) {
  return apiFetch(`/rsvps/${id}`, { method: 'DELETE' })
}
