import {
  Building2,
  Camera,
  Eye,
  EyeOff,
  GraduationCap,
  User,
  Users,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, register } from '../../api/auth'
import logoMark from '../../assets/logo-mark.png'
import Button from '../ui/Button'
import FacebookSignInButton from './FacebookSignInButton'
import GoogleSignInButton from './GoogleSignInButton'
import PasswordStrengthBar from './PasswordStrengthBar'

const GOOGLE_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
const FACEBOOK_ENABLED = Boolean(import.meta.env.VITE_FACEBOOK_APP_ID)

const ACCOUNT_TYPES = [
  { label: 'Particulier', icon: User },
  { label: 'Entreprise', icon: Building2 },
  { label: 'École', icon: GraduationCap },
  { label: 'Association', icon: Users },
]

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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const avatarInputRef = useRef(null)

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (avatarUrl) URL.revokeObjectURL(avatarUrl)
    setAvatarUrl(URL.createObjectURL(file))
  }

  const emailIncomplete = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email)
  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (emailIncomplete || passwordMismatch || !acceptedTerms) return
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
      navigate('/bienvenue')
    } catch (err) {
      setError(err.message || 'Inscription impossible.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center">
        <span className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-xs font-semibold tracking-widest text-brand-purple uppercase">
          Inscription
        </span>
        <img src={logoMark} alt="" className="mx-auto mt-6 h-10 w-10" />
        <h1 className="mt-6 text-3xl font-bold text-ink">Créer un compte</h1>
      </div>

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
              placeholder="Francklin"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Nom</span>
            <input
              type="text"
              required
              placeholder="Descapo"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
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
            placeholder="nom@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-2 w-full rounded-lg border bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint outline-none focus:ring-3 ${
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
          <div className="relative mt-2">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="8 caractères minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 pr-11 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
              }
              className="absolute top-1/2 right-3 -translate-y-1/2 text-faint hover:text-ink"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <PasswordStrengthBar password={password} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">
            Confirmer le mot de passe
          </span>
          <div className="relative mt-2">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full rounded-lg border bg-surface px-4 py-3 pr-11 text-sm text-ink outline-none focus:ring-3 ${
                passwordMismatch
                  ? 'border-danger focus:border-danger focus:ring-danger/30'
                  : 'border-border focus:border-brand-purple focus:ring-brand-purple/30'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={
                showConfirmPassword
                  ? 'Masquer le mot de passe'
                  : 'Afficher le mot de passe'
              }
              className="absolute top-1/2 right-3 -translate-y-1/2 text-faint hover:text-ink"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {passwordMismatch && (
            <span className="mt-1.5 block text-xs text-danger">
              Les mots de passe ne correspondent pas.
            </span>
          )}
        </label>

        <div>
          <span className="text-sm font-medium text-ink">Type de compte</span>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {ACCOUNT_TYPES.map((type) => (
              <button
                key={type.label}
                type="button"
                onClick={() => setAccountType(type.label)}
                className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                  accountType === type.label
                    ? 'border-brand-purple bg-brand-purple/10 text-ink'
                    : 'border-border text-muted hover:border-faint'
                }`}
              >
                <type.icon className="h-4 w-4 shrink-0" />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <label className="flex items-start gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            required
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-brand-purple"
          />
          <span>
            J'accepte les{' '}
            <Link to="/cgu" className="font-medium text-brand-purple hover:underline">
              CGU
            </Link>{' '}
            et la{' '}
            <Link to="/confidentialite" className="font-medium text-brand-purple hover:underline">
              politique de confidentialité
            </Link>
            .
          </span>
        </label>

        <Button
          type="submit"
          variant="solid"
          disabled={submitting || !acceptedTerms}
          className="w-full disabled:opacity-70"
        >
          {submitting ? 'Création...' : 'Créer mon compte'}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4 text-xs text-faint">
        <span className="h-px flex-1 bg-border-soft" />
        ou
        <span className="h-px flex-1 bg-border-soft" />
      </div>

      <div className="flex flex-col items-center gap-3">
        {GOOGLE_ENABLED ? (
          <GoogleSignInButton onError={setError} />
        ) : (
          <Button variant="outline" disabled title="Bientôt disponible" className="w-full disabled:opacity-50">
            Google
          </Button>
        )}
        {FACEBOOK_ENABLED ? (
          <FacebookSignInButton />
        ) : (
          <Button variant="outline" disabled title="Bientôt disponible" className="w-full disabled:opacity-50">
            Facebook
          </Button>
        )}
      </div>
      {!GOOGLE_ENABLED && !FACEBOOK_ENABLED && (
        <p className="mt-2 text-center text-xs text-faint">
          Inscription Google/Facebook bientôt disponible.
        </p>
      )}

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
