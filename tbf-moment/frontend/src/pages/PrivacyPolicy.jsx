import InfoPage from '../components/layout/InfoPage'

export default function PrivacyPolicy () {
  return (
    <InfoPage title='Politique de confidentialité'
      description="Comment TBF Moment collecte, utilise et protège vos données personnelles et celles de vos invités."
      path='/confidentialite'>
      <p className='text-xs text-faint'>
        Dernière mise à jour : 3 octobre 2026
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>
        1. Responsable du traitement
      </h2>
      <p>
        TBF Moment est responsable du traitement des données collectées via la
        plateforme et les services associés. Pour toute question, vous pouvez
        nous contacter à{' '}
        <a
          href='mailto:contact@tbfmoment.com'
          className='text-brand-purple hover:underline'
        >
          contact@tbfmoment.com
        </a>
        .
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>
        2. Données collectées
      </h2>
      <p>
        Nous pouvons collecter : le nom, l’adresse email, le numéro de
        téléphone, les informations de compte, les données d’événement, les
        contenus publiés et les interactions de vos invités.
      </p>
      <p>
        Les invités peuvent transmettre des données lors d’une confirmation de
        présence, d’un message dans le livre d’or, d’une réservation de cadeau
        ou d’un achat de billet.
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>
        3. Finalités du traitement
      </h2>
      <ul className='list-disc space-y-1 pl-5'>
        <li>créer et sécuriser votre compte</li>
        <li>gérer les événements et leurs invités</li>
        <li>afficher les pages publiques de vos événements</li>
        <li>envoyer les notifications ou invitations déclenchées par vous</li>
        <li>assurer la sécurité, la stabilité et la prévention des abus</li>
      </ul>

      <h2 className='mt-6 text-lg font-semibold text-ink'>4. Base légale</h2>
      <p>
        Les traitements reposent sur l’exécution du contrat, la gestion de votre
        compte, l’intérêt légitime à sécuriser la plateforme et, le cas échéant,
        votre consentement lorsque la loi le requiert.
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>
        5. Partage des données
      </h2>
      <p>
        Nous ne vendons pas vos données. Elles sont uniquement partagées avec
        les services strictement nécessaires au fonctionnement de la plateforme,
        ou avec vous-même pour vous permettre de gérer votre événement.
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>6. Sécurité</h2>
      <p>
        Les mots de passe sont stockés sous forme hachée, les accès sont
        sécurisés et les données sont isolées entre comptes afin de respecter le
        principe de moindre privilège.
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>
        7. Durée de conservation
      </h2>
      <p>
        Les données sont conservées tant que votre compte ou votre événement
        reste actif. En cas de suppression ou de clôture, les données associées
        peuvent être supprimées conformément à nos procédures internes et à la
        législation applicable.
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>8. Vos droits</h2>
      <p>
        Vous disposez d’un droit d’accès, de rectification, d’opposition, de
        suppression et de limitation du traitement, dans les conditions prévues
        par la réglementation en vigueur. Pour exercer ces droits,
        contactez-nous à l’adresse ci-dessus.
      </p>

      <h2 className='mt-6 text-lg font-semibold text-ink'>9. Modifications</h2>
      <p>
        Cette politique peut être mise à jour afin d’aligner la plateforme avec
        ses fonctionnalités, les besoins des utilisateurs ou les évolutions
        réglementaires.
      </p>
    </InfoPage>
  )
}
