import { useEffect, useState } from 'react'
import Toggle from '../builder/Toggle'
import { getNotificationSettings, updateNotificationSettings } from '../../api/users'
import { useToast } from '../../utils/useToast'

const PREFS = [
  {
    key: 'newRsvp',
    label: 'Nouvelle réponse RSVP',
    hint: 'À chaque confirmation ou refus reçu.',
  },
  {
    key: 'guestbook',
    label: "Nouveau message dans le livre d'or",
    hint: 'Quand un message attend votre modération.',
  },
  {
    key: 'payments',
    label: 'Paiement reçu',
    hint: 'Vente de billet ou don confirmé.',
  },
  {
    key: 'reminders',
    label: 'Rappels automatiques',
    hint: 'Relances envoyées aux invités sans réponse.',
  },
  {
    key: 'weeklySummary',
    label: 'Résumé hebdomadaire',
    hint: 'Un e-mail récapitulatif chaque lundi.',
  },
]

export default function NotificationsTab() {
  const toast = useToast()
  const [prefs, setPrefs] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getNotificationSettings()
      .then(setPrefs)
      .catch((err) => setError(err.message || 'Impossible de charger vos préférences.'))
  }, [])

  const toggle = async (key) => {
    const previous = prefs
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    setError('')
    try {
      setPrefs(await updateNotificationSettings(next))
      toast('Préférences enregistrées')
    } catch (err) {
      setPrefs(previous)
      setError(err.message || "L'enregistrement a échoué.")
    }
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <h2 className="text-xl font-bold text-ink">Notifications</h2>
      <p className="mt-1 text-sm text-muted">
        Choisissez les e-mails que TBF Moment vous envoie.
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-4">
        {!prefs && !error && <p className="text-sm text-faint">Chargement…</p>}
        {prefs &&
          PREFS.map((pref) => (
            <div
              key={pref.key}
              className="flex items-center justify-between rounded-lg border border-border-soft px-4 py-3.5"
            >
              <div>
                <p className="text-sm font-medium text-ink">{pref.label}</p>
                <p className="text-xs text-faint">{pref.hint}</p>
              </div>
              <Toggle checked={Boolean(prefs[pref.key])} onChange={() => toggle(pref.key)} />
            </div>
          ))}
      </div>
    </div>
  )
}
