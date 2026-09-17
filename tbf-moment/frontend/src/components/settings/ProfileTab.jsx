import { useRef, useState } from 'react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import StatusBadge from '../ui/StatusBadge'

export default function ProfileTab() {
  const [saved, setSaved] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const fileInputRef = useRef(null)
  const [profile, setProfile] = useState({
    firstName: 'Awa',
    lastName: 'Diop',
    email: 'awa.diop@mail.com',
    phone: '+221 77 000 00 00',
    accountType: 'Particulier',
    timezone: 'GMT · Dakar',
  })

  const updateProfile = (patch) => setProfile((prev) => ({ ...prev, ...patch }))

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (avatarUrl) URL.revokeObjectURL(avatarUrl)
    setAvatarUrl(URL.createObjectURL(file))
  }

  const handleRemovePhoto = () => {
    if (avatarUrl) URL.revokeObjectURL(avatarUrl)
    setAvatarUrl(null)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">Profil</h2>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-success">Enregistré</span>}
          <Button variant="solid" onClick={handleSave}>
            Enregistrer
          </Button>
        </div>
      </div>
      <p className="mt-1 text-sm text-muted">
        Ces informations apparaissent sur vos invitations et pages publiques.
      </p>

      <div className="mt-6 flex items-center gap-4">
        <Avatar
          name={`${profile.firstName} ${profile.lastName}`.trim() || '—'}
          size="md"
          src={avatarUrl}
        />
        <div>
          <p className="text-sm font-medium text-ink">Photo de profil</p>
          <p className="text-xs text-faint">PNG ou JPG, 400×400 minimum</p>
        </div>
        <div className="ml-auto flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            Téléverser
          </Button>
          <button
            type="button"
            onClick={handleRemovePhoto}
            disabled={!avatarUrl}
            className="rounded-full border border-danger/40 px-6 py-3 text-sm font-semibold text-danger transition hover:bg-danger/10 disabled:opacity-40"
          >
            Retirer
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-ink">Prénom</span>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => updateProfile({ firstName: e.target.value })}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Nom</span>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => updateProfile({ lastName: e.target.value })}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">E-mail</span>
          <div className="relative mt-2">
            <input
              type="email"
              value={profile.email}
              onChange={(e) => updateProfile({ email: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 pr-20 text-sm text-ink outline-none focus:border-brand-purple"
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
            value={profile.phone}
            onChange={(e) => updateProfile({ phone: e.target.value })}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Type de compte</span>
          <input
            type="text"
            value={profile.accountType}
            onChange={(e) => updateProfile({ accountType: e.target.value })}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Fuseau horaire</span>
          <input
            type="text"
            value={profile.timezone}
            onChange={(e) => updateProfile({ timezone: e.target.value })}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple"
          />
        </label>
      </div>
    </div>
  )
}
