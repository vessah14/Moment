import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { consumeReturnPath, loginPathForReturnPath, requestedReturnPath } from '../../utils/returnPath'
import { login } from '../../api/auth'
import { goHomeAfterLogin } from '../../utils/firstEvent'
import logoMark from '../../assets/logo-mark.webp'
import Button from '../ui/Button'
import GoogleSignInButton from './GoogleSignInButton'
import { t } from '../../i18n'

const GOOGLE_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

export default function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  // Retour de « nouveau mot de passe » : l'adresse est préremplie et un message confirme.
  const [email, setEmail] = useState(() => location.state?.email ?? '')
  const passwordReset = Boolean(location.state?.passwordReset)
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  // Coché : session mémorisée jusqu'à 30 jours ; décoché : navigateur courant uniquement.
  const [remember, setRemember] = useState(true)
  const returnPath = requestedReturnPath(location)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login({ email, password, remember })
      // Retour à la page demandée avant la connexion ("Utiliser ce modèle") ou à celle
      // où la session a expiré.
      const storedReturnPath = consumeReturnPath()
      if (returnPath ?? storedReturnPath) navigate(returnPath ?? storedReturnPath, { replace: true })
      else await goHomeAfterLogin(navigate)
    } catch (err) {
      setError(err.message || t("Connexion impossible."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center">
        <span className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-xs font-semibold tracking-widest text-brand-purple uppercase">
          {t("Connexion")}
        </span>
        <img src={logoMark} alt="" className="mx-auto mt-6 h-10 w-10" />
        <h1 className="mt-6 text-3xl font-bold text-ink">{t("Bon retour")}</h1>
        <p className="mt-2 text-sm text-muted">
          {t("Retrouvez vos événements et vos invités.")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-ink">
            {t("Adresse e-mail")}
          </span>
          <input
            type="email"
            required
            placeholder={t("nom@exemple.com")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">{t("Mot de passe")}</span>
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
                showPassword ? t("Masquer le mot de passe") : t("Afficher le mot de passe")
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

        {passwordReset && (
          <p role="status" className="rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-success">
            {t("Mot de passe mis à jour. Connectez-vous avec le nouveau.")}
          </p>
        )}
        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-brand-purple"
            />
            <span title={t('Rester connecté jusqu’à 30 jours sans activité. Décochez sur un ordinateur partagé.')}>{t('Se souvenir de moi')}</span>
          </label>
          <Link
            to={email.trim() ? `/mot-de-passe-oublie?email=${encodeURIComponent(email.trim())}` : '/mot-de-passe-oublie'}
            className="text-brand-purple hover:underline"
          >
            {t("Mot de passe oublié ?")}
          </Link>
        </div>

        <Button
          type="submit"
          variant="gradient"
          disabled={submitting}
          className="w-full disabled:opacity-70"
        >
          {submitting ? t('Connexion...') : t('Se connecter')}
        </Button>
      </form>

      {GOOGLE_ENABLED && (
        <>
          <div className="my-6 flex items-center gap-4 text-xs text-faint">
            <span className="h-px flex-1 bg-border-soft" />
            {t('ou')}
            <span className="h-px flex-1 bg-border-soft" />
          </div>
          <div className="flex flex-col items-center gap-3">
            <GoogleSignInButton onError={setError} />
            {/* Un premier passage par Google crée le compte : il vaut acceptation des conditions. */}
            <p className="text-center text-xs text-faint">
              {t('En continuant avec Google, vous acceptez les')}{' '}
              <Link to="/cgu" className="text-brand-purple hover:underline">{t('CGU')}</Link> {t('et la')}{' '}
              <Link to="/confidentialite" className="text-brand-purple hover:underline">{t('politique de confidentialité')}</Link>.
            </p>
          </div>
        </>
      )}

      <p className="mt-8 text-center text-sm text-muted">
        {t('Pas encore de compte ?')}{' '}
        <Link
          to={returnPath ? loginPathForReturnPath(returnPath).replace('/connexion?', '/inscription?') : '/inscription'}
          state={location.state}
          className="font-medium text-brand-purple hover:underline"
        >
          {t("Créer un compte")}
        </Link>
      </p>
    </div>
  )
}
