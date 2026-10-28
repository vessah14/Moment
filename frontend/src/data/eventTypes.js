// Univers et types d'événement de l'assistant de création (repris du prototype : types.js).
// - logo : 'required' (organisation : école, entreprise), 'suggested' (souvent une
//   organisation) ou 'optional' (événement privé : les initiales suffisent) ;
// - templates : modèles premium conseillés (theme de data/templates.js), le premier par défaut ;
// - categoryCode : catégorie enregistrée côté serveur (table event_categories) ;
// - date : jour fixe (MM-JJ) proposé pour les fêtes qui reviennent chaque année ;
// - kicker : surtitre de la page, au lieu du libellé du type ;
// - shareIntro : début du message WhatsApp, suivi du nom de l'événement.

const VOEUX_INTRO = 'Vous êtes invité·e à la cérémonie de présentation des vœux de'

export const EVENT_UNIVERSES = [
  { id: 'prives', label: 'Événements privés', icon: 'heart', hint: 'Mariages, anniversaires, baptêmes' },
  { id: 'ecoles', label: 'Écoles', icon: 'cap', hint: 'Graduations, cérémonies, journées portes ouvertes' },
  { id: 'entreprises', label: 'Entreprises et associations', icon: 'briefcase', hint: 'Conférences, séminaires, soirées, concerts, tournois' },
  { id: 'fetes', label: 'Fêtes et saisons', icon: 'gift', hint: 'Noël, Nouvel An, Saint-Valentin, Pâques, Aïd' },
]

export const EVENT_TYPES = [
  { id: 'mariage', univers: 'prives', label: 'Mariage et fiançailles', icon: 'heart', logo: 'optional', categoryCode: 'mariage', templates: ['noor', 'bloom', 'toghu', 'ndop'] },
  { id: 'anniversaire', univers: 'prives', label: 'Anniversaire et célébration', icon: 'cake', logo: 'optional', categoryCode: 'anniversaire', templates: ['fiesta', 'prestige'] },
  { id: 'noces', univers: 'prives', label: 'Anniversaire de mariage', icon: 'heart', logo: 'optional', categoryCode: 'anniversaire', templates: ['prestige', 'bloom'] },
  { id: 'bapteme', univers: 'prives', label: 'Baptême et cérémonie familiale', icon: 'baby', logo: 'optional', categoryCode: 'bapteme', templates: ['nuage'] },
  { id: 'baby-shower', univers: 'prives', label: 'Baby shower et naissance', icon: 'baby', logo: 'optional', categoryCode: 'baby_shower', templates: ['douceur', 'nuage'] },
  { id: 'communion', univers: 'prives', label: 'Communion et confirmation', icon: 'church', logo: 'optional', categoryCode: 'evenement_religieux', templates: ['nuage', 'grace'] },
  { id: 'reunion-familiale', univers: 'prives', label: 'Réunion familiale', icon: 'users', logo: 'optional', categoryCode: 'reunion_familiale', templates: ['racines'] },
  { id: 'cremaillere', univers: 'prives', label: 'Pendaison de crémaillère', icon: 'home', logo: 'optional', categoryCode: 'soiree_privee', templates: ['fiesta', 'velvet'] },
  { id: 'soiree-privee', univers: 'prives', label: 'Soirée et événement privé', icon: 'party', logo: 'optional', categoryCode: 'soiree_privee', templates: ['velvet'] },
  { id: 'religieux', univers: 'prives', label: 'Événement religieux', icon: 'church', logo: 'suggested', categoryCode: 'evenement_religieux', templates: ['grace'] },
  { id: 'obseques', univers: 'prives', label: 'Obsèques, commémoration et hommage', icon: 'flower', logo: 'optional', categoryCode: 'obseques', templates: ['memoire'] },
  { id: 'retrait-deuil', univers: 'prives', label: 'Retrait de deuil', icon: 'flower', logo: 'optional', categoryCode: 'retrait_deuil', templates: ['souvenir'] },

  { id: 'graduation', univers: 'ecoles', label: 'Graduation et remise de diplômes', icon: 'cap', logo: 'required', categoryCode: 'graduation', templates: ['toge'] },
  { id: 'scolaire', univers: 'ecoles', label: 'Journée culturelle et événement étudiant', icon: 'school', logo: 'required', categoryCode: 'evenement_scolaire', templates: ['campus'] },
  { id: 'portes-ouvertes', univers: 'ecoles', label: 'Rentrée et journée portes ouvertes', icon: 'school', logo: 'required', categoryCode: 'evenement_scolaire', templates: ['campus', 'summit'] },
  { id: 'voeux-ecole', univers: 'ecoles', label: "Présentation des vœux de l'établissement", kicker: 'Présentation des vœux', icon: 'school', logo: 'required', categoryCode: 'evenement_scolaire', templates: ['envol', 'campus'], shareIntro: VOEUX_INTRO },
  { id: 'kermesse', univers: 'ecoles', label: "Kermesse et fête de fin d'année", icon: 'party', logo: 'required', categoryCode: 'evenement_scolaire', templates: ['campus', 'fiesta'] },

  { id: 'conference', univers: 'entreprises', label: 'Conférence, séminaire et atelier', icon: 'briefcase', logo: 'required', categoryCode: 'conference', templates: ['summit'] },
  { id: 'entreprise', univers: 'entreprises', label: "Événement d'entreprise", icon: 'award', logo: 'required', categoryCode: 'evenement_entreprise', templates: ['horizon', 'envol'] },
  { id: 'voeux', univers: 'entreprises', label: 'Présentation des vœux en entreprise', kicker: 'Présentation des vœux', icon: 'award', logo: 'required', categoryCode: 'evenement_entreprise', templates: ['envol', 'horizon'], shareIntro: VOEUX_INTRO },
  { id: 'voeux-administration', univers: 'entreprises', label: 'Présentation des vœux en administration', kicker: 'Présentation des vœux', icon: 'award', logo: 'required', categoryCode: 'evenement_entreprise', templates: ['envol'], shareIntro: VOEUX_INTRO },
  { id: 'lancement', univers: 'entreprises', label: 'Lancement de produit, salon ou foire', icon: 'sparkle', logo: 'required', categoryCode: 'evenement_entreprise', templates: ['horizon', 'summit'] },
  { id: 'concert', univers: 'entreprises', label: 'Concert et spectacle', icon: 'music', logo: 'suggested', categoryCode: 'concert', templates: ['live'] },
  { id: 'sport', univers: 'entreprises', label: 'Compétition et événement sportif', icon: 'trophy', logo: 'suggested', categoryCode: 'competition_sportive', templates: ['arena'] },
  { id: 'personnalise', univers: 'entreprises', label: 'Événement personnalisé', icon: 'sparkle', logo: 'suggested', categoryCode: 'personnalise', templates: ['atelier'] },
  { id: 'autre', univers: 'entreprises', label: 'Autre', icon: 'sparkle', logo: 'suggested', categoryCode: 'autre', templates: ['libre'] },

  { id: 'noel', univers: 'fetes', label: 'Noël et arbre de Noël', icon: 'gift', logo: 'suggested', categoryCode: 'fetes_saisons', date: '12-25', templates: ['noel'] },
  { id: 'nouvel-an', univers: 'fetes', label: 'Nouvel An et réveillon', icon: 'party', logo: 'optional', categoryCode: 'fetes_saisons', date: '12-31', templates: ['minuit', 'velvet'] },
  { id: 'saint-valentin', univers: 'fetes', label: 'Saint-Valentin', icon: 'heart', logo: 'suggested', categoryCode: 'fetes_saisons', date: '02-14', templates: ['coeur'] },
  { id: 'aid', univers: 'fetes', label: 'Aïd el-Fitr et Tabaski', icon: 'moon', logo: 'optional', categoryCode: 'fetes_saisons', templates: ['hilal'] },
  { id: 'paques', univers: 'fetes', label: 'Pâques', icon: 'church', logo: 'suggested', categoryCode: 'fetes_saisons', templates: ['aurore'] },
  { id: 'fete-nationale', univers: 'fetes', label: 'Fête nationale du 20 mai', icon: 'star', logo: 'suggested', categoryCode: 'fetes_saisons', date: '05-20', templates: ['unite'] },
  { id: 'fete-des-meres', univers: 'fetes', label: 'Fête des mères', icon: 'flower', logo: 'suggested', categoryCode: 'fetes_saisons', templates: ['maman'] },
]

export const LOGO_POLICY = {
  required: 'Obligatoire',
  suggested: 'Recommandé',
  optional: 'Facultatif',
}

export const eventType = (id) => EVENT_TYPES.find((t) => t.id === id) ?? null

// Type d'un événement existant : celui enregistré, sinon le premier de sa catégorie.
export function eventTypeFor(typeId, categoryCode) {
  return eventType(typeId) ?? EVENT_TYPES.find((t) => t.categoryCode === categoryCode) ?? null
}

// Prochaine occurrence d'une fête à date fixe (AAAA-MM-JJ), à partir d'aujourd'hui.
export function nextFixedDate(mmdd, today = new Date()) {
  if (!/^\d{2}-\d{2}$/.test(mmdd ?? '')) return ''
  const pad = (n) => String(n).padStart(2, '0')
  const iso = (y) => `${y}-${mmdd}`
  const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  return iso(today.getFullYear()) >= todayIso ? iso(today.getFullYear()) : iso(today.getFullYear() + 1)
}
