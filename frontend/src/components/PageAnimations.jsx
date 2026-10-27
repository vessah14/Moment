import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Animations des pages publiques du site (accueil, tarifs, modèles, pages d'information) :
//  - fondu léger à l'arrivée sur une page ;
//  - apparition au défilement des titres de section, des cartes de grille et des questions,
//    avec un petit décalage entre cartes voisines.
// Rien n'est masqué tant que ce composant n'a pas marqué l'élément (data-reveal) : sans
// JavaScript ou avec « réduire les animations », tout s'affiche normalement.
// Les sites d'événements (/e/…, démos /modeles/:theme) ont leurs propres animations ; le
// tableau de bord et l'éditeur restent sans effet.
const EXCLUDED = [/^\/dashboard/, /^\/builder/, /^\/e\//, /^\/invitation\//, /^\/cadeaux\//, /^\/modeles\/[^/]+/, /^\/loading/, /^\/chargement/]
const REVEAL = 'main section h2, main section .grid > *, main section details'

export default function PageAnimations() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (EXCLUDED.some((re) => re.test(pathname))) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    if (!('IntersectionObserver' in window)) return undefined

    const main = document.querySelector('main')
    main?.animate?.(
      [
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 180, easing: 'cubic-bezier(.2,.7,.2,1)' },
    )

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-revealed')
          io.unobserve(entry.target)
        }),
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
    )

    const tag = () => {
      document.querySelectorAll(REVEAL).forEach((el) => {
        if (el.hasAttribute('data-reveal') || el.closest('[data-no-reveal]')) return
        const index = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0
        el.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 70}ms`)
        el.setAttribute('data-reveal', '')
        io.observe(el)
      })
    }

    tag()
    // Contenu chargé plus tard (page paresseuse, avis, modèles filtrés).
    const mo = new MutationObserver(tag)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
      // Sur la page suivante, tout repart d'un état visible.
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        el.removeAttribute('data-reveal')
        el.classList.remove('is-revealed')
      })
    }
  }, [pathname])

  return null
}
