import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { markEnvelopeSeen, envelopeSeen, ticketLiveState } from '../../utils/ticketLive'

const pad2 = (n) => String(n).padStart(2, '0')
const hm = (d) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// État du billet, recalculé chaque seconde tant qu'il change (compte à rebours, jour J).
export function useTicketLive(live) {
  const [now, setNow] = useState(() => Date.now())
  const state = live ? ticketLiveState(live, now) : null
  const ticking = state && (state.kind === 'before' || state.kind === 'today')
  useEffect(() => {
    if (!ticking) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [ticking])
  return state
}

// Bandeau du billet vivant, sous la référence.
export function LiveStrip({ state, mourn, paid }) {
  if (!state) return null
  let content
  if (state.kind === 'in')
    content = (
      <>
        <span className="lv-ok" aria-hidden="true">✓</span> {mourn ? "Merci d'être venu·e." : 'Bienvenue !'} {mourn ? 'Présence' : 'Entrée'}{' '}
        enregistrée à <b>{hm(state.at)}</b>.
      </>
    )
  else if (state.kind === 'past')
    content = mourn ? 'La cérémonie est passée. Merci pour votre soutien.' : "L'événement est terminé. Merci d'avoir été là !"
  else if (state.kind === 'today') {
    const h = Math.floor(state.minutes / 60)
    content = state.started ? (
      <>
        <span className="lv-dot" aria-hidden="true" /> C'est maintenant ! Montrez ce QR code à l'accueil.
      </>
    ) : (
      <>
        <span className="lv-dot" aria-hidden="true" /> C'est aujourd'hui ! {paid ? 'Ouverture' : 'Début'} dans{' '}
        <b>{h ? `${h} h ${pad2(state.minutes % 60)} min` : `${state.minutes} min`}</b>. Montrez ce QR code à l'accueil.
      </>
    )
  } else {
    const cell = (v, l) => (
      <span>
        <b>{pad2(v)}</b>
        <small>{l}</small>
      </span>
    )
    content = (
      <>
        <span className="lv-cd">
          {state.days > 0 && cell(state.days, state.days > 1 ? 'jours' : 'jour')}
          {cell(state.hours, 'h')}
          {cell(state.minutes, 'min')}
          {cell(state.seconds, 's')}
        </span>
        <span className="lv-cap">{mourn ? 'avant la cérémonie' : paid ? "avant l'ouverture des portes" : 'avant le grand jour'}</span>
      </>
    )
  }
  return (
    <p className="tkc-live" data-print-hide aria-live={state.kind === 'before' ? 'off' : 'polite'}>
      {content}
    </p>
  )
}

// Tampon « Entré » posé sur le billet après le scan.
export function EntryStamp({ state, mourn }) {
  if (state?.kind !== 'in') return null
  return (
    <span className="tkc-stamp" aria-hidden="true" data-print-hide>
      <b>{mourn ? 'Présent' : 'Entré'}</b>
      <i>{hm(state.at)}</i>
    </span>
  )
}

// QR code agrandi, à montrer au téléphone de l'accueil.
export function QrZoom({ src, code, onClose }) {
  const btn = useRef(null)
  useEffect(() => {
    const prev = document.activeElement
    btn.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [onClose])
  return createPortal(
    <div className="tk-qrbig" role="dialog" aria-modal="true" aria-label="QR code agrandi" onClick={onClose}>
      <div>
        <div className="qr">
          <img src={src} alt="QR code d'entrée" />
        </div>
        <code>{code}</code>
        <p>Montrez cet écran à l'accueil.</p>
        <button ref={btn} type="button" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>,
    document.body,
  )
}

// Enveloppe : à la première ouverture, le billet sort d'une enveloppe scellée aux couleurs du
// thème, avec le nom de l'invité. Touchez pour passer ; jamais rejouée sur ce téléphone.
export function TicketEnvelope({ code, name, mark, mourn, vars, motifCss }) {
  const [open, setOpen] = useState(() => Boolean(code) && !envelopeSeen(code) && !reducedMotion())
  const skip = useRef(null)
  useEffect(() => {
    if (!code) return
    markEnvelopeSeen(code)
    if (!open) return
    skip.current?.focus({ preventScroll: true })
    const t = setTimeout(() => setOpen(false), 3300)
    const onKey = (e) => (e.key === 'Escape' || e.key === 'Enter') && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
    }
  }, [code, open])
  if (!open) return null
  return createPortal(
    <div className={`tk-env ${mourn ? 'mourn' : ''}`} style={vars} onClick={() => setOpen(false)}>
      <div className="tk-env-box" aria-hidden="true">
        <div className="tk-env-back">
          <span className="tkc-motif" style={motifCss} />
        </div>
        <div className="tk-env-card" />
        <div className="tk-env-front">
          <small>{mourn ? "À l'attention de" : 'Pour'}</small>
          <b>{name}</b>
        </div>
        <div className="tk-env-flap" />
        <span className="tk-env-seal">{mark}</span>
      </div>
      <button ref={skip} type="button" className="tk-env-skip">
        Passer
      </button>
      <p className="sr-only" role="status">
        Votre billet est arrivé.
      </p>
    </div>,
    document.body,
  )
}
