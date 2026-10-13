import { apiFetch } from './client'

export function listEventCategories() {
  return apiFetch('/event-categories')
}

export function getEventCategory(id) {
  return apiFetch(`/event-categories/${id}`)
}
