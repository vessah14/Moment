import InfoPage from '../components/layout/InfoPage'

export default function Support() {
  return (
    <InfoPage title="Support"
      description="Besoin d'aide pour créer le site de votre événement ? Questions fréquentes et contact de l'équipe TBF Moment."
      path='/support'>
      <p>
        Une question sur la création de votre événement, la facturation ou
        une fonctionnalité ? Notre équipe vous répond.
      </p>
      <p>
        E-mail :{' '}
        <a
          href="mailto:support@tbfmoment.com"
          className="text-brand-purple hover:underline"
        >
          support@tbfmoment.com
        </a>
      </p>
      <p>
        Pour les demandes urgentes le jour de votre événement (check-in,
        billetterie), un support prioritaire est disponible sur les plans
        Business et Event Pro.
      </p>
    </InfoPage>
  )
}
