import { PartyPopper } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'

export default function WelcomeStep({ values, onCreateEvent }) {
  const recap = [
    { label: 'Type d’événement', value: values.category },
    { label: 'Objectif', value: values.objective },
    { label: 'Nom prévu', value: values.name || 'Non renseigné' },
  ]

  return (
    <div className="text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
        <PartyPopper className="h-7 w-7" />
      </span>
      <h2 className="mt-5 text-2xl font-bold text-ink">
        Bienvenue sur TBF Moment !
      </h2>
      <p className="mt-2 text-sm text-muted">
        Voici un récapitulatif de vos choix. Vous pouvez commencer à créer
        votre événement dès maintenant.
      </p>

      <dl className="mx-auto mt-6 max-w-sm space-y-2 text-left">
        {recap.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-lg border border-border-soft bg-surface px-4 py-3"
          >
            <dt className="text-xs text-faint">{item.label}</dt>
            <dd className="text-sm font-medium text-ink">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button variant="gradient" onClick={onCreateEvent} className="w-full sm:w-auto">
          Créer mon premier événement
        </Button>
        <Button as={Link} to="/dashboard" variant="outline" className="w-full sm:w-auto">
          Explorer le tableau de bord
        </Button>
      </div>
    </div>
  )
}
