import InfoPage from '../components/layout/InfoPage'

export default function LegalNotice() {
  return (
    <InfoPage title="Mentions légales">
      <p>
        TBF Moment est un service édité par TBF, plateforme événementielle
        permettant la création, la personnalisation et la gestion
        d'événements numériques.
      </p>
      <p>
        Chaque organisation dispose d'un espace isolé : les données de vos
        invités et de vos événements ne sont jamais partagées entre comptes.
      </p>
      <p>
        Pour toute question relative à vos données personnelles ou à
        l'utilisation du service, contactez{' '}
        <a
          href="mailto:contact@tbfmoment.com"
          className="text-brand-purple hover:underline"
        >
          contact@tbfmoment.com
        </a>
        .
      </p>
    </InfoPage>
  )
}
