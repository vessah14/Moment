import { useEffect, useState } from 'react'
import { t } from '../../i18n'

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
      translate='no'
      aria-label={t("Préférences de cookies")}
      className='fixed inset-x-3 bottom-3 z-50 mx-auto max-w-5xl rounded-xl border border-border bg-surface px-4 py-3 shadow-2xl sm:inset-x-6 sm:px-5'
    >
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6'>
        <div className='max-w-3xl'>
          <h2 className='sr-only'>
            {t("Vos préférences de cookies")}
          </h2>
          <p className='text-xs leading-relaxed text-muted sm:text-sm'>
            {t("Les cookies nécessaires assurent le fonctionnement du site. Choisissez si vous autorisez les cookies optionnels de mesure d’audience. Vous pourrez modifier votre choix à tout moment depuis la page Cookies.")}
          </p>
        </div>
        <div className='flex shrink-0 gap-2'>
          <button
            type='button'
            onClick={() => saveCookieConsent('refused')}
            aria-label={t("Refuser les cookies optionnels")}
            className='flex-1 whitespace-nowrap rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-panel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple sm:flex-none'
          >
            {t("Refuser")}
          </button>
          <button
            type='button'
            onClick={() => saveCookieConsent('accepted')}
            aria-label={t("Accepter les cookies optionnels")}
            className='flex-1 whitespace-nowrap rounded-lg bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple sm:flex-none'
          >
            {t("Accepter")}
          </button>
        </div>
      </div>
    </aside>
  )
}
