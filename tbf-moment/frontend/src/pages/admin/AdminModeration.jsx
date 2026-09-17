import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { MODERATION_QUEUE } from '../../data/adminData'

export default function AdminModeration() {
  const [queue, setQueue] = useState(MODERATION_QUEUE)

  const resolve = (id) => setQueue((prev) => prev.filter((item) => item.id !== id))

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-ink">Modération</h1>
        <p className="mt-1.5 text-sm text-muted">
          Contenus signalés sur l'ensemble de la plateforme.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {queue.length === 0 ? (
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
                    onClick={() => resolve(item.id)}
                    className="rounded-lg border border-success/40 px-4 py-2 text-xs font-semibold text-success transition hover:bg-success/10"
                  >
                    Conserver
                  </button>
                  <button
                    type="button"
                    onClick={() => resolve(item.id)}
                    className="rounded-lg bg-danger px-4 py-2 text-xs font-semibold text-white"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  )
}
