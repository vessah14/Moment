// Contenu initial d'un bloc ajouté dans le Builder. Volontairement sans exemples :
// le Builder affiche exactement le site publié, et les blocs se remplissent avec les
// vraies données de l'événement (programme, galerie, livre d'or, billets, lieu) ou
// avec le texte saisi dans l'onglet Contenu.
export const BLOCK_CONTENT_DEFAULTS = {
  Rebours: {
    heading: "Le grand jour approche",
    body: "",
    showHeading: false,
    tinted: false
  },
  // Salutation (ou « Cher·e Awa, » sur le lien d'un invité), texte et signature.
  Invitation: {
    heading: "Invitation",
    body: "",
    greeting: "",
    prefix: "Cher·e",
    signature: "",
    showHeading: false,
    tinted: false
  },
  Histoire: {
    heading: "Notre Histoire",
    body: "",
    showHeading: true,
    tinted: false
  },
  Programme: {
    heading: "Le Programme de la Journée",
    body: "",
    showHeading: true,
    tinted: true
  },
  Galerie: {
    heading: "Galerie Photos",
    body: "",
    showHeading: true,
    tinted: false
  },
  // Intervenants, artistes, jury, témoins… : nom, rôle et sujet de chacun.
  Intervenants: {
    heading: "Intervenants",
    body: "",
    showHeading: true,
    tinted: true,
    people: []
  },
  Localisation: {
    heading: "Comment Nous Rejoindre",
    body: "",
    showHeading: true,
    tinted: false,
    transport: "",
    additionalVenues: []
  },
  RSVP: {
    heading: "Confirmez Votre Présence",
    body: "",
    showHeading: true,
    tinted: true
  },
  "Livre d'or": {
    heading: "Le Livre d'Or",
    body: "",
    showHeading: true,
    tinted: false
  },
  FAQ: {
    heading: "Foire Aux Questions",
    body: "",
    showHeading: true,
    tinted: false
  },
  Vidéo: {
    heading: "Vidéo",
    body: "",
    showHeading: true,
    tinted: false
  },
  "Plan de table": {
    heading: "Plan de table",
    body: "",
    showHeading: true,
    tinted: false
  },
  Billetterie: {
    heading: "Billetterie",
    body: "",
    showHeading: true,
    tinted: false
  },
  "Pied de page": {
    heading: "",
    body: "",
    showHeading: false,
    tinted: false
  },
  // Dot / mariage coutumier : les deux familles et leurs représentants.
  Familles: {
    heading: "Les familles",
    body: "",
    showHeading: true,
    tinted: false,
    a: { label: "Famille de la mariée", name: "", text: "" },
    b: { label: "Famille du marié", name: "", text: "" }
  },
  "Dress code": {
    heading: "Code vestimentaire",
    body: "",
    showHeading: true,
    tinted: false,
    title: "",
    colors: []
  },
  // Cagnotte Mobile Money ; la liste de souhaits vient de la liste de cadeaux réelle.
  Cadeaux: {
    heading: "Liste de cadeaux",
    body: "",
    showHeading: true,
    tinted: false,
    accounts: []
  },
  Partenaires: {
    heading: "Partenaires",
    body: "",
    showHeading: true,
    tinted: false,
    partners: []
  }
}
