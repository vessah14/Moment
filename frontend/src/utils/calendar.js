// Ajout d'un événement à l'agenda du visiteur. Sur téléphone, un fichier .ics ouvre
// directement l'agenda du téléphone (Android comme iPhone) ; sur ordinateur, le lien
// Google Agenda reste le plus simple.
const DEFAULT_HOURS = 4

const stamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const escapeIcs = (value) => String(value ?? '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')

export function googleCalendarUrl({ title, start, location }) {
  const end = new Date(start.getTime() + DEFAULT_HOURS * 3600 * 1000)
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${stamp(start)}/${stamp(end)}${location ? `&location=${encodeURIComponent(location)}` : ''}`
}

export function buildIcs({ title, start, location, url, uid }) {
  const end = new Date(start.getTime() + DEFAULT_HOURS * 3600 * 1000)
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TBF Moment//FR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid || stamp(start)}@tbfmoment.com`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escapeIcs(title)}`,
    location ? `LOCATION:${escapeIcs(location)}` : null,
    url ? `URL:${url}` : null,
    url ? `DESCRIPTION:${escapeIcs(`Toutes les infos : ${url}`)}` : null,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcs(title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}

export function isMobileDevice() {
  return typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

// Clic sur « Ajouter à mon agenda » : fichier .ics sur téléphone, sinon le lien suit son cours.
export function handleAddToCalendar(event, details) {
  if (!isMobileDevice()) return
  event.preventDefault()
  const blob = new Blob([buildIcs(details)], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${details.uid || 'evenement'}.ics`
  link.click()
  setTimeout(() => URL.revokeObjectURL(link.href), 1000)
}
