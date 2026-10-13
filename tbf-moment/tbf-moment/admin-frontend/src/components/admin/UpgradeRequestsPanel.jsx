import { Check, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { approveUpgradeRequest, listUpgradeRequests, rejectUpgradeRequest } from '../../api/platform'
import { formatFcfa } from '../../utils/formatCurrency'
import StatusBadge from '../ui/StatusBadge'

// Demandes de passage à une offre payante. Pas de paiement en ligne : on appelle le client
// au numéro indiqué, il paie par Mobile Money, puis on active l'offre ici (un mois).
const STATUS_LABELS = { EnAttente: 'En attente', Approuvee: 'Validé', Refusee: 'Refusé', Annulee: 'Archivé' }

export default function UpgradeRequestsPanel({ onApproved }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [notes, setNotes] = useState({})

  useEffect(() => {
    listUpgradeRequests()
      .then((data) => setRequests(data ?? []))
      .catch((err) => setError(err.message || 'Impossible de charger les demandes.'))
      .finally(() => setLoading(false))
  }, [])

  const handle = async (request, approve) => {
    setBusyId(request.id)
    setError('')
    try {
      const note = notes[request.id]?.trim() || null
      const updated = approve ? await approveUpgradeRequest(request.id, note) : await rejectUpgradeRequest(request.id, note)
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      if (approve) onApproved?.()
    } catch (err) {
      setError(err.message || "L'action a échoué.")
    } finally {
      setBusyId('')
    }
  }

  const pending = requests.filter((r) => r.status === 'EnAttente')
  const handled = requests.filter((r) => r.status !== 'EnAttente').slice(0, 10)

  return (
    <section className="mt-8 rounded-2xl border border-border-soft bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-ink">Demandes d’offre</h2>
        <span className="text-xs text-faint">{pending.length} en attente</span>
      </div>
      <p className="mt-1 text-xs text-faint">
        Appelez le client au numéro indiqué pour le paiement Mobile Money, puis activez l’offre (valable un mois). Le client est
        prévenu par e-mail.
      </p>
      {error && <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {loading ? (
        <p className="mt-4 text-sm text-faint">Chargement…</p>
      ) : pending.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border-soft py-6 text-center text-sm text-faint">Aucune demande en attente.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {pending.map((r) => (
            <div key={r.id} className="rounded-xl border border-brand-orange/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink">
                    {r.organizerName} → <b>{r.planLabel}</b> · {formatFcfa(Math.round(r.priceCents / 100))}/mois
                  </p>
                  <p className="mt-0.5 text-xs text-faint">
                    {r.organizerEmail} · demandé le {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  {r.phone && (
                    <a href={`tel:${r.phone.replace(/[^0-9+]/g, '')}`} className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand-purple">
                      <Phone className="h-3.5 w-3.5" />
                      {r.phone}
                    </a>
                  )}
                  {r.message && <p className="mt-1 text-sm whitespace-pre-line text-muted">« {r.message} »</p>}
                </div>
                <StatusBadge status={STATUS_LABELS[r.status]} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  maxLength={500}
                  placeholder="Note (facultatif, envoyée au client en cas de refus)"
                  value={notes[r.id] ?? ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  className="min-w-56 flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
                />
                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => handle(r, true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-success px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  Paiement reçu, activer
                </button>
                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => handle(r, false)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-danger/40 px-4 py-2 text-xs font-semibold text-danger transition hover:bg-danger/10 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {handled.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-muted">Demandes traitées récemment</summary>
          <ul className="mt-2 divide-y divide-border-soft text-sm">
            {handled.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="text-ink">
                  {r.organizerName} → {r.planLabel}
                  {r.adminNote && <span className="text-faint"> · {r.adminNote}</span>}
                </span>
                <StatusBadge status={STATUS_LABELS[r.status]} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
