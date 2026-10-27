import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login, register } from '../../api/auth'
import logoMark from '../../assets/logo-mark.png'
import Button from '../ui/Button'
import GoogleSignInButton from './GoogleSignInButton'
import PasswordStrengthBar from './PasswordStrengthBar'
import { consumeSignupReturnPath, loginPathForReturnPath, rememberSignupReturnPath, requestedReturnPath } from '../../utils/returnPath'
import { PRICING_PLANS } from '../../data/pricingPlans'

const GOOGLE_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
const OFFER_CODES = { free: 'Free', premium: 'Premium', business: 'Business', eventpro: 'Event Pro' }

export default function SignupForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const requestedPath = requestedReturnPath(location)
  const returnParams = new URLSearchParams(requestedPath?.split('?')[1] ?? '')
  const requestedOfferCode = returnParams.get('offre') ?? new URLSearchParams(location.search).get('offre')
  const selectedOffer = PRICING_PLANS.find((plan) => OFFER_CODES[requestedOfferCode] === plan.name)
  const returnPath = requestedPath ?? (
    selectedOffer ? `/tarifs?offre=${encodeURIComponent(requestedOfferCode)}` : null
  )
  const emailIncomplete = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email)
  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (emailIncomplete || passwordMismatch || !acceptedTerms) return
    setError('')
    setSubmitting(true)
    try {
      rememberSignupReturnPath(returnPath)
      await register({
        fullName: `${firstName} ${lastName}`.trim(),
        email,
        password,
        confirmPassword,
      })
      // Compte créé : connexion immédiate, l'adresse se confirme ensuite (bandeau du tableau
      // de bord). Si l'adresse avait déjà un compte, ce mot de passe ne l'ouvre pas : même
      // page « vérifiez vos e-mails » qu'avant, rien n'est révélé.
      try {
        await login({ email, password })
        navigate(consumeSignupReturnPath() ?? '/dashboard', { replace: true })
        return
      } catch {
        // Adresse déjà inscrite avec un autre mot de passe.
      }
      const params = new URLSearchParams({ email })
      if (returnPath) params.set('retour', returnPath)
      navigate(`/inscription/verifiez-vos-emails?${params}`)
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

      {GOOGLE_ENABLED && (
        <>
          <div className="my-6 flex items-center gap-4 text-xs text-faint">
            <span className="h-px flex-1 bg-border-soft" />
            ou
            <span className="h-px flex-1 bg-border-soft" />
          </div>
          <div className="flex flex-col items-center gap-3">
            <GoogleSignInButton onError={setError} />
          </div>
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        Déjà un compte ?{' '}
        <Link
          to={returnPath ? loginPathForReturnPath(returnPath) : '/connexion'}
          state={location.state}
          className="font-medium text-brand-purple hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  )
}
