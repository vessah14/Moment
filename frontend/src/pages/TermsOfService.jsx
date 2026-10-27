import InfoPage from '../components/layout/InfoPage'

const H2 = ({ children }) => <h2 className='mt-6 text-lg font-semibold text-ink'>{children}</h2>
const H3 = ({ children }) => <h3 className='mt-4 font-semibold text-ink'>{children}</h3>
const Mail = () => (
  <a href='mailto:contact@tbfmoment.com' className='text-brand-purple hover:underline'>
    contact@tbfmoment.com
  </a>
)

export default function TermsOfService () {
  return (
    <InfoPage
      title="Conditions générales d'utilisation"
      description="Conditions générales d'utilisation de TBF Moment, la plateforme de création de sites d'événements."
      path='/cgu'
    >
      <p className='text-xs text-faint'>
        Dernière mise à jour : 21 octobre 2026
      </p>

      <H2>1. Objet</H2>
      <p>
        Les présentes conditions régissent l'accès et l'utilisation de TBF Moment, plateforme
        éditée par TBF DIGITAL permettant de créer, personnaliser et publier un site web dédié à
        un événement (mariage, dot, anniversaire, conférence, obsèques…), de gérer une liste
        d'invités, de suivre leurs réponses et d'accueillir les invités le jour J avec un pass QR.
      </p>
      <p>
        En créant un compte ou en utilisant une page d'événement, vous acceptez ces conditions.
      </p>

      <H2>2. Qui est qui</H2>
      <ul className='list-disc space-y-1 pl-5'>
        <li><strong>Organisateur</strong> : la personne ou la structure (famille, école, entreprise, association, église…) qui crée et gère un événement.</li>
        <li><strong>Invité</strong> : toute personne qui consulte une page d'événement, y répond ou achète un billet.</li>
        <li><strong>Agent d'accueil</strong> : la personne autorisée par l'organisateur à scanner les pass à l'entrée.</li>
      </ul>

      <H2>3. Création de compte</H2>
      <p>
        L'utilisation de TBF Moment nécessite un compte organisateur, créé avec une adresse e-mail
        et un mot de passe d'au moins 8 caractères, ou avec un compte Google.
        L'adresse e-mail doit être confirmée avant la première connexion. Vous devez avoir au
        moins 18 ans, ou agir avec l'accord d'un parent ou au nom d'une structure.
      </p>
      <p>
        Vous êtes responsable de la confidentialité de vos identifiants et de toute activité
        effectuée depuis votre compte. Prévenez-nous sans délai en cas d'usage frauduleux.
      </p>

      <H2>4. Contenu que vous publiez</H2>
      <p>
        Vous restez propriétaire du contenu que vous ajoutez à votre événement (textes, photos,
        logos, listes d'invités). En publiant un événement, vous nous autorisez à l'héberger, à
        l'afficher publiquement à l'adresse dédiée que la plateforme génère et à l'adapter
        (formats, aperçus de partage), jusqu'à ce que vous le dépubliiez ou supprimiez votre
        compte.
      </p>
      <p>Vous garantissez avoir le droit de publier ce contenu, notamment :</p>
      <ul className='list-disc space-y-1 pl-5'>
        <li>le logo d'une école, d'une entreprise ou d'une association : vous devez être autorisé à la représenter ;</li>
        <li>les photos de personnes, en particulier d'enfants : vous devez avoir leur accord ou celui de leurs parents ;</li>
        <li>les données de vos invités (nom, e-mail, téléphone) que vous importez ou saisissez.</li>
      </ul>
      <p>
        Sont interdits les contenus illicites, haineux, violents, pornographiques, trompeurs ou
        portant atteinte à la vie privée d'autrui, les faux événements, les collectes d'argent
        frauduleuses et l'usage du nom ou du logo d'une structure sans autorisation.
      </p>

      <H2>5. Abonnements et tarifs</H2>
      <p>
        Les formules et tarifs affichés sur la page{' '}
        <a href='/tarifs' className='text-brand-purple hover:underline'>Tarifs</a>{' '}
        décrivent les fonctionnalités incluses par offre. Les prix sont indiqués en francs CFA.
      </p>
      <ul className='list-disc space-y-1 pl-5'>
        <li>L'offre Free est gratuite, sans limite de durée, dans les limites indiquées.</li>
        <li>
          Les offres payantes sont réglées par Mobile Money (MTN Mobile Money, Orange Money) sur la
          page de paiement sécurisée de KPay. L'offre est activée dès la confirmation du
          paiement, pour un mois.
        </li>
        <li>
          Les abonnements ne sont pas renouvelés automatiquement : à l'échéance, le compte repasse
          à l'offre Free, sauf nouveau paiement.
        </li>
        <li>
          Un changement d'offre démarre immédiatement une nouvelle période d'un mois. Le mois en
          cours n'est pas remboursé au prorata.
        </li>
      </ul>
      <p>
        Nous pouvons modifier nos prix. Un changement s'applique au plus tôt au paiement suivant.
      </p>

      <H2>6. Billetterie</H2>
      <p>
        Le module « Billetterie » permet à l'organisateur de définir ses catégories de billets,
        d'enregistrer les billets vendus et d'afficher les tarifs sur la page publique de
        l'événement.{' '}
        <strong>La plateforme ne traite aucun paiement de billet en ligne</strong> :
        l'organisateur est le vendeur. Il fixe les prix, le nombre de places et les conditions
        d'accès, et reste seul responsable de la vente et de l'encaissement auprès de ses
        acheteurs.
      </p>
      <H3>Annulation et remboursement</H3>
      <ul className='list-disc space-y-1 pl-5'>
        <li>Si l'événement est annulé, l'organisateur rembourse les acheteurs selon les modalités qu'il a annoncées.</li>
        <li>Si l'événement est reporté, le billet reste en principe valable à la nouvelle date.</li>
        <li>Toute demande de remboursement s'adresse à l'organisateur, pas à TBF Moment.</li>
      </ul>
      <H3>Pass d'entrée</H3>
      <p>
        Chaque pass porte un QR code unique, valable pour le nombre de places indiqué. Un pass
        déjà utilisé est signalé au scanner : seul le premier passage est accepté. L'organisateur
        et ses agents d'accueil peuvent refuser l'entrée à une personne qui présente un pass déjà
        utilisé ou qui n'est pas le sien.
      </p>

      <H2>7. Invitations et relances</H2>
      <ul className='list-disc space-y-1 pl-5'>
        <li>
          L'organisateur n'invite que des personnes qu'il connaît et qui peuvent raisonnablement
          s'attendre à recevoir son invitation. Les envois de masse à des listes achetées ou
          récupérées sont interdits.
        </li>
        <li>
          Les invitations et relances WhatsApp partent du téléphone de l'organisateur, qui doit
          respecter les règles de WhatsApp.
        </li>
      </ul>

      <H2>8. Cagnottes et listes de cadeaux</H2>
      <p>
        Les numéros Mobile Money affichés dans la rubrique cadeaux sont ceux de l'organisateur ou
        d'une personne qu'il désigne. Les contributions vont directement sur ces numéros, sans
        passer par TBF Moment, qui n'est donc pas responsable de leur usage. En cas de doute sur
        une page, signalez-la à <Mail />.
      </p>

      <H2>9. Disponibilité et responsabilité</H2>
      <p>
        Nous mettons en œuvre des moyens raisonnables pour assurer la disponibilité et la sécurité
        de la plateforme, en particulier le jour de votre événement, sans garantie d'absence
        totale d'interruption (maintenance, panne d'un prestataire ou d'un opérateur).
      </p>
      <ul className='list-disc space-y-1 pl-5'>
        <li>Notre responsabilité est limitée aux dommages directs et plafonnée aux sommes que vous nous avez payées au cours des 12 derniers mois.</li>
        <li>Nous ne sommes pas responsables du déroulement de l'événement lui-même, qui relève de l'organisateur.</li>
      </ul>

      <H2>10. Suspension et suppression du compte</H2>
      <p>
        Vous pouvez désactiver votre compte à tout moment depuis Paramètres, « Supprimer le
        compte ». Pour une suppression complète de vos événements et de vos listes d'invités,
        écrivez à <Mail /> : elles sont alors effacées, sauf les données que la loi nous oblige à
        garder (factures, transactions).
      </p>
      <p>
        TBF Moment peut retirer un contenu ou suspendre un compte ou un événement en cas de
        contenu signalé, de manquement grave à ces conditions, de fraude ou à la demande d'une
        autorité.
      </p>

      <H2>11. Données personnelles</H2>
      <p>
        Le traitement de vos données et de celles de vos invités est décrit dans notre{' '}
        <a href='/confidentialite' className='text-brand-purple hover:underline'>
          politique de confidentialité
        </a>
        .
      </p>

      <H2>12. Modifications et droit applicable</H2>
      <p>
        Nous pouvons modifier ces conditions. En cas de changement important, les organisateurs
        sont prévenus par e-mail ou dans leur espace au moins 15 jours avant son entrée en
        vigueur.
      </p>
      <p>
        Ces conditions sont régies par le droit camerounais. En cas de désaccord, écrivez-nous
        d'abord à <Mail /> pour chercher une solution amiable. À défaut, les tribunaux compétents
        de Douala seront saisis.
      </p>

      <H2>13. Contact</H2>
      <p>
        Pour toute question relative à ces conditions, contactez <Mail />. Voir aussi nos{' '}
        <a href='/mentions-legales' className='text-brand-purple hover:underline'>
          mentions légales
        </a>
        .
      </p>
    </InfoPage>
  )
}
