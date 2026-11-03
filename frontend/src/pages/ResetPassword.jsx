import { Eye, EyeOff } from 'lucide-react'
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

  const [showPassword, setShowPassword] = useState(false)
  // Lien expiré ou déjà utilisé (400) : seul un nouveau lien permet d'avancer.
  const [linkDead, setLinkDead] = useState(false)
  const mismatch = confirm.length > 0 && password !== confirm

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mismatch || password.length < 8) return
    setError('')
    setSubmitting(true)
    try {
      await resetPassword({ token, newPassword: password, confirmPassword: confirm })
      setDone(true)
      // La page de connexion confirme le changement : pas d'attente inutile ici.
      navigate('/connexion', { replace: true, state: { passwordReset: true } })
    } catch (err) {
      setError(err.message || 'La réinitialisation a échoué.')
      setLinkDead(err.status === 400 && /lien/i.test(err.message ?? ''))
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
            Ce lien de réinitialisation est invalide.
            <Link to="/mot-de-passe-oublie" className="mt-1.5 block font-semibold text-brand-purple hover:underline">
              Recevoir un nouveau lien
            </Link>
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-ink">
                Nouveau mot de passe
              </span>
              <span className="relative mt-2 block">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  autoFocus
                  placeholder="8 caractères minimum"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 pr-11 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-faint hover:text-ink"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
              <PasswordStrengthBar password={password} />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ink">
                Confirmer le mot de passe
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
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
                {linkDead && (
                  <Link to="/mot-de-passe-oublie" className="mt-1.5 block font-semibold text-brand-purple hover:underline">
                    Recevoir un nouveau lien
                  </Link>
                )}
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
