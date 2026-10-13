import { apiFetch } from './client'

export function listProgramItems(eventId) {
  return apiFetch(`/program-items/event/${eventId}`)
}

export function createProgramItem(dto, eventId) {
  return apiFetch(`/program-items?eventId=${eventId}`, { method: 'POST', body: dto })
}

export function updateProgramItem(id, dto) {
  return apiFetch(`/program-items/${id}`, { method: 'PUT', body: dto })
}

export function toggleProgramItemNotify(id) {
  return apiFetch(`/program-items/${id}/notify`, { method: 'PATCH' })
}

export function deleteProgramItem(id) {
  return apiFetch(`/program-items/${id}`, { method: 'DELETE' })
}
