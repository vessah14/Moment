import InfoPage from '../components/layout/InfoPage'

const H2 = ({ children }) => <h2 className='mt-6 text-lg font-semibold text-ink'>{children}</h2>
const Mail = () => (
  <a href='mailto:contact@tbfmoment.com' className='text-brand-purple hover:underline'>
    contact@tbfmoment.com
  </a>
)

export default function PrivacyPolicy () {
  return (
    <InfoPage title='Politique de confidentialité'
      path='/confidentialite'>
      <p className='text-xs text-faint'>
        Dernière mise à jour : 21 octobre 2026
      </p>

      <H2>En bref</H2>
      <ul className='list-disc space-y-1 pl-5'>
        <li>Nous ne vendons aucune donnée et il n’y a pas de publicité sur les pages d’événement.</li>
        <li>Nous ne voyons jamais vos codes Mobile Money : le paiement passe par SasPay.</li>
        <li>Les données de vos invités ne servent qu’à votre événement.</li>
        <li>Vous pouvez à tout moment demander l’accès à vos données, leur correction ou leur effacement : <Mail />.</li>
      </ul>

      <H2>1. Responsable du traitement</H2>
      <p>
        TBF Moment est édité par TBF DIGITAL (Douala, Cameroun), responsable du traitement des
        données collectées via la plateforme et les services associés. Pour toute question,
        écrivez-nous à <Mail />.
      </p>

      <H2>2. Qui est responsable de quoi</H2>
      <ul className='list-disc space-y-1 pl-5'>
        <li>
          Pour les <strong>comptes organisateurs</strong>, les abonnements et la sécurité de la
          plateforme, TBF DIGITAL est responsable du traitement.
        </li>
        <li>
          Pour les <strong>listes d’invités</strong> d’un événement (noms, téléphones, réponses,
          places), c’est l’<strong>organisateur</strong> qui décide de ce qu’il collecte. TBF Moment
          agit pour son compte et n’utilise ces données que pour faire fonctionner son événement.
        </li>
      </ul>
      <p>
        Invité, vous voulez qu’on retire votre nom d’une liste ? Vous pouvez le demander à
        l’organisateur, ou directement à nous : nous transmettrons et agirons.
      </p>

      <H2>3. Données collectées</H2>
      <ul className='list-disc space-y-1 pl-5'>
        <li>
          <strong>Organisateur</strong> : nom, adresse e-mail, téléphone, informations de compte,
          logo, contenus publiés, offre souscrite et historique des paiements (référence, montant,
          date).
        </li>
        <li>
          <strong>Connexion avec Google</strong> : si vous choisissez cette option, nous recevons
          votre nom et votre adresse e-mail, jamais votre mot de passe.
        </li>
        <li>
          <strong>Invités</strong> : nom, téléphone ou e-mail s’ils sont ajoutés par
          l’organisateur, réponse, nombre de places, table, messages du livre d’or, réservations de
          cadeaux et entrées enregistrées le jour J.
        </li>
        <li>
          <strong>Tous</strong> : adresse IP, type d’appareil et journaux techniques, pour la
          sécurité (limitation des tentatives de connexion, lutte contre les abus) et la correction
          des pannes.
        </li>
      </ul>
      <p>
        Nous ne collectons pas de données sensibles. Certaines pages en laissent toutefois deviner
        (une célébration religieuse, des obsèques) : elles ne servent qu’à afficher l’événement.
      </p>

      <H2>4. Finalités du traitement</H2>
      <ul className='list-disc space-y-1 pl-5'>
        <li>créer et sécuriser votre compte</li>
        <li>gérer les événements et leurs invités</li>
        <li>afficher les pages publiques de vos événements</li>
        <li>envoyer les e-mails et invitations déclenchés par vous</li>
        <li>gérer les abonnements et leur facturation</li>
        <li>assurer la sécurité, la stabilité et la prévention des abus</li>
      </ul>

      <H2>5. Base légale</H2>
      <ul className='list-disc space-y-1 pl-5'>
        <li><strong>Le contrat</strong> : fournir le service à l’organisateur.</li>
        <li><strong>Le consentement</strong> : pour les cookies optionnels et les messages que vous acceptez de recevoir.</li>
        <li><strong>L’obligation légale</strong> : conserver les pièces comptables.</li>
        <li><strong>L’intérêt légitime</strong> : sécuriser la plateforme et prévenir la fraude.</li>
      </ul>

      <H2>6. Avec qui elles sont partagées</H2>
      <p>
        Nous ne vendons ni ne louons aucune donnée. Elles ne sont partagées qu’avec les services
        strictement nécessaires au fonctionnement de la plateforme :
      </p>
      <ul className='list-disc space-y-1 pl-5'>
        <li><strong>L’organisateur</strong> de l’événement, pour les réponses et les entrées de ses invités ;</li>
        <li><strong>SasPay</strong>, pour le paiement des abonnements ;</li>
        <li><strong>Brevo</strong>, pour l’envoi des e-mails (confirmation, invitations, rappels) ;</li>
        <li><strong>Cloudinary</strong>, pour le stockage des photos et logos ;</li>
        <li><strong>Google</strong>, uniquement si vous l’utilisez pour vous connecter ;</li>
        <li><strong>Google Traduction</strong>, uniquement si un visiteur utilise le bouton de traduction ;</li>
        <li>nos hébergeurs (serveurs et base de données) ;</li>
        <li>les autorités, seulement sur demande légale.</li>
      </ul>

      <H2>7. Données hors du Cameroun</H2>
      <p>
        Certains de ces prestataires traitent des données hors du Cameroun. Nous les choisissons
        pour leur niveau de protection (chiffrement, engagements contractuels), dans le respect de
        la loi n° 2024/017 du 23 décembre 2024 relative à la protection des données à caractère
        personnel.
      </p>

      <H2>8. Sécurité</H2>
      <ul className='list-disc space-y-1 pl-5'>
        <li>connexions chiffrées (HTTPS) sur tout le site ;</li>
        <li>mots de passe stockés sous forme hachée, adresse e-mail vérifiée à l’inscription ;</li>
        <li>sessions qui expirent automatiquement et nombre de tentatives de connexion limité ;</li>
        <li>données isolées entre comptes : un organisateur ne voit jamais les données d’un autre ;</li>
        <li>QR codes uniques pour éviter les faux pass.</li>
      </ul>
      <p>
        En cas de fuite de données qui vous concerne, nous prévenons l’Autorité de protection des
        données et les personnes touchées dans les meilleurs délais.
      </p>

      <H2>9. Durée de conservation</H2>
      <p>
        Les données sont conservées tant que votre compte ou votre événement reste actif. À la
        suppression d’un compte, les événements et les listes d’invités sont effacés, sauf les
        données que la loi nous oblige à garder : les factures et transactions sont conservées
        10 ans (obligation comptable OHADA). Les journaux techniques sont conservés pour une durée
        limitée, le temps nécessaire à la sécurité de la plateforme.
      </p>

      <H2>10. Vos droits</H2>
      <p>
        Vous pouvez à tout moment accéder à vos données, les faire corriger ou effacer, vous
        opposer à leur utilisation ou retirer votre consentement.
      </p>
      <ul className='list-disc space-y-1 pl-5'>
        <li><strong>Export</strong> : téléchargez vos données depuis Paramètres, « Données et export ».</li>
        <li><strong>Désactivation</strong> : depuis Paramètres, « Supprimer le compte ».</li>
        <li><strong>Suppression complète</strong> ou toute autre demande : écrivez à <Mail /> en précisant l’événement concerné.</li>
      </ul>
      <p>
        Nous répondons sous 30 jours au plus et pouvons vous demander de prouver votre identité.
        Si notre réponse ne vous satisfait pas, vous pouvez saisir l’Autorité de protection des
        données à caractère personnel du Cameroun.
      </p>

      <H2>11. Enfants</H2>
      <p>
        TBF Moment ne s’adresse pas directement aux enfants. Pour un anniversaire d’enfant, un
        baptême ou une fête scolaire, c’est l’organisateur adulte ou l’établissement qui crée la
        page et décide des photos publiées : il s’engage à avoir l’accord des parents. Un parent
        peut demander le retrait d’une photo de son enfant à tout moment.
      </p>

      <H2>12. Cookies</H2>
      <p>
        Les cookies et le stockage local utilisés sont décrits dans notre{' '}
        <a href='/cookies' className='text-brand-purple hover:underline'>politique cookies</a>.
      </p>

      <H2>13. Modifications</H2>
      <p>
        Cette politique peut être mise à jour pour suivre l’évolution de la plateforme ou de la
        réglementation. En cas de changement important, nous vous prévenons par e-mail ou dans
        votre espace.
      </p>
    </InfoPage>
  )
}
