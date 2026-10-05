import { Calendar, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_ORIGIN } from '../api/client'
import { getPublicSite } from '../api/publicEvents'
import logoMark from '../assets/logo-mark.png'
import {
  HEADING_FONT_STACKS,
  defaultFontForTemplate,
  findTemplate,
  siteThemeStyle
} from '../utils/templateTheme'
import GuestBookForm from '../components/minisite/GuestBookForm'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'

// Les couleurs et l'URL de couverture sont injectées dans le CSS de la page : on ne
// garde que des valeurs sûres, même si une ancienne donnée en base ne l'est pas.
const safeColor = value =>
  typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value) ? value : null
const safeCoverPath = value =>
  typeof value === 'string' &&
  /^\/uploads\/covers\/[0-9a-fA-F-]{36}\/[0-9a-fA-F-]{36}\.(jpg|jpeg|png|webp)$/.test(
    value
  )
    ? value
    : null

function formatEventDateTime (dateStr, timeStr) {
  if (!dateStr) return ''
  const date = new Date(`${dateStr}T${timeStr ?? '00:00:00'}`)
  if (Number.isNaN(date.getTime())) return dateStr
  const datePart = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  if (!timeStr) return datePart
  const timePart = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
  return `${datePart} à ${timePart}`
}

function parseContent (raw) {
  try {
    return JSON.parse(raw || '{}') ?? {}
  } catch {
    return {}
  }
}

function Section ({ heading, tinted, children }) {
  return (
    <section className={`py-8 sm:py-10 ${tinted ? 'bg-surface-2/40' : ''}`}>
      <div className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
        <div
          className={`rounded-[28px] border border-border-soft bg-surface/95 px-4 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:px-6 lg:px-8 ${
            tinted ? 'bg-linear-to-b from-white to-surface/70' : ''
          }`}
          style={{ borderRadius: 'var(--site-panel-radius)' }}
        >
          {heading && (
            <div className='mb-5 flex items-center justify-center'>
              <h2
                className='text-center text-xl font-bold tracking-tight text-ink sm:text-2xl'
                style={{ fontFamily: 'var(--site-heading-font)' }}
              >
                {heading}
              </h2>
            </div>
          )}
          <div className={heading ? '' : ''}>{children}</div>
        </div>
      </div>
    </section>
  )
}

export default function MiniSite () {
  const { slug } = useParams()
  const [site, setSite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    getPublicSite(slug)
      .then(data => {
        setSite(data)
        setError('')
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

  const {
    event,
    blocks,
    programItems,
    galleryPhotos,
    guestBookEntries,
    ticketTypes
  } = site
  const heroBlock = blocks.find(b => b.blockType === 'Hero')
  const heroContent = heroBlock ? parseContent(heroBlock.content) : {}
  const coverPath = safeCoverPath(event.coverImageUrl)
  const coverUrl = coverPath ? `${API_ORIGIN}${coverPath}` : null
  const dateTimeLabel = formatEventDateTime(event.eventDate, event.startTime)
  const template = findTemplate(event.template)
  const themeColor =
    template?.preview?.accent ||
    safeColor(heroContent.color) ||
    safeColor(event.themeColor) ||
    '#6c4bf4'
  const headingFont = template
    ? HEADING_FONT_STACKS[defaultFontForTemplate(template)]
    : HEADING_FONT_STACKS[heroContent.font] ?? 'var(--font-display-premium)'
  const presentation = template?.presentation
  const heroOnImage = Boolean(coverUrl)

  return (
    <div
      className='min-h-svh bg-bg text-ink'
      data-template={template?.name ?? 'custom'}
      style={{
        ...siteThemeStyle(template, themeColor),
        '--site-heading-font': headingFont,
        '--site-panel-radius': presentation?.panelRadius ?? '1.75rem',
        fontFamily:
          template?.categoryCode === 'mariage'
            ? 'var(--font-montserrat)'
            : 'var(--font-sans)'
      }}
    >
      <LanguageSwitcher floating />
      <div
        className='relative flex aspect-21/9 flex-col items-center justify-end gap-3 bg-cover bg-center px-6 pb-10 text-center sm:aspect-video'
        style={{
          backgroundImage: coverUrl
            ? `linear-gradient(180deg, rgba(11,16,32,0.15), rgba(11,16,32,0.85)), url(${coverUrl})`
            : `linear-gradient(160deg, ${themeColor}55, var(--color-bg))`,
          alignItems: presentation?.heroAlign ?? 'center',
          textAlign:
            presentation?.heroAlign === 'flex-start' ? 'left' : 'center',
          minHeight: presentation?.heroHeight
        }}
      >
        {!coverUrl && !template && (
          <img src={logoMark} alt='' className='h-12 w-12 opacity-80' />
        )}
        <span
          className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase backdrop-blur ${
            heroOnImage
              ? 'border border-white/30 bg-black/20 text-white'
              : 'border border-border-soft bg-surface/70 text-brand-purple'
          }`}
        >
          {heroContent.subtitle || event.tagline || 'Vous êtes invité(e)'}
        </span>
        <h1
          className={`text-3xl font-bold sm:text-4xl ${
            heroOnImage ? 'text-white' : 'text-ink'
          }`}
          style={{ fontFamily: 'var(--site-heading-font)' }}
        >
          {heroContent.title || event.name}
        </h1>
      </div>

      <div className='mx-auto max-w-2xl px-6 py-10'>
        <div className='flex flex-wrap justify-center gap-x-8 gap-y-3 text-center'>
          {dateTimeLabel && (
            <div className='flex items-center gap-2 text-sm text-muted'>
              <Calendar className='h-4 w-4 text-brand-purple' />
              {dateTimeLabel}
            </div>
          )}
          {event.locationAddress && (
            <div className='flex items-center gap-2 text-sm text-muted'>
              <MapPin className='h-4 w-4 text-brand-purple' />
              {event.locationLabel
                ? `${event.locationLabel} · ${event.locationAddress}`
                : event.locationAddress}
            </div>
          )}
        </div>

        {event.description && (
          <p className='mt-8 text-center text-sm leading-relaxed whitespace-pre-line text-ink'>
            {event.description}
          </p>
        )}
      </div>

      {blocks
        .filter(b => b.blockType !== 'Hero')
        .map(block => {
          const content = parseContent(block.content)
          const key = `${block.blockType}-${block.position}`

          if (block.blockType === 'Programme') {
            if (programItems.length === 0) return null
            return (
              <Section
                key={key}
                heading={content.heading || 'Programme'}
                tinted={content.tinted}
              >
                <ol className='space-y-4 border-l border-border-soft pl-5'>
                  {programItems.map(item => (
                    <li key={item.id} className='relative'>
                      <span className='absolute -left-6.75 top-1.5 h-2 w-2 rounded-full bg-brand-purple' />
                      <p className='text-xs font-mono text-faint'>
                        {item.startTime
                          ? new Date(item.startTime).toLocaleTimeString(
                              'fr-FR',
                              {
                                hour: '2-digit',
                                minute: '2-digit'
                              }
                            )
                          : ''}
                      </p>
                      <p className='font-semibold text-ink'>{item.title}</p>
                      {item.location && (
                        <p className='text-xs text-faint'>{item.location}</p>
                      )}
                      {item.description && (
                        <p className='mt-1 text-sm text-muted'>
                          {item.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </Section>
            )
          }

          if (block.blockType === 'Galerie') {
            if (galleryPhotos.length === 0) return null
            return (
              <Section
                key={key}
                heading={content.heading || 'Galerie'}
                tinted={content.tinted}
              >
                <div className='grid grid-cols-3 gap-2'>
                  {galleryPhotos.map(photo => (
                    <img
                      key={photo.id}
                      src={`${API_ORIGIN}${photo.url}`}
                      alt={photo.caption ?? ''}
                      className='aspect-square rounded-lg object-cover'
                    />
                  ))}
                </div>
              </Section>
            )
          }

          if (block.blockType === "Livre d'or") {
            return (
              <Section
                key={key}
                heading={content.heading || "Livre d'or"}
                tinted={content.tinted}
              >
                <GuestBookForm slug={event.slug} />
                <div className='mt-4 space-y-3'>
                  {guestBookEntries.map((entry, i) => (
                    <div
                      key={i}
                      className='rounded-xl border border-border-soft bg-surface p-4'
                    >
                      <p className='text-sm font-medium text-ink'>
                        {entry.authorName}
                      </p>
                      <p className='mt-1 text-sm text-muted'>{entry.message}</p>
                      {entry.reply && (
                        <p className='mt-2 text-xs text-brand-purple'>
                          ↳ {entry.reply}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )
          }

          if (block.blockType === 'Billetterie') {
            if (ticketTypes.length === 0) return null
            return (
              <Section
                key={key}
                heading={content.heading || 'Billetterie'}
                tinted={content.tinted}
              >
                <div className='space-y-2'>
                  {ticketTypes.map(t => (
                    <div
                      key={t.id}
                      className='flex items-center justify-between rounded-lg border border-border-soft bg-surface px-4 py-3'
                    >
                      <span className='text-sm font-medium text-ink'>
                        {t.name}
                      </span>
                      <span className='font-mono text-sm text-muted'>
                        {t.priceCents === 0
                          ? 'Gratuit'
                          : `${(t.priceCents / 100).toLocaleString(
                              'fr-FR'
                            )} FCFA`}
                      </span>
                    </div>
                  ))}
                </div>
                <p className='mt-3 text-center text-xs text-faint'>
                  Billets non vendus en ligne : contactez directement
                  l'organisateur pour réserver.
                </p>
              </Section>
            )
          }

          if (block.blockType === 'Localisation') {
            return (
              <Section
                key={key}
                heading={content.heading || 'Comment nous rejoindre'}
                tinted={content.tinted}
              >
                <p className='text-center text-sm text-muted'>
                  {event.locationAddress ||
                    content.address ||
                    'Lieu à confirmer.'}
                </p>
                {content.transport && (
                  <p className='mt-2 text-center text-xs text-faint'>
                    {content.transport}
                  </p>
                )}
              </Section>
            )
          }

          if (block.blockType === 'Rsvp') {
            return (
              <Section
                key={key}
                heading={content.heading || 'Confirmez votre présence'}
                tinted={content.tinted}
              >
                <p className='text-center text-sm text-muted'>
                  Utilisez le lien d'invitation personnel qui vous a été envoyé
                  pour confirmer.
                </p>
              </Section>
            )
          }

          if (!content.heading && !content.body) return null
          return (
            <Section
              key={key}
              heading={content.heading}
              tinted={content.tinted}
            >
              {content.body && (
                <p className='text-center text-sm whitespace-pre-line text-muted'>
                  {content.body}
                </p>
              )}
            </Section>
          )
        })}

      <div className='mx-auto max-w-2xl px-6 pb-10'>
        <div
          className='rounded-2xl border border-border-soft bg-surface p-6 text-center'
          style={{ borderRadius: 'var(--site-panel-radius)' }}
        >
          <p className='text-sm font-medium text-ink'>
            Vous avez reçu une invitation personnelle ?
          </p>
          <p className='mt-1.5 text-sm text-muted'>
            Utilisez le lien qui vous a été envoyé pour confirmer votre
            présence.
          </p>
          <Link
            to={`/cadeaux/${event.slug}`}
            className='mt-4 inline-block text-sm font-medium text-brand-purple hover:underline'
          >
            Voir la liste de cadeaux →
          </Link>
        </div>
      </div>
    </div>
  )
}
