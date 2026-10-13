import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { listReviews, updateReviewStatus } from '../../api/platform'
import StatusBadge from '../ui/StatusBadge'

// Avis des clients sur TBF Moment : publiés sur la page d'accueil seulement une fois
// validés ici. Un avis modifié par son auteur revient en attente.
const STATUS_LABELS = { EnAttente: 'En attente', Publie: 'Publié', Refuse: 'Refusé' }

export default function ReviewsPanel() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  useEffect(() => {
    listReviews()
      .then((data) => setReviews(data ?? []))
      .catch((err) => setError(err.message || 'Impossible de charger les avis.'))
      .finally(() => setLoading(false))
  }, [])

  const setStatus = async (review, status) => {
    setBusyId(review.id)
    setError('')
    try {
      const updated = await updateReviewStatus(review.id, status)
      setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    } catch (err) {
      setError(err.message || "L'action a échoué.")
    } finally {
      setBusyId('')
    }
  }

  const pendingCount = reviews.filter((r) => r.status === 'EnAttente').length

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-ink">Avis clients</h2>
        <span className="text-xs text-faint">{pendingCount} en attente · les avis publiés apparaissent sur l’accueil</span>
      </div>
      {error && <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="rounded-2xl border border-dashed border-border-soft py-8 text-center text-sm text-faint">Chargement…</p>
        ) : reviews.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-soft py-8 text-center text-sm text-faint">Aucun avis pour le moment.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className={`rounded-2xl border bg-surface p-5 ${r.status === 'EnAttente' ? 'border-brand-orange/40' : 'border-border-soft'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex gap-0.5 text-brand-orange" aria-label={`${r.rating} étoiles sur 5`}>
                      {Array.from({ length: 5 }).map((_, k) => (
                        <Star key={k} className={`h-3.5 w-3.5 ${k < r.rating ? 'fill-current' : 'text-border'}`} />
                      ))}
                    </span>
                    <StatusBadge status={STATUS_LABELS[r.status]} />
                  </div>
                  <p className="mt-2 text-sm whitespace-pre-line text-ink">« {r.comment} »</p>
                  <p className="mt-1 text-xs text-faint">
                    {r.displayName}
                    {r.context && ` · ${r.context}`} · {r.organizerEmail} · {new Date(r.updatedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {r.status !== 'Publie' && (
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => setStatus(r, 'Publie')}
                      className="rounded-lg border border-success/40 px-4 py-2 text-xs font-semibold text-success transition hover:bg-success/10 disabled:opacity-50"
                    >
                      Publier
                    </button>
                  )}
                  {r.status !== 'Refuse' && (
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => setStatus(r, 'Refuse')}
                      className="rounded-lg bg-danger px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {r.status === 'Publie' ? 'Retirer' : 'Refuser'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
