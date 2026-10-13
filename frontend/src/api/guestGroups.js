import { apiFetch } from './client'

export function listGuestGroups(eventId) {
  return apiFetch(`/guest-groups/event/${eventId}`)
}

export function getGuestGroup(id) {
  return apiFetch(`/guest-groups/${id}`)
}

export function createGuestGroup(dto, eventId) {
  return apiFetch(`/guest-groups?eventId=${eventId}`, { method: 'POST', body: dto })
}

export function updateGuestGroup(id, dto) {
  return apiFetch(`/guest-groups/${id}`, { method: 'PUT', body: dto })
}

export function deleteGuestGroup(id) {
  return apiFetch(`/guest-groups/${id}`, { method: 'DELETE' })
}
