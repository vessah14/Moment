import { deadlineLabel } from './rsvpRules'

// Message prêt à envoyer sur WhatsApp pour un événement publié, mis en forme comme une
// annonce : accroche en gras, titre, date, lieu, date limite de réponse, puis le lien seul
// sur sa ligne. Envoyé sans image, il s'affiche sous une carte d'aperçu (affiche de
// l'événement, titre, description) tirée des balises og:image de la page.
// intro : début de phrase propre au type d'événement (« Vous êtes invité·e à la cérémonie… de »).
export function buildShareMessage({ title, date, time, location, url, intro, deadline }) {
  // Un astérisque dans le titre casserait le gras WhatsApp (*…*).
  const name = title?.replace(/\*/g, '').trim()
  const lines = intro && name
    ? [`✨ *${intro} ${name}.*`]
    : ['✨ *Vous êtes invité·e !*', ...(name ? ['', `🎉 *${name}*`] : [])]

  const details = []
  if (date) {
    const day = new Date(`${String(date).slice(0, 10)}T12:00:00`)
    if (!Number.isNaN(day.getTime())) {
      const label = day.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      const hour = time ? ` à ${String(time).slice(0, 5).replace(':', 'h')}` : ''
      details.push(`📅 ${label.charAt(0).toUpperCase()}${label.slice(1)}${hour}`)
    }
  }
  if (location?.trim()) details.push(`📍 ${location.trim()}`)
  const answerBy = deadlineLabel(deadline)
  if (answerBy) details.push(`⏳ Merci de répondre avant le ${answerBy}`)
  if (details.length) lines.push('', ...details)

  lines.push('', '👉 Toutes les infos et votre réponse :', url)
  return lines.join('\n')
}

export function whatsappShareUrl(message) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
