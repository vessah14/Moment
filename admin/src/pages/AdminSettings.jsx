import { ShieldAlert, ShieldCheck, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getCurrentAdmin } from '../api/client'
import { listAdminAccounts, resetAdminMfa } from '../api/adminAccounts'
import Toggle from '../components/builder/Toggle'
import AdminLayout from '../components/layout/AdminLayout'
import Button from '../components/ui/Button'

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
  const [adminAccounts, setAdminAccounts] = useState([])
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [accountsError, setAccountsError] = useState('')
  const [accountsNotice, setAccountsNotice] = useState('')
  const [resettingId, setResettingId] = useState(null)
  const currentAdmin = getCurrentAdmin()
  const isSuperadmin = currentAdmin?.role === 'Superadmin'

  useEffect(() => {
    if (!isSuperadmin) return undefined

    let cancelled = false
    listAdminAccounts()
      .then((accounts) => {
        if (!cancelled) setAdminAccounts(accounts ?? [])
      })
      .catch((error) => {
        if (!cancelled)
          setAccountsError(error.message || 'Impossible de charger les comptes admin.')
      })
      .finally(() => {
        if (!cancelled) setAccountsLoading(false)
      })

    return () => { cancelled = true }
  }, [isSuperadmin])

  const handleMfaReset = async (account) => {
    if (!window.confirm(`Réinitialiser la double authentification de ${account.fullName} (${account.email}) ?`))
      return

    setResettingId(account.id)
    setAccountsError('')
    setAccountsNotice('')
    try {
      await resetAdminMfa(account.id)
      setAccountsNotice(`Le MFA de ${account.fullName} a été réinitialisé. Il devra le configurer à sa prochaine connexion.`)
    } catch (error) {
      setAccountsError(error.message || 'La réinitialisation du MFA a échoué.')
    } finally {
      setResettingId(null)
    }
  }

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

      {isSuperadmin && (
        <section className="mt-6 rounded-2xl border border-border-soft bg-surface p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-purple" />
            <div>
              <h2 className="font-semibold text-ink">Récupération MFA des administrateurs</h2>
              <p className="mt-1 text-sm text-muted">
                Réinitialisez le MFA d’un autre administrateur qui a perdu l’accès à son application. Il devra scanner un nouveau QR code à sa prochaine connexion.
              </p>
            </div>
          </div>

          {accountsError && (
            <p role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
              {accountsError}
            </p>
          )}
          {accountsNotice && (
            <p role="status" className="mt-4 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-success">
              {accountsNotice}
            </p>
          )}

          {accountsLoading ? (
            <p className="mt-4 text-sm text-faint">Chargement des comptes…</p>
          ) : (
            <ul className="mt-4 divide-y divide-border-soft">
              {adminAccounts.filter((account) => account.id !== currentAdmin?.id).map((account) => (
                <li key={account.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{account.fullName}</p>
                    <p className="truncate text-xs text-muted">{account.email} · {account.role}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={Boolean(resettingId) || !account.isActive}
                    onClick={() => handleMfaReset(account)}
                    className="px-4 py-2 text-xs"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {resettingId === account.id ? 'Réinitialisation…' : 'Réinitialiser son MFA'}
                  </Button>
                </li>
              ))}
              {adminAccounts.filter((account) => account.id !== currentAdmin?.id).length === 0 && (
                <li className="flex items-center gap-2 py-4 text-sm text-muted">
                  <ShieldAlert className="h-4 w-4" />
                  Aucun autre compte administrateur à afficher.
                </li>
              )}
            </ul>
          )}
        </section>
      )}
    </AdminLayout>
  )
}
