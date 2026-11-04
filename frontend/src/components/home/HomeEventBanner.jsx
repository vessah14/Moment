import { t } from '../../i18n'
const OCCASIONS = [
  t("Mariage"),
  t("Dot"),
  t("Anniversaire"),
  t("Baptême"),
  t("Baby shower"),
  t("Obsèques"),
  t("Retrait de deuil"),
  t("Remise des diplômes"),
  t("Journée culturelle"),
  t("Portes ouvertes"),
  t("Kermesse"),
  t("Conférence"),
  t("Séminaire"),
  t("Lancement de produit"),
  t("Soirée d'entreprise"),
  t("Concert"),
  t("Tournoi"),
  t("Journée citoyenne"),
  t("Noël"),
  t("Nouvel An"),
  t("Saint-Valentin"),
  t("Pâques"),
  t("Aïd"),
  t("20 mai"),
  t("Fête des mères"),
  t("Réunion familiale"),
  t("Crémaillère"),
  t("Culte et veillée"),
]

const RIBBON_OCCASIONS = [
  t("Mariage"),
  t("Dot"),
  t("Anniversaire"),
  t("Remise des diplômes"),
  t("Conférence"),
  t("Concert"),
  t("Baptême"),
  t("Noël"),
  t("Journée culturelle"),
  t("Retrait de deuil"),
  t("20 mai"),
  t("Saint-Valentin"),
]

const PATTERN_TYPES = ['toghu', 'ndop', 'wax', 'kente']

function Pattern({ type }) {
  return (
    <svg viewBox='0 0 92 46' aria-hidden='true'>
      {type === 'toghu' && (
        <>
          <path d='M0 46 23 6 46 46M46 46 69 6 92 46' />
          <path className='home-event-pattern-fill' d='M15 46 23 32 31 46M61 46 69 32 77 46' />
        </>
      )}
      {type === 'ndop' && (
        <>
          <path d='M23 6 40 23 23 40 6 23zM69 6 86 23 69 40 52 23z' />
          <path d='M19 23h8M23 19v8M65 23h8M69 19v8' />
        </>
      )}
      {type === 'wax' && (
        <>
          <circle cx='23' cy='23' r='15' />
          <circle className='home-event-pattern-fill' cx='23' cy='23' r='7' />
          <circle className='home-event-pattern-dash' cx='69' cy='23' r='15' />
          <circle className='home-event-pattern-fill' cx='69' cy='23' r='3' />
        </>
      )}
      {type === 'kente' && (
        <>
          <path d='M8 8h24v30H8zM60 8h24v30H60z' />
          <path d='M8 18h24M8 28h24M68 8v30M76 8v30' />
          <path className='home-event-pattern-accent' d='m46 12 4 11-4 11-4-11z' />
        </>
      )}
    </svg>
  )
}

function PatternRibbon() {
  return (
    <div className='home-event-ribbon-track home-event-pattern-ribbon'>
      {Array.from({ length: 24 }, (_, index) => (
        <Pattern
          key={index}
          type={PATTERN_TYPES[index % PATTERN_TYPES.length]}
        />
      ))}
    </div>
  )
}

function OccasionRibbon() {
  return (
    <div className='home-event-ribbon-track home-event-occasion-ribbon'>
      {[...RIBBON_OCCASIONS, ...RIBBON_OCCASIONS].map((occasion, index) => (
        <span key={`${occasion}-${index}`}>
          {occasion}
          <i aria-hidden='true'>✦</i>
        </span>
      ))}
    </div>
  )
}

export default function HomeEventBanner() {
  return (
    <>
      <section className='home-event-strip' aria-label={t("Types d'événements")}>
        <p>{t("Un modèle pour chaque occasion")}</p>
        <div className='home-event-marquee'>
          <div className='home-event-marquee-track'>
            {[...OCCASIONS, ...OCCASIONS].map((occasion, index) => (
              <span
                key={`${occasion}-${index}`}
                aria-hidden={index >= OCCASIONS.length || undefined}
              >
                {occasion}
              </span>
            ))}
          </div>
        </div>
      </section>
      <div className='home-event-ribbons' aria-hidden='true'>
        <PatternRibbon />
        <OccasionRibbon />
      </div>
    </>
  )
}
