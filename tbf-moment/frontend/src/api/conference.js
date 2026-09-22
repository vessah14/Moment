import { apiFetch } from './client'

export function listSpeakers(eventId) {
  return apiFetch(`/conference/speakers/event/${eventId}`)
}
export function createSpeaker(dto, eventId) {
  return apiFetch(`/conference/speakers?eventId=${eventId}`, { method: 'POST', body: dto })
}
export function deleteSpeaker(id) {
  return apiFetch(`/conference/speakers/${id}`, { method: 'DELETE' })
}

export function listSessions(eventId) {
  return apiFetch(`/conference/sessions/event/${eventId}`)
}
export function createSession(dto, eventId) {
  return apiFetch(`/conference/sessions?eventId=${eventId}`, { method: 'POST', body: dto })
}
export function deleteSession(id) {
  return apiFetch(`/conference/sessions/${id}`, { method: 'DELETE' })
}

export function listSponsors(eventId) {
  return apiFetch(`/conference/sponsors/event/${eventId}`)
}
export function createSponsor(dto, eventId) {
  return apiFetch(`/conference/sponsors?eventId=${eventId}`, { method: 'POST', body: dto })
}
export function deleteSponsor(id) {
  return apiFetch(`/conference/sponsors/${id}`, { method: 'DELETE' })
}
