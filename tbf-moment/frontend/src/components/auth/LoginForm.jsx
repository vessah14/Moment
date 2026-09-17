import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoMark from '../../assets/logo-mark.png'
import Button from '../ui/Button'

export default function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => navigate('/dashboard'), 600)
  }

  const handleResetSubmit = (e) => {
    e.preventDefault()
    setResetSent(true)
  }

  if (resetOpen) {
    return (
      <div className="w-full max-w-sm">
        <img src={logoMark} alt="" className="h-10 w-10" />
        <h1 className="mt-6 text-3xl font-bold text-ink">Mot de passe oublié</h1>
        <p className="mt-2 text-sm text-muted">
          Indiquez votre e-mail, nous vous envoyons un lien de réinitialisation.
        </p>

        {resetSent ? (
          <p className="mt-6 rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-success">
            Un lien a été envoyé à {resetEmail}.
          </p>
        ) : (
          <form onSubmit={handleResetSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-ink">
                Adresse e-mail
              </span>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
              />
            </label>
            <Button type="submit" variant="gradient" className="w-full">
              Envoyer le lien
            </Button>
          </form>
        )}

        <button
          type="button"
          onClick={() => {
            setResetOpen(false)
            setResetSent(false)
          }}
          className="mt-6 text-sm font-medium text-brand-purple hover:underline"
        >
          Retour à la connexion
        </button>
      </div>
    )
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

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-brand-purple"
            />
            Se souvenir de moi
          </label>
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="text-brand-purple hover:underline"
          >
            Mot de passe oublié ?
          </button>
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
