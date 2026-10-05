import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { consumeReturnPath, returnPathFrom } from '../../utils/returnPath'
import { loginWithGoogle } from '../../api/auth'

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

// N'affiche rien si VITE_GOOGLE_CLIENT_ID n'est pas configuré : on ne simule jamais
// une connexion Google qui ne peut pas fonctionner.
export default function GoogleSignInButton({ onError }) {
  const navigate = useNavigate()
  const location = useLocation()
  const containerRef = useRef(null)

  useEffect(() => {
    if (!CLIENT_ID) return
    let cancelled = false

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current) return
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async (response) => {
            try {
              await loginWithGoogle(response.credential)
              navigate(returnPathFrom(location) ?? consumeReturnPath() ?? '/dashboard', { replace: true })
            } catch (err) {
              onError?.(err.message || 'Connexion Google impossible.')
            }
          },
        })
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: 260,
          text: 'continue_with',
        })
      })
      .catch((err) => onError?.(err.message))

    return () => {
      cancelled = true
    }
  }, [navigate, onError])

  if (!CLIENT_ID) return null

  return <div ref={containerRef} className="flex justify-center" />
}
