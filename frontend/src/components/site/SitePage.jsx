import {
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  ImagePlus,
  Images,
  MapPin,
  Menu,
  Navigation,
  Quote,
  Ticket,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { eventShareUrl, mediaUrl } from '../../api/client'
import { googleCalendarUrl, handleAddToCalendar } from '../../utils/calendar'
import logoMark from '../../assets/logo-mark.png'
import {
  safeBlockImagePath,
  safeCoverPath,
  siteBlockDomId,
} from '../../utils/sitePage'
import { HEADING_FONT_STACKS, siteRootStyle } from '../../utils/templateTheme'
import GuestBookForm from '../minisite/GuestBookForm'
import BlockToolbar from './BlockToolbar'
import { DressCodeModule, FamiliesModule, GiftModule, PartnersModule, RsvpModule, SeatingModule, SpeakersModule, VideoModule } from './modules/SiteModules'
import { parseVideoUrl } from '../../utils/videoEmbed'
import { usablePartners, usablePeople, usableVenues } from '../../utils/blockLists'
import { usableColors } from '../../utils/mobileMoney'
import ThemedSitePage from './themes/ThemedSitePage'
import { invitationGreeting, invitationParagraphs } from '../../utils/invitationText'
import { getSiteTheme } from './themes/themeDefs'

// Rendu unique du site d'un événement : le Builder (mode édition / aperçu) et le
// mini-site public (/e/:slug) affichent exactement ce composant, avec les mêmes
// données réelles (programme, galerie, livre d'or, billets, lieu). En édition, un
// bloc vide montre un petit placeholder ; en public, il est simplement masqué.

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp'

// Petite mention au-dessus du titre de section, et libellé court dans la navigation.
const SECTION_META = {
  Invitation: { eyebrow: 'Invitation' },
  Rebours: { eyebrow: 'Bientôt' },
  Histoire: { eyebrow: 'À propos', nav: 'Histoire' },
  Programme: { eyebrow: 'Déroulé', nav: 'Programme' },
  Galerie: { eyebrow: 'Souvenirs', nav: 'Galerie' },
  Intervenants: { eyebrow: 'Avec nous', nav: 'Intervenants' },
  Localisation: { eyebrow: 'Accès', nav: 'Accès' },
  RSVP: { eyebrow: 'Votre réponse' },
  "Livre d'or": { eyebrow: 'Messages', nav: "Livre d'or" },
  Billetterie: { eyebrow: 'Billets', nav: 'Billets' },
  FAQ: { eyebrow: 'Questions', nav: 'FAQ' },
  Vidéo: { eyebrow: 'En images', nav: 'Vidéo' },
  'Plan de table': { eyebrow: 'Placement', nav: 'Ma place' },
  Familles: { eyebrow: "L'alliance" },
  'Dress code': { eyebrow: 'Tenue' },
  Cadeaux: { eyebrow: 'Cadeaux', nav: 'Cadeaux' },
  Partenaires: { eyebrow: 'Ils nous accompagnent' },
}

function computeRemaining(target) {
  const diff = Math.max(0, target - Date.now())
  return [
    ['Jours', Math.floor(diff / 86400000)],
    ['Heures', Math.floor((diff / 3600000) % 24)],
    ['Minutes', Math.floor((diff / 60000) % 60)],
    ['Secondes', Math.floor((diff / 1000) % 60)],
  ]
}

function scrollToBlock(block) {
  document
    .getElementById(siteBlockDomId(block))
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function initials(title) {
  const letters = (title ?? '')
    .split(/[\s&-]+/)
    .filter((word) => word.length > 2 || /^[A-ZÀ-Ý]/.test(word))
    .map((word) => word[0])
    .join('')
  return (letters || title?.[0] || '•').slice(0, 2).toUpperCase()
}

function Placeholder({ children }) {
  return (
    <p className="rounded-xl border border-dashed border-border px-4 py-5 text-center text-xs text-faint">
      {children}
    </p>
  )
}

// Mouvement réduit demandé (réglage système ou interrupteur TBF) : les transitions CSS
// sont déjà neutralisées dans index.css, mais les effets pilotés en JS (parallaxe)
// doivent aussi s'abstenir.
function prefersReducedMotion() {
  return (
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.dataset.reducedMotion === 'true'
  )
}

const REVEAL_HIDDEN = {
  up: 'translate-y-8 opacity-0',
  left: '-translate-x-10 opacity-0',
  right: 'translate-x-10 opacity-0',
  scale: 'scale-95 opacity-0',
  grow: 'scale-x-0',
}

// Fait apparaître un élément en douceur quand il entre à l'écran (site public).
// `delay` (ms) permet d'échelonner les éléments d'une même liste.
function Reveal({ enabled, children, variant = 'up', delay = 0, className = '' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(!enabled)

  useEffect(() => {
    if (!enabled || !ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [enabled])

  return (
    <div
      ref={ref}
      className={`transition duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
        shown ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : REVEAL_HIDDEN[variant]
      } ${className}`}
      style={enabled ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

function Countdown({ target, editable, fullPage, animate }) {
  const [parts, setParts] = useState(() => computeRemaining(target))

  useEffect(() => {
    const interval = setInterval(() => setParts(computeRemaining(target)), 1000)
    return () => clearInterval(interval)
  }, [target])

  if (parts.every(([, value]) => value === 0)) {
    return editable ? (
      <Placeholder>
        L'événement est passé : le compte à rebours est masqué sur le site.
      </Placeholder>
    ) : null
  }

  return (
    <div className={`mx-auto grid max-w-3xl grid-cols-4 ${fullPage ? 'gap-2 @xl:gap-6' : 'gap-3'}`}>
      {parts.map(([label, value], index) => (
        <Reveal key={label} enabled={animate} variant="scale" delay={index * 90}>
        <div
          className={`rounded-2xl border border-border-soft bg-bg text-center shadow-[0_12px_30px_-18px_rgba(0,0,0,0.35)] ${
            fullPage ? 'px-1 py-4 @xl:py-8' : 'py-3'
          }`}
        >
          <p
            className={`font-bold tabular-nums ${fullPage ? 'text-2xl @xl:text-5xl' : 'text-xl'}`}
            style={{
              fontFamily: 'var(--site-heading-font)',
              color: 'var(--color-brand-purple)',
            }}
          >
            {String(value).padStart(2, '0')}
          </p>
          <p
            className={`truncate font-semibold text-faint uppercase ${
              fullPage
                ? 'mt-1.5 text-[9px] tracking-wide @xl:mt-2 @xl:text-xs @xl:tracking-widest'
                : 'text-[10px] tracking-wider'
            }`}
          >
            {label}
          </p>
        </div>
        </Reveal>
      ))}
    </div>
  )
}

function PhotoPicker({ imageUrl, uploading, onPick }) {
  return (
    <label
      className="group relative flex aspect-4/3 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-surface-2"
      onClick={(e) => e.stopPropagation()}
    >
      {imageUrl ? (
        <>
          <img src={mediaUrl(imageUrl)} alt="" className="h-full w-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
            {uploading ? 'Envoi en cours…' : 'Changer la photo'}
          </span>
        </>
      ) : (
        <span className="flex flex-col items-center gap-2 text-xs text-faint">
          <ImagePlus className="h-6 w-6" />
          {uploading ? 'Envoi en cours…' : 'Ajouter une photo'}
        </span>
      )}
      <input
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        disabled={uploading}
        onChange={(e) => {
          onPick(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </label>
  )
}

// Photo encadrée d'un léger décalage de couleur d'accent.
function FramedImage({ src }) {
  return (
    <div className="relative">
      <div
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl opacity-25"
        style={{ backgroundColor: 'var(--color-brand-purple)' }}
      />
      <img
        src={src}
        alt=""
        className="relative aspect-4/3 w-full rounded-2xl object-cover shadow-lg"
      />
    </div>
  )
}

// Mosaïque de la galerie ; sur le site public, un clic agrandit la photo.
function GalleryGrid({ photos, editable, editor, fullPage, animate }) {
  const [openIndex, setOpenIndex] = useState(-1)
  const open = openIndex >= 0 ? photos[openIndex] : null

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenIndex(-1)
      if (e.key === 'ArrowRight') setOpenIndex((i) => (i + 1) % photos.length)
      if (e.key === 'ArrowLeft') setOpenIndex((i) => (i - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, photos.length])

  return (
    <div>
      <div
        className={`grid grid-cols-2 gap-3 @xl:grid-cols-4 ${
          fullPage ? 'auto-rows-[8rem] gap-2 @xl:auto-rows-[12rem] @xl:gap-4' : 'auto-rows-[6rem]'
        }`}
      >
        {photos.map((photo, index) => (
          <Reveal
            key={photo.id}
            enabled={animate}
            variant="scale"
            delay={Math.min(index, 8) * 70}
            className={index === 0 && photos.length > 2 ? 'col-span-2 row-span-2' : ''}
          >
          <button
            type="button"
            disabled={editable}
            onClick={() => setOpenIndex(index)}
            className={`group h-full w-full overflow-hidden rounded-xl bg-surface-2 ${
              editable ? 'cursor-default' : 'cursor-zoom-in'
            }`}
          >
            <img
              src={mediaUrl(photo.url)}
              alt={photo.caption ?? ''}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </button>
          </Reveal>
        ))}
        {editable && (
          <label
            className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-center text-[11px] text-faint hover:border-brand-purple hover:text-brand-purple"
            onClick={(e) => e.stopPropagation()}
          >
            <ImagePlus className="h-5 w-5" />
            {editor.uploading ? 'Envoi…' : 'Ajouter des photos'}
            <input
              type="file"
              accept={`${IMAGE_ACCEPT},image/gif`}
              multiple
              className="sr-only"
              disabled={editor.uploading}
              onChange={(e) => {
                editor.onUploadGalleryPhotos?.([...(e.target.files ?? [])])
                e.target.value = ''
              }}
            />
          </label>
        )}
      </div>
      {editable && photos.length === 0 && (
        <p className="mt-3 flex items-center gap-2 text-xs text-faint">
          <Images className="h-4 w-4" />
          La galerie est vide : elle n'apparaîtra sur le site qu'avec au moins une photo.
        </p>
      )}

      {open &&
        createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpenIndex(-1)}
        >
          <img
            src={mediaUrl(open.url)}
            alt={open.caption ?? ''}
            className="max-h-[85svh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            aria-label="Fermer"
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Photo précédente"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenIndex((i) => (i - 1 + photos.length) % photos.length)
                }}
                className="absolute bottom-6 left-6 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:bottom-auto sm:left-4 sm:p-2"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Photo suivante"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenIndex((i) => (i + 1) % photos.length)
                }}
                className="absolute right-6 bottom-6 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-4 sm:bottom-auto sm:p-2"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>,
        document.body,
      )}
    </div>
  )
}

// Questions fréquentes en accordéon : une réponse ouverte à la fois.
function FaqAccordion({ items, animate }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <Reveal key={index} enabled={animate} delay={Math.min(index, 6) * 80}>
            <div
              className={`overflow-hidden rounded-2xl border bg-bg transition ${
                isOpen ? 'border-border shadow-[0_12px_30px_-22px_rgba(0,0,0,0.45)]' : 'border-border-soft'
              }`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenIndex(isOpen ? -1 : index)
                }}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-semibold text-ink">{item.question}</span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition duration-300 ${
                    isOpen ? 'rotate-180 text-white' : 'bg-surface-2 text-muted'
                  }`}
                  style={isOpen ? { backgroundColor: 'var(--color-brand-purple)' } : undefined}
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-relaxed whitespace-pre-line wrap-break-word text-muted">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        )
      })}
    </div>
  )
}

function formatTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatPrice(priceCents) {
  return priceCents === 0
    ? 'Gratuit'
    : `${(priceCents / 100).toLocaleString('fr-FR')} FCFA`
}

const TEXT_HINT =
  "Sélectionnez ce bloc puis écrivez votre texte dans l'onglet Contenu, à droite."

// Contenu d'un bloc (fonction de rendu, sans hook). Renvoie null quand il n'y a
// rien à montrer aux invités : la section entière est alors masquée.
function renderBlockBody({ block, content, data, editable, editor, fullPage, animate }) {
  const body = (content.body ?? '').trim()
  const bodyText = body ? (
    <p
      className={`min-w-0 leading-relaxed wrap-break-word whitespace-pre-line text-muted ${
        fullPage ? 'text-base @xl:text-lg' : 'text-sm'
      }`}
    >
      {body}
    </p>
  ) : null

  switch (block) {
    case 'Rebours': {
      if (!data.eventDateTime) {
        return editable ? (
          <Placeholder>
            Ajoutez une date à l'événement pour afficher le compte à rebours.
          </Placeholder>
        ) : null
      }
      const start = new Date(data.eventDateTime)
      const calendar = { title: data.title || 'Événement', start, location: data.locationAddress, url: data.slug ? eventShareUrl(data.slug) : undefined, uid: data.slug }
      return (
        <div className="flex flex-col items-center gap-5">
          <Countdown
            target={start.getTime()}
            editable={editable}
            fullPage={fullPage}
            animate={animate}
          />
          <a
            href={googleCalendarUrl(calendar)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => (editable ? e.preventDefault() : handleAddToCalendar(e, calendar))}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition hover:border-faint"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            Ajouter à mon agenda
          </a>
        </div>
      )
    }

    case 'Invitation': {
      const paragraphs = invitationParagraphs(content.body)
      const greeting = invitationGreeting(content, data.invitation?.guestFullName?.trim().split(' ')[0])
      if (!editable && !paragraphs.length && !greeting) return null
      return (
        <div className="mx-auto max-w-2xl text-center">
          {greeting && (
            <p className="mb-4 text-2xl italic" style={{ fontFamily: 'var(--site-heading-font)', color: 'var(--color-brand-purple)' }}>
              {greeting}
            </p>
          )}
          {paragraphs.length ? (
            paragraphs.map((p, i) => (
              <p key={i} className={`mb-4 leading-relaxed text-ink ${fullPage ? 'text-lg' : ''}`}>
                {p}
              </p>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-faint italic">
              Écrivez le texte de votre invitation… {TEXT_HINT}
            </p>
          )}
          {content.signature?.trim() && (
            <p className="mt-6 text-2xl italic" style={{ fontFamily: 'var(--site-heading-font)', color: 'var(--color-brand-purple)' }}>
              {content.signature.trim()}
            </p>
          )}
        </div>
      )
    }

    case 'Histoire': {
      const imagePath = safeBlockImagePath(content.imageUrl)
      if (!editable) {
        if (!bodyText && !imagePath) return null
        const image = imagePath && <FramedImage src={mediaUrl(imagePath)} />
        return bodyText && image ? (
          <div className={`grid items-center @xl:grid-cols-2 ${fullPage ? 'gap-10 @5xl:gap-16' : 'gap-6'}`}>
            <Reveal enabled={animate} variant="left">
              {bodyText}
            </Reveal>
            <Reveal enabled={animate} variant="right" delay={150}>
              {image}
            </Reveal>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl text-center">{bodyText || image}</div>
        )
      }
      return (
        <div className="grid items-center gap-6 @xl:grid-cols-2">
          {bodyText ?? (
            <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-faint italic">
              Racontez votre histoire ici… {TEXT_HINT}
            </p>
          )}
          <div>
            <PhotoPicker
              imageUrl={imagePath}
              uploading={editor.uploading}
              onPick={(file) => editor.onUploadBlockImage?.(block, file)}
            />
            {imagePath && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  editor.onChangeBlockContent?.(block, { imageUrl: null })
                }}
                className="mt-2 text-xs text-faint hover:text-danger"
              >
                Retirer la photo
              </button>
            )}
          </div>
        </div>
      )
    }

    case 'Programme': {
      const items = data.programItems ?? []
      if (items.length === 0) {
        return editable ? (
          <Placeholder>
            Aucune activité pour l'instant.{' '}
            <Link to="/dashboard/programme" className="text-brand-purple hover:underline">
              Ajoutez-les dans Programme
            </Link>
            , elles apparaîtront ici.
          </Placeholder>
        ) : null
      }
      return (
        <ol className="relative mx-auto max-w-3xl space-y-4">
          <span className="absolute top-2 bottom-2 left-[5rem] hidden w-px bg-border @xl:block" />
          {items.map((item, index) => (
            <li key={item.id}>
            <Reveal
              enabled={animate}
              delay={Math.min(index, 6) * 100}
              className="relative grid gap-2 @xl:grid-cols-[4rem_1fr] @xl:gap-8"
            >
              <p
                className="w-fit rounded-full bg-surface-2 px-3 py-1 font-mono text-xs font-semibold @xl:w-auto @xl:rounded-none @xl:bg-transparent @xl:px-0 @xl:pt-4 @xl:pb-0 @xl:text-right @xl:text-sm"
                style={{ color: 'var(--color-brand-purple)' }}
              >
                {formatTime(item.startTime)}
              </p>
              <span
                className="absolute top-5.5 left-[4.625rem] hidden h-3 w-3 rounded-full ring-4 ring-bg @xl:block"
                style={{ backgroundColor: 'var(--color-brand-purple)' }}
              />
              <div className="rounded-2xl border border-border-soft bg-bg p-4 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.4)] @xl:p-5">
                <p className="font-semibold text-ink">{item.title}</p>
                {item.location && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-faint">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.location}
                  </p>
                )}
                {item.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
                )}
              </div>
            </Reveal>
            </li>
          ))}
        </ol>
      )
    }

    case 'Galerie': {
      const photos = data.galleryPhotos ?? []
      if (photos.length === 0 && !editable) return null
      return (
        <GalleryGrid
          photos={photos}
          editable={editable}
          editor={editor}
          fullPage={fullPage}
          animate={animate}
        />
      )
    }

    case 'Localisation': {
      const address = data.locationAddress || content.address
      const transport = (content.transport ?? '').trim()
      const additionalVenues = usableVenues(content.additionalVenues)
      if (!address && !additionalVenues.length && !transport && !bodyText) {
        return editable ? (
          <Placeholder>
            Aucun lieu renseigné. Ajoutez l'adresse dans les informations de
            l'événement (étape Informations de l'assistant).
          </Placeholder>
        ) : null
      }
      const mapsUrl = address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
        : null
      return (
        <div className="grid items-stretch gap-6 @3xl:grid-cols-[2fr_3fr]">
          <div className="flex flex-col gap-4 rounded-2xl border border-border-soft bg-bg p-5 @xl:p-6">
            {address && (
              <div className="flex items-start gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: 'var(--color-brand-purple)' }}
                >
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-ink">
                    {data.locationLabel || "Adresse de l'événement"}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{address}</p>
                </div>
              </div>
            )}
            {transport && (
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted">
                  <Navigation className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-ink">Moyens de transport</p>
                  <p className="mt-0.5 text-sm whitespace-pre-line text-muted">{transport}</p>
                </div>
              </div>
            )}
            {bodyText}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-auto inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: 'var(--color-brand-purple)' }}
              >
                <Navigation className="h-4 w-4" />
                Itinéraire
              </a>
            )}
            {additionalVenues.map((venue, index) => {
              const venueAddress = venue.address?.trim()
              const venueMapsUrl = venueAddress
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`
                : null
              return (
                <div key={index} className="border-t border-border-soft pt-4">
                  {venue.label?.trim() && <p className="font-semibold text-ink">{venue.label.trim()}</p>}
                  {venueAddress && <p className="mt-0.5 text-sm text-muted">{venueAddress}</p>}
                  {venue.time?.trim() && <p className="mt-1 text-xs text-faint">{venue.time.trim()}</p>}
                  {venueMapsUrl && (
                    <a
                      href={venueMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-brand-purple hover:underline"
                    >
                      <Navigation className="h-4 w-4" />
                      Itinéraire
                    </a>
                  )}
                </div>
              )
            })}
          </div>
          {address ? (
            <iframe
              title={`Carte : ${address}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className={`min-h-64 w-full rounded-2xl border border-border-soft ${
                editable ? 'pointer-events-none' : ''
              }`}
            />
          ) : (
            <div className="flex min-h-48 items-center justify-center rounded-2xl bg-surface-2 text-xs text-faint">
              Carte disponible dès que l'adresse est renseignée
            </div>
          )}
        </div>
      )
    }

    case 'RSVP':
      // Réponse intégrée par lien personnel ou formulaire public sans lien.
      return (
        <div className="mx-auto max-w-xl">
          <RsvpModule
            editable={editable}
            invitation={data.invitation}
            invitationLoading={data.invitationLoading}
            invitationError={data.invitationError}
            onInvitationChange={data.onInvitationChange}
            submitOpenRsvp={data.submitOpenRsvp}
            body={body}
            eventTitle={data.title}
            submitRsvp={data.submitRsvp}
            sideLabel={content.sideLabel}
            sides={content.sides}
            rules={content}
          />
        </div>
      )

    case 'Familles': {
      const filled = [content.a, content.b].some((f) => f?.name?.trim())
      if (!filled) return editable ? <Placeholder>Présentez les deux familles dans l'onglet Contenu, à droite.</Placeholder> : null
      return <FamiliesModule content={content} />
    }

    case 'Intervenants': {
      const people = usablePeople(content.people)
      if (!people.length) return bodyText ? <div className="mx-auto max-w-3xl text-center">{bodyText}</div> : editable ? <Placeholder>Ajoutez les intervenants dans l'onglet Contenu, à droite.</Placeholder> : null
      return (
        <div className="space-y-6">
          {bodyText && <div className="mx-auto max-w-3xl text-center">{bodyText}</div>}
          <SpeakersModule people={people} />
        </div>
      )
    }

    case 'Partenaires': {
      const partners = usablePartners(content.partners)
      if (!partners.length) return editable ? <Placeholder>Ajoutez vos partenaires dans l'onglet Contenu, à droite.</Placeholder> : null
      return (
        <div className="space-y-6">
          {bodyText && <div className="mx-auto max-w-3xl text-center">{bodyText}</div>}
          <PartnersModule partners={partners} />
        </div>
      )
    }

    case 'Dress code': {
      const filled = content.title?.trim() || body || usableColors(content.colors).length
      if (!filled) return editable ? <Placeholder>Décrivez la tenue et ses couleurs dans l'onglet Contenu, à droite.</Placeholder> : null
      return <DressCodeModule content={content} />
    }

    case 'Vidéo': {
      if (!parseVideoUrl(content.url)) return editable ? <Placeholder>Collez le lien YouTube ou Facebook de la vidéo ou du direct dans l'onglet Contenu, à droite.</Placeholder> : null
      return <VideoModule content={content} />
    }

    case 'Cadeaux': {
      const gifts = data.gifts ?? []
      return <GiftModule content={content} gifts={gifts} slug={data.slug} editable={editable} />
    }

    case 'Plan de table': {
      const tables = data.seatingTables ?? []
      if (!tables.length && !editable) return null
      return <SeatingModule tables={tables} slug={data.slug} editable={editable} findSeat={data.findSeat} />
    }

    case "Livre d'or": {
      const entries = data.guestBookEntries ?? []
      return (
        <div className="grid gap-6 @5xl:grid-cols-[3fr_2fr]">
          <div>
            {entries.length > 0 ? (
              <div className="grid gap-4 @xl:grid-cols-2">
                {entries.map((entry, index) => (
                  <Reveal
                    key={`${entry.authorName}-${index}`}
                    enabled={animate}
                    delay={Math.min(index, 6) * 90}
                  >
                  <figure className="h-full rounded-2xl border border-border-soft bg-bg p-5">
                    <Quote className="h-5 w-5" style={{ color: 'var(--color-brand-purple)' }} />
                    <blockquote className="mt-3 text-sm leading-relaxed wrap-break-word text-muted">
                      {entry.message}
                    </blockquote>
                    <figcaption className="mt-4 text-sm font-semibold text-ink">
                      {entry.authorName}
                    </figcaption>
                    {entry.reply && (
                      <p className="mt-2 border-l-2 border-border pl-3 text-xs text-brand-purple">
                        {entry.reply}
                      </p>
                    )}
                  </figure>
                  </Reveal>
                ))}
              </div>
            ) : editable ? (
              <Placeholder>
                Les messages de vos invités apparaîtront ici après validation dans Livre d'or.
              </Placeholder>
            ) : (
              <p className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
                Soyez le premier à laisser un mot doux ✨
              </p>
            )}
          </div>
          <GuestBookForm
            slug={data.slug}
            onSubmit={editable ? editor.onAddGuestBookEntry : data.submitGuestBook}
            successMessage={
              editable ? 'Message enregistré et publié dans votre livre d’or.' : undefined
            }
          />
        </div>
      )
    }

    case 'Billetterie': {
      const tickets = data.ticketTypes ?? []
      if (tickets.length === 0) {
        return editable ? (
          <Placeholder>
            Aucun billet.{' '}
            <Link to="/dashboard/billetterie" className="text-brand-purple hover:underline">
              Créez vos billets dans Billetterie
            </Link>
            .
          </Placeholder>
        ) : null
      }
      return (
        <div>
          <div className="grid gap-4 @xl:grid-cols-2 @5xl:grid-cols-3">
            {tickets.map((ticket, index) => (
              <Reveal key={ticket.id} enabled={animate} variant="scale" delay={index * 100}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-border-soft bg-bg p-5 text-center @xl:p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <Ticket className="mx-auto h-6 w-6" style={{ color: 'var(--color-brand-purple)' }} />
                <p className="font-semibold text-ink">{ticket.name}</p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: 'var(--site-heading-font)',
                    color: 'var(--color-brand-purple)',
                  }}
                >
                  {formatPrice(ticket.priceCents)}
                </p>
              </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-faint">
            Billets non vendus en ligne : contactez directement l'organisateur pour réserver.
          </p>
        </div>
      )
    }

    case 'Pied de page':
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          <p
            className={`font-bold text-ink ${fullPage ? 'text-2xl' : 'text-lg'}`}
            style={{ fontFamily: 'var(--site-heading-font)' }}
          >
            {data.title}
          </p>
          {bodyText}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted">
            {data.slug && (
              <Link to={`/cadeaux/${data.slug}`} className="hover:text-ink">
                Liste de cadeaux
              </Link>
            )}
            <Link to="/confidentialite" className="hover:text-ink">
              Confidentialité
            </Link>
            <Link to="/mentions-legales" className="hover:text-ink">
              Mentions légales
            </Link>
          </div>
          {data.showBranding !== false && (
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-[11px] font-semibold text-faint">
              <img src={logoMark} alt="" className="h-4 w-4" />
              Créé avec TBF Moment
            </span>
          )}
        </div>
      )

    case 'FAQ': {
      // Seules les questions remplies sont affichées ; le texte du bloc sert d'introduction.
      const items = (Array.isArray(content.items) ? content.items : []).filter(
        (item) => item?.question?.trim(),
      )
      if (items.length === 0 && !bodyText) {
        return editable ? (
          <Placeholder>
            Aucune question. Sélectionnez ce bloc puis cliquez sur « Ajouter une
            question » dans l'onglet Contenu, à droite.
          </Placeholder>
        ) : null
      }
      return (
        <div className="space-y-6">
          {bodyText && <div className="mx-auto max-w-3xl text-center">{bodyText}</div>}
          {items.length > 0 && <FaqAccordion items={items} animate={animate} />}
        </div>
      )
    }

    default:
      // Intervenants, Vidéo, Plan de table… : le texte du bloc.
      return bodyText ? (
        <div className="mx-auto max-w-3xl text-center">{bodyText}</div>
      ) : editable ? (
        <Placeholder>{TEXT_HINT}</Placeholder>
      ) : null
  }
}


// Barre de navigation du site public : transparente sur le Hero, opaque dès qu'on
// fait défiler ; la section visible est mise en avant ; menu déroulant sur mobile.
function SiteNav({ title, links, cta, onHero }) {
  const [scrolled, setScrolled] = useState(() => window.scrollY > 24)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState(null)
  const progressRef = useRef(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY
      setScrolled(y > 24)
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (progressRef.current)
        progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  const linkKey = links.map((l) => l.block).join('|')
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActive(visible.target.dataset.block)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    for (const block of linkKey.split('|')) {
      const el = document.getElementById(siteBlockDomId(block))
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [linkKey])

  const solid = scrolled || menuOpen
  const light = onHero && !solid
  const go = (block) => (e) => {
    e.preventDefault()
    setMenuOpen(false)
    scrollToBlock(block)
  }

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-all duration-300 ${
        solid
          ? 'border-b border-border-soft bg-bg/90 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.5)] backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-6 sm:px-8">
        <a
          href={`#${siteBlockDomId('Hero')}`}
          onClick={go('Hero')}
          className="flex min-w-0 items-center gap-3"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: 'var(--color-brand-purple)' }}
          >
            {initials(title)}
          </span>
          <span
            className={`truncate text-base font-bold sm:text-lg ${light ? 'text-white' : 'text-ink'}`}
            style={{ fontFamily: 'var(--site-heading-font)' }}
          >
            {title}
          </span>
        </a>

        <div className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map(({ block, label }) => (
            <a
              key={block}
              href={`#${siteBlockDomId(block)}`}
              onClick={go(block)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition ${
                active === block
                  ? light
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-2 text-ink'
                  : light
                    ? 'text-white/80 hover:text-white'
                    : 'text-muted hover:text-ink'
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {cta && (
          <a
            href={`#${siteBlockDomId(cta.block)}`}
            onClick={go(cta.block)}
            className="ml-auto hidden rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-lg transition hover:opacity-90 sm:inline-flex lg:ml-0"
            style={{ backgroundColor: 'var(--color-brand-purple)' }}
          >
            {cta.label}
          </a>
        )}

        {(links.length > 0 || cta) && (
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            className={`ml-auto rounded-full p-2 sm:ml-0 lg:hidden ${
              light ? 'text-white hover:bg-white/15' : 'text-ink hover:bg-surface-2'
            }`}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
      </nav>

      {menuOpen && (
        <div className="border-t border-border-soft px-5 pb-5 lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 pt-3">
            {links.map(({ block, label }) => (
              <a
                key={block}
                href={`#${siteBlockDomId(block)}`}
                onClick={go(block)}
                className={`rounded-xl px-3 py-2.5 text-sm font-medium ${
                  active === block ? 'bg-surface-2 text-ink' : 'text-muted'
                }`}
              >
                {label}
              </a>
            ))}
            {cta && (
              <a
                href={`#${siteBlockDomId(cta.block)}`}
                onClick={go(cta.block)}
                className="mt-2 rounded-full px-5 py-3 text-center text-sm font-semibold text-white"
                style={{ backgroundColor: 'var(--color-brand-purple)' }}
              >
                {cta.label}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Progression de lecture */}
      <div
        ref={progressRef}
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left"
        style={{ backgroundColor: 'var(--color-brand-purple)', transform: 'scaleX(0)' }}
      />
    </header>

    </>
  )
}

// Boutons du Hero : de vrais liens sur le site, de simples pastilles dans le Builder.
function HeroAction({ block, primary, editable, fullPage, onImage, children }) {
  const classes = `inline-flex items-center gap-2 rounded-full font-semibold transition ${
    fullPage ? 'justify-center px-6 py-3 text-sm @xl:text-base' : 'px-4 py-2 text-xs'
  } ${
    primary
      ? 'text-white shadow-lg hover:opacity-90'
      : onImage
        ? 'border border-white/40 text-white hover:bg-white/10'
        : 'border border-border bg-bg/60 text-ink hover:bg-bg'
  }`
  const style = primary ? { backgroundColor: 'var(--color-brand-purple)' } : undefined
  if (editable)
    return (
      <span className={classes} style={style}>
        {children}
      </span>
    )
  return (
    <a
      href={`#${siteBlockDomId(block)}`}
      onClick={(e) => {
        e.preventDefault()
        scrollToBlock(block)
      }}
      className={classes}
      style={style}
    >
      {children}
    </a>
  )
}


/**
 * @param heroStyle  { color, font, darkOverlay, title, subtitle }
 * @param blocks     types de blocs (hors Hero), dans l'ordre
 * @param blockContent  contenu JSON de chaque bloc, par type
 * @param data       { slug, eventDateTime, coverPath, description, locationLabel,
 *                     locationAddress, programItems, galleryPhotos, guestBookEntries, ticketTypes }
 * @param editor     présent uniquement dans le Builder (hors aperçu) : sélection,
 *                   réordonnancement, envoi de photos...
 * @param fullPage   site public : pleine largeur, barre de navigation, Hero plein
 *                   écran. Le Builder garde les mêmes blocs dans un cadre réduit.
 */
// Les modèles premium (template.theme) ont leur propre rendu ; les autres utilisent
// le rendu classique. Choix fait ici, hors des hooks, pour pouvoir changer de modèle
// dans le Builder sans casser l'ordre des hooks.
export default function SitePage(props) {
  return getSiteTheme(props.template?.theme) ? (
    <ThemedSitePage {...props} />
  ) : (
    <ClassicSitePage {...props} />
  )
}

function ClassicSitePage({
  template,
  heroStyle,
  blocks,
  blockContent,
  data: rawData,
  editor = null,
  fullPage = false,
  className = '',
}) {
  const editable = Boolean(editor)
  const animate = fullPage && !editable
  const selectedBlock = editor?.selectedBlock ?? null
  const heroBgRef = useRef(null)
  const heroContentRef = useRef(null)

  // Parallaxe : le fond du Hero défile plus lentement et le texte s'estompe.
  useEffect(() => {
    if (!animate || prefersReducedMotion() || window.matchMedia?.('(max-width: 767px)').matches)
      return
    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY
      const progress = Math.min(1, y / (window.innerHeight * 0.85))
      if (heroBgRef.current)
        heroBgRef.current.style.transform = `translate3d(0, ${y * 0.35}px, 0) scale(1.12)`
      if (heroContentRef.current) {
        heroContentRef.current.style.transform = `translate3d(0, ${y * 0.18}px, 0)`
        heroContentRef.current.style.opacity = String(1 - progress * 0.9)
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [animate])

  // Entrée du Hero au chargement : chaque élément arrive avec un léger décalage.
  const enter = (index) =>
    animate
      ? { className: 'site-enter', style: { animationDelay: `${120 + index * 140}ms` } }
      : { className: '', style: undefined }
  const data = { ...rawData, title: heroStyle.title }
  const coverPath = safeCoverPath(data.coverPath)
  const heroAlign = template?.presentation?.heroAlign ?? 'center'
  const onImage = Boolean(coverPath)

  const selectableProps = (block) =>
    editable
      ? {
          onClick: () => editor.onSelectBlock(block),
          className: `cursor-pointer ${
            selectedBlock === block
              ? 'ring-2 ring-inset ring-[color:var(--color-brand-purple)]'
              : ''
          }`,
        }
      : { className: '' }

  const heroProps = selectableProps('Hero')
  const renderedBlocks = blocks.map((block) => {
    const content = blockContent[block] ?? {}
    const body = renderBlockBody({
      block,
      content,
      data,
      editable,
      editor: editor ?? {},
      fullPage,
      animate,
    })
    return { block, content, body }
  })
  const visible = renderedBlocks.filter(({ body }) => body !== null)
  const navLinks = visible
    .filter(({ block }) => SECTION_META[block]?.nav)
    .map(({ block }) => ({ block, label: SECTION_META[block].nav }))
  const has = (block) => visible.some((b) => b.block === block)
  const cta = has('RSVP')
    ? { block: 'RSVP', label: blockContent.RSVP?.cta?.trim() || 'Confirmer ma présence' }
    : has('Billetterie')
      ? { block: 'Billetterie', label: 'Réserver' }
      : null
  const firstSection = visible[0]?.block

  return (
    <div
      className={`overflow-clip bg-bg text-ink ${className}`}
      style={siteRootStyle(template, {
        accent: heroStyle.color,
        headingFont: HEADING_FONT_STACKS[heroStyle.font],
      })}
      data-template={template?.name ?? 'custom'}
    >
      {fullPage && (
        <SiteNav title={heroStyle.title} links={navLinks} cta={cta} onHero={onImage} />
      )}

      {/* Les variantes responsive (@xl:, @3xl:...) suivent la largeur de ce conteneur, pas
          celle de la fenêtre : l'aperçu mobile du Builder s'affiche donc vraiment comme
          sur un téléphone, et le site public reste identique (conteneur = page entière). */}
      <div className="@container">

      <div
        id={siteBlockDomId('Hero')}
        data-block="Hero"
        onClick={heroProps.onClick}
        className={`relative isolate flex flex-col justify-center overflow-hidden ${
          fullPage ? 'min-h-svh px-5 pt-24 pb-16 @xl:px-6 @xl:pt-28 @xl:pb-24' : 'px-6 py-16'
        } ${heroProps.className}`}
      >
        <div
          ref={heroBgRef}
          aria-hidden="true"
          className="absolute inset-0 -z-20 will-change-transform"
          style={{
            background: coverPath
              ? `linear-gradient(180deg, rgba(11,16,32,0.45), rgba(11,16,32,0.25) 40%, rgba(11,16,32,0.85)), url(${mediaUrl(coverPath)}) center / cover`
              : heroStyle.darkOverlay
                ? `linear-gradient(160deg, ${heroStyle.color}40, var(--color-bg) 70%)`
                : 'var(--color-surface)',
          }}
        />
        {!coverPath && (
          <>
            <span
              className={`pointer-events-none absolute -top-24 -right-24 -z-10 h-72 w-72 rounded-full opacity-30 blur-3xl ${
                animate ? 'site-float' : ''
              }`}
              style={{ backgroundColor: 'var(--color-brand-purple)' }}
            />
            <span
              className={`pointer-events-none absolute -bottom-32 -left-20 -z-10 h-80 w-80 rounded-full opacity-20 blur-3xl ${
                animate ? 'site-float [animation-delay:-4s]' : ''
              }`}
              style={{ backgroundColor: 'var(--color-brand-purple)' }}
            />
          </>
        )}

        {editable && selectedBlock === 'Hero' && (
          <span className="absolute top-3 left-3 rounded-full bg-[color:var(--color-brand-purple)] px-2.5 py-1 text-[11px] font-semibold text-white">
            Hero
          </span>
        )}

        <div
          ref={heroContentRef}
          className={`mx-auto flex w-full flex-col will-change-transform ${fullPage ? 'max-w-5xl gap-6' : 'gap-3'}`}
          style={{
            alignItems: heroAlign,
            textAlign: heroAlign === 'flex-start' ? 'left' : 'center',
          }}
        >
          <span
            style={enter(0).style}
            className={`${enter(0).className} rounded-full px-4 py-1.5 font-semibold tracking-[0.2em] uppercase backdrop-blur ${
              fullPage ? 'text-xs' : 'text-[10px]'
            } ${
              onImage
                ? 'border border-white/30 bg-white/10 text-white'
                : 'border border-border-soft bg-bg/70 text-brand-purple'
            }`}
          >
            {template?.preview?.eyebrow ?? "Invitation d'exception"}
          </span>
          <h1
            className={`${enter(1).className} max-w-4xl font-bold wrap-break-word ${
              fullPage ? 'text-4xl leading-[1.1] @xl:text-6xl @xl:leading-[1.05] @5xl:text-7xl' : 'text-3xl'
            } ${onImage ? 'text-white drop-shadow-lg' : 'text-ink'}`}
            style={{ fontFamily: 'var(--site-heading-font)', ...enter(1).style }}
          >
            {heroStyle.title}
          </h1>
          {(heroStyle.subtitle || data.locationAddress) && (
            <div
              className={`${enter(2).className} flex flex-wrap items-center gap-x-5 gap-y-2 ${
                fullPage ? 'text-base @xl:text-lg' : 'text-sm'
              } ${onImage ? 'text-white/90' : 'text-muted'}`}
              style={{ justifyContent: heroAlign, ...enter(2).style }}
            >
              {heroStyle.subtitle && (
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" style={{ color: onImage ? undefined : 'var(--color-brand-purple)' }} />
                  {heroStyle.subtitle}
                </span>
              )}
              {data.locationAddress && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" style={{ color: onImage ? undefined : 'var(--color-brand-purple)' }} />
                  {data.locationLabel && data.locationLabel !== 'Lieu principal'
                    ? data.locationLabel
                    : data.locationAddress}
                </span>
              )}
            </div>
          )}
          {data.organizer?.name && (
            <p className={`${enter(2).className} text-sm ${onImage ? 'text-white/80' : 'text-muted'}`} style={enter(2).style}>
              Organisé par <b className={onImage ? 'text-white' : 'text-ink'}>{data.organizer.name}</b>
            </p>
          )}
          {(cta || firstSection) && (
            <div
              className={`${enter(3).className} mt-2 flex w-full flex-col gap-3 @xl:w-auto @xl:flex-row @xl:flex-wrap`}
              style={{ justifyContent: heroAlign, ...enter(3).style }}
            >
              {cta && (
                <HeroAction block={cta.block} primary editable={editable} fullPage={fullPage} onImage={onImage}>
                  {cta.label}
                </HeroAction>
              )}
              {firstSection && firstSection !== cta?.block && (
                <HeroAction block={firstSection} editable={editable} fullPage={fullPage} onImage={onImage}>Découvrir</HeroAction>
              )}
            </div>
          )}
        </div>

        {fullPage && firstSection && (
          <button
            type="button"
            onClick={() => scrollToBlock(firstSection)}
            aria-label="Faire défiler"
            className={`absolute bottom-8 left-1/2 hidden -translate-x-1/2 animate-bounce rounded-full p-2 @xl:block ${
              onImage ? 'text-white/80' : 'text-faint'
            }`}
          >
            <ChevronDown className="h-6 w-6" />
          </button>
        )}
      </div>

      {data.description && (
        <div className={`px-6 ${fullPage ? 'py-12 @xl:py-20' : 'py-8'}`}>
          <Reveal enabled={animate}>
          <p
            className={`mx-auto max-w-3xl text-center leading-relaxed wrap-break-word whitespace-pre-line text-ink ${
              fullPage ? 'text-lg @xl:text-2xl' : 'text-sm'
            }`}
            style={{ fontFamily: fullPage ? 'var(--site-heading-font)' : undefined }}
          >
            {data.description}
          </p>
          </Reveal>
        </div>
      )}

      {renderedBlocks.map(({ block, content, body }, index) => {
        const props = selectableProps(block)
        return (
          <SiteBlock
            key={block}
            block={block}
            content={content}
            body={body}
            onClick={props.onClick}
            selectClassName={props.className}
            fullPage={fullPage}
            animate={fullPage && !editable}
            toolbar={
              editable && selectedBlock === block ? (
                <BlockToolbar block={block} index={index} count={blocks.length} editor={editor} />
              ) : null
            }
          />
        )
      })}

      {editable && blocks.length === 0 && (
        <p className="px-6 py-10 text-center text-sm text-faint">
          Cliquez un bloc à gauche pour l'ajouter à votre page.
        </p>
      )}
      </div>
    </div>
  )
}

// Section d'un bloc : petite mention + titre centrés, puis le contenu. Si le corps
// est vide (bloc sans contenu sur le site public), la section entière disparaît.
function SiteBlock({ block, content, body, onClick, selectClassName, toolbar, fullPage, animate }) {
  if (body === null) return null
  const showHeading = content.showHeading && content.heading
  const eyebrow = SECTION_META[block]?.eyebrow
  const isFooter = block === 'Pied de page'

  return (
    <section
      id={siteBlockDomId(block)}
      data-block={block}
      onClick={onClick}
      className={`relative ${fullPage ? 'px-5 @xl:px-6' : 'px-6'} ${
        fullPage ? (isFooter ? 'py-12 @xl:py-14' : 'scroll-mt-16 py-16 @xl:py-28') : 'py-10'
      } ${selectClassName} ${
        content.tinted || isFooter ? 'bg-surface' : 'bg-bg'
      } ${isFooter ? 'border-t border-border-soft' : ''}`}
    >
      {toolbar}
      <div className={`mx-auto max-w-6xl ${toolbar ? 'mt-8' : ''}`}>
        {showHeading && (
          <Reveal enabled={animate}>
            <div className={`text-center ${fullPage ? 'mb-8 @xl:mb-12' : 'mb-6'}`}>
              {eyebrow && (
                <p
                  className={`font-semibold tracking-[0.25em] uppercase ${
                    fullPage ? 'text-xs' : 'text-[10px]'
                  }`}
                  style={{ color: 'var(--color-brand-purple)' }}
                >
                  {eyebrow}
                </p>
              )}
              <h2
                className={`mt-2 font-bold text-balance text-ink ${fullPage ? 'text-3xl @xl:text-5xl' : 'text-2xl'}`}
                style={{ fontFamily: 'var(--site-heading-font)' }}
              >
                {content.heading}
              </h2>
              <Reveal enabled={animate} variant="grow" delay={250} className="mx-auto mt-4 w-12">
                <span
                  className="block h-1 w-12 rounded-full"
                  style={{ backgroundColor: 'var(--color-brand-purple)' }}
                />
              </Reveal>
            </div>
          </Reveal>
        )}
        <Reveal enabled={animate} delay={showHeading ? 120 : 0}>
          {body}
        </Reveal>
      </div>
    </section>
  )
}
