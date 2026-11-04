// « Essayez tout de suite avec vos prénoms » (accueil) : ouvre la démo d'un modèle avec les
// prénoms saisis, sans compte. Rien n'est enregistré ni envoyé : tout passe par l'adresse
// /modeles/:theme?essai=… (texte affiché par React, donc jamais interprété comme du HTML).
export const TRY_TYPES = [
  { id: 'mariage', label: 'Mariage', theme: 'bloom', example: 'Inès & Kevin' },
  { id: 'anniversaire', label: 'Anniversaire', theme: 'fiesta', example: 'Brenda' },
  { id: 'gala', label: "Soirée d'entreprise", theme: 'horizon', example: 'Sawa Énergie' },
]

const MAX = 40

export function normalizeNames(raw) {
  return String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+(et|and)\s+/i, ' & ')
    .replace(/\s*&\s*/, ' & ')
    .slice(0, MAX)
}

export function tryUrl(typeId, raw) {
  const type = TRY_TYPES.find((t) => t.id === typeId) ?? TRY_TYPES[0]
  const names = normalizeNames(raw) || type.example
  return `/modeles/${type.theme}?essai=${encodeURIComponent(names)}`
}

// Textes de la démo pour ce modèle, ou null si le modèle n'a pas de mode essai.
export function tryDemo(theme, raw) {
  const type = TRY_TYPES.find((t) => t.theme === theme)
  if (!type || raw == null) return null
  const n = normalizeNames(raw) || type.example
  if (type.id === 'anniversaire')
    return { title: `L'anniversaire de ${n}`, kicker: 'Vous êtes invité·e à fêter', description: `Une soirée pour célébrer ${n} avec ceux qui comptent.` }
  if (type.id === 'gala')
    return { title: n, kicker: 'Soirée de gala', description: `${n} a le plaisir de vous convier à sa soirée annuelle.` }
  return { title: n, kicker: 'Ont la joie de vous annoncer leur mariage', description: `${n.replace(' & ', ' et ')} vous invitent à célébrer leur union.` }
}
