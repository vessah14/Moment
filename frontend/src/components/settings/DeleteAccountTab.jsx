import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../../api/client'
import { logout } from '../../api/auth'
import { deactivateAccount } from '../../api/users'

export default function DeleteAccountTab() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [confirmText, setConfirmText] = useState('')
  const [deactivating, setDeactivating] = useState(false)
  const [error, setError] = useState('')

  const canDelete = confirmText.trim().toUpperCase() === 'SUPPRIMER'

  const handleDeactivate = async () => {
    if (!user) return
    setDeactivating(true)
    setError('')
    try {
      await deactivateAccount(user.id)
      logout()
      navigate('/connexion')
    } catch (err) {
      setError(err.message || 'La désactivation a échoué.')
      setDeactivating(false)
    }
  }

  return (
    <div className="rounded-2xl border border-danger/30 bg-surface p-6">
      <h2 className="text-xl font-bold text-danger">Désactiver le compte</h2>
      <p className="mt-1 text-sm text-muted">
        Votre compte sera désactivé et vous serez déconnecté(e). Vos événements et
        invités restent en base — contactez le support pour une suppression complète.
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <label className="mt-6 block">
        <span className="text-sm font-medium text-ink">
          Tapez <span className="font-mono font-semibold">SUPPRIMER</span> pour confirmer
        </span>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="mt-2 w-full max-w-xs rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-danger"
        />
      </label>

      <button
        type="button"
        disabled={!canDelete || deactivating}
        onClick={handleDeactivate}
        className="mt-5 rounded-full bg-danger px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
      >
        {deactivating ? 'Désactivation…' : 'Désactiver mon compte'}
      </button>
    </div>
  )
}
