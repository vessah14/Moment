import { KeyRound, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { completeMfaRecovery } from '../api/auth'
import logoMark from '../assets/logo-mark.png'
import Button from '../components/ui/Button'

export default function AdminMfaRecovery() {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`)
  }, [token])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await completeMfaRecovery(token)
      setComplete(true)
    } catch (requestError) {
      setError(requestError.message || 'Lien de récupération invalide ou expiré.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3">
          <img src={logoMark} alt="" className="h-9 w-9" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger/10 px-3 py-1 text-xs font-semibold tracking-wide text-danger uppercase">
            <KeyRound className="h-3.5 w-3.5" />
            Récupération sécurisée
          </span>
        </div>

        {complete ? (
          <>
            <h1 className="mt-6 text-2xl font-bold text-ink">MFA réinitialisé</h1>
            <p className="mt-2 text-sm text-muted">
              Votre double authentification a été réinitialisée. Reconnectez-vous avec votre mot de passe pour configurer une nouvelle application d’authentification.
            </p>
            <Button as={Link} to="/admin/connexion" className="mt-6 w-full">
              Retour à la connexion
            </Button>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-2xl font-bold text-ink">Réinitialiser la double authentification</h1>
            <p className="mt-2 text-sm text-muted">
              Ce lien réinitialisera le MFA de votre compte. Vous devrez le configurer à nouveau après vous être reconnecté.
            </p>

            {!token && (
              <p role="alert" className="mt-5 flex gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                Le lien est incomplet. Demandez un nouveau lien de récupération.
              </p>
            )}
            {error && <p role="alert" className="mt-5 text-sm text-danger">{error}</p>}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Button type="submit" disabled={!token || submitting} className="w-full">
                {submitting ? 'Vérification du lien…' : 'Confirmer la réinitialisation'}
              </Button>
              <Link to="/admin/connexion" className="block text-center text-sm text-muted hover:text-ink">
                Annuler et revenir à la connexion
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
