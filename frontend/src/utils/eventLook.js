// Apparence d'un événement pour son écran de chargement : titre, couleur et logo. Rien de
// tout cela n'est connu avant la réponse de l'API, alors l'écran part de l'adresse
// (/e/conference-sur-le-recyclage → « Conference sur le recyclage ») et l'apparence
// complète est mémorisée sur l'appareil pour les visites suivantes.
const KEY = (slug) => `tbf_event_look_${slug}`

export function titleFromSlug(slug) {
  const words = String(slug ?? '')
    .split('-')
    .filter(Boolean)
  if (!words.length) return ''
  const text = words.join(' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function readEventLook(slug) {
  if (!slug) return null
  try {
    const look = JSON.parse(localStorage.getItem(KEY(slug)) || 'null')
    return look && typeof look === 'object' ? look : null
  } catch {
    return null
  }
}

export function saveEventLook(slug, { title, accent, logo, monogram }) {
  if (!slug) return
  try {
    localStorage.setItem(KEY(slug), JSON.stringify({ title, accent, logo, monogram }))
  } catch {
    // Stockage indisponible (navigation privée) : l'écran gardera le titre de l'adresse.
  }
}

// Slug de l'événement d'après l'adresse de la page (/e/:slug et ses sous-pages).
export function eventSlugFromPath(pathname) {
  const match = /^\/e\/([a-z0-9-]+)/.exec(pathname ?? '')
  return match ? match[1] : ''
}

// Pages des invités (site, invitation, cadeaux) : pas de marque TBF Moment ni de traduction.
export function isGuestPath(pathname) {
  return /^\/(e|invitation|cadeaux)\//.test(pathname ?? '')
}
