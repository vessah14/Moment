import { useEffect, useState } from 'react'
import ReviewsPanel from '../components/admin/ReviewsPanel'
import AdminLayout from '../components/layout/AdminLayout'
import {
  listModerationQueue,
  resolveGalleryModeration,
  resolveGuestBookModeration,
} from '../api/platform'

export default function AdminModeration() {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resolvingId, setResolvingId] = useState('')

  useEffect(() => {
    listModerationQueue()
      .then((data) => {
        setQueue(data ?? [])
        setError('')
      })
      .catch((err) => setError(err.message || 'Impossible de charger la file de modération.'))
      .finally(() => setLoading(false))
  }, [])

  const resolve = async (item, keep) => {
    setResolvingId(item.id)
    setError('')
    try {
      if (item.type === "Livre d'or") {
        await resolveGuestBookModeration(item.id, keep)
      } else {
        await resolveGalleryModeration(item.id, keep)
      }
      setQueue((prev) => prev.filter((q) => q.id !== item.id))
    } catch (err) {
      setError(err.message || "L'action a échoué.")
    } finally {
      setResolvingId('')
    }
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-ink">Modération</h1>
        <p className="mt-1.5 text-sm text-muted">
          Contenus signalés sur l'ensemble de la plateforme.
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-8 space-y-4">
        {loading && (
          <p className="rounded-2xl border border-dashed border-border-soft py-12 text-center text-sm text-faint">
            Chargement…
          </p>
        )}
        {!loading && queue.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-soft py-12 text-center text-sm text-faint">
            Aucun contenu en attente de modération.
          </p>
        ) : (
          queue.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-danger/30 bg-surface p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-danger uppercase">
                    {item.type} · {item.organization}
                  </p>
                  <p className="mt-1 text-sm text-ink">{item.content}</p>
                  <p className="mt-1 text-xs text-faint">Signalé par {item.author}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={resolvingId === item.id}
                    onClick={() => resolve(item, true)}
                    className="rounded-lg border border-success/40 px-4 py-2 text-xs font-semibold text-success transition hover:bg-success/10 disabled:opacity-50"
                  >
                    Conserver
                  </button>
                  <button
                    type="button"
                    disabled={resolvingId === item.id}
                    onClick={() => resolve(item, false)}
                    className="rounded-lg bg-danger px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ReviewsPanel />
    </AdminLayout>
  )
}
