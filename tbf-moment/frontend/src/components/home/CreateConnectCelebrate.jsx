import BrandBackdrop from '../ui/BrandBackdrop'

const STEPS = [
  {
    title: 'Créer',
    description:
      'Un modèle, vos textes, vos photos. Le site est en ligne en quelques minutes.',
  },
  {
    title: 'Connecter',
    description:
      'Invitations nominatives, QR individuels, partage WhatsApp, e-mail et SMS.',
  },
  {
    title: 'Célébrer',
    description:
      'Check-in au QR, galerie collaborative, livre d’or, statistiques en direct.',
  },
]

export default function CreateConnectCelebrate() {
  return (
    <section className="relative overflow-hidden">
      <BrandBackdrop side="right" />
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-bold text-ink">
              Créer, connecter, célébrer
            </h2>
            <p className="mt-4 max-w-xs text-muted">
              Trois gestes, une seule plateforme. Le même compte porte tous
              vos événements, du mariage au séminaire.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-border-soft bg-surface p-6"
              >
                <div className="h-10 w-10 rounded-xl bg-surface-2" />
                <h3 className="mt-5 font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
