import { CalendarCheck, PartyPopper, Send, Wand2 } from 'lucide-react'
import BrandBackdrop from '../ui/BrandBackdrop'

const STEPS = [
  {
    icon: CalendarCheck,
    title: 'Choisissez',
    description:
      "Sélectionnez la catégorie et le modèle adaptés à votre projet pour charger les configurations recommandées.",
  },
  {
    icon: Wand2,
    title: 'Personnalisez',
    description:
      'Modifiez les visuels, les textes, les horaires et les fonctionnalités de votre mini-site en quelques clics.',
  },
  {
    icon: Send,
    title: 'Invitez',
    description:
      'Diffusez vos invitations nominatives par SMS, e-mail ou lien de partage direct.',
  },
  {
    icon: PartyPopper,
    title: 'Célébrez',
    description:
      'Accueillez vos invités avec le check-in QR et suivez tout en direct depuis votre dashboard.',
  },
]

export default function CreateConnectCelebrate() {
  return (
    <section className="relative overflow-hidden">
      <BrandBackdrop side="left" />
      <div className="relative mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <span className="text-xs font-semibold tracking-widest text-brand-purple uppercase">
            Simple et rapide
          </span>
          <h2 className="mt-3 text-3xl font-bold text-ink">
            Comment fonctionne TBF Moment ?
          </h2>
          <p className="mt-3 text-muted">
            Suivez ces quatre étapes simples pour organiser votre prochain
            événement, de l'idée à la réalité.
          </p>
        </div>

        <div className="mt-10 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border-soft bg-surface p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple/15 text-brand-purple">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-faint">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-5 font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
