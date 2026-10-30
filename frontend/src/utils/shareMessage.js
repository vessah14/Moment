import { deadlineLabel } from './rsvpRules'

// Message prêt à envoyer sur WhatsApp pour un événement publié : invitation, date, lieu,
// date limite de réponse, lien. Le lien est envoyé seul avec le texte : WhatsApp en tire
// une carte d'aperçu avec l'affiche de l'événement (balises og:image de la page).
// intro : début de phrase propre au type d'événement (« Vous êtes invité·e à la cérémonie… de »).
export function buildShareMessage({ title, date, time, location, url, intro, deadline }) {
  const name = title?.trim()
  const lines = [
    intro && name
      ? `${intro} ${name}.`
      : name
        ? `Vous êtes invité·e à « ${name} ».`
        : 'Vous êtes invité·e !',
  ]
  if (date) {
    const day = new Date(`${String(date).slice(0, 10)}T12:00:00`)
    if (!Number.isNaN(day.getTime())) {
      const label = day.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      const hour = time ? ` à ${String(time).slice(0, 5).replace(':', 'h')}` : ''
      lines.push(`📅 ${label.charAt(0).toUpperCase()}${label.slice(1)}${hour}`)
    }
  }
  if (location?.trim()) lines.push(`📍 ${location.trim()}`)
  const answerBy = deadlineLabel(deadline)
  if (answerBy) lines.push(`✅ Merci de répondre avant le ${answerBy}`)
  lines.push('', `Toutes les infos et votre réponse ici : ${url}`)
  return lines.join('\n')
}

export function whatsappShareUrl(message) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
