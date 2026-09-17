import { useState } from 'react'
import Toggle from '../../components/builder/Toggle'
import AdminLayout from '../../components/layout/AdminLayout'
import Button from '../../components/ui/Button'

const INITIAL_FLAGS = [
  { key: 'billetterie', label: 'Billetterie payante', enabled: true },
  { key: 'certificats', label: 'Certificats de participation', enabled: true },
  { key: 'multilingue', label: 'Interface multilingue (bêta)', enabled: false },
  { key: 'marketplace', label: 'Marketplace de modèles', enabled: false },
]

export default function AdminSettings() {
  const [flags, setFlags] = useState(INITIAL_FLAGS)
  const [maintenance, setMaintenance] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [published, setPublished] = useState(false)

  const toggleFlag = (key) =>
    setFlags((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f)),
    )

  const handlePublish = (e) => {
    e.preventDefault()
    setPublished(true)
    setTimeout(() => setPublished(false), 3000)
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-ink">Paramètres système</h1>
        <p className="mt-1.5 text-sm text-muted">
          Réglages globaux affectant l'ensemble de la plateforme.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-soft bg-surface p-5">
          <h2 className="font-semibold text-ink">Fonctionnalités</h2>
          <div className="mt-4 space-y-3">
            {flags.map((flag) => (
              <div
                key={flag.key}
                className="flex items-center justify-between rounded-lg border border-border-soft px-4 py-3"
              >
                <span className="text-sm text-ink">{flag.label}</span>
                <Toggle checked={flag.enabled} onChange={() => toggleFlag(flag.key)} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-danger/30 bg-surface p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-ink">Mode maintenance</h2>
                <p className="mt-1 text-xs text-faint">
                  Rend la plateforme inaccessible aux organisateurs, sauf vous.
                </p>
              </div>
              <Toggle checked={maintenance} onChange={setMaintenance} />
            </div>
            {maintenance && (
              <p className="mt-3 text-xs text-danger">
                Mode maintenance activé — la plateforme est actuellement fermée.
              </p>
            )}
          </div>

          <form
            onSubmit={handlePublish}
            className="rounded-2xl border border-border-soft bg-surface p-5"
          >
            <h2 className="font-semibold text-ink">Annonce globale</h2>
            <p className="mt-1 text-xs text-faint">
              Affichée en bandeau à tous les organisateurs connectés.
            </p>
            <textarea
              rows={3}
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Maintenance prévue le 20 mars de 2h à 4h..."
              className="mt-3 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
            />
            <Button type="submit" variant="gradient" className="mt-3">
              Publier l'annonce
            </Button>
            {published && (
              <p className="mt-2 text-xs text-success">Annonce publiée.</p>
            )}
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
