import { Plus, Sparkles, Trash2 } from 'lucide-react'
import FaqEditor from '../builder/FaqEditor'
import { DressCodeEditor, FamiliesEditor, GiftAccountsEditor, PartnersEditor, PeopleEditor } from '../builder/ModuleEditors'
import { findTemplate } from '../../utils/templateTheme'
import { initialBlockContent, templateContentBlocks, templateExample } from '../../utils/templateContent'

// Étape « Contenu du modèle » : uniquement les sections que le modèle choisi affiche, avec
// ses propres titres. « Partir de l'exemple » remplit tout avec le contenu de la démo du
// modèle, à remplacer par les vraies informations.

const inputClass =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple'
const addClass =
  'flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm font-medium text-muted transition hover:border-brand-purple hover:text-brand-purple disabled:opacity-40'
const removeClass = 'rounded p-1 text-danger hover:bg-danger/10'

const HINTS = {
  Histoire: 'Quelques lignes qui racontent votre histoire ou présentent l’événement.',
  Familles: 'Les deux familles (ou le parrain et la marraine) mises à l’honneur.',
  Intervenants: 'Les personnes présentées sur le site : artistes, intervenants, jury, invités d’honneur…',
  Programme: 'Les grands moments de la journée, avec leur heure.',
  'Dress code': 'La tenue demandée et ses couleurs.',
  Cadeaux: 'Les numéros Mobile Money pour participer. La liste de souhaits se gère ensuite dans « Liste de cadeaux ».',
  Billetterie: 'Les catégories de billets proposées, avec leur prix et le nombre de places.',
  Partenaires: 'Les partenaires et sponsors affichés en bas du site.',
  FAQ: 'Les questions que vos invités vont se poser.',
}

function ProgramEditor({ items, onChange }) {
  const set = (i, patch) => onChange(items.map((it, k) => (k === i ? { ...it, ...patch } : it)))
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="grid grid-cols-[6.5rem_1fr_auto] gap-2">
          <input type="time" aria-label={`Heure de l’activité ${i + 1}`} className={inputClass} value={it.time ?? ''} onChange={(e) => set(i, { time: e.target.value })} />
          <div className="grid gap-2">
            <input className={inputClass} maxLength={200} placeholder="Titre (ex. Cérémonie, Cocktail…)" value={it.title ?? ''} onChange={(e) => set(i, { title: e.target.value })} />
            <input className={inputClass} maxLength={300} placeholder="Précision (facultatif)" value={it.note ?? ''} onChange={(e) => set(i, { note: e.target.value })} />
          </div>
          <button type="button" className={`${removeClass} self-start`} aria-label="Retirer l’activité" onClick={() => onChange(items.filter((_, k) => k !== i))}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button type="button" className={addClass} disabled={items.length >= 20} onClick={() => onChange([...items, { time: '', title: '', note: '' }])}>
        <Plus className="h-4 w-4" />
        Ajouter une activité
      </button>
    </div>
  )
}

function TicketsEditor({ tickets, onChange }) {
  const set = (i, patch) => onChange(tickets.map((t, k) => (k === i ? { ...t, ...patch } : t)))
  return (
    <div className="space-y-2">
      {tickets.map((t, i) => (
        <div key={i} className="grid grid-cols-[1fr_7rem_6rem_auto] items-center gap-2">
          <input className={inputClass} maxLength={100} placeholder="Catégorie (ex. Tribune, Fosse, Pass pro)" value={t.name ?? ''} onChange={(e) => set(i, { name: e.target.value })} />
          <input className={inputClass} type="number" min="0" inputMode="numeric" aria-label="Prix en FCFA" placeholder="Prix FCFA" value={t.price ?? ''} onChange={(e) => set(i, { price: e.target.value })} />
          <input className={inputClass} type="number" min="1" inputMode="numeric" aria-label="Nombre de places" placeholder="Places" value={t.quota ?? ''} onChange={(e) => set(i, { quota: e.target.value })} />
          <button type="button" className={removeClass} aria-label="Retirer la catégorie de billet" onClick={() => onChange(tickets.filter((_, k) => k !== i))}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button type="button" className={addClass} disabled={tickets.length >= 10} onClick={() => onChange([...tickets, { name: '', price: '', quota: '' }])}>
        <Plus className="h-4 w-4" />
        Ajouter une catégorie de billet
      </button>
      <p className="text-xs text-faint">Prix en FCFA, 0 pour une entrée gratuite.</p>
    </div>
  )
}

export default function TemplateContentStep({ event, onChange, isEditMode }) {
  const template = findTemplate(event.template)
  const sections = templateContentBlocks(template)
  const example = templateExample(template)

  const contentOf = (type) => ({ ...initialBlockContent(template, type), ...(event.blockContent?.[type] ?? {}) })
  const setContent = (type, patch) =>
    onChange({ ...event, blockContent: { ...event.blockContent, [type]: { ...contentOf(type), ...patch } } })

  const applyExample = () =>
    onChange({
      ...event,
      description: event.description?.trim() ? event.description : example.description,
      kicker: event.kicker?.trim() ? event.kicker : example.kicker,
      blockContent: Object.fromEntries(
        Object.entries(example.blockContent).map(([type, content]) => [type, { ...contentOf(type), ...content }]),
      ),
      programItems: isEditMode ? event.programItems : example.programItems,
      ticketTypes: isEditMode ? event.ticketTypes : example.ticketTypes,
    })

  if (!template) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-ink">Contenu du site</h2>
        <p className="mt-4 rounded-xl border border-dashed border-border-soft px-4 py-6 text-sm text-muted">
          Vous partez d’une page vierge : vous composerez les sections librement dans le Builder. Vous pouvez passer cette étape.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">Contenu du modèle {template.name}</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Les sections que ce modèle affiche, avec ses titres. Tout reste modifiable ensuite dans le Builder ; une
            section laissée vide est simplement masquée.
          </p>
        </div>
        {example && (
          <button
            type="button"
            onClick={applyExample}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-purple/40 bg-brand-purple/10 px-4 py-2.5 text-sm font-semibold text-brand-purple transition hover:bg-brand-purple/15"
          >
            <Sparkles className="h-4 w-4" />
            Partir de l’exemple du modèle
          </button>
        )}
      </div>

      {sections.length === 0 && (
        <p className="mt-8 rounded-xl border border-dashed border-border-soft px-4 py-6 text-sm text-muted">
          Ce modèle se remplit tout seul avec les informations de l’événement (lieu, galerie, livre d’or, réponses).
        </p>
      )}

      <div className="mt-8 space-y-5">
        {sections.map((type) => {
          const content = contentOf(type)
          const title = content.heading || type
          return (
            <section key={type} className="rounded-2xl border border-border-soft bg-surface p-5">
              <h3 className="font-semibold text-ink">{title}</h3>
              <p className="mt-1 text-xs text-faint">{HINTS[type]}</p>
              <div className="mt-4 space-y-3">
                {type === 'Histoire' && (
                  <textarea
                    rows={5}
                    maxLength={4000}
                    className={`${inputClass} resize-y`}
                    placeholder={example?.blockContent.Histoire?.body ? `Ex. ${example.blockContent.Histoire.body.split('\n')[0]}` : 'Racontez…'}
                    value={content.body ?? ''}
                    onChange={(e) => setContent(type, { body: e.target.value })}
                  />
                )}
                {type === 'Familles' && <FamiliesEditor content={content} onChange={(patch) => setContent(type, patch)} />}
                {type === 'Intervenants' && <PeopleEditor content={content} onChange={(patch) => setContent(type, patch)} />}
                {type === 'Partenaires' && <PartnersEditor content={content} onChange={(patch) => setContent(type, patch)} />}
                {type === 'Dress code' && <DressCodeEditor content={content} onChange={(patch) => setContent(type, patch)} />}
                {type === 'Cadeaux' && (
                  <>
                    <textarea
                      rows={2}
                      maxLength={1000}
                      className={`${inputClass} resize-y`}
                      placeholder="Mot d’introduction (facultatif)"
                      value={content.body ?? ''}
                      onChange={(e) => setContent(type, { body: e.target.value })}
                    />
                    <GiftAccountsEditor content={content} onChange={(patch) => setContent(type, patch)} />
                  </>
                )}
                {type === 'FAQ' && (
                  <FaqEditor items={Array.isArray(content.items) ? content.items : []} onChange={(items) => setContent(type, { items })} />
                )}
                {type === 'Programme' &&
                  (isEditMode ? (
                    <p className="text-sm text-muted">Le programme de cet événement se gère dans le menu Programme du tableau de bord.</p>
                  ) : (
                    <ProgramEditor items={event.programItems ?? []} onChange={(programItems) => onChange({ ...event, programItems })} />
                  ))}
                {type === 'Billetterie' &&
                  (isEditMode ? (
                    <p className="text-sm text-muted">Les billets de cet événement se gèrent dans le menu Billetterie du tableau de bord.</p>
                  ) : (
                    <TicketsEditor tickets={event.ticketTypes ?? []} onChange={(ticketTypes) => onChange({ ...event, ticketTypes })} />
                  ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
