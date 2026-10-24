import { Check, Copy, Gift, MapPin, Search, Ticket } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { submitPublicRsvp } from '../../../api/guests'
import { findPublicSeat } from '../../../api/publicEvents'
import { DEFAULT_SIDE_LABEL, usableSides } from '../../../data/rsvpSides'
import { initialsOf } from '../../../utils/blockLists'
import { deadlineLabel, deadlinePassed, rsvpRules } from '../../../utils/rsvpRules'
import { findTemplate } from '../../../utils/templateTheme'
import { resolveTicketStyle } from '../../../utils/ticketStyles'
import TicketCard, { ticketEventInfo } from '../../tickets/TicketCard'
import { eventStartIso } from '../../../utils/ticketLive'
import { useCheckInWatch } from '../../../utils/useCheckInWatch'
import { operatorStyle, usableAccounts, usableColors } from '../../../utils/mobileMoney'

// Modules du site d'événement partagés par le rendu classique (Tailwind) et les modèles
// premium (classes .tbft) : familles, code vestimentaire, intervenants, partenaires,
// cadeaux, plan de table et réponse intégrée avec pass d'entrée. `themed` choisit le jeu de classes.

const CLASSES = {
  themed: {
    card: 'card rv',
    grid2: 'grid-2',
    kicker: 'kicker',
    title: 'mod-title',
    muted: 'muted',
    btn: 'btn',
    ghost: 'btn ghost',
    input: '',
    note: 'ph-note',
  },
  classic: {
    card: 'rounded-2xl border border-border-soft bg-bg p-5 sm:p-6',
    grid2: 'grid gap-4 @3xl:grid-cols-2',
    kicker: 'text-[11px] font-semibold tracking-[0.2em] uppercase text-brand-purple',
    title: 'mt-1 text-xl font-bold text-ink',
    muted: 'text-sm text-muted',
    btn: 'inline-flex items-center justify-center gap-2 rounded-full bg-brand-purple px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60',
    ghost: 'inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-brand-purple',
    input: 'w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-purple',
    note: 'rounded-xl border border-dashed border-border px-4 py-5 text-center text-xs text-faint',
  },
}
const cls = (themed) => (themed ? CLASSES.themed : CLASSES.classic)
const stop = (e) => e.stopPropagation()

// ---------- Familles (dot) ----------
export function FamiliesModule({ content, themed }) {
  const c = cls(themed)
  const families = [content.a, content.b].filter((f) => f?.name?.trim())
  return (
    <div className="mod-families">
      {content.body?.trim() && <p className={themed ? 'lead-text narrow rv' : 'mx-auto mb-6 max-w-2xl text-center text-muted'}>{content.body}</p>}
      <div className={themed ? 'families' : 'grid items-center gap-4 @3xl:grid-cols-[1fr_auto_1fr]'}>
        {families.map((f, i) => (
          <article key={i} className={c.card} style={themed ? { '--d': i * 2 } : undefined}>
            {f.label && <p className={c.kicker}>{f.label}</p>}
            <h3 className={c.title}>{f.name}</h3>
            {f.text && <p className={c.muted} style={{ margin: '.4rem 0 0', whiteSpace: 'pre-line' }}>{f.text}</p>}
          </article>
        )).flatMap((card, i) =>
          i === 1
            ? [
                <svg key="knot" className={themed ? 'knot rv' : 'mx-auto h-14 w-14 text-brand-purple @3xl:rotate-0'} style={themed ? { '--d': 1 } : undefined} viewBox="0 0 64 64" aria-hidden="true">
                  <circle cx="24" cy="32" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
                  <circle cx="40" cy="32" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>,
                card,
              ]
            : [card],
        )}
      </div>
    </div>
  )
}

// ---------- Code vestimentaire ----------
export function DressCodeModule({ content, themed }) {
  const c = cls(themed)
  const colors = usableColors(content.colors)
  return (
    <div className={themed ? 'card rv narrow' : `${c.card} mx-auto max-w-2xl`} style={{ textAlign: 'center' }}>
      {content.title?.trim() && <h3 className={c.title} style={{ marginTop: 0 }}>{content.title}</h3>}
      {content.body?.trim() && <p className={c.muted} style={{ margin: '.5rem 0 0', whiteSpace: 'pre-line' }}>{content.body}</p>}
      {colors.length > 0 && (
        <div className={themed ? 'swatches' : 'mt-4 flex flex-wrap justify-center gap-2'}>
          {colors.map((col, i) => (
            <span key={i} className={themed ? '' : 'inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface py-1 pr-3 pl-1 text-sm text-ink'}>
              <i
                aria-hidden="true"
                className={themed ? '' : 'h-6 w-6 rounded-full'}
                style={{ background: col.hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)' }}
              />
              {col.name || col.hex}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- Intervenants, artistes, jury ----------
export function SpeakersModule({ people, themed }) {
  if (themed) {
    return (
      <div className="speakers">
        {people.map((p, i) => (
          <article key={i} className="speaker card rv" style={{ '--d': i % 4 }}>
            <span className="avatar" aria-hidden="true">{initialsOf(p.name)}</span>
            <h3>{p.name}</h3>
            {p.role && <p className="role">{p.role}</p>}
            {p.topic && <p className="topic">{p.topic}</p>}
          </article>
        ))}
      </div>
    )
  }
  return (
    <div className="grid gap-4 @xl:grid-cols-2 @5xl:grid-cols-3">
      {people.map((p, i) => (
        <article key={i} className={`${CLASSES.classic.card} text-center`}>
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-purple text-lg font-bold text-white" aria-hidden="true">
            {initialsOf(p.name)}
          </span>
          <h3 className="mt-3 text-lg font-bold text-ink">{p.name}</h3>
          {p.role && <p className="text-sm font-semibold text-brand-purple">{p.role}</p>}
          {p.topic && <p className="mt-1 text-sm text-muted">{p.topic}</p>}
        </article>
      ))}
    </div>
  )
}

// ---------- Partenaires ----------
export function PartnersModule({ partners, themed }) {
  return (
    <div className={themed ? 'partners rv' : 'flex flex-wrap justify-center gap-3'}>
      {partners.map((name, i) => (
        <span
          key={i}
          className={themed ? 'partner' : 'rounded-xl border border-border-soft bg-surface px-5 py-3 text-base font-semibold text-muted'}
        >
          {name}
        </span>
      ))}
    </div>
  )
}

// ---------- Cadeaux : cagnotte Mobile Money + liste de souhaits réelle ----------
function CopyButton({ value, className }) {
  const [label, setLabel] = useState('Copier')
  return (
    <button
      type="button"
      className={className}
      onClick={async (e) => {
        e.stopPropagation()
        try {
          await navigator.clipboard.writeText(value.replace(/\s/g, ''))
          setLabel('Copié')
        } catch {
          setLabel('Copie impossible')
        }
        setTimeout(() => setLabel('Copier'), 2000)
      }}
    >
      <Copy style={{ width: 14, height: 14 }} />
      {label}
    </button>
  )
}

export function GiftModule({ content, gifts = [], slug, themed, editable }) {
  const c = cls(themed)
  const accounts = usableAccounts(content.accounts)
  return (
    <div>
      {content.body?.trim() && <p className={themed ? 'lead-text narrow rv' : 'mx-auto mb-6 max-w-2xl text-center text-muted'} style={{ marginBottom: '2rem' }}>{content.body}</p>}
      <div className={c.grid2}>
        {accounts.length > 0 && (
          <div className={c.card}>
            <p className={c.kicker}>Cagnotte Mobile Money</p>
            <div className={themed ? 'accounts' : 'mt-3 grid gap-3'}>
              {accounts.map((a, i) => {
                const op = operatorStyle(a.operator)
                return (
                  <div key={i} className={themed ? 'acc' : 'flex flex-wrap items-center gap-3 rounded-xl bg-surface-2 p-3'}>
                    <span className={themed ? 'op' : 'grid h-11 w-11 place-items-center rounded-xl text-xs font-extrabold'} style={{ background: op.bg, color: op.fg }}>
                      {op.short}
                    </span>
                    <div className={themed ? 'info' : 'min-w-40 flex-1'}>
                      <b className={themed ? '' : 'block text-sm text-ink'}>{[a.operator, a.name].filter(Boolean).join(' · ')}</b>
                      <code className={themed ? '' : 'text-lg font-extrabold tracking-wide whitespace-nowrap text-ink'}>{a.number}</code>
                    </div>
                    {!editable && <CopyButton value={a.number} className={themed ? 'acc-copy' : c.ghost} />}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {accounts.length === 0 && (
          <div className={c.card}>
            <p className={c.kicker}>Contribution</p>
            <p className={c.muted} style={{ margin: '.6rem 0 0' }}>
              {editable
                ? 'Ajoutez vos coordonnées Mobile Money dans l’onglet Contenu pour recevoir les contributions.'
                : 'Les modalités de contribution seront communiquées par l’organisateur.'}
            </p>
          </div>
        )}
        <div className={c.card} style={themed ? { '--d': 1 } : undefined}>
          <p className={c.kicker}>Liste de souhaits</p>
          {gifts.length ? (
            <ul className={themed ? 'wishlist' : 'mt-3 divide-y divide-dashed divide-border'}>
              {gifts.slice(0, 8).map((g) => (
                <li key={g.id} className={themed ? '' : 'flex justify-between gap-3 py-2.5 text-sm text-ink'}>
                  <span>{g.name}</span>
                  <span className={themed ? `tag ${g.isReserved ? 'done' : ''}` : `shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${g.isReserved ? 'bg-surface-2 text-faint line-through' : 'bg-brand-purple/15 text-brand-purple'}`}>
                    {g.isReserved ? 'Offert' : 'Disponible'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={c.muted} style={{ margin: '.6rem 0 0' }}>
              {editable ? 'Ajoutez vos idées de cadeaux dans Liste de cadeaux (tableau de bord).' : 'Votre présence est notre plus beau cadeau.'}
            </p>
          )}
          {slug && gifts.length > 0 && !editable && (
            <Link to={`/cadeaux/${slug}`} className={c.ghost} style={{ marginTop: '1rem' }} onClick={stop}>
              <Gift style={{ width: 16, height: 16 }} />
              Réserver un cadeau
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- Plan de table : « Trouver ma place » ----------
export function SeatingModule({ tables = [], slug, themed, editable, findSeat }) {
  const c = cls(themed)
  const [name, setName] = useState('')
  const [state, setState] = useState({ status: 'idle' })

  const search = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (editable || name.trim().length < 3) return
    setState({ status: 'loading' })
    try {
      const result = await (findSeat ? findSeat(name.trim()) : findPublicSeat(slug, name.trim()))
      setState(result?.found ? { status: 'found', ...result } : { status: 'missing' })
    } catch (err) {
      setState({ status: 'error', message: err.status === 429 ? 'Trop de recherches. Réessayez dans une minute.' : 'La recherche a échoué.' })
    }
  }

  return (
    <div className={themed ? 'tables-wrap' : 'grid gap-4 @3xl:grid-cols-[2fr_3fr]'}>
      <form className={c.card} onSubmit={search} onClick={stop}>
        <label className={themed ? 'field' : 'block text-xs font-semibold tracking-wider text-muted uppercase'}>
          <span>Votre nom complet</span>
          <span className={themed ? 't-input' : 'relative mt-2 block'}>
            <Search className={themed ? '' : 'pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-faint'} />
            <input
              className={themed ? '' : `${c.input} pl-9`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={150}
              autoComplete="name"
              placeholder="Prénom et nom, comme sur votre invitation"
              disabled={editable}
            />
          </span>
        </label>
        <button className={c.btn} type="submit" disabled={editable || state.status === 'loading' || name.trim().length < 3} style={{ marginTop: '1rem', width: '100%' }}>
          <MapPin style={{ width: 16, height: 16 }} />
          {state.status === 'loading' ? 'Recherche…' : 'Trouver ma place'}
        </button>
        <div aria-live="polite" style={{ marginTop: '1rem', minHeight: '2.5rem' }}>
          {editable && <p className={c.muted}>La recherche fonctionne sur le site publié, à partir du plan de table du tableau de bord.</p>}
          {state.status === 'found' && (
            <div className={themed ? 't-found' : 'flex items-center gap-3'}>
              <span className={themed ? 't-badge' : 'grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-purple text-xl font-bold text-white'}>{state.number}</span>
              <div>
                <p className={c.kicker}>Votre table</p>
                <h3 className={c.title} style={{ margin: 0 }}>Table {state.number} · {state.label}</h3>
              </div>
            </div>
          )}
          {state.status === 'missing' && (
            <p className={c.muted}>Aucune place trouvée à ce nom. Vérifiez l'orthographe complète ou demandez à l'accueil.</p>
          )}
          {state.status === 'error' && <p className={themed ? 'err' : 'text-sm text-danger'}>{state.message}</p>}
        </div>
      </form>
      <div className={c.card} style={themed ? { '--d': 1 } : undefined}>
        <p className={c.kicker}>Plan de la salle</p>
        {tables.length ? (
          <div className={themed ? 'room' : 'mt-4 grid grid-cols-3 gap-3 @xl:grid-cols-4'}>
            {tables.map((t) => {
              const hit = state.status === 'found' && state.number === t.number
              return (
                <div key={t.number} className={themed ? `room-table ${hit ? 'hit' : ''}` : 'grid justify-items-center gap-1 text-center'}>
                  <span
                    className={themed ? 'room-top' : `grid aspect-square w-full max-w-16 place-items-center rounded-full border-2 text-lg font-bold transition ${hit ? 'border-brand-purple bg-brand-purple text-white' : 'border-border bg-surface-2 text-ink'}`}
                  >
                    {t.number}
                  </span>
                  <small className={themed ? '' : 'truncate text-[11px] text-muted'}>{t.label}</small>
                </div>
              )
            })}
          </div>
        ) : (
          <p className={c.muted} style={{ margin: '.6rem 0 0' }}>
            {editable ? 'Créez vos tables dans Plan de table (tableau de bord).' : 'Le plan de la salle sera bientôt disponible.'}
          </p>
        )}
      </div>
    </div>
  )
}

// ---------- Réponse intégrée + pass d'entrée ----------
// Le billet reprend le modèle choisi par l'organisateur (Builder), sinon celui conseillé pour le
// modèle de site ; il se télécharge en PDF ou en image pour WhatsApp. C'est un billet vivant :
// compte à rebours, QR en grand le jour J, tampon « Entré » après le scan, et il sort d'une
// enveloppe la première fois qu'il s'affiche.
export function GuestPass({ invitation, eventTitle, ticket = {}, onInvitationChange, watch = true }) {
  const template = findTemplate(invitation.template)
  useCheckInWatch(invitation, onInvitationChange, watch)
  return (
    <TicketCard
      live={{ start: eventStartIso(invitation.eventDate, invitation.eventStartTime), checkedInAt: invitation.checkedInAt }}
      reveal
      look={ticket.look}
      themeId={template?.theme}
      style={resolveTicketStyle(invitation.ticketStyle, template?.theme)}
      note={invitation.ticketNote}
      accent={invitation.themeColor || template?.preview?.accent}
      event={{
        ...ticket,
        ...ticketEventInfo({
          name: eventTitle || invitation.eventName,
          eventDate: invitation.eventDate,
          startTime: invitation.eventStartTime,
          locationLabel: invitation.locationLabel,
          locationAddress: invitation.locationAddress,
          slug: invitation.eventSlug,
          kicker: ticket.kicker,
          brand: ticket.brand,
        }),
      }}
      guest={{ id: invitation.guestId, name: invitation.guestFullName, n: 1 + (invitation.rsvpAccompanyingCount ?? 0), side: invitation.rsvpSide || undefined }}
    />
  )
}

// sideLabel / sides : question « côté » propre au modèle (famille, pronostic, département…),
// réglée dans le bloc RSVP ; posée seulement à ceux qui confirment leur présence.
export function RsvpModule({ invitation, onInvitationChange, body, themed, editable, eventTitle, ticket, onCelebrate, submitRsvp, submitOpenRsvp, sideLabel, sides: rawSides, rules: rawRules, invitationLoading, invitationError }) {
  const c = cls(themed)
  const sides = usableSides(rawSides)
  const rules = rsvpRules(rawRules)
  // Réponses proposées : « Peut-être » seulement si l'organisateur l'a activé.
  const choices = [
    ['oui', 'Je serai là'],
    ['non', 'Je ne pourrai pas'],
    ...(rules.allowMaybe ? [['peut-etre', 'Peut-être']] : []),
  ]
  const choiceGrid = choices.length > 2 ? 'grid-cols-3' : 'grid-cols-2'
  const deadlineNote = rules.deadline ? `Merci de répondre avant le ${deadlineLabel(rules.deadline)}.` : ''
  const [attending, setAttending] = useState('oui')
  const [count, setCount] = useState(invitation?.rsvpAccompanyingCount ?? 0)
  const [side, setSide] = useState(invitation?.rsvpSide ?? '')
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [publicName, setPublicName] = useState('')
  const [publicEmail, setPublicEmail] = useState('')
  const [publicPhone, setPublicPhone] = useState('')

  const submitOpen = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const form = e.currentTarget
    setSending(true)
    setError('')
    try {
      const confirmed = attending === 'oui'
      const result = await submitOpenRsvp({
        fullName: publicName.trim(),
        email: publicEmail.trim() || null,
        phone: publicPhone.trim() || null,
        confirmed,
        maybe: attending === 'peut-etre',
        accompanyingCount: confirmed ? Math.min(count, rules.maxCompanions) : 0,
        message: message.trim() || null,
        side: confirmed && sides.includes(side) ? side : null,
      })
      onInvitationChange?.(result)
      if (confirmed) onCelebrate?.(form)
    } catch (err) {
      setError(err.message || "La réponse n'a pas pu être enregistrée.")
    } finally {
      setSending(false)
    }
  }

  // Les aperçus éditeur gardent leur texte d'aide ; le site public affiche le formulaire ouvert.
  if (!invitation) {
    if (!editable && !invitationLoading && submitOpenRsvp) {
      if (deadlinePassed(rules.deadline)) {
        return (
          <div className={c.card} style={{ textAlign: 'center' }}>
            <p className={c.title}>Les réponses sont closes</p>
            <p className={c.muted}>La date limite de réponse était le {deadlineLabel(rules.deadline)}.</p>
          </div>
        )
      }
      return (
        <form className={c.card} onSubmit={submitOpen} onClick={stop} style={{ display: 'grid', gap: '1.1rem' }}>
          <p className={c.title} style={{ margin: 0 }}>Confirmez votre présence</p>
          <p className={c.muted} style={{ margin: '-.7rem 0 0' }}>
            Indiquez votre nom et un moyen de vous contacter pour envoyer votre réponse.
            {deadlineNote && <> {deadlineNote}</>}
          </p>
          {invitationError && <p className={themed ? 'err' : 'text-sm text-danger'}>{invitationError}</p>}
          <label className={themed ? 'field' : 'block text-xs font-semibold tracking-wider text-muted uppercase'}>
            <span>Votre nom</span>
            <input className={c.input} autoComplete="name" maxLength={255} required value={publicName} onChange={(e) => setPublicName(e.target.value)} />
          </label>
          <div className={c.grid2}>
            <label className={themed ? 'field' : 'block text-xs font-semibold tracking-wider text-muted uppercase'}>
              <span>E-mail {!publicPhone.trim() && '(obligatoire si aucun téléphone)'}</span>
              <input className={c.input} type="email" autoComplete="email" maxLength={254} required={!publicPhone.trim()} value={publicEmail} onChange={(e) => setPublicEmail(e.target.value)} />
            </label>
            <label className={themed ? 'field' : 'block text-xs font-semibold tracking-wider text-muted uppercase'}>
              <span>Téléphone {!publicEmail.trim() && '(obligatoire si aucun e-mail)'}</span>
              <input className={c.input} type="tel" autoComplete="tel" maxLength={40} required={!publicEmail.trim()} value={publicPhone} onChange={(e) => setPublicPhone(e.target.value)} />
            </label>
          </div>
          <div className={themed ? 'field' : ''}>
            <span className={themed ? '' : 'text-xs font-semibold tracking-wider text-muted uppercase'}>Votre présence</span>
            <div className={themed ? 'seg' : `mt-2 grid ${choiceGrid} gap-2`} role="radiogroup" aria-label="Votre présence">
              {choices.map(([v, label]) => (
                <label key={v} className={themed ? '' : `flex min-h-12 cursor-pointer items-center justify-center rounded-lg border text-sm font-bold transition ${attending === v ? 'border-brand-purple bg-brand-purple text-white' : 'border-border text-ink'}`}>
                  <input type="radio" name="public-attending" value={v} checked={attending === v} onChange={() => setAttending(v)} className={themed ? '' : 'sr-only'} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
          {attending === 'oui' && rules.maxCompanions > 0 && (
            <label className={themed ? 'field' : 'block text-xs font-semibold tracking-wider text-muted uppercase'}>
              <span>Accompagnants</span>
              <select className={c.input} value={count} onChange={(e) => setCount(Number(e.target.value))}>
                {Array.from({ length: rules.maxCompanions + 1 }, (_, i) => (
                  <option key={i} value={i}>{i === 0 ? 'Aucun' : `${i} accompagnant${i > 1 ? 's' : ''}`}</option>
                ))}
              </select>
            </label>
          )}
          {attending === 'oui' && sides.length > 0 && (
            <label className={themed ? 'field' : 'block text-xs font-semibold tracking-wider text-muted uppercase'}>
              <span>{sideLabel?.trim() || DEFAULT_SIDE_LABEL}</span>
              <select className={c.input} value={sides.includes(side) ? side : ''} onChange={(e) => setSide(e.target.value)}>
                <option value="">Choisir…</option>
                {sides.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          )}
          <label className={themed ? 'field' : 'block text-xs font-semibold tracking-wider text-muted uppercase'}>
            <span>Un mot (facultatif)</span>
            <textarea className={c.input} rows={3} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} />
          </label>
          {error && <p className={themed ? 'err' : 'text-sm text-danger'}>{error}</p>}
          <button className={c.btn} type="submit" disabled={sending}>
            <Check style={{ width: 18, height: 18 }} />
            {sending ? 'Envoi…' : 'Envoyer ma réponse'}
          </button>
        </form>
      )
    }

    return (
      <div className={c.card} style={{ textAlign: 'center' }}>
        <span className={themed ? 'success' : ''}>
          <span className={themed ? 'check' : 'mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-purple text-white'}>
            <Check />
          </span>
        </span>
        <p className={c.title} style={{ marginTop: '1rem' }}>
          {invitationLoading
            ? 'Chargement de votre invitation…'
            : invitationError
              ? 'Votre invitation n’est pas accessible'
              : 'Vous avez reçu une invitation personnelle ?'}
        </p>
        <p className={c.muted} style={{ margin: '.4rem 0 0' }}>
          {invitationError || body || 'Ouvrez le lien qui vous a été envoyé (SMS, WhatsApp ou e-mail) : vous pourrez répondre ici et recevoir votre pass d’entrée.'}
        </p>
        {editable && <p className={c.note} style={{ marginTop: '1rem' }}>Les invités peuvent répondre directement sur le site ; un lien personnel leur permet aussi de retrouver ou modifier leur réponse.</p>}
        {editable && deadlineNote && <p className={c.note} style={{ marginTop: '.4rem' }}>{deadlineNote}</p>}
        {editable && sides.length > 0 && (
          <p className={c.note} style={{ marginTop: '.4rem' }}>
            Question posée à ceux qui viennent : « {sideLabel?.trim() || DEFAULT_SIDE_LABEL} » ({sides.join(', ')}).
          </p>
        )}
      </div>
    )
  }

  const maybe = Boolean(invitation.rsvpMaybe)
  const answered = maybe || (invitation.rsvpConfirmed !== null && invitation.rsvpConfirmed !== undefined)
  const closed = Boolean(invitation.rsvpClosed)
  const first = invitation.guestFullName.split(' ')[0]

  const submit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setSending(true)
    setError('')
    try {
      const confirmed = attending === 'oui'
      const result = await (submitRsvp ?? submitPublicRsvp)(invitation.guestId, {
        confirmed,
        maybe: attending === 'peut-etre',
        accompanyingCount: confirmed ? Math.min(count, rules.maxCompanions) : 0,
        message: message.trim() || null,
        side: confirmed && sides.includes(side) ? side : null,
      })
      onInvitationChange?.(result)
      setEditing(false)
      if (confirmed) onCelebrate?.(e.currentTarget)
    } catch (err) {
      setError(err.message || "La réponse n'a pas pu être enregistrée.")
    } finally {
      setSending(false)
    }
  }

  if (answered && !editing) {
    return (
      <div className={c.card} style={{ textAlign: 'center' }}>
        <span className={themed ? 'success' : ''}>
          <span className={themed ? 'check' : 'mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-purple text-white'}>
            {invitation.rsvpConfirmed ? <Ticket /> : <Check />}
          </span>
        </span>
        <p className={c.title} style={{ marginTop: '1rem' }}>
          {invitation.rsvpConfirmed ? `Merci ${first}, à très vite !` : `C'est noté, ${first}.`}
        </p>
        <p className={c.muted} style={{ margin: '.4rem 0 0' }}>
          {maybe
            ? `Vous pourrez confirmer ou décliner plus tard${rules.deadline ? `, avant le ${deadlineLabel(rules.deadline)}` : ''}.`
            : invitation.rsvpConfirmed
              ? rules.yesMessage || 'Voici votre pass d’entrée : présentez-le à l’accueil le jour J.'
              : rules.noMessage || 'Merci de nous avoir prévenus, vous nous manquerez.'}
        </p>
        {invitation.rsvpConfirmed && rules.yesMessage && (
          <p className={c.muted} style={{ margin: '.4rem 0 0' }}>Votre pass d’entrée est ci-dessous : présentez-le à l’accueil le jour J.</p>
        )}
        {invitation.rsvpConfirmed && (
          <GuestPass invitation={invitation} eventTitle={eventTitle} ticket={ticket} onInvitationChange={onInvitationChange} watch={!submitRsvp} />
        )}
        {!closed && (
          <button type="button" className={c.ghost} style={{ marginTop: '1.2rem' }} onClick={(e) => { e.stopPropagation(); setAttending(maybe ? 'peut-etre' : invitation.rsvpConfirmed ? 'oui' : 'non'); setEditing(true) }}>
            Modifier ma réponse
          </button>
        )}
      </div>
    )
  }

  if (closed) {
    return (
      <div className={c.card} style={{ textAlign: 'center' }}>
        <p className={c.title}>Les réponses sont closes</p>
        <p className={c.muted}>
          {deadlinePassed(rules.deadline) ? `La date limite de réponse était le ${deadlineLabel(rules.deadline)}.` : "L'événement a déjà eu lieu."} Merci {first} !
        </p>
      </div>
    )
  }

  return (
    <form className={c.card} onSubmit={submit} onClick={stop} style={{ display: 'grid', gap: '1.1rem' }}>
      <p className={c.title} style={{ margin: 0 }}>Bonjour {invitation.guestFullName}</p>
      {deadlineNote && <p className={c.muted} style={{ margin: '-.7rem 0 0' }}>{deadlineNote}</p>}
      <div className={themed ? 'field' : ''}>
        <span className={themed ? '' : 'text-xs font-semibold tracking-wider text-muted uppercase'}>Votre présence</span>
        <div className={themed ? 'seg' : `mt-2 grid ${choiceGrid} gap-2`} role="radiogroup" aria-label="Votre présence">
          {choices.map(([v, label]) => (
            <label key={v} className={themed ? '' : `flex min-h-12 cursor-pointer items-center justify-center rounded-lg border text-sm font-bold transition ${attending === v ? 'border-brand-purple bg-brand-purple text-white' : 'border-border text-ink'}`}>
              <input type="radio" name="attending" value={v} checked={attending === v} onChange={() => setAttending(v)} className={themed ? '' : 'sr-only'} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>
      {attending === 'oui' && rules.maxCompanions > 0 && (
        <label className={themed ? 'field' : 'block text-xs font-semibold tracking-wider text-muted uppercase'}>
          <span>Accompagnants</span>
          <select className={c.input} value={count} onChange={(e) => setCount(Number(e.target.value))}>
            {Array.from({ length: rules.maxCompanions + 1 }, (_, i) => (
              <option key={i} value={i}>
                {i === 0 ? 'Aucun' : `${i} accompagnant${i > 1 ? 's' : ''}`}
              </option>
            ))}
          </select>
        </label>
      )}
      {attending === 'oui' && sides.length > 0 && (
        <label className={themed ? 'field' : 'block text-xs font-semibold tracking-wider text-muted uppercase'}>
          <span>{sideLabel?.trim() || DEFAULT_SIDE_LABEL}</span>
          <select className={c.input} value={sides.includes(side) ? side : ''} onChange={(e) => setSide(e.target.value)}>
            <option value="">Choisir…</option>
            {sides.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className={themed ? 'field' : 'block text-xs font-semibold tracking-wider text-muted uppercase'}>
        <span>Un mot (facultatif)</span>
        <textarea className={c.input} rows={3} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      {error && <p className={themed ? 'err' : 'text-sm text-danger'}>{error}</p>}
      <button className={c.btn} type="submit" disabled={sending}>
        <Check style={{ width: 18, height: 18 }} />
        {sending ? 'Envoi…' : 'Envoyer ma réponse'}
      </button>
    </form>
  )
}
