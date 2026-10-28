import { isR2MediaUrl } from './r2Media'

// Ces chemins finissent dans un src / le CSS de la page : on n'accepte que ceux
// produits par nos propres routes d'envoi (couverture, photo de bloc).
const COVER_PATH =
  /^\/uploads\/covers\/[0-9a-fA-F-]{36}\/[0-9a-fA-F-]{36}\.(jpg|jpeg|png|webp)$/
const BLOCK_IMAGE_PATH =
  /^\/uploads\/blocks\/[0-9a-fA-F-]{36}\/[0-9a-fA-F-]{36}\.(jpg|jpeg|png|webp)$/
// Images Cloudinary : URL https du CDN. Avec VITE_CLOUDINARY_CLOUD_NAME, seules celles de
// notre propre compte passent (une image hébergée ailleurs pourrait servir au pistage).
const CLOUD_NAME = /^[A-Za-z0-9_-]+$/.test(import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME ?? '')
  ? import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  : '[A-Za-z0-9_-]+'
const cloudinaryUrl = (kind) =>
  new RegExp(
    `^https://res\\.cloudinary\\.com/${CLOUD_NAME}/image/upload/v\\d+/(?:[A-Za-z0-9_-]+/)+${kind}/[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}\\.(jpg|jpeg|png|webp)$`,
  )
const CLOUDINARY_COVER_URL = cloudinaryUrl('covers')
const CLOUDINARY_BLOCK_IMAGE_URL = cloudinaryUrl('blocks')

export const safeCoverPath = (value) => {
  if (typeof value !== 'string') return null
  if (COVER_PATH.test(value) || CLOUDINARY_COVER_URL.test(value)) return value
  return isR2MediaUrl(value) && /\/covers\//.test(new URL(value).pathname) ? value : null
}

export const safeBlockImagePath = (value) => {
  if (typeof value !== 'string') return null
  if (BLOCK_IMAGE_PATH.test(value) || CLOUDINARY_BLOCK_IMAGE_URL.test(value)) return value
  return isR2MediaUrl(value) && /\/blocks\//.test(new URL(value).pathname) ? value : null
}

// Identifiant DOM d'un bloc du site (le Builder fait défiler jusqu'au bloc choisi).
export function siteBlockDomId(block) {
  return `site-block-${block.replace(/\s+/g, '-')}`
}
