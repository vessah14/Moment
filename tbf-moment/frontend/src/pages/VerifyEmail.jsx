import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../api/users'
import { getCurrentUser, isAuthenticated, setCurrentUser } from '../api/client'
import logoMark from '../assets/logo-mark.png'
import AuthLayout from '../components/layout/AuthLayout'
import Button from '../components/ui/Button'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [state, setState] = useState(token ? 'checking' : 'invalid')
  const [error, setError] = useState('')
  const started = useRef(false)
  const loggedIn = isAuthenticated()

  useEffect(() => {
    // StrictMode monte deux fois les effets en développement : un seul appel suffit.
    if (!token || started.current) return
    started.current = true
    verifyEmail(token)
      .then(() => {
        const user = getCurrentUser()
        if (user) setCurrentUser({ ...user, emailVerified: true })
        setState('done')
      })
      .catch((err) => {
        setError(err.message || 'Lien de vérification invalide ou expiré.')
        setState('invalid')
      })
  }, [token])

  return (
    <AuthLayout>
      <div className="w-full max-w-sm text-center">
        <img src={logoMark} alt="" className="mx-auto h-10 w-10" />
        <h1 className="mt-6 text-2xl font-bold text-ink">Vérification de l'e-mail</h1>

        {state === 'checking' && <p className="mt-6 text-sm text-muted">Vérification en cours…</p>}

        {state === 'done' && (
          <p className="mt-6 rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-success">
            Votre adresse e-mail est confirmée. Merci !{loggedIn ? '' : ' Vous pouvez maintenant vous connecter.'}
          </p>
        )}

        {state === 'invalid' && (
          <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
            {error ||
              'Ce lien de vérification est invalide.'}{' '}
            Pour recevoir un nouveau lien, connectez-vous : il vous sera renvoyé automatiquement.
          </p>
        )}

        {loggedIn ? (
          <Link to="/dashboard" className="mt-6 inline-block text-sm font-medium text-brand-purple hover:underline">
            Aller au tableau de bord
          </Link>
        ) : (
          // Première connexion après confirmation : accueil des nouveaux inscrits.
          <Button
            as={Link}
            to="/connexion"
            state={state === 'done' ? { from: { pathname: '/bienvenue' } } : undefined}
            variant="gradient"
            className="mt-6 w-full"
          >
            Se connecter
          </Button>
        )}
      </div>
    </AuthLayout>
  )
}
