import InfoPage from '../components/layout/InfoPage'

export default function PrivacyPolicy() {
  return (
    <InfoPage title="Politique de confidentialité">
      <p className="text-xs text-faint">Dernière mise à jour : [à compléter par TBF Moment]</p>

      <h2 className="mt-6 text-lg font-semibold text-ink">1. Qui traite vos données</h2>
      <p>
        TBF Moment (« nous ») édite la plateforme permettant de créer, personnaliser et publier
        des sites d'événements. Pour toute question relative à cette politique ou à vos données,
        contactez{' '}
        <a href="mailto:contact@tbfmoment.com" className="text-brand-purple hover:underline">
          contact@tbfmoment.com
        </a>
        .
      </p>
      <p>
        Deux rôles distincts existent sur la plateforme : l'<strong>organisateur</strong> (titulaire
        d'un compte TBF Moment, qui crée un événement) et l'<strong>invité</strong> (personne tierce
        que l'organisateur ajoute à son événement). Pour les données d'invités, l'organisateur est
        responsable du traitement vis-à-vis des personnes qu'il invite ; TBF Moment agit en tant que
        prestataire technique qui héberge et traite ces données pour le compte de l'organisateur.
      </p>

      <h2 className="mt-6 text-lg font-semibold text-ink">2. Données collectées</h2>
      <p><strong>Compte organisateur :</strong> nom complet, adresse email, mot de passe (stocké
        sous forme de hachage, jamais en clair), numéro de téléphone.</p>
      <p><strong>Événement :</strong> nom, date, lieu, description, image de couverture, et le
        contenu des blocs que vous composez (programme, galerie, livre d'or, billetterie...).</p>
      <p><strong>Invités :</strong> nom, email et/ou téléphone renseignés par l'organisateur ou par
        l'invité lui-même (réponse à une invitation, message au livre d'or, réservation d'un cadeau,
        achat d'un billet).</p>
      <p><strong>Technique :</strong> un jeton de connexion (JWT) est conservé dans le stockage local
        de votre navigateur (localStorage) pour maintenir votre session — il n'est pas transmis à des
        tiers et disparaît à la déconnexion ou à l'expiration.</p>

      <h2 className="mt-6 text-lg font-semibold text-ink">3. Pourquoi ces données sont traitées</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Créer et sécuriser votre compte, vous authentifier</li>
        <li>Faire fonctionner votre site d'événement et l'afficher publiquement lorsque vous le publiez</li>
        <li>Permettre à vos invités de confirmer leur présence, signer votre livre d'or ou réserver un cadeau</li>
        <li>Vous envoyer les emails que vous déclenchez vous-même (invitations, campagnes, réinitialisation de mot de passe)</li>
        <li>Assurer la sécurité de la plateforme (limitation du nombre de tentatives de connexion, détection d'abus)</li>
      </ul>
      <p>Nous ne vendons aucune donnée et ne faisons aucun profilage publicitaire.</p>

      <h2 className="mt-6 text-lg font-semibold text-ink">4. Isolation entre organisateurs</h2>
      <p>
        Chaque compte organisateur dispose d'un espace isolé au niveau de la base de données : un
        organisateur ne peut techniquement pas accéder aux événements, invités ou données d'un autre
        organisateur.
      </p>

      <h2 className="mt-6 text-lg font-semibold text-ink">5. Durée de conservation</h2>
      <p>
        Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte
        ou d'événement, les données associées (invités, blocs, galerie, réponses) sont supprimées
        avec l'entité correspondante. [TBF Moment : préciser ici un délai de conservation après
        clôture de compte si vous en définissez un.]
      </p>

      <h2 className="mt-6 text-lg font-semibold text-ink">6. Vos droits</h2>
      <p>
        Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Un
        organisateur peut modifier ou supprimer les données d'un invité directement depuis son
        tableau de bord. Pour toute demande que vous ne pouvez pas effectuer vous-même (par exemple
        en tant qu'invité souhaitant faire supprimer votre réponse ou votre message), écrivez à{' '}
        <a href="mailto:contact@tbfmoment.com" className="text-brand-purple hover:underline">
          contact@tbfmoment.com
        </a>
        .
      </p>

      <h2 className="mt-6 text-lg font-semibold text-ink">7. Sécurité</h2>
      <p>
        Les mots de passe sont hachés, les connexions sont protégées par jeton avec révocation
        immédiate en cas de changement de mot de passe, et chaque rôle d'accès à la base de données
        est cloisonné selon le principe du moindre privilège.
      </p>

      <h2 className="mt-6 text-lg font-semibold text-ink">8. Modifications</h2>
      <p>
        Cette politique peut évoluer avec les fonctionnalités de la plateforme. La date de mise à
        jour en haut de cette page reflète la dernière révision.
      </p>
    </InfoPage>
  )
}
