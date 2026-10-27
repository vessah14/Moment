// Message prêt à envoyer sur WhatsApp pour un événement publié : titre, date, lieu, lien.
export function buildShareMessage({ title, date, time, location, url }) {
  const lines = [title?.trim() || 'Vous êtes invité']
  if (date) {
    const day = new Date(`${String(date).slice(0, 10)}T12:00:00`)
    if (!Number.isNaN(day.getTime())) {
      const label = day.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      const hour = time ? ` à ${String(time).slice(0, 5).replace(':', 'h')}` : ''
      lines.push(`📅 ${label.charAt(0).toUpperCase()}${label.slice(1)}${hour}`)
    }
  }
  if (location?.trim()) lines.push(`📍 ${location.trim()}`)
  lines.push('', `Toutes les infos et votre réponse ici : ${url}`)
  return lines.join('\n')
}

export function whatsappShareUrl(message) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
