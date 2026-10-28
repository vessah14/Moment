import { Plus, Trash2 } from 'lucide-react'
import { MOBILE_MONEY_OPERATORS } from '../../utils/mobileMoney'
import { MAX_COMPANIONS, rsvpRules } from '../../utils/rsvpRules'
import { parseVideoUrl } from '../../utils/videoEmbed'

// Éditeurs des blocs « Familles », « Dress code », « Cadeaux », « Intervenants »,
// « Distinctions » et « Partenaires » (onglet Contenu du Builder). Tout est rangé dans le contenu JSON du
// bloc, enregistré avec la page.

const inputClass =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple'
const labelClass = 'block text-xs font-medium text-muted'
const addClass =
  'flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm font-medium text-muted transition hover:border-brand-purple hover:text-brand-purple disabled:opacity-40'
const removeClass = 'rounded p-1 text-danger hover:bg-danger/10'

// Section « Invitation » : la salutation générale, le début de la salutation adressée à
// un invité (« Cher·e Awa, » sur son lien personnel) et la signature.
export function InvitationEditor({ content, onChange }) {
  return (
    <div className="space-y-3">
      <label className={labelClass}>
        Salutation
        <input className={`${inputClass} mt-1`} maxLength={80} placeholder="Ex. : Chers parents, chers amis," value={content.greeting ?? ''} onChange={(e) => onChange({ greeting: e.target.value })} />
      </label>
      <label className={labelClass}>
        Sur le lien d'un invité
        <input className={`${inputClass} mt-1`} maxLength={20} placeholder="Cher·e" value={content.prefix ?? ''} onChange={(e) => onChange({ prefix: e.target.value })} />
        <span className="mt-1 block text-faint">Suivi du prénom de l'invité : « {(content.prefix ?? '').trim() || 'Cher·e'} Awa, ».</span>
      </label>
      <label className={labelClass}>
        Signature
        <input className={`${inputClass} mt-1`} maxLength={120} placeholder="Ex. : Awa & Ibrahim" value={content.signature ?? ''} onChange={(e) => onChange({ signature: e.target.value })} />
      </label>
    </div>
  )
}

// Bloc RSVP : question « côté » posée à ceux qui viennent (un choix par ligne) et texte
// du bouton d'en-tête.
export function RsvpSidesEditor({ content, onChange }) {
  const sides = Array.isArray(content.sides) ? content.sides : []
  return (
    <div className="space-y-3">
      <label className={labelClass}>
        Question
        <input className={`${inputClass} mt-1`} maxLength={80} placeholder="Vous êtes invité par" value={content.sideLabel ?? ''} onChange={(e) => onChange({ sideLabel: e.target.value })} />
      </label>
      <label className={labelClass}>
        Choix proposés (un par ligne, 8 au plus)
        <textarea
          className={`${inputClass} mt-1 resize-none`}
          rows={5}
          placeholder={'Famille de la mariée\nFamille du marié\nAmis du couple'}
          value={sides.join('\n')}
          onChange={(e) => onChange({ sides: e.target.value.split('\n').slice(0, 8).map((s) => s.slice(0, 80)) })}
        />
        <span className="mt-1 block text-faint">Sans choix, la question n'est pas posée. La réponse figure sur le pass et dans la liste des invités.</span>
      </label>
      <label className={labelClass}>
        Case à cocher (facultatif)
        <input className={`${inputClass} mt-1`} maxLength={80} placeholder="Je reste pour le cocktail" value={content.extraLabel ?? ''} onChange={(e) => onChange({ extraLabel: e.target.value })} />
        <span className="mt-1 block text-faint">Posée à ceux qui viennent ; la réponse apparaît dans Invités (colonne « Cocktail »). Vide : pas de case.</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" className="h-4 w-4 accent-brand-purple" checked={content.sidePills === true} onChange={(e) => onChange({ sidePills: e.target.checked })} />
        Choix en boutons à toucher (au lieu d'une liste)
      </label>
      <label className={labelClass}>
        Bouton de l'en-tête
        <input className={`${inputClass} mt-1`} maxLength={40} placeholder="Confirmer ma présence" value={content.cta ?? ''} onChange={(e) => onChange({ cta: e.target.value })} />
      </label>
      <RsvpRulesFields content={content} onChange={onChange} />
    </div>
  )
}

// Règles de réponse, vérifiées aussi par le serveur : date limite, accompagnants par
// invitation, « Peut-être » et messages affichés après la réponse.
export function RsvpRulesFields({ content, onChange }) {
  const rules = rsvpRules(content)
  return (
    <div className="space-y-3 border-t border-border-soft pt-3">
      <p className="text-sm font-medium text-ink">Règles de réponse</p>
      <label className={labelClass}>
        Répondre avant le
        <input type="date" className={`${inputClass} mt-1`} value={rules.deadline} onChange={(e) => onChange({ deadline: e.target.value || null })} />
        <span className="mt-1 block text-faint">Sans date, les invités peuvent répondre jusqu'au jour de l'événement.</span>
      </label>
      <label className={labelClass}>
        Accompagnants par invitation
        <select className={`${inputClass} mt-1`} value={rules.maxCompanions} onChange={(e) => onChange({ maxCompanions: Number(e.target.value) })}>
          {Array.from({ length: MAX_COMPANIONS + 1 }, (_, i) => (
            <option key={i} value={i}>{i === 0 ? 'Aucun (invitation personnelle)' : `${i} au plus`}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" className="h-4 w-4 accent-brand-purple" checked={rules.allowMaybe} onChange={(e) => onChange({ allowMaybe: e.target.checked })} />
        Proposer la réponse « Peut-être »
      </label>
      <label className="flex items-start gap-2 text-sm text-ink">
        <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-purple" checked={rules.guestListOnly} onChange={(e) => onChange({ guestListOnly: e.target.checked })} />
        <span>
          Réponses réservées aux invités de ma liste
          <span className="block text-xs text-faint">Le formulaire public n’accepte que les numéros ou e-mails déjà dans Invités & RSVP : pas d’incrustés.</span>
        </span>
      </label>
      <label className={labelClass}>
        Message après un « oui »
        <input className={`${inputClass} mt-1`} maxLength={200} placeholder="Ex. : Nous avons hâte de danser avec vous !" value={content.yesMessage ?? ''} onChange={(e) => onChange({ yesMessage: e.target.value })} />
      </label>
      <label className={labelClass}>
        Message après un « non »
        <input className={`${inputClass} mt-1`} maxLength={200} placeholder="Ex. : Vous nous manquerez, merci de nous avoir prévenus." value={content.noMessage ?? ''} onChange={(e) => onChange({ noMessage: e.target.value })} />
      </label>
    </div>
  )
}

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

// Bloc « Vidéo » : lien YouTube (affiché dans la page) ou autre lien de direct (bouton).
export function VideoEditor({ content, onChange }) {
  const filled = Boolean(content.url?.trim())
  const valid = !filled || parseVideoUrl(content.url)
  return (
    <div className="space-y-3">
      <label className={labelClass}>
        <span className="text-sm font-medium text-ink">Lien de la vidéo ou du direct</span>
        <input
          className={`${inputClass} mt-2`}
          type="url"
          inputMode="url"
          maxLength={500}
          placeholder="https://youtube.com/live/… ou https://facebook.com/…"
          value={content.url ?? ''}
          onChange={(e) => onChange({ url: e.target.value })}
        />
      </label>
      {!valid && <p className="text-xs text-danger">Collez un lien complet qui commence par https://</p>}
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={Boolean(content.live)} onChange={(e) => onChange({ live: e.target.checked })} />
        C’est un direct (pour les proches qui ne peuvent pas venir)
      </label>
    </div>
  )
}

const MAX_ADDITIONAL_VENUES = 4

export function AdditionalVenuesEditor({ content, onChange }) {
  const venues = Array.isArray(content.additionalVenues)
    ? content.additionalVenues.map((venue) => ({
        label: typeof venue?.label === 'string' ? venue.label : '',
        address: typeof venue?.address === 'string' ? venue.address : '',
        time: typeof venue?.time === 'string' ? venue.time : '',
      }))
    : []
  const updateVenue = (index, patch) =>
    onChange({
      additionalVenues: venues.map((venue, i) => (i === index ? { ...venue, ...patch } : venue)),
    })

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink">Autres lieux</p>
      <p className="text-xs text-faint">
        Le lieu principal est défini dans les informations de l’événement. Ajoutez ici la cérémonie, la réception ou d’autres étapes.
      </p>
      {venues.map((venue, index) => (
        <div key={index} className="space-y-2 rounded-lg border border-border-soft bg-surface-2/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-faint">Lieu supplémentaire {index + 1}</span>
            <button
              type="button"
              className={removeClass}
              aria-label={`Retirer le lieu supplémentaire ${index + 1}`}
              onClick={() => onChange({ additionalVenues: venues.filter((_, i) => i !== index) })}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <label className={labelClass}>
            Étape ou type de lieu
            <input
              className={`${inputClass} mt-1`}
              maxLength={60}
              placeholder="Ex. : Cérémonie"
              value={venue.label ?? ''}
              onChange={(e) => updateVenue(index, { label: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            Adresse
            <input
              className={`${inputClass} mt-1`}
              maxLength={200}
              placeholder="Ex. : Paroisse Saint-Jean, Douala"
              value={venue.address ?? ''}
              onChange={(e) => updateVenue(index, { address: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            Horaire
            <input
              className={`${inputClass} mt-1`}
              maxLength={60}
              placeholder="Ex. : 10 h – 14 h 30"
              value={venue.time ?? ''}
              onChange={(e) => updateVenue(index, { time: e.target.value })}
            />
          </label>
        </div>
      ))}
      <button
        type="button"
        className={addClass}
        disabled={venues.length >= MAX_ADDITIONAL_VENUES}
        onClick={() => onChange({ additionalVenues: [...venues, { label: '', address: '', time: '' }] })}
      >
        <Plus className="h-4 w-4" />
        Ajouter un lieu
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

const HONOUR_RANKS = ['Or', 'Vermeil', 'Argent']

export function HonoursEditor({ content, onChange }) {
  const people = Array.isArray(content.people) ? content.people : []
  const setPerson = (i, patch) => onChange({ people: people.map((p, k) => (k === i ? { ...p, ...patch } : p)) })

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink">Personnes honorées</p>
      {people.map((p, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-border-soft bg-surface-2/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-faint">Personne {i + 1}</span>
            <button type="button" className={removeClass} aria-label="Retirer la personne" onClick={() => onChange({ people: people.filter((_, k) => k !== i) })}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <input className={inputClass} maxLength={80} placeholder="Nom (ex. Jeanne Ekotto)" value={p.name ?? ''} onChange={(e) => setPerson(i, { name: e.target.value })} />
          <input className={inputClass} maxLength={80} placeholder="Service ou filière (ex. Finances)" value={p.role ?? ''} onChange={(e) => setPerson(i, { role: e.target.value })} />
          <input className={inputClass} maxLength={160} placeholder="Distinction (ex. Médaille d'or, 30 ans de service)" value={p.topic ?? ''} onChange={(e) => setPerson(i, { topic: e.target.value })} />
          <div className="flex gap-2" role="radiogroup" aria-label="Couleur de la médaille">
            {HONOUR_RANKS.map((label, rank) => (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={(p.rank ?? 0) === rank}
                onClick={() => setPerson(i, { rank })}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium ${(p.rank ?? 0) === rank ? 'border-brand-purple bg-brand-purple/10 text-ink' : 'border-border-soft text-muted hover:border-faint'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button type="button" className={addClass} disabled={people.length >= MAX_PEOPLE} onClick={() => onChange({ people: [...people, { name: '', role: '', topic: '', rank: 0 }] })}>
        <Plus className="h-4 w-4" />
        Ajouter une personne
      </button>
      <p className="text-xs text-faint">Médaillés, lauréats, distinctions honorifiques… La couleur de la médaille suit le rang choisi.</p>
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
