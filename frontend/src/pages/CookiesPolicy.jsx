import InfoPage from '../components/layout/InfoPage'

export default function CookiesPolicy () {
  return (
    <InfoPage title='Politique relative aux cookies'
      path='/cookies'>
      <p className='text-xs text-faint'>
        Dernière mise à jour : 29 octobre 2026
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>
        1. Qu’est-ce qu’un cookie ?
      </h2>
      <p>
        Un cookie est une petite donnée enregistrée par un site dans votre
        navigateur. Le stockage local (localStorage) et le stockage de session
        (sessionStorage) sont des mécanismes distincts des cookies, également
        utilisés par le site pour mémoriser des informations sur votre appareil.
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>
        2. Cookies et stockages utilisés
      </h2>
      <ul className='list-disc space-y-1 pl-5'>
        <li>
          <strong>googtrans (cookie)</strong> : mémorise la langue choisie quand
          vous demandez volontairement la traduction d’une page. Il n’est pas
          créé lorsque vous restez en français. Il est supprimé lorsque vous
          revenez au français ; sans date d’expiration définie par le site, il
          reste normalement jusqu’à la fermeture du navigateur. Le script de
          traduction est fourni par Google et ne se charge qu’après votre choix
          d’une autre langue.
        </li>
        <li>
          <strong>Préférences, compte et fonctionnalités (localStorage)</strong> :
          le site conserve notamment votre choix relatif aux cookies, votre
          langue, ainsi que les informations nécessaires à l’espace organisateur.
          Le jeton de session est conservé dans ce stockage et transmis à l’API
          pour authentifier les requêtes ; il ne s’agit pas d’un cookie.
        </li>
        <li>
          <strong>Informations temporaires (sessionStorage)</strong> : certaines
          fonctions conservent temporairement des données utiles pendant
          l’onglet ouvert, par exemple la destination de retour après une
          connexion ou l’état d’une action en cours.
        </li>
      </ul>
      <p>
        Le site n’intègre actuellement aucun outil de mesure d’audience ni
        cookie publicitaire. Le bandeau d’information ne recueille pas un
        consentement à du suivi statistique. Si la traduction Google est
        utilisée, Google peut traiter des informations techniques et le contenu
        de la page à traduire selon ses propres conditions.
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>
        3. Données nécessaires au fonctionnement
      </h2>
      <p>
        Le stockage du jeton et des informations de compte permet de vous
        authentifier et d’utiliser votre espace. D’autres stockages locaux
        peuvent mémoriser les réponses ou préférences nécessaires à certaines
        fonctions. Les bloquer ou les effacer peut vous déconnecter, réinitialiser
        une préférence ou empêcher une fonction de reprendre son état.
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>
        4. Gestion de vos préférences
      </h2>
      <p>
        Le bandeau d’information peut être fermé avec le bouton « Compris » ;
        cette préférence est mémorisée dans le localStorage de votre navigateur.
        Elle ne constitue pas un consentement à des cookies de mesure d’audience
        ou de publicité, qui ne sont actuellement pas utilisés.
      </p>
      <p className='mt-4'>
        Vous pouvez également supprimer les cookies et les données de site dans
        les paramètres de votre navigateur. La suppression du stockage local
        efface notamment la préférence enregistrée et peut fermer votre session.
        Pour ne pas utiliser la traduction Google, gardez le français sélectionné.
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>5. Contact</h2>
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
