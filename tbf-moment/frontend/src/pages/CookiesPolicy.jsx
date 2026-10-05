import InfoPage from '../components/layout/InfoPage'
import { useState } from 'react'
import {
  readCookieConsent,
  saveCookieConsent
} from '../components/layout/CookieConsent'

export default function CookiesPolicy () {
  const [consent, setConsent] = useState(readCookieConsent)

  function updateConsent (choice) {
    saveCookieConsent(choice)
    setConsent(choice)
  }

  return (
    <InfoPage title='Politique relative aux cookies'>
      <p className='text-xs text-faint'>
        Dernière mise à jour : 3 octobre 2026
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>
        1. Qu’est-ce qu’un cookie ?
      </h2>
      <p>
        Les cookies sont de petits fichiers texte enregistrés sur votre
        navigateur lors de votre visite d’un site. Ils permettent de mémoriser
        certaines informations pour améliorer votre expérience, sécuriser votre
        session et analyser l’utilisation du service.
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>
        2. Cookies utilisés par TBF Moment
      </h2>
      <p>TBF Moment utilise des cookies pour les finalités suivantes :</p>
      <ul className='list-disc space-y-1 pl-5'>
        <li>maintenir votre session de connexion active</li>
        <li>mémoriser votre langue préférée sur le site</li>
        <li>assurer la sécurité et la stabilité de la plateforme</li>
        <li>
          comprendre comment les visiteurs utilisent les pages publiques et les
          outils d’événement
        </li>
      </ul>

      <h2 className='mt-6 text-lg font-semibold text-ink'>
        3. Cookies strictement nécessaires
      </h2>
      <p>
        Ces cookies sont essentiels au bon fonctionnement de la plateforme. Sans
        eux, certaines fonctions comme l’authentification, la création de compte
        ou la navigation dans votre tableau de bord ne seraient pas garanties.
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>
        4. Cookies de préférences
      </h2>
      <p>
        Nous utilisons des cookies de préférences pour retenir la langue
        sélectionnée sur le site, ainsi que le thème ou les options de
        navigation que vous avez choisies. Ces cookies ne sont pas utilisés à
        des fins publicitaires.
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>
        5. Cookies d’analyse
      </h2>
      <p>
        Nous pouvons utiliser des outils d’analyse pour mesurer la fréquentation
        et optimiser les parcours utilisateurs. Ces données sont agrégées et ne
        servent pas à identifier directement une personne sans son consentement
        explicite, lorsque la réglementation l’exige.
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>
        6. Gestion de vos préférences
      </h2>
      <p>
        Les cookies nécessaires au fonctionnement du service restent actifs.
        Vous pouvez accepter ou refuser les cookies optionnels ci-dessous, puis
        modifier votre choix à tout moment depuis cette page.
      </p>
      <div className='mt-4 flex flex-wrap items-center gap-3'>
        <button
          type='button'
          onClick={() => updateConsent('refused')}
          className='rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-panel'
        >
          Refuser les cookies optionnels
        </button>
        <button
          type='button'
          onClick={() => updateConsent('accepted')}
          className='rounded-lg bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90'
        >
          Accepter les cookies optionnels
        </button>
        {consent && (
          <p role='status' className='text-sm text-muted'>
            Préférence enregistrée :{' '}
            {consent === 'accepted' ? 'acceptés' : 'refusés'}.
          </p>
        )}
      </div>
      <p className='mt-4'>
        Vous pouvez également supprimer les cookies depuis les paramètres de
        votre navigateur ou configurer celui-ci pour les bloquer.
      </p>
      <p>
        Attention : si vous bloquez les cookies techniques, certaines
        fonctionnalités de la plateforme peuvent être désactivées ou devenir
        instables.
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>7. Contact</h2>
      <p>
        Pour toute question relative aux cookies, vous pouvez écrire à{' '}
        <a
          href='mailto:contact@tbfmoment.com'
          className='text-brand-purple hover:underline'
        >
          contact@tbfmoment.com
        </a>
        .
      </p>
    </InfoPage>
  )
}
