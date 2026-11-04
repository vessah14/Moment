import { Link } from 'react-router-dom'
import SectionHeader from './SectionHeader'
import anniversaire from '../../assets/home/flyer-anniversaire.webp'
import examen from '../../assets/home/flyer-examen.webp'
import mariage from '../../assets/home/flyer-mariage.webp'
import promotion from '../../assets/home/flyer-promotion.webp'

// « Mise à l'honneur » : vitrine du studio /flyer (exemples dessinés par le studio lui-même).
const EXAMPLES = [
  [anniversaire, "Exemple : flyer d'anniversaire pour les 25 ans de Kevin"],
  [examen, 'Exemple : flyer de félicitations pour Brenda, admise au BAC'],
  [mariage, 'Exemple : flyer de félicitations aux mariés Grâce et Junior'],
  [promotion, 'Exemple : flyer pour la nomination de Sandrine Etoundi'],
]

export default function FlyerTeaser() {
  return (
    <section id="flyer" aria-labelledby="flyer-heading" className="relative">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader id="flyer-heading" eyebrow="Nouveau · Mise à l'honneur" title="Un flyer pour honorer un proche, prêt en une minute">
          Anniversaire, diplôme, promotion, mariage ou hommage : ajoutez sa photo, choisissez le ton, on écrit le vœu avec vous. Au format statut
          WhatsApp, gratuit.
        </SectionHeader>
        <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {EXAMPLES.map(([src, alt], i) => (
            <li key={src} className={i % 2 ? 'md:mt-8' : ''}>
              <img src={src} alt={alt} width={480} height={853} loading="lazy" className="w-full rounded-2xl shadow-lg ring-1 ring-border-soft" />
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center">
          <Link to="/flyer" className="inline-flex rounded-lg bg-brand-purple px-5 py-3 text-sm font-semibold text-white hover:bg-brand-indigo">
            Créer un flyer
          </Link>
        </p>
      </div>
    </section>
  )
}
