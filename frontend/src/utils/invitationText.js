// Texte de la section « Invitation » : paragraphes séparés par une ligne vide, et
// salutation au prénom de l'invité quand la page est ouverte depuis son lien personnel.

export const invitationParagraphs = (body) =>
  String(body ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

export function invitationGreeting(content, guestFirstName) {
  const first = String(guestFirstName ?? '').trim()
  if (first) return `${String(content?.prefix ?? '').trim() || 'Cher·e'} ${first},`
  return String(content?.greeting ?? '').trim()
}

// Mots numérotés pour l'apparition mot à mot (--w), en continu d'un paragraphe à l'autre.
export function invitationWords(paragraphs) {
  let index = 0
  return paragraphs.map((p) => p.split(/\s+/).filter(Boolean).map((word) => ({ word, index: index++ })))
}
