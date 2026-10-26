import { useState } from 'react'
import { GUEST_STATUS_LABELS } from '../../utils/guestStatus'
import Dialog from '../ui/Dialog'

// Modification d'un invité : coordonnées, groupe et réponse. Si l'adresse e-mail change,
// l'invitation est renvoyée automatiquement à la nouvelle adresse (côté serveur).
const fieldClass =
  'mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-purple'

export default function GuestEditDialog({ guest, groups, onClose, onSave }) {
  const [fullName, setFullName] = useState(guest.fullName)
  const [phone, setPhone] = useState(guest.phone ?? '')
  const [email, setEmail] = useState(guest.email ?? '')
  const [groupId, setGroupId] = useState(guest.groupId ?? '')
  const [status, setStatus] = useState(guest.status)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const emailChanged = email.trim().toLowerCase() !== (guest.email ?? '').trim().toLowerCase()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSave({ fullName: fullName.trim(), phone: phone.trim(), email: email.trim(), groupId: groupId || null, status })
      onClose()
    } catch (err) {
      setError(err.message || "L'invité n'a pas pu être modifié.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open title="Modifier l’invité" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-ink">Nom complet</span>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={255} className={fieldClass} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-ink">Téléphone (facultatif)</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className={fieldClass} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">E-mail (facultatif)</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
          </label>
        </div>
        {emailChanged && guest.invitationSentAt && (
          <p className="text-xs text-brand-orange">L’invitation sera renvoyée automatiquement à la nouvelle adresse.</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-ink">Groupe</span>
            <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className={fieldClass}>
              <option value="">Sans groupe</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Réponse</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={fieldClass}>
              {Object.entries(GUEST_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted hover:text-ink">
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[linear-gradient(100deg,#FF7A3D_0%,#E2337E_50%,#6C4BF4_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
