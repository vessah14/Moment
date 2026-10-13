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

export function deleteEventBlock(id) {
  return apiFetch(`/event-blocks/${id}`, { method: 'DELETE' })
}
