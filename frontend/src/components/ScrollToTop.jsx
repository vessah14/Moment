import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Le navigateur ne doit pas remettre lui-même l'ancienne position après « Précédent » :
// c'est ce composant qui décide.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

// Chaque page s'ouvre en haut, y compris après « Précédent ». Seule exception : un lien
// vers une ancre (#faq), géré par la page elle-même.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
