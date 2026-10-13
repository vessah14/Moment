import { apiFetch } from './client'

export function listTicketTypes(eventId) {
  return apiFetch(`/ticketing/types/event/${eventId}`)
}

export function createTicketType(dto, eventId) {
  return apiFetch(`/ticketing/types?eventId=${eventId}`, { method: 'POST', body: dto })
}

export function deleteTicketType(id) {
  return apiFetch(`/ticketing/types/${id}`, { method: 'DELETE' })
}

export function recordTicketSale(ticketTypeId, dto) {
  return apiFetch(`/ticketing/types/${ticketTypeId}/sales`, { method: 'POST', body: dto })
}

export function listTicketSales(eventId) {
  return apiFetch(`/ticketing/sales/event/${eventId}`)
}
