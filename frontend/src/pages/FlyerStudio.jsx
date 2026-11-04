import { useEffect, useRef } from 'react'
import Footer from '../components/layout/Footer'
import Header from '../components/layout/Header'
import { routeSeo } from '../data/seoRoutes'
import { initFlyerStudio } from '../features/flyer/flyerEngine'
import { FLYER_MARKUP } from '../features/flyer/flyerMarkup'
import { siteUrl, useSeo } from '../utils/seo'
import '../features/flyer/flyerStudio.css'

// Studio « Flyer d'honneur » (repris de flyer.html du prototype) : flyer de vœux ou
// d'annonce au format statut WhatsApp ou carré, dessiné dans le navigateur. Aucune photo
// n'est envoyée au serveur. Le détourage automatique ne s'active que si les modèles sont
// servis dans /vendor (voir features/flyer/README.md).
const FONTS =
  'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Bebas+Neue&family=Lilita+One&family=Cinzel:wght@400;700&family=Outfit:wght@400;500;600;800&family=Caveat:wght@600&display=swap'

export default function FlyerStudio() {
  useSeo(routeSeo('/flyer', siteUrl()))
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const fonts = document.createElement('link')
    fonts.rel = 'stylesheet'
    fonts.href = FONTS
    document.head.appendChild(fonts)
    root.innerHTML = FLYER_MARKUP
    const dispose = initFlyerStudio(root)
    return () => {
      dispose()
      fonts.remove()
      root.innerHTML = ''
    }
  }, [])

  return (
    <>
      <Header />
      <div ref={rootRef} className="tbfly" />
      <Footer />
    </>
  )
}
