import { apiFetch } from './client'

export function listTables(eventId) {
  return apiFetch(`/seating/tables/event/${eventId}`)
}

export function createTable(dto, eventId) {
  return apiFetch(`/seating/tables?eventId=${eventId}`, { method: 'POST', body: dto })
}

export function deleteTable(id) {
  return apiFetch(`/seating/tables/${id}`, { method: 'DELETE' })
}

export function listAssignments(eventId) {
  return apiFetch(`/seating/assignments/event/${eventId}`)
}

export function assignGuest(dto, eventId) {
  return apiFetch(`/seating/assignments?eventId=${eventId}`, { method: 'POST', body: dto })
}

export function unassignGuest(guestId) {
  return apiFetch(`/seating/assignments/guest/${guestId}`, { method: 'DELETE' })
}
