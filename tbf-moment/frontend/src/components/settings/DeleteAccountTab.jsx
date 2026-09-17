import { useState } from 'react'

export default function DeleteAccountTab() {
  const [confirmText, setConfirmText] = useState('')
  const [deleted, setDeleted] = useState(false)

  const canDelete = confirmText.trim().toUpperCase() === 'SUPPRIMER'

  if (deleted) {
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger/10 p-6 text-center">
        <p className="font-semibold text-danger">Compte supprimé (démo)</p>
        <p className="mt-1 text-sm text-muted">
          Dans une vraie session, vous seriez déconnecté(e) et vos données
          effacées. Rien n'a réellement été supprimé dans ce prototype.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-danger/30 bg-surface p-6">
      <h2 className="text-xl font-bold text-danger">Supprimer le compte</h2>
      <p className="mt-1 text-sm text-muted">
        Cette action est définitive : vos événements, invités et données
        seront supprimés. Cette action ne peut pas être annulée.
      </p>

      <label className="mt-6 block">
        <span className="text-sm font-medium text-ink">
          Tapez <span className="font-mono font-semibold">SUPPRIMER</span> pour
          confirmer
        </span>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="mt-2 w-full max-w-xs rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-danger"
        />
      </label>

      <button
        type="button"
        disabled={!canDelete}
        onClick={() => setDeleted(true)}
        className="mt-5 rounded-full bg-danger px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
      >
        Supprimer définitivement mon compte
      </button>
    </div>
  )
}
