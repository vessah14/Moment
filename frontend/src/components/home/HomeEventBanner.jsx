const OCCASIONS = [
  'Mariage',
  'Dot',
  'Anniversaire',
  'Baptême',
  'Baby shower',
  'Obsèques',
  'Retrait de deuil',
  'Remise des diplômes',
  'Journée culturelle',
  'Portes ouvertes',
  'Kermesse',
  'Conférence',
  'Séminaire',
  'Lancement de produit',
  "Soirée d'entreprise",
  'Concert',
  'Tournoi',
  'Journée citoyenne',
  'Noël',
  'Nouvel An',
  'Saint-Valentin',
  'Pâques',
  'Aïd',
  '20 mai',
  'Fête des mères',
  'Réunion familiale',
  'Crémaillère',
  'Culte et veillée',
]

const RIBBON_MARKS = ['triangle', 'diamond', 'circle', 'dots', 'lines']

function DecorativeMarks () {
  return (
    <div className='home-event-ribbon-track' aria-hidden='true'>
      {[0, 1].map((copy) => (
        <div className='home-event-ribbon-set' key={copy}>
          {RIBBON_MARKS.map((mark) => (
            <svg
              className={`home-event-ribbon-mark home-event-ribbon-mark-${mark}`}
              key={`${copy}-${mark}`}
              viewBox='0 0 40 40'
              focusable='false'
            >
              {mark === 'triangle' && <path d='M4 35 20 5l16 30Z' />}
              {mark === 'diamond' && <path d='m20 3 17 17-17 17L3 20Z' />}
              {mark === 'circle' && <circle cx='20' cy='20' r='14' />}
              {mark === 'dots' && (
                <>
                  <circle cx='8' cy='20' r='3' />
                  <circle cx='20' cy='20' r='3' />
                  <circle cx='32' cy='20' r='3' />
                </>
              )}
              {mark === 'lines' && (
                <>
                  <path d='M8 7v26M20 7v26M32 7v26' />
                  <path d='M5 10h30M5 30h30' />
                </>
              )}
            </svg>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function HomeEventBanner () {
  return (
    <section className='home-event-banner' aria-label="Types d'événements">
      <p className='home-event-banner-label'>Un modèle pour chaque occasion</p>
      <div className='home-event-ticker'>
        <div className='home-event-ticker-track'>
          {[...OCCASIONS, ...OCCASIONS].map((occasion, index) => (
            <span
              className='home-event-ticker-item'
              key={`${occasion}-${index}`}
              aria-hidden={index >= OCCASIONS.length || undefined}
            >
              {occasion}
              <span className='home-event-ticker-separator' aria-hidden='true'>
                +
              </span>
            </span>
          ))}
        </div>
      </div>
      <div className='home-event-ribbon' aria-hidden='true'>
        <DecorativeMarks />
      </div>
    </section>
  )
}
