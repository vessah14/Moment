import { Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import logoMark from '../../assets/logo-mark.png'
import Button from '../../components/ui/Button'
import { checkAdminCredentials, setAdminAuthenticated } from '../../utils/adminAuth'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setTimeout(() => {
      if (checkAdminCredentials(email, password)) {
        setAdminAuthenticated()
        navigate(location.state?.from?.pathname ?? '/admin', { replace: true })
        return
      }
      setSubmitting(false)
      setAttempts((prev) => prev + 1)
      setError('Identifiants incorrects.')
    }, 600)
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
