// Musique d'ambiance des sites d'événement, générée en direct (components/site/themes/effects.js).
// Chaque événement a la sienne : choix de l'organisateur dans le Builder, sinon celle du modèle
// premium, sinon un style adapté au type d'événement.
export const MUSIC_STYLES = [
  { id: 'harpe', label: 'Harpe · douce et élégante' },
  { id: 'balafon', label: 'Balafon · rythme africain' },
  { id: 'kalimba', label: 'Kalimba · joyeuse' },
  { id: 'lounge', label: 'Lounge · chic et détendue' },
  { id: 'pulse', label: 'Pulse · festive et dansante' },
  { id: 'clochettes', label: 'Clochettes · fêtes et enfance' },
  { id: 'recueil', label: 'Recueillement · sobre' },
]

// Valeur enregistrée pour « pas de musique » (une valeur vide veut dire « automatique »).
export const NO_MUSIC = 'none'

const BY_EVENT_TYPE = {
  mariage: 'harpe',
  noces: 'harpe',
  communion: 'harpe',
  'saint-valentin': 'harpe',
  'fete-des-meres': 'harpe',
  anniversaire: 'kalimba',
  'baby-shower': 'kalimba',
  cremaillere: 'kalimba',
  kermesse: 'kalimba',
  bapteme: 'clochettes',
  noel: 'clochettes',
  paques: 'clochettes',
  'reunion-familiale': 'balafon',
  scolaire: 'balafon',
  aid: 'balafon',
  'fete-nationale': 'balafon',
  religieux: 'recueil',
  obseques: 'recueil',
  'retrait-deuil': 'recueil',
  graduation: 'pulse',
  lancement: 'pulse',
  concert: 'pulse',
  sport: 'pulse',
  'nouvel-an': 'pulse',
}

const isStyle = (value) => MUSIC_STYLES.some((style) => style.id === value)

export function resolveEventMusic({ choice, themeMusic, eventType } = {}) {
  if (choice === NO_MUSIC) return null
  if (isStyle(choice)) return choice
  if (isStyle(themeMusic)) return themeMusic
  return BY_EVENT_TYPE[eventType] ?? 'lounge'
}
