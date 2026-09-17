import { useState } from 'react'
import Toggle from '../builder/Toggle'

const INITIAL_REMINDERS = [
  {
    key: 'nonRespondents',
    label: 'Relancer les non-répondants',
    hint: '7 jours avant l’événement, par e-mail',
    enabled: true,
  },
  {
    key: 'dayBefore',
    label: 'Rappel la veille',
    hint: 'Aux invités confirmés, par SMS',
    enabled: true,
  },
  {
    key: 'thankYou',
    label: 'Message de remerciement',
    hint: "Le lendemain de l'événement, par e-mail",
    enabled: false,
  },
]

export default function AutoReminders() {
  const [reminders, setReminders] = useState(INITIAL_REMINDERS)

  const toggle = (key) =>
    setReminders((prev) =>
      prev.map((r) => (r.key === key ? { ...r, enabled: !r.enabled } : r)),
    )

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-5">
      <h2 className="font-semibold text-ink">Rappels automatiques</h2>
      <p className="mt-1 text-sm text-muted">
        Des campagnes déclenchées automatiquement, sans action de votre part.
      </p>
      <div className="mt-4 space-y-3">
        {reminders.map((reminder) => (
          <div
            key={reminder.key}
            className="flex items-center justify-between rounded-lg border border-border-soft px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-ink">{reminder.label}</p>
              <p className="mt-0.5 text-xs text-faint">{reminder.hint}</p>
            </div>
            <Toggle checked={reminder.enabled} onChange={() => toggle(reminder.key)} />
          </div>
        ))}
      </div>
    </div>
  )
}
