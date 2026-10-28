const R2_PUBLIC_BASE_URL = (() => {
  const configured = import.meta.env?.VITE_R2_PUBLIC_BASE_URL ?? ''
  try {
    const url = new URL(configured)
    if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password)
      return null
    return url.origin
  } catch {
    return null
  }
})()

const R2_IMAGE_PATH =
  /^\/(?:[A-Za-z0-9_-]+\/)+(?:covers|blocks|gallery)\/[0-9a-fA-F-]{36}\/[0-9a-fA-F-]{36}\.(?:jpg|jpeg|png|webp|gif)$/

export function isR2MediaUrl(value) {
  if (!R2_PUBLIC_BASE_URL || typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.origin === R2_PUBLIC_BASE_URL
      && url.protocol === 'https:'
      && !url.username
      && !url.password
      && !url.search
      && !url.hash
      && R2_IMAGE_PATH.test(url.pathname)
  } catch {
    return false
  }
}
