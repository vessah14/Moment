import { useLocation } from 'react-router-dom'
import Button from '../ui/Button'
import { rememberReturnPath, returnPathFrom } from '../../utils/returnPath'

const APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID
const REDIRECT_URI = `${window.location.origin}/auth/facebook/callback`

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
    const target = returnPathFrom(location)
    if (target) rememberReturnPath(target)
    const authUrl =
      'https://www.facebook.com/v19.0/dialog/oauth' +
      `?client_id=${encodeURIComponent(APP_ID)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      '&response_type=token' +
      '&scope=email'
    window.location.href = authUrl
  }

  return (
    <Button type="button" variant="outline" onClick={handleClick} className="w-full">
      Facebook
    </Button>
  )
}
