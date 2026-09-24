import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'
import logoMark from '../../assets/logo-mark.png'
import Button from '../ui/Button'
import FacebookSignInButton from './FacebookSignInButton'
import GoogleSignInButton from './GoogleSignInButton'

const GOOGLE_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
const FACEBOOK_ENABLED = Boolean(import.meta.env.VITE_FACEBOOK_APP_ID)

export default function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Connexion impossible.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center">
        <span className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-xs font-semibold tracking-widest text-brand-purple uppercase">
          Connexion
        </span>
        <img src={logoMark} alt="" className="mx-auto mt-6 h-10 w-10" />
        <h1 className="mt-6 text-3xl font-bold text-ink">Bon retour</h1>
        <p className="mt-2 text-sm text-muted">
          Retrouvez vos événements et vos invités.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Mot de passe</span>
          <div className="relative mt-2">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 pr-11 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
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
        </label>

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-brand-purple"
            />
            Se souvenir de moi
          </label>
          <Link
            to="/mot-de-passe-oublie"
            className="text-brand-purple hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button
          type="submit"
          variant="gradient"
          disabled={submitting}
          className="w-full disabled:opacity-70"
        >
          {submitting ? 'Connexion...' : 'Se connecter'}
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
          Connexion Google/Facebook bientôt disponible.
        </p>
      )}

      <p className="mt-8 text-center text-sm text-muted">
        Pas encore de compte ?{' '}
        <Link
          to="/inscription"
          className="font-medium text-brand-purple hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  )
}
