import { apiFetch } from './client'

export function listGalleryPhotos(eventId) {
  return apiFetch(`/gallery/event/${eventId}`)
}

export function uploadGalleryPhoto(file, eventId) {
  const formData = new FormData()
  formData.append('file', file)
  return apiFetch(`/gallery?eventId=${eventId}`, { method: 'POST', body: formData })
}

export function updateGalleryPhotoStatus(id, status) {
  return apiFetch(`/gallery/${id}/status`, { method: 'PUT', body: { status } })
}

export function deleteGalleryPhoto(id) {
  return apiFetch(`/gallery/${id}`, { method: 'DELETE' })
}
