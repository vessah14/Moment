import { apiFetch } from './client'

export function getNotifications() {
  return apiFetch('/notifications')
}

export function markNotificationRead(id) {
  return apiFetch(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PUT' })
}

export function deleteNotification(id) {
  return apiFetch(`/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function markAllNotificationsRead() {
  return apiFetch('/notifications/read-all', { method: 'PUT' })
}
