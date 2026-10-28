// Question « côté » du formulaire de réponse, propre à chaque modèle premium (reprise du
// prototype : EVENT.rsvp.sideLabel / sides / cta de chaque <modele>.html). Rangée dans le
// contenu du bloc RSVP ({ sideLabel, sides, cta }) et modifiable dans le Builder ; le
// serveur n'accepte qu'un des choix de la liste.
// - demo : réglage exact de la démo du modèle ;
// - starter : réglage d'un nouvel événement. Les listes qui dépendent de l'événement
//   (branches de la famille, diplômés, départements) partent vides : la question
//   n'apparaît qu'une fois la liste remplie.

export const DEFAULT_SIDE_LABEL = 'Vous êtes invité par'

const WEDDING = ['Famille de la mariée', 'Famille du marié', 'Amis du couple']
const DOWRY = ['Famille de la mariée', 'Famille du marié', 'Les deux familles']
const PRONOSTIC = ["C'est une fille", "C'est un garçon", 'Je ne sais pas, surprise !']
const PAGNE = ['Je commande 1 pagne', 'Je commande 2 pagnes', 'Je commande 3 pagnes ou plus', "J'ai déjà mon pagne", 'Pas de pagne']
const COMING = ['Seul·e', 'En famille', 'Avec une association', 'Avec mon école']
const KIDS = ['0 – 3 ans', '4 – 7 ans', '8 – 12 ans', "Plusieurs tranches d'âge"]
const GROUPS = ['Association', 'École', 'Entreprise', 'Groupe culturel', 'Anciens combattants']

export const RSVP_SIDES = {
  noor: { demo: { sides: WEDDING }, starter: { sides: WEDDING } },
  bloom: {
    demo: { sides: ['Invité·e de la mariée', 'Invité·e du marié', 'Amis du couple'] },
    starter: { sides: ['Invité·e de la mariée', 'Invité·e du marié', 'Amis du couple'] },
  },
  toghu: { demo: { sides: ['Famille Kamdem (mariée)', 'Famille Tchoupo (marié)', 'Les deux familles'] }, starter: { sides: DOWRY } },
  ndop: { demo: { sides: ['Famille Tsafack (mariée)', 'Famille Fokou (marié)', 'Les deux familles'] }, starter: { sides: DOWRY } },
  douceur: { demo: { sideLabel: 'Ton pronostic', sides: PRONOSTIC }, starter: { sideLabel: 'Ton pronostic', sides: PRONOSTIC } },
  racines: {
    demo: { sideLabel: 'Ta branche', sides: ['Branche Paul', 'Branche Marie', 'Branche Jean', 'Branche Esther', 'Branche Samuel', 'Ami·e de la famille'] },
    starter: { sideLabel: 'Ta branche', sides: [] },
  },
  memoire: { demo: { cta: 'Signaler ma présence' }, starter: { cta: 'Signaler ma présence' } },
  souvenir: {
    demo: { sideLabel: 'Pagne de la cérémonie (6 yards, 12 000 FCFA)', sides: PAGNE },
    starter: { sideLabel: 'Pagne de la cérémonie', sides: PAGNE },
  },
  toge: {
    demo: { sideLabel: 'Diplômé·e que vous accompagnez', sides: ['Fatou Ndiaye', 'Junior Mbarga', 'Linda Moukoko', 'Autre diplômé·e'] },
    starter: { sideLabel: 'Diplômé·e que vous accompagnez', sides: [] },
  },
  horizon: {
    demo: { sideLabel: 'Votre département', sides: ['Opérations', 'Commercial', 'Finance et RH', 'Direction', 'Entrepôt Bafoussam'] },
    starter: { sideLabel: 'Votre département', sides: [] },
  },
  libre: { demo: { sideLabel: 'Tu viens', sides: COMING, cta: 'Je participe' }, starter: { sideLabel: 'Tu viens', sides: COMING, cta: 'Je participe' } },
  noel: {
    demo: { sideLabel: 'Âge des enfants', sides: KIDS, cta: 'Inscrire mes enfants' },
    starter: { sideLabel: 'Âge des enfants', sides: KIDS, cta: 'Inscrire mes enfants' },
  },
  aurore: { demo: { cta: "M'inscrire au repas" }, starter: { cta: "M'inscrire au repas" } },
  unite: {
    demo: { sideLabel: 'Type de groupe', sides: GROUPS, cta: 'Inscrire mon groupe' },
    starter: { sideLabel: 'Type de groupe', sides: GROUPS, cta: 'Inscrire mon groupe' },
  },
  maman: { demo: { cta: 'Inscrire une maman' }, starter: { cta: 'Inscrire une maman' } },
  // Envol : services en boutons à toucher (sidePills) et case « cocktail » (extraLabel).
  envol: {
    demo: { sideLabel: 'Votre service', sides: ['Direction générale', 'Commercial', 'Technique', 'Finances', 'Ressources humaines', 'Invité·e extérieur·e'], cta: 'Envoyer ma réponse', sidePills: true, extraLabel: 'Je reste pour le cocktail' },
    starter: { sideLabel: 'Votre service', sides: [], cta: 'Envoyer ma réponse', sidePills: true, extraLabel: 'Je reste pour le cocktail' },
    starterFor: {
      'voeux-ecole': { sideLabel: 'Votre filière', sides: [], cta: 'Envoyer ma réponse', sidePills: true, extraLabel: 'Je reste pour le cocktail' },
    },
  },
}

export const rsvpSidesDemo = (theme) => RSVP_SIDES[theme]?.demo ?? {}
export const rsvpSidesStarter = (theme, eventTypeId) => RSVP_SIDES[theme]?.starterFor?.[eventTypeId] ?? RSVP_SIDES[theme]?.starter ?? {}

// Choix utilisables : textes non vides, sans doublon, 8 au plus (comme le serveur).
export function usableSides(sides) {
  if (!Array.isArray(sides)) return []
  const seen = new Set()
  return sides
    .map((s) => (typeof s === 'string' ? s.trim().slice(0, 80) : ''))
    .filter((s) => s && !seen.has(s) && seen.add(s))
    .slice(0, 8)
}
