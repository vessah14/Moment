export const STATUS_LABELS = {
  Brouillon: 'Brouillon',
  Publie: 'Publié',
  Archive: 'Archivé',
}

export function statusLabel(status) {
  return STATUS_LABELS[status] ?? status
}

export function formatEventDate(eventDate) {
  if (!eventDate) return 'Date à définir'
  const date = new Date(`${eventDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return eventDate
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
