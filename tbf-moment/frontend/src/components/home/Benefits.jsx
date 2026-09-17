import { BarChart3, Code2, Layers, QrCode, ShieldCheck, Users } from 'lucide-react'
import BrandBackdrop from '../ui/BrandBackdrop'

const BENEFITS = [
  {
    icon: Code2,
    title: 'Sans une ligne de code',
    description:
      'Choisissez un modèle, personnalisez vos textes et vos photos, publiez.',
  },
  {
    icon: QrCode,
    title: 'QR Code et check-in',
    description:
      'Invitations individuelles et validation des entrées en temps réel.',
  },
  {
    icon: Layers,
    title: 'Un compte, tous vos événements',
    description:
      'Du mariage au séminaire professionnel, la même plateforme les gère tous.',
  },
  {
    icon: BarChart3,
    title: 'Statistiques en temps réel',
    description:
      'Visites, RSVP, billets vendus et scans, consultables à tout moment.',
  },
  {
    icon: ShieldCheck,
    title: 'Données isolées et sécurisées',
    description:
      'Chaque événement est cloisonné : vos invités restent privés à votre organisation.',
  },
  {
    icon: Users,
    title: 'Pour tous les organisateurs',
    description:
      'Particuliers, entreprises, écoles et associations — un outil pour chacun.',
  },
]

export default function Benefits() {
  return (
    <section id="fonctionnalites" className="relative overflow-hidden">
      <BrandBackdrop side="right" />
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-ink">
            Une plateforme, tous vos événements
          </h2>
          <p className="mt-3 text-muted">
            TBF Moment réunit tout ce qu'il faut pour créer, promouvoir et
            gérer un événement numérique de bout en bout.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
