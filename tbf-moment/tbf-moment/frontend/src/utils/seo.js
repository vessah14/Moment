import { useEffect } from 'react'

// SEO d'une application monopage : chaque page déclare ses balises avec useSeo(), qui
// met à jour <title>, la description, l'URL canonique, l'indexation, les balises de
// partage (Open Graph / Twitter) et les données structurées JSON-LD.
//
// VITE_SITE_URL : adresse publique du site (ex. https://tbfmoment.com). Sans elle, on
// retombe sur l'origine courante (pratique en local, mais à renseigner en production :
// les URL canoniques et les images de partage doivent être absolues et stables).

import {
  absoluteUrl as absoluteUrlFrom,
  buildSeoTags as buildSeoTagsFrom,
  serializeJsonLd,
} from './seoTags'

export { cleanDescription, DEFAULT_DESCRIPTION, DEFAULT_IMAGE, DEFAULT_TITLE, SITE_NAME } from './seoTags'

export function siteUrl() {
  const configured = import.meta.env?.VITE_SITE_URL
  const base = configured || (typeof window !== 'undefined' ? window.location.origin : '')
  return base.replace(/\/+$/, '')
}

export function absoluteUrl(pathOrUrl, base = siteUrl()) {
  return absoluteUrlFrom(pathOrUrl, base)
}

export function buildSeoTags(config = {}, base = siteUrl(), currentPath = '/') {
  return buildSeoTagsFrom(config, base, currentPath)
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
    script.textContent = serializeJsonLd(tags.jsonLd)
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
