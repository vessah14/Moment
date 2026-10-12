import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { mediaUrl } from '../api/client'
import { getPublicGifts } from '../api/giftRegistry'
import { getPublicInvitation } from '../api/guests'
import { getPublicSeating, getPublicSite, trackPublicEvent } from '../api/publicEvents'
import logoMark from '../assets/logo-mark.png'
import SitePage from '../components/site/SitePage'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import { formatEventDate } from '../utils/eventStatus'
import { isInviteCode } from '../utils/mobileMoney'
import { useSeo } from '../utils/seo'
import { safeCoverPath } from '../utils/sitePage'
import {
  findTemplate,
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
        ...(image && { image: [image] }),
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
  const [site, setSite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Données des modules (liste de cadeaux, tables) et invité arrivé par son lien personnel.
  const [extras, setExtras] = useState({ gifts: [], seatingTables: [] })
  const [invitation, setInvitation] = useState(null)
  const [searchParams] = useSearchParams()
  const inviteParam = searchParams.get('invite')
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
    getPublicInvitation(code)
      .then(inv => {
        if (cancelled) return
        // Lien d'un autre événement : ignoré.
        if (inv?.eventSlug && inv.eventSlug !== slug) return
        setInvitation(inv)
        try {
          localStorage.setItem(storageKey, code)
        } catch {
          // Stockage indisponible (navigation privée) : rien de grave.
        }
      })
      .catch(() => {
        try {
          localStorage.removeItem(storageKey)
        } catch {
          // ignoré
        }
      })
    return () => {
      cancelled = true
    }
  }, [slug, inviteParam])

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

  if (loading) {
    return (
      <div className='flex min-h-svh items-center justify-center text-sm text-faint'>
        Chargement…
      </div>
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
  let birthdayAge = null
  try {
    birthdayAge = JSON.parse(event.customFields || '{}')?.birthdayAge ?? null
  } catch {
    birthdayAge = null
  }
  const birthdayTitle = birthdayAge && template?.categoryCode === 'anniversaire'
    ? `Les ${birthdayAge} ans de ${event.name.replace(/^Les\s+\d+\s+ans\s+de\s*/i, '').trim()}`
    : event.name
  const heroTitle = heroContent.title || (template?.categoryCode === 'anniversaire' ? birthdayTitle : event.name)
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
        blocks={pageBlocks}
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
          invitation,
          onInvitationChange: setInvitation,
          ticketTypes: site.ticketTypes
        }}
        className='min-h-svh'
      />
    </>
  )
}
