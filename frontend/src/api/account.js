import { apiFetch } from './client'

// Espace de l'organisateur connecté : offre en cours, demandes de passage à une offre
// payante, avis sur la plateforme.
export function getMyPlan() {
  return apiFetch('/me/plan')
}

export function requestPlanUpgrade(dto) {
  return apiFetch('/me/upgrade-requests', { method: 'POST', body: dto })
}

export function cancelPlanUpgrade() {
  return apiFetch('/me/upgrade-requests/pending', { method: 'DELETE' })
}

export function getMyReview() {
  return apiFetch('/me/review')
}

export function saveMyReview(dto) {
  return apiFetch('/me/review', { method: 'PUT', body: dto })
}

export function deleteMyReview() {
  return apiFetch('/me/review', { method: 'DELETE' })
}

// Avis publiés, affichés sur l'accueil (sans connexion).
export function getPublicReviews(limit = 6) {
  return apiFetch(`/public/reviews?limit=${limit}`, { auth: false })
}
