// Listes saisies dans l'onglet Contenu du Builder : on ne garde que les entrées
// remplies, et seulement des chaînes (le contenu JSON d'un bloc peut être ancien
// ou incomplet).

const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

// Intervenants, artistes, jury… : { name, role, topic }.
export function usablePeople(list) {
  if (!Array.isArray(list)) return []
  return list
    .map((p) => ({ name: text(p?.name, 80), role: text(p?.role, 80), topic: text(p?.topic, 160) }))
    .filter((p) => p.name)
}

// Partenaires et sponsors : simples noms.
export function usablePartners(list) {
  if (!Array.isArray(list)) return []
  return list.map((p) => text(typeof p === 'string' ? p : p?.name, 60)).filter(Boolean)
}

// Initiales d'un intervenant pour son avatar : « Dr. Aline Mbappé » -> « AM ».
export function initialsOf(name) {
  const words = name.split(/\s+/).filter((w) => w && !/\.$/.test(w))
  return (words.length ? words : name.split(/\s+/))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}
