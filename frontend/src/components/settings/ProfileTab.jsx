import { Camera } from 'lucide-react'
import { useRef, useState } from 'react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import PhoneInput from '../ui/PhoneInput'
import StatusBadge from '../ui/StatusBadge'
import { getCurrentUser, mediaUrl } from '../../api/client'
import { resendVerificationEmail, updateProfile, uploadProfilePhoto } from '../../api/users'
import { useToast } from '../../utils/useToast'

export default function ProfileTab() {
  const user = getCurrentUser()
  const photoInput = useRef(null)
  const toast = useToast()
  const [resending, setResending] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl ?? null)
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !user) return

    if (file.size > 5 * 1024 * 1024) {
      setError('La photo ne peut pas dépasser 5 Mo.')
      return
    }

    setUploadingPhoto(true)
    setError('')
    try {
      const updatedUser = await uploadProfilePhoto(user.id, file)
      setPhotoUrl(updatedUser.photoUrl)
      toast('Photo de profil mise à jour.')
    } catch (err) {
      setError(err.message || "L’envoi de la photo a échoué.")
    } finally {
      setUploadingPhoto(false)
    }
  }

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

  const handleResend = async () => {
    setResending(true)
    setError('')
    try {
      await resendVerificationEmail()
      toast(`Lien de vérification envoyé à ${user.email}`)
    } catch (err) {
      setError(err.message || "L'envoi a échoué.")
    } finally {
      setResending(false)
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
        <Avatar name={fullName || '—'} size="md" src={mediaUrl(photoUrl)} />
        <div>
          <p className="text-sm font-medium text-ink">Photo de profil</p>
          <p className="mt-0.5 text-xs text-faint">JPG, PNG ou WebP · 5 Mo maximum</p>
          <button
            type="button"
            onClick={() => photoInput.current?.click()}
            disabled={uploadingPhoto}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-purple hover:underline disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
            {uploadingPhoto ? 'Envoi…' : photoUrl ? 'Changer ma photo' : 'Ajouter une photo'}
          </button>
          <input
            ref={photoInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="sr-only"
            aria-label="Choisir une photo de profil"
          />
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
              <StatusBadge status={user?.emailVerified ? 'Validé' : 'En attente'} />
            </span>
          </div>
          {user && !user.emailVerified && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="mt-1.5 text-xs font-medium text-brand-purple hover:underline disabled:opacity-50"
            >
              {resending ? 'Envoi…' : 'Renvoyer le lien de vérification'}
            </button>
          )}
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Téléphone</span>
          <div className="mt-2">
            <PhoneInput value={phone} onChange={setPhone} />
          </div>
        </label>
      </div>
    </div>
  )
}
