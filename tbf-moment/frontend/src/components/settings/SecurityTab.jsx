import { useState } from 'react'
import { getCurrentUser } from '../../api/client'
import { changePassword } from '../../api/users'
import Button from '../ui/Button'

export default function SecurityTab() {
  const user = getCurrentUser()
  const [passwordFormOpen, setPasswordFormOpen] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    const form = new FormData(e.target)
    const currentPassword = form.get('currentPassword')?.toString()
    const newPassword = form.get('newPassword')?.toString()
    const confirmPassword = form.get('confirmPassword')?.toString()
    if (!currentPassword || !newPassword) return

    setSubmitting(true)
    setError('')
    try {
      await changePassword(user.id, { currentPassword, newPassword, confirmPassword })
      setPasswordFormOpen(false)
      setPasswordSaved(true)
      e.target.reset()
      setTimeout(() => setPasswordSaved(false), 3000)
    } catch (err) {
      setError(err.message || 'Le changement de mot de passe a échoué.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <h2 className="text-xl font-bold text-ink">Sécurité</h2>
      <p className="mt-1 text-sm text-muted">
        Protégez l'accès à votre compte et à vos événements.
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border border-border-soft px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-ink">Mot de passe</p>
            <p className="text-xs text-faint">{passwordSaved ? 'Mis à jour' : '••••••••'}</p>
          </div>
          <Button variant="outline" onClick={() => setPasswordFormOpen((v) => !v)}>
            Modifier
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border-soft px-4 py-3.5 opacity-60">
          <div>
            <p className="text-sm font-medium text-ink">Double authentification</p>
            <p className="text-xs text-faint">Bientôt disponible</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border-soft px-4 py-3.5 opacity-60 sm:col-span-2">
          <div>
            <p className="text-sm font-medium text-ink">Sessions actives</p>
            <p className="text-xs text-faint">Bientôt disponible</p>
          </div>
        </div>
      </div>

      {passwordFormOpen && (
        <form
          onSubmit={handlePasswordSubmit}
          className="mt-4 space-y-3 rounded-lg border border-brand-purple/40 p-4"
        >
          <label className="block">
            <span className="text-xs font-medium text-ink">Mot de passe actuel</span>
            <input
              name="currentPassword"
              type="password"
              required
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Nouveau mot de passe</span>
            <input
              name="newPassword"
              type="password"
              required
              minLength={8}
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Confirmer le nouveau mot de passe</span>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <Button type="submit" variant="solid" disabled={submitting}>
            {submitting ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
          </Button>
        </form>
      )}
    </div>
  )
}
