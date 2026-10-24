import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function BackToTop() {
  const [visible, setVisible] = useState(() => window.scrollY > 400)

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', updateVisibility, { passive: true })
    return () => window.removeEventListener('scroll', updateVisibility)
  }, [])

  return (
    <button
      type="button"
      aria-label="Remonter en haut de la page"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed right-6 bottom-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-brand-purple text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-brand-indigo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none invisible translate-y-4 opacity-0'
      }`}
    >
      <ArrowUp aria-hidden="true" className="h-5 w-5" />
    </button>
  )
}
