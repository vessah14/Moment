import {
  Cake,
  Calendar,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gem,
  Gift,
  Heart,
  Home,
  ImagePlus,
  Images,
  List,
  MapPin,
  Music,
  Navigation,
  Share2,
  Star,
  Ticket,
  Users,
  UtensilsCrossed,
  Wine,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { eventShareUrl, mediaUrl } from '../../../api/client'
import { signPublicGuestBook } from '../../../api/publicEvents'
import { safeBlockImagePath, safeCoverPath, siteBlockDomId } from '../../../utils/sitePage'
import BlockToolbar from '../BlockToolbar'
import { DressCodeModule, FamiliesModule, GiftModule, GuestPass, PartnersModule, RsvpModule, SeatingModule, SpeakersModule } from '../modules/SiteModules'
import { usableColors } from '../../../utils/mobileMoney'
import { usablePartners, usablePeople, usableVenues } from '../../../utils/blockLists'
import { burst, createMusic, createParticles } from './effects'
import { motifStyle } from './motifs'
import { loadThemeFonts } from './themeFonts'
import { getSiteTheme, themeMotif, themePalette } from './themeDefs'
import { monogramOf, parseTitle } from './titleParts'
import { invitationGreeting, invitationParagraphs, invitationWords } from '../../../utils/invitationText'
import { ILLUS } from '../../../utils/illus'
import { invitationFor } from '../../../data/invitations'
import './themes.css'

// Rendu « premium » du site d'un événement (Noor, Bloom, Toghu, Ndop, Fiesta,
// Prestige, Arena, Live, Summit, Mémoire…). Mêmes blocs et mêmes données réelles que SitePage ; seule l'apparence
// change. Sur le site public : ouverture animée, particules, musique, navigation
// mobile. Dans le Builder (embedded) : rendu statique, sélectionnable et éditable.

const NAV_LABELS = {
  Programme: 'Programme',
  Localisation: 'Lieu',
  'Plan de table': 'Ma place',
  Cadeaux: 'Cadeaux',
  Galerie: 'Galerie',
  "Livre d'or": "Livre d'or",
  Billetterie: 'Billets',
  Intervenants: 'Intervenants',
  FAQ: 'FAQ',
}

const EYEBROWS = {
  Invitation: 'Invitation',
  Histoire: 'Notre histoire',
  Programme: 'Le déroulé',
  Localisation: 'Où nous retrouver',
  Galerie: 'Souvenirs',
  "Livre d'or": 'Vos messages',
  RSVP: 'Votre réponse',
  Billetterie: 'Billets',
  FAQ: 'Questions',
  Intervenants: 'Avec nous',
  Vidéo: 'En images',
  'Plan de table': 'Plan de table',
  Familles: "L'alliance",
  'Dress code': 'Tenue',
  Cadeaux: 'Cadeaux',
  Partenaires: 'Ils nous accompagnent',
}

// Icône d'une activité du programme, devinée d'après son titre.
const PROGRAM_ICONS = [
  [/c[ée]r[ée]monie|mariage|union|dot|b[ée]n[ée]diction/i, Gem],
  [/cocktail|ap[ée]ro|accueil.*boisson|vin|champagne/i, Wine],
  [/d[îi]ner|repas|d[ée]jeuner|buffet|grillade|brunch/i, UtensilsCrossed],
  [/soir[ée]e|danse|bal|dj|concert|musique|dancefloor/i, Music],
  [/photo/i, Camera],
  [/g[âa]teau|anniversaire/i, Cake],
  [/accueil|arriv[ée]e|d[ée]l[ée]gation|famille/i, Users],
  [/cadeau|pr[ée]sent/i, Gift],
  [/amour|c[œo]ur/i, Heart],
]
const programIcon = (title) => PROGRAM_ICONS.find(([re]) => re.test(title ?? ''))?.[1] ?? Star

function prefersReducedMotion() {
  if (typeof window === 'undefined') return true
  return (
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.dataset.reducedMotion === 'true'
  )
}

// Invitation personnalisée : https://…/e/slug#Fatou
function guestFromHash() {
  try {
    const h = decodeURIComponent(window.location.hash.slice(1))
    if (/^[\p{L}0-9._~-]{2,40}$/u.test(h) && !h.startsWith('site-block')) return h.replace(/[_.~-]+/g, ' ')
  } catch {
    // Ancre mal encodée : pas de personnalisation.
  }
  return ''
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')
}

function formatPrice(priceCents) {
  return priceCents === 0 ? 'Gratuit' : `${(priceCents / 100).toLocaleString('fr-FR')} FCFA`
}

function useFonts(theme) {
  useEffect(() => loadThemeFonts(theme), [theme])
}

function computeRemaining(target) {
  const s = Math.floor((target - Date.now()) / 1000)
  if (s <= 0) return null
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60]
}

function Countdown({ target, label }) {
  const [parts, setParts] = useState(() => computeRemaining(target))
  useEffect(() => {
    const id = setInterval(() => setParts(computeRemaining(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  return (
    <div className="countdown">
      <div className="label">{label || 'Le grand jour dans'}</div>
      {parts ? (
        <div className="cd">
          {['Jours', 'Heures', 'Minutes', 'Secondes'].map((label, i) => (
            <div key={label}>
              <div className="num">
                <span key={parts[i]}>{String(parts[i]).padStart(2, '0')}</span>
              </div>
              <small>{label}</small>
            </div>
          ))}
        </div>
      ) : (
        <p className="cd-done">Merci d'avoir célébré avec nous</p>
      )}
    </div>
  )
}

function SectionHead({ eyebrow, title, ornament }) {
  return (
    <div className="s-head rv">
      {eyebrow && <p className="kicker">{eyebrow}</p>}
      {title && <h2>{title}</h2>}
      <div className="orn" dangerouslySetInnerHTML={{ __html: ornament }} />
    </div>
  )
}

function Lightbox({ photos, index, onClose, onMove }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onMove(-1)
      if (e.key === 'ArrowRight') onMove(1)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, onMove])

  const photo = photos[index]
  const touch = useRef(0)
  return createPortal(
    <div
      className="tbft-lb"
      role="dialog"
      aria-modal="true"
      aria-label="Visionneuse de photos"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => {
        touch.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 50) onMove(dx < 0 ? 1 : -1)
      }}
    >
      <button type="button" aria-label="Photo précédente" onClick={() => onMove(-1)}>
        <ChevronLeft />
      </button>
      <figure>
        <img src={mediaUrl(photo.url)} alt={photo.caption ?? ''} />
      </figure>
      <button type="button" aria-label="Photo suivante" onClick={() => onMove(1)}>
        <ChevronRight />
      </button>
      <button type="button" className="close" aria-label="Fermer" onClick={onClose}>
        <X />
      </button>
      <span className="count">
        {index + 1} / {photos.length}
      </span>
    </div>,
    document.body,
  )
}

// Livre d'or : public -> envoi en modération ; Builder -> message de l'organisateur publié.
function GuestBookBox({ slug, onSubmitOverride }) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!name.trim() || !message.trim()) return
    setState('sending')
    setError('')
    try {
      const dto = { authorName: name.trim(), message: message.trim() }
      await (onSubmitOverride ? onSubmitOverride(dto) : signPublicGuestBook(slug, dto))
      setName('')
      setMessage('')
      setState('sent')
    } catch (err) {
      setError(err.status === 429 ? 'Trop de messages envoyés. Réessayez dans une minute.' : err.message || "L'envoi a échoué.")
      setState('idle')
    }
  }

  return (
    <div className="rv" onClick={(e) => e.stopPropagation()}>
      <form className="gb-form" onSubmit={submit}>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={150} placeholder="Votre prénom" aria-label="Votre prénom" required />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} rows={1} placeholder="Votre message" aria-label="Votre message" required />
        <button className="btn" type="submit" disabled={state === 'sending'}>
          <Heart />
          {state === 'sending' ? 'Envoi…' : 'Publier'}
        </button>
      </form>
      {state === 'sent' && (
        <p className="form-note muted">
          {onSubmitOverride ? 'Message publié dans votre livre d’or.' : "Merci ! Votre message apparaîtra après validation par l'organisateur."}
        </p>
      )}
      {error && <p className="form-note err">{error}</p>}
    </div>
  )
}

// Fenêtre « Mon pass » : le billet de l'invité par-dessus la page.
function PassModal({ onClose, children }) {
  const close = useRef(null)
  useEffect(() => {
    const prev = document.activeElement
    close.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      prev?.focus?.()
    }
  }, [onClose])
  return (
    <div className="tbft-passmodal" role="dialog" aria-modal="true" aria-label="Mon pass d'entrée" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div>
        {children}
        <p>Imprimez-le, ou gardez-le en image : il sera scanné à l'entrée.</p>
        <button ref={close} type="button" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  )
}

export default function ThemedSitePage({
  template,
  heroStyle,
  blocks,
  blockContent,
  data,
  editor = null,
  fullPage = false,
  startOpen = false,
  className = '',
}) {
  const theme = getSiteTheme(template?.theme)
  const editable = Boolean(editor)
  const embedded = !fullPage
  const [reduced] = useState(prefersReducedMotion)
  const motion = fullPage && !reduced
  const palette = themePalette(theme, heroStyle.palette)
  const motif = themeMotif(theme, heroStyle.motif)
  const [hashGuest] = useState(() => (fullPage ? guestFromHash() : ''))
  const guestFull = data.invitation?.guestFullName?.trim() || hashGuest
  const guest = guestFull.split(' ')[0]

  // Ouverture : 'closed' -> 'opening' -> 'gone'. Dans le Builder et l'aperçu de l'assistant,
  // la page est déjà ouverte.
  const [intro, setIntro] = useState(embedded || startOpen ? 'gone' : 'closed')
  const opened = intro === 'gone'
  const [musicOn, setMusicOn] = useState(false)
  const [withMusic, setWithMusic] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const [passOpen, setPassOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(null)

  const rootRef = useRef(null)
  const particlesRef = useRef(null)
  const fxRef = useRef(null)
  const coverRef = useRef(null)
  const motifRef = useRef(null)
  const musicRef = useRef(null)

  useFonts(theme)

  const titleInfo = parseTitle(heroStyle.title, theme.hero, theme.joiner)
  const monogram = monogramOf(titleInfo)
  // Habillage du billet de l'invité : celui de la page (surtitre, noms, palette, motif).
  const passTicket = {
    kicker: heroStyle.kicker || theme.kicker,
    pre: titleInfo.pre || theme.ticketPre,
    names: titleInfo.names,
    monogram,
    brand: `${theme.name} · ${palette.label}`,
    look: { theme, palette, motif },
  }
  // « Mon pass » : l'invité qui a confirmé retrouve son billet depuis la barre du haut.
  const hasPass = !editable && Boolean(data.invitation?.rsvpConfirmed)
  // Organisateur : « Organisé par … » sous le héros, et son logo à la place du monogramme
  // (barre du haut, sceau d'ouverture). Le logo n'est fourni qu'aux offres qui l'incluent.
  const organizerName = data.organizer?.name?.trim() || ''
  const logoSrc = data.organizer?.logoSrc || mediaUrl(data.organizer?.logoUrl)
  const mark = logoSrc ? <img className="org-mark" src={logoSrc} alt="" /> : monogram
  // Illustration du modèle (utils/illus.js), aux couleurs de la palette : à côté de
  // l'invitation et dans la galerie tant qu'elle n'a pas de photos.
  const art = invitationFor(theme.id)
  const artSvg = useMemo(() => (art ? ILLUS.svg(art.illus) : ''), [art])
  const artTiles = useMemo(() => (art ? Array.from({ length: 6 }, (_, i) => ILLUS.tile(art.illus, i)) : []), [art])
  const coverPath = safeCoverPath(data.coverPath)
  const start = data.eventDateTime ? new Date(data.eventDateTime) : null
  const validStart = start && !Number.isNaN(start.getTime()) ? start : null
  // Grand mot du héros « big » : l'âge (« 30 ans ») ou, à défaut, celui du modèle
  // (LIVE, la date de la soirée, EXPO…).
  const heroBig = titleInfo.big
    ? { big: titleInfo.big, label: 'ans' }
    : theme.hero === 'big'
      ? (theme.bigFor?.(validStart) ?? null)
      : null
  const dateLong = validStart
    ? capitalize(validStart.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
    : ''
  const timeLabel = validStart ? formatTime(data.eventDateTime) : ''
  const has = (block) => blocks.includes(block)

  // ---------- Effets du site public ----------
  // Défilement bloqué tant que l'ouverture est affichée.
  useEffect(() => {
    if (embedded || opened) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [embedded, opened])

  // Particules de fond, après l'ouverture.
  useEffect(() => {
    if (embedded || !opened || reduced || !theme.particles || !particlesRef.current) return
    const particles = createParticles(particlesRef.current, theme.particles)
    particles.setColors(palette.particleColors)
    particles.start()
    return () => particles.destroy()
  }, [embedded, opened, reduced, theme.particles, palette])

  // Musique (créée à la demande, coupée en quittant la page).
  useEffect(() => () => musicRef.current?.destroy(), [])
  const music = () => {
    if (!musicRef.current) musicRef.current = createMusic(theme.music, setMusicOn)
    return musicRef.current
  }

  // Apparition au défilement + section active.
  useEffect(() => {
    const root = rootRef.current
    if (!root || !motion || !opened) return
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in')
            io.unobserve(en.target)
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    root.querySelectorAll('.rv:not(.in)').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [motion, opened, blocks, data])

  useEffect(() => {
    const root = rootRef.current
    if (!root || embedded) return
    const so = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) setActiveSection(en.target.dataset.block)
        }),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    root.querySelectorAll('[data-block]').forEach((el) => so.observe(el))
    return () => so.disconnect()
  }, [embedded, blocks])

  // Parallaxe douce de la couverture et du motif.
  useEffect(() => {
    if (!motion || !opened) return
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const y = window.scrollY
        if (coverRef.current) coverRef.current.style.transform = `translate3d(0,${y * 0.25}px,0) scale(1.08)`
        if (motifRef.current) motifRef.current.style.translate = `0 ${-y * 0.06}px`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [motion, opened])

  const openIntro = (e) => {
    if (intro !== 'closed') return
    const duration = motion
      ? { envelope: 1700, curtain: 1250, gift: 900, bloom: 1150, iris: 1300, ticket: 1100, candle: 1800, badge: 1100 }[theme.intro]
      : 0
    setIntro('opening')
    if (withMusic && theme.music) music().play()
    if (theme.intro === 'gift' && motion && fxRef.current) {
      const r = e.currentTarget.getBoundingClientRect()
      burst(fxRef.current, r.left + r.width / 2, r.top + r.height / 3, 'confetti', palette.particleColors)
    }
    setTimeout(() => setIntro('gone'), duration)
  }

  const celebrate = (el) => {
    if (!motion || !fxRef.current || !el) return
    const r = el.getBoundingClientRect()
    burst(fxRef.current, r.left + r.width / 2, r.top + 40, theme.burst, palette.particleColors)
  }

  const scrollTo = (block) => (e) => {
    e.preventDefault()
    document.getElementById(siteBlockDomId(block))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ---------- Édition (Builder) ----------
  const selectable = (block) =>
    editable
      ? {
          onClick: () => editor.onSelectBlock(block),
          className: `is-selectable ${editor.selectedBlock === block ? 'is-selected' : ''}`,
        }
      : { className: '' }
  const toolbar = (block, index) =>
    editable && editor.selectedBlock === block ? (
      <BlockToolbar block={block} index={index} count={blocks.length} editor={editor} />
    ) : null
  const placeholder = (text) => (editable ? <p className="ph-note">{text}</p> : null)

  // ---------- Sections ----------
  const sectionShell = (block, index, inner, extraClass = '') => (
    <section
      key={block}
      id={siteBlockDomId(block)}
      data-block={block}
      className={`section ${extraClass} ${selectable(block).className}`}
      onClick={selectable(block).onClick}
    >
      {toolbar(block, index)}
      <div className="container">{inner}</div>
    </section>
  )

  const headFor = (block, content) => (
    <SectionHead
      eyebrow={EYEBROWS[block]}
      title={content.showHeading === false && block !== 'RSVP' ? null : content.heading || EYEBROWS[block]}
      ornament={theme.ornament}
    />
  )

  const renderBlock = (block, index) => {
    const content = blockContent[block] ?? {}
    const body = (content.body ?? '').trim()

    switch (block) {
      case 'Rebours':
        // Le compte à rebours de ces modèles est intégré à l'en-tête.
        return editable
          ? sectionShell(block, index, placeholder('Le compte à rebours de ce modèle s’affiche dans l’en-tête, à côté du titre.'))
          : null

      case 'Invitation': {
        const paragraphs = invitationParagraphs(content.body)
        const greeting = invitationGreeting(content, guest)
        const signature = (content.signature ?? '').trim()
        if (!editable && !paragraphs.length && !greeting) return null
        return sectionShell(
          block,
          index,
          <div className={`invitation ${artSvg ? 'inv-grid' : 'narrow'}`}>
            {artSvg && (
              // SVG produit par utils/illus.js (dessins du modèle), sans aucune saisie.
              <figure className={`inv-art rv frame-${art.frame}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: artSvg }} />
            )}
            <div className="inv-text">
            {content.showHeading && headFor(block, content)}
            {greeting && <p className="greet rv">{greeting}</p>}
            {paragraphs.length ? (
              <div className="lead-text words rv" style={{ '--d': 1 }}>
                {invitationWords(paragraphs).map((words, i) => (
                  <p key={i}>
                    {words.map(({ word, index: w }) => (
                      <span key={w} style={{ '--w': w }}>
                        {word}{' '}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            ) : (
              placeholder('Écrivez le texte de votre invitation dans l’onglet Contenu, à droite.')
            )}
            {signature && (
              <p className="sig rv" style={{ '--d': 2 }}>
                {signature}
              </p>
            )}
            </div>
          </div>,
        )
      }

      case 'Histoire': {
        const imagePath = safeBlockImagePath(content.imageUrl)
        if (!editable && !body && !imagePath) return null
        const photo = editable ? (
          <label className="photo-pick rv" onClick={(e) => e.stopPropagation()}>
            {imagePath ? <img src={mediaUrl(imagePath)} alt="" /> : (
              <span style={{ display: 'grid', justifyItems: 'center', gap: '.4rem' }}>
                <ImagePlus />
                {editor.uploading ? 'Envoi en cours…' : 'Ajouter une photo'}
              </span>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={editor.uploading}
              onChange={(e) => {
                editor.onUploadBlockImage?.(block, e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </label>
        ) : imagePath ? (
          <img className="rv" src={mediaUrl(imagePath)} alt="" />
        ) : null
        return sectionShell(
          block,
          index,
          <>
            {headFor(block, content)}
            <div className={`story ${photo ? 'has-photo' : 'narrow'}`}>
              {body ? <div className="lead-text rv">{body}</div> : placeholder('Racontez votre histoire dans l’onglet Contenu, à droite.')}
              {photo}
            </div>
          </>,
        )
      }

      case 'Programme': {
        const items = data.programItems ?? []
        if (!items.length && !editable) return null
        return sectionShell(
          block,
          index,
          <>
            {headFor(block, content)}
            {items.length ? (
              <ol className="tl rv">
                {items.map((item, i) => {
                  const Icon = programIcon(item.title)
                  return (
                    <li key={item.id} className="rv" style={{ '--d': i }}>
                      <span className="dot">
                        <Icon />
                      </span>
                      <div>
                        {item.startTime && <time>{formatTime(item.startTime)}</time>}
                        <h3>{item.title}</h3>
                        {(item.location || item.description) && (
                          <p>{[item.location, item.description].filter(Boolean).join(' · ')}</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            ) : (
              placeholder('Aucune activité. Ajoutez-les dans Programme (tableau de bord).')
            )}
          </>,
        )
      }

      case 'Localisation': {
        const address = data.locationAddress || content.address
        const transport = (content.transport ?? '').trim()
        const additionalVenues = usableVenues(content.additionalVenues)
        if (!address && !additionalVenues.length && !transport && !body && !editable) return null
        if (!address && !additionalVenues.length && !transport && !body) {
          return sectionShell(block, index, <>{headFor(block, content)}{placeholder('Ajoutez l’adresse dans les informations de l’événement.')}</>)
        }
        const mapsUrl = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null
        return sectionShell(
          block,
          index,
          <>
            {headFor(block, content)}
            <div className="grid-2">
              <article className="card venue rv">
                <p className="kicker">{data.locationLabel && data.locationLabel !== 'Lieu principal' ? data.locationLabel : 'Le lieu'}</p>
                {address && <h3>{address}</h3>}
                {timeLabel && (
                  <span className="when">
                    <Clock />
                    {dateLong} · {timeLabel}
                  </span>
                )}
                {transport && <p>{transport}</p>}
                {body && <p>{body}</p>}
                {mapsUrl && (
                  <a className="btn ghost" href={mapsUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    <Navigation />
                    Voir l'itinéraire
                  </a>
                )}
              </article>
              {address && (
                <iframe
                  className="map rv"
                  style={{ '--d': 1, pointerEvents: editable ? 'none' : undefined }}
                  title={`Carte : ${address}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
              {additionalVenues.map((venue, venueIndex) => {
                const venueAddress = venue.address?.trim()
                const venueMapsUrl = venueAddress
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`
                  : null
                return (
                  <article key={venueIndex} className="card venue rv" style={{ '--d': venueIndex + 2 }}>
                    {venue.label?.trim() && <p className="kicker">{venue.label.trim()}</p>}
                    {venueAddress && <h3>{venueAddress}</h3>}
                    {venue.time?.trim() && <span className="when"><Clock />{venue.time.trim()}</span>}
                    {venueMapsUrl && (
                      <a className="btn ghost" href={venueMapsUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        <Navigation />
                        Voir l'itinéraire
                      </a>
                    )}
                  </article>
                )
              })}
            </div>
          </>,
        )
      }

      case 'Galerie': {
        const photos = data.galleryPhotos ?? []
        // Sans photo : vignettes illustrées du modèle (légendes de la démo, s'il y en a).
        const tiles = photos.length ? [] : artTiles
        if (!photos.length && !editable && !tiles.length) return null
        return sectionShell(
          block,
          index,
          <>
            {headFor(block, content)}
            <div className="gal rv">
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  aria-label={`Agrandir la photo ${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!editable) setLightboxIndex(i)
                  }}
                >
                  <img src={mediaUrl(photo.url)} alt={photo.caption ?? ''} loading="lazy" />
                </button>
              ))}
              {tiles.map((svg, i) => (
                <div key={i} className="ph art" aria-hidden="true">
                  <span className="art-svg" dangerouslySetInnerHTML={{ __html: svg }} />
                  {data.galleryLabels?.[i] && <span className="art-label">{data.galleryLabels[i]}</span>}
                </div>
              ))}
              {editable && (
                <label className="add" onClick={(e) => e.stopPropagation()}>
                  <ImagePlus />
                  {editor.uploading ? 'Envoi…' : 'Ajouter des photos'}
                  <input
                    type="file"
                    className="sr"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    disabled={editor.uploading}
                    onChange={(e) => {
                      editor.onUploadGalleryPhotos?.([...(e.target.files ?? [])])
                      e.target.value = ''
                    }}
                  />
                </label>
              )}
            </div>
            {!photos.length && !data.galleryLabels?.length && (
              <p className="form-note muted" style={{ textAlign: 'center' }}>
                <Images style={{ width: 16, height: 16, display: 'inline', verticalAlign: '-3px' }} />{' '}
                {editable
                  ? tiles.length
                    ? 'Ces illustrations attendent vos photos : elles disparaissent dès la première photo publiée.'
                    : "La galerie n'apparaîtra sur le site qu'avec au moins une photo."
                  : 'Les photos de l’événement apparaîtront ici.'}
              </p>
            )}
          </>,
        )
      }

      case "Livre d'or": {
        const entries = data.guestBookEntries ?? []
        return sectionShell(
          block,
          index,
          <>
            {headFor(block, content)}
            <div className="narrow" style={{ maxWidth: 'none' }}>
              <GuestBookBox slug={data.slug} onSubmitOverride={editable ? editor.onAddGuestBookEntry : data.submitGuestBook} />
              {entries.length > 0 ? (
                <div className="gb">
                  {entries.map((entry, i) => (
                    <article key={`${entry.authorName}-${i}`}>
                      <p>{entry.message}</p>
                      <b>{entry.authorName}</b>
                      {entry.reply && <p className="reply">{entry.reply}</p>}
                    </article>
                  ))}
                </div>
              ) : (
                placeholder('Les messages validés de vos invités apparaîtront ici.')
              )}
            </div>
          </>,
        )
      }

      case 'RSVP':
        return sectionShell(
          block,
          index,
          <div className="narrow">
            {headFor(block, { ...content, heading: content.heading || 'Serez-vous des nôtres ?' })}
            <RsvpModule
              themed
              editable={editable}
              invitation={data.invitation}
              invitationLoading={data.invitationLoading}
              invitationError={data.invitationError}
              onInvitationChange={data.onInvitationChange}
              submitOpenRsvp={data.submitOpenRsvp}
              body={body}
              eventTitle={heroStyle.title}
              sideLabel={content.sideLabel}
              sides={content.sides}
              rules={content}
              ticket={passTicket}
              onCelebrate={celebrate}
              submitRsvp={data.submitRsvp}
            />
          </div>,
        )

      case 'Familles': {
        const filled = [content.a, content.b].some((f) => f?.name?.trim())
        if (!filled && !editable) return null
        return sectionShell(
          block,
          index,
          <>
            {headFor(block, content)}
            {filled ? <FamiliesModule themed content={content} /> : placeholder('Présentez les deux familles dans l’onglet Contenu, à droite.')}
          </>,
        )
      }

      case 'Dress code': {
        const filled = content.title?.trim() || body || usableColors(content.colors).length
        if (!filled && !editable) return null
        return sectionShell(
          block,
          index,
          <>
            {headFor(block, content)}
            {filled ? <DressCodeModule themed content={content} /> : placeholder('Décrivez la tenue et ses couleurs dans l’onglet Contenu, à droite.')}
          </>,
        )
      }

      case 'Cadeaux': {
        const gifts = data.gifts ?? []
        return sectionShell(
          block,
          index,
          <>
            {headFor(block, content)}
            <GiftModule themed content={content} gifts={gifts} slug={data.slug} editable={editable} />
          </>,
        )
      }

      case 'Plan de table': {
        const tables = data.seatingTables ?? []
        if (!tables.length && !editable) return null
        return sectionShell(
          block,
          index,
          <>
            {headFor(block, { ...content, heading: content.heading || 'Trouver ma place' })}
            <SeatingModule themed tables={tables} slug={data.slug} editable={editable} findSeat={data.findSeat} />
          </>,
        )
      }

      case 'Billetterie': {
        const tickets = data.ticketTypes ?? []
        if (!tickets.length && !editable) return null
        return sectionShell(
          block,
          index,
          <>
            {headFor(block, content)}
            {tickets.length ? (
              <>
                <div className="tiers">
                  {tickets.map((t, i) => {
                    const left = t.quota > 0 ? Math.max(0, t.quota - (t.soldCount ?? 0)) : null
                    const soldOut = left === 0
                    return (
                      <article key={t.id} className={`tier card rv ${soldOut ? 'out' : ''}`} style={{ '--d': i }}>
                        <p className="kicker">{t.name}</p>
                        <p className="price">{formatPrice(t.priceCents)}</p>
                        {soldOut ? (
                          <p className="soldout">Complet</p>
                        ) : (
                          left !== null && (
                            <ul>
                              <li>
                                <Ticket />
                                <span>{left > 1 ? `${left} places disponibles` : 'Dernière place disponible'}</span>
                              </li>
                            </ul>
                          )
                        )}
                      </article>
                    )
                  })}
                </div>
                <p className="form-note muted" style={{ textAlign: 'center' }}>
                  Billets non vendus en ligne : contactez directement l'organisateur pour réserver.
                </p>
              </>
            ) : (
              placeholder('Aucun billet. Créez-les dans Billetterie (tableau de bord).')
            )}
          </>,
        )
      }

      case 'Intervenants': {
        const people = usablePeople(content.people)
        if (!people.length && !body && !editable) return null
        return sectionShell(
          block,
          index,
          <>
            {headFor(block, content)}
            {body && <p className="lead-text narrow rv" style={{ marginBottom: '2rem' }}>{body}</p>}
            {people.length ? <SpeakersModule themed people={people} /> : !body && placeholder('Ajoutez les intervenants dans l’onglet Contenu, à droite.')}
          </>,
        )
      }

      case 'Partenaires': {
        const partners = usablePartners(content.partners)
        if (!partners.length && !editable) return null
        return sectionShell(
          block,
          index,
          <>
            {headFor(block, content)}
            {body && <p className="lead-text narrow rv" style={{ marginBottom: '2rem' }}>{body}</p>}
            {partners.length ? <PartnersModule themed partners={partners} /> : placeholder('Ajoutez vos partenaires dans l’onglet Contenu, à droite.')}
          </>,
        )
      }

      case 'FAQ': {
        const items = (Array.isArray(content.items) ? content.items : []).filter((it) => it?.question?.trim())
        if (!items.length && !body && !editable) return null
        return sectionShell(
          block,
          index,
          <>
            {headFor(block, content)}
            {body && <p className="lead-text narrow rv">{body}</p>}
            {items.length ? (
              <div className="faq rv">
                {items.map((it, i) => (
                  <details key={i} open={i === 0} onClick={(e) => e.stopPropagation()}>
                    <summary>{it.question}</summary>
                    <p>{it.answer}</p>
                  </details>
                ))}
              </div>
            ) : (
              placeholder('Ajoutez vos questions dans l’onglet Contenu, à droite.')
            )}
          </>,
        )
      }

      case 'Pied de page':
        return (
          <footer
            key={block}
            id={siteBlockDomId(block)}
            data-block={block}
            className={`footer ${selectable(block).className}`}
            onClick={selectable(block).onClick}
          >
            {toolbar(block, index)}
            <div className="names">
              {titleInfo.names.length === 2 ? (
                <>
                  {titleInfo.names[0]}
                  <span className="amp" style={{ color: 'var(--accent)' }}> {titleInfo.joiner} </span>
                  {titleInfo.names[1]}
                </>
              ) : (
                heroStyle.title
              )}
            </div>
            {(dateLong || data.locationAddress) && (
              <p className="muted" style={{ margin: '.4rem 0 1.2rem' }}>
                {[dateLong, data.locationAddress].filter(Boolean).join(' · ')}
              </p>
            )}
            {body && <p className="muted">{body}</p>}
            {!editable && data.slug && (
              <a
                className="btn ghost"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://wa.me/?text=${encodeURIComponent(`${heroStyle.title}${dateLong ? ` · ${dateLong}` : ''}. Toutes les infos : ${eventShareUrl(data.slug)}`)}`}
              >
                <Share2 />
                Partager sur WhatsApp
              </a>
            )}
            <div className="links">
              {data.slug && <Link to={`/cadeaux/${data.slug}`}>Liste de cadeaux</Link>}
              <Link to="/confidentialite">Confidentialité</Link>
              <Link to="/mentions-legales">Mentions légales</Link>
            </div>
            {data.showBranding !== false && (
              <p className="made">
                Créé avec <b>TBF MOMENT</b> · Create. Connect. Celebrate.
              </p>
            )}
          </footer>
        )

      default:
        if (!body && !editable) return null
        return sectionShell(
          block,
          index,
          <>
            {headFor(block, content)}
            {body ? <p className="lead-text narrow rv">{body}</p> : placeholder('Ajoutez un texte dans l’onglet Contenu, à droite.')}
          </>,
        )
    }
  }

  const sections = blocks.map((block, i) => renderBlock(block, i))
  const navBlocks = blocks.filter((b) => NAV_LABELS[b] && sections[blocks.indexOf(b)] !== null)
  const rsvpVisible = has('RSVP')
  const ticketsVisible = navBlocks.includes('Billetterie')
  const calendarUrl = validStart
    ? (() => {
        const end = new Date(validStart.getTime() + 4 * 3600 * 1000)
        const g = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(heroStyle.title)}&dates=${g(validStart)}/${g(end)}${data.locationAddress ? `&location=${encodeURIComponent(data.locationAddress)}` : ''}`
      })()
    : null

  const motifCss = motifStyle(motif, palette)
  const rootStyle = {
    ...palette.vars,
    colorScheme: palette.dark ? 'dark' : 'light',
  }
  const heroSel = selectable('Hero')
  const forText = guest ? `Pour ${guest}` : theme.introFor
  const sealButton = (label, extra = {}) => (
    <button type="button" className="seal-btn" onClick={openIntro} aria-label="Ouvrir l'invitation" {...extra}>
      {label}
    </button>
  )
  const musicToggle = theme.music ? (
    <label className="intro-music">
      <input type="checkbox" checked={withMusic} onChange={(e) => setWithMusic(e.target.checked)} />
      <Music />
      Ouvrir avec la musique
    </label>
  ) : null

  return (
    <div
      ref={rootRef}
      data-tbft={theme.id}
      className={`tbft hv-${theme.hero} ${motion ? 'motion' : ''} ${opened ? 'is-open' : ''} ${embedded ? 'is-embedded' : ''} ${className}`}
      style={rootStyle}
    >
      <div className="bg-glow" aria-hidden="true" />
      <div className="bg-motif" ref={motifRef} aria-hidden="true" style={motifCss} />
      {!embedded && <canvas className="tbft-particles" ref={particlesRef} aria-hidden="true" />}
      {!embedded && <canvas className="tbft-fx" ref={fxRef} aria-hidden="true" />}

      <div className="tbft-c">
        <div className="topbar">
          <a className="mono" href={`#${siteBlockDomId('Hero')}`} onClick={scrollTo('Hero')} aria-label="Haut de page">
            {mark}
          </a>
          <nav className="topnav" aria-label="Sections">
            {navBlocks.map((b) => (
              <a key={b} href={`#${siteBlockDomId(b)}`} onClick={scrollTo(b)} className={activeSection === b ? 'on' : ''}>
                {NAV_LABELS[b]}
              </a>
            ))}
          </nav>
          {hasPass ? (
            <button type="button" className="btn sm top-cta" onClick={() => setPassOpen(true)}>
              <Ticket />
              Mon pass
            </button>
          ) : rsvpVisible && (
            <a className="btn sm top-cta" href={`#${siteBlockDomId('RSVP')}`} onClick={scrollTo('RSVP')}>
              <Check />
              Répondre
            </a>
          )}
        </div>

        <header
          id={siteBlockDomId('Hero')}
          data-block="Hero"
          className={`hero ${coverPath ? 'has-cover' : ''} ${heroSel.className}`}
          onClick={heroSel.onClick}
          onPointerMove={
            embedded
              ? undefined
              : (e) => {
                  const r = e.currentTarget.getBoundingClientRect()
                  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
                  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
                }
          }
        >
          {coverPath && (
            <div className="hero-cover" ref={coverRef} aria-hidden="true" style={{ backgroundImage: `url(${mediaUrl(coverPath)})` }} />
          )}
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-frame" aria-hidden="true" dangerouslySetInnerHTML={{ __html: theme.frame }} />
          {editable && editor.selectedBlock === 'Hero' && (
            <span style={{ position: 'absolute', top: 12, left: 12, zIndex: 5 }} className="rounded-full bg-[color:var(--color-brand-purple)] px-2.5 py-1 text-[11px] font-semibold text-white">
              Hero
            </span>
          )}
          <div className="hero-inner">
            <div className="hero-text">
              {theme.portrait && (
                <div className="portrait h-in" style={{ '--i': 0 }} aria-hidden="true">
                  <span>{monogram}</span>
                </div>
              )}
              <p className="kicker h-in" style={{ '--i': 0 }}>{heroStyle.kicker || theme.kicker}</p>
              {heroBig && (
                <div className="hero-big h-in" style={{ '--i': 1 }} aria-hidden="true">
                  {heroBig.big}
                  {heroBig.label && <small>{heroBig.label}</small>}
                </div>
              )}
              {titleInfo.pre && <p className="hero-pre h-in" style={{ '--i': 1 }}>{titleInfo.pre}</p>}
              <h1 className="hero-names ink" style={{ '--i': 2 }}>
                {titleInfo.names.length === 2 ? (
                  <>
                    {titleInfo.names[0]}
                    <span className="amp">{titleInfo.joiner}</span>
                    {titleInfo.names[1]}
                  </>
                ) : (
                  titleInfo.names[0]
                )}
              </h1>
              {data.description && <p className="hero-sub h-in" style={{ '--i': 3 }}>{data.description}</p>}
              {(dateLong || data.locationAddress) && (
                <div className="chips h-in" style={{ '--i': 4 }}>
                  {dateLong && (
                    <span className="chip">
                      <Calendar />
                      {dateLong}
                    </span>
                  )}
                  {timeLabel && (
                    <span className="chip">
                      <Clock />
                      {timeLabel}
                    </span>
                  )}
                  {data.locationAddress && (
                    <span className="chip">
                      <MapPin />
                      {data.locationAddress}
                    </span>
                  )}
                </div>
              )}
              {organizerName && (
                <p className="hero-org h-in" style={{ '--i': 4 }}>
                  Organisé par <b>{organizerName}</b>
                </p>
              )}
              <div className="ctas h-in" style={{ '--i': 5 }}>
                {ticketsVisible ? (
                  <a className="btn" href={`#${siteBlockDomId('Billetterie')}`} onClick={scrollTo('Billetterie')}>
                    <Ticket />
                    Réserver mes billets
                  </a>
                ) : rsvpVisible && (
                  <a className="btn" href={`#${siteBlockDomId('RSVP')}`} onClick={scrollTo('RSVP')}>
                    <Check />
                    {blockContent.RSVP?.cta?.trim() || 'Confirmer ma présence'}
                  </a>
                )}
                {calendarUrl && (
                  <a
                    className="btn ghost"
                    href={calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => editable && e.preventDefault()}
                  >
                    <Calendar />
                    Ajouter à mon agenda
                  </a>
                )}
              </div>
            </div>
            {has('Rebours') && validStart && (
              <div className="hero-side h-in" style={{ '--i': 6 }}>
                <Countdown target={validStart.getTime()} label={theme.countdownLabel} />
              </div>
            )}
          </div>
          {!embedded && <span className="scroll-hint" aria-hidden="true" />}
        </header>

        {sections}

        {!has('Pied de page') && data.showBranding !== false && (
          <footer className="footer">
            <p className="made">
              Créé avec <b>TBF MOMENT</b> · Create. Connect. Celebrate.
            </p>
          </footer>
        )}

        {editable && blocks.length === 0 && (
          <p className="ph-note" style={{ margin: '2rem 16px' }}>
            Cliquez un bloc à gauche pour l'ajouter à votre page.
          </p>
        )}
      </div>

      {/* Navigation mobile */}
      {!embedded && (
        <nav className="botnav" aria-label="Navigation rapide">
          {[
            ['Hero', 'Accueil', Home],
            ['Programme', 'Programme', List],
            ['Localisation', 'Lieu', MapPin],
            ['Galerie', 'Photos', Images],
            ['RSVP', 'Réponse', Check],
          ]
            .filter(([b]) => b === 'Hero' || navBlocks.includes(b) || (b === 'RSVP' && rsvpVisible))
            .map(([b, label, Icon]) => (
              <a key={b} href={`#${siteBlockDomId(b)}`} onClick={scrollTo(b)} className={activeSection === b ? 'on' : ''}>
                <Icon />
                <span>{label}</span>
              </a>
            ))}
        </nav>
      )}

      {/* Musique */}
      {passOpen && hasPass && createPortal(
        <PassModal onClose={() => setPassOpen(false)}>
          <GuestPass invitation={data.invitation} eventTitle={heroStyle.title} ticket={passTicket} onInvitationChange={data.onInvitationChange} watch={!data.submitRsvp} />
        </PassModal>,
        document.body,
      )}
      {!embedded && theme.music && opened && (
        <button
          type="button"
          className={`music-btn ${musicOn ? 'on' : ''}`}
          aria-pressed={musicOn}
          onClick={() => music().toggle()}
        >
          <span className="eq" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="sr">{musicOn ? 'Couper la musique' : 'Lancer la musique'}</span>
        </button>
      )}

      {/* Ouverture */}
      {!embedded && intro !== 'gone' && (
        <div
          className={`intro ${theme.intro === 'iris' ? 'iris' : ''} ${intro === 'opening' ? 'opening' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Ouverture de l'invitation"
          style={theme.intro === 'curtain' ? { background: 'transparent' } : undefined}
        >
          {theme.intro === 'curtain' ? (
            <>
              <div className="curtain" aria-hidden="true">
                <div className="panel l">
                  <div className="bg-motif" style={motifCss} />
                  <span className="trim" />
                </div>
                <div className="panel r">
                  <div className="bg-motif" style={motifCss} />
                  <span className="trim" />
                </div>
              </div>
              <div className="medal">
                <p className="intro-for">{forText}</p>
                {sealButton(mark, { autoFocus: true })}
                <p className="intro-hint">Touchez pour entrer</p>
                {musicToggle}
              </div>
            </>
          ) : (
            <>
              <div className="bg-motif" aria-hidden="true" style={motifCss} />
              <div className="env-wrap">
                {forText && theme.intro !== 'candle' && theme.intro !== 'badge' && <p className="intro-for">{forText}</p>}
                {theme.intro === 'ticket' && (
                  <div className="tk-intro">
                    <div className="tk-body">
                      <small>{theme.introLabel || 'Entrée'}</small>
                      <b>{heroStyle.title}</b>
                      {validStart && (
                        <span>
                          {capitalize(validStart.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }))} · {timeLabel}
                        </span>
                      )}
                    </div>
                    <button type="button" className="tk-stub" onClick={openIntro} aria-label="Détacher le billet pour entrer" autoFocus>
                      <span>Entrer</span>
                    </button>
                  </div>
                )}
                {theme.intro === 'candle' && (
                  <>
                    <div className="candle-wrap" aria-hidden="true">
                      <span className="halo" />
                      <span className="flame" />
                      <span className="wick" />
                      <span className="candle" />
                    </div>
                    <p className="who">{heroStyle.title}</p>
                    <button type="button" className="btn ghost" style={{ marginTop: '1.2rem' }} onClick={openIntro} autoFocus>
                      {theme.introButton || 'Entrer'}
                    </button>
                  </>
                )}
                {theme.intro === 'badge' && (
                  <div className="badge-wrap">
                    <span className="lanyard" aria-hidden="true" />
                    <button type="button" className="badge" onClick={openIntro} aria-label="Prendre son badge et entrer" autoFocus>
                      <span className="hole" aria-hidden="true" />
                      <small>{theme.introLabel || 'Participant'}</small>
                      <b>{guestFull || 'Votre nom ici'}</b>
                      <span className="org">{heroStyle.title}</span>
                      <span className="bar" aria-hidden="true" />
                    </button>
                  </div>
                )}
                {theme.intro === 'envelope' && (
                  <div className="env">
                    <div className="back" />
                    <div className="letter">{heroStyle.title}</div>
                    <div className="front" />
                    <div className="flap" />
                    <button type="button" className="seal" onClick={openIntro} aria-label="Ouvrir l'invitation" autoFocus>
                      {mark}
                    </button>
                  </div>
                )}
                {theme.intro === 'bloom' && (
                  <div className="bloom">
                    {Array.from({ length: 10 }, (_, k) => (
                      <span key={k} className="petal" style={{ '--k': k }} aria-hidden="true" />
                    ))}
                    {sealButton(mark, { autoFocus: true })}
                  </div>
                )}
                {theme.intro === 'iris' && (
                  <div className="iris-medal">
                    <svg viewBox="0 0 200 200" aria-hidden="true">
                      <circle cx="100" cy="100" r="96" />
                      <circle cx="100" cy="100" r="84" strokeDasharray="3 7" />
                      <path d="M100 4v18M100 178v18M4 100h18M178 100h18M32 32l13 13M155 155l13 13M168 32l-13 13M45 155l-13 13" />
                    </svg>
                    {sealButton(mark, { autoFocus: true })}
                  </div>
                )}
                {theme.intro === 'gift' && (
                  <>
                    <p className="who">{heroStyle.title}</p>
                    <div className="gift">
                      <button type="button" className="seal-btn" onClick={openIntro} aria-label="Ouvrir le cadeau" autoFocus>
                        <span className="box">
                          <span className="rib-v" />
                        </span>
                        <span className="lid">
                          <span className="rib-v" />
                          <span className="bow" />
                        </span>
                      </button>
                    </div>
                  </>
                )}
                {theme.intro !== 'candle' && (
                  <p className="intro-hint">
                    {{
                      envelope: 'Touchez le sceau pour ouvrir',
                      bloom: 'Touchez la fleur pour ouvrir',
                      gift: 'Touchez le cadeau',
                      ticket: 'Touchez le talon pour entrer',
                      badge: 'Touchez votre badge pour entrer',
                    }[theme.intro] ?? 'Touchez pour entrer'}
                  </p>
                )}
                {musicToggle}
              </div>
            </>
          )}
        </div>
      )}

      {lightboxIndex >= 0 && (data.galleryPhotos ?? [])[lightboxIndex] && (
        <Lightbox
          photos={data.galleryPhotos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
          onMove={(d) => setLightboxIndex((i) => (i + d + data.galleryPhotos.length) % data.galleryPhotos.length)}
        />
      )}
    </div>
  )
}
