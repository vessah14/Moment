import { apiFetch } from './client'

export function listEventLocations(eventId) {
  return apiFetch(`/event-locations/event/${eventId}`)
}

export function createEventLocation(dto, eventId) {
  return apiFetch(`/event-locations?eventId=${eventId}`, { method: 'POST', body: dto })
}

export function updateEventLocation(id, dto) {
  return apiFetch(`/event-locations/${id}`, { method: 'PUT', body: dto })
}

export function deleteEventLocation(id) {
  return apiFetch(`/event-locations/${id}`, { method: 'DELETE' })
}
