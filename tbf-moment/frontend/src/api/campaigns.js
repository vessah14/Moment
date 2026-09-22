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
