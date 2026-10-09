import InfoPage from '../components/layout/InfoPage'

export default function TermsOfService() {
  return (
    <InfoPage title="Conditions générales d'utilisation"
      description="Conditions générales d'utilisation de TBF Moment, la plateforme de création de sites d'événements."
      path='/cgu'>
      <p className="text-xs text-faint">Dernière mise à jour : [à compléter par TBF Moment]</p>

      <h2 className="mt-6 text-lg font-semibold text-ink">1. Objet</h2>
      <p>
        Les présentes conditions régissent l'accès et l'utilisation de TBF Moment, plateforme
        permettant de créer, personnaliser et publier un site web dédié à un événement (mariage,
        conférence, anniversaire...), de gérer une liste d'invités et de suivre leur présence.
      </p>

      <h2 className="mt-6 text-lg font-semibold text-ink">2. Création de compte</h2>
      <p>
        L'utilisation de TBF Moment nécessite la création d'un compte organisateur avec un email et
        un mot de passe d'au moins 8 caractères. Vous êtes responsable de la confidentialité de vos
        identifiants et de toute activité effectuée depuis votre compte.
      </p>

      <h2 className="mt-6 text-lg font-semibold text-ink">3. Contenu que vous publiez</h2>
      <p>
        Vous restez propriétaire du contenu que vous ajoutez à votre événement (textes, photos,
        listes d'invités). En publiant un événement, vous nous autorisez à l'héberger et à
        l'afficher publiquement à l'adresse dédiée que la plateforme génère, jusqu'à ce que vous le
        dépubliez ou supprimiez votre compte.
      </p>
      <p>
        Vous vous engagez à ne pas publier de contenu illicite, et à disposer des autorisations
        nécessaires pour les données de vos invités (nom, email, téléphone) que vous importez ou
        saisissez dans la plateforme.
      </p>

      <h2 className="mt-6 text-lg font-semibold text-ink">4. Abonnements et tarifs</h2>
      <p>
        Les formules et tarifs affichés sur la page{' '}
        <a href="/tarifs" className="text-brand-purple hover:underline">Tarifs</a> décrivent les
        fonctionnalités incluses par plan. <strong>À ce jour, la plateforme ne prélève aucun paiement
        en ligne automatique</strong> : la souscription à un plan est enregistrée sur votre compte,
        et le règlement s'effectue selon les modalités communiquées séparément par TBF Moment. [TBF
        Moment : remplacer ce paragraphe dès qu'un moyen de paiement en ligne est intégré, en
        précisant échéance de facturation, moyens de paiement acceptés, et politique de
        remboursement/résiliation.]
      </p>

      <h2 className="mt-6 text-lg font-semibold text-ink">5. Billetterie</h2>
      <p>
        Le module « Billetterie » permet à l'organisateur d'enregistrer manuellement les billets
        vendus (nom et email de l'acheteur) et d'afficher les tarifs sur la page publique de
        l'événement. <strong>La plateforme ne traite aucun paiement de billet en ligne</strong> :
        l'organisateur reste seul responsable de la vente et de l'encaissement auprès de ses
        acheteurs.
      </p>

      <h2 className="mt-6 text-lg font-semibold text-ink">6. Disponibilité</h2>
      <p>
        Nous mettons en œuvre des moyens raisonnables pour assurer la disponibilité de la
        plateforme, sans garantie d'absence totale d'interruption.
      </p>

      <h2 className="mt-6 text-lg font-semibold text-ink">7. Suspension et résiliation</h2>
      <p>
        TBF Moment peut suspendre un compte ou un événement en cas de contenu signalé ou de
        violation des présentes conditions. Vous pouvez supprimer votre compte à tout moment en nous
        contactant à{' '}
        <a href="mailto:contact@tbfmoment.com" className="text-brand-purple hover:underline">
          contact@tbfmoment.com
        </a>
        .
      </p>

      <h2 className="mt-6 text-lg font-semibold text-ink">8. Données personnelles</h2>
      <p>
        Le traitement de vos données et de celles de vos invités est décrit dans notre{' '}
        <a href="/confidentialite" className="text-brand-purple hover:underline">
          politique de confidentialité
        </a>
        .
      </p>

      <h2 className="mt-6 text-lg font-semibold text-ink">9. Contact</h2>
      <p>
        Pour toute question relative à ces conditions, contactez{' '}
        <a href="mailto:contact@tbfmoment.com" className="text-brand-purple hover:underline">
          contact@tbfmoment.com
        </a>
        . Voir aussi nos{' '}
        <a href="/mentions-legales" className="text-brand-purple hover:underline">
          mentions légales
        </a>
        .
      </p>
    </InfoPage>
  )
}
