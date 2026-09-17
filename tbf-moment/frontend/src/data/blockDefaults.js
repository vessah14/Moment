export const BLOCK_CONTENT_DEFAULTS = {
  Rebours: {
    heading: 'Le grand jour approche',
    body: '',
    showHeading: false,
    tinted: false,
  },
  Histoire: {
    heading: 'Notre Histoire',
    body: "Après de nombreuses années d'aventures partagées, de voyages inoubliables et de projets construits à deux, nous avons décidé de franchir une nouvelle étape. Nous avons hâte d'écrire cette nouvelle page de notre vie à vos côtés.",
    showHeading: true,
    tinted: false,
  },
  Programme: {
    heading: 'Le Programme de la Journée',
    body: '',
    showHeading: true,
    tinted: true,
    items: [
      {
        time: '14h00',
        title: 'Cérémonie',
        location: "L'Église de Chartres",
        description:
          "La célébration solennelle de notre union, merci d'arriver 15 minutes en avance.",
      },
      {
        time: '15h30',
        title: 'Cocktail',
        location: 'Les Jardins d’Honneur',
        description:
          'Rafraîchissements, animations musicales et séance photo sous les vérrières.',
      },
      {
        time: '18h00',
        title: 'Dîner',
        location: 'La Grande Galerie',
        description: 'Un dîner gastronomique célébrant la cuisine locale et de saison.',
      },
      {
        time: '21h00',
        title: 'Soirée Dansante',
        location: 'Le Salon Royal de Cristal',
        description: "Ouverture du bal, rythmes DJ jusqu'au bout de la nuit.",
      },
      {
        time: '01h00',
        title: 'Brunch Lendemain',
        location: "L'Orangerie",
        description: 'Une formule décontractée pour débriefer les meilleurs moments de la veille.',
      },
    ],
  },
  Galerie: {
    heading: 'Galerie Photos',
    body: '',
    showHeading: true,
    tinted: false,
    photoCount: 8,
  },
  Intervenants: {
    heading: 'Nos Témoins & Demoiselles d’Honneur',
    body: '',
    showHeading: true,
    tinted: true,
    people: [
      { name: 'Julien Bernard', role: 'Témoin du Marié' },
      { name: 'Camille Roussel', role: 'Témoin de la Mariée' },
      { name: 'Léa Fournier', role: 'Demoiselle d’Honneur' },
      { name: 'Antoine Mercier', role: 'Garçon d’Honneur' },
    ],
  },
  Localisation: {
    heading: 'Comment Nous Rejoindre',
    body: '',
    showHeading: true,
    tinted: false,
    address: 'Château de Versailles, Place d’Armes, 78000 Versailles, France',
    transport:
      "RER C direction Versailles Rive Gauche à 10 min de marche, Ligne 171 pour d'autres liaisons en gare parisiennes.",
  },
  RSVP: {
    heading: 'Confirmez Votre Présence',
    body: '',
    showHeading: true,
    tinted: true,
  },
  "Livre d'or": {
    heading: "Le Livre d'Or",
    body: '',
    showHeading: true,
    tinted: false,
    entries: [
      {
        name: 'Marie & Paul',
        role: 'Il y a 2 jours',
        message:
          'Tellement fière de partager ce moment magique avec vous ! Le Château est un choix magnifique.',
      },
      {
        name: 'Oncle Bernard',
        role: 'Il y a 4 jours',
        message: 'Félicitations aux futurs mariés ! Hâte de venir célébrer la famille.',
      },
      {
        name: 'Sophie (Témoin)',
        role: 'Il y a 6 jours',
        message: 'La joie de vous voir vous dire oui ! Love you both.',
      },
    ],
  },
  FAQ: {
    heading: 'Foire Aux Questions',
    body: '',
    showHeading: true,
    tinted: false,
    items: [
      {
        question: 'Quel est le Dress Code recommandé ?',
        answer:
          "Le Dress Code est Tenue de Soirée Chic. Les tons de beige, cuivre et champagne sont particulièrement les bienvenus pour s'accorder avec le thème.",
      },
      {
        question: 'Y a-t-il un parking réservé aux invités ?',
        answer:
          'Oui, un parking gratuit et surveillé est à votre disposition directement sur le domaine.',
      },
      {
        question: 'Des hébergements sont-ils disponibles à proximité ?',
        answer:
          'Plusieurs hôtels partenaires proposent des tarifs préférentiels — la liste vous sera envoyée avec votre invitation.',
      },
      {
        question: 'Quelle est votre politique concernant les cadeaux ?',
        answer:
          'Votre présence est le plus beau des cadeaux. Pour celles et ceux qui le souhaitent, une cagnotte est disponible dans la section Liste de mariage.',
      },
    ],
  },
  Vidéo: {
    heading: 'Vidéo',
    body: 'Intégrez une vidéo de présentation, un teaser ou un souvenir filmé.',
    showHeading: true,
    tinted: false,
  },
  'Plan de table': {
    heading: 'Plan de table',
    body: 'Organisez vos invités par table pour la réception.',
    showHeading: true,
    tinted: false,
  },
  Billetterie: {
    heading: 'Billetterie',
    body: '',
    showHeading: true,
    tinted: false,
    tiers: [
      { name: 'Standard', price: '25 000 FCFA' },
      { name: 'VIP', price: '60 000 FCFA' },
    ],
  },
  'Pied de page': {
    heading: '',
    body: '',
    showHeading: false,
    tinted: false,
  },
}

export const THEME_PRESETS = [
  {
    name: 'Élégant',
    color: '#d6b36a',
    font: 'Playfair Display + Inter',
    darkOverlay: true,
  },
  {
    name: 'Moderne',
    color: '#6549e8',
    font: 'Plus Jakarta Sans + DM Sans',
    darkOverlay: true,
  },
  {
    name: 'Festif',
    color: '#ff7a3d',
    font: 'Plus Jakarta Sans + DM Sans',
    darkOverlay: false,
  },
  {
    name: 'Minimal',
    color: '#f8f9fc',
    font: 'Inter + Inter',
    darkOverlay: true,
  },
]
