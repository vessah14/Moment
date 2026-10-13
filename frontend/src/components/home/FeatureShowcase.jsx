import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import builderScreenshot from '../../assets/img002.jpg'
import guestsScreenshot from '../../assets/img003.jpg'
import analyticsScreenshot from '../../assets/img004.jpg'

const FEATURES = [
  {
    eyebrow: 'Éditeur visuel',
    title: 'Event Builder ultra intuitif',
    description:
      "Composez chaque section de votre mini-site événementiel : blocs d'images, compte à rebours, programme détaillé, RSVP, FAQ... le tout sans écrire une ligne de code.",
    linkTo: '/builder',
    caption: 'Aperçu page · Builder événement',
    image: builderScreenshot,
    imageSide: 'right',
  },
  {
    eyebrow: 'Invités & RSVP',
    title: 'Gestion complète des invités',
    description:
      'Importez vos listes de contacts, recueillez des réponses de RSVP personnalisées (allergies, préférences de session) et relancez automatiquement par SMS ou e-mail.',
    linkTo: '/tarifs',
    caption: 'Gestion des invités · Import CSV / listes filtrées',
    image: guestsScreenshot,
    imageSide: 'left',
  },
  {
    eyebrow: 'Pilotage en direct',
    title: "Dashboard d'analyses en direct",
    description:
      "Suivez vos performances financières et l'affluence de votre événement : visites, RSVP, billets vendus et scans de check-in, consultables à tout moment.",
    linkTo: '/tarifs',
    caption: 'Analytics · Rendus par heure et par jour',
    image: analyticsScreenshot,
    imageSide: 'right',
  },
]

function MockupPanel({ caption, image }) {
  if (image) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border shadow-xl shadow-black/30">
        <img src={image} alt={caption} className="w-full object-cover" />
      </div>
    )
  }

  return (
    <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-2xl border border-border bg-[linear-gradient(160deg,_var(--color-surface-2),_var(--color-panel))]">
      <div className="absolute inset-6 rounded-xl border border-dashed border-border-soft" />
      <span className="relative px-6 text-center text-xs tracking-wide text-faint uppercase">
        {caption}
      </span>
    </div>
  )
}

export default function FeatureShowcase() {
  return (
    <section className="relative overflow-hidden bg-panel/40">
      <div className="relative mx-auto max-w-7xl space-y-20 px-6 py-20">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="grid items-center gap-10 lg:grid-cols-2"
          >
            <div
              className={feature.imageSide === 'left' ? 'lg:order-2' : ''}
            >
              <span className="text-xs font-semibold tracking-widest text-brand-purple uppercase">
                {feature.eyebrow}
              </span>
              <h3 className="mt-3 text-2xl font-bold text-ink">
                {feature.title}
              </h3>
              <p className="mt-4 text-muted">{feature.description}</p>
              <Link
                to={feature.linkTo}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-purple hover:underline"
              >
                En savoir plus sur cette fonctionnalité
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className={feature.imageSide === 'left' ? 'lg:order-1' : ''}>
              <MockupPanel caption={feature.caption} image={feature.image} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
