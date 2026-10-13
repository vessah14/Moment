import { LayoutTemplate, Palette, Settings2 } from 'lucide-react'
import BrandBackdrop from '../ui/BrandBackdrop'

const BENEFITS = [
  {
    icon: LayoutTemplate,
    title: 'Création intuitive',
    description:
      'Glissez-déposez vos éléments pour composer votre page d’événement sans compétence technique.',
  },
  {
    icon: Palette,
    title: 'Personnalisation totale',
    description:
      'Adaptez vos modèles avec vos couleurs, vos photos et le contenu de votre événement.',
  },
  {
    icon: Settings2,
    title: 'Gestion complète',
    description:
      'Pilotez vos invités, automatisez les RSVP et configurez la billetterie associée, au même endroit.',
  },
]

export default function Benefits() {
  return (
    <section id="fonctionnalites" className="relative overflow-hidden">
      <BrandBackdrop side="right" />
      <div className="relative mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <span className="text-xs font-semibold tracking-widest text-brand-purple uppercase">
            Simplicité
          </span>
          <h2 className="mt-3 text-3xl font-bold text-ink">
            Une gestion d'événement simplifiée et moderne
          </h2>
          <p className="mt-3 text-muted">
            Découvrez les fonctionnalités pensées pour vous faire gagner du
            temps et élever l'expérience de vos invités.
          </p>
        </div>

        <div className="mt-10 grid gap-6 text-left sm:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl border border-border-soft bg-surface p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple/15 text-brand-purple">
                <benefit.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-semibold text-ink">{benefit.title}</h3>
              <p className="mt-2 text-sm text-muted">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
