import { apiFetch } from './client'

export function listGiftItems(eventId) {
  return apiFetch(`/gift-items/event/${eventId}`)
}

export function createGiftItem(dto, eventId) {
  return apiFetch(`/gift-items?eventId=${eventId}`, { method: 'POST', body: dto })
}

export function deleteGiftItem(id) {
  return apiFetch(`/gift-items/${id}`, { method: 'DELETE' })
}

export function getPublicEvent(slug) {
  return apiFetch(`/public/events/${slug}`, { auth: false })
}

export function getPublicGifts(slug) {
  return apiFetch(`/public/events/${slug}/gifts`, { auth: false })
}

export function reservePublicGift(giftId, dto) {
  return apiFetch(`/public/gifts/${giftId}/reserve`, { method: 'POST', body: dto, auth: false })
}
