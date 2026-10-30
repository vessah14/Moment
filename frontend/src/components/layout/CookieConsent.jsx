import { useEffect, useState } from 'react'

const CONSENT_KEY = 'tbf-moment-cookie-consent'
const CONSENT_EVENT = 'tbf-moment-cookie-consent-change'

export function readCookieConsent () {
  try {
    return window.localStorage.getItem(CONSENT_KEY)
  } catch {
    return null
  }
}

export function saveCookieConsent (choice) {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice)
    window.dispatchEvent(new Event(CONSENT_EVENT))
  } catch {
    return
  }
}

export default function CookieConsent () {
  const [choice, setChoice] = useState(readCookieConsent)

  useEffect(() => {
    const syncChoice = () => setChoice(readCookieConsent())
    window.addEventListener(CONSENT_EVENT, syncChoice)
    return () => window.removeEventListener(CONSENT_EVENT, syncChoice)
  }, [])

  if (choice) return null

  return (
    <aside
      aria-label='Préférences de cookies'
      className='fixed inset-x-4 bottom-4 z-50 mx-auto max-w-4xl rounded-xl border border-border bg-surface p-5 shadow-2xl sm:inset-x-6 sm:p-6'
    >
      <div className='flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between'>
        <div className='max-w-2xl'>
          <h2 className='text-base font-semibold text-ink'>
            Vos préférences de cookies
          </h2>
          <p className='mt-1 text-sm leading-relaxed text-muted'>
            Nous utilisons un cookie de langue uniquement si vous demandez une
            traduction par Google. L’authentification utilise le stockage de
            votre navigateur, pas un cookie. Aucun cookie publicitaire ou de
            mesure d’audience n’est actuellement utilisé. Consultez la{' '}
            <a href='/cookies' className='font-semibold text-brand-purple hover:underline'>
              politique cookies
            </a>.
          </p>
        </div>
        <div className='flex shrink-0 flex-col gap-2 sm:flex-row'>
          <button
            type='button'
            onClick={() => saveCookieConsent('acknowledged')}
            className='rounded-lg bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90'
          >
            Compris
          </button>
        </div>
      </div>
    </aside>
  )
}
