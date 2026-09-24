import { Check, FileDown, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { INITIAL_GUESTS } from '../../data/guests'
import { INITIAL_EVENTS } from '../../data/myEvents'
import { useLocalStorageState } from '../../utils/useLocalStorageState'

const EXPORTS = [
  { key: 'account', label: 'Exporter mes données de compte', format: 'JSON' },
  { key: 'events', label: 'Exporter tous mes événements', format: 'JSON' },
  { key: 'guests', label: 'Exporter la liste de tous mes invités', format: 'CSV' },
]

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function DataExportTab() {
  const [guests] = useLocalStorageState('tbf_guests_v2', INITIAL_GUESTS)
  const [events] = useLocalStorageState('tbf_myevents', INITIAL_EVENTS)
  const [status, setStatus] = useState({})
  const [confirmingWipe, setConfirmingWipe] = useState(false)
  const [wiped, setWiped] = useState(false)

  const handleExport = (key) => {
    setStatus((prev) => ({ ...prev, [key]: 'loading' }))
    setTimeout(() => {
      if (key === 'account') {
        downloadFile(
          'compte-tbf-moment.json',
          JSON.stringify({ name: 'Awa Diop', email: 'awa.diop@mail.com', accountType: 'Particulier' }, null, 2),
          'application/json',
        )
      } else if (key === 'events') {
        downloadFile('mes-evenements.json', JSON.stringify(events, null, 2), 'application/json')
      } else if (key === 'guests') {
        const header = 'Nom,Contact,Groupe,Statut,Accompagnants,Invitation'
        const rows = guests.map((g) =>
          [g.name, g.contact, g.group, g.status, g.accomp, g.invitation].join(','),
        )
        downloadFile('tous-mes-invites.csv', [header, ...rows].join('\n'), 'text/csv;charset=utf-8;')
      }
      setStatus((prev) => ({ ...prev, [key]: 'done' }))
    }, 1200)
  }

  const handleWipeData = () => {
    setConfirmingWipe(false)
    setWiped(true)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-soft bg-surface p-6">
        <h2 className="text-xl font-bold text-ink">Données et export</h2>
        <p className="mt-1 text-sm text-muted">
          Téléchargez une copie de vos données à tout moment.
        </p>

        <div className="mt-6 space-y-2">
          {EXPORTS.map((item) => {
            const state = status[item.key]
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleExport(item.key)}
                disabled={state === 'loading'}
                className="flex w-full items-center gap-3 rounded-lg border border-border-soft px-4 py-3.5 text-left text-sm text-ink transition hover:border-faint disabled:opacity-70"
              >
                {state === 'loading' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted" />
                ) : state === 'done' ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <FileDown className="h-4 w-4 text-muted" />
                )}
                <span className="flex-1">{item.label}</span>
                <span className="font-mono text-xs text-faint">
                  {state === 'loading'
                    ? 'Préparation…'
                    : state === 'done'
                      ? 'Prêt'
                      : item.format}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-danger/30 bg-surface p-6">
        <h3 className="font-semibold text-danger">Supprimer mes données</h3>
        <p className="mt-2 text-sm text-muted">
          Supprime définitivement vos événements, invités et messages. Votre
          compte reste actif.
        </p>
        {wiped ? (
          <p className="mt-4 text-sm text-success">
            Vos données ont été supprimées.
          </p>
        ) : confirmingWipe ? (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmingWipe(false)}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted hover:border-faint"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleWipeData}
              className="rounded-full bg-danger px-4 py-2 text-xs font-semibold text-white"
            >
              Confirmer la suppression
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingWipe(true)}
            className="mt-4 rounded-full border border-danger/40 px-6 py-3 text-sm font-semibold text-danger transition hover:bg-danger/10"
          >
            Supprimer mes données
          </button>
        )}
      </div>
    </div>
  )
}
