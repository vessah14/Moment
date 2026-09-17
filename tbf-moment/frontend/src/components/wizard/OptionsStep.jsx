import { Check, Gift, Image, ListOrdered, QrCode, Ticket } from 'lucide-react'
import Toggle from '../builder/Toggle'

const OPTIONS = [
  {
    key: 'checkin',
    icon: QrCode,
    label: 'QR Code Check-in',
    description:
      "Générez un QR Code unique par invité, idéal pour valider les entrées de manière ultra-fluide à l'aide de l'application de contrôle d'accès.",
  },
  {
    key: 'program',
    icon: ListOrdered,
    label: 'Programme détaillé',
    description:
      "Présentez une chronologie précise du déroulement, des interventions, spectacles ou pauses afin que chacun suive le fil de la journée.",
  },
  {
    key: 'gallery',
    icon: Image,
    label: 'Galerie photos partagée',
    description:
      'Créez un espace de dépôt collaboratif où les convives partagent, téléchargent et visualisent les instantanés pris pendant le moment festif.',
  },
  {
    key: 'ticketing',
    icon: Ticket,
    label: 'Billetterie & Vente',
    description:
      'Configurez différents types de tarifs, vendez des places sécurisées en ligne, déterminez des quotas et percevez des versements automatiques.',
  },
  {
    key: 'guestbook',
    icon: Gift,
    label: "Livre d'or interactif",
    description:
      "Offrez à vos hôtes la liberté d'enregistrer des messages d'affection, mots doux ou remerciements personnalisés en ligne.",
  },
]

export default function OptionsStep({ event, onChange }) {
  const options = event.options ?? {}

  const setOption = (key, value) =>
    onChange({ ...event, options: { ...options, [key]: value } })

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink">
        Configurez les options de l'événement
      </h2>
      <p className="mt-2 text-sm text-muted">
        Activez ou désactivez les fonctionnalités clés de votre mini-site
        selon la nature de votre projet.
      </p>

      <div className="mt-8 space-y-3">
        {OPTIONS.map((opt) => (
          <div
            key={opt.key}
            className="flex items-start gap-4 rounded-xl border border-border-soft bg-surface p-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
              <opt.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{opt.label}</p>
              <p className="mt-1 text-xs text-faint">{opt.description}</p>
            </div>
            <div className="pt-1">
              <Toggle
                checked={Boolean(options[opt.key])}
                onChange={(value) => setOption(opt.key, value)}
                label=""
              />
            </div>
          </div>
        ))}

        <div className="flex items-start gap-4 rounded-xl border border-border-soft bg-surface-2/60 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/15 text-success">
            <Check className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">Gestion des RSVP</p>
            <p className="mt-1 text-xs text-faint">
              Permet à vos hôtes de confirmer leur présence directement depuis
              le site de l'événement et de répondre à des questions
              personnalisées (choix de repas, hébergement).
            </p>
          </div>
          <span className="shrink-0 pt-1 text-xs font-medium whitespace-nowrap text-success">
            Toujours activé
          </span>
        </div>
      </div>
    </div>
  )
}
