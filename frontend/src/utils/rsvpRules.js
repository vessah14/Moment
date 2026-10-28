// Règles du formulaire de réponse, réglées dans le contenu du bloc RSVP (mêmes clés que
// RsvpRules côté serveur, qui les vérifie) : date limite, accompagnants par invitation,
// réponse « Peut-être », réponses réservées à la liste, messages après un oui ou un non.
export const MAX_COMPANIONS = 20
export const DEFAULT_COMPANIONS = 10

const isIsoDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)

export function rsvpRules(content = {}) {
  const max = Number.isInteger(content.maxCompanions)
    ? Math.min(Math.max(content.maxCompanions, 0), MAX_COMPANIONS)
    : DEFAULT_COMPANIONS
  return {
    deadline: isIsoDate(content.deadline) ? content.deadline : '',
    maxCompanions: max,
    allowMaybe: content.allowMaybe === true,
    guestListOnly: content.guestListOnly === true,
    yesMessage: typeof content.yesMessage === 'string' ? content.yesMessage.trim() : '',
    noMessage: typeof content.noMessage === 'string' ? content.noMessage.trim() : '',
    // Case optionnelle (« Je reste pour le cocktail ») et choix « côté » en boutons.
    extraLabel: typeof content.extraLabel === 'string' ? content.extraLabel.trim().slice(0, 80) : '',
    sidePills: content.sidePills === true,
  }
}

const localToday = (now) => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// Date limite passée (elle est incluse : on peut encore répondre ce jour-là).
export const deadlinePassed = (deadline, now = new Date()) => Boolean(deadline) && deadline < localToday(now)

export const deadlineLabel = (deadline, locale = 'fr-FR') =>
  deadline
    ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${deadline}T12:00:00`))
    : ''
