// Section « Invitation » des modèles premium (reprise du prototype : invitation de chaque
// modèle dans <modele>.html, illustration THEME.illus et son cadre THEME.illusFrame).
// - illus, frame : scène de utils/illus.js et forme de son cadre (arch, round, circle, rect) ;
// - gallery : légendes des vignettes illustrées de la galerie de démonstration ;
// - demo : texte exact de la démo du modèle (/modeles/:theme) ;
// - starter : texte de départ d'un nouvel événement, sans noms ni dates d'exemple, que
//   l'organisateur réécrit dans le Builder. La signature y est le nom affiché en grand.
// Les paragraphes sont séparés par une ligne vide.

export const INVITATIONS = {
  noor: {
    illus: 'couple',
    frame: 'arch',
    gallery: ["Fiançailles","Saint-Louis","Les familles","Sourires","Préparatifs","Souvenirs"],
    demo: { greeting: "Chers parents, chers amis,", prefix: "Cher·e", body: "Après six années de complicité, nous avons choisi de nous unir devant Dieu et entourés de ceux qui comptent pour nous.\n\nVotre présence à nos côtés ce jour-là serait notre plus beau cadeau.", signature: "Awa & Ibrahim" },
    starter: { greeting: "Chers parents, chers amis,", prefix: "Cher·e", body: "Nous avons choisi de nous unir devant Dieu, entourés de ceux qui comptent pour nous.\n\nVotre présence à nos côtés ce jour-là serait notre plus beau cadeau." },
  },
  bloom: {
    illus: 'couple',
    frame: 'arch',
    gallery: ["Les fiancés","La demande","Limbé","Bouquets","Les témoins","Souvenirs"],
    demo: { greeting: "Chère famille, chers amis,", prefix: "Cher·e", body: "Nous avons grandi chacun de notre côté, puis nos chemins se sont croisés à Douala et ne se sont plus quittés.\n\nNous serions tellement heureux de vous avoir près de nous pour dire « oui » et faire la fête jusqu'au bout de la nuit.", signature: "Grâce & Junior" },
    starter: { greeting: "Chère famille, chers amis,", prefix: "Cher·e", body: "Nos chemins se sont croisés et ne se sont plus quittés.\n\nNous serions tellement heureux de vous avoir près de nous pour dire « oui » et faire la fête jusqu'au bout de la nuit." },
  },
  toghu: {
    illus: 'dot',
    frame: 'rect',
    gallery: ["Les fiancés","La concession","Les présents","Les anciens","Danses","Famille"],
    demo: { greeting: "Parents, amis et alliés,", prefix: "Cher·e", body: "La dot n'est pas une transaction. C'est le moment où deux familles se reconnaissent, se parlent et se donnent la parole.\n\nNous serions honorés de vous compter parmi nous à Bafoussam.", signature: "Familles Kamdem & Tchoupo" },
    starter: { greeting: "Parents, amis et alliés,", prefix: "Cher·e", body: "La dot n'est pas une transaction. C'est le moment où deux familles se reconnaissent, se parlent et se donnent la parole.\n\nNous serions honorés de vous compter parmi nous." },
  },
  ndop: {
    illus: 'dot',
    frame: 'circle',
    gallery: ["Les fiancés","La concession","Le Ndop","Les anciens","La danse","Famille"],
    demo: { greeting: "Frères, sœurs et amis,", prefix: "Cher·e", body: "Comme le Ndop porte les signes de ceux qui l'ont tissé, notre union portera la trace de chacun de vous.\n\nVenez avec vos tenues, vos chants et vos bénédictions : la cour de la concession vous attend.", signature: "Familles Tsafack & Fokou" },
    starter: { greeting: "Frères, sœurs et amis,", prefix: "Cher·e", body: "Comme le Ndop porte les signes de ceux qui l'ont tissé, notre union portera la trace de chacun de vous.\n\nVenez avec vos tenues, vos chants et vos bénédictions : la cour de la concession vous attend." },
  },
  fiesta: {
    illus: 'cake',
    frame: 'round',
    gallery: ["Mes 20 ans","Vacances à Kribi","La bande","Fou rire","Famille","Souvenirs"],
    demo: { greeting: "Salut la famille !", prefix: "Coucou", body: "Le 21 novembre, je passe le cap des 30 ans et je veux le fêter avec les gens qui ont rendu ces années si belles.\n\nViens comme tu es, avec ton plus beau sourire et tes meilleurs pas de danse.", signature: "Manuella" },
    starter: { greeting: "Salut la famille !", prefix: "Coucou", body: "Je passe un cap et je veux le fêter avec les gens qui ont rendu ces années si belles.\n\nViens comme tu es, avec ton plus beau sourire et tes meilleurs pas de danse." },
  },
  prestige: {
    illus: 'party',
    frame: 'rect',
    gallery: ["Les années 80","Le diplôme","Avec Hélène","Les enfants","L'entreprise","Les amis"],
    demo: { greeting: "Chers amis, chère famille,", prefix: "Cher·e", body: "Cinquante ans, c'est l'âge de la gratitude. Je veux réunir autour d'une même table tous ceux qui ont marqué mon chemin.\n\nTenue de soirée de rigueur, bonne humeur obligatoire.", signature: "Jean-Claude" },
    starter: { greeting: "Chers amis, chère famille,", prefix: "Cher·e", body: "Je veux réunir autour d'une même table tous ceux qui ont marqué mon chemin.\n\nTenue de soirée de rigueur, bonne humeur obligatoire." },
  },
  nuage: {
    illus: 'cradle',
    frame: 'round',
    gallery: ["Premier sourire","La maternité","Avec papa","Avec maman","Les mains","Souvenirs"],
    demo: { greeting: "Chère famille, chers amis,", prefix: "Cher·e", body: "Maëlle a trois mois et déjà beaucoup de monde autour d'elle. Nous voulons vous réunir pour ce premier grand jour de sa vie.\n\nAprès la messe, un déjeuner vous attend à la maison familiale.", signature: "Sandrine & Olivier, ses parents" },
    starter: { greeting: "Chère famille, chers amis,", prefix: "Cher·e", body: "Notre enfant est déjà très entouré. Nous voulons vous réunir pour ce premier grand jour de sa vie.\n\nAprès la cérémonie, un repas vous attend." },
  },
  douceur: {
    illus: 'babyshower',
    frame: 'round',
    gallery: ["Le ventre de maman","La chambre de bébé","Les copines","Le gâteau","Les cadeaux","Échographie"],
    demo: { greeting: "Chères copines, chère famille,", prefix: "Coucou", body: "Dans quelques semaines, notre famille va s'agrandir. Avant l'arrivée de bébé, on se retrouve pour rire, jouer et gâter la future maman.\n\nN'oubliez pas de donner votre pronostic : fille ou garçon ? La réponse sera révélée pendant la fête.", signature: "Linda et Yannick" },
    starter: { greeting: "Chères copines, chère famille,", prefix: "Coucou", body: "Dans quelques semaines, notre famille va s'agrandir. Avant l'arrivée de bébé, on se retrouve pour rire, jouer et gâter la future maman.\n\nN'oubliez pas de donner votre pronostic : fille ou garçon ?" },
  },
  racines: {
    illus: 'family',
    frame: 'round',
    gallery: ["Mariage 1952","Les 7 enfants","Retrouvailles 2015","Édéa","La plage","Les petits"],
    demo: { greeting: "Chers cousins, oncles, tantes et enfants,", prefix: "Cher·e", body: "Depuis le décès de Grand-père Ngando, nous ne nous étions jamais tous retrouvés. Il est temps.\n\nAu programme : photo des générations, repas géant, tournoi de foot et veillée de contes au bord de la mer.", signature: "Le comité des retrouvailles" },
    starter: { greeting: "Chers cousins, oncles, tantes et enfants,", prefix: "Cher·e", body: "Cela fait trop longtemps que nous ne nous sommes pas tous retrouvés. Il est temps.\n\nAu programme : photo des générations, grand repas et veillée de contes." },
  },
  velvet: {
    illus: 'party',
    frame: 'round',
    gallery: ["Réveillon 2025","La villa","La piscine","Minuit","Les amis","Au petit matin"],
    demo: { greeting: "Chers amis,", prefix: "Cher·e", body: "On termine 2026 comme il se doit : en blanc, au bord de l'eau, avec les gens qu'on aime.\n\nLe nombre de places est limité. Confirme vite et garde ton QR code pour l'entrée.", signature: "Steve & Linda" },
    starter: { greeting: "Chers amis,", prefix: "Cher·e", body: "On se retrouve comme il se doit, avec les gens qu'on aime.\n\nLe nombre de places est limité. Confirme vite et garde ton QR code pour l'entrée." },
  },
  minuit: {
    illus: 'party',
    frame: 'arch',
    gallery: ["L'accueil","Le dîner","La piste de danse","Le compte à rebours","Minuit","Les vœux"],
    demo: { greeting: "Chers parents, chers amis,", prefix: "Cher·e", body: "Un dîner, de la musique et le compte à rebours tous ensemble. On termine 2026 réunis et on accueille 2027 de la plus belle des façons.\n\nMerci de confirmer votre présence avant le 20 décembre pour que nous prévoyions votre place à table.", signature: "La famille Ekwalla" },
    starter: { greeting: "Chers parents, chers amis,", prefix: "Cher·e", body: "Un dîner, de la musique et le compte à rebours tous ensemble. On termine l'année réunis et on accueille la nouvelle de la plus belle des façons.\n\nMerci de confirmer votre présence pour que nous prévoyions votre place à table." },
  },
  envol: {
    illus: 'conference',
    frame: 'rect',
    gallery: ["L'accueil","L'allocution","Les médaillés","La photo de famille","Le cocktail","Vœux 2026"],
    demo: { greeting: "Madame, Monsieur,", prefix: "Cher·e", body: "Le Directeur Général et l'ensemble du personnel de Wouri Logistics ont l'honneur de vous convier à la cérémonie de présentation des vœux pour l'année 2027.\n\nMerci de confirmer votre présence avant le 8 janvier.", signature: "La Direction générale" },
    starter: { greeting: "Madame, Monsieur,", prefix: "Cher·e", body: "Le Directeur Général et l'ensemble du personnel ont l'honneur de vous convier à la cérémonie de présentation des vœux pour la nouvelle année.\n\nMerci de confirmer votre présence." },
    // Variantes selon le type d'événement (data/eventTypes.js).
    starterFor: {
      'voeux-ecole': { greeting: "Madame, Monsieur,", prefix: "Cher·e", body: "Le Fondateur, la Direction et toute la communauté éducative ont l'honneur de vous convier à la cérémonie de présentation des vœux pour la nouvelle année.\n\nMerci de confirmer votre présence." },
      'voeux-administration': { greeting: "Madame, Monsieur,", prefix: "Cher·e", body: "Le Directeur et l'ensemble du personnel ont l'honneur de vous convier à la cérémonie de présentation des vœux pour la nouvelle année.\n\nMerci de confirmer votre présence." },
    },
  },
  grace: {
    illus: 'church',
    frame: 'arch',
    gallery: ["Mariage en 2002","La famille","La maison","La chorale","Les enfants","Souvenirs"],
    demo: { greeting: "Frères et sœurs, chers amis,", prefix: "Cher·e", body: "« Rendez grâces en toutes choses. » Cette année nous a donné beaucoup de raisons de le faire.\n\nNous vous invitons au culte, puis à partager un repas fraternel dans la cour de la paroisse.", signature: "Pierre & Rose Mbarga et leurs enfants" },
    starter: { greeting: "Frères et sœurs, chers amis,", prefix: "Cher·e", body: "« Rendez grâces en toutes choses. » Cette année nous a donné beaucoup de raisons de le faire.\n\nNous vous invitons au culte, puis à partager un repas fraternel." },
  },
  memoire: {
    illus: 'candle',
    frame: 'arch',
    gallery: ["Jeunesse","Avec Marthe","En classe","Ses enfants","Ses petits-enfants","Le jardin"],
    demo: { greeting: "Parents, amis et connaissances,", prefix: "Cher·e", body: "La famille Ekwalla a la profonde douleur de vous annoncer le rappel à Dieu de Joseph Ekwalla, époux, père, grand-père et ancien instituteur à Deïdo.\n\nElle vous invite à l'accompagner lors des obsèques et vous remercie pour vos prières et votre soutien.", signature: "La famille Ekwalla" },
    starter: { greeting: "Parents, amis et connaissances,", prefix: "Cher·e", body: "C'est avec une profonde douleur que nous vous annonçons le rappel à Dieu de notre être cher.\n\nLa famille vous invite à l'accompagner lors des obsèques et vous remercie pour vos prières et votre soutien." },
  },
  souvenir: {
    illus: 'tribute',
    frame: 'arch',
    gallery: ["Papa Emmanuel","La concession","Les petits-enfants","La chefferie","Les danses","Souvenirs"],
    demo: { greeting: "Parents, alliés et amis,", prefix: "Cher·e", body: "Le temps des larmes laisse place au temps de la reconnaissance. Nous retirons le deuil pour célébrer ce que Papa Emmanuel nous a laissé.\n\nVenez nombreux, dans le pagne de la cérémonie, partager les danses, le repas et les souvenirs.", signature: "Les enfants et la famille Tchinda" },
    starter: { greeting: "Parents, alliés et amis,", prefix: "Cher·e", body: "Le temps des larmes laisse place au temps de la reconnaissance. Nous retirons le deuil pour célébrer ce que notre être cher nous a laissé.\n\nVenez nombreux, dans le pagne de la cérémonie, partager les danses, le repas et les souvenirs." },
  },
  toge: {
    illus: 'graduation',
    frame: 'arch',
    gallery: ["Première année","Projets","Soutenances","Stage","La promo","Toques"],
    demo: { greeting: "Parents, amis, enseignants,", prefix: "Cher·e", body: "Trois années de travail, de nuits blanches et de projets rendus à minuit moins une.\n\nLe 10 juillet, la Promotion Excellence lance ses toques vers le ciel, et nous voulons vous y voir.", signature: "La direction et le bureau des diplômés" },
    starter: { greeting: "Parents, amis, enseignants,", prefix: "Cher·e", body: "Des années de travail, de nuits blanches et de projets rendus à minuit moins une.\n\nLa promotion lance ses toques vers le ciel, et nous voulons vous y voir." },
  },
  campus: {
    illus: 'campus',
    frame: 'round',
    gallery: ["Édition 2026","Défilé","Village culinaire","Match","Talents","Gala"],
    demo: { greeting: "Étudiants, enseignants, familles,", prefix: "Salut", body: "Chaque filière représente une région du Cameroun : costumes, plats, danses et beaucoup de bonne humeur.\n\nLa journée est gratuite pour les étudiants de l'IUGET. La soirée de gala demande un billet.", signature: "Les délégués étudiants" },
    starter: { greeting: "Étudiants, enseignants, familles,", prefix: "Salut", body: "Costumes, plats, danses et beaucoup de bonne humeur : toute l'école se retrouve pour une journée à part.\n\nVenez nombreux, en famille ou entre amis." },
  },
  summit: {
    illus: 'conference',
    frame: 'round',
    gallery: [],
    demo: { greeting: "Développeurs, entrepreneurs, étudiants,", prefix: "Bonjour", body: "Le Forum Tech & IA réunit celles et ceux qui construisent le numérique au Cameroun : conférences le matin, ateliers l'après-midi, rencontres toute la journée.\n\nLes places en atelier sont limitées : réservez votre pass dès maintenant.", signature: "Le comité du Forum" },
    starter: { greeting: "Chers participants,", prefix: "Bonjour", body: "Conférences, ateliers et rencontres : une journée pour apprendre et échanger avec celles et ceux qui font avancer notre secteur.\n\nLes places sont limitées : réservez votre pass dès maintenant." },
  },
  horizon: {
    illus: 'city',
    frame: 'rect',
    gallery: ["Le premier camion","Entrepôt Bonabéri","L'équipe 2019","Ouverture Bafoussam","Séminaire 2025","Nos clients"],
    demo: { greeting: "Chères équipes,", prefix: "Cher·e", body: "En 2017, nous étions six dans un bureau de Bonabéri. Aujourd'hui, nous livrons tout le Littoral et l'Ouest.\n\nCette soirée est la vôtre : remise des trophées, dîner et fête avec vos familles.", signature: "La Direction générale" },
    starter: { greeting: "Chères équipes,", prefix: "Cher·e", body: "Ce que nous avons construit ensemble mérite d'être célébré.\n\nCette soirée est la vôtre : remise des trophées, dîner et fête avec vos familles." },
  },
  live: {
    illus: 'stage',
    frame: 'rect',
    gallery: ["Répétitions","Backstage","Tournée Paris","Le public","Les musiciens","Affiche"],
    demo: { greeting: "Salut Douala,", prefix: "Salut", body: "Après sa tournée en Europe, Kémi Ndjock revient à la maison pour un concert unique, accompagnée de ses musiciens et de deux artistes invités.\n\nLes portes ouvrent à 19h. Arrivez tôt pour profiter de la première partie.", signature: "L'équipe Douala Live" },
    starter: { greeting: "Salut à tous,", prefix: "Salut", body: "Un concert unique, avec les musiciens et des artistes invités.\n\nArrivez tôt pour profiter de la première partie." },
  },
  arena: {
    illus: 'stadium',
    frame: 'rect',
    gallery: ["Demi-finale","Les supporters","Le vestiaire","Le trophée","Tirs au but","Célébration"],
    demo: { greeting: "Supporters, collègues, familles,", prefix: "Allez", body: "La finale se joue à guichets ouverts au stade de la Réunification. Avant le match, animations pour les enfants et concours de tirs au but.\n\nPrenez vos billets en ligne pour éviter la file d'attente.", signature: "Le comité d'organisation" },
    starter: { greeting: "Supporters, collègues, familles,", prefix: "Allez", body: "Avant le match, animations pour les enfants et concours de tirs au but.\n\nPrenez vos billets en ligne pour éviter la file d'attente." },
  },
  atelier: {
    illus: 'gallery',
    frame: 'rect',
    gallery: ["Aube sur le pont","Pirogues","Bonabéri, 19h","Marché de Deïdo","Pluie","Lampadaires"],
    demo: { greeting: "Amateurs d'art, curieux, amis,", prefix: "Cher·e", body: "Pendant deux ans, j'ai peint et photographié le Wouri à toutes les heures du jour.\n\nJe serais heureuse de vous faire découvrir ces œuvres autour d'un verre, avant leur départ pour Dakar.", signature: "Nadia Ebongué" },
    starter: { greeting: "Amateurs d'art, curieux, amis,", prefix: "Cher·e", body: "Nous serions heureux de vous faire découvrir ces œuvres autour d'un verre.\n\nEntrée libre, dans la limite des places disponibles." },
  },
  libre: {
    illus: 'city',
    frame: 'round',
    gallery: ["Avant","Les équipes","Les berges","Après","Le repas","Merci"],
    demo: { greeting: "Habitants, associations, étudiants,", prefix: "Salut", body: "Les pluies arrivent et nos caniveaux sont bouchés. Ensemble, on peut changer ça en une matinée.\n\nViens seul·e, en famille ou avec ton association. Chaque équipe aura une rue.", signature: "Le collectif Bonabéri Propre" },
    starter: { greeting: "Habitants, associations, amis,", prefix: "Salut", body: "Ensemble, on peut changer beaucoup de choses en une matinée.\n\nViens seul·e, en famille ou avec ton association." },
  },
  noel: {
    illus: 'christmas',
    frame: 'round',
    gallery: ["Le sapin","Le Père Noël","Les cadeaux","Le spectacle","Le goûter","Souvenirs 2025"],
    demo: { greeting: "Chers parents, chers enfants,", prefix: "Cher·e", body: "Comme chaque année, le Père Noël fait escale à Douala. Il a demandé la liste des enfants sages pour préparer un cadeau à chacun.\n\nInscrivez vos enfants avant le 5 décembre : son âge nous aide à choisir le bon cadeau.", signature: "Le comité des œuvres sociales" },
    starter: { greeting: "Chers parents, chers enfants,", prefix: "Cher·e", body: "Comme chaque année, le Père Noël fait escale chez nous. Il a demandé la liste des enfants sages pour préparer un cadeau à chacun.\n\nInscrivez vos enfants à l'avance : leur âge nous aide à choisir le bon cadeau." },
  },
  coeur: {
    illus: 'valentine',
    frame: 'arch',
    gallery: ["La terrasse","Table aux chandelles","Le chef","La piscine","Le dessert","Saint-Valentin 2026"],
    demo: { greeting: "À vous deux,", prefix: "Chère", body: "Le 14 février, offrez-vous une parenthèse : une table aux chandelles, un menu signé par notre chef et une photo souvenir du couple.\n\nLes places sont limitées à 40 tables. Réservez tôt pour choisir votre formule.", signature: "L'équipe du restaurant Les Palmiers" },
    starter: { greeting: "À vous deux,", prefix: "Cher·e", body: "Offrez-vous une parenthèse : une table aux chandelles, un menu de fête et une photo souvenir du couple.\n\nLes places sont limitées. Réservez tôt pour choisir votre formule." },
  },
  hilal: {
    illus: 'eid',
    frame: 'arch',
    gallery: ["La prière","Le repas","Les enfants","Les anciens","La concession","Aïd 2026"],
    demo: { greeting: "Chers parents, voisins et amis,", prefix: "Cher·e", body: "Le Ramadan nous a rappelé la valeur du partage. Nous voulons le prolonger en vous recevant le jour de l'Aïd.\n\nVenez en famille : il y aura à manger pour tout le monde et des friandises pour les enfants.", signature: "Hadja Aminatou et El Hadj Moussa Mfouapon" },
    starter: { greeting: "Chers parents, voisins et amis,", prefix: "Cher·e", body: "Le Ramadan nous a rappelé la valeur du partage. Nous voulons le prolonger en vous recevant le jour de l'Aïd.\n\nVenez en famille : il y aura à manger pour tout le monde et des friandises pour les enfants." },
  },
  aurore: {
    illus: 'easter',
    frame: 'arch',
    gallery: ["La veillée","La chorale","Le cierge","Chasse aux œufs","Le repas","Pâques 2026"],
    demo: { greeting: "Frères et sœurs, chers amis,", prefix: "Cher·e", body: "Après le carême et la semaine sainte, nous voulons vivre ensemble la joie de Pâques.\n\nLe repas fraternel est ouvert à tous, sur inscription pour que chacun ait sa place.", signature: "Le conseil paroissial" },
    starter: { greeting: "Frères et sœurs, chers amis,", prefix: "Cher·e", body: "Après le carême et la semaine sainte, nous voulons vivre ensemble la joie de Pâques.\n\nLe repas fraternel est ouvert à tous, sur inscription pour que chacun ait sa place." },
  },
  unite: {
    illus: 'national',
    frame: 'rect',
    gallery: ["Défilé 2026","Les écoles","Village des régions","Les danses","Le concert","Les drapeaux"],
    demo: { greeting: "Habitants, associations, écoles,", prefix: "Cher·e", body: "Chaque 20 mai, nous célébrons ce qui nous rassemble. Cette année, chaque région aura son stand : plats, danses et artisanat.\n\nInscrivez votre groupe au défilé avant le 10 mai.", signature: "L'association Bonabéri Ensemble" },
    starter: { greeting: "Habitants, associations, écoles,", prefix: "Cher·e", body: "Chaque 20 mai, nous célébrons ce qui nous rassemble : plats, danses et artisanat de toutes les régions.\n\nInscrivez votre groupe au défilé à l'avance." },
  },
  maman: {
    illus: 'mother',
    frame: 'circle',
    gallery: ["Fête 2026","Les bouquets","Le déjeuner","Les enfants","Coin photo","Les mamans"],
    demo: { greeting: "Chères mamans,", prefix: "Chère", body: "Vous portez nos familles au quotidien. Ce dimanche, c'est à nous de vous servir.\n\nInscrivez-vous, ou inscrivez votre maman : chaque maman présente repartira avec un bouquet et une photo encadrée.", signature: "Les jeunes de la paroisse Sainte-Anne" },
    starter: { greeting: "Chères mamans,", prefix: "Chère", body: "Vous portez nos familles au quotidien. Ce jour-là, c'est à nous de vous servir.\n\nInscrivez-vous, ou inscrivez votre maman : une surprise attend chaque maman présente." },
  },
}

export const invitationFor = (theme) => INVITATIONS[theme] ?? null

// Texte de départ d'un modèle classique (sans thème) : sobre, valable pour tout événement.
export const DEFAULT_INVITATION = {
  greeting: 'Chère famille, chers amis,',
  prefix: 'Cher·e',
  body: 'Nous serions heureux de vous compter parmi nous pour ce moment important.\n\nVotre présence à nos côtés sera notre plus beau cadeau.',
}

// Contenu du bloc Invitation à la création : texte de départ du modèle, signé du nom affiché.
export function invitationStarter(template, signature, eventTypeId) {
  const inv = invitationFor(template?.theme)
  const starter = inv?.starterFor?.[eventTypeId] ?? inv?.starter ?? DEFAULT_INVITATION
  return { ...starter, signature: signature ?? '' }
}
