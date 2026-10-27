import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../api/users'
import { setCurrentUser, setToken } from '../api/client'
import logoMark from '../assets/logo-mark.png'
import AuthLayout from '../components/layout/AuthLayout'
import Button from '../components/ui/Button'
import {
  consumeReturnPath,
  consumeSignupReturnPath,
  loginPathForReturnPath,
  peekSignupReturnPath,
  returnPathFromSearch,
} from '../utils/returnPath'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''
  const returnPath = returnPathFromSearch(window.location.search) ?? peekSignupReturnPath()
  const [state, setState] = useState(token ? 'checking' : 'invalid')
  const [error, setError] = useState('')
  const started = useRef(false)
  useEffect(() => {
    // StrictMode monte deux fois les effets en développement : un seul appel suffit.
    if (!token || started.current) return
    started.current = true
    verifyEmail(token)
      .then((session) => {
        if (!session?.token || !session?.utilisateur) {
          throw new Error("L'adresse est confirmée, mais la connexion automatique a échoué. Connectez-vous.")
        }
        setToken(session.token)
        setCurrentUser(session.utilisateur)
        setState('done')
        const storedReturnPath = consumeSignupReturnPath() ?? consumeReturnPath()
        navigate(returnPathFromSearch(window.location.search) ?? storedReturnPath ?? '/dashboard', { replace: true })
      })
      .catch((err) => {
        setError(err.message || 'La vérification a échoué.')
        setState('invalid')
      })
  }, [token, navigate])

  return (
    <AuthLayout>
      <div className="w-full max-w-sm text-center">
        <img src={logoMark} alt="" className="mx-auto h-10 w-10" />
        <h1 className="mt-6 text-2xl font-bold text-ink">Vérification de l'e-mail</h1>

        {state === 'checking' && <p className="mt-6 text-sm text-muted">Vérification en cours…</p>}

        {state === 'done' && (
          <p className="mt-6 rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-success">
            Votre adresse e-mail est confirmée. Redirection vers votre tableau de bord…
          </p>
        )}

        {state === 'invalid' && (
          <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
            {error ||
              'Ce lien de vérification est invalide.'}{' '}
            Pour recevoir un nouveau lien, connectez-vous : il vous sera renvoyé automatiquement.
          </p>
        )}

        {state === 'invalid' && (
          <Button
            as={Link}
            to={returnPath
              ? loginPathForReturnPath(returnPath)
              : '/connexion'}
            variant="gradient"
            className="mt-6 w-full"
          >
            Aller à la connexion
          </Button>
        )}
      </div>
    </AuthLayout>
  )
}
