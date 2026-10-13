import { toCsv } from '../../utils/csv'
import { Check, FileDown, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { getCurrentUser } from '../../api/client'
import { deleteEvent, listEvents } from '../../api/events'
import { listGuests } from '../../api/guests'

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const EXPORTS = [
  { key: 'account', label: 'Exporter mes données de compte', format: 'JSON' },
  { key: 'events', label: 'Exporter tous mes événements', format: 'JSON' },
  { key: 'guests', label: 'Exporter la liste de tous mes invités', format: 'CSV' },
]

export default function DataExportTab() {
  const [status, setStatus] = useState({})
  const [confirmingWipe, setConfirmingWipe] = useState(false)
  const [wiping, setWiping] = useState(false)
  const [wiped, setWiped] = useState(false)
  const [error, setError] = useState('')

  const handleExport = async (key) => {
    setStatus((prev) => ({ ...prev, [key]: 'loading' }))
    setError('')
    try {
      if (key === 'account') {
        const user = getCurrentUser()
        downloadBlob(JSON.stringify(user, null, 2), 'compte.json', 'application/json')
      } else if (key === 'events') {
        const events = await listEvents()
        downloadBlob(JSON.stringify(events, null, 2), 'evenements.json', 'application/json')
      } else if (key === 'guests') {
        const events = await listEvents()
        const allGuests = (
          await Promise.all(events.map((ev) => listGuests(ev.id)))
        ).flat()
        downloadBlob(
          toCsv(['Nom', 'Email', 'Téléphone', 'Statut'], allGuests.map((g) => [g.fullName, g.email, g.phone, g.status])),
          'invites.csv',
          'text/csv;charset=utf-8;',
        )
      }
      setStatus((prev) => ({ ...prev, [key]: 'done' }))
    } catch (err) {
      setError(err.message || "L'export a échoué.")
      setStatus((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  const handleWipeData = async () => {
    setConfirmingWipe(false)
    setWiping(true)
    setError('')
    try {
      const events = await listEvents()
      await Promise.all(events.map((ev) => deleteEvent(ev.id)))
      setWiped(true)
    } catch (err) {
      setError(err.message || 'La suppression a échoué.')
    } finally {
      setWiping(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-soft bg-surface p-6">
        <h2 className="text-xl font-bold text-ink">Données et export</h2>
        <p className="mt-1 text-sm text-muted">
          Téléchargez une copie de vos données à tout moment.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

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
                  {state === 'loading' ? 'Préparation…' : state === 'done' ? 'Prêt' : item.format}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-danger/30 bg-surface p-6">
        <h3 className="font-semibold text-danger">Supprimer mes données</h3>
        <p className="mt-2 text-sm text-muted">
          Supprime définitivement tous vos événements (et tout ce qui leur est
          rattaché : invités, RSVP, etc.). Votre compte reste actif.
        </p>
        {wiped ? (
          <p className="mt-4 text-sm text-success">Vos événements ont été supprimés.</p>
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
              disabled={wiping}
              onClick={handleWipeData}
              className="rounded-full bg-danger px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {wiping ? 'Suppression…' : 'Confirmer la suppression'}
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
