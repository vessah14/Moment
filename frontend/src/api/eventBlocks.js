import { apiFetch } from './client'

export function listEventBlocks(eventId) {
  return apiFetch(`/event-blocks/event/${eventId}`)
}

export function createEventBlock(dto, eventId) {
  return apiFetch(`/event-blocks?eventId=${eventId}`, { method: 'POST', body: dto })
}

export function updateEventBlock(id, dto) {
  return apiFetch(`/event-blocks/${id}`, { method: 'PUT', body: dto })
}

// Toute la page en un seul appel, tout ou rien : l'ordre de la liste donne les positions.
export function replaceEventBlocks(eventId, blocks) {
  return apiFetch(`/event-blocks/event/${eventId}`, { method: 'PUT', body: blocks })
}

export function deleteEventBlock(id) {
  return apiFetch(`/event-blocks/${id}`, { method: 'DELETE' })
}
