import { Printer } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { listEventBlocks } from '../../api/eventBlocks'
import { listEventLocations } from '../../api/eventLocations'
import { mediaUrl } from '../../api/client'
import { invitationParagraphs } from '../../utils/invitationText'
import { deadlineLabel } from '../../utils/rsvpRules'
import { loadThemeFonts } from '../site/themes/themeFonts'
import EnvolCarton from '../site/themes/envol/EnvolCarton'
import { getSiteTheme, themePalette } from '../site/themes/themeDefs'
import { monogramOf, parseTitle } from '../site/themes/titleParts'
import { normalizeBlockType, templateFromCustomFields } from '../../utils/templateTheme'
import { resolveTicketStyle, ticketFormat, ticketFromCustomFields } from '../../utils/ticketStyles'
import TicketCard, { ticketEventInfo } from '../tickets/TicketCard'
import Button from '../ui/Button'
import Dialog from '../ui/Dialog'

// Impression groupée : exactement les cartes que les invités reçoivent (modèle de billet,
// palette et titre de la page), posées sur des feuilles A4 avec traits de coupe. Chaque
// carte porte le QR code de l'invité : une photocopie ne passe pas deux fois au scanner.
const FORMATS = [
  { id: 'a4', label: 'Planche', hint: '3 par feuille A4' },
  { id: 'a5', label: 'Grand format', hint: '2 par feuille A4' },
]
// Modèle Envol : carton d'invitation officiel, un par page A5.
const CARTON_FORMAT = { id: 'carton', label: 'Carton d’invitation', hint: '1 par page A5, nominatif' }
const NOUNS = { carte: 'carte', billet: 'billet', badge: 'badge', carton: 'carton' }

const parseJson = (raw) => {
  try {
    return JSON.parse(raw || '{}') ?? {}
  } catch {
    return {}
  }
}

// Attend une condition (QR code dessiné…) : 50 ms entre deux essais, 6 s au plus.
async function waitFor(check) {
  for (let i = 0; i < 120; i++) {
    const found = check()
    if (found) return found
    await new Promise((r) => setTimeout(r, 50))
  }
  throw new Error('Carte non affichée')
}

// Affiche chaque carte hors de l'écran, le temps de la capturer. render : la carte à
// dessiner (billet du modèle, ou carton A5).
async function captureCards(items, onProgress, render = (props) => <TicketCard key={props.guest.id} {...props} downloads={false} />, width = 760) {
  const { captureCard } = await import('../../utils/ticketPrint')
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  Object.assign(host.style, { position: 'fixed', left: '-10000px', top: '0', width: `${width}px`, pointerEvents: 'none' })
  document.body.appendChild(host)
  const root = createRoot(host)
  const canvases = []
  try {
    for (const [i, props] of items.entries()) {
      flushSync(() => root.render(render(props)))
      const card = await waitFor(() => {
        const el = host.querySelector('.tkc')
        const qr = el?.querySelector('.qr img')
        return qr?.complete && qr.naturalWidth ? el : null
      })
      // Comme au téléchargement d'un invité : sans ombre ni marge autour de la carte.
      host.querySelector('.tbtk')?.setAttribute('data-printing', '')
      canvases.push(await captureCard(card))
      onProgress(i + 1, items.length)
    }
  } finally {
    root.unmount()
    host.remove()
  }
  return canvases
}

export default function PrintTicketsDialog({ open, onClose, event, guests, visible, accompanyingByGuest, sideByGuest = {}, onDone }) {
  const [format, setFormat] = useState('a4')
  const [who, setWho] = useState('conf')
  const [location, setLocation] = useState(null)
  const [hero, setHero] = useState({})
  const [blocks, setBlocks] = useState([])
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !event?.id) return
    let cancelled = false
    listEventLocations(event.id)
      .then((list) => !cancelled && setLocation([...(list ?? [])].sort((a, b) => a.position - b.position)[0] ?? null))
      .catch(() => !cancelled && setLocation(null))
    // L'en-tête de la page donne le titre, le surtitre et la palette de la carte.
    listEventBlocks(event.id)
      .then((list) => {
        if (cancelled) return
        setBlocks(list ?? [])
        setHero(parseJson((list ?? []).find((b) => normalizeBlockType(b.blockType) === 'Hero')?.content))
      })
      .catch(() => !cancelled && setHero({}))
    return () => {
      cancelled = true
    }
  }, [open, event?.id])

  const choices = useMemo(
    () => [
      ['conf', 'Les invités confirmés', guests.filter((g) => g.status === 'Present')],
      ['all', 'Tous les invités (sans les refus)', guests.filter((g) => g.status !== 'Absent')],
      ['shown', 'La liste affichée (filtre et recherche)', visible],
    ],
    [guests, visible],
  )
  const list = (choices.find((c) => c[0] === who) ?? choices[0])[2]
  const template = templateFromCustomFields(event?.customFields)
  const envol = template?.theme === 'envol'
  const formats = envol ? [CARTON_FORMAT, ...FORMATS] : FORMATS
  const cartons = envol && format === 'carton'
  const perPage = cartons ? 1 : format === 'a5' ? 2 : 3
  const pages = Math.ceil(list.length / perPage)

  // Envol : le carton est proposé d'abord.
  useEffect(() => {
    if (open) setFormat(envol ? 'carton' : 'a4')
  }, [open, envol])

  const ticket = ticketFromCustomFields(event?.customFields)
  const style = resolveTicketStyle(ticket.style, template?.theme)
  const noun = cartons ? 'carton' : (NOUNS[ticketFormat(style)] ?? 'carte')
  const plural = (n) => `${n} ${noun}${n > 1 ? 's' : ''}`

  const cardEvent = useMemo(() => {
    if (!event) return null
    const theme = getSiteTheme(template?.theme)
    const palette = theme ? themePalette(theme, hero.palette) : null
    const title = hero.title || event.name
    const titleInfo = theme ? parseTitle(title, theme.hero, theme.joiner) : null
    return {
      ...(titleInfo && { pre: titleInfo.pre || theme.ticketPre, names: titleInfo.names, monogram: monogramOf(titleInfo) }),
      ...ticketEventInfo({
        name: title,
        eventDate: event.eventDate,
        startTime: event.startTime,
        slug: event.slug,
        locationLabel: location?.label,
        locationAddress: location?.address,
        kicker: hero.kicker || theme?.kicker || template?.preview?.eyebrow,
        brand: theme ? `${theme.name} · ${palette.label}` : template?.name,
      }),
    }
  }, [event, template, hero, location])

  // Textes du carton : en-tête, invitation, tenue et date limite de la page de l'événement.
  const carton = useMemo(() => {
    if (!envol || !event) return null
    const content = (type) => parseJson(blocks.find((b) => normalizeBlockType(b.blockType) === type)?.content)
    const custom = parseJson(event.customFields)
    const start = event.eventDate ? new Date(`${event.eventDate}T${event.startTime || '12:00'}`) : null
    const when = start
      ? `Le ${start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}${event.startTime ? ` à ${event.startTime.slice(0, 5).replace(':', 'h')}` : ''}`
      : ''
    const deadline = content('RSVP').deadline
    return {
      organisation: hero.title || custom.organizer?.name || event.name,
      logo: custom.organizer?.logoUrl ? mediaUrl(custom.organizer.logoUrl) : '',
      intro: invitationParagraphs(content('Invitation').body)[0] ?? '',
      title: hero.kicker || 'Cérémonie de présentation des vœux',
      year: start && !String(hero.kicker ?? '').includes(String(start.getFullYear())) ? String(start.getFullYear()) : '',
      when,
      venue: [location?.label, location?.address].filter((s) => s && s !== 'Lieu principal').join(', '),
      dress: content('Dress code').title?.trim() ?? '',
      deadline: deadline ? deadlineLabel(deadline) : '',
      url: `tbfmoment.com/e/${event.slug}`,
      color: hero.color || event.themeColor,
    }
  }, [envol, event, blocks, hero, location])

  const generate = async () => {
    setBusy('0')
    setError('')
    try {
      if (cartons) {
        loadThemeFonts(getSiteTheme('envol'))
        const canvases = await captureCards(
          list.map((g) => ({ guest: { id: g.id, name: g.fullName } })),
          (i, n) => setBusy(`${i}/${n}`),
          (props) => <EnvolCarton key={props.guest.id} guest={props.guest} carton={carton} />,
          900,
        )
        const { cartonPdf } = await import('../../utils/ticketPrint')
        await cartonPdf(canvases, { title: event.name })
        onDone?.(`${plural(list.length)} téléchargé${list.length > 1 ? 's' : ''} en PDF`)
        return
      }
      const items = list.map((g) => ({
        style,
        note: ticket.note,
        themeId: template?.theme,
        paletteId: hero.palette,
        motif: hero.motif,
        accent: event.themeColor || template?.preview?.accent,
        event: cardEvent,
        guest: { id: g.id, name: g.fullName, n: 1 + (accompanyingByGuest[g.id] ?? 0), side: sideByGuest[g.id] },
      }))
      const canvases = await captureCards(items, (i, n) => setBusy(`${i}/${n}`))
      const { cardSheetPdf } = await import('../../utils/ticketPrint')
      await cardSheetPdf(canvases, format, { title: event.name, prefix: noun })
      onDone?.(`${plural(list.length)} téléchargé${list.length > 1 ? 's' : ''} en PDF`)
    } catch {
      setError("Le PDF n'a pas pu être créé. Vérifiez la connexion et réessayez.")
    } finally {
      setBusy('')
    }
  }

  const quoteUrl = useMemo(() => {
    if (!cardEvent) return '#'
    const msg = `Bonjour TBF DIGITAL, je souhaite faire imprimer ${list.length ? plural(list.length) : `des ${noun}s`} pour mon événement « ${cardEvent.title} » (${cardEvent.dateText}${cardEvent.venue ? `, ${cardEvent.venue}` : ''}). Merci de m'envoyer un devis (papier, délai, livraison).`
    return `https://wa.me/237680264060?text=${encodeURIComponent(msg)}`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardEvent, list.length, noun])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Imprimer les ${noun}s`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} data-close>
            Fermer
          </Button>
          <Button variant="gradient" onClick={generate} disabled={!list.length || !!busy}>
            <Printer className="h-4 w-4" />
            {busy ? `Préparation… ${busy === '0' ? '' : busy}` : 'Télécharger le PDF'}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">
        Les mêmes {noun}s que vos invités reçoivent, chacune avec son QR code unique : une photocopie ne passera pas deux
        fois au scanner.
      </p>
      <div className={`mt-4 grid gap-2 ${formats.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`} role="radiogroup" aria-label="Format">
        {formats.map((f) => (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={format === f.id}
            onClick={() => setFormat(f.id)}
            className={`rounded-xl border px-3 py-2.5 text-left transition ${
              format === f.id ? 'border-brand-purple bg-brand-purple/10' : 'border-border-soft hover:border-faint'
            }`}
          >
            <span className="block text-sm font-semibold text-ink">{f.label}</span>
            <span className="block text-xs text-muted">{f.hint}</span>
          </button>
        ))}
      </div>
      <label className="mt-4 block">
        <span className="text-sm font-medium text-ink">Pour qui ?</span>
        <select
          value={who}
          onChange={(e) => setWho(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink"
        >
          {choices.map(([k, label, arr]) => (
            <option key={k} value={k}>
              {label} ({arr.length})
            </option>
          ))}
        </select>
      </label>
      <p className="mt-4 rounded-lg border border-border-soft bg-surface-2 px-3 py-2 text-sm text-ink">
        {list.length ? (
          <>
            <b>{plural(list.length)}</b> · {pages} page{pages > 1 ? 's' : ''} {cartons ? 'A5, sans marge' : 'A4 avec traits de coupe'}
          </>
        ) : (
          'Aucun invité à imprimer avec ce choix.'
        )}
      </p>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      <a
        href={quoteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center gap-3 rounded-xl border border-[color:var(--color-gold)]/50 bg-[color:var(--color-gold)]/10 px-4 py-3 text-sm transition hover:border-[color:var(--color-gold)]"
      >
        <Printer className="h-5 w-5 flex-none text-[color:var(--color-gold)]" aria-hidden="true" />
        <span>
          <b className="block text-ink">Faire imprimer par TBF DIGITAL</b>
          <span className="text-xs text-muted">Papier épais, finitions soignées, livraison à Douala. Devis sur WhatsApp.</span>
        </span>
      </a>
    </Dialog>
  )
}
