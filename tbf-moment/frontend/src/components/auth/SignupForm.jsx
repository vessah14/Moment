import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoMark from '../../assets/logo-mark.png'
import Button from '../ui/Button'
import PasswordStrengthBar from './PasswordStrengthBar'

const ACCOUNT_TYPES = ['Particulier', 'Entreprise', 'École', 'Association']

export default function SignupForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState('Particulier')
  const [submitting, setSubmitting] = useState(false)

  const emailIncomplete = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (emailIncomplete) return
    setSubmitting(true)
    setTimeout(() => navigate('/dashboard'), 600)
  }

  return (
    <div className="w-full max-w-sm">
      <span className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-xs font-semibold tracking-widest text-brand-purple uppercase">
        Inscription
      </span>
      <img src={logoMark} alt="" className="mt-6 h-10 w-10" />
      <h1 className="mt-6 text-3xl font-bold text-ink">Créer un compte</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-ink">Prénom</span>
            <input
              type="text"
              required
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Nom</span>
            <input
              type="text"
              required
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
