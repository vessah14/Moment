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

// Arrivée le jour J — distincte de la réponse RSVP (guest.status).
export function checkInGuest(id) {
  return apiFetch(`/guests/${id}/check-in`, { method: 'POST' })
}

export function undoCheckInGuest(id) {
  return apiFetch(`/guests/${id}/check-in`, { method: 'DELETE' })
}

export function getPublicInvitation(guestId) {
  return apiFetch(`/public/invitations/${guestId}`, { auth: false })
}

export function submitPublicRsvp(guestId, dto) {
  return apiFetch(`/public/invitations/${guestId}/rsvp`, { method: 'POST', body: dto, auth: false })
}

// Lien d'invitation par e-mail (confirmation de présence) : envoi ou renvoi à un invité.
export function sendGuestInvitation(id) {
  return apiFetch(`/guests/${id}/invitation`, { method: 'POST' })
}

// Envoie le lien à tous les invités de l'événement qui ne l'ont pas encore reçu.
export function sendPendingInvitations(eventId) {
  return apiFetch(`/guests/invitations?eventId=${eventId}`, { method: 'POST' })
}
