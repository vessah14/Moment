import { useState } from 'react'
import Toggle from '../builder/Toggle'

const INITIAL = [
  {
    key: 'newRsvp',
    label: 'Nouvelle réponse RSVP',
    hint: 'À chaque confirmation ou refus reçu.',
    value: true,
  },
  {
    key: 'guestbook',
    label: "Nouveau message dans le livre d'or",
    hint: 'Quand un message attend votre modération.',
    value: true,
  },
  {
    key: 'payments',
    label: 'Paiement reçu',
    hint: 'Vente de billet ou don confirmé.',
    value: true,
  },
  {
    key: 'reminders',
    label: 'Rappels automatiques',
    hint: 'Relances envoyées aux invités sans réponse.',
    value: false,
  },
  {
    key: 'weeklySummary',
    label: 'Résumé hebdomadaire',
    hint: 'Un e-mail récapitulatif chaque lundi.',
    value: true,
  },
]

export default function NotificationsTab() {
  const [prefs, setPrefs] = useState(INITIAL)

  const toggle = (key) =>
    setPrefs((prev) =>
      prev.map((p) => (p.key === key ? { ...p, value: !p.value } : p)),
    )

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <h2 className="text-xl font-bold text-ink">Notifications</h2>
      <p className="mt-1 text-sm text-muted">
        Choisissez les e-mails que TBF Moment vous envoie.
      </p>
      <p className="mt-1 text-xs text-brand-orange">
        Bientôt disponible — ces réglages ne sont pas encore sauvegardés.
      </p>

      <div className="mt-6 space-y-4">
        {prefs.map((pref) => (
          <div
            key={pref.key}
            className="flex items-center justify-between rounded-lg border border-border-soft px-4 py-3.5"
          >
            <div>
              <p className="text-sm font-medium text-ink">{pref.label}</p>
              <p className="text-xs text-faint">{pref.hint}</p>
            </div>
            <Toggle checked={pref.value} onChange={() => toggle(pref.key)} />
          </div>
        ))}
      </div>
    </div>
  )
}
