export function formatEventDate(isoDate) {
  if (!isoDate) return ''
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatTimeRange({ timeStart, timeEnd }) {
  if (!timeStart) return ''
  return timeEnd ? `${timeStart} - ${timeEnd}` : timeStart
}
