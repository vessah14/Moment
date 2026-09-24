import { apiFetch } from './client'

export function listOrganizations() {
  return apiFetch('/admin/platform/organizations')
}

export function updateOrganizationStatus(id, isActive) {
  return apiFetch(`/admin/platform/organizations/${id}/status`, {
    method: 'PATCH',
    body: { isActive },
  })
}

export function listPlatformEvents() {
  return apiFetch('/admin/platform/events')
}

export function updateEventSuspension(id, suspended) {
  return apiFetch(`/admin/platform/events/${id}/suspension`, {
    method: 'PATCH',
    body: { suspended },
  })
}

export function listModerationQueue() {
  return apiFetch('/admin/platform/moderation')
}

export function resolveGuestBookModeration(id, keep) {
  return apiFetch(`/admin/platform/moderation/guestbook/${id}/resolve?keep=${keep}`, {
    method: 'POST',
  })
}

export function resolveGalleryModeration(id, keep) {
  return apiFetch(`/admin/platform/moderation/gallery/${id}/resolve?keep=${keep}`, {
    method: 'POST',
  })
}

export function listTransactions() {
  return apiFetch('/admin/platform/transactions')
}
