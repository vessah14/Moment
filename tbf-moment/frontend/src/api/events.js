import { apiFetch } from './client'

export function listEvents() {
  return apiFetch('/events')
}

export function getEvent(id) {
  return apiFetch(`/events/${id}`)
}

export function createEvent(dto) {
  return apiFetch('/events', { method: 'POST', body: dto })
}

export function updateEvent(id, dto) {
  return apiFetch(`/events/${id}`, { method: 'PUT', body: dto })
}

export function deleteEvent(id) {
  return apiFetch(`/events/${id}`, { method: 'DELETE' })
}
