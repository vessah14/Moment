export const GUEST_STATUS_LABELS = {
  Present: 'Confirmé',
  Absent: 'Refus',
  EnAttente: 'En attente',
}

export const GUEST_STATUS_BY_LABEL = {
  Confirmé: 'Present',
  Refus: 'Absent',
  'En attente': 'EnAttente',
}

export function guestStatusLabel(status) {
  return GUEST_STATUS_LABELS[status] ?? status
}
