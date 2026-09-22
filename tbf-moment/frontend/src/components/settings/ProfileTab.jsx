import { useState } from 'react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import StatusBadge from '../ui/StatusBadge'
import { getCurrentUser } from '../../api/client'
import { updateProfile } from '../../api/users'

export default function ProfileTab() {
  const user = getCurrentUser()
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setError('')
    try {
      await updateProfile(user.id, { fullName, phone: phone || null })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message || "L'enregistrement a échoué.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">Profil</h2>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-success">Enregistré</span>}
          <Button variant="solid" onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </div>
      <p className="mt-1 text-sm text-muted">
        Ces informations apparaissent sur vos invitations et pages publiques.
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center gap-4">
        <Avatar name={fullName || '—'} size="md" />
        <div>
          <p className="text-sm font-medium text-ink">Photo de profil</p>
          <p className="text-xs text-faint">Bientôt disponible</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <label className="block col-span-2">
          <span className="text-sm font-medium text-ink">Nom complet</span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">E-mail</span>
          <div className="relative mt-2">
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 pr-20 text-sm text-faint outline-none"
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2">
              <StatusBadge status="Validé" />
            </span>
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Téléphone</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple"
          />
        </label>
      </div>
    </div>
  )
}
