export const GUEST_STATUS_LABELS = {
  Present: 'Confirmé',
  Absent: 'Refus',
  EnAttente: 'En attente',
}

export const GUEST_STATUS_BY_FILTER = {
  Confirmés: 'Present',
  Refus: 'Absent',
  'En attente': 'EnAttente',
}

export function guestStatusLabel(status) {
  return GUEST_STATUS_LABELS[status] ?? status
}

export function hasGuestStatus(status, expectedStatus) {
  return String(status ?? '').trim().toLowerCase() === String(expectedStatus ?? '').trim().toLowerCase()
}
