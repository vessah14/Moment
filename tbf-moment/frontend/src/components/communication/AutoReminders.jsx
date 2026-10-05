import { useEffect, useState } from 'react'
import Toggle from '../builder/Toggle'
import { listEventReminders, setEventReminder } from '../../api/events'
import { useToast } from '../../utils/useToast'

const REMINDER_INFO = {
  non_respondents: {
    label: 'Relancer les non-répondants',
    hint: "À partir de 7 jours avant l'événement, par e-mail",
  },
  day_before: {
    label: 'Rappel la veille',
    hint: 'Aux invités confirmés, par e-mail',
  },
  thank_you: {
    label: 'Message de remerciement',
    hint: "Le lendemain de l'événement, par e-mail",
  },
}

export default function AutoReminders({ eventId }) {
  const toast = useToast()
  const [reminders, setReminders] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!eventId) return
    let cancelled = false
    listEventReminders(eventId)
      .then((data) => {
        if (!cancelled) setReminders(data ?? [])
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Impossible de charger les rappels.')
      })
    return () => {
      cancelled = true
    }
  }, [eventId])

  const toggle = async (reminder) => {
    setError('')
    try {
      const updated = await setEventReminder(eventId, reminder.kind, !reminder.enabled)
      setReminders((prev) => prev.map((r) => (r.kind === updated.kind ? updated : r)))
      toast(updated.enabled ? 'Rappel activé' : 'Rappel désactivé')
    } catch (err) {
      setError(err.message || 'La mise à jour a échoué.')
    }
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-5">
      <h2 className="font-semibold text-ink">Rappels automatiques</h2>
      <p className="mt-1 text-sm text-muted">
        Des e-mails envoyés automatiquement à vos invités, une seule fois, au bon moment.
        L'événement doit être publié et avoir une date.
      </p>
      {error && (
        <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="mt-4 space-y-3">
        {reminders.map((reminder) => {
          const info = REMINDER_INFO[reminder.kind]
          if (!info) return null
          return (
            <div
              key={reminder.kind}
              className="flex items-center justify-between rounded-lg border border-border-soft px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-ink">{info.label}</p>
                <p className="mt-0.5 text-xs text-faint">
                  {info.hint}
                  {reminder.lastSentAt &&
                    ` · envoyé le ${new Date(reminder.lastSentAt).toLocaleDateString('fr-FR')}`}
                </p>
              </div>
              <Toggle checked={reminder.enabled} onChange={() => toggle(reminder)} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
