import { Camera } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, register } from '../../api/auth'
import logoMark from '../../assets/logo-mark.png'
import Button from '../ui/Button'
import PasswordStrengthBar from './PasswordStrengthBar'

const ACCOUNT_TYPES = ['Particulier', 'Entreprise', 'École', 'Association']

export default function SignupForm() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountType, setAccountType] = useState('Particulier')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const avatarInputRef = useRef(null)

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (avatarUrl) URL.revokeObjectURL(avatarUrl)
    setAvatarUrl(URL.createObjectURL(file))
  }

  const emailIncomplete = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (emailIncomplete) return
    setError('')
    setSubmitting(true)
    try {
      await register({
        fullName: `${firstName} ${lastName}`.trim(),
        email,
        password,
        confirmPassword,
      })
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Inscription impossible.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <span className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-xs font-semibold tracking-widest text-brand-purple uppercase">
        Inscription
      </span>
      <img src={logoMark} alt="" className="mt-6 h-10 w-10" />
      <h1 className="mt-6 text-3xl font-bold text-ink">Créer un compte</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-border bg-surface-2 text-faint transition hover:border-brand-purple"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100">
              <Camera className="h-4 w-4" />
            </span>
          </button>
          <div>
            <p className="text-sm font-medium text-ink">Photo de profil</p>
            <p className="text-xs text-faint">Optionnel · PNG ou JPG</p>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-ink">Prénom</span>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Nom</span>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-ink">
            Adresse e-mail
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-2 w-full rounded-lg border bg-surface px-4 py-3 text-sm text-ink outline-none focus:ring-3 ${
              emailIncomplete
                ? 'border-danger focus:border-danger focus:ring-danger/30'
                : 'border-border focus:border-brand-purple focus:ring-brand-purple/30'
            }`}
          />
          {emailIncomplete && (
            <span className="mt-1.5 block text-xs text-danger">
              Adresse e-mail incomplète
            </span>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Mot de passe</span>
          <input
            type="password"
            required
            minLength={8}
            placeholder="8 caractères minimum"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
          />
          <PasswordStrengthBar password={password} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">
            Confirmer le mot de passe
          </span>
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
          />
        </label>

        <div>
          <span className="text-sm font-medium text-ink">Type de compte</span>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {ACCOUNT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setAccountType(type)}
                className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                  accountType === type
                    ? 'border-brand-purple bg-brand-purple/10 text-ink'
                    : 'border-border text-muted hover:border-faint'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="solid"
          disabled={submitting}
          className="w-full disabled:opacity-70"
        >
          {submitting ? 'Création...' : 'Créer mon compte'}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-faint">
        En continuant, vous acceptez les CGU et la politique de
        confidentialité.
      </p>

      <p className="mt-6 text-center text-sm text-muted">
        Déjà un compte ?{' '}
        <Link
          to="/connexion"
          className="font-medium text-brand-purple hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  )
}
