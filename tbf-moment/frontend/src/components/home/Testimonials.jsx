import { Star } from 'lucide-react'
import Avatar from '../ui/Avatar'
import BrandBackdrop from '../ui/BrandBackdrop'

const TESTIMONIALS = [
  {
    name: 'Awa Diop',
    role: 'Mariage · Dakar',
    quote:
      "En une soirée on avait un site, les invitations envoyées et les premières confirmations. Le jour J, le check-in au QR a évité toute la queue à l'entrée.",
  },
  {
    name: 'Cheikh Ndiaye',
    role: 'TBF Summit · Conférence',
    quote:
      "La billetterie et les statistiques en temps réel nous ont fait gagner un temps fou pour piloter l'affluence pendant l'événement.",
  },
  {
    name: 'Fatou Sarr',
    role: 'Anniversaire · Thiès',
    quote:
      "Le livre d'or et la galerie collaborative ont permis à toute la famille de partager des souvenirs, même ceux qui n'ont pas pu venir.",
  },
]

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden">
      <BrandBackdrop side="left" />
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <span className="text-xs font-semibold tracking-widest text-brand-purple uppercase">
          Témoignages
        </span>
        <h2 className="mt-3 text-3xl font-bold text-ink">
          Ils ont créé leur moment
        </h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl border border-border-soft bg-surface p-6"
            >
              <div className="flex gap-0.5 text-brand-orange">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="mt-3 text-sm text-muted">"{t.quote}"</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <Avatar name={t.name} />
                <div>
                  <p className="text-sm font-medium text-ink">{t.name}</p>
                  <p className="text-xs text-faint">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
