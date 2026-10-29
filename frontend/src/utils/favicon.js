import { useEffect } from 'react'

// Icône d'onglet générée à partir d'un monogramme : pastille ronde à la couleur de
// l'événement, lettres blanches. Pas de requête réseau (SVG en data URI).
export function monogramFavicon(monogram, color = '#e040a0') {
  const text = (monogram ?? '').slice(0, 3)
  if (!text) return ''
  const size = text.length > 2 ? 26 : text.length === 2 ? 32 : 40
  const escape = (value) =>
    value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<circle cx="32" cy="32" r="32" fill="${escape(color)}"/>` +
    `<text x="32" y="33" text-anchor="middle" dominant-baseline="central" ` +
    `font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${size}" fill="#fff">` +
    `${escape(text)}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// Remplace l'icône de l'onglet tant que la page est affichée, puis remet celle de TBF.
export function useFavicon(href) {
  useEffect(() => {
    if (!href) return
    const links = [...document.head.querySelectorAll('link[rel="icon"]')]
    const previous = links.map((link) => [link, link.getAttribute('href'), link.getAttribute('type')])
    for (const link of links) {
      link.setAttribute('href', href)
      link.removeAttribute('type')
    }
    return () => {
      for (const [link, oldHref, oldType] of previous) {
        link.setAttribute('href', oldHref)
        if (oldType) link.setAttribute('type', oldType)
      }
    }
  }, [href])
}
