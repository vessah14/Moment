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

// QR code agrandi, à montrer au téléphone de l'accueil. Écran tout blanc (le plus lumineux
// possible : un site ne peut pas régler la luminosité du téléphone) et maintenu allumé
// tant qu'il est ouvert, pour que le scan passe du premier coup.
export function QrZoom({ src, code, onClose }) {
  const btn = useRef(null)
  useEffect(() => {
    const prev = document.activeElement
    btn.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    let lock = null
    let closed = false
    const keepAwake = () => {
      if (document.visibilityState !== 'visible' || !navigator.wakeLock) return
      navigator.wakeLock
        .request('screen')
        .then((l) => (closed ? l.release() : (lock = l)))
        .catch(() => {}) // refusé (économie d'énergie) : sans gravité
    }
    keepAwake()
    // Le verrou tombe quand on quitte l'onglet : repris au retour.
    document.addEventListener('visibilitychange', keepAwake)
    return () => {
      closed = true
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('visibilitychange', keepAwake)
      lock?.release().catch(() => {})
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
        <p>Montrez cet écran à l'accueil. Si le scan hésite, montez la luminosité de votre téléphone.</p>
        <button ref={btn} type="button" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>,
    document.body,
  )
}

// Message vocal des hôtes sur le billet : « Brenda, un message de Shanice pour vous ».
export function TicketVoice({ voice, name, mourn }) {
  const audio = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [failed, setFailed] = useState(false)
  if (!voice?.url || failed) return null
  const first = String(name || '').trim().split(/\s+/)[0]
  const toggle = () => {
    const el = audio.current
    if (!el) return
    if (el.paused) el.play().catch(() => setFailed(true))
    else el.pause()
  }
  return (
    <div className={`tkc-voice ${playing ? 'on' : ''}`} data-print-hide>
      <button type="button" onClick={toggle} aria-label={playing ? 'Mettre en pause le message' : 'Écouter le message des hôtes'}>
        {playing ? (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
        )}
      </button>
      <div>
        <small>{first ? `${first}, ` : ''}{mourn ? 'un message de la famille' : 'un message pour vous'}</small>
        <b>{voice.from ? `De la part de ${voice.from}` : 'Écoutez le mot des hôtes'}</b>
        <span className="tkc-voice-bar" aria-hidden="true">
          <i style={{ width: `${progress * 100}%` }} />
        </span>
      </div>
      <audio
        ref={audio}
        src={voice.url}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setProgress(0)
        }}
        onTimeUpdate={(e) => {
          const el = e.currentTarget
          if (el.duration && Number.isFinite(el.duration)) setProgress(el.currentTime / el.duration)
        }}
        onError={() => setFailed(true)}
      />
    </div>
  )
}

// Table de l'invité. Avant le jour J : « une place vous attend » (l'API ne donne pas encore
// la table). Le jour J : la table est révélée, avec une animation la première fois sur ce
// téléphone.
export function TableReveal({ seat, state, code, mourn }) {
  const revealed = Boolean(seat?.number) && (state?.kind === 'today' || state?.kind === 'in')
  const [fresh] = useState(() => revealed && Boolean(code) && !envelopeSeen(`table:${code}`) && !reducedMotion())
  useEffect(() => {
    if (revealed && code) markEnvelopeSeen(`table:${code}`)
  }, [revealed, code])
  if (!seat?.has || state?.kind === 'past') return null
  if (!revealed)
    return (
      <p className="tkc-table soon" data-print-hide>
        <span aria-hidden="true">🪑</span> Votre place est prête : {mourn ? 'elle vous sera indiquée' : 'votre table sera révélée'} le jour J.
      </p>
    )
  return (
    <div className={`tkc-table on ${fresh ? 'fresh' : ''}`} role="status">
      <small>Votre table</small>
      <b>{seat.label || `Table ${seat.number}`}</b>
      {seat.label && <i>Table n° {seat.number}</i>}
    </div>
  )
}

// Après la fête : le billet devient une carte de remerciement, avec une photo de
// l'événement et un lien vers la galerie.
export function TicketSouvenir({ state, souvenir, title, name, mourn }) {
  if (state?.kind !== 'past' || !souvenir) return null
  const first = String(name || '').trim().split(/\s+/)[0]
  return (
    <section className={`tk-souv ${mourn ? 'mourn' : ''}`} aria-label="Souvenir de l'événement" data-print-hide>
      {souvenir.photo && <img src={souvenir.photo} alt="" loading="lazy" />}
      <div>
        <small>{mourn ? 'Avec reconnaissance' : 'Souvenir'}</small>
        <h3>{mourn ? `Merci${first ? `, ${first}` : ''}, pour votre présence.` : `Merci d'avoir été là${first ? `, ${first}` : ''} !`}</h3>
        <p>
          {mourn
            ? `Votre soutien lors de « ${title} » a beaucoup compté pour la famille.`
            : `« ${title} » ne serait pas la même sans vous. Les meilleurs moments vous attendent dans la galerie.`}
        </p>
        {souvenir.galleryHref && (
          <a
            className="tk-souv-cta"
            href={souvenir.galleryHref}
            onClick={(e) => {
              if (!souvenir.galleryHref.startsWith('#')) return
              // Galerie sur la même page : la fenêtre du pass se ferme, puis on y descend.
              e.preventDefault()
              souvenir.onOpen?.()
              requestAnimationFrame(() =>
                document.getElementById(souvenir.galleryHref.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
              )
            }}
          >
            {mourn ? 'Voir les photos' : 'Revoir les photos de la fête'}
          </a>
        )}
      </div>
    </section>
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
