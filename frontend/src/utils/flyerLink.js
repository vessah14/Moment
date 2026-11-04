import { eventShareUrl } from '../api/client'

// Bouton « Faire un flyer » des pages d'événement (repris de flyerLink() du prototype) :
// ouvre le studio /flyer prérempli. Avant la fête : l'annonce qui convient au type
// (affiche, conférence, avis…) ; le jour J et après : le flyer de vœux ou les remerciements.
const WISHES = ['anniversaire', 'mariage', 'noces', 'bapteme', 'naissance', 'communion', 'examen', 'hommage', 'noel', 'nouvelan', 'valentin', 'paques', 'aid', 'fetenat', 'meres']
const BEFORE = { concert: 'concert', sport: 'match', conference: 'conference', lancement: 'conference', obseques: 'avis', 'retrait-deuil': 'invitation', 'portes-ouvertes': 'inscriptions' }
const AFTER = {
  anniversaire: 'anniversaire', mariage: 'mariage', noces: 'noces', bapteme: 'bapteme', 'baby-shower': 'naissance', communion: 'communion', graduation: 'examen',
  obseques: 'hommage', 'retrait-deuil': 'hommage', noel: 'noel', 'nouvel-an': 'nouvelan', 'saint-valentin': 'valentin', paques: 'paques', aid: 'aid',
  'fete-nationale': 'fetenat', 'fete-des-meres': 'meres',
}
const POSTERS = ['concert', 'match', 'conference', 'inscriptions']
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export function flyerLink({ type, title, displayName, start, venueName, venueAddress, slug, cover, age, now = Date.now() }) {
  if (!slug || !title) return null
  const t = String(type || '')
  const valid = start instanceof Date && !Number.isNaN(start.getTime())
  const days = valid ? Math.ceil((start.getTime() - now) / 864e5) : 0
  const names = String(displayName || '').split(/\s+&\s+/).map((n) => n.trim()).filter(Boolean)
  const who = names.length === 2 ? `${names[0]} & ${names[1]}` : names[0] || title
  const before = BEFORE[t] || (t === 'mariage' && days > 30 ? 'savedate' : 'compte')
  const pick = days > 0 ? before : AFTER[t] || 'remerciements'

  const q = new URLSearchParams({ occ: pick, type: t, nom: (POSTERS.includes(pick) ? title : who).slice(0, 40), ev: title.slice(0, 80), lien: eventShareUrl(slug).slice(0, 120) })
  if (!t) q.delete('type')
  if (pick !== 'remerciements' && !WISHES.includes(pick) && valid) {
    const day = cap(start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }))
    const hour = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')
    q.set('quand', `${day} · ${hour}`.slice(0, 50))
    const lieu = [venueName, venueAddress && venueAddress.split(',').pop().trim()].filter(Boolean).join(', ')
    if (lieu) q.set('lieu', lieu.slice(0, 60))
  }
  if (pick === 'compte') {
    q.set('num', String(Math.max(0, Math.min(999, days))))
    q.set('sous', title.slice(0, 60))
  } else if (pick === 'anniversaire' && /^\d{1,3}$/.test(String(age ?? ''))) q.set('num', String(age))
  if (typeof cover === 'string' && /\.(jpe?g|png|webp)$/i.test(cover.split('?')[0])) q.set('cover', cover)

  const mourn = /obseq|deuil|hommage|memoire/.test(t)
  const label = days > 0
    ? "Créer un flyer d'annonce"
    : mourn
      ? "Faire un flyer d'hommage"
      : WISHES.includes(pick)
        ? `Faire un flyer pour ${names.length === 2 ? 'les mariés' : names[0] || "l'honoré·e"}`
        : 'Flyer de remerciements'
  return { href: `/flyer?${q}`, label }
}

export function guestStatusFlyerLink({ eventName, eventDate, eventCategoryCode }) {
  if (!eventName || !eventDate || eventCategoryCode?.toLowerCase() !== 'mariage') return null
  const date = new Date(`${eventDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) return null
  const dateLabel = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(date)
  const coupleName = eventName.replace(/^\s*mariage\s+(?:de\s+|d['’]\s*)/i, '').trim()
  const article = /^[aeiouyàâäéèêëïîôöùûü]/i.test(coupleName) ? 'd’' : 'de '
  const q = new URLSearchParams({
    status: 'guest',
    occ: 'mariage',
    ev: eventName.slice(0, 80),
    nom: coupleName.slice(0, 60),
    message: `Je serai au mariage ${article}${coupleName}, ${dateLabel}`.slice(0, 220),
  })
  return { href: `/flyer?${q}`, label: 'Créer mon statut WhatsApp' }
}
