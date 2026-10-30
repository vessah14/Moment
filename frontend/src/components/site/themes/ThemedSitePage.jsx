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
  Play,
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
import { tbfDigitalOrderUrl } from '../../../data/tbfDigital'
import { DressCodeModule, FamiliesModule, GiftModule, GuestPass, GuestPhotoUpload, HonoursModule, PartnersModule, RsvpModule, SeatingModule, SpeakersModule, VideoModule } from '../modules/SiteModules'
import { parseVideoUrl } from '../../../utils/videoEmbed'
import { usableColors } from '../../../utils/mobileMoney'
import { usableHonours, usablePartners, usablePeople, usableVenues } from '../../../utils/blockLists'
import { burst, createMusic, createParticles } from './effects'
import { motifStyle } from './motifs'
import { loadThemeFonts } from './themeFonts'
import { getSiteTheme, themeMotif, themePalette } from './themeDefs'
import { customMonogram, monogramOf, parseTitle } from './titleParts'
import { invitationGreeting, invitationParagraphs, invitationWords } from '../../../utils/invitationText'
import { ILLUS } from '../../../utils/illus'
import { invitationFor } from '../../../data/invitations'
import { googleCalendarUrl, handleAddToCalendar } from '../../../utils/calendar'
import { usableSides } from '../../../data/rsvpSides'
import { createGuestTicketQr } from '../../../utils/ticketQr'
import Sceau, { BandeGuillochee } from './envol/Sceau'
import { identity, makeTranslator } from './envol/envolI18n'
import { isSameDayInTimeZone, parseDateTimeInTimeZone, timeZoneYear } from '../../../utils/minuitTime'
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
  Distinctions: 'Distinctions',
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
  Distinctions: 'À l’honneur',
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

function formatTime(iso, locale = 'fr-FR', timeZone) {
  if (!iso) return ''
  const d = timeZone ? parseDateTimeInTimeZone(iso, timeZone) : new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const formatted = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', ...(timeZone && { timeZone }) })
  return locale === 'fr-FR' ? formatted.replace(':', 'h') : formatted
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

const isSameDay = (target, timeZone) =>
  timeZone
    ? isSameDayInTimeZone(target, new Date(), timeZone)
    : new Date(target).toDateString() === new Date().toDateString()

const COUNTDOWN_UNITS = ['Jours', 'Heures', 'Minutes', 'Secondes']

function Countdown({
  target,
  label,
  todayLabel,
  final = false,
  done = null,
  onReach,
  units = 4,
  t = identity,
  timeZone,
  wishes: rawWishes = [],
  wishYear,
}) {
  const [parts, setParts] = useState(() => computeRemaining(target))
  const [today, setToday] = useState(() => isSameDay(target, timeZone))
  const [wishIndex, setWishIndex] = useState(0)
  const wishes = Array.isArray(rawWishes) ? rawWishes.filter((wish) => wish?.message?.trim()) : []
  const onReachRef = useRef(onReach)
  useEffect(() => {
    onReachRef.current = onReach
  }, [onReach])
  useEffect(() => {
    let running = computeRemaining(target) !== null
    const id = setInterval(() => {
      const next = computeRemaining(target)
      // Passage à zéro pendant que l'invité regarde la page (et pas à l'ouverture).
      if (running && !next) onReachRef.current?.()
      running = next !== null
      setParts(next)
      setToday(isSameDay(target, timeZone))
    }, 1000)
    return () => clearInterval(id)
  }, [target, timeZone])

  useEffect(() => {
    if (!done || wishes.length < 2) return undefined
    const id = setInterval(() => setWishIndex((index) => (index + 1) % wishes.length), 3500)
    return () => clearInterval(id)
  }, [done, wishes.length])

  const lastMinute = final && parts && parts[0] === 0 && parts[1] === 0 && parts[2] === 0
  const wish = wishes.length ? wishes[wishIndex % wishes.length] : null

  return (
    <div className={`countdown${lastMinute ? ' cd-final' : ''}${!parts && done ? ' cd-reached' : ''}`}>
      {!(lastMinute || (!parts && done)) && <div className="label">{t((today && todayLabel) || label || 'Le grand jour dans')}</div>}
      {lastMinute ? (
        <div className="cd-last" aria-live="polite">
          <small>{t('Plus que')}</small>
          <span key={parts[3]}>{parts[3]}</span>
          <small>{t(parts[3] > 1 ? 'secondes' : 'seconde')}</small>
        </div>
      ) : !parts && done ? (
        <div className="cd-new">
          <small>{done.kicker}</small>
          <strong>{done.title}</strong>
          {done.sub && <em>{done.sub}</em>}
          {wish && (
            <blockquote key={`${wish.authorName}-${wishIndex}`} className="cd-wish" aria-live="polite">
              <p>“{wish.message}”</p>
              <cite>{wish.authorName}</cite>
            </blockquote>
          )}
          <a className="cd-wish-link" href={`#${siteBlockDomId("Livre d'or")}`}>
            {t('Laisser un vœu pour')} {wishYear}
          </a>
        </div>
      ) : parts ? (
        <div className="cd">
          {COUNTDOWN_UNITS.slice(0, units).map((label, i) => (
            <div key={label}>
              <div className="num">
                <span key={parts[i]}>{String(parts[i]).padStart(2, '0')}</span>
              </div>
              <small>{t(label.toLowerCase())}</small>
            </div>
          ))}
        </div>
      ) : (
        <p className="cd-done">{t("Merci d'avoir célébré avec nous")}</p>
      )}
    </div>
  )
}

function MinuitBand() {
  return (
    <div className="minuit-ndop" aria-hidden="true">
      <span>◇ ◆ ◇ ◆ ◇ ◆ ◇ ◆ ◇</span>
    </div>
  )
}

// QR d'entrée de l'invité (même contenu que son pass : l'identifiant d'invité).
function GuestQr({ guestId }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    let cancelled = false
    createGuestTicketQr(guestId)
      .then((url) => !cancelled && setSrc(url))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [guestId])
  return src ? <img className="inv-qr" src={src} alt="QR code d’entrée" /> : <span className="inv-qr" />
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
// Mur des vœux (Envol) : services = choix du formulaire de réponse, en boutons à toucher.
function GuestBookBox({ slug, onSubmitOverride, labels = {}, services = [], serviceLabel = '', t = identity }) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [service, setService] = useState('')
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!name.trim() || !message.trim()) return
    setState('sending')
    setError('')
    try {
      const dto = { authorName: name.trim(), message: message.trim(), ...(service && { service }) }
      await (onSubmitOverride ? onSubmitOverride(dto) : signPublicGuestBook(slug, dto))
      setName('')
      setMessage('')
      setService('')
      setState('sent')
    } catch (err) {
      setError(err.status === 429 ? t('Trop de messages envoyés. Réessayez dans une minute.') : err.message || t("L'envoi a échoué."))
      setState('idle')
    }
  }

  return (
    <div className="rv" onClick={(e) => e.stopPropagation()}>
      <form className={`gb-form ${services.length ? 'gb-services' : ''}`} onSubmit={submit}>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={150} placeholder={t('Votre prénom')} aria-label={t('Votre prénom')} required />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} rows={1} placeholder={t(labels.placeholder ?? 'Votre message')} aria-label={t('Votre message')} required />
        {services.length > 0 && (
          <div className="field gb-service">
            <span>{t(serviceLabel || 'Votre service')}</span>
            <div className="pills" role="group" aria-label={t(serviceLabel || 'Votre service')}>
              {services.map((s) => (
                <button key={s} type="button" className="pill" aria-pressed={service === s} onClick={() => setService(service === s ? '' : s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <button className="btn" type="submit" disabled={state === 'sending'}>
          <Heart />
          {state === 'sending' ? t('Envoi…') : t(labels.button ?? 'Publier')}
        </button>
      </form>
      {state === 'sent' && (
        <p className="form-note muted" role="status">
          {onSubmitOverride ? 'Message publié dans votre livre d’or.' : t("Merci ! Votre message apparaîtra après validation par l'organisateur.")}
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
  // Musique de l'événement (utils/eventMusic.js) ; sans réglage, celle du modèle.
  const musicStyle = heroStyle.musicStyle !== undefined ? heroStyle.musicStyle : theme.music
  const [hashGuest] = useState(() => (fullPage ? guestFromHash() : ''))
  // Bouton FR | EN (modèles qui ont une traduction) : textes du modèle traduits, ceux de
  // l'organisateur laissés tels quels.
  const [lang, setLang] = useState('fr')
  const t = useMemo(() => makeTranslator(theme.translations, lang), [theme.translations, lang])
  const hasLanguageToggle = Boolean(theme.translations)
  const languageToggle = hasLanguageToggle ? (
    <div className="lang" role="group" aria-label={t('Langue')}>
      {['fr', 'en'].map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          onClick={(e) => {
            e.stopPropagation()
            setLang(l)
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  ) : null
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
  const monogram = customMonogram(heroStyle.monogram) || monogramOf(titleInfo)
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
  // Logo propre à l'événement (Builder) prioritaire sur celui de l'organisateur.
  const logoSrc =
    mediaUrl(safeBlockImagePath(heroStyle.logoUrl)) ||
    data.organizer?.logoSrc ||
    mediaUrl(data.organizer?.logoUrl)
  const mark = logoSrc ? <img className="org-mark" src={logoSrc} alt="" /> : monogram
  // Illustration du modèle (utils/illus.js), aux couleurs de la palette : à côté de
  // l'invitation et dans la galerie tant qu'elle n'a pas de photos.
  const art = invitationFor(theme.id)
  const artSvg = useMemo(() => (art ? ILLUS.svg(art.illus) : ''), [art])
  const artTiles = useMemo(() => (art ? Array.from({ length: 6 }, (_, i) => ILLUS.tile(art.illus, i)) : []), [art])
  const coverPath = safeCoverPath(data.coverPath)
  const start = data.eventDateTime
    ? theme.eventTimeZone
      ? parseDateTimeInTimeZone(data.eventDateTime, theme.eventTimeZone)
      : new Date(data.eventDateTime)
    : null
  const validStart = start && !Number.isNaN(start.getTime()) ? start : null
  // Grand mot du héros « big » : l'âge (« 30 ans ») ou, à défaut, celui du modèle
  // (LIVE, la date de la soirée, EXPO…).
  const heroBig = titleInfo.big
    ? { big: titleInfo.big, label: 'ans' }
    : theme.hero === 'big'
      ? (theme.bigFor?.(validStart) ?? null)
      : null
  const dateLong = validStart
      ? capitalize(validStart.toLocaleDateString(t.locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          ...(theme.eventTimeZone && { timeZone: theme.eventTimeZone }),
        }))
      : ''
  const timeLabel = validStart ? formatTime(data.eventDateTime, t.locale, theme.eventTimeZone) : ''
  // Année dorée de l'en-tête officiel (Envol), sauf si le surtitre la donne déjà.
  const eventYear = validStart ? (theme.eventTimeZone ? timeZoneYear(validStart, theme.eventTimeZone) : validStart.getFullYear()) : null
  const heroYear = theme.heroSeal && validStart && !String(heroStyle.kicker ?? '').includes(String(eventYear))
    ? String(eventYear)
    : ''
  const has = (block) => blocks.includes(block)
  // Moment visé par le compte à rebours : le début, ou celui du modèle (minuit pour Minuit).
  const overrideTarget = data.countdownTarget == null ? null : new Date(data.countdownTarget)
  const countdownTarget =
    (overrideTarget && !Number.isNaN(overrideTarget.getTime()) && overrideTarget) ||
    (validStart && theme.countdownTo?.(validStart, blockContent.Rebours)) ||
    validStart
  const countdownDone = data.countdownDemo && theme.id === 'minuit'
    ? {
        kicker: t('Il est minuit'),
        title: `${t('Bonne année')} ${heroBig?.big ?? ''} !`,
        sub: t('Happy New Year!'),
      }
    : theme.countdownDone?.(countdownTarget, t) ?? null

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
    if (!musicRef.current) musicRef.current = createMusic(musicStyle, setMusicOn)
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
    if (withMusic && musicStyle) music().play()
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

  // Fin du compte à rebours pendant la visite (Minuit) : trois salves de confettis.
  const celebrateCountdown = () => {
    if (!motion || !fxRef.current || theme.burst === 'none') return
    const W = window.innerWidth
    const H = window.innerHeight
    ;[[0.5, 0.35, 0], [0.22, 0.45, 450], [0.78, 0.4, 900]].forEach(([x, y, delay]) =>
      setTimeout(() => fxRef.current && burst(fxRef.current, W * x, H * y, 'confetti', palette.particleColors), delay),
    )
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
      eyebrow={t(EYEBROWS[block])}
      title={content.showHeading === false && block !== 'RSVP' ? null : t(content.heading || EYEBROWS[block])}
      ornament={theme.ornament}
    />
  )

  // Carton d'invitation (Envol) : double filet or, texte officiel, nom de l'invité et son
  // QR d'entrée quand la page est ouverte depuis son lien personnel.
  const renderInvitationCard = (block, index, content) => {
    const paragraphs = invitationParagraphs(content.body)
    const signature = (content.signature ?? '').trim()
    if (!editable && !paragraphs.length) return null
    const guestId = data.invitation?.guestId
    return sectionShell(
      block,
      index,
      <div className="inv-card rv">
        <div className="inv-card-in">
          <p className="kicker">{t('Invitation')}</p>
          {paragraphs.length
            ? paragraphs.map((p, i) => (
                <p key={i} className={i === 0 ? 'inv-card-text' : 'muted'}>
                  {p}
                </p>
              ))
            : placeholder('Écrivez le texte officiel de votre invitation dans l’onglet Contenu, à droite.')}
          <div className="orn" aria-hidden="true" dangerouslySetInnerHTML={{ __html: theme.ornament }} />
          {(guestFull || editable) && (
            <div>
              <p className="muted inv-card-for">{t('Invitation personnelle')}</p>
              <p className="inv-card-name">{guestFull || 'Nom de l’invité'}</p>
            </div>
          )}
          {guestId ? <GuestQr guestId={guestId} /> : editable && <span className="inv-qr ph-qr">QR</span>}
          {(guestId || editable) && <p className="muted inv-card-qr">{t('QR code d’entrée, à présenter à l’accueil')}</p>}
          {signature && <p className="sig">{signature}</p>}
        </div>
      </div>,
      'inv-card-section',
    )
  }

  const renderBlock = (block, index) => {
    const content = blockContent[block] ?? {}
    const body = t((content.body ?? '').trim())

    switch (block) {
      case 'Rebours':
        // Le compte à rebours de ces modèles est intégré à l'en-tête.
        return editable
          ? sectionShell(block, index, placeholder('Le compte à rebours de ce modèle s’affiche dans l’en-tête, à côté du titre.'))
          : null

      case 'Invitation': {
        if (theme.invitationCard) return renderInvitationCard(block, index, content)
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
        const hostMessage = theme.id === 'minuit' ? body || t('Nous avons hâte de fêter la nouvelle année avec vous.') : body
        if (!editable && !hostMessage && !imagePath && theme.id !== 'minuit') return null
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
          <img className={`rv ${theme.id === 'minuit' ? 'minuit-host-photo' : ''}`} src={mediaUrl(imagePath)} alt="" />
        ) : theme.id === 'minuit' ? (
          <div className="minuit-host-placeholder rv" aria-hidden="true">
            <span>{(organizerName || heroStyle.title).split(/\s+/).map((part) => part[0]).slice(0, 2).join('')}</span>
          </div>
        ) : null
        return sectionShell(
          block,
          index,
          <>
            {theme.id === 'minuit' && <MinuitBand />}
            {headFor(block, content)}
            <div className={`story ${theme.id === 'minuit' ? 'minuit-host' : ''} ${photo ? 'has-photo' : 'narrow'}`}>
              {hostMessage ? <div className="lead-text rv">{hostMessage}</div> : placeholder('Racontez votre histoire dans l’onglet Contenu, à droite.')}
              {photo}
              {theme.id === 'minuit' && <p className="minuit-host-signature rv">— {organizerName || heroStyle.title}</p>}
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
                        {item.startTime && <time>{formatTime(item.startTime, t.locale, theme.eventTimeZone)}</time>}
                        <h3>{t(item.title)}</h3>
                        {(item.location || item.description) && (
                          <p>{[item.location, t(item.description)].filter(Boolean).join(' · ')}</p>
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
        // Album des invités : ouvert sauf si l'organisateur l'a fermé (guestUploads: false).
        const guestUploads = !editable && Boolean(data.slug) && content.guestUploads !== false
        if (!photos.length && !editable && !tiles.length && !guestUploads) return null
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
                  : t('Les photos de l’événement apparaîtront ici.')}
              </p>
            )}
            {guestUploads && <GuestPhotoUpload themed slug={data.slug} />}
            {theme.printOffer && (
              <p className="form-note muted print-offer rv" style={{ textAlign: 'center' }}>
                <a href={tbfDigitalOrderUrl(theme.printOffer.product, data.slug ? eventShareUrl(data.slug) : '')} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                  {t(theme.printOffer.label)}
                </a>
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
              {body && <p className="lead-text rv" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{body}</p>}
              <GuestBookBox
                slug={data.slug}
                onSubmitOverride={editable ? editor.onAddGuestBookEntry : data.submitGuestBook}
                labels={theme.guestbook}
                services={theme.guestbook?.services ? usableSides(blockContent.RSVP?.sides) : []}
                serviceLabel={blockContent.RSVP?.sideLabel}
                t={t}
              />
              {entries.length > 0 ? (
                <div className="gb">
                  {entries.map((entry, i) => (
                    <article key={`${entry.authorName}-${i}`}>
                      <p>{entry.message}</p>
                      <b>{entry.service ? `${entry.authorName} · ${entry.service}` : entry.authorName}</b>
                      {entry.reply && <p className="reply">{entry.reply}</p>}
                    </article>
                  ))}
                </div>
              ) : editable ? (
                placeholder('Les messages validés de vos invités apparaîtront ici.')
              ) : (
                theme.guestbook?.empty && <p className="form-note muted" style={{ textAlign: 'center' }}>{t(theme.guestbook.empty)}</p>
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
              practical={{
                calendar: validStart
                  ? { title: heroStyle.title, start: validStart, location: data.locationAddress, url: data.slug ? eventShareUrl(data.slug) : undefined, uid: data.slug }
                  : null,
                address: data.locationAddress,
              }}
              t={t}
              themed
              editable={editable}
              invitation={data.invitation}
              invitationLoading={data.invitationLoading}
              invitationError={data.invitationError}
              onInvitationChange={data.onInvitationChange}
              submitOpenRsvp={data.submitOpenRsvp}
              linkedAnswer={data.linkedAnswer}
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
            {filled ? <DressCodeModule themed content={{ ...content, title: t(content.title), body }} /> : placeholder('Décrivez la tenue et ses couleurs dans l’onglet Contenu, à droite.')}
          </>,
        )
      }

      case 'Vidéo': {
        const filled = Boolean(parseVideoUrl(content.url))
        // Direct annoncé (modèle Envol) : la section reste visible avant que le lien existe,
        // avec la date du direct et l'heure de début.
        const live = Boolean(theme.live && content.live)
        if (!filled && !editable && !live) return null
        return sectionShell(
          block,
          index,
          <>
            {live && validStart && (
              <p className="live-badge rv">
                <i aria-hidden="true" />
                {t(theme.live.badge)} {validStart.toLocaleDateString(t.locale, {
                  day: 'numeric',
                  month: 'long',
                  ...(theme.eventTimeZone && { timeZone: theme.eventTimeZone }),
                })}
              </p>
            )}
            {headFor(block, content)}
            {body && (filled || live) && <p className="lead-text narrow rv" style={{ marginBottom: '1.5rem' }}>{body}</p>}
            {filled ? (
              <VideoModule themed content={content} />
            ) : live ? (
              <div className="live-wait rv">
                <Play aria-hidden="true" />
                <span>
                  {t(theme.live.waiting)} {timeLabel}
                </span>
                {editable && <small>Collez le lien YouTube ou Facebook du direct dans l’onglet Contenu, à droite.</small>}
              </div>
            ) : (
              placeholder('Collez le lien YouTube ou Facebook de la vidéo ou du direct dans l’onglet Contenu, à droite.')
            )}
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

      case 'Distinctions': {
        const people = usableHonours(content.people)
        if (!people.length && !body && !editable) return null
        return sectionShell(
          block,
          index,
          <>
            {headFor(block, content)}
            {body && <p className="lead-text narrow rv" style={{ marginBottom: '2rem' }}>{body}</p>}
            {people.length ? <HonoursModule themed people={people} /> : !body && placeholder('Ajoutez les personnes honorées dans l’onglet Contenu, à droite.')}
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
            {theme.id === 'minuit' ? <MinuitBand /> : theme.footerBand && <BandeGuillochee />}
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
                {t('Partager sur WhatsApp')}
              </a>
            )}
            <div className="links">
              {data.slug && <Link to={`/cadeaux/${data.slug}`}>Liste de cadeaux</Link>}
              <Link to="/confidentialite">{t('Confidentialité')}</Link>
              <Link to="/mentions-legales">{t('Mentions légales')}</Link>
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
  const calendarDetails = validStart
    ? { title: heroStyle.title, start: validStart, location: data.locationAddress, url: data.slug ? eventShareUrl(data.slug) : undefined, uid: data.slug }
    : null
  const calendarUrl = calendarDetails ? googleCalendarUrl(calendarDetails) : null

  const motifCss = motifStyle(motif, palette)
  const rootStyle = {
    ...palette.vars,
    colorScheme: palette.dark ? 'dark' : 'light',
  }
  const fallingConfetti = motion && theme.id === 'minuit'
    ? Array.from({ length: 18 }, (_, i) => (
        <i
          key={i}
          className={`minuit-confetti c${i % 4}`}
          style={{
            '--x': `${(i * 37) % 100}%`,
            '--delay': `${-(i % 9) * 0.8}s`,
            '--duration': `${8 + (i % 6)}s`,
          }}
        />
      ))
    : null
  const heroSel = selectable('Hero')
  const forText = guest ? `Pour ${guest}` : t(theme.introFor)
  const sealButton = (label, extra = {}) => (
    <button type="button" className="seal-btn" onClick={openIntro} aria-label="Ouvrir l'invitation" {...extra}>
      {label}
    </button>
  )
  const musicToggle = musicStyle ? (
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
      lang={t.lang}
      className={`tbft hv-${theme.hero} ${motion ? 'motion' : ''} ${opened ? 'is-open' : ''} ${embedded ? 'is-embedded' : ''} ${className}`}
      style={rootStyle}
    >
      <div className="bg-glow" aria-hidden="true" />
      <div className="bg-motif" ref={motifRef} aria-hidden="true" style={motifCss} />
      {fallingConfetti && <div className="minuit-falling-confetti" aria-hidden="true">{fallingConfetti}</div>}
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
                {t(NAV_LABELS[b])}
              </a>
            ))}
          </nav>
          {theme.id === 'minuit' && languageToggle}
          {hasPass ? (
            <button type="button" className="btn sm top-cta" onClick={() => setPassOpen(true)}>
              <Ticket />
              {t('Mon pass')}
            </button>
          ) : rsvpVisible && (
            <a className="btn sm top-cta" href={`#${siteBlockDomId('RSVP')}`} onClick={scrollTo('RSVP')}>
              <Check />
              {t('Répondre')}
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
              {theme.heroSeal && (
                <div className="hero-top h-in" style={{ '--i': 0 }}>
                  <span className="kicker">{t(theme.introFor)}</span>
                  {languageToggle}
                </div>
              )}
              {theme.heroSeal && (
                <Sceau className="hero-seal h-in" style={{ '--i': 0 }} spin={motion}>
                  {logoSrc ? <img src={logoSrc} alt="" /> : <span className="hero-seal-mono">{monogram}</span>}
                </Sceau>
              )}
              {theme.portrait && (
                <div className="portrait h-in" style={{ '--i': 0 }} aria-hidden="true">
                  <span>{monogram}</span>
                </div>
              )}
              {theme.heroSeal ? (
                <p className="hero-orgname h-in" style={{ '--i': 1 }}>{heroStyle.title}</p>
              ) : (
                <p className="kicker h-in" style={{ '--i': 0 }}>{t(heroStyle.kicker || theme.kicker)}</p>
              )}
              {heroBig && (
                <div className="hero-big h-in" style={{ '--i': 1 }} aria-hidden="true">
                  {heroBig.big}
                  {heroBig.label && <small>{t(heroBig.label)}</small>}
                </div>
              )}
              {titleInfo.pre && <p className="hero-pre h-in" style={{ '--i': 1 }}>{titleInfo.pre}</p>}
              {theme.heroSeal ? (
                <>
                  <h1 className="hero-names ink" style={{ '--i': 2 }}>
                    {t(heroStyle.kicker || theme.kicker)}
                  </h1>
                  {heroYear && <p className="hero-year foil h-in" style={{ '--i': 3 }}>{heroYear}</p>}
                  <div className="orn h-in" style={{ '--i': 3 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: theme.ornament }} />
                </>
              ) : (
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
              )}
              {data.description && <p className="hero-sub h-in" style={{ '--i': 3 }}>{t(data.description)}</p>}
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
              {organizerName && !theme.heroSeal && (
                <p className="hero-org h-in" style={{ '--i': 4 }}>
                  {t('Organisé par')} <b>{organizerName}</b>
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
                    {theme.heroSeal ? t('Confirmer ma présence') : blockContent.RSVP?.cta?.trim() || 'Confirmer ma présence'}
                  </a>
                )}
                {calendarUrl && (
                  <a
                    className="btn ghost"
                    href={calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => (editable ? e.preventDefault() : handleAddToCalendar(e, calendarDetails))}
                  >
                    <Calendar />
                    {t('Ajouter à mon agenda')}
                  </a>
                )}
              </div>
            </div>
            {has('Rebours') && validStart && (
              <div className="hero-side h-in" style={{ '--i': 6 }}>
                <Countdown
                  target={countdownTarget.getTime()}
                  label={blockContent.Rebours?.label || blockContent.Rebours?.libelle || theme.countdownLabel}
                  todayLabel={blockContent.Rebours?.todayLabel || theme.countdownToday}
                  units={theme.countdownUnits}
                  t={t}
                  final={Boolean(theme.countdownFinal)}
                  done={countdownDone}
                  onReach={celebrateCountdown}
                  timeZone={theme.countdownTimeZone}
                  wishes={theme.id === 'minuit' ? data.guestBookEntries : []}
                  wishYear={heroBig?.big}
                />
              </div>
            )}
          </div>
          {!embedded && <span className="scroll-hint" aria-hidden="true" />}
        </header>

        {sections}

        {!has('Pied de page') && data.showBranding !== false && (
          <footer className="footer">
            {theme.id === 'minuit' ? <MinuitBand /> : theme.footerBand && <BandeGuillochee />}
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
                <span>{t(label)}</span>
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
      {!embedded && musicStyle && opened && (
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
                      <small>{t(theme.introLabel || 'Entrée')}</small>
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
                      <small>{t(theme.introLabel || 'Participant')}</small>
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
