import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'
import logoMark from '../../assets/logo-mark.png'
import Button from '../ui/Button'

export default function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

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
      <img src={logoMark} alt="" className="h-10 w-10" />
      <h1 className="mt-6 text-3xl font-bold text-ink">Bon retour</h1>
      <p className="mt-2 text-sm text-muted">
        Retrouvez vos événements et vos invités.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-ink">
            Adresse e-mail
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Mot de passe</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
          />
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

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" disabled title="Bientôt disponible" className="disabled:opacity-50">
          Google
        </Button>
        <Button variant="outline" disabled title="Bientôt disponible" className="disabled:opacity-50">
          Apple
        </Button>
      </div>
      <p className="mt-2 text-center text-xs text-faint">
        Connexion Google/Apple bientôt disponible.
      </p>

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
