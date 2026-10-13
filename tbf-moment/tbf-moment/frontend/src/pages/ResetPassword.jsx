import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/auth'
import logoMark from '../assets/logo-mark.png'
import AuthLayout from '../components/layout/AuthLayout'
import Button from '../components/ui/Button'
import PasswordStrengthBar from '../components/auth/PasswordStrengthBar'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const mismatch = confirm.length > 0 && password !== confirm

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mismatch || password.length < 8) return
    setError('')
    setSubmitting(true)
    try {
      await resetPassword({ token, newPassword: password, confirmPassword: confirm })
      setDone(true)
      setTimeout(() => navigate('/connexion'), 2000)
    } catch (err) {
      setError(err.message || 'La réinitialisation a échoué.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <img src={logoMark} alt="" className="mx-auto h-10 w-10" />
        <h1 className="mt-6 text-center text-2xl font-bold text-ink">
          Définir un nouveau mot de passe
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Choisissez un nouveau mot de passe pour votre compte.
        </p>

        {done ? (
          <p className="mt-6 rounded-lg border border-success/30 bg-success/10 p-4 text-center text-sm text-success">
            Mot de passe mis à jour. Redirection vers la connexion...
          </p>
        ) : !token ? (
          <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 p-4 text-center text-sm text-danger">
            Ce lien de réinitialisation est invalide. Demandez-en un nouveau
            depuis la page « mot de passe oublié ».
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-ink">
                Nouveau mot de passe
              </span>
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

            <label className="block">
              <span className="text-sm font-medium text-ink">
                Confirmer le mot de passe
              </span>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`mt-2 w-full rounded-lg border bg-surface px-4 py-3 text-sm text-ink outline-none focus:ring-3 ${
                  mismatch
                    ? 'border-danger focus:border-danger focus:ring-danger/30'
                    : 'border-border focus:border-brand-purple focus:ring-brand-purple/30'
                }`}
              />
              {mismatch && (
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

            <Button
              type="submit"
              variant="gradient"
              disabled={submitting}
              className="w-full disabled:opacity-70"
            >
              {submitting ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
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
