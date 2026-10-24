// Logo de l'organisateur choisi dans l'assistant : vérifié puis converti en PNG (512 px au
// plus) dans le navigateur, comme dans le prototype. Le serveur ne reçoit qu'un PNG : un SVG
// n'est jamais envoyé tel quel (il pourrait contenir du code).

export const LOGO_MAX_BYTES = 2 * 1024 * 1024
export const LOGO_TYPES = 'image/png,image/jpeg,image/webp,image/svg+xml'
const MAX_SIDE = 512

const readAs = (file, method) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Image illisible, essayez un autre fichier.'))
    reader[method](file)
  })

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image illisible, essayez un autre fichier.'))
    img.src = src
  })

// Conseils sur un logo déjà lu : taille et fond (les coins opaques et colorés trahissent un fond).
export function logoTips({ width, height, corners }) {
  const tips = []
  if (Math.max(width, height) < 160) tips.push("Logo petit : il risque d'être flou. Utilisez une version d'au moins 300 px.")
  const opaque = corners.every((p) => p[3] > 250)
  const white = corners.every((p) => p[0] > 235 && p[1] > 235 && p[2] > 235)
  if (opaque && !white) tips.push('Votre logo a un fond coloré. Une version à fond transparent (PNG) s’intègre mieux aux modèles.')
  return tips
}

// Renvoie { file (PNG), dataUrl, label, tips } ou lève une erreur au message lisible.
export async function prepareLogo(file) {
  if (!file) throw new Error('Aucun fichier choisi.')
  if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type))
    throw new Error('Format non pris en charge : utilisez un PNG, JPG, WebP ou SVG.')
  if (file.size > LOGO_MAX_BYTES) throw new Error('Fichier trop lourd (2 Mo maximum). Exportez votre logo en plus petit.')

  const isSvg = file.type === 'image/svg+xml'
  if (isSvg && /<script|\son[a-z]+\s*=|javascript:/i.test(await readAs(file, 'readAsText')))
    throw new Error('Ce SVG contient du code. Exportez-le sans script, ou envoyez un PNG.')

  const img = await loadImage(await readAs(file, 'readAsDataURL'))
  const width = img.naturalWidth || (isSvg ? MAX_SIDE : 0)
  const height = img.naturalHeight || (isSvg ? MAX_SIDE : 0)
  if (!width || !height) throw new Error('Image illisible, essayez un autre fichier.')
  // Un SVG est vectoriel : on le dessine directement à la taille maximale.
  const scale = isSvg ? MAX_SIDE / Math.max(width, height) : Math.min(1, MAX_SIDE / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const { width: w, height: h } = canvas
  const corners = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ].map(([x, y]) => ctx.getImageData(x, y, 1, 1).data)

  const dataUrl = canvas.toDataURL('image/png')
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('Image illisible, essayez un autre fichier.')
  const base = file.name.replace(/\.\w+$/, '') || 'logo'
  return {
    file: new File([blob], `${base}.png`, { type: 'image/png' }),
    dataUrl,
    label: `${base}.png · ${w} × ${h} px`,
    tips: isSvg ? [] : logoTips({ width, height, corners }),
  }
}
