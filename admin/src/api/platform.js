import { apiFetch } from './client'

export function getDashboardSummary() {
  return apiFetch('/admin/platform/dashboard')
}

export function getSystemHealth() {
  return apiFetch('/admin/platform/health')
}

export function listAdminActivity(limit = 100) {
  return apiFetch(`/admin/platform/activity?limit=${limit}`)
}

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

// Demandes de passage à une offre payante (paiement reçu hors ligne, puis activation).
export function listUpgradeRequests() {
  return apiFetch('/admin/platform/upgrade-requests')
}

export function approveUpgradeRequest(id, note) {
  return apiFetch(`/admin/platform/upgrade-requests/${id}/approve`, { method: 'POST', body: { note } })
}

export function rejectUpgradeRequest(id, note) {
  return apiFetch(`/admin/platform/upgrade-requests/${id}/reject`, { method: 'POST', body: { note } })
}

// Avis des clients sur la plateforme (publiés sur l'accueil après validation).
export function listReviews() {
  return apiFetch('/admin/platform/reviews')
}

export function updateReviewStatus(id, status) {
  return apiFetch(`/admin/platform/reviews/${id}/status`, { method: 'PATCH', body: { status } })
}

// Graphiques : une ligne par jour sur la période (7 à 365 jours).
export function getTimeSeries(days = 30) {
  return apiFetch(`/admin/platform/timeseries?days=${days}`)
}

// Fiche d'une organisation, et gestion manuelle de son offre.
export function getOrganization(id) {
  return apiFetch(`/admin/platform/organizations/${id}`)
}

export function grantOrganizationPlan(id, planId, days) {
  return apiFetch(`/admin/platform/organizations/${id}/plan`, { method: 'POST', body: { planId, days } })
}

export function revokeOrganizationPlan(id) {
  return apiFetch(`/admin/platform/organizations/${id}/plan/revoke`, { method: 'POST' })
}
