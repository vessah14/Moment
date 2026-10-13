// Découpe le titre d'un événement pour l'en-tête des modèles premium :
// « Grâce & Junior » -> deux prénoms ; « Les 30 ans de Manuella » -> 30 / Manuella
// (uniquement pour les en-têtes « big », Fiesta et Prestige) ; « Wouri FC vs Kotto
// United » -> deux équipes quand le modèle utilise le séparateur « vs » (Arena).
export function parseTitle(title, heroVariant, joiner = '&') {
  const clean = (title ?? '').trim()
  if (heroVariant === 'big') {
    const m = clean.match(/^(.*?\b(\d{1,3})\s*ans\b(?:\s+d[eu'])?)\s*(.*)$/i)
    if (m) return { big: m[2], pre: m[1].trim(), names: [m[3].trim() || clean], joiner: '&' }
  }
  const separator = joiner === 'vs' ? /\s+(&|vs\.?)\s+/i : /\s+(&)\s+/
  const parts = clean.split(separator)
  return parts.length === 3
    ? { big: null, pre: null, names: [parts[0], parts[2]], joiner: parts[1].replace('.', '').toLowerCase() === 'vs' ? 'vs' : '&' }
    : { big: null, pre: null, names: [clean], joiner: '&' }
}

// Monogramme (sceau de l'ouverture, pastille de la barre) : « G&J », « 30 », « JC ».
export function monogramOf({ big, names }) {
  if (names.length === 2) return `${names[0][0] ?? ''}&${names[1][0] ?? ''}`.toUpperCase()
  if (big) return big
  const letters = names[0]
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => w[0])
    .join('')
  return (letters || names[0][0] || '•').slice(0, 2).toUpperCase()
}
