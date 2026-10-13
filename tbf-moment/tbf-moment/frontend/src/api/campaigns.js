import { apiFetch } from './client'

export function listCampaigns(eventId) {
  return apiFetch(`/campaigns/event/${eventId}`)
}

export function createCampaign(dto, eventId) {
  return apiFetch(`/campaigns?eventId=${eventId}`, { method: 'POST', body: dto })
}

export function deleteCampaign(id) {
  return apiFetch(`/campaigns/${id}`, { method: 'DELETE' })
}

// Modifie une campagne pas encore envoyée ; sendNow l'envoie aussitôt (e-mail).
export function updateCampaign(id, dto) {
  return apiFetch(`/campaigns/${id}`, { method: 'PUT', body: dto })
}
