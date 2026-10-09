// Charge (une seule fois) les polices Google d'un modèle premium.
export function loadThemeFonts(theme) {
  if (!theme?.fonts || typeof document === 'undefined') return
  const id = `tbft-font-${theme.id}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = theme.fonts
  document.head.appendChild(link)
}
