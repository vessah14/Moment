import { apiFetch } from './client'

export function listGuestBookEntries(eventId) {
  return apiFetch(`/guest-book/event/${eventId}`)
}

export function createGuestBookEntry(dto, eventId) {
  return apiFetch(`/guest-book?eventId=${eventId}`, { method: 'POST', body: dto })
}

export function updateGuestBookStatus(id, status) {
  return apiFetch(`/guest-book/${id}/status`, { method: 'PUT', body: { status } })
}

export function deleteGuestBookEntry(id) {
  return apiFetch(`/guest-book/${id}`, { method: 'DELETE' })
}
