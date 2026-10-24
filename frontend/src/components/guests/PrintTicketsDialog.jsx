import { Printer } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { listEventBlocks } from '../../api/eventBlocks'
import { listEventLocations } from '../../api/eventLocations'
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
const NOUNS = { carte: 'carte', billet: 'billet', badge: 'badge' }

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

// Affiche chaque carte hors de l'écran, le temps de la capturer.
async function captureCards(items, onProgress) {
  const { captureCard } = await import('../../utils/ticketPrint')
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  Object.assign(host.style, { position: 'fixed', left: '-10000px', top: '0', width: '760px', pointerEvents: 'none' })
  document.body.appendChild(host)
  const root = createRoot(host)
  const canvases = []
  try {
    for (const [i, props] of items.entries()) {
      flushSync(() => root.render(<TicketCard key={props.guest.id} {...props} downloads={false} />))
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
      .then((blocks) => !cancelled && setHero(parseJson((blocks ?? []).find((b) => normalizeBlockType(b.blockType) === 'Hero')?.content)))
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
  const perPage = format === 'a5' ? 2 : 3
  const pages = Math.ceil(list.length / perPage)

  const template = templateFromCustomFields(event?.customFields)
  const ticket = ticketFromCustomFields(event?.customFields)
  const style = resolveTicketStyle(ticket.style, template?.theme)
  const noun = NOUNS[ticketFormat(style)] ?? 'carte'
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

  const generate = async () => {
    setBusy('0')
    setError('')
    try {
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
      <div className="mt-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Format">
        {FORMATS.map((f) => (
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
            <b>{plural(list.length)}</b> · {pages} page{pages > 1 ? 's' : ''} A4 avec traits de coupe
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
