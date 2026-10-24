// Billet vivant (repris du prototype) : le billet change selon le moment.
// - before : compte à rebours jusqu'au début ;
// - today  : c'est le jour J, le QR code passe en grand ;
// - in     : l'invité a été scanné à l'entrée, le billet porte le tampon « Entré » ;
// - past   : l'événement est terminé (8 h après le début si la fin n'est pas connue).

// Début de l'événement à partir des champs de l'API (« 2027-01-16 », « 10:00:00 »).
export function eventStartIso(eventDate, startTime) {
  if (!eventDate) return null
  return `${eventDate}T${(startTime || '00:00:00').slice(0, 8)}`
}

export function ticketLiveState({ start, end, checkedInAt } = {}, now = Date.now()) {
  if (checkedInAt) {
    const at = new Date(checkedInAt)
    if (!Number.isNaN(at.getTime())) return { kind: 'in', at }
  }
  const s = start ? new Date(start).getTime() : NaN
  if (Number.isNaN(s)) return null
  const e = end && !Number.isNaN(new Date(end).getTime()) ? new Date(end).getTime() : s + 8 * 3600e3
  if (now > e) return { kind: 'past' }
  if (now >= s || new Date(now).toDateString() === new Date(s).toDateString())
    return { kind: 'today', started: now >= s, minutes: Math.max(0, Math.ceil((s - now) / 60000)) }
  let r = Math.floor((s - now) / 1000)
  const days = Math.floor(r / 86400)
  r %= 86400
  const hours = Math.floor(r / 3600)
  r %= 3600
  return { kind: 'before', days, hours, minutes: Math.floor(r / 60), seconds: r % 60 }
}

// Enveloppe : jouée une seule fois par billet sur ce téléphone.
const ENV_KEY = 'tbfm-env'
export function envelopeSeen(code) {
  try {
    return JSON.parse(localStorage.getItem(ENV_KEY) || '[]').includes(code)
  } catch {
    return true
  }
}
export function markEnvelopeSeen(code) {
  try {
    const list = JSON.parse(localStorage.getItem(ENV_KEY) || '[]')
    if (!list.includes(code)) localStorage.setItem(ENV_KEY, JSON.stringify([...list, code].slice(-60)))
  } catch {
    // stockage indisponible (navigation privée) : l'enveloppe se rejouera, sans gravité
  }
}
