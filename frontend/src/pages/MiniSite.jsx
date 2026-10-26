import { useEffect, useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { mediaUrl } from '../api/client'
import { getPublicGifts } from '../api/giftRegistry'
import { getPublicInvitation } from '../api/guests'
import { getPublicSeating, getPublicSite, submitPublicEventRsvp, trackPublicEvent } from '../api/publicEvents'
import logoMark from '../assets/logo-mark.png'
import SitePage from '../components/site/SitePage'
import InvitationLoader from '../components/site/InvitationLoader'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import { formatEventDate } from '../utils/eventStatus'
import { isInviteCode } from '../utils/mobileMoney'
import { absoluteUrl, useSeo } from '../utils/seo'
import { safeCoverPath } from '../utils/sitePage'
import { displayNameFromTitle, eventRequiresAge, formatEventDisplayTitle } from '../utils/eventTitle'
import {
  findTemplate,
  ensureRsvpBlock,
  normalizeBlockType,
  resolveSiteStyle
} from '../utils/templateTheme'

function parseContent (raw) {
  try {
    return JSON.parse(raw || '{}') ?? {}
  } catch {
    return {}
  }
}

// Même sous-titre par défaut que le Builder (date · heure).
function defaultSubtitle (event) {
  return [
    event.eventDate ? formatEventDate(event.eventDate) : null,
    event.startTime ? event.startTime.slice(0, 5) : null
  ]
    .filter(Boolean)
    .join(' · ')
}

// Balises SEO / partage d'un site d'événement. Indexé seulement si l'organisateur a
// activé « Visible sur Google » (event.searchable) : un mariage ou des obsèques ne
// doivent pas apparaître dans les moteurs de recherche sans son accord.
function eventSeo (site, slug) {
  if (!site) return { title: 'Événement', path: `/e/${slug}`, noindex: true }
  const { event } = site
  const coverPath = safeCoverPath(event.coverImageUrl)
  const image = coverPath ? mediaUrl(coverPath) : undefined
  const when = event.eventDate ? defaultSubtitle(event) : ''
  const where = event.locationLabel && event.locationLabel !== 'Lieu principal'
    ? event.locationLabel
    : event.locationAddress
  const description =
    event.description ||
    [event.tagline, when && `Le ${when}`, where && `à ${where}`]
      .filter(Boolean)
      .join(' · ') ||
    `Retrouvez toutes les informations de « ${event.name} » sur son site.`

  const jsonLd = event.eventDate
    ? {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.name,
        description,
        startDate: event.startTime
          ? `${event.eventDate}T${event.startTime.slice(0, 5)}`
          : event.eventDate,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        url: absoluteUrl(`/e/${event.slug}`),
        ...(image && { image: [image] }),
        // Billets en vente : prix affiché par Google dans les résultats « événement ».
        ...(site.ticketTypes?.length && {
          offers: site.ticketTypes.map(ticket => ({
            '@type': 'Offer',
            name: ticket.name,
            price: Math.round((ticket.priceCents ?? 0) / 100),
            priceCurrency: 'XAF',
            availability: ticket.quota > 0 && ticket.soldCount >= ticket.quota
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
            url: absoluteUrl(`/e/${event.slug}`)
          }))
        }),
        ...(event.locationAddress && {
          location: {
            '@type': 'Place',
            name: where || event.locationAddress,
            address: event.locationAddress
          }
        })
      }
    : null

  return {
    fullTitle: event.name,
    description,
    path: `/e/${event.slug}`,
    image,
    noindex: !event.searchable,
    jsonLd
  }
}

// Site public d'un événement. Le rendu est SitePage, le même composant que l'aperçu
// du Builder : la page publiée est identique à ce que l'organisateur a composé.
export default function MiniSite () {
  const { slug } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const inviteParam = searchParams.get('invite')
  const invitationPreview = location.state?.invitationPreview
  const matchingPreview =
    invitationPreview?.eventSlug === slug &&
    invitationPreview?.guestId === inviteParam
      ? invitationPreview
      : null
  const [site, setSite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Données des modules (liste de cadeaux, tables) et invité arrivé par son lien personnel.
  const [extras, setExtras] = useState({ gifts: [], seatingTables: [] })
  const [invitation, setInvitation] = useState(matchingPreview)
  const [invitationLoading, setInvitationLoading] = useState(false)
  const [invitationError, setInvitationError] = useState('')
  useSeo(eventSeo(error ? null : site, slug))

  // Lien personnel : /e/slug?invite=<code>. Le code est retenu sur cet appareil pour que
  // l'invité retrouve sa réponse et son pass en revenant sur le site.
  useEffect(() => {
    const storageKey = `tbf_invite_${slug}`
    let code = isInviteCode(inviteParam) ? inviteParam : null
    if (!code) {
      try {
        code = localStorage.getItem(storageKey)
      } catch {
        code = null
      }
    }
    if (!isInviteCode(code)) return
    let cancelled = false
    setInvitation(matchingPreview)
    setInvitationLoading(true)
    setInvitationError('')
    getPublicInvitation(code)
      .then(inv => {
        if (cancelled) return
        // Lien d'un autre événement : ignoré.
        if (inv?.eventSlug && inv.eventSlug !== slug) {
          setInvitationError("Ce lien d'invitation ne correspond pas à cet événement.")
          return
        }
        if (!inv?.guestId || !inv.guestFullName) {
          setInvitationError("Cette invitation est introuvable. Demandez à l'organisateur de vous renvoyer votre lien personnel.")
          return
        }
        setInvitation(inv)
        try {
          localStorage.setItem(storageKey, code)
        } catch {
          // Stockage indisponible (navigation privée) : rien de grave.
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInvitationError("Impossible de charger cette invitation. Utilisez le lien personnel envoyé par l'organisateur.")
        }
        try {
          localStorage.removeItem(storageKey)
        } catch {
          // ignoré
        }
      })
      .finally(() => {
        if (!cancelled) setInvitationLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug, inviteParam, matchingPreview])

  useEffect(() => {
    setLoading(true)
    getPublicSite(slug)
      .then(data => {
        setSite(data)
        setError('')
        trackPublicEvent(slug, 'visit')
        const types = new Set(data.blocks.map(b => b.blockType))
        if (types.has('Cadeaux'))
          getPublicGifts(slug)
            .then(gifts => setExtras(prev => ({ ...prev, gifts: gifts ?? [] })))
            .catch(() => {})
        if (types.has('Plan de table'))
          getPublicSeating(slug)
            .then(tables => setExtras(prev => ({ ...prev, seatingTables: tables ?? [] })))
            .catch(() => {})
      })
      .catch(() =>
        setError("Cet événement n'est pas (encore) publié, ou n'existe pas.")
      )
      .finally(() => setLoading(false))
  }, [slug])

  const loaderHero = site?.blocks?.find(block => block.blockType === 'Hero')
  const loaderDisplayTitle = loaderHero
    ? parseContent(loaderHero.content).title
    : ''
  const loaderEventName = invitation?.eventName || site?.event?.name

  if (loading) {
    if (invitationLoading || isInviteCode(inviteParam)) {
      return (
        <InvitationLoader
          invitation={invitation}
          eventName={loaderEventName}
          displayTitle={loaderDisplayTitle}
        />
      )
    }
    return (
      <div className='flex min-h-svh items-center justify-center text-sm text-faint'>
        Chargement…
      </div>
    )
  }

  if (invitationLoading) {
    return (
      <InvitationLoader
        invitation={invitation}
        eventName={loaderEventName || slug}
        displayTitle={loaderDisplayTitle}
      />
    )
  }

  if (error || !site) {
    return (
      <div className='flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center'>
        <img src={logoMark} alt='' className='h-10 w-10 opacity-80' />
        <p className='text-sm text-faint'>
          {error || 'Événement introuvable.'}
        </p>
      </div>
    )
  }

  const { event, blocks } = site
  const heroBlock = blocks.find(b => b.blockType === 'Hero')
  const heroContent = heroBlock ? parseContent(heroBlock.content) : {}
  const template = findTemplate(event.template)
  const eventFields = parseContent(event.customFields)
  const birthdayAge = eventFields.birthdayAge ?? null
  const eventTypeId = eventFields.eventType
  const displayText = eventFields.display || displayNameFromTitle(heroContent.title)
  const birthdayTitle = birthdayAge && eventRequiresAge(eventTypeId)
    ? formatEventDisplayTitle(eventTypeId, birthdayAge, displayText, event.name)
    : event.name
  const heroTitle = heroContent.title || birthdayTitle
  const siteStyle = resolveSiteStyle({
    template,
    heroContent,
    themeColor: event.themeColor
  })

  const blockContent = {}
  const pageBlocks = []
  for (const block of blocks) {
    const type = normalizeBlockType(block.blockType)
    if (type === 'Hero' || blockContent[type]) continue
    blockContent[type] = parseContent(block.content)
    pageBlocks.push(type)
  }
  const publicPageBlocks = ensureRsvpBlock(pageBlocks)

  return (
    <>
      <LanguageSwitcher floating />
      <SitePage
        fullPage
        template={template}
        heroStyle={{
          color: siteStyle.accent,
          font: siteStyle.fontKey,
          darkOverlay: heroContent.darkOverlay ?? true,
          palette: heroContent.palette,
          motif: heroContent.motif,
          kicker: heroContent.kicker,
          title: heroTitle,
          subtitle:
            heroContent.subtitle || event.tagline || defaultSubtitle(event)
        }}
        blocks={publicPageBlocks}
        blockContent={blockContent}
        data={{
          slug: event.slug,
          eventDateTime: event.eventDate
            ? `${event.eventDate}T${event.startTime ?? '00:00:00'}`
            : '',
          coverPath: event.coverImageUrl,
          description: event.description,
          locationLabel: event.locationLabel,
          locationAddress: event.locationAddress,
          programItems: site.programItems,
          galleryPhotos: site.galleryPhotos,
          guestBookEntries: site.guestBookEntries,
          gifts: extras.gifts,
          seatingTables: extras.seatingTables,
          invitation: invitation?.eventSlug === slug ? invitation : null,
          invitationLoading,
          invitationError,
          onInvitationChange: value => {
            setInvitation(value)
            if (value?.guestId && value.eventSlug === event.slug) {
              try {
                localStorage.setItem(`tbf_invite_${event.slug}`, value.guestId)
              } catch {
                // Le billet reste visible pendant cette visite si le stockage est indisponible.
              }
            }
          },
          submitOpenRsvp: dto => submitPublicEventRsvp(event.slug, dto),
          ticketTypes: site.ticketTypes,
          // Faux pour les offres qui retirent la mention TBF Moment (Business et plus).
          showBranding: site.showBranding !== false,
          organizer: site.organizerName || site.organizerLogoUrl
            ? { name: site.organizerName, logoUrl: site.organizerLogoUrl }
            : null
        }}
        className='min-h-svh'
      />
    </>
  )
}
