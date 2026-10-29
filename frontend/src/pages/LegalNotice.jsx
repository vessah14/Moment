import InfoPage from '../components/layout/InfoPage'

const H2 = ({ children }) => <h2 className='mt-6 text-lg font-semibold text-ink'>{children}</h2>
const Mail = () => (
  <a href='mailto:contact@tbfmoment.com' className='text-brand-purple hover:underline'>
    contact@tbfmoment.com
  </a>
)

// Informations d'entreprise encore inconnues : affichées telles quelles jusqu'à ce que
// TBF DIGITAL les fournisse (forme juridique, adresse, RCCM, NIU, hébergeur).
const TODO = 'à compléter'

export default function LegalNotice () {
  return (
    <InfoPage title='Mentions légales'
      path='/mentions-legales'>
      <p className='text-xs text-faint'>
        Dernière mise à jour : 21 octobre 2026
      </p>

      <H2>1. Éditeur du site</H2>
      <p>
        Le site tbfmoment.com et la plateforme TBF Moment, qui permet la création, la
        personnalisation et la gestion d'événements numériques, sont édités par :
      </p>
      <ul className='list-disc space-y-1 pl-5'>
        <li><strong>Entreprise</strong> : TBF DIGITAL</li>
        <li><strong>Forme juridique</strong> : {TODO}</li>
        <li><strong>Siège</strong> : {TODO}, Douala, Cameroun</li>
        <li><strong>RCCM</strong> : {TODO}</li>
        <li><strong>NIU</strong> : {TODO}</li>
        <li><strong>Directeur de la publication</strong> : Francklin Tedjong Boudjiko</li>
        <li><strong>E-mail</strong> : <Mail /></li>
        <li><strong>WhatsApp</strong> : +237 680 26 40 60</li>
      </ul>

      <H2>2. Hébergement</H2>
      <p>
        Hébergeur de la plateforme et de la base de données : {TODO}. Les photos et logos sont
        stockés chez Cloudinary.
      </p>

      <H2>3. Paiements</H2>
      <p>
        Les paiements Mobile Money (Orange Money, MTN Mobile Money) des abonnements sont traités
        par <strong>SasPay</strong>, prestataire de paiement. TBF Moment ne voit et ne
        conserve jamais vos codes secrets.
      </p>

      <H2>4. Protection des données</H2>
      <p>
        Chaque organisation dispose d'un espace isolé : les données de vos invités et de vos
        événements ne sont jamais partagées entre comptes. Le traitement des données est décrit
        dans notre{' '}
        <a href='/confidentialite' className='text-brand-purple hover:underline'>
          politique de confidentialité
        </a>
        .
      </p>

      <H2>5. Propriété intellectuelle</H2>
      <p>
        La marque TBF Moment, son logo, les modèles de pages, les illustrations, les animations,
        les ambiances musicales et le code de la plateforme appartiennent à TBF DIGITAL. Toute
        reproduction en dehors de l'usage normal du service est interdite sans accord écrit.
      </p>
      <p>
        Les textes, photos et logos ajoutés par les organisateurs restent leur propriété ; ils
        restent seuls responsables de leur publication (voir les{' '}
        <a href='/cgu' className='text-brand-purple hover:underline'>
          conditions générales d'utilisation
        </a>
        ).
      </p>

      <H2>6. Signaler un contenu</H2>
      <p>
        Une page d'événement vous semble illicite, frauduleuse, ou publie vos données sans votre
        accord ? Écrivez à <Mail /> en indiquant le lien de la page et le motif. Nous accusons
        réception sous 48 heures ouvrées et pouvons suspendre la page pendant l'examen.
      </p>

      <H2>7. Textes applicables</H2>
      <p>Le site est soumis au droit camerounais, notamment :</p>
      <ul className='list-disc space-y-1 pl-5'>
        <li>la loi n° 2010/021 du 21 décembre 2010 régissant le commerce électronique au Cameroun ;</li>
        <li>la loi n° 2010/012 du 21 décembre 2010 relative à la cybersécurité et à la cybercriminalité ;</li>
        <li>la loi n° 2024/017 du 23 décembre 2024 relative à la protection des données à caractère personnel.</li>
      </ul>
    </InfoPage>
  )
}
