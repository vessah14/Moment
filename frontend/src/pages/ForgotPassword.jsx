import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { requestPasswordReset } from '../api/auth'
import logoMark from '../assets/logo-mark.png'
import AuthLayout from '../components/layout/AuthLayout'
import Button from '../components/ui/Button'

// Délai avant de pouvoir redemander un lien (l'API limite aussi les tentatives par IP).
const RESEND_DELAY_S = 30

export default function ForgotPassword() {
  const [searchParams] = useSearchParams()
  // Adresse déjà tapée sur la page de connexion (lien « Mot de passe oublié ? »).
  const [email, setEmail] = useState(() => searchParams.get('email') ?? '')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [wait, setWait] = useState(0)

  useEffect(() => {
    if (wait <= 0) return undefined
    const timer = setTimeout(() => setWait((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [wait])

  const send = async () => {
    setError('')
    setSubmitting(true)
    try {
      await requestPasswordReset(email.trim())
      setSent(true)
      setWait(RESEND_DELAY_S)
    } catch (err) {
      setError(err.message || "L'envoi a échoué.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    send()
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <img src={logoMark} alt="" className="mx-auto h-10 w-10" />
        <h1 className="mt-6 text-center text-2xl font-bold text-ink">
          Mot de passe oublié
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          {sent
            ? 'Consultez votre boîte de réception.'
            : 'Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.'}
        </p>

        {sent ? (
          <div className="mt-6 space-y-4">
            <div role="status" className="space-y-2 rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-ink">
              <p>
                Si un compte existe pour <b className="break-all">{email.trim()}</b>, un lien de
                réinitialisation vient de lui être envoyé.
              </p>
              <p className="text-xs text-muted">
                Le lien reste valable 30 minutes et ne sert qu'une fois. Rien reçu après quelques
                minutes ? Regardez dans les courriers indésirables.
              </p>
            </div>

            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
                {error}
              </p>
            )}

            <Button
              variant="outline"
              onClick={send}
              disabled={submitting || wait > 0}
              className="w-full disabled:opacity-60"
            >
              {submitting ? 'Envoi...' : wait > 0 ? `Renvoyer le lien (${wait} s)` : 'Renvoyer le lien'}
            </Button>
            <button
              type="button"
              onClick={() => {
                setSent(false)
                setError('')
              }}
              className="block w-full text-center text-sm text-muted hover:text-ink"
            >
              Ce n'est pas la bonne adresse ? Modifier
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-ink">
                Adresse e-mail
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
              />
            </label>

            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="gradient"
              disabled={submitting}
              className="w-full disabled:opacity-70"
            >
              {submitting ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link
            to="/connexion"
            state={email.trim() ? { email: email.trim() } : undefined}
            className="font-medium text-brand-purple hover:underline"
          >
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
