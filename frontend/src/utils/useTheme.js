import { useEffect } from 'react'
import { useLocalStorageState } from './useLocalStorageState'

function resolveTheme(mode) {
  if (mode === 'light' || mode === 'dark') return mode
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

// Pilote le thème clair / sombre / auto de toute l'app via l'attribut
// data-theme sur <html> (voir les variables --color-* dans index.css). Un
// petit script bloquant dans index.html applique déjà la bonne valeur avant
// le premier rendu pour éviter un flash du mauvais thème.
export function useTheme() {
  const [mode, setMode] = useLocalStorageState('tbf_theme', 'dark')

  useEffect(() => {
    const apply = () => {
      document.documentElement.setAttribute('data-theme', resolveTheme(mode))
    }
    apply()

    if (mode !== 'auto') return undefined
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [mode])

  return [mode, setMode]
}
