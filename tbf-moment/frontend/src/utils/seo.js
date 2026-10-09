import { useEffect } from 'react'

// SEO d'une application monopage : chaque page déclare ses balises avec useSeo(), qui
// met à jour <title>, la description, l'URL canonique, l'indexation, les balises de
// partage (Open Graph / Twitter) et les données structurées JSON-LD.
//
// VITE_SITE_URL : adresse publique du site (ex. https://tbfmoment.com). Sans elle, on
// retombe sur l'origine courante (pratique en local, mais à renseigner en production :
// les URL canoniques et les images de partage doivent être absolues et stables).

export const SITE_NAME = 'TBF Moment'
export const DEFAULT_TITLE = 'TBF Moment — Créez le site de votre événement'
export const DEFAULT_DESCRIPTION =
  "Créez en quelques minutes le site de votre événement (mariage, anniversaire, conférence, concert…) : invitations, confirmations de présence, programme, billetterie et livre d'or."
export const DEFAULT_IMAGE = '/og-image.png'

export function siteUrl() {
  const configured = import.meta.env?.VITE_SITE_URL
  const base = configured || (typeof window !== 'undefined' ? window.location.origin : '')
  return base.replace(/\/+$/, '')
}

export function absoluteUrl(pathOrUrl, base = siteUrl()) {
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
export function buildSeoTags(config = {}, base = siteUrl(), currentPath = '/') {
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

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function applySeo(config) {
  const tags = buildSeoTags(config, siteUrl(), window.location.pathname)
  document.title = tags.title
  for (const [attr, key, content] of tags.meta) upsertMeta(attr, key, content)

  let canonical = document.head.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', tags.canonical)

  let script = document.getElementById('seo-jsonld')
  if (tags.jsonLd) {
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = 'seo-jsonld'
      document.head.appendChild(script)
    }
    // "<" échappé : un texte saisi par un organisateur ne peut pas fermer la balise.
    script.textContent = JSON.stringify(tags.jsonLd).replace(/</g, '\\u003c')
  } else {
    script?.remove()
  }
}

// À appeler dans chaque page (ou layout). Les valeurs sont réappliquées dès qu'elles
// changent, par exemple quand les données de l'événement arrivent.
export function useSeo(config) {
  const key = JSON.stringify(config ?? {})
  useEffect(() => {
    applySeo(JSON.parse(key))
  }, [key])
}
