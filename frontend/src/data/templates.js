// `preview` décrit la miniature dessinée par TemplatePreview : ce sont les couleurs du
// modèle lui-même, indépendantes du thème clair/sombre de l'interface.
// `blocks` est la composition de page (hors Hero, toujours présent) créée pour un
// nouvel événement basé sur ce modèle ; les noms sont ceux de la BlockLibrary du Builder.
// `presentation` règle la mise en page du mini-site public (Hero, arrondis des sections).
const RAW_TEMPLATES = [
  // Modèles premium : rendu dédié (components/site/themes), sélectionné par `theme`.
  {
    name: "Noor",
    theme: "noor",
    sourceModel: "noor.html",
    category: "Mariage",
    categoryCode: "mariage",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Mariage",
    description: "Émeraude, ivoire et or. Pour un mariage élégant, civil, religieux ou les deux.",
    features: [{"label":"Ouverture","text":"enveloppe scellée qui s'ouvre et libère la carte"},{"label":"Fond","text":"poussière d'or flottante, motif étoile à huit branches"},{"label":"Modules","text":"histoire, programme, 2 lieux, tenue, plan de table, galerie, liste de mariage, livre d’or, RSVP"}],
    preview: {
      bg: "#0C2620",
      ink: "#F6F0E3",
      accent: "#D9B46A",
      serif: true,
      eyebrow: "Ensemble, pour la vie",
      title: "Awa & Ibrahim",
      date: "14 mars 2027 · Dakar"
    },
    blocks: ["Histoire","Programme","Localisation","Dress code","Plan de table","Galerie","Cadeaux","Livre d'or","RSVP","Pied de page"],
    presentation: {
      heroAlign: "center",
      heroHeight: "32rem",
      panelRadius: "1rem"
    }
  },
  {
    name: "Bloom",
    theme: "bloom",
    sourceModel: "bloom.html",
    category: "Mariage",
    categoryCode: "mariage",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Mariage",
    description: "Rose poudré et vert sauge. Pour un mariage champêtre, fleuri et lumineux.",
    features: [{"label":"Ouverture","text":"une fleur éclot et libère l'invitation"},{"label":"Fond","text":"pétales qui tombent, couronne de feuillage qui pousse"},{"label":"Modules","text":"histoire, programme, 2 lieux, tenue, plan de table, galerie, liste de mariage, livre d’or, RSVP et pass QR"}],
    preview: {
      bg: "#FBF3EF",
      ink: "#3A2A2E",
      accent: "#B5616E",
      serif: true,
      eyebrow: "Le printemps de notre amour",
      title: "Grâce & Junior",
      date: "24 avril 2027 · Douala"
    },
    blocks: ["Histoire","Programme","Localisation","Dress code","Plan de table","Galerie","Cadeaux","Livre d'or","RSVP","Pied de page"],
    presentation: {
      heroAlign: "center",
      heroHeight: "32rem",
      panelRadius: "1rem"
    }
  },
  {
    name: "Toghu Royal",
    theme: "toghu",
    sourceModel: "toghu.html",
    category: "Mariage",
    categoryCode: "mariage",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Dot",
    description: "Velours noir et broderies du toghu. Pour la dot et le mariage coutumier.",
    features: [{"label":"Ouverture","text":"rideau brodé qui s'écarte autour du médaillon"},{"label":"Fond","text":"étincelles aux couleurs du toghu, motif brodé"},{"label":"Modules","text":"les deux familles, programme, lieu, tenue, messages aux familles, RSVP"}],
    preview: {
      bg: "#0E0C0C",
      ink: "#F4EDE1",
      accent: "#E9B526",
      serif: true,
      eyebrow: "Mariage coutumier · Dot",
      title: "Mireille & Patrick",
      date: "16 janv. 2027 · Bafoussam"
    },
    blocks: ["Rebours","Familles","Programme","Localisation","Dress code","Galerie","Livre d'or","RSVP","Pied de page"],
    presentation: {
      heroAlign: "center",
      heroHeight: "32rem",
      panelRadius: "1rem"
    }
  },
  {
    name: "Ndop",
    theme: "ndop",
    sourceModel: "ndop.html",
    category: "Mariage",
    categoryCode: "mariage",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Dot",
    description: "Bleu indigo et motifs blancs du tissu Ndop des Grassfields. Pour une dot à l’Ouest.",
    features: [{"label":"Ouverture","text":"un médaillon tourne puis la page s’ouvre en cercle"},{"label":"Fond","text":"étoiles scintillantes, losanges qui se dessinent"},{"label":"Modules","text":"les deux familles, programme, galerie, bénédictions, RSVP, pass QR"}],
    preview: {
      bg: "#14213D",
      ink: "#F3F1EA",
      accent: "#E0B04B",
      serif: true,
      eyebrow: "Mariage traditionnel · Dot",
      title: "Rosine & Arnaud",
      date: "20 févr. 2027 · Dschang"
    },
    blocks: ["Rebours","Familles","Programme","Localisation","Dress code","Galerie","Livre d'or","RSVP","Pied de page"],
    presentation: {
      heroAlign: "center",
      heroHeight: "32rem",
      panelRadius: "1rem"
    }
  },
  {
    name: "Fiesta",
    theme: "fiesta",
    sourceModel: "fiesta.html",
    category: "Anniversaire",
    categoryCode: "anniversaire",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Anniversaire",
    description: "Couleurs vives et gros chiffre de l'âge. Pour les anniversaires qui se fêtent en grand.",
    features: [{"label":"Ouverture","text":"cadeau qui s'ouvre dans une pluie de confettis"},{"label":"Fond","text":"ballons qui montent, motif confettis"},{"label":"Modules","text":"programme, lieu, tenue, galerie, cagnotte Mobile Money, mur des vœux et RSVP"}],
    preview: {
      bg: "#FFF6EE",
      ink: "#2A1640",
      accent: "#6C4BF4",
      eyebrow: "On fait la fête",
      title: "Les 30 ans de Manuella",
      date: "21 nov. · Douala"
    },
    blocks: ["Rebours","Programme","Localisation","Dress code","Galerie","Cadeaux","Livre d'or","RSVP","Pied de page"],
    presentation: {
      heroAlign: "center",
      heroHeight: "32rem",
      panelRadius: "1rem"
    }
  },
  {
    name: "Prestige",
    theme: "prestige",
    sourceModel: "prestige.html",
    category: "Anniversaire",
    categoryCode: "anniversaire",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Anniversaire",
    description: "Noir et or façon gala Art déco. Pour un anniversaire chic : 40, 50, 60 ans.",
    features: [{"label":"Ouverture","text":"rideau à éventails Art déco"},{"label":"Fond","text":"paillettes d'or, soleil rayonnant, musique lounge"},{"label":"Modules","text":"parcours, dîner de gala, plan de table, cadeau commun, pass QR"}],
    preview: {
      bg: "#0D0D0F",
      ink: "#F4ECD8",
      accent: "#D4AF61",
      eyebrow: "Soirée de gala",
      title: "Les 50 ans de Jean-Claude",
      date: "30 janv. 2027 · Douala"
    },
    blocks: ["Rebours","Histoire","Programme","Localisation","Dress code","Plan de table","Galerie","Cadeaux","Livre d'or","RSVP","Pied de page"],
    presentation: {
      heroAlign: "center",
      heroHeight: "32rem",
      panelRadius: "1rem"
    }
  },
  // Modèles premium des autres catégories (maquettes arena, live, summit, horizon…).
  {
    name: "Arena",
    theme: "arena",
    sourceModel: "arena.html",
    category: "Sport",
    categoryCode: "competition_sportive",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Compétition sportive",
    description: "Nuit de stade et lignes du terrain, pour un tournoi, une finale ou une course.",
    features: [
      { label: "Ouverture", text: "billet à détacher pour entrer dans le stade" },
      { label: "Fond", text: "confettis, lignes du terrain qui se dessinent" },
      { label: "Modules", text: "billetterie par tribune, programme du match, partenaires, FAQ" }
    ],
    preview: {
      bg: "#0B1020",
      ink: "#F2F5FF",
      accent: "#FFD23F",
      accent2: "#E63946",
      font: "\"Bebas Neue\", sans-serif",
      eyebrow: "Finale · Coupe des Entreprises",
      title: "Wouri FC vs Kotto",
      date: "27 mars 2027 · Douala"
    },
    blocks: ["Rebours", "Programme", "Billetterie", "Localisation", "Galerie", "Partenaires", "FAQ", "Pied de page"],
    headings: { Billetterie: "Choisissez votre tribune", Partenaires: "Partenaires du tournoi", FAQ: "Questions fréquentes" },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  {
    name: "Live",
    theme: "live",
    sourceModel: "live.html",
    category: "Concert",
    categoryCode: "concert",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Concert",
    description: "Scène sombre et faisceaux de projecteurs, pour un concert ou un spectacle.",
    features: [
      { label: "Ouverture", text: "billet à détacher, comme à l’entrée de la salle" },
      { label: "Fond", text: "étincelles, faisceaux de projecteurs qui s’allument" },
      { label: "Modules", text: "line-up d’artistes, billetterie (fosse, gradins, carré or), partenaires" }
    ],
    preview: {
      bg: "#09060F",
      ink: "#FBF7FF",
      accent: "#FF3D7F",
      accent2: "#2EE6D6",
      font: "\"Big Shoulders Display\", sans-serif",
      eyebrow: "Douala Live Sessions",
      title: "LIVE",
      date: "13 févr. 2027 · Douala"
    },
    blocks: ["Rebours", "Intervenants", "Programme", "Billetterie", "Localisation", "Galerie", "Partenaires", "FAQ", "Pied de page"],
    headings: { Intervenants: "Line-up", Billetterie: "Choisissez votre place", FAQ: "Questions fréquentes" },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  {
    name: "Summit",
    theme: "summit",
    sourceModel: "summit.html",
    category: "Conférence",
    categoryCode: "conference",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Conférence",
    description: "Clair et structuré, pour une conférence, un séminaire ou un atelier.",
    features: [
      { label: "Ouverture", text: "badge participant à prendre pour entrer" },
      { label: "Fond", text: "réseau de points qui se dessine, motif grille" },
      { label: "Modules", text: "intervenants, agenda, pass étudiant / standard / pro, partenaires" }
    ],
    preview: {
      bg: "#F6F7F9",
      ink: "#0E1726",
      accent: "#2346D6",
      accent2: "#0EA5A0",
      font: "\"Sora\", sans-serif",
      eyebrow: "Forum de Douala 2027",
      title: "Tech & IA",
      date: "18 mai 2027 · Douala"
    },
    blocks: ["Rebours", "Intervenants", "Programme", "Billetterie", "Localisation", "Partenaires", "FAQ", "Pied de page"],
    headings: { Billetterie: "Choisissez votre pass", FAQ: "Questions fréquentes" },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  {
    name: "Horizon",
    theme: "horizon",
    sourceModel: "horizon.html",
    category: "Professionnel",
    categoryCode: "evenement_entreprise",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Événement d’entreprise",
    description: "Bleu profond et élégant, pour une soirée d’entreprise, un lancement ou un séminaire interne.",
    features: [
      { label: "Ouverture", text: "ouverture en cercle autour du logo" },
      { label: "Fond", text: "lignes d’horizon qui se dessinent, musique lounge" },
      { label: "Modules", text: "mot de la direction, programme, tenue, FAQ, réponse" }
    ],
    preview: {
      bg: "#0A1628",
      ink: "#EEF3FA",
      accent: "#4FB3FF",
      accent2: "#F2B84B",
      font: "\"Syne\", sans-serif",
      eyebrow: "10 ans · Soirée annuelle",
      title: "Wouri Logistics",
      date: "11 juin 2027 · Douala"
    },
    blocks: ["Rebours", "Intervenants", "Programme", "Localisation", "Dress code", "Galerie", "FAQ", "RSVP", "Pied de page"],
    headings: {
      Intervenants: "Le mot de la direction",
      "Dress code": "Tenue de soirée",
      FAQ: "Questions fréquentes",
      RSVP: "Confirmez votre présence"
    },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  {
    name: "Nuage",
    theme: "nuage",
    sourceModel: "nuage.html",
    category: "Baptême",
    categoryCode: "bapteme",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Baptême",
    description: "Bleu ciel et beige, doux et tendre, pour un baptême ou une cérémonie familiale.",
    features: [
      { label: "Ouverture", text: "enveloppe scellée" },
      { label: "Fond", text: "bulles qui montent, nuages dessinés" },
      { label: "Modules", text: "parrain et marraine, liste de naissance, livre d’or, réponse" }
    ],
    preview: {
      bg: "#F3F7FB",
      ink: "#24334A",
      accent: "#4A7FB5",
      accent2: "#E3B7A0",
      font: "\"Sacramento\", cursive",
      eyebrow: "Baptême",
      title: "Maëlle",
      date: "6 déc. 2026 · Douala"
    },
    blocks: ["Rebours", "Familles", "Programme", "Localisation", "Dress code", "Galerie", "Cadeaux", "Livre d'or", "RSVP", "Pied de page"],
    headings: {
      Familles: "Parrain et marraine",
      "Dress code": "Tenue claire",
      Cadeaux: "Liste de naissance",
      "Livre d'or": "Petits mots",
      RSVP: "Serez-vous là ?"
    },
    content: {
      Familles: {
        a: { label: "La marraine", name: "", text: "" },
        b: { label: "Le parrain", name: "", text: "" }
      }
    },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  {
    name: "Grâce",
    theme: "grace",
    sourceModel: "grace.html",
    category: "Religieux",
    categoryCode: "evenement_religieux",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Événement religieux",
    description: "Lumière douce et ton recueilli, pour un culte, une communion ou une action de grâce.",
    features: [
      { label: "Ouverture", text: "une bougie qu’on allume avant d’entrer" },
      { label: "Fond", text: "rayons de lumière dorés, musique recueillie" },
      { label: "Modules", text: "programme du culte, tenue, prières et témoignages, réponse" }
    ],
    preview: {
      bg: "#FBF8F2",
      ink: "#2B2418",
      accent: "#9B7424",
      accent2: "#5B7DB1",
      font: "\"Great Vibes\", cursive",
      eyebrow: "Culte d’action de grâce",
      title: "Mbarga",
      date: "9 janv. 2027 · Douala"
    },
    blocks: ["Rebours", "Programme", "Localisation", "Dress code", "Galerie", "Livre d'or", "RSVP", "Pied de page"],
    headings: { "Dress code": "Tenue de fête", "Livre d'or": "Prières et témoignages", RSVP: "Serez-vous présent·e ?" },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  {
    name: "Campus",
    theme: "campus",
    sourceModel: "campus.html",
    category: "Scolaire",
    categoryCode: "evenement_scolaire",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Événement scolaire",
    description: "Couleurs d’école et énergie de campus, pour une journée culturelle, une kermesse ou un gala étudiant.",
    features: [
      { label: "Ouverture", text: "badge étudiant à prendre pour entrer" },
      { label: "Fond", text: "confettis, motif à pois" },
      { label: "Modules", text: "jury et invités, concours, billets à petit prix, partenaires" }
    ],
    preview: {
      bg: "#FFF8EC",
      ink: "#1D1A33",
      accent: "#2F3DCC",
      accent2: "#FF6B35",
      font: "\"Lilita One\", sans-serif",
      eyebrow: "Journée culturelle · IUGET",
      title: "2027",
      date: "19 mars 2027 · Douala"
    },
    blocks: ["Rebours", "Intervenants", "Programme", "Billetterie", "Localisation", "Galerie", "Partenaires", "FAQ", "Pied de page"],
    headings: { Intervenants: "Jury et invités", Billetterie: "Billets", FAQ: "Questions fréquentes" },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  {
    name: "Toge",
    theme: "toge",
    sourceModel: "toge.html",
    category: "Graduation",
    categoryCode: "graduation",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Remise des diplômes",
    description: "Bleu académique et or, pour une remise de diplômes ou une soutenance.",
    features: [
      { label: "Ouverture", text: "sceau du diplôme à briser" },
      { label: "Fond", text: "couronne de laurier qui se dessine, paillettes" },
      { label: "Modules", text: "marraine et major de promotion, tenue, félicitations, réponse" }
    ],
    preview: {
      bg: "#0E1B33",
      ink: "#F5F1E6",
      accent: "#D6B35E",
      accent2: "#E9D9A6",
      font: "\"Cinzel\", serif",
      eyebrow: "Remise des diplômes 2027",
      title: "Promotion Excellence",
      date: "10 juil. 2027 · Douala"
    },
    blocks: ["Rebours", "Intervenants", "Programme", "Localisation", "Dress code", "Galerie", "Livre d'or", "RSVP", "Pied de page"],
    headings: {
      Intervenants: "Personnalités",
      "Dress code": "Tenue de cérémonie",
      "Livre d'or": "Félicitations",
      RSVP: "Confirmez votre venue"
    },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  {
    name: "Mémoire",
    theme: "memoire",
    sourceModel: "memoire.html",
    category: "Hommage",
    categoryCode: "obseques",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Hommage",
    description: "Sobre et apaisé, pour des obsèques, une commémoration ou un hommage.",
    features: [
      { label: "Ouverture", text: "une bougie qu’on allume" },
      { label: "Fond", text: "lueurs discrètes, aucune animation festive" },
      { label: "Modules", text: "biographie, programme des obsèques, condoléances, soutien à la famille" }
    ],
    preview: {
      bg: "#1C1D20",
      ink: "#ECE8E1",
      accent: "#D9C9A3",
      accent2: "#9DB0C9",
      font: "\"EB Garamond\", serif",
      eyebrow: "1948 – 2026",
      title: "Joseph Ekwalla",
      date: "7 nov. 2026 · Douala"
    },
    blocks: ["Rebours", "Histoire", "Programme", "Localisation", "Dress code", "Galerie", "Cadeaux", "Livre d'or", "RSVP", "Pied de page"],
    headings: {
      Histoire: "Sa vie",
      Programme: "Programme des obsèques",
      "Dress code": "Tenue sombre",
      Galerie: "Souvenirs",
      Cadeaux: "Soutenir la famille",
      "Livre d'or": "Registre de condoléances",
      RSVP: "Signaler votre présence"
    },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  {
    name: "Racines",
    theme: "racines",
    sourceModel: "racines.html",
    category: "Familial",
    categoryCode: "evenement_familial",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Réunion familiale",
    description: "Terre cuite et feuillage, pour des retrouvailles ou une réunion de famille.",
    features: [
      { label: "Ouverture", text: "rideau qui s’écarte" },
      { label: "Fond", text: "feuilles qui tombent, arbre qui pousse" },
      { label: "Modules", text: "arbre de famille, t-shirts par branche, plan de table, cotisation" }
    ],
    preview: {
      bg: "#F7F1E8",
      ink: "#2C2117",
      accent: "#A4471F",
      accent2: "#4F7A3A",
      font: "\"Lora\", serif",
      eyebrow: "Retrouvailles 2027",
      title: "Ngando",
      date: "14 août 2027 · Kribi"
    },
    blocks: ["Rebours", "Histoire", "Programme", "Localisation", "Dress code", "Plan de table", "Galerie", "Cadeaux", "Livre d'or", "RSVP", "Pied de page"],
    headings: {
      Histoire: "Notre arbre",
      "Dress code": "Couleur de votre branche",
      Cadeaux: "La cotisation",
      "Livre d'or": "Messages de la famille",
      RSVP: "Inscris-toi"
    },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  {
    name: "Velvet",
    theme: "velvet",
    sourceModel: "velvet.html",
    category: "Soirée privée",
    categoryCode: "soiree_privee",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Soirée privée",
    description: "Nuit et blanc nacré, pour une soirée privée, un réveillon ou une pool party.",
    features: [
      { label: "Ouverture", text: "invitation-billet strictement personnelle" },
      { label: "Fond", text: "paillettes, motif Art déco" },
      { label: "Modules", text: "dress code, FAQ, réponse, pass QR à l’entrée" }
    ],
    preview: {
      bg: "#0B0B10",
      ink: "#FAF7F2",
      accent: "#F3E6D0",
      accent2: "#C9A86A",
      font: "\"Italiana\", serif",
      eyebrow: "All White · Réveillon",
      title: "31.12",
      date: "31 déc. 2026 · Douala"
    },
    blocks: ["Rebours", "Programme", "Localisation", "Dress code", "Galerie", "FAQ", "RSVP", "Pied de page"],
    headings: { "Dress code": "Dress code", FAQ: "Questions fréquentes", RSVP: "Confirme ta venue" },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  {
    name: "Atelier",
    theme: "atelier",
    sourceModel: "atelier.html",
    category: "Personnalisé",
    categoryCode: "evenement_personnalise",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Événement personnalisé",
    description: "Galerie blanche et typographie éditoriale. L’exemple est un vernissage, mais tout se compose librement.",
    features: [
      { label: "Ouverture", text: "rideau de galerie" },
      { label: "Fond", text: "sans fioritures, mise en page éditoriale" },
      { label: "Modules", text: "présentation, galerie encadrée, impressions des visiteurs, réponse" }
    ],
    preview: {
      bg: "#F4F1EC",
      ink: "#161412",
      accent: "#C2410C",
      accent2: "#1D4ED8",
      font: "\"Instrument Serif\", serif",
      eyebrow: "Vernissage · Nadia Ebongué",
      title: "EXPO",
      date: "5 mars 2027 · Douala"
    },
    blocks: ["Rebours", "Histoire", "Programme", "Localisation", "Galerie", "Livre d'or", "RSVP", "Pied de page"],
    headings: {
      Histoire: "À propos",
      Galerie: "Les œuvres",
      "Livre d'or": "Vos impressions",
      RSVP: "Votre venue"
    },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  {
    name: "Libre",
    theme: "libre",
    sourceModel: "libre.html",
    category: "Autre",
    categoryCode: "autre",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Autre événement",
    description: "Simple et direct, pour tout événement qui n’entre dans aucune case.",
    features: [
      { label: "Ouverture", text: "ouverture en cercle" },
      { label: "Fond", text: "bulles, motif vagues" },
      { label: "Modules", text: "inscription, partenaires, FAQ, mots d’encouragement" }
    ],
    preview: {
      bg: "#F2F7F3",
      ink: "#13241B",
      accent: "#1F7A4D",
      accent2: "#F2A541",
      font: "\"Archivo Black\", sans-serif",
      eyebrow: "Journée citoyenne",
      title: "Bonabéri Propre",
      date: "3 avril 2027 · Douala"
    },
    blocks: ["Rebours", "Programme", "Localisation", "Galerie", "Partenaires", "FAQ", "Livre d'or", "RSVP", "Pied de page"],
    headings: {
      Partenaires: "Avec le soutien de",
      FAQ: "Questions fréquentes",
      "Livre d'or": "Mots d'encouragement",
      RSVP: "Inscris-toi"
    },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  {
    name: "Douceur",
    theme: "douceur",
    sourceModel: "douceur.html",
    category: "Baby shower",
    categoryCode: "baby_shower",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Baby shower et naissance",
    description: "Rose et bleu pastel pour un baby shower, une révélation du sexe ou la présentation du bébé.",
    features: [
      { label: "Ouverture", text: "cadeau qui s’ouvre" },
      { label: "Fond", text: "bulles, couleurs pastel" },
      { label: "Modules", text: "liste de naissance, conseils aux parents, réponse" }
    ],
    preview: {
      bg: "#F6F8FF",
      ink: "#22304A",
      accent: "#E2668E",
      accent2: "#5B9BD5",
      font: "\"Fredoka\", sans-serif",
      eyebrow: "Baby shower",
      title: "Linda",
      date: "23 janv. 2027 · Douala"
    },
    blocks: ["Rebours", "Programme", "Localisation", "Dress code", "Galerie", "Cadeaux", "Livre d'or", "RSVP", "Pied de page"],
    headings: {
      "Dress code": "Rose ou bleu ?",
      Cadeaux: "Liste de naissance",
      "Livre d'or": "Conseils aux futurs parents",
      RSVP: "Tu viens ?"
    },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1.25rem" }
  },
  {
    name: "Souvenir",
    theme: "souvenir",
    sourceModel: "souvenir.html",
    category: "Retrait de deuil",
    categoryCode: "retrait_deuil",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Retrait de deuil",
    description: "Pour la levée de deuil : on passe du recueillement à la célébration de la vie.",
    features: [
      { label: "Ouverture", text: "rideau qui s’ouvre sur la lumière" },
      { label: "Fond", text: "lumière dorée, motifs du pagne, balafon" },
      { label: "Modules", text: "biographie, programme sur 2 jours, contributions, témoignages" }
    ],
    preview: {
      bg: "#17130F",
      ink: "#F6EFE3",
      accent: "#C9A050",
      accent2: "#B5432E",
      font: "\"Marcellus\", serif",
      eyebrow: "Retrait de deuil",
      title: "Emmanuel Tchinda",
      date: "27 févr. 2027 · Bangangté"
    },
    blocks: ["Rebours", "Histoire", "Programme", "Localisation", "Dress code", "Galerie", "Cadeaux", "Livre d'or", "RSVP", "Pied de page"],
    headings: {
      Histoire: "Sa vie",
      "Dress code": "Pagne de la cérémonie",
      Cadeaux: "Contribuer à la cérémonie",
      "Livre d'or": "Témoignages",
      RSVP: "Votre présence"
    },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  {
    name: "Étoile",
    theme: "noel",
    sourceModel: "noel.html",
    category: "Fêtes",
    categoryCode: "fetes_saisons",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Noël · 25 décembre",
    description: "Pour l’arbre de Noël d’une entreprise ou d’une association, ou un Noël en famille.",
    features: [
      { label: "Ouverture", text: "cadeau qui s’ouvre" },
      { label: "Fond", text: "neige, guirlande lumineuse, clochettes" },
      { label: "Modules", text: "inscription des enfants, lettres au Père Noël, FAQ" }
    ],
    preview: {
      bg: "#0E1B2E",
      ink: "#F7F3EA",
      accent: "#E23B3B",
      accent2: "#2FA36B",
      font: "\"Mountains of Christmas\", cursive",
      eyebrow: "Arbre de Noël",
      title: "Joyeux Noël",
      date: "19 déc. 2026 · Douala"
    },
    blocks: ["Rebours", "Programme", "Localisation", "Dress code", "Galerie", "FAQ", "Livre d'or", "RSVP", "Pied de page"],
    headings: {
      "Dress code": "Rouge, vert ou blanc",
      "Livre d'or": "Lettres au Père Noël",
      RSVP: "Inscrivez vos enfants"
    },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1.25rem" }
  },
  {
    name: "Cœur",
    theme: "coeur",
    sourceModel: "coeur.html",
    category: "Fêtes",
    categoryCode: "fetes_saisons",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Saint-Valentin · 14 février",
    description: "Dîner en amoureux pour un restaurant, un hôtel ou une salle : les couples réservent et paient leur table.",
    features: [
      { label: "Ouverture", text: "lettre scellée" },
      { label: "Fond", text: "pétales de rose, musique lounge" },
      { label: "Modules", text: "billetterie par couple, FAQ" }
    ],
    preview: {
      bg: "#1A0B14",
      ink: "#FBEFF3",
      accent: "#E0335A",
      accent2: "#F7A8B8",
      font: "\"Playfair Display\", serif",
      eyebrow: "Saint-Valentin",
      title: "14.02",
      date: "14 févr. 2027 · Douala"
    },
    blocks: ["Rebours", "Programme", "Billetterie", "Localisation", "Dress code", "Galerie", "FAQ", "Pied de page"],
    headings: {
      Billetterie: "Choisissez votre formule",
      "Dress code": "Tenue chic",
      FAQ: "Questions fréquentes"
    },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  {
    name: "Hilal",
    theme: "hilal",
    sourceModel: "hilal.html",
    category: "Fêtes",
    categoryCode: "fetes_saisons",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Aïd el-Fitr et Tabaski",
    description: "Nuit bleue et lanternes dorées, pour le repas de l’Aïd en famille ou en association.",
    features: [
      { label: "Ouverture", text: "lettre scellée" },
      { label: "Fond", text: "étoiles, sans musique" },
      { label: "Modules", text: "programme de la journée, vœux de l’Aïd, réponse" }
    ],
    preview: {
      bg: "#0E1A2B",
      ink: "#F6F0E3",
      accent: "#E0B04B",
      accent2: "#2FA37A",
      font: "\"Amiri\", serif",
      eyebrow: "Aïd Moubarak",
      title: "Mfouapon",
      date: "10 mars 2027 · Douala"
    },
    blocks: ["Rebours", "Programme", "Localisation", "Dress code", "Galerie", "FAQ", "Livre d'or", "RSVP", "Pied de page"],
    headings: {
      "Dress code": "Tenue de fête",
      "Livre d'or": "Vœux de l’Aïd",
      RSVP: "Annoncez votre venue"
    },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  {
    name: "Aurore",
    theme: "aurore",
    sourceModel: "aurore.html",
    category: "Fêtes",
    categoryCode: "fetes_saisons",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Pâques",
    description: "Lumière d’aube et lys blancs, pour les célébrations de Pâques d’une paroisse ou d’une famille.",
    features: [
      { label: "Ouverture", text: "cierge pascal à allumer" },
      { label: "Fond", text: "pétales, harpe" },
      { label: "Modules", text: "veillée, messe, chasse aux œufs, inscription au repas" }
    ],
    preview: {
      bg: "#F7F2FB",
      ink: "#2A1F3A",
      accent: "#7B4FB0",
      accent2: "#E8C04A",
      font: "\"Cormorant Garamond\", serif",
      eyebrow: "Joyeuses",
      title: "Pâques",
      date: "28 mars 2027 · Douala"
    },
    blocks: ["Rebours", "Programme", "Localisation", "Dress code", "Galerie", "Livre d'or", "RSVP", "Pied de page"],
    headings: {
      "Dress code": "Tenue de fête claire",
      "Livre d'or": "Messages de Pâques",
      RSVP: "Inscription au repas"
    },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  {
    name: "Unité",
    theme: "unite",
    sourceModel: "unite.html",
    category: "Fêtes",
    categoryCode: "fetes_saisons",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Fête nationale · 20 mai",
    description: "Vert, rouge, jaune et l’étoile, pour les célébrations du 20 mai d’une association, d’une école ou d’une entreprise.",
    features: [
      { label: "Ouverture", text: "ouverture en cercle" },
      { label: "Fond", text: "confettis vert-rouge-jaune" },
      { label: "Modules", text: "défilé par groupe, village des régions, partenaires" }
    ],
    preview: {
      bg: "#F4F7F2",
      ink: "#13261C",
      accent: "#007A5E",
      accent2: "#CE1126",
      font: "\"Oswald\", sans-serif",
      eyebrow: "Fête nationale",
      title: "20 MAI",
      date: "20 mai 2027 · Douala"
    },
    blocks: ["Rebours", "Programme", "Localisation", "Dress code", "Galerie", "Partenaires", "FAQ", "RSVP", "Pied de page"],
    headings: {
      "Dress code": "Aux couleurs nationales",
      Partenaires: "Avec le soutien de",
      RSVP: "Inscrire mon groupe"
    },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "0.75rem" }
  },
  {
    name: "Maman",
    theme: "maman",
    sourceModel: "maman.html",
    category: "Fêtes",
    categoryCode: "fetes_saisons",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Fête des mères",
    description: "Rose corail et lilas, pour un déjeuner ou une fête offerte aux mamans.",
    features: [
      { label: "Ouverture", text: "fleur qui éclot" },
      { label: "Fond", text: "pétales, cœurs" },
      { label: "Modules", text: "inscription par maman, mots pour maman, cagnotte" }
    ],
    preview: {
      bg: "#FFF5F3",
      ink: "#3A2228",
      accent: "#D9576B",
      accent2: "#8E6CC4",
      font: "\"Dancing Script\", cursive",
      eyebrow: "Fête des mères",
      title: "Nos Mamans",
      date: "30 mai 2027 · Douala"
    },
    blocks: ["Rebours", "Programme", "Localisation", "Dress code", "Galerie", "Cadeaux", "Livre d'or", "RSVP", "Pied de page"],
    headings: {
      "Dress code": "En fleurs",
      Cadeaux: "Offrir aux mamans",
      "Livre d'or": "Mots pour maman",
      RSVP: "Inscrire une maman"
    },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1.25rem" }
  },
  {
    name: "Minuit",
    theme: "minuit",
    sourceModel: "minuit.html",
    category: "Fêtes",
    categoryCode: "fetes_saisons",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Nouvel An · 31 décembre",
    description: "Bleu nuit, or et compte à rebours jusqu’à minuit, pour le réveillon d’une famille, d’une association ou le gala de fin d’année d’une entreprise.",
    features: [
      { label: "Ouverture", text: "invitation-billet du réveillon" },
      { label: "Fond", text: "étoiles, feux d’artifice, bande ndop dorée" },
      { label: "Modules", text: "compte à rebours jusqu’à minuit, vœux pour la nouvelle année" }
    ],
    preview: {
      bg: "#100B30",
      ink: "#ECE8F5",
      accent: "#E3B65A",
      accent2: "#F3E6C4",
      font: "\"Playfair Display\", serif",
      eyebrow: "Saint-Sylvestre",
      title: "2027",
      date: "31 déc. 2026 · Douala"
    },
    blocks: ["Rebours", "Histoire", "Programme", "Localisation", "Dress code", "Galerie", "Livre d'or", "RSVP", "Pied de page"],
    headings: {
      Histoire: "Vos hôtes",
      Programme: "Le programme",
      "Dress code": "Chic et scintillant",
      Galerie: "Après la fête",
      "Livre d'or": "Vos vœux pour la nouvelle année",
      RSVP: "Serez-vous des nôtres ?"
    },
    content: {
      Histoire: {
        heading: "Vos hôtes",
        body: "Nous avons hâte de fêter la nouvelle année avec vous.",
      },
    },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1.25rem" }
  },
  {
    name: "Envol",
    theme: "envol",
    sourceModel: "envol.html",
    category: "Professionnel",
    categoryCode: "evenement_entreprise",
    badge: "PREMIUM",
    premium: true,
    subtitle: "Présentation des vœux",
    description: "Ivoire, or et couleur de l’organisation, pour la cérémonie de présentation des vœux d’une entreprise, d’une école ou d’une administration.",
    features: [
      { label: "Ouverture", text: "enveloppe de l’invitation officielle" },
      { label: "Fond", text: "rosace guillochée et traits d’or qui s’envolent" },
      { label: "Modules", text: "allocutions, déroulé protocolaire, tenue, infos pratiques, réponse" }
    ],
    preview: {
      bg: "#F7F2E7",
      ink: "#1E2433",
      accent: "#0F1F44",
      accent2: "#86601A",
      font: "\"Cormorant Garamond\", serif",
      eyebrow: "Vœux 2027",
      title: "Wouri Logistics",
      date: "15 janv. 2027 · Douala"
    },
    blocks: ["Rebours", "Invitation", "RSVP", "Programme", "Intervenants", "Distinctions", "Livre d'or", "Localisation", "Dress code", "FAQ", "Vidéo", "Galerie", "Pied de page"],
    headings: {
      RSVP: "Confirmez votre présence",
      Programme: "Déroulé de la cérémonie",
      Intervenants: "Les allocutions",
      Distinctions: "Les médaillés de l’année",
      "Livre d'or": "Le mur des vœux",
      "Dress code": "Tenue",
      FAQ: "Informations pratiques",
      Vidéo: "Suivez la cérémonie à distance",
      Galerie: "Souvenirs de la cérémonie"
    },
    content: {
      Distinctions: { body: "Ils seront honorés pendant la cérémonie." },
      "Livre d'or": { body: "Vos vœux s’affichent sur l’écran de la salle pendant la cérémonie." },
      "Dress code": { title: "Pagne de l’entreprise ou tenue de ville" },
      Vidéo: { live: true, body: "Les agences en région et les collaborateurs en mission suivent le direct ici." },
      Galerie: { body: "Les photos officielles seront publiées ici le jour même." }
    },
    // Variantes selon le type d'événement choisi dans l'assistant (data/eventTypes.js).
    variants: {
      "voeux-ecole": {
        headings: { Distinctions: "Les lauréats de l’année" },
        content: {
          "Dress code": { title: "Tenue de l’établissement ou tenue de ville" },
          Vidéo: { live: true, body: "Les parents et les étudiants des autres campus suivent le direct ici." }
        }
      },
      "voeux-administration": {
        headings: { Distinctions: "Les distinctions de l’année" },
        content: {
          "Dress code": { title: "Tenue de ville ou pagne du service" },
          Vidéo: { live: true, body: "Les services déconcentrés suivent le direct ici." }
        }
      }
    },
    presentation: { heroAlign: "center", heroHeight: "32rem", panelRadius: "1rem" }
  },
  // Modèles classiques : rendu générique (SitePage), couleurs du modèle.
  {
    name: "Éclat",
    category: "Mariage",
    categoryCode: "mariage",
    badge: "GRATUIT",
    preview: {
      bg: "#fbf7f2",
      ink: "#3b2f2a",
      accent: "#c8a165",
      serif: true,
      eyebrow: "Nous nous marions",
      title: "Awa & Ibrahim",
      date: "14 mars 2027 · Dakar",
    },
    blocks: ["Rebours", "Histoire", "Programme", "Localisation", "RSVP", "Galerie", "Livre d'or"],
    presentation: {
      heroAlign: "center",
      heroHeight: "31rem",
      panelRadius: "2rem",
    },
  },
  {
    name: "Signal",
    category: "Conférence",
    categoryCode: "conference",
    badge: "GRATUIT",
    preview: {
      bg: "#0f1024",
      ink: "#f2f2ff",
      accent: "#6549e8",
      eyebrow: "Tech Summit",
      title: "Signal 2027",
      date: "3 – 4 juin · Abidjan",
    },
    blocks: ["Rebours", "Histoire", "Programme", "Intervenants", "Localisation", "Billetterie", "FAQ", "RSVP", "Galerie", "Pied de page"],
    presentation: {
      heroAlign: "flex-start",
      heroHeight: "26rem",
      panelRadius: "0.75rem",
    },
  },
  {
    name: "Confetti",
    category: "Anniversaire",
    categoryCode: "anniversaire",
    badge: "GRATUIT",
    preview: {
      bg: "#fff4fb",
      ink: "#3a1d33",
      accent: "#ec4ec2",
      eyebrow: "On fête ça !",
      title: "Les 30 ans de Fatou",
      date: "22 août · 20h",
    },
    blocks: ["Rebours", "Histoire", "Programme", "Localisation", "RSVP", "Galerie"],
    presentation: {
      heroAlign: "center",
      heroHeight: "30rem",
      panelRadius: "2rem",
    },
  },
  {
    name: "Promo",
    category: "Graduation",
    categoryCode: "graduation",
    badge: "GRATUIT",
    preview: {
      bg: "#0d2a3a",
      ink: "#eef7fb",
      accent: "#f6c945",
      eyebrow: "Promotion 2027",
      title: "Cérémonie de remise",
      date: "12 juillet · Amphi A",
    },
    blocks: ["Rebours", "Histoire", "Programme", "Intervenants", "Localisation", "RSVP", "Galerie", "Livre d'or"],
    presentation: {
      heroAlign: "flex-start",
      heroHeight: "28rem",
      panelRadius: "0.5rem",
    },
  },
  {
    name: "Amplify",
    category: "Concert",
    categoryCode: "concert",
    badge: "GRATUIT",
    preview: {
      bg: "#140a1f",
      ink: "#fff1e8",
      accent: "#ff7a3d",
      eyebrow: "Live",
      title: "Amplify Night",
      date: "5 octobre · 21h",
    },
    blocks: ["Rebours", "Histoire", "Programme", "Intervenants", "Billetterie", "Localisation", "FAQ", "Galerie", "Pied de page"],
    presentation: {
      heroAlign: "center",
      heroHeight: "34rem",
      panelRadius: "1rem",
    },
  },
  {
    name: "Sobre",
    category: "Professionnel",
    categoryCode: "evenement_entreprise",
    badge: "GRATUIT",
    minimal: true,
    preview: {
      bg: "#ffffff",
      ink: "#1c2230",
      accent: "#2563eb",
      eyebrow: "Séminaire annuel",
      title: "Stratégie 2027",
      date: "18 novembre · Siège",
    },
    blocks: ["Histoire", "Programme", "Intervenants", "Localisation", "RSVP", "FAQ", "Pied de page"],
    presentation: {
      heroAlign: "flex-start",
      heroHeight: "24rem",
      panelRadius: "0.5rem",
    },
  },
  {
    name: "Ivoire",
    category: "Mariage",
    categoryCode: "mariage",
    badge: "GRATUIT",
    preview: {
      bg: "#fffdf8",
      ink: "#2f2a24",
      accent: "#b08d57",
      serif: true,
      eyebrow: "Save the date",
      title: "Nadia & Koffi",
      date: "20 juin 2027 · Abidjan"
    },
    blocks: [
      "Rebours",
      "Histoire",
      "Programme",
      "Localisation",
      "RSVP",
      "Galerie",
      "Livre d'or",
      "FAQ",
      "Pied de page"
    ],
    presentation: {
      heroAlign: "center",
      heroHeight: "32rem",
      panelRadius: "2rem"
    }
  },
  {
    name: "Jardin",
    category: "Mariage",
    categoryCode: "mariage",
    badge: "GRATUIT",
    preview: {
      bg: "#f3f7f1",
      ink: "#23321f",
      accent: "#5f8b4c",
      serif: true,
      eyebrow: "Union champêtre",
      title: "Mariam & Yao",
      date: "6 sept. 2027 · Grand-Bassam"
    },
    blocks: [
      "Histoire",
      "Programme",
      "Localisation",
      "RSVP",
      "Galerie",
      "Pied de page"
    ],
    presentation: {
      heroAlign: "center",
      heroHeight: "28rem",
      panelRadius: "1.5rem"
    }
  },
  {
    name: "Néon",
    category: "Anniversaire",
    categoryCode: "anniversaire",
    badge: "GRATUIT",
    preview: {
      bg: "#120c24",
      ink: "#f7f2ff",
      accent: "#22d3ee",
      eyebrow: "Birthday party",
      title: "Kevin fête ses 25 ans",
      date: "15 mars · 22h"
    },
    blocks: [
      "Rebours",
      "Programme",
      "Localisation",
      "RSVP",
      "Galerie",
      "Livre d'or"
    ],
    presentation: {
      heroAlign: "center",
      heroHeight: "32rem",
      panelRadius: "1rem"
    }
  },
  {
    name: "Tendresse",
    category: "Anniversaire",
    categoryCode: "anniversaire",
    badge: "GRATUIT",
    preview: {
      bg: "#fff8ef",
      ink: "#3d2a1a",
      accent: "#f59e0b",
      serif: true,
      eyebrow: "Joyeux anniversaire",
      title: "Les 60 ans de Maman",
      date: "12 mai · 13h"
    },
    blocks: [
      "Histoire",
      "Programme",
      "Localisation",
      "RSVP",
      "Galerie",
      "Livre d'or",
      "Pied de page"
    ],
    presentation: {
      heroAlign: "center",
      heroHeight: "28rem",
      panelRadius: "1.75rem"
    }
  },
  {
    name: "Lauréat",
    category: "Graduation",
    categoryCode: "graduation",
    badge: "GRATUIT",
    preview: {
      bg: "#ffffff",
      ink: "#14213d",
      accent: "#1d4ed8",
      eyebrow: "Félicitations",
      title: "Promo Excellence 2027",
      date: "28 juin · Campus"
    },
    blocks: [
      "Rebours",
      "Histoire",
      "Programme",
      "Localisation",
      "RSVP",
      "Galerie",
      "Livre d'or"
    ],
    presentation: {
      heroAlign: "center",
      heroHeight: "28rem",
      panelRadius: "0.75rem"
    }
  },
  {
    name: "Lumière",
    category: "Hommage",
    categoryCode: "obseques",
    badge: "GRATUIT",
    minimal: true,
    preview: {
      bg: "#1b1d22",
      ink: "#ece9e2",
      accent: "#c9b37e",
      serif: true,
      eyebrow: "Hommage à",
      title: "Awa Traoré",
      date: "1952 – 2026"
    },
    blocks: [
      "Histoire",
      "Programme",
      "Localisation",
      "Galerie",
      "Livre d'or"
    ],
    presentation: {
      heroAlign: "center",
      heroHeight: "26rem",
      panelRadius: "0.5rem"
    }
  },
  {
    name: "Forum",
    category: "Conférence",
    categoryCode: "conference",
    badge: "GRATUIT",
    preview: {
      bg: "#f7f9fc",
      ink: "#0f172a",
      accent: "#0ea5e9",
      eyebrow: "Sommet régional",
      title: "Forum Digital 2027",
      date: "9 – 10 avril · Dakar"
    },
    blocks: [
      "Rebours",
      "Histoire",
      "Programme",
      "Intervenants",
      "Billetterie",
      "Localisation",
      "FAQ",
      "RSVP",
      "Pied de page"
    ],
    presentation: {
      heroAlign: "flex-start",
      heroHeight: "28rem",
      panelRadius: "0.75rem"
    }
  },
  {
    name: "Scène",
    category: "Concert",
    categoryCode: "concert",
    badge: "GRATUIT",
    preview: {
      bg: "#0b0b0f",
      ink: "#fafafa",
      accent: "#e11d48",
      eyebrow: "En concert",
      title: "Nuit Afrobeat",
      date: "2 déc. · 20h"
    },
    blocks: [
      "Rebours",
      "Histoire",
      "Programme",
      "Billetterie",
      "Localisation",
      "Galerie",
      "FAQ",
      "Pied de page"
    ],
    presentation: {
      heroAlign: "flex-start",
      heroHeight: "34rem",
      panelRadius: "0.5rem"
    }
  },
  {
    name: "Berceau",
    category: "Baptême",
    categoryCode: "bapteme",
    badge: "GRATUIT",
    preview: {
      bg: "#f5f9ff",
      ink: "#1e2a3b",
      accent: "#5b8fd4",
      serif: true,
      eyebrow: "Bienvenue à",
      title: "Baptême de Léa",
      date: "8 août · Paroisse St-Paul"
    },
    blocks: [
      "Histoire",
      "Programme",
      "Localisation",
      "RSVP",
      "Galerie",
      "Livre d'or"
    ],
    presentation: {
      heroAlign: "center",
      heroHeight: "28rem",
      panelRadius: "2rem"
    }
  },
  {
    name: "Plume",
    category: "Baptême",
    categoryCode: "bapteme",
    badge: "GRATUIT",
    minimal: true,
    preview: {
      bg: "#fdf7f9",
      ink: "#3b2630",
      accent: "#c96f8f",
      serif: true,
      eyebrow: "Une nouvelle vie",
      title: "Baptême d'Ethan",
      date: "21 nov. · 10h"
    },
    blocks: [
      "Histoire",
      "Programme",
      "Localisation",
      "RSVP",
      "Livre d'or",
      "Pied de page"
    ],
    presentation: {
      heroAlign: "center",
      heroHeight: "26rem",
      panelRadius: "1.5rem"
    }
  },
  {
    name: "Velours",
    category: "Soirée privée",
    categoryCode: "soiree_privee",
    badge: "GRATUIT",
    preview: {
      bg: "#1a0f14",
      ink: "#fbeff2",
      accent: "#d4a24c",
      serif: true,
      eyebrow: "Soirée privée",
      title: "Black & Gold Night",
      date: "31 déc. · 21h"
    },
    blocks: [
      "Rebours",
      "Programme",
      "Localisation",
      "RSVP",
      "Galerie"
    ],
    presentation: {
      heroAlign: "center",
      heroHeight: "34rem",
      panelRadius: "1rem"
    }
  },
  {
    name: "Lounge",
    category: "Soirée privée",
    categoryCode: "soiree_privee",
    badge: "GRATUIT",
    preview: {
      bg: "#f6f4ff",
      ink: "#231c3a",
      accent: "#7c3aed",
      eyebrow: "Entre amis",
      title: "Soirée Rooftop",
      date: "18 juil. · 19h"
    },
    blocks: [
      "Programme",
      "Localisation",
      "RSVP",
      "Galerie",
      "FAQ"
    ],
    presentation: {
      heroAlign: "center",
      heroHeight: "30rem",
      panelRadius: "1.5rem"
    }
  },
  {
    name: "Kermesse",
    category: "Scolaire",
    categoryCode: "evenement_scolaire",
    badge: "GRATUIT",
    preview: {
      bg: "#fffbea",
      ink: "#2d2410",
      accent: "#ea580c",
      eyebrow: "Fête de l'école",
      title: "Kermesse annuelle",
      date: "24 juin · Cour"
    },
    blocks: [
      "Rebours",
      "Programme",
      "Localisation",
      "Galerie",
      "FAQ"
    ],
    presentation: {
      heroAlign: "center",
      heroHeight: "28rem",
      panelRadius: "1.75rem"
    }
  },
  {
    name: "Sérénité",
    category: "Religieux",
    categoryCode: "evenement_religieux",
    badge: "GRATUIT",
    minimal: true,
    preview: {
      bg: "#fbfaf6",
      ink: "#2a2a2a",
      accent: "#8b6f3e",
      serif: true,
      eyebrow: "Célébration",
      title: "Messe d'action de grâce",
      date: "3 mars · 10h"
    },
    blocks: [
      "Histoire",
      "Programme",
      "Localisation",
      "RSVP",
      "Livre d'or"
    ],
    presentation: {
      heroAlign: "center",
      heroHeight: "26rem",
      panelRadius: "0.75rem"
    }
  },
  {
    name: "Ferveur",
    category: "Religieux",
    categoryCode: "evenement_religieux",
    badge: "GRATUIT",
    preview: {
      bg: "#13213a",
      ink: "#f1f5ff",
      accent: "#f2c14e",
      serif: true,
      eyebrow: "Rassemblement",
      title: "Grande Veillée 2027",
      date: "12 avril · 20h"
    },
    blocks: [
      "Rebours",
      "Histoire",
      "Programme",
      "Intervenants",
      "Localisation",
      "RSVP",
      "Galerie"
    ],
    presentation: {
      heroAlign: "center",
      heroHeight: "30rem",
      panelRadius: "1rem"
    }
  },
  {
    name: "Arène",
    category: "Sport",
    categoryCode: "competition_sportive",
    badge: "GRATUIT",
    preview: {
      bg: "#0d1117",
      ink: "#f0f6fc",
      accent: "#22c55e",
      eyebrow: "Tournoi",
      title: "Coupe Inter-Quartiers",
      date: "10 – 12 mai · Stade"
    },
    blocks: [
      "Rebours",
      "Histoire",
      "Programme",
      "Billetterie",
      "Localisation",
      "Galerie",
      "FAQ"
    ],
    presentation: {
      heroAlign: "flex-start",
      heroHeight: "32rem",
      panelRadius: "0.5rem"
    }
  },
  {
    name: "Sprint",
    category: "Sport",
    categoryCode: "competition_sportive",
    badge: "GRATUIT",
    preview: {
      bg: "#ffffff",
      ink: "#111827",
      accent: "#ef4444",
      eyebrow: "Course solidaire",
      title: "Run for Hope 10K",
      date: "7 sept. · 7h"
    },
    blocks: [
      "Rebours",
      "Histoire",
      "Programme",
      "Localisation",
      "RSVP",
      "FAQ",
      "Pied de page"
    ],
    presentation: {
      heroAlign: "flex-start",
      heroHeight: "28rem",
      panelRadius: "0.75rem"
    }
  },
  {
    name: "Pique-nique",
    category: "Familial",
    categoryCode: "evenement_familial",
    badge: "GRATUIT",
    preview: {
      bg: "#f0fbf6",
      ink: "#163327",
      accent: "#10b981",
      eyebrow: "Grand rassemblement",
      title: "Journée en famille",
      date: "30 mai · Parc"
    },
    blocks: [
      "Programme",
      "Localisation",
      "RSVP",
      "Galerie",
      "FAQ"
    ],
    presentation: {
      heroAlign: "center",
      heroHeight: "28rem",
      panelRadius: "2rem"
    }
  },
  {
    name: "Canvas",
    category: "Personnalisé",
    categoryCode: "evenement_personnalise",
    badge: "GRATUIT",
    minimal: true,
    preview: {
      bg: "#ffffff",
      ink: "#18181b",
      accent: "#6c4bf4",
      eyebrow: "Votre événement",
      title: "Un moment unique",
      date: "Date · Lieu"
    },
    blocks: [
      "Histoire",
      "Programme",
      "Localisation",
      "RSVP",
      "Galerie",
      "FAQ",
      "Pied de page"
    ],
    presentation: {
      heroAlign: "center",
      heroHeight: "28rem",
      panelRadius: "1rem"
    }
  },
  {
    name: "Aube",
    category: "Personnalisé",
    categoryCode: "evenement_personnalise",
    badge: "GRATUIT",
    preview: {
      bg: "#140f2b",
      ink: "#f5f3ff",
      accent: "#f472b6",
      eyebrow: "Événement",
      title: "Nuit des Talents",
      date: "9 nov. · 19h"
    },
    blocks: [
      "Rebours",
      "Histoire",
      "Programme",
      "Intervenants",
      "Billetterie",
      "Localisation",
      "Galerie",
      "Pied de page"
    ],
    presentation: {
      heroAlign: "center",
      heroHeight: "32rem",
      panelRadius: "1.25rem"
    }
  },
];

function isDark(hex) {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.299 * r + 0.587 * g + 0.114 * b < 110
}

// `meta` (ligne descriptive des cartes) est calculé : il reste toujours fidèle
// à la composition réelle du modèle (Hero + blocs).
// Chaque modèle s'ouvre sur la section « Invitation » (salutation, texte, signature),
// juste après le Hero.
export const TEMPLATES = RAW_TEMPLATES.map((template) => ({
  ...template,
  blocks: ['Invitation', ...template.blocks.filter((b) => b !== 'Invitation')],
  // Le badge suit la liste vérifiée par le serveur (PremiumTemplates.cs) : un modèle sans
  // `premium` est utilisable avec l'offre Free, quel que soit son badge d'origine.
  badge: template.premium ? 'PREMIUM' : 'GRATUIT',
  meta: [
    template.category,
    `${template.blocks.filter((b) => b !== 'Invitation').length + 2} blocs`,
    template.minimal ? 'sobre' : isDark(template.preview.bg) ? 'sombre' : 'clair',
  ].join(' · '),
}))
