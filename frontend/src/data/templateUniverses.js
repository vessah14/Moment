// Les quatre univers de modèles : regroupent les catégories (champ `category` de
// data/templates.js). Utilisés par la galerie /modeles (filtres, ?categorie=<id>) et par
// la section « Pour qui ? » de l'accueil.
export const TEMPLATE_UNIVERSES = [
  {
    id: 'prive',
    label: 'Événements privés',
    description: 'Mariage, dot, anniversaire, baptême, baby shower, crémaillère, obsèques, retrait de deuil.',
    color: '#FF7A9A',
    categories: [
      'Mariage',
      'Anniversaire',
      'Baptême',
      'Religieux',
      'Hommage',
      'Familial',
      'Soirée privée',
      'Personnalisé',
      'Autre',
      'Baby shower',
      'Retrait de deuil',
    ],
  },
  {
    id: 'ecoles',
    label: 'Écoles',
    description: "Remise des diplômes, journée culturelle, portes ouvertes, kermesse. Avec le logo de l'établissement.",
    color: '#5A8CF0',
    categories: ['Scolaire', 'Graduation'],
  },
  {
    id: 'entreprises',
    label: 'Entreprises et associations',
    description: 'Conférence, séminaire, lancement, soirée annuelle, concert, tournoi, journée citoyenne.',
    color: '#F5C451',
    categories: ['Professionnel', 'Conférence', 'Concert', 'Sport'],
  },
  {
    id: 'saisons',
    label: 'Fêtes et saisons',
    description: 'Noël, Nouvel An, Saint-Valentin, Pâques, Aïd, 20 mai, fête des mères. Chaque année, au bon moment.',
    color: '#3DD68C',
    categories: ['Fêtes'],
  },
]
