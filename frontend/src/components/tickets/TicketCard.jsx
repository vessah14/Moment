import { Download } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import { motifStyle } from '../site/themes/motifs'
import { getSiteTheme, themeMotif, themePalette } from '../site/themes/themeDefs'
import { loadThemeFonts } from '../site/themes/themeFonts'
import { ticketCode, ticketFormat } from '../../utils/ticketStyles'
import { EntryStamp, LiveStrip, QrZoom, TicketEnvelope, useTicketLive } from './TicketLive'
import '../site/themes/themes.css'
import './tickets.css'

// Billet de l'invité. Le haut reprend l'habillage du site (couleurs, motif, ornement et polices
// du modèle), le talon clair porte le nom, le QR code et la référence. Le style de billet choisi
// par l'organisateur ajoute ses décorations (bords en dents de scie, double cadre, bougie…).
// Le QR code contient l'identifiant de l'invité : c'est ce que lit le scanner d'entrée.
// live = { start, end, checkedInAt } : billet vivant (compte à rebours, jour J, tampon « Entré »).
// reveal : à la première ouverture sur ce téléphone, le billet sort d'une enveloppe.

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

// Infos d'affichage d'un événement à partir des champs de l'API (date « 2027-01-16 », heure « 10:00:00 »).
export function ticketEventInfo({ name, eventDate, startTime, locationLabel, locationAddress, slug, organizer, category, kicker, brand }) {
  const d = eventDate ? new Date(`${eventDate}T12:00:00`) : null
  const fmt = (o) => (d ? new Intl.DateTimeFormat('fr-FR', o).format(d) : '')
  const dayMonthYear = fmt({ day: 'numeric', month: 'long', year: 'numeric' })
  return {
    title: name || 'Événement',
    slug: slug || '',
    organizer: organizer || '',
    kicker: [kicker || category, dayMonthYear].filter(Boolean).join(' · '),
    dateText: cap(fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })),
    dayShort: cap(fmt({ weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '')),
    timeText: startTime ? startTime.slice(0, 5).replace(':', 'h') : '',
    venue: locationLabel || locationAddress || '',
    venueAddr: locationLabel && locationAddress && locationAddress !== locationLabel ? locationAddress : '',
    brand: brand || '',
  }
}

// Initiales du monogramme : les petits mots et les nombres (« Les 50 ans de… ») ne comptent pas.
const SMALL = new Set(['le', 'la', 'les', 'de', 'du', 'des', 'et', 'ans', 'an', 'au', 'aux', 'pour', 'à'])
export const initials = (s) =>
  String(s || '')
    .split(/[\s&·'’-]+/)
    .filter((w) => w.length > 1 && !SMALL.has(w.toLowerCase()) && !/^\d+$/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'TB'

// ---------- Couleurs ----------
const rgb = (h) => {
  let x = String(h || '').trim().replace('#', '')
  if (x.length === 3) x = x.split('').map((c) => c + c).join('')
  const n = parseInt(x.slice(0, 6), 16)
  return Number.isNaN(n) ? [0, 0, 0] : [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const lum = (h) => {
  const [r, g, b] = rgb(h).map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const x = lum(a)
  const y = lum(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

// Palette de repli quand l'événement n'a pas de modèle premium.
function fallbackPalette(accent = '#6C4BF4') {
  return {
    id: 'tbf',
    label: '',
    dark: false,
    vars: {
      '--bg': '#F6F4FC', '--surface': '#FFFFFF', '--surface-2': '#EFEBFB', '--fg': '#1A1430', '--muted': '#5F5880',
      '--accent': accent, '--accent-2': '#FF7A3D', '--on-accent': '#FFFFFF', '--line': '#E3DEF3', '--motif': accent, '--motif-opacity': '.08',
    },
  }
}

// Habillage du billet : thème, palette et motif du site (ou ceux par défaut du modèle).
export function ticketLook({ theme, palette, motif, themeId, paletteId, accent } = {}) {
  const t = theme || (themeId ? getSiteTheme(themeId) : null)
  const p = palette || (t ? themePalette(t, paletteId) : fallbackPalette(accent))
  const m = t ? themeMotif(t, motif) : 'aucun'
  return { theme: t, palette: p, motif: m }
}

// Couleurs dérivées : décor (cadre, surtitre, pastille) et talon clair avec son encre.
export function ticketColors(palette) {
  const v = palette.vars
  const usable = (c) => c && contrast(c, v['--bg']) >= 2.4 && contrast(c, v['--fg']) >= 1.5
  const deco = usable(v['--accent']) ? v['--accent'] : usable(v['--accent-2']) ? v['--accent-2'] : v['--fg']
  return {
    deco,
    decoInk: lum(deco) > 0.4 ? '#15121C' : '#FFFFFF',
    stubBg: palette.dark ? v['--fg'] : '#FFFFFF',
    stubInk: palette.dark ? v['--bg'] : v['--fg'],
  }
}

// Textes selon le format : carte d'invitation, billet d'entrée ou badge.
export function ticketTexts(style, event, guest, format = 'carte') {
  const mark = event.monogram || initials(event.organizer || event.title)
  const n = guest.n || 1
  const couple = event.names?.length === 2
  const byFormat = {
    carte: {
      kind: "Carte d'invitation",
      invite: style === 'sobre' ? 'La famille vous remercie de votre présence' : couple ? 'vous invitent à leur célébration' : "Merci d'avoir confirmé votre présence",
      pill: style === 'sobre' ? 'Présence confirmée' : 'Invitation validée',
      guestLabel: style === 'sobre' ? 'Au nom de' : 'Votre invité',
      qrLabel: 'QR invité',
      download: 'Télécharger la carte',
    },
    billet: {
      kind: "Billet d'entrée",
      invite: 'Votre billet est validé',
      pill: 'Billet validé',
      guestLabel: 'Titulaire',
      qrLabel: 'QR billet',
      download: 'Télécharger le billet',
    },
    badge: {
      kind: 'Badge',
      invite: 'Merci pour votre inscription',
      pill: 'Inscription validée',
      guestLabel: 'Participant',
      qrLabel: 'QR badge',
      download: 'Télécharger le badge',
    },
  }[format] ?? {}
  return {
    ...byFormat,
    mark,
    kicker: event.kicker || '',
    when: [event.dateText, event.timeText].filter(Boolean).join(' · '),
    place: [event.venue, event.venueAddr].filter(Boolean).join(' · '),
    meta: [`${n} place${n > 1 ? 's' : ''}`, guest.type, guest.table, guest.side].filter(Boolean).join(' · '),
    reference: `${String(mark).replace(/[^A-Z0-9]/gi, '').slice(0, 3).toUpperCase() || 'TB'}-${ticketCode(guest.id).slice(0, 5)}`,
    url: event.slug ? `tbfmoment.com/e/${event.slug}` : 'tbfmoment.com',
    brand: event.brand || 'TBF MOMENT',
  }
}

const CANDLE =
  '<svg viewBox="0 0 62 22" fill="none" aria-hidden="true"><path d="M4 14h20M38 14h20" stroke="currentColor" stroke-width="1.2"/><path d="M31 3c-2.2 3-2.2 5 0 6.6 2.2-1.6 2.2-3.6 0-6.6z" fill="currentColor"/><path d="M29 11h4v8h-4z" stroke="currentColor" stroke-width="1.2"/></svg>'

function Ornament({ html, mark, small }) {
  return html ? (
    <span className={`tkc-orn ${small ? 'sm' : ''}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span className={`tkc-seal ${small ? 'sm' : ''}`} aria-hidden="true">
      {mark}
    </span>
  )
}

export default function TicketCard({ style, note, event, guest, look: lookIn, themeId, paletteId, motif: motifId, accent, downloads = true, live, reveal = false }) {
  const root = useRef(null)
  const card = useRef(null)
  const [qr, setQr] = useState(null)
  const [zoom, setZoom] = useState(false)
  const liveState = useTicketLive(live)
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')
  const { theme, palette, motif } = ticketLook({ themeId, paletteId, motif: motifId, accent, ...lookIn })

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(guest.id, { margin: 1, width: 360, errorCorrectionLevel: 'M' })
      .then((url) => !cancelled && setQr(url))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [guest.id])

  useEffect(() => loadThemeFonts(theme), [theme])

  const format = ticketFormat(style, Boolean(guest.type))
  const t = ticketTexts(style, event, guest, format)
  const c = ticketColors(palette)
  const motifCss = motifStyle(motif, palette)
  const names =
    event.names?.length === 2 ? (
      <>
        {event.names[0]} <i>&</i> {event.names[1]}
      </>
    ) : (
      event.names?.[0] || event.title
    )
  const ornament = style === 'sobre' ? CANDLE : theme?.ornament
  const mourn = style === 'sobre'
  const liveClass = liveState ? `is-${liveState.kind}` : ''

  const download = async (kind) => {
    setBusy(kind)
    setMsg('')
    // Pendant la capture : le bouton laisse place à l'adresse de la page, sans ombre ni marge.
    root.current?.setAttribute('data-printing', '')
    try {
      const lib = await import('../../utils/ticketPrint')
      const options = { palette, deco: c.deco, title: event.title, guestName: guest.name, prefix: format }
      if (kind === 'pdf') await lib.ticketPdf(card.current, options)
      else await lib.ticketImage(card.current, options)
    } catch {
      setMsg('Le téléchargement a échoué. Vérifiez la connexion et réessayez.')
    } finally {
      root.current?.removeAttribute('data-printing')
      setBusy('')
    }
  }

  const vars = {
    ...palette.vars,
    '--deco': c.deco,
    '--deco-ink': c.decoInk,
    '--stub-bg': c.stubBg,
    '--stub-ink': c.stubInk,
    background: 'transparent',
  }

  // Touchez le QR code pour l'agrandir devant le téléphone de l'accueil.
  const qrBlock = (
    <div className="tkc-qr">
      <button type="button" className="qr" onClick={() => qr && setZoom(true)} aria-label={`Agrandir le QR code de ${guest.name}`} disabled={!qr}>
        {qr && <img src={qr} alt="" />}
      </button>
      <small>{t.qrLabel}</small>
    </div>
  )
  const extras = (
    <>
      {zoom && <QrZoom src={qr} code={ticketCode(guest.id)} onClose={() => setZoom(false)} />}
      {reveal && <TicketEnvelope code={guest.id} name={guest.name} mark={t.mark} mourn={mourn} vars={vars} motifCss={motifCss} />}
    </>
  )
  const downloadButton = downloads && (
    <button type="button" className="tkc-bar tkc-dl" onClick={() => download('pdf')} disabled={!!busy} data-print-hide>
      <Download aria-hidden="true" style={{ width: 18, height: 18 }} />
      {busy === 'pdf' ? 'Préparation…' : t.download}
    </button>
  )
  const hint = (
    <p className="tkc-hint" role="status">
      {msg || note || "À présenter à l'accueil le jour J"}
      {downloads && !msg && (
        <span data-print-hide>
          {' · '}
          <button type="button" onClick={() => download('img')} disabled={!!busy}>
            {busy === 'img' ? 'préparation…' : 'image pour WhatsApp'}
          </button>
        </span>
      )}
    </p>
  )

  // ---------- Billet d'entrée : horizontal, talon détachable à droite ----------
  if (format === 'billet') {
    return (
      <div ref={root} className={`tbft tbtk ${liveClass}`} data-tbft={theme?.id} style={vars}>
        {extras}
        <article ref={card} className={`tkc tkc-billet tks-${style}`} aria-label={`${t.kind} de ${guest.name}`}>
          <div className="tkb-main">
            <span className="tkc-motif" style={motifCss} aria-hidden="true" />
            {style === 'concert' && <span className="tkc-holo" aria-hidden="true" />}
            {style === 'stade' && <span className="tkc-stripes" aria-hidden="true" />}
            <div className="tkb-frame">
              <div className="tkb-head">
                <Ornament html={ornament} mark={t.mark} small />
                <span className="tkc-k">{t.kicker || t.kind}</span>
              </div>
              <h3 className="tkb-title">{event.title}</h3>
              {t.when && <p className="tkb-date">{t.when}</p>}
              {t.place && <p className="tkc-place">{t.place}</p>}
              <div className="tkb-foot">
                <div>
                  <span className="tkc-lbl">{t.guestLabel}</span>
                  <p className="tkb-name">{guest.name}</p>
                  <p className="tkb-meta">{t.meta}</p>
                </div>
                <span className="tkc-pill">{t.pill}</span>
              </div>
            </div>
          </div>
          <div className="tkb-perf" aria-hidden="true" />
          <div className="tkb-stub">
            <EntryStamp state={liveState} mourn={mourn} />
            {qrBlock}
            <span className="tkc-lbl">Référence</span>
            <p className="tkc-ref">{t.reference}</p>
            <p className="tkb-url" data-print-only>
              {t.url}
            </p>
            <p className="tkc-brand">{t.brand}</p>
          </div>
        </article>
        {(downloads || liveState) && (
          <div className="tkc-actions">
            <LiveStrip state={liveState} mourn={mourn} paid />
            {downloadButton}
            {hint}
          </div>
        )}
      </div>
    )
  }

  // ---------- Carte d'invitation et badge : verticaux, talon en bas ----------
  return (
    <div ref={root} className={`tbft tbtk ${liveClass}`} data-tbft={theme?.id} style={vars}>
      {extras}
      <article ref={card} className={`tkc tkc-${format} tks-${style}`} aria-label={`${t.kind} de ${guest.name}`}>
        {style === 'pagne' && <span className="tkc-saw top" aria-hidden="true" />}
        <div className="tkc-top">
          <span className="tkc-motif" style={motifCss} aria-hidden="true" />
          <div className="tkc-frame">
            {format === 'badge' && <span className="tkc-slot" aria-hidden="true" />}
            {style === 'polaroid' && <span className="tkc-tape" aria-hidden="true" />}
            <Ornament html={ornament} mark={t.mark} />
            {t.kicker && <p className="tkc-k">{t.kicker}</p>}
            {event.pre && <p className="tkc-pre">{event.pre}</p>}
            <h3 className="tkc-names">{names}</h3>
            <p className="tkc-invite">{t.invite}</p>
            {t.when && <p className="tkc-date">{t.when}</p>}
            {t.place && <p className="tkc-place">{t.place}</p>}
            <span className="tkc-pill">{t.pill}</span>
          </div>
        </div>
        <div className="tkc-perf" aria-hidden="true">
          {style === 'pagne' && <span className="tkc-saw mid" />}
        </div>
        <div className="tkc-bot">
          <EntryStamp state={liveState} mourn={mourn} />
          <div className="tkc-row">
            <div>
              <span className="tkc-lbl">{t.guestLabel}</span>
              <p className="tkc-name">{guest.name}</p>
              <p className="tkc-meta">{t.meta}</p>
            </div>
            {qrBlock}
          </div>
          <div className="tkc-sep" />
          <span className="tkc-lbl">Référence</span>
          <p className="tkc-ref">{t.reference}</p>
          <LiveStrip state={liveState} mourn={mourn} />
          {downloadButton}
          <p className={`tkc-bar tkc-url ${downloads ? '' : 'always'}`} data-print-only>
            {t.url}
          </p>
          {hint}
          <p className="tkc-brand">{t.brand}</p>
        </div>
        {style === 'pagne' && <span className="tkc-saw bottom" aria-hidden="true" />}
      </article>
    </div>
  )
}
