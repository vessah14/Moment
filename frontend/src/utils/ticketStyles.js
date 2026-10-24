// Les 10 modèles de billets (repris du prototype : engine.css, studio.html, billets.html), répartis
// en trois formats selon la nature de l'événement :
//  - carte : carte d'invitation verticale, pour les événements privés sur invitation (mariage,
//    dot, anniversaire, baptême, obsèques, fêtes…) ;
//  - billet : billet d'entrée horizontal à talon détachable, pour les événements à billetterie
//    (concert, match, soirée payante) ;
//  - badge : badge nominatif, pour les conférences, écoles et salons.
// L'organisateur en choisit un dans le Builder (customFields.ticket.style) ; sinon chaque modèle de
// site reçoit celui qui lui va. Un billet acheté (billetterie) prend toujours le format billet.

export const TICKET_FORMATS = [
  { id: 'carte', label: "Cartes d'invitation", short: "Carte d'invitation", hint: 'Mariage, dot, anniversaire, baptême, obsèques, fêtes en famille.' },
  { id: 'billet', label: "Billets d'entrée", short: "Billet d'entrée", hint: 'Concert, match, soirée payante : avec la billetterie.' },
  { id: 'badge', label: 'Badges', short: 'Badge', hint: 'Conférence, séminaire, école, salon.' },
]

export const TICKET_STYLES = [
  { id: 'classique', format: 'carte', label: 'Classique', description: 'Carte aux couleurs de la page. Va avec tout.' },
  { id: 'or', format: 'carte', label: 'Doré', description: "Double filet doré, pour les grandes occasions et les galas." },
  { id: 'fairepart', format: 'carte', label: 'Faire-part', description: 'Sceau et double filet, noms en calligraphie. Mariage, baptême.' },
  { id: 'pagne', format: 'carte', label: 'Pagne', description: 'Bords tissés façon toghu et ndop. Dot, retrouvailles familiales.' },
  { id: 'polaroid', format: 'carte', label: 'Polaroid', description: 'Ruban adhésif et ton joyeux. Anniversaire, baby shower.' },
  { id: 'sobre', format: 'carte', label: 'Sobre', description: 'Carton de présence avec une bougie. Obsèques, retrait de deuil.' },
  { id: 'concert', format: 'billet', label: 'Concert', description: 'Reflet holographique et talon détachable. Concert, soirée.' },
  { id: 'stade', format: 'billet', label: 'Stade', description: "Bande rayée, tribune et coup d'envoi. Match, tournoi." },
  { id: 'minimal', format: 'billet', label: 'Minimal', description: 'Billet sobre et lisible. Atelier, conférence payante.' },
  { id: 'badge', format: 'badge', label: 'Badge', description: 'Porte-badge avec le nom en grand. Conférence, école, salon.' },
]

const IDS = new Set(TICKET_STYLES.map((s) => s.id))
const FORMAT_OF = Object.fromEntries(TICKET_STYLES.map((s) => [s.id, s.format]))

// Format du billet : celui du style, sauf un billet acheté (billetterie) qui reste un billet d'entrée.
export const ticketFormat = (style, purchased = false) =>
  FORMAT_OF[style] === 'badge' ? 'badge' : purchased ? 'billet' : FORMAT_OF[style] ?? 'carte'

// Billet conseillé pour chaque modèle de site (selon le type de son événement de démonstration).
const BY_THEME = {
  noor: 'fairepart', bloom: 'fairepart', nuage: 'fairepart', grace: 'fairepart',
  toghu: 'pagne', ndop: 'pagne', racines: 'pagne',
  fiesta: 'polaroid', douceur: 'polaroid', prestige: 'or',
  live: 'concert', velvet: 'or', arena: 'stade',
  summit: 'badge', horizon: 'badge', campus: 'badge', toge: 'badge',
  memoire: 'sobre', souvenir: 'sobre',
}

export const defaultTicketStyle = (theme) => BY_THEME[theme] ?? 'classique'

export const resolveTicketStyle = (style, theme) => (IDS.has(style) ? style : defaultTicketStyle(theme))

// Réglages du billet rangés dans event.customFields (JSON).
export function ticketFromCustomFields(raw) {
  try {
    const t = JSON.parse(raw || '{}')?.ticket
    return {
      style: IDS.has(t?.style) ? t.style : null,
      note: typeof t?.note === 'string' ? t.note.slice(0, 40) : '',
    }
  } catch {
    return { style: null, note: '' }
  }
}

// Code lisible imprimé sous le QR : le QR lui-même porte l'identifiant complet de l'invité
// (c'est ce que lit le scanner d'entrée).
export const ticketCode = (guestId) => String(guestId || '').replace(/-/g, '').slice(0, 8).toUpperCase()
