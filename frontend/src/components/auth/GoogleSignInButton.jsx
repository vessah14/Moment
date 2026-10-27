import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { consumeReturnPath, requestedReturnPath } from '../../utils/returnPath'
import { loginWithGoogle } from '../../api/auth'
import Button from '../ui/Button'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

let scriptLoadPromise = null
function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      script.onload = resolve
      script.onerror = () => reject(new Error('Impossible de charger Google Sign-In.'))
      document.head.appendChild(script)
    })
  }
  return scriptLoadPromise
}

// Logo « G » officiel de Google (couleurs imposées par sa charte).
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

// N'affiche rien si VITE_GOOGLE_CLIENT_ID n'est pas configuré : on ne simule jamais
// une connexion Google qui ne peut pas fonctionner.
//
// Le bouton officiel de Google se personnalise (« Continuer en tant que … » avec le nom et
// l'adresse du compte du navigateur) et refuse les clics s'il est masqué. Le site affiche
// donc son propre bouton, qui ouvre la fenêtre de connexion Google (choix du compte) ;
// le jeton d'accès obtenu est vérifié par le serveur auprès de Google.
export default function GoogleSignInButton({ onError }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [busy, setBusy] = useState(false)

  // Script chargé dès l'affichage : la fenêtre doit s'ouvrir dans le clic lui-même,
  // sinon le navigateur la bloque comme un pop-up.
  useEffect(() => {
    if (CLIENT_ID) loadGoogleScript().catch((err) => onError?.(err.message))
  }, [onError])

  if (!CLIENT_ID) return null

  const handleClick = () => {
    const oauth2 = window.google?.accounts?.oauth2
    if (!oauth2) {
      onError?.('Google Sign-In se charge encore, réessayez dans un instant.')
      return
    }
    onError?.('')
    const client = oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'openid email profile',
      prompt: 'select_account',
      callback: async (response) => {
        if (response.error || !response.access_token) {
          setBusy(false)
          onError?.('Connexion Google annulée ou refusée.')
          return
        }
        try {
          await loginWithGoogle(response.access_token)
          const target = requestedReturnPath(location)
          const storedReturnPath = consumeReturnPath()
          navigate(target ?? storedReturnPath ?? '/dashboard', { replace: true })
        } catch (err) {
          onError?.(err.message || 'Connexion Google impossible.')
        } finally {
          setBusy(false)
        }
      },
      // Fenêtre fermée par l'utilisateur ou bloquée par le navigateur.
      error_callback: (err) => {
        setBusy(false)
        if (err?.type === 'popup_failed_to_open')
          onError?.('Le navigateur a bloqué la fenêtre Google : autorisez les pop-ups pour ce site.')
      },
    })
    setBusy(true)
    client.requestAccessToken()
  }

  return (
    <Button type="button" variant="outline" onClick={handleClick} disabled={busy} className="w-full disabled:opacity-60">
      <GoogleLogo />
      {busy ? 'Connexion à Google…' : 'Continuer avec Google'}
    </Button>
  )
}
