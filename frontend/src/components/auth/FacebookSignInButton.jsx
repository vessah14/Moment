import { useLocation } from 'react-router-dom'
import Button from '../ui/Button'
import { createOAuthState } from '../../utils/oauthState'
import { rememberReturnPath, requestedReturnPath } from '../../utils/returnPath'

const APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID
const REDIRECT_URI = `${window.location.origin}/auth/facebook/callback`

// Logo « f » officiel de Facebook.
function FacebookLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        fill="#fff"
        d="M15.6 15.5 16.1 12.4h-3v-2c0-.8.4-1.7 1.7-1.7h1.4V6.1s-1.2-.2-2.4-.2c-2.5 0-4.1 1.5-4.1 4.2v2.3H7v3.1h2.7V24a11 11 0 0 0 3.4 0v-8.5h2.5z"
      />
    </svg>
  )
}

// N'affiche rien si VITE_FACEBOOK_APP_ID n'est pas configuré : on ne simule jamais
// une connexion Facebook qui ne peut pas fonctionner.
//
// Redirection OAuth classique plutôt que le SDK JS + popup : ce dernier s'appuie sur
// une communication en arrière-plan (iframe + postMessage) entre notre page et
// facebook.com que les navigateurs modernes cassent de plus en plus souvent (blocage
// des cookies tiers) — la popup s'ouvre, l'utilisateur se connecte, mais elle ne sait
// plus revenir vers notre page et finit sur facebook.com. La redirection classique
// n'a pas ce problème : Facebook renvoie lui-même le navigateur vers REDIRECT_URI,
// géré par FacebookCallback.jsx.
export default function FacebookSignInButton() {
  const location = useLocation()
  if (!APP_ID) return null

  const handleClick = () => {
    // La page quitte le site : la destination est conservée pour FacebookCallback.
    // (sans destination explicite, on garde celle mémorisée à l'expiration de session)
    const target = requestedReturnPath(location)
    if (target) rememberReturnPath(target)
    const authUrl =
      'https://www.facebook.com/v23.0/dialog/oauth' +
      `?client_id=${encodeURIComponent(APP_ID)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      '&response_type=code' +
      '&scope=email' +
      `&state=${createOAuthState()}`
    window.location.href = authUrl
  }

  return (
    <Button type="button" variant="outline" onClick={handleClick} className="w-full">
      <FacebookLogo />
      Continuer avec Facebook
    </Button>
  )
}
