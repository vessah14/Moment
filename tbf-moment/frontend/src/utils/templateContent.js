import { TEMPLATE_DEMOS } from '../data/templateDemos'
import { templateBlockDefaults, templateBlocks } from './templateTheme'

// Contenu propre à chaque modèle, saisi dans l'assistant de création (étape « Contenu du
// modèle ») : seules les sections que le modèle affiche sont demandées, avec les titres et
// libellés du modèle (« Line-up », « Parrain et marraine », « La cotisation »…). Le site
// publié ressemble ainsi à la démo du modèle, avec les vraies informations de l'événement.

// Sections dont le contenu se saisit ici. Les autres (galerie, livre d'or, réponse, plan
// de table, lieu…) se remplissent avec les données réelles de l'événement.
export const CONTENT_BLOCKS = [
  'Histoire',
  'Familles',
  'Intervenants',
  'Programme',
  'Dress code',
  'Cadeaux',
  'Billetterie',
  'Partenaires',
  'FAQ',
]

export function templateContentBlocks(template) {
  return templateBlocks(template).filter((b) => CONTENT_BLOCKS.includes(b))
}

// Contenu initial d'une section : titres et libellés du modèle, aucun exemple.
export function initialBlockContent(template, type) {
  return templateBlockDefaults(template)[type] ?? {}
}

const hhmm = (iso) => (typeof iso === 'string' && /T(\d{2}:\d{2})/.test(iso) ? iso.match(/T(\d{2}:\d{2})/)[1] : '')

// Contenu d'exemple d'un modèle premium (celui de sa démo), pour partir d'un site déjà
// rempli et remplacer les informations. null pour un modèle sans démo.
export function templateExample(template) {
  const demo = template?.theme ? TEMPLATE_DEMOS[template.theme] : null
  if (!demo) return null
  const blocks = new Set(templateBlocks(template))
  const blockContent = {}
  if (blocks.has('Histoire') && demo.story) blockContent.Histoire = { body: demo.story }
  if (blocks.has('Familles') && demo.families) blockContent.Familles = { ...demo.families }
  if (blocks.has('Intervenants') && demo.people)
    blockContent.Intervenants = { people: demo.people.map(([name, role, topic]) => ({ name, role, topic })) }
  if (blocks.has('Partenaires') && demo.partners) blockContent.Partenaires = { partners: [...demo.partners] }
  if (blocks.has('Dress code') && demo.dress)
    blockContent['Dress code'] = {
      title: demo.dress.title,
      body: demo.dress.body,
      colors: (demo.dress.colors ?? []).map(([hex, name]) => ({ hex, name })),
    }
  if (blocks.has('Cadeaux') && demo.gift)
    blockContent.Cadeaux = {
      body: demo.gift.body,
      accounts: (demo.gift.accounts ?? []).map(([operator, name, number]) => ({ operator, name, number })),
    }
  if (blocks.has('FAQ') && demo.faq)
    blockContent.FAQ = { items: demo.faq.map(([question, answer]) => ({ question, answer })) }

  return {
    kicker: demo.kicker ?? '',
    description: demo.description ?? '',
    blockContent,
    programItems: blocks.has('Programme')
      ? (demo.program ?? []).map((p) => ({ time: hhmm(p.startTime), title: p.title, note: p.description ?? '' }))
      : [],
    ticketTypes: blocks.has('Billetterie')
      ? (demo.tickets ?? []).map(([name, price, quota]) => ({ name, price: String(price), quota: String(quota) }))
      : [],
  }
}

// Champs enregistrés pour chaque section : rien d'autre ne part dans le contenu du bloc.
const SAVED_FIELDS = {
  Histoire: ['body'],
  Familles: ['body', 'a', 'b'],
  Intervenants: ['body', 'people'],
  'Dress code': ['body', 'title', 'colors'],
  Cadeaux: ['body', 'accounts'],
  Partenaires: ['body', 'partners'],
  FAQ: ['body', 'items'],
}

export function blockContentToSave(type, content) {
  const fields = SAVED_FIELDS[type]
  if (!fields || !content) return {}
  return Object.fromEntries(fields.filter((f) => content[f] !== undefined).map((f) => [f, content[f]]))
}

// Activités du programme saisies dans l'assistant -> DTO de l'API (heure locale du jour
// de l'événement ; sans date, l'activité est créée sans horaire).
export function programItemsToCreate(items, date) {
  return (items ?? [])
    .filter((it) => it?.title?.trim())
    .map((it) => {
      const start = date && /^\d{2}:\d{2}$/.test(it.time ?? '') ? new Date(`${date}T${it.time}:00`) : null
      return {
        title: it.title.trim().slice(0, 200),
        description: it.note?.trim() || null,
        startTime: start && !Number.isNaN(start.getTime()) ? start.toISOString() : null,
        durationMinutes: 60,
        capacity: 50,
      }
    })
}

// Billets saisis dans l'assistant -> DTO de l'API (prix en FCFA, stocké en centimes).
export function ticketTypesToCreate(tickets) {
  return (tickets ?? [])
    .filter((t) => t?.name?.trim())
    .map((t) => ({
      name: t.name.trim().slice(0, 100),
      priceCents: Math.max(0, Math.round(Number(t.price) || 0)) * 100,
      quota: Math.min(100000, Math.max(1, Math.round(Number(t.quota) || 1))),
    }))
}
