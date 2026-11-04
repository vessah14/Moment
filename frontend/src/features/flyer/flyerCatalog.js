// GÉNÉRÉ depuis le prototype « modeles/flyer.html » (catalogue flyers-catalog.js). Studio « Flyer d'honneur ».
/* TBF MOMENT · catalogue des flyers « Mise à l'honneur ».
   Ajouter une occasion = ajouter une fiche dans OCC (textes, champs, styles conseillés) et ses messages dans W,
   puis la rattacher aux types d'événements dans TYPES. Aucun code de dessin à modifier.
   g : « v » vœux, « a » annonce (avec QR code). nm : âge | noces | jours | year. f : champs du formulaire [libellé, exemple, aide].
   Les messages : {A} = appellation (Maman, le prénom…), {n} = le nombre ; une phrase avec {n} n'est proposée que si le nombre est rempli.
   En production, ce fichier peut être servi par l'API (GET /api/flyers/catalog) et édité depuis l'administration. */
export const TBFFLY = (function () {
"use strict";
const OCC = {
  /* ----- Vœux ----- */
  anniversaire: { g: "v", l: "Anniversaire", i: "gift", kick: "Joyeux", big: "anniversaire", caps: "Joyeux anniversaire", nm: "age", mus: "birthday", styles: ["icone", "neon", "lumiere", "duo", "reve", "tournesol", "star", "eclat", "souvenirs", "wax", "prestige", "pop", "elegance", "affiche"],
    f: { nom: ["Prénom", "Ex. Manuella"], num: ["Âge", "Ex. 30", "Facultatif"], sous: ["Date", "Ex. 30 octobre", "Facultatif"] } },
  noces: { g: "v", l: "Anniversaire de mariage", i: "rings", kick: "Joyeux anniversaire", big: "de mariage", caps: "Joyeux anniversaire de mariage", nm: "noces", rel: false, styles: ["prestige", "elegance", "star", "souvenirs", "wax"],
    forms: ["Avec toute notre affection", "Vos enfants", "Félicitations"], f: { nom: ["Prénoms du couple", "Ex. Rosine & Arnaud"], num: ["Années de mariage", "Ex. 25", "Facultatif"], sous: ["Date", "Ex. Depuis le 12 août 2001", "Facultatif"] } },
  mariage: { g: "v", l: "Félicitations mariage", i: "rings", kick: "Vive les mariés", big: "Félicitations", caps: "Félicitations aux mariés", rel: false, styles: ["elegance", "star", "prestige", "souvenirs", "wax", "eclat", "affiche"],
    forms: ["Avec toute notre affection", "Félicitations", "Avec amour"], f: { nom: ["Prénoms des mariés", "Ex. Grâce & Junior"], sous: ["Date", "Ex. Samedi 24 avril 2027", "Facultatif"] } },
  naissance: { g: "v", l: "Naissance", i: "baby", pal: 2, kick: "Bienvenue", big: "petit trésor", caps: "Bienvenue bébé", rel: false, styles: ["eclat", "elegance", "souvenirs", "pop", "star"],
    forms: ["Avec tout notre amour", "Félicitations aux parents", "Bisous"], f: { nom: ["Prénom du bébé", "Ex. Nathan"], sous: ["Naissance", "Ex. Né le 12 mars 2027 · 3,2 kg", "Facultatif"] } },
  bapteme: { g: "v", l: "Baptême", i: "dove", pal: 3, kick: "Heureux", big: "baptême", caps: "Heureux baptême", tones: ["affectueux", "spirituel", "formel"], styles: ["elegance", "eclat", "prestige", "souvenirs"],
    f: { nom: ["Prénom", "Ex. Emmanuel"], sous: ["Date", "Ex. Dimanche 9 mai 2027", "Facultatif"] } },
  communion: { g: "v", l: "Communion", i: "dove", pal: 1, kick: "Heureuse", big: "communion", caps: "Heureuse communion", tones: ["affectueux", "spirituel", "formel"], styles: ["elegance", "eclat", "prestige", "souvenirs"],
    f: { nom: ["Prénom", "Ex. Chloé"], sous: ["Date", "Ex. Dimanche 30 mai 2027", "Facultatif"] } },
  examen: { g: "v", l: "Diplôme", i: "cap", kick: "Bravo", big: "Félicitations", caps: "Félicitations", styles: ["icone", "star", "neon", "lumiere", "eclat", "affiche", "wax", "souvenirs", "prestige", "pop", "elegance"],
    f: { nom: ["Prénom", "Ex. Kevin"], sous: ["La réussite", "Ex. Admis au BAC série D", "Ce qui s'affiche sous le nom"] } },
  promotion: { g: "v", l: "Promotion", i: "up", kick: "Bravo", big: "Félicitations", caps: "Félicitations", styles: ["icone", "lumiere", "affiche", "star", "pro", "prestige", "wax", "eclat", "elegance"],
    f: { nom: ["Prénom et nom", "Ex. Sandrine Etoundi"], sous: ["Le nouveau poste", "Ex. Nommée Directrice commerciale", "Ce qui s'affiche sous le nom"] } },
  meres: { g: "v", l: "Fête des mères", i: "heart", kick: "Bonne fête", big: "Maman", caps: "Bonne fête Maman", rel: false, styles: ["eclat", "duo", "tournesol", "neon", "elegance", "star", "souvenirs", "wax", "pop"],
    forms: ["Je t'aime", "Ton enfant qui t'aime", "Avec tout mon amour"], f: { nom: ["Prénom de votre maman", "Ex. Maman Odile"], sous: ["Une ligne", "Ex. La meilleure des mamans", "Facultatif"] } },
  peres: { g: "v", l: "Fête des pères", i: "heart", kick: "Bonne fête", big: "Papa", caps: "Bonne fête Papa", rel: false, styles: ["icone", "lumiere", "affiche", "star", "eclat", "wax", "prestige"],
    forms: ["Je t'aime", "Ton enfant qui t'aime", "Avec respect et amour"], f: { nom: ["Prénom de votre papa", "Ex. Papa Jean"], sous: ["Une ligne", "Ex. Mon héros pour toujours", "Facultatif"] } },
  valentin: { g: "v", l: "Saint-Valentin", i: "heart", pal: 1, kick: "Joyeuse", big: "Saint-Valentin", caps: "Joyeuse Saint-Valentin", tones: ["affectueux", "drole", "spirituel"], styles: ["star", "duo", "neon", "elegance", "pop", "souvenirs", "eclat"],
    forms: ["Je t'aime", "Pour toujours", "Ton amour"], f: { nom: ["Prénom de votre moitié", "Ex. Junior"], sous: ["Une ligne", "Ex. Mon amour pour toujours", "Facultatif"] } },
  noel: { g: "v", l: "Noël", i: "tree", kick: "Joyeux", big: "Noël", caps: "Joyeux Noël", rel: false, styles: ["prestige", "eclat", "star", "wax", "elegance", "pop"],
    forms: ["Avec toute notre affection", "Joyeuses fêtes", "Toute l'équipe"], f: { nom: ["Pour qui ?", "Ex. La famille Kamdem"], sous: ["Une ligne", "Ex. Et de belles fêtes de fin d'année", "Facultatif"] } },
  nouvelan: { g: "v", l: "Nouvel An", i: "spark", kick: "Bonne année", big: "", caps: "Bonne année", nm: "year", rel: false, styles: ["star", "prestige", "eclat", "affiche", "wax"],
    forms: ["Meilleurs vœux", "Avec toute notre affection", "Toute l'équipe"], f: { nom: ["De la part de / pour", "Ex. La famille Kamdem"], num: ["Année", "Ex. 2027", ""], sous: ["Une ligne", "Ex. Santé, paix et prospérité", "Facultatif"] } },
  paques: { g: "v", l: "Pâques", i: "dove", pal: 1, kick: "Joyeuses", big: "Pâques", caps: "Joyeuses Pâques", rel: false, tones: ["affectueux", "spirituel", "formel"], styles: ["elegance", "eclat", "prestige", "wax"],
    forms: ["Avec toute notre affection", "Bonnes fêtes", "Toute l'équipe"], f: { nom: ["Pour qui ?", "Ex. Toute la famille"], sous: ["Une ligne", "Ex. Christ est ressuscité", "Facultatif"] } },
  aid: { g: "v", l: "Aïd", i: "moon", kick: "Aïd", big: "Moubarak", caps: "Aïd Moubarak", rel: false, tones: ["affectueux", "spirituel", "formel"], styles: ["prestige", "elegance", "eclat", "wax"],
    forms: ["Avec toute notre affection", "Bonne fête", "Toute l'équipe"], f: { nom: ["Pour qui ?", "Ex. Toute la communauté"], sous: ["Une ligne", "Ex. Bonne fête de Tabaski", "Facultatif"] } },
  fetenat: { g: "v", l: "Fête du 20 mai", i: "flag", kick: "Bonne fête", big: "de l'Unité", caps: "Bonne fête de l'Unité", rel: false, tones: ["affectueux", "formel"], styles: ["wax", "eclat", "affiche", "prestige"],
    forms: ["Vive le Cameroun", "Toute l'équipe", "Avec fierté"], f: { nom: ["De la part de / pour", "Ex. IUGET de Bonabérie"], sous: ["Une ligne", "Ex. 20 mai · Fête nationale", "Facultatif"] } },
  hommage: { g: "v", l: "Hommage", i: "flame", kick: "In memoriam", big: "Hommage", caps: "Hommage", mus: "soft", tones: ["affectueux", "spirituel", "formel"], styles: ["sobre", "prestige", "elegance"],
    forms: ["Avec tout notre amour", "Repose en paix", "Ta famille"], f: { nom: ["Nom de la personne", "Ex. Papa Emmanuel Tchinda"], sous: ["Dates", "Ex. 1952 – 2026", "Facultatif"] } },
  /* ----- Annonces (avec QR code vers la page de l'événement) ----- */
  savedate: { g: "a", l: "Réservez la date", i: "cal", kick: "Save the date", big: "Réservez la date", caps: "Réservez la date", rel: false, qrl: "Toutes les infos", styles: ["elegance", "star", "prestige", "eclat", "wax"],
    forms: ["", "Avec joie", "Les familles"], f: { nom: ["Prénoms / titre", "Ex. Grâce & Junior"], sous: ["Une ligne", "Ex. se disent oui", "Facultatif"], quand: ["Date", "Ex. Samedi 24 avril 2027"], lieu: ["Ville ou lieu", "Ex. Douala"], lien: 1 } },
  invitation: { g: "a", l: "Invitation", i: "mail", kick: "Vous êtes invités", big: "Invitation", caps: "Vous êtes invités", rel: false, qrl: "Scannez pour répondre", styles: ["elegance", "star", "eclat", "prestige", "wax", "pro", "event"],
    forms: ["", "Organisé par", "Avec joie"], f: { nom: ["Titre ou prénoms", "Ex. Les 30 ans de Manuella"], sous: ["Une ligne", "Ex. Tenue blanche exigée", "Facultatif"], quand: ["Date et heure", "Ex. Samedi 21 novembre · 18h"], lieu: ["Lieu", "Ex. Rooftop Le Phare, Bonapriso"], lien: 1 } },
  compte: { g: "a", l: "Compte à rebours", i: "clock", kick: "Plus que", big: "", caps: "", nm: "jours", rel: false, qrl: "Toutes les infos", styles: ["star", "eclat", "pop", "wax", "souvenirs", "affiche", "prestige", "elegance", "event"],
    forms: ["On vous attend", "À très vite", "Avec joie"], f: { nom: ["Pour qui ?", "Ex. Manuella"], num: ["Jours restants", "Ex. 3", "0 = c'est aujourd'hui"], sous: ["L'événement", "Ex. Ses 30 ans", "Facultatif"], quand: ["Date et heure", "Ex. Samedi 21 novembre · 18h", "Facultatif"], lieu: ["Lieu", "Ex. Rooftop Le Phare", "Facultatif"], lien: 1 } },
  cesoir: { g: "a", l: "C'est ce soir", i: "spark", kick: "C'est", big: "ce soir !", caps: "C'est ce soir !", rel: false, qrl: "Itinéraire et infos", styles: ["event", "star", "eclat", "pop", "wax"],
    forms: ["", "On vous attend", "Les organisateurs"], f: { nom: ["Titre", "Ex. Douala Live Sessions"], sous: ["Une ligne", "Ex. Portes à 19h", "Facultatif"], quand: ["Heure", "Ex. Ce soir · 20h"], lieu: ["Lieu", "Ex. Esplanade du Wouri"], lien: 1 } },
  concert: { g: "a", l: "Affiche de concert", i: "music", kick: "En concert", big: "", caps: "En concert", rel: false, qrl: "Billets", styles: ["event", "star", "affiche"],
    forms: ["", "Organisé par", "Production"], f: { nom: ["Artiste ou titre", "Ex. Kémi Ndjock"], sous: ["Une ligne", "Ex. + invités surprise", "Facultatif"], quand: ["Date et heure", "Ex. Samedi 13 février · 20h"], lieu: ["Lieu", "Ex. Esplanade du Wouri, Douala"], prix: ["Prix", "Ex. Dès 5 000 FCFA", "Facultatif"], lien: 1 } },
  match: { g: "a", l: "Affiche de match", i: "ball", kick: "Grand match", big: "", caps: "Grand match", rel: false, qrl: "Billets", styles: ["event", "affiche", "star"],
    forms: ["", "Organisé par", "Allez"], f: { nom: ["Les équipes", "Ex. Lions FC vs Wouri United"], sous: ["Compétition", "Ex. Finale · Coupe des entreprises", "Facultatif"], quand: ["Date et heure", "Ex. Samedi 27 mars · 15h30"], lieu: ["Stade", "Ex. Stade de la Réunification"], prix: ["Prix", "Ex. Tribune 2 000 FCFA", "Facultatif"], lien: 1 } },
  conference: { g: "a", l: "Conférence", i: "mic", kick: "Conférence", big: "", caps: "Conférence", rel: false, qrl: "S'inscrire", styles: ["pro", "event", "eclat", "elegance"],
    forms: ["", "Organisé par", "Contact"], f: { nom: ["Titre", "Ex. Tech & IA au Cameroun"], sous: ["Intervenant(s)", "Ex. Avec Dr Ange Mbia", "Facultatif"], quand: ["Date et heure", "Ex. Mardi 18 mai · 8h30"], lieu: ["Lieu", "Ex. Centre de conférences, Bonanjo"], prix: ["Prix", "Ex. Entrée libre sur inscription", "Facultatif"], lien: 1 } },
  inscriptions: { g: "a", l: "Inscriptions ouvertes", i: "cap", kick: "Inscriptions", big: "ouvertes", caps: "Inscriptions ouvertes", rel: false, qrl: "S'inscrire", styles: ["pro", "eclat", "event", "wax"],
    forms: ["", "Contact", "La direction"], f: { nom: ["Établissement ou programme", "Ex. IUGET de Bonabérie"], sous: ["Une ligne", "Ex. BTS · Licence · Master", "Facultatif"], quand: ["Dates", "Ex. Jusqu'au 30 septembre"], lieu: ["Lieu", "Ex. Campus de Bonabérie"], prix: ["Frais", "Ex. Dossier 10 000 FCFA", "Facultatif"], lien: 1 } },
  avis: { g: "a", l: "Avis de décès", i: "flame", kick: "Avis de décès", big: "", caps: "Avis de décès", mus: "soft", rel: false, qrl: "Programme des obsèques", styles: ["sobre", "prestige", "elegance"],
    forms: ["La famille", "Les enfants", "La famille éplorée"], f: { nom: ["Nom de la personne", "Ex. Papa Emmanuel Tchinda"], sous: ["Dates", "Ex. 1952 – 2026"], quand: ["Obsèques", "Ex. Samedi 27 février 2027"], lieu: ["Lieu", "Ex. Bangangté"], lien: 1 } },
  remerciements: { g: "a", l: "Remerciements", i: "heart", kick: "Merci", big: "Merci", caps: "Merci", rel: false, qrl: "Voir les photos", styles: ["elegance", "eclat", "star", "souvenirs", "sobre", "pro"],
    forms: ["", "Avec gratitude", "La famille"], f: { nom: ["De la part de", "Ex. Grâce & Junior"], sous: ["Une ligne", "Ex. Merci d'avoir été là", "Facultatif"], lien: 1 } }
};
const W = {
  anniversaire: {
    affectueux: ["{A}, que cette nouvelle année t'apporte autant de bonheur que tu en donnes autour de toi. Joyeux anniversaire !",
      "Merci d'être toi, tout simplement. Que tes {n} ans soient remplis de rires, de projets réussis et de belles surprises.",
      "Aujourd'hui, on célèbre une personne en or. Je te souhaite la santé, l'amour et la réussite. Joyeux anniversaire, {A} !"],
    drole: ["{n} ans et pas une ride ! On attend toujours la recette secrète. Joyeux anniversaire, {A} !",
      "Encore une bougie de plus… Heureusement que les pompiers sont prévenus ! Passe une journée de folie.",
      "Aujourd'hui tu as droit à tout : gâteau, cadeaux et zéro reproche. Profite, demain on recommence !"],
    spirituel: ["Que le Seigneur bénisse ta nouvelle année, qu'Il guide tes pas et remplisse ton cœur de paix. Joyeux anniversaire, {A} !",
      "Rendons grâce à Dieu pour ta vie. Que cette année soit celle des portes ouvertes et des prières exaucées.",
      "Que la grâce de Dieu t'accompagne chaque jour de tes {n} ans. Longue vie et santé, {A} !"],
    formel: ["Nous vous souhaitons un excellent anniversaire. Que cette nouvelle année vous apporte réussite et sérénité.",
      "Je vous adresse mes meilleurs vœux de santé, de bonheur et de succès en ce jour particulier.",
      "Joyeux anniversaire ! Merci pour votre engagement et votre bienveillance au quotidien."]
  },
  examen: {
    affectueux: ["Bravo, {A} ! Cette réussite récompense tes nuits de travail. Quelle fierté pour nous tous !",
      "Tu l'as fait ! Le diplôme est en poche, et le meilleur reste à venir. Félicitations !",
      "Félicitations pour ce beau succès ! Que ce soit le premier d'une longue série."],
    drole: ["Les nuits blanches ont payé… Maintenant tu peux enfin dormir ! Bravo, {A} !",
      "Le diplôme est dans la poche ! Prochaine étape : la fête, et c'est toi qui régales.",
      "Officiellement plus diplômé que nous tous. On ne pourra plus te contredire ! Félicitations !"],
    spirituel: ["Dieu a fait de grandes choses ! Félicitations, {A}. Que le Seigneur continue d'ouvrir tes portes.",
      "Toute la gloire à Dieu pour cette réussite. Que ce succès soit le début de grandes bénédictions.",
      "Ton travail et ta foi ont porté du fruit. Félicitations, que Dieu guide la suite de ton parcours."],
    formel: ["Toutes nos félicitations pour cette belle réussite. Nous vous souhaitons plein succès pour la suite.",
      "Félicitations pour ce diplôme amplement mérité. Votre persévérance est un exemple.",
      "Nous saluons votre réussite et vous adressons nos meilleurs vœux pour l'avenir."]
  },
  promotion: {
    affectueux: ["Bravo, {A} ! Cette nomination récompense ton travail et ton talent. Tu le mérites tellement.",
      "Nouveau poste, nouveaux défis : je sais que tu vas briller. Félicitations !",
      "Ta réussite fait la fierté de toute la famille. Félicitations pour cette belle promotion !"],
    drole: ["Félicitations, chef ! On attend maintenant l'augmentation… de nos invitations au restaurant.",
      "Promotion méritée ! On savait que tu irais loin, mais pas jusqu'au bureau avec la clim.",
      "Bravo ! Avec ce nouveau poste, n'oublie pas ceux qui t'ont soutenu depuis le début."],
    spirituel: ["Le Seigneur élève ceux qui le servent avec fidélité. Félicitations pour cette promotion, {A} !",
      "Gloire à Dieu pour cette nouvelle étape. Qu'Il te donne la sagesse pour tes nouvelles responsabilités.",
      "Que Dieu bénisse ton nouveau poste et fasse de toi une bénédiction pour les autres."],
    formel: ["Toutes nos félicitations pour votre nomination. Nous vous souhaitons pleine réussite dans vos nouvelles fonctions.",
      "Félicitations pour cette promotion amplement méritée. Au plaisir de poursuivre notre collaboration.",
      "Nous saluons votre nomination et vous adressons nos meilleurs vœux de succès."]
  },
  mariage: {
    affectueux: ["Que votre amour grandisse chaque jour un peu plus. Félicitations aux jeunes mariés !",
      "Deux cœurs, une seule route. Je vous souhaite une vie remplie de tendresse et de complicité.",
      "Quel bonheur de vous voir unis ! Tout le bonheur du monde pour cette nouvelle vie à deux."],
    drole: ["Ça y est, c'est officiel : plus moyen de s'échapper ! Félicitations et longue vie aux mariés !",
      "Félicitations ! Que vos disputes soient courtes et vos repas de famille… très longs.",
      "Le « oui » est dit, la fête peut commencer ! Tout le bonheur aux mariés."],
    spirituel: ["Que Dieu bénisse votre union et fasse de votre foyer un lieu de paix et d'amour.",
      "Ce que Dieu a uni, que rien ne le sépare. Félicitations aux mariés !",
      "Que le Seigneur soit le pilier de votre foyer. Heureux mariage !"],
    formel: ["Nous vous adressons nos plus sincères félicitations et nos meilleurs vœux de bonheur.",
      "Toutes nos félicitations pour votre mariage. Que cette union vous apporte joie et sérénité.",
      "Félicitations aux mariés ! Nous vous souhaitons une longue et heureuse vie commune."]
  },
  hommage: {
    affectueux: ["{A}, ton sourire et ta bonté resteront à jamais dans nos cœurs. Repose en paix.",
      "Tu nous as tant donné. Ton souvenir nous guidera chaque jour. Nous t'aimons.",
      "Ta place reste vide, mais ton amour remplit encore nos vies. Repose en paix, {A}."],
    spirituel: ["Le Seigneur t'a rappelé auprès de Lui. Que ton âme repose en paix dans sa lumière.",
      "Heureux ceux qui meurent dans le Seigneur. Repose en paix, {A}, jusqu'au revoir.",
      "Que Dieu t'accueille dans sa paix éternelle. Ta mémoire restera bénie parmi nous."],
    formel: ["Nous rendons hommage à une personne d'exception. Nos pensées accompagnent sa famille.",
      "Son engagement et sa générosité resteront un exemple pour nous tous. Repose en paix.",
      "En ce moment de deuil, nous exprimons nos sincères condoléances à toute la famille."]
  },
  compte: {
    _: ["Plus que {n} jours avant le grand moment ! Vous êtes prêts ?", "Le compte à rebours a commencé. On vous attend nombreux !",
      "Bientôt la fête ! Réservez la date et préparez vos plus belles tenues."]
  },
  noces: {
    affectueux: ["{n} ans d'amour et toujours la même complicité. Joyeux anniversaire de mariage !", "Votre couple est une inspiration pour nous tous. Que votre amour continue de grandir.", "Merci de nous montrer ce qu'est un amour qui dure. Joyeux anniversaire de mariage !"],
    drole: ["{n} ans à se supporter… c'est plus fort que l'amour, c'est de l'héroïsme ! Joyeux anniversaire de mariage.", "Toujours ensemble, toujours d'accord sur le choix du restaurant… ou presque ! Bonne fête à vous deux.", "Ils ont dit oui, et ils n'ont jamais changé d'avis. Bravo les amoureux !"],
    spirituel: ["Que Dieu continue de bénir votre foyer et de fortifier votre union. Joyeux anniversaire de mariage !", "Rendons grâce pour ces {n} années d'amour fidèle. Que le Seigneur vous garde encore longtemps ensemble.", "Ce que Dieu a uni grandit avec le temps. Heureux anniversaire de mariage !"],
    formel: ["Toutes nos félicitations pour ces {n} années de mariage. Nous vous souhaitons encore de longues années de bonheur.", "Nous vous adressons nos meilleurs vœux à l'occasion de votre anniversaire de mariage.", "Félicitations pour ce bel anniversaire de mariage, signe d'une union solide et heureuse."]
  },
  naissance: {
    affectueux: ["Bienvenue au monde, petit trésor ! Tu es déjà tellement aimé.", "Une nouvelle étoile est née. Félicitations aux heureux parents, profitez de chaque instant !", "Que ta vie soit douce, pleine de rires et de câlins. Bienvenue parmi nous !"],
    drole: ["Félicitations ! Les nuits courtes commencent… mais quel bonheur !", "Bienvenue petit chef : la maison a désormais un nouveau patron.", "Un nouveau membre dans l'équipe ! Préparez les biberons et les appareils photo."],
    spirituel: ["Les enfants sont un don de Dieu. Que le Seigneur bénisse ce bébé et ses parents.", "Gloire à Dieu pour cette naissance ! Que ce petit grandisse en sagesse et en grâce.", "Que Dieu veille sur toi, petit ange, aujourd'hui et chaque jour de ta vie."],
    formel: ["Toutes nos félicitations pour l'arrivée de votre enfant. Nous vous souhaitons beaucoup de bonheur.", "Nous partageons votre joie et adressons nos meilleurs vœux au bébé et à ses parents.", "Félicitations pour cette heureuse naissance ! Tous nos vœux de santé à la maman et au bébé."]
  },
  bapteme: {
    affectueux: ["Heureux baptême, mon petit cœur ! Que cette journée reste un beau souvenir pour toute la famille.", "Une journée lumineuse pour une âme si précieuse. Heureux baptême !", "Que la paix et l'amour t'accompagnent toujours. Félicitations pour ton baptême !"],
    spirituel: ["Aujourd'hui tu deviens enfant de Dieu. Que sa lumière guide chacun de tes pas.", "Que le Seigneur te bénisse et te garde, qu'Il fasse briller sur toi sa face. Heureux baptême !", "Que ce baptême soit le début d'une belle marche avec Dieu. Nous prions pour toi."],
    formel: ["Toutes nos félicitations à l'occasion de ce baptême. Nos meilleurs vœux à l'enfant et à sa famille.", "Nous nous associons à votre joie en ce jour de baptême.", "Félicitations et meilleurs vœux pour cette belle cérémonie."]
  },
  communion: {
    affectueux: ["Félicitations pour ta communion, {A} ! Que cette belle étape te remplisse de joie.", "Une journée importante pour un cœur si pur. Nous sommes fiers de toi !", "Que ta foi grandisse et éclaire toute ta vie. Félicitations !"],
    spirituel: ["Que Jésus reste toujours dans ton cœur. Heureuse communion, {A} !", "Que le Seigneur te comble de sa grâce en ce jour béni.", "Que cette communion fortifie ta foi et t'accompagne toute ta vie."],
    formel: ["Toutes nos félicitations pour cette belle célébration. Nos meilleurs vœux vous accompagnent.", "Nous nous réjouissons avec vous en ce jour de communion.", "Félicitations pour cette étape importante de la vie de foi."]
  },
  meres: {
    affectueux: ["Bonne fête, Maman ! Merci pour ton amour sans limites et tous tes sacrifices.", "Tu es mon exemple, ma force et mon refuge. Je t'aime, Maman.", "Une maman comme toi, c'est un trésor. Bonne fête à la meilleure des mamans !"],
    drole: ["Bonne fête, Maman ! Promis, cette année je range ma chambre… peut-être.", "Merci de m'avoir supporté toutes ces années. Tu mérites une médaille !", "Maman, tu avais raison sur presque tout. Voilà, c'est dit. Bonne fête !"],
    spirituel: ["Que Dieu te bénisse, Maman, et te donne longue vie et santé. Bonne fête !", "Je rends grâce à Dieu de m'avoir donné une maman comme toi.", "Que le Seigneur te rende au centuple tout l'amour que tu nous donnes."],
    formel: ["Bonne fête à toutes les mamans ! Merci pour votre amour et votre dévouement.", "Nous souhaitons une très belle fête à toutes les mères.", "À toutes les mamans, merci. Bonne fête des mères !"]
  },
  peres: {
    affectueux: ["Bonne fête, Papa ! Merci d'être mon héros depuis toujours.", "Ta force et ta sagesse me guident chaque jour. Je t'aime, Papa.", "Merci pour tout ce que tu fais pour nous. Bonne fête au meilleur des papas !"],
    drole: ["Bonne fête, Papa ! Aujourd'hui, la télécommande est à toi.", "Merci pour tes blagues… même les moins drôles. Bonne fête !", "Papa, le seul homme qui peut réparer n'importe quoi avec du scotch. Bonne fête !"],
    spirituel: ["Que Dieu te bénisse, Papa, et te garde encore longtemps auprès de nous.", "Merci Seigneur pour ce père aimant. Bonne fête, Papa !", "Que la sagesse de Dieu continue d'éclairer ton chemin. Bonne fête !"],
    formel: ["Bonne fête à tous les papas ! Merci pour votre engagement et votre amour.", "Nous souhaitons une excellente fête à tous les pères.", "À tous les papas, merci. Bonne fête des pères !"]
  },
  valentin: {
    affectueux: ["Avec toi, chaque jour est une Saint-Valentin. Je t'aime, {A}.", "Tu es ma plus belle histoire. Joyeuse Saint-Valentin, mon cœur.", "Merci de rendre ma vie si douce. Je t'aime plus que les mots."],
    drole: ["Tu es la seule personne avec qui je partage mes frites. C'est de l'amour, non ?", "Joyeuse Saint-Valentin à la personne qui supporte mes ronflements !", "Je t'aime plus que le wifi. Et ça, c'est beaucoup."],
    spirituel: ["Que Dieu bénisse notre amour et le garde toujours fort. Joyeuse Saint-Valentin !", "L'amour est patient, l'amour est bon. Merci Seigneur pour toi, {A}.", "Je remercie Dieu chaque jour de t'avoir mis sur mon chemin."]
  },
  noel: {
    affectueux: ["Joyeux Noël ! Que cette fête vous apporte chaleur, paix et beaux moments en famille.", "Plein de douceur, de rires et de lumière pour ce Noël. Je vous embrasse !", "Que la magie de Noël remplisse votre maison de bonheur."],
    drole: ["Joyeux Noël ! Attention au deuxième plat de ndolé, le régime commence le 2 janvier.", "Le Père Noël m'a dit que tu avais été sage… presque. Joyeux Noël !", "Que vos cadeaux soient nombreux et vos tantes discrètes. Joyeux Noël !"],
    spirituel: ["Un Sauveur nous est né ! Que la paix du Christ remplisse vos cœurs. Joyeux Noël.", "Que la lumière de Noël éclaire votre foyer et votre année. Joyeux Noël !", "Que l'Enfant Jésus vous bénisse, vous et toute votre famille."],
    formel: ["Toute l'équipe vous souhaite un joyeux Noël et de très belles fêtes de fin d'année.", "Nous vous adressons nos meilleurs vœux de paix et de joie pour Noël.", "Joyeuses fêtes ! Merci pour votre confiance tout au long de l'année."]
  },
  nouvelan: {
    affectueux: ["Bonne année {n} ! Santé, amour et réussite pour toi et ta famille.", "Que cette nouvelle année réalise tous tes rêves. Bonne et heureuse année !", "Nouveau départ, nouvelles joies ! Je te souhaite le meilleur pour {n}."],
    drole: ["Bonne année ! Que tes résolutions tiennent au moins jusqu'en février.", "{n} : nouvelle année, même toi, mais en mieux ! Bonne année !", "Que ton compte Mobile Money soit aussi rempli que ton assiette du réveillon !"],
    spirituel: ["Que Dieu vous accompagne tout au long de {n} et ouvre devant vous des portes de bénédiction.", "Nous confions cette nouvelle année au Seigneur. Bonne et sainte année !", "Que la grâce de Dieu vous précède en {n}. Bonne année !"],
    formel: ["Toute l'équipe vous présente ses meilleurs vœux pour {n} : santé, prospérité et réussite.", "Nous vous souhaitons une excellente année {n} et vous remercions de votre fidélité.", "Meilleurs vœux de bonheur et de succès pour la nouvelle année."]
  },
  paques: {
    affectueux: ["Joyeuses Pâques ! Plein de douceur et de beaux moments en famille.", "Que cette fête de Pâques vous apporte joie, paix et renouveau.", "Bonnes Pâques à toi et à tous ceux que tu aimes !"],
    spirituel: ["Christ est ressuscité ! Joyeuses Pâques et que sa victoire remplisse vos cœurs d'espérance.", "Que la lumière de la Résurrection éclaire votre vie. Joyeuses Pâques !", "Il est vivant ! Que la paix du Seigneur soit avec vous. Bonnes fêtes de Pâques."],
    formel: ["Nous vous souhaitons de joyeuses fêtes de Pâques.", "Toute l'équipe vous adresse ses meilleurs vœux pour Pâques.", "Joyeuses Pâques à vous et à vos proches."]
  },
  aid: {
    affectueux: ["Aïd Moubarak ! Que cette fête vous apporte joie, paix et bonheur en famille.", "Que la paix et la joie remplissent votre maison. Bonne fête de l'Aïd !", "Plein de bonheur et de partage pour cette belle fête. Aïd Moubarak !"],
    spirituel: ["Aïd Moubarak ! Qu'Allah accepte vos prières et vous comble de ses bienfaits.", "Que cette fête soit bénie pour vous et vos proches. Aïd Moubarak !", "Qu'Allah vous accorde la paix, la santé et la prospérité. Bonne fête !"],
    formel: ["Toute l'équipe vous souhaite une bonne fête de l'Aïd.", "Nous adressons nos meilleurs vœux à toute la communauté musulmane. Aïd Moubarak !", "Aïd Moubarak à vous et à vos familles."]
  },
  fetenat: {
    affectueux: ["Bonne fête de l'Unité ! Fiers d'être Camerounais, unis dans notre diversité.", "Joyeux 20 mai à toute la famille ! Vive le Cameroun.", "Un seul peuple, mille couleurs. Bonne fête nationale !"],
    formel: ["Toute l'équipe vous souhaite une excellente fête nationale de l'Unité.", "En ce 20 mai, célébrons ensemble l'unité de notre nation.", "Bonne fête nationale à toutes et à tous !"]
  },
  savedate: { _: ["Notez la date, on vous attend pour célébrer avec nous !", "Le grand jour approche : réservez dès maintenant cette date.", "Faire-part officiel à suivre. Bloquez la date dans votre agenda !"] },
  invitation: { _: ["Vous êtes cordialement invités. Votre présence nous ferait plaisir !", "Venez partager ce moment avec nous. Merci de confirmer votre présence.", "On compte sur vous ! Scannez le code pour répondre."] },
  cesoir: { _: ["C'est ce soir ! Dernière chance de nous rejoindre.", "Le jour J est arrivé : on vous attend !", "Plus que quelques heures… Rendez-vous ce soir !"] },
  remerciements: { _: ["Merci d'avoir été là pour partager ce moment. Votre présence a tout changé.", "Du fond du cœur, merci pour votre présence, vos messages et votre soutien.", "Merci à tous ! Les photos arrivent bientôt sur la page de l'événement."] },
  concert: { _: ["Une soirée exceptionnelle en live. Places limitées, réservez vite !", "Le show que vous attendiez. Billets disponibles en Mobile Money.", "Dernières places ! Scannez pour réserver votre billet."] },
  match: { _: ["Venez nombreux soutenir votre équipe !", "Un match à ne pas manquer. Billets en vente maintenant.", "Ambiance garantie ! Réservez votre place avant qu'il ne soit trop tard."] },
  conference: { _: ["Une rencontre pour apprendre, échanger et développer votre réseau.", "Places limitées : inscrivez-vous dès maintenant.", "Entrée sur inscription. Scannez le code pour réserver votre place."] },
  inscriptions: { _: ["Les inscriptions sont ouvertes ! Ne manquez pas votre place.", "Rejoignez-nous pour la nouvelle année. Inscriptions en ligne.", "Places limitées. Scannez pour vous inscrire."] },
  avis: { _: ["La famille a la profonde douleur de vous annoncer le décès de leur bien-aimé(e). Le programme des obsèques est sur la page.", "Que son âme repose en paix. La famille remercie tous ceux qui l'accompagnent.", "Veillée, levée de corps et inhumation : toutes les informations sur la page."] }
};
const TYPES = {
  mariage: ["mariage", "savedate", "invitation", "compte", "cesoir", "remerciements"], anniversaire: ["anniversaire", "invitation", "compte", "cesoir", "remerciements"],
  noces: ["noces", "invitation", "compte", "remerciements"], bapteme: ["bapteme", "naissance", "invitation", "remerciements"], "baby-shower": ["naissance", "invitation", "compte"],
  communion: ["communion", "invitation", "remerciements"], "reunion-familiale": ["invitation", "compte", "remerciements"], cremaillere: ["invitation", "cesoir", "remerciements"],
  "soiree-privee": ["invitation", "compte", "cesoir"], religieux: ["communion", "invitation", "compte", "cesoir"], obseques: ["hommage", "avis", "remerciements"], "retrait-deuil": ["hommage", "avis", "remerciements"],
  graduation: ["examen", "invitation", "compte", "remerciements"], scolaire: ["invitation", "compte", "cesoir", "inscriptions"], "portes-ouvertes": ["inscriptions", "invitation", "compte"], kermesse: ["invitation", "compte", "cesoir"],
  conference: ["conference", "compte", "promotion", "remerciements"], entreprise: ["invitation", "conference", "promotion", "remerciements"], lancement: ["conference", "invitation", "compte", "cesoir"],
  concert: ["concert", "compte", "cesoir"], sport: ["match", "compte", "cesoir"], personnalise: ["invitation", "compte", "cesoir", "remerciements"], autre: ["invitation", "compte", "cesoir", "remerciements"],
  noel: ["noel", "invitation", "compte"], "nouvel-an": ["nouvelan", "invitation", "compte", "cesoir"], "saint-valentin": ["valentin", "invitation", "cesoir"], aid: ["aid", "invitation"], paques: ["paques", "invitation"],
  "fete-nationale": ["fetenat", "invitation"], "fete-des-meres": ["meres", "peres", "invitation"]
};
const TLAB = [["prives", "Événements privés", [["mariage", "Mariage et fiançailles"], ["anniversaire", "Anniversaire"], ["noces", "Anniversaire de mariage"], ["bapteme", "Baptême"], ["baby-shower", "Baby shower et naissance"], ["communion", "Communion"], ["reunion-familiale", "Réunion familiale"], ["cremaillere", "Crémaillère"], ["soiree-privee", "Soirée privée"], ["religieux", "Événement religieux"], ["obseques", "Obsèques et hommage"], ["retrait-deuil", "Retrait de deuil"]]],
  ["ecoles", "Écoles", [["graduation", "Graduation"], ["scolaire", "Journée culturelle"], ["portes-ouvertes", "Rentrée et portes ouvertes"], ["kermesse", "Kermesse"]]],
  ["entreprises", "Entreprises et associations", [["conference", "Conférence et séminaire"], ["entreprise", "Événement d'entreprise"], ["lancement", "Lancement et salon"], ["concert", "Concert et spectacle"], ["sport", "Sport"], ["autre", "Autre"]]],
  ["fetes", "Fêtes et saisons", [["noel", "Noël"], ["nouvel-an", "Nouvel An"], ["saint-valentin", "Saint-Valentin"], ["paques", "Pâques"], ["aid", "Aïd"], ["fete-nationale", "Fête du 20 mai"], ["fete-des-meres", "Fête des mères et des pères"]]]];
return { OCC, W, TYPES, TLAB };
})();
