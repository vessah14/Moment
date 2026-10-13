// Calcul des balises SEO, sans navigateur ni React : utilisé par useSeo (dans le
// navigateur) et par le build (vite.config.js), qui écrit une page HTML par route publique
// avec les bonnes balises pour les robots qui n'exécutent pas le JavaScript.

export const SITE_NAME = 'TBF Moment'
export const DEFAULT_TITLE = 'TBF Moment — Créez le site de votre événement'
export const DEFAULT_DESCRIPTION =
  "Créez en quelques minutes le site de votre événement (mariage, anniversaire, conférence, concert…) : invitations, confirmations de présence, programme, billetterie et livre d'or."
export const DEFAULT_IMAGE = '/og-image.png'

export function absoluteUrl(pathOrUrl, base) {
  if (!pathOrUrl) return base
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${base}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

// Description lisible dans les résultats : texte brut, sur une ligne, ~160 caractères.
export function cleanDescription(text, max = 160) {
  const flat = (text ?? '').replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  const cut = flat.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`
}

/**
 * Calcule les balises d'une page, sans toucher au DOM (testable).
 * @param {object} config
 * @param {string} [config.title]        titre de la page (le nom du site est ajouté)
 * @param {string} [config.fullTitle]    titre complet, utilisé tel quel
 * @param {string} [config.description]
 * @param {string} [config.path]         chemin canonique (défaut : page courante)
 * @param {string} [config.image]        image de partage (chemin ou URL absolue)
 * @param {string} [config.type]         og:type (website, article…)
 * @param {boolean} [config.noindex]     exclure la page des moteurs de recherche
 * @param {object|object[]} [config.jsonLd] données structurées schema.org
 */
export function buildSeoTags(config = {}, base = '', currentPath = '/') {
  const title =
    config.fullTitle || (config.title ? `${config.title} · ${SITE_NAME}` : DEFAULT_TITLE)
  const description = cleanDescription(config.description || DEFAULT_DESCRIPTION)
  const url = absoluteUrl(config.path ?? currentPath, base)
  const image = absoluteUrl(config.image || DEFAULT_IMAGE, base)

  return {
    title,
    canonical: url,
    jsonLd: config.jsonLd ?? null,
    meta: [
      ['name', 'description', description],
      [
        'name',
        'robots',
        config.noindex
          ? 'noindex, nofollow'
          : 'index, follow, max-image-preview:large, max-snippet:-1',
      ],
      ['property', 'og:site_name', SITE_NAME],
      ['property', 'og:locale', 'fr_FR'],
      ['property', 'og:type', config.type || 'website'],
      ['property', 'og:title', title],
      ['property', 'og:description', description],
      ['property', 'og:url', url],
      ['property', 'og:image', image],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', description],
      ['name', 'twitter:image', image],
    ],
  }
}

// JSON-LD sûr dans une balise <script> : « < » échappé, un texte saisi ne peut pas la fermer.
export function serializeJsonLd(jsonLd) {
  return JSON.stringify(jsonLd).replace(/</g, '\\u003c')
}
