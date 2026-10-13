import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../api/auth'
import logoMark from '../assets/logo-mark.png'
import AuthLayout from '../components/layout/AuthLayout'
import Button from '../components/ui/Button'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(err.message || "L'envoi a échoué.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <img src={logoMark} alt="" className="mx-auto h-10 w-10" />
        <h1 className="mt-6 text-center text-2xl font-bold text-ink">
          Mot de passe oublié
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>

        {sent ? (
          <div className="mt-6 space-y-3 rounded-lg border border-success/30 bg-success/10 p-4 text-center text-sm text-success">
            <p>
              Si un compte existe pour {email}, un lien de réinitialisation
              vient de lui être envoyé.
            </p>
            <p className="text-xs text-muted">
              Le lien reste valable 30 minutes.
            </p>
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
            className="font-medium text-brand-purple hover:underline"
          >
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
