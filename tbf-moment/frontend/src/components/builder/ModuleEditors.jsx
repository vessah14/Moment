import { Plus, Trash2 } from 'lucide-react'
import { MOBILE_MONEY_OPERATORS } from '../../utils/mobileMoney'

// Éditeurs des blocs « Familles », « Dress code », « Cadeaux », « Intervenants » et
// « Partenaires » (onglet Contenu du Builder). Tout est rangé dans le contenu JSON du
// bloc, enregistré avec la page.

const inputClass =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple'
const labelClass = 'block text-xs font-medium text-muted'
const addClass =
  'flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm font-medium text-muted transition hover:border-brand-purple hover:text-brand-purple disabled:opacity-40'
const removeClass = 'rounded p-1 text-danger hover:bg-danger/10'

function FamilyFields({ title, value = {}, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch })
  return (
    <div className="space-y-2 rounded-lg border border-border-soft bg-surface-2/40 p-3">
      <p className="text-xs font-semibold text-faint">{title}</p>
      <label className={labelClass}>
        Rôle
        <input className={`${inputClass} mt-1`} maxLength={60} value={value.label ?? ''} onChange={(e) => set({ label: e.target.value })} />
      </label>
      <label className={labelClass}>
        Nom de la famille
        <input className={`${inputClass} mt-1`} maxLength={80} placeholder="Ex. : Famille Kamdem" value={value.name ?? ''} onChange={(e) => set({ name: e.target.value })} />
      </label>
      <label className={labelClass}>
        Représentants
        <textarea className={`${inputClass} mt-1 resize-none`} rows={2} maxLength={300} placeholder="Ex. : Papa Jean-Marie et Maman Odile" value={value.text ?? ''} onChange={(e) => set({ text: e.target.value })} />
      </label>
    </div>
  )
}

export function FamiliesEditor({ content, onChange }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink">Les deux familles</p>
      <FamilyFields title="Première famille" value={content.a} onChange={(a) => onChange({ a })} />
      <FamilyFields title="Seconde famille" value={content.b} onChange={(b) => onChange({ b })} />
      <p className="text-xs text-faint">Le champ « Texte » ci-dessus sert de mot d'introduction.</p>
    </div>
  )
}

const MAX_COLORS = 6

export function DressCodeEditor({ content, onChange }) {
  const colors = Array.isArray(content.colors) ? content.colors : []
  const setColor = (i, patch) => onChange({ colors: colors.map((c, k) => (k === i ? { ...c, ...patch } : c)) })

  return (
    <div className="space-y-3">
      <label className={labelClass}>
        <span className="text-sm font-medium text-ink">Tenue demandée</span>
        <input className={`${inputClass} mt-2`} maxLength={100} placeholder="Ex. : Tenue de cérémonie champêtre" value={content.title ?? ''} onChange={(e) => onChange({ title: e.target.value })} />
      </label>
      <p className="text-sm font-medium text-ink">Couleurs de la journée</p>
      {colors.map((c, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="color"
            aria-label={`Couleur ${i + 1}`}
            value={/^#[0-9a-fA-F]{6}$/.test(c.hex ?? '') ? c.hex : '#cccccc'}
            onChange={(e) => setColor(i, { hex: e.target.value })}
            className="h-9 w-10 shrink-0 cursor-pointer rounded border border-border bg-surface"
          />
          <input className={inputClass} maxLength={30} placeholder="Nom (ex. Rose poudré)" value={c.name ?? ''} onChange={(e) => setColor(i, { name: e.target.value })} />
          <button type="button" className={removeClass} aria-label="Retirer la couleur" onClick={() => onChange({ colors: colors.filter((_, k) => k !== i) })}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button type="button" className={addClass} disabled={colors.length >= MAX_COLORS} onClick={() => onChange({ colors: [...colors, { hex: '#e8b4b8', name: '' }] })}>
        <Plus className="h-4 w-4" />
        Ajouter une couleur
      </button>
    </div>
  )
}

const OPERATOR_NAMES = Object.keys(MOBILE_MONEY_OPERATORS)
const MAX_ACCOUNTS = 4

export function GiftAccountsEditor({ content, onChange }) {
  const accounts = Array.isArray(content.accounts) ? content.accounts : []
  const setAccount = (i, patch) => onChange({ accounts: accounts.map((a, k) => (k === i ? { ...a, ...patch } : a)) })

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink">Cagnotte Mobile Money</p>
      {accounts.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-3 py-3 text-center text-xs text-faint">
          Aucun numéro. Les invités verront seulement votre liste de cadeaux.
        </p>
      )}
      {accounts.map((a, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-border-soft bg-surface-2/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-faint">Compte {i + 1}</span>
            <button type="button" className={removeClass} aria-label="Retirer le compte" onClick={() => onChange({ accounts: accounts.filter((_, k) => k !== i) })}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <select className={inputClass} value={a.operator ?? 'Orange Money'} onChange={(e) => setAccount(i, { operator: e.target.value })}>
            {OPERATOR_NAMES.map((op) => (
              <option key={op}>{op}</option>
            ))}
          </select>
          <input className={inputClass} maxLength={80} placeholder="Titulaire (ex. Grâce Ekambi)" value={a.name ?? ''} onChange={(e) => setAccount(i, { name: e.target.value })} />
          <input className={inputClass} maxLength={30} inputMode="tel" placeholder="Numéro (ex. 6 99 00 00 00)" value={a.number ?? ''} onChange={(e) => setAccount(i, { number: e.target.value })} />
        </div>
      ))}
      <button type="button" className={addClass} disabled={accounts.length >= MAX_ACCOUNTS} onClick={() => onChange({ accounts: [...accounts, { operator: 'Orange Money', name: '', number: '' }] })}>
        <Plus className="h-4 w-4" />
        Ajouter un numéro
      </button>
      <p className="text-xs text-faint">
        Les cadeaux eux-mêmes se gèrent dans Liste de cadeaux (tableau de bord) ; ils apparaissent
        automatiquement sur le site.
      </p>
    </div>
  )
}

const MAX_PEOPLE = 12

export function PeopleEditor({ content, onChange }) {
  const people = Array.isArray(content.people) ? content.people : []
  const setPerson = (i, patch) => onChange({ people: people.map((p, k) => (k === i ? { ...p, ...patch } : p)) })

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink">Personnes présentées</p>
      {people.map((p, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-border-soft bg-surface-2/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-faint">Personne {i + 1}</span>
            <button type="button" className={removeClass} aria-label="Retirer la personne" onClick={() => onChange({ people: people.filter((_, k) => k !== i) })}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <input className={inputClass} maxLength={80} placeholder="Nom (ex. Dr. Aline Mbappé)" value={p.name ?? ''} onChange={(e) => setPerson(i, { name: e.target.value })} />
          <input className={inputClass} maxLength={80} placeholder="Rôle (ex. Chercheuse en IA, Tête d'affiche)" value={p.role ?? ''} onChange={(e) => setPerson(i, { role: e.target.value })} />
          <input className={inputClass} maxLength={160} placeholder="Sujet ou précision (facultatif)" value={p.topic ?? ''} onChange={(e) => setPerson(i, { topic: e.target.value })} />
        </div>
      ))}
      <button type="button" className={addClass} disabled={people.length >= MAX_PEOPLE} onClick={() => onChange({ people: [...people, { name: '', role: '', topic: '' }] })}>
        <Plus className="h-4 w-4" />
        Ajouter une personne
      </button>
      <p className="text-xs text-faint">Intervenants, artistes, jury, témoins… Chacun apparaît avec ses initiales.</p>
    </div>
  )
}

const MAX_PARTNERS = 16

export function PartnersEditor({ content, onChange }) {
  const partners = Array.isArray(content.partners) ? content.partners : []

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink">Partenaires et sponsors</p>
      {partners.map((name, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className={inputClass}
            maxLength={60}
            placeholder="Nom du partenaire"
            value={typeof name === 'string' ? name : ''}
            onChange={(e) => onChange({ partners: partners.map((p, k) => (k === i ? e.target.value : p)) })}
          />
          <button type="button" className={removeClass} aria-label="Retirer le partenaire" onClick={() => onChange({ partners: partners.filter((_, k) => k !== i) })}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button type="button" className={addClass} disabled={partners.length >= MAX_PARTNERS} onClick={() => onChange({ partners: [...partners, ''] })}>
        <Plus className="h-4 w-4" />
        Ajouter un partenaire
      </button>
    </div>
  )
}
