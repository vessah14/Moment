import { Eye, EyeOff, KeyRound, ShieldAlert } from 'lucide-react'
import QRCode from 'qrcode'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login, verifyMfa } from '../api/auth'
import logoMark from '../assets/logo-mark.png'
import Button from '../components/ui/Button'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [showPassword, setShowPassword] = useState(false)

  // Double authentification : { mfaToken, setup, secret, qr } après le mot de passe.
  const [mfa, setMfa] = useState(null)
  const [code, setCode] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const step = await login({ email, password })
      const qr = step.mfaSetupRequired && step.otpAuthUri
        ? await QRCode.toDataURL(step.otpAuthUri, { margin: 1, width: 200 })
        : null
      setMfa({ mfaToken: step.mfaToken, setup: step.mfaSetupRequired, secret: step.mfaSecret, qr })
      setPassword('')
      setSubmitting(false)
    } catch (err) {
      setSubmitting(false)
      setAttempts((prev) => prev + 1)
      setError(err.message || 'Identifiants incorrects.')
    }
  }

  const handleCode = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await verifyMfa({ mfaToken: mfa.mfaToken, code })
      navigate(location.state?.from?.pathname ?? '/admin', { replace: true })
    } catch (err) {
      setSubmitting(false)
      setCode('')
      setError(err.message || 'Code invalide.')
      // Étape expirée (5 min) : retour au mot de passe.
      if (/reconnectez-vous/i.test(err.message ?? '')) setMfa(null)
    }
  }

  if (mfa) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-bg px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3">
            <img src={logoMark} alt="" className="h-9 w-9" />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger/10 px-3 py-1 text-xs font-semibold tracking-wide text-danger uppercase">
              <KeyRound className="h-3.5 w-3.5" />
              Double authentification
            </span>
          </div>

          {mfa.setup ? (
            <>
              <h1 className="mt-6 text-2xl font-bold text-ink">Protégez votre accès</h1>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">
                <li>Ouvrez Google Authenticator, Microsoft Authenticator ou 1Password.</li>
                <li>Scannez ce QR code (ou saisissez la clé ci-dessous).</li>
                <li>Entrez le code à 6 chiffres affiché.</li>
              </ol>
              {mfa.qr && (
                <img src={mfa.qr} alt="QR code à scanner" className="mx-auto mt-5 h-48 w-48 rounded-lg bg-white p-2" />
              )}
              <p className="mt-3 text-center font-mono text-xs break-all text-faint select-all">{mfa.secret}</p>
            </>
          ) : (
            <>
              <h1 className="mt-6 text-2xl font-bold text-ink">Code de vérification</h1>
              <p className="mt-2 text-sm text-muted">
                Entrez le code à 6 chiffres affiché par votre application d'authentification.
              </p>
            </>
          )}

          <form onSubmit={handleCode} className="mt-6 space-y-5">
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              required
              maxLength={7}
              placeholder="123 456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^\d ]/g, ''))}
              aria-label="Code à 6 chiffres"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] text-ink outline-none focus:border-danger focus:ring-3 focus:ring-danger/30"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button
              type="submit"
              disabled={submitting || code.replace(/\D/g, '').length !== 6}
              className="w-full bg-none bg-danger text-white hover:opacity-90 disabled:opacity-70"
            >
              {submitting ? 'Vérification...' : mfa.setup ? 'Activer et accéder à la console' : 'Accéder à la console'}
            </Button>
            <button
              type="button"
              onClick={() => { setMfa(null); setCode(''); setError('') }}
              className="w-full text-center text-sm text-muted hover:text-ink"
            >
              ← Revenir au mot de passe
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3">
          <img src={logoMark} alt="" className="h-9 w-9" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger/10 px-3 py-1 text-xs font-semibold tracking-wide text-danger uppercase">
            <ShieldAlert className="h-3.5 w-3.5" />
            Accès restreint
          </span>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-ink">Console Super Admin</h1>
        <p className="mt-2 text-sm text-muted">
          Réservé au personnel TBF Digital. Toute tentative d'accès non
          autorisée est journalisée.
        </p>

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
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint outline-none focus:border-danger focus:ring-3 focus:ring-danger/30"
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
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 pr-11 text-sm text-ink outline-none focus:border-danger focus:ring-3 focus:ring-danger/30"
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
            <p className="text-sm text-danger">
              {error}
              {attempts >= 3 && ' Contactez un administrateur si le problème persiste.'}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-none bg-danger text-white hover:opacity-90 disabled:opacity-70"
          >
            {submitting ? 'Vérification...' : "Accéder à la console"}
          </Button>
        </form>
      </div>
    </div>
  )
}
