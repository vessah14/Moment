import { apiFetch } from './client'

export function listGuests(eventId) {
  const query = eventId ? `?eventId=${eventId}` : ''
  return apiFetch(`/guests${query}`)
}

export function getGuest(id) {
  return apiFetch(`/guests/${id}`)
}

export function createGuest(dto, { eventId, groupId }) {
  const params = new URLSearchParams({ eventId })
  if (groupId) params.set('groupId', groupId)
  return apiFetch(`/guests?${params.toString()}`, { method: 'POST', body: dto })
}

export function updateGuest(id, dto) {
  return apiFetch(`/guests/${id}`, { method: 'PUT', body: dto })
}

export function deleteGuest(id) {
  return apiFetch(`/guests/${id}`, { method: 'DELETE' })
}
