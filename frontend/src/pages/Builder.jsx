import { ArrowLeft, Eye, LayoutPanelLeft, Monitor, Save, SlidersHorizontal, Smartphone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BlockLibrary from '../components/builder/BlockLibrary'
import BuilderCanvas from '../components/builder/BuilderCanvas'
import StylePanel from '../components/builder/StylePanel'
import Toggle from '../components/builder/Toggle'
import Button from '../components/ui/Button'
import DashboardLayout from '../components/layout/DashboardLayout'
import { BLOCK_CONTENT_DEFAULTS } from '../data/blockDefaults'
import {
  getEvent,
  updateEvent as updateEventApi,
  uploadEventBlockImage,
} from '../api/events'
import { listEventCategories } from '../api/eventCategories'
import { listEventLocations } from '../api/eventLocations'
import { listGalleryPhotos, uploadGalleryPhoto } from '../api/gallery'
import {
  createGuestBookEntry,
  listGuestBookEntries,
  updateGuestBookStatus,
} from '../api/guestBook'
import { listProgramItems } from '../api/program'
import { listTicketTypes } from '../api/ticketing'
import { listGiftItems } from '../api/giftRegistry'
import { listTables } from '../api/seating'
import {
  createEventBlock,
  deleteEventBlock,
  listEventBlocks,
  updateEventBlock,
} from '../api/eventBlocks'
import { formatEventDate } from '../utils/eventStatus'
import {
  defaultFontForTemplate,
  normalizeBlockType,
  newEventPageBlocks,
  reconcileTemplateLayout,
  resolveSiteStyle,
  templateBlockDefaults,
  templateFromCustomFields,
  templatesForEventType,
} from '../utils/templateTheme'
import { useSeo } from '../utils/seo'
import { defaultTicketStyle, ticketFromCustomFields } from '../utils/ticketStyles'
import { ticketEventInfo } from '../components/tickets/TicketCard'

const PALETTE = ['#6549e8', '#ec4ec2', '#ff7a3d', '#f6c945', '#c026d3']

function heroTitleFromName(name) {
  return name?.split(' de ').pop() || name || ''
}

function heroSubtitleFromEvent(event) {
  return [
    event?.eventDate ? formatEventDate(event.eventDate) : null,
    event?.startTime ? event.startTime.slice(0, 5) : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

function customFieldOf(event, key) {
  try {
    return JSON.parse(event?.customFields || '{}')?.[key] ?? ''
  } catch {
    return ''
  }
}

export default function Builder() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [event, setEvent] = useState(null)
  const [existingBlocks, setExistingBlocks] = useState([])

  const [pageBlocks, setPageBlocks] = useState([])
  const [selectedBlock, setSelectedBlock] = useState('Hero')
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches,
  )
  const [device, setDevice] = useState('desktop')
  const [mobileView, setMobileView] = useState('preview')
  const [published, setPublished] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [justPublished, setJustPublished] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [blockContent, setBlockContent] = useState(BLOCK_CONTENT_DEFAULTS)
  const [heroStyle, setHeroStyle] = useState({
    color: PALETTE[0],
    font: 'Plus Jakarta Sans + DM Sans',
    blockHeight: 72,
    darkOverlay: true,
    entryAnimation: false,
    title: '',
    subtitle: '',
    customStyle: false,
    // Modèles premium : palette, motif de fond et accroche de l'en-tête.
    palette: null,
    motif: null,
    kicker: '',
  })

  // Photos publiées de la galerie : ce sont elles que le bloc Galerie affiche en ligne.
  const [galleryPhotos, setGalleryPhotos] = useState([])
  // Données réelles affichées par les blocs, comme sur le site public.
  const [siteData, setSiteData] = useState({
    programItems: [],
    guestBookEntries: [],
    ticketTypes: [],
    location: null,
    gifts: [],
    seatingTables: [],
  })
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState([])
  // Modèle changé dans l'onglet "Modèle" : à enregistrer sur l'événement (customFields).
  const [templateDirty, setTemplateDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [savedJustNow, setSavedJustNow] = useState(false)
  useSeo({ title: event?.name ? `Builder · ${event.name}` : 'Builder', noindex: true })

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const updateViewport = (event) => setIsDesktop(event.matches)
    media.addEventListener('change', updateViewport)
    return () => media.removeEventListener('change', updateViewport)
  }, [])

  useEffect(() => {
    let cancelled = false
    listEventCategories()
      .then((data) => {
        if (!cancelled) setCategories(data ?? [])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!eventId) {
      setLoadError('Aucun événement sélectionné.')
      setLoading(false)
      return
    }
    let cancelled = false
    Promise.all([
      getEvent(eventId),
      listEventBlocks(eventId),
      listGalleryPhotos(eventId).catch(() => []),
      listProgramItems(eventId).catch(() => []),
      listGuestBookEntries(eventId).catch(() => []),
      listTicketTypes(eventId).catch(() => []),
      listEventLocations(eventId).catch(() => []),
      listGiftItems(eventId).catch(() => []),
      listTables(eventId).catch(() => []),
    ])
      .then(([eventData, blocks, photos, program, guestBook, tickets, locations, gifts, tables]) => {
        if (cancelled) return
        setGalleryPhotos((photos ?? []).filter((p) => p.status === 'Publie'))
        setSiteData({
          programItems: program ?? [],
          guestBookEntries: (guestBook ?? []).filter((g) => g.status === 'Publie').slice(0, 20),
          ticketTypes: tickets ?? [],
          location: locations?.[0] ?? null,
          gifts: gifts ?? [],
          // Même numérotation que le site public : ordre du plan, à partir de 1.
          seatingTables: [...(tables ?? [])]
            .sort((a, b) => a.position - b.position)
            .map((t, i) => ({ number: i + 1, label: t.label, capacity: t.capacity })),
        })
        setEvent(eventData)
        setExistingBlocks(blocks ?? [])
        setPublished(eventData.status === 'Publie')

        const heroBlock = (blocks ?? []).find((b) => b.blockType === 'Hero')
        let heroContent = {}
        try {
          heroContent = heroBlock ? JSON.parse(heroBlock.content || '{}') : {}
        } catch {
          heroContent = {}
        }
        // Le modèle choisi dans l'assistant fournit couleur et police tant que
        // l'organisateur ne les a pas changées lui-même ici (customStyle).
        const template = templateFromCustomFields(eventData.customFields)
        const siteStyle = resolveSiteStyle({
          template,
          heroContent,
          themeColor: eventData.themeColor,
        })
        setHeroStyle({
          color: siteStyle.accent,
          font: siteStyle.fontKey,
          customStyle: Boolean(heroContent.customStyle),
          customTitle: Boolean(heroContent.customTitle),
          palette: heroContent.palette ?? null,
          motif: heroContent.motif ?? null,
          kicker: heroContent.kicker ?? '',
          blockHeight: heroContent.blockHeight ?? 72,
          darkOverlay: heroContent.darkOverlay ?? true,
          entryAnimation: heroContent.entryAnimation ?? false,
          title: heroContent.title || (() => {
            const age = Number(customFieldOf(eventData, 'birthdayAge')) || null
            return age && template?.categoryCode === 'anniversaire'
              ? `Les ${age} ans de ${eventData.name.replace(/^Les\s+\d+\s+ans\s+de\s*/i, '').trim()}`
              : heroTitleFromName(eventData.name)
          })(),
          subtitle:
            heroContent.subtitle ||
            customFieldOf(eventData, 'tagline') ||
            heroSubtitleFromEvent(eventData),
        })

        const others = (blocks ?? [])
          .filter((b) => b.blockType !== 'Hero')
          .sort((a, b) => a.position - b.position)
        // Page encore vide : on part de la composition du modèle (enregistrée au
        // premier clic sur Enregistrer / Publier).
        setPageBlocks(
          others.length > 0
            ? others.map((b) => normalizeBlockType(b.blockType))
            : newEventPageBlocks(template),
        )

        const loadedContent = {}
        for (const b of others) {
          const type = normalizeBlockType(b.blockType)
          try {
            loadedContent[type] = JSON.parse(b.content || '{}')
          } catch {
            loadedContent[type] = {}
          }
        }
        setBlockContent({
          ...BLOCK_CONTENT_DEFAULTS,
          ...(others.length > 0 ? {} : templateBlockDefaults(template)),
          ...loadedContent,
        })
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || "Impossible de charger l'événement.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [eventId])

  const eventTitle = event?.name ?? ''
  const slug = event?.slug ?? ''
  const template = templateFromCustomFields(event?.customFields)
  const category = categories.find((c) => c.id === event?.categoryId) ?? null
  const birthdayAge = Number(customFieldOf(event, 'birthdayAge')) || null
  const birthdayTitle = birthdayAge && template?.categoryCode === 'anniversaire'
    ? `Les ${birthdayAge} ans de ${(event?.name ?? '').replace(/^Les\s+\d+\s+ans\s+de\s*/i, '').trim()}`
    : heroTitleFromName(event?.name)
  const displayedHeroStyle = template?.categoryCode === 'anniversaire' && birthdayAge && !heroStyle.customTitle
    ? { ...heroStyle, title: birthdayTitle }
    : heroStyle
  // Les modèles suivent le type exact choisi à la création (anniversaire, noces, concert…).
  const categoryTemplates = templatesForEventType(
    customFieldOf(event, 'eventType'),
    category?.code,
    category?.label,
  )

  // Billet choisi pour l'événement, rangé dans customFields.ticket (enregistré avec l'événement).
  const ticket = ticketFromCustomFields(event?.customFields)
  const handleChangeTicket = (patch) => {
    setEvent((prev) => {
      let fields = {}
      try {
        fields = JSON.parse(prev.customFields || '{}') ?? {}
      } catch {
        fields = {}
      }
      return { ...prev, customFields: JSON.stringify({ ...fields, ticket: { ...(fields.ticket ?? {}), ...patch } }) }
    })
    setTemplateDirty(true)
  }

  const handleApplyTemplate = (next) => {
    setEvent((prev) => {
      let fields = {}
      try {
        fields = JSON.parse(prev.customFields || '{}') ?? {}
      } catch {
        fields = {}
      }
      return { ...prev, customFields: JSON.stringify({ ...fields, template: next.name }) }
    })
    setTemplateDirty(true)
    // Le modèle reprend la main sur les couleurs et la police ; textes et photos restent.
    setHeroStyle((prev) => ({
      ...prev,
      color: next.preview.accent,
      font: defaultFontForTemplate(next),
      customStyle: false,
      palette: null,
      motif: null,
    }))
    const layout = reconcileTemplateLayout(next, {
      previousTemplate: template,
      content: blockContent,
    })
    setBlockContent((prev) => ({ ...prev, ...layout.content }))
    setPageBlocks(layout.blocks)
  }

  const eventDto = (status) => ({
    name: event.name,
    categoryId: event.categoryId,
    status,
    eventDate: event.eventDate,
    startTime: event.startTime,
    coverImageUrl: event.coverImageUrl,
    themeColor: event.themeColor,
    themeFont: event.themeFont,
    customFields: event.customFields,
  })
  const eventDescription = customFieldOf(event, 'description')
  // La couleur du modèle est toujours proposée en premier dans la palette.
  const palette = [...new Set([template?.preview?.accent, ...PALETTE].filter(Boolean))]

  const handleChangeHeroStyle = (next) =>
    setHeroStyle((prev) => ({
      ...next,
      customTitle: prev.customTitle || next.title !== prev.title,
      customStyle:
        prev.customStyle || next.color !== prev.color || next.font !== prev.font,
    }))

  const handleSelectBlock = (block) => {
    if (block !== 'Hero') {
      setPageBlocks((prev) => (prev.includes(block) ? prev : [...prev, block]))
    }
    setSelectedBlock(block)
    setMobileView('settings')
  }

  const updateBlockContent = (block, patch) =>
    setBlockContent((prev) => ({ ...prev, [block]: { ...prev[block], ...patch } }))

  const handleReorderBlock = (block, direction) => {
    setPageBlocks((prev) => {
      const index = prev.indexOf(block)
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
      return next
    })
  }

  const handleRemoveBlock = (block) => {
    setPageBlocks((prev) => prev.filter((b) => b !== block))
    setSelectedBlock((prev) => (prev === block ? 'Hero' : prev))
  }

  const handleUploadBlockImage = async (block, file) => {
    if (!file) return
    setUploading(true)
    setSaveError('')
    try {
      const { url } = await uploadEventBlockImage(eventId, file)
      updateBlockContent(block, { imageUrl: url })
    } catch (err) {
      setSaveError(err.message || "La photo n'a pas pu être envoyée.")
    } finally {
      setUploading(false)
    }
  }

  // Les photos ajoutées ici vont directement dans la galerie de l'événement (publiées).
  const handleUploadGalleryPhotos = async (files) => {
    if (!files?.length) return
    setUploading(true)
    setSaveError('')
    const failed = []
    let reason = ''
    for (const file of files) {
      try {
        const photo = await uploadGalleryPhoto(file, eventId)
        setGalleryPhotos((prev) => [photo, ...prev])
      } catch (err) {
        failed.push(file.name)
        reason ||= err.message
      }
    }
    // La raison du serveur (ex. limite de photos de l'offre) est affichée telle quelle.
    if (failed.length)
      setSaveError(`Photo(s) non envoyée(s) : ${failed.join(', ')}.${reason ? ` ${reason}` : ''}`)
    setUploading(false)
  }

  // Message écrit par l'organisateur depuis le Builder : enregistré en base puis publié
  // directement (pas de modération pour ses propres messages). Une erreur remonte au
  // formulaire, qui l'affiche.
  const handleAddGuestBookEntry = async (dto) => {
    const entry = await createGuestBookEntry(dto, eventId)
    const published = await updateGuestBookStatus(entry.id, 'Publie')
    setSiteData((prev) => ({
      ...prev,
      guestBookEntries: [published, ...prev.guestBookEntries].slice(0, 20),
    }))
  }

  const handleSave = async () => {
    if (!eventId) return
    setSaving(true)
    setSaveError('')
    try {
      if (templateDirty) {
        await updateEventApi(eventId, eventDto(published ? 'Publie' : 'Brouillon'))
        setTemplateDirty(false)
      }
      const existingByType = new Map(
        existingBlocks.map((b) => [normalizeBlockType(b.blockType), b]),
      )

      // Décale d'abord tous les blocs existants vers des positions temporaires
      // négatives : la contrainte unique (event_id, position) en base
      // refuserait sinon un réordonnancement où deux blocs échangeraient leurs
      // positions (l'un prendrait la place que l'autre occupe encore).
      const toReposition = [...existingByType.values()].filter((b) => b.blockType !== 'Hero')
      for (const b of toReposition) {
        await updateEventBlock(b.id, {
          blockType: b.blockType,
          position: -(b.position + 1000),
          isVisible: true,
          content: b.content,
        })
      }

      const heroContent = JSON.stringify({
        color: heroStyle.color,
        font: heroStyle.font,
        blockHeight: heroStyle.blockHeight,
        darkOverlay: heroStyle.darkOverlay,
        entryAnimation: heroStyle.entryAnimation,
        title: heroStyle.title,
        subtitle: heroStyle.subtitle,
        customStyle: heroStyle.customStyle,
        customTitle: heroStyle.customTitle,
        palette: heroStyle.palette,
        motif: heroStyle.motif,
        kicker: heroStyle.kicker,
      })
      const heroExisting = existingByType.get('Hero')
      if (heroExisting) {
        await updateEventBlock(heroExisting.id, {
          blockType: 'Hero',
          position: 0,
          isVisible: true,
          content: heroContent,
        })
      } else {
        await createEventBlock({ blockType: 'Hero', position: 0, isVisible: true, content: heroContent }, eventId)
      }

      for (let i = 0; i < pageBlocks.length; i++) {
        const type = pageBlocks[i]
        const content = JSON.stringify(blockContent[type] ?? {})
        const existing = existingByType.get(type)
        if (existing) {
          await updateEventBlock(existing.id, { blockType: type, position: i + 1, isVisible: true, content })
        } else {
          await createEventBlock({ blockType: type, position: i + 1, isVisible: true, content }, eventId)
        }
      }

      for (const [type, b] of existingByType) {
        if (type !== 'Hero' && !pageBlocks.includes(type)) {
          await deleteEventBlock(b.id)
        }
      }

      const fresh = await listEventBlocks(eventId)
      setExistingBlocks(fresh ?? [])
      setSavedJustNow(true)
      setTimeout(() => setSavedJustNow(false), 2500)
    } catch (err) {
      setSaveError(err.message || "L'enregistrement a échoué.")
    } finally {
      setSaving(false)
    }
  }

  const handlePublishClick = async () => {
    if (!event) return
    const nextPublished = !published
    setPublishing(true)
    setSaveError('')
    try {
      await handleSave()
      await updateEventApi(eventId, eventDto(nextPublished ? 'Publie' : 'Brouillon'))
      setPublished(nextPublished)
      if (nextPublished) {
        setJustPublished(true)
        setTimeout(() => setJustPublished(false), 4000)
      }
    } catch (err) {
      setSaveError(err.message || 'La publication a échoué.')
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <p className="rounded-2xl border border-dashed border-border-soft py-20 text-center text-sm text-faint">
          Chargement de l'événement…
        </p>
      </DashboardLayout>
    )
  }

  if (loadError || !event) {
    return (
      <DashboardLayout>
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {loadError || 'Événement introuvable.'}
        </p>
        <Button variant="outline" className="mt-6" onClick={() => navigate('/dashboard/evenements')}>
          Retour à mes événements
        </Button>
      </DashboardLayout>
    )
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-border-soft/60 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
        {previewMode ? (
          <>
            <span className="font-semibold text-ink">Aperçu invité</span>
            <Button
              variant="outline"
              className="ml-auto"
              onClick={() => setPreviewMode(false)}
            >
              <X className="h-4 w-4" />
              Quitter l'aperçu
            </Button>
          </>
        ) : (
          <>
            <Link
              to="/dashboard/evenements"
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition hover:border-faint hover:text-ink"
              title="Retour au tableau de bord (pensez à enregistrer avant)"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Tableau de bord</span>
            </Link>
            <div className="min-w-0">
              <span className="truncate font-semibold text-ink">
                {eventTitle}
              </span>
              {savedJustNow && (
                <span className="ml-2 hidden text-xs text-success sm:inline">
                  Enregistré
                </span>
              )}
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
              <div className="hidden gap-1.5 rounded-lg border border-border p-1 lg:flex">
                <button
                  type="button"
                  onClick={() => setDevice('desktop')}
                  className={`rounded-md p-1.5 ${device === 'desktop' ? 'bg-surface-2 text-ink' : 'text-faint'}`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDevice('mobile')}
                  className={`rounded-md p-1.5 ${device === 'mobile' ? 'bg-surface-2 text-ink' : 'text-faint'}`}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>

              <div className="hidden items-center gap-4 lg:flex">
                <Toggle label="Publié" checked={published} onChange={handlePublishClick} />
                <Button variant="outline" onClick={() => setPreviewMode(true)}>
                  Prévisualiser
                </Button>
                <Button variant="outline" disabled={saving} onClick={handleSave} className="disabled:opacity-70">
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
              <Button
                variant="outline"
                disabled={saving}
                onClick={handleSave}
                aria-label={saving ? 'Enregistrement en cours' : 'Enregistrer'}
                className="h-10 w-10 p-0 disabled:opacity-70 lg:hidden"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="gradient"
                disabled={publishing}
                onClick={handlePublishClick}
                className="px-3 text-xs disabled:opacity-70 sm:px-4 sm:text-sm"
              >
                <span className="sm:hidden">{publishing ? '…' : published ? 'Publié ✓' : 'Publier'}</span>
                <span className="hidden sm:inline">{publishing ? 'Publication...' : published ? 'Publié ✓' : 'Publier'}</span>
              </Button>
            </div>
          </>
        )}
      </div>

      {saveError && (
        <div className="border-b border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger sm:px-6">
          {saveError}
        </div>
      )}

      {justPublished && (
        <div className="flex items-center gap-3 border-b border-success/30 bg-success/10 px-4 py-2 text-sm sm:px-6">
          <span className="text-success">Événement publié —</span>
          <span className="font-mono text-ink">{window.location.origin}/e/{slug}</span>
          <a
            href={`/e/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-brand-purple hover:underline"
          >
            Voir la page
          </a>
        </div>
      )}

      {isDesktop && <div className="flex min-h-0 flex-1 overflow-hidden">
        {!previewMode && (
          <BlockLibrary
            pageBlocks={pageBlocks}
            selected={selectedBlock}
            onSelect={handleSelectBlock}
          />
        )}
        <BuilderCanvas
          slug={slug}
          blocks={pageBlocks}
          blockContent={blockContent}
          selectedBlock={previewMode ? null : selectedBlock}
          onSelectBlock={handleSelectBlock}
          onChangeBlockContent={updateBlockContent}
          onReorderBlock={handleReorderBlock}
          onRemoveBlock={handleRemoveBlock}
          device={device}
          heroStyle={displayedHeroStyle}
          template={template}
          data={{
            eventDateTime: event.eventDate
              ? `${event.eventDate}T${event.startTime ?? '00:00:00'}`
              : '',
            coverPath: event.coverImageUrl,
            description: eventDescription,
            locationLabel: siteData.location?.label,
            locationAddress: siteData.location?.address,
            programItems: siteData.programItems,
            galleryPhotos,
            guestBookEntries: siteData.guestBookEntries,
            ticketTypes: siteData.ticketTypes,
            gifts: siteData.gifts,
            seatingTables: siteData.seatingTables,
          }}
          uploading={uploading}
          onUploadBlockImage={handleUploadBlockImage}
          onUploadGalleryPhotos={handleUploadGalleryPhotos}
          onAddGuestBookEntry={handleAddGuestBookEntry}
          readOnly={previewMode}
        />
        {!previewMode && (
          <StylePanel
            palette={palette}
            heroStyle={displayedHeroStyle}
            onChangeHeroStyle={handleChangeHeroStyle}
            selectedBlock={selectedBlock}
            blockContent={blockContent}
            onChangeBlockContent={updateBlockContent}
            templates={categoryTemplates}
            currentTemplate={template}
            categoryLabel={category?.label}
            onApplyTemplate={handleApplyTemplate}
            ticket={ticket}
            defaultTicketStyle={defaultTicketStyle(template?.theme)}
            onChangeTicket={handleChangeTicket}
            ticketEvent={event ? ticketEventInfo({ name: event.name, eventDate: event.eventDate, startTime: event.startTime, slug: event.slug }) : null}
          />
        )}
      </div>}

      {!isDesktop && <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {previewMode ? (
          <BuilderCanvas
            slug={slug}
            blocks={pageBlocks}
            blockContent={blockContent}
            selectedBlock={null}
            onSelectBlock={handleSelectBlock}
            onChangeBlockContent={updateBlockContent}
            onReorderBlock={handleReorderBlock}
            onRemoveBlock={handleRemoveBlock}
            device="mobile"
            heroStyle={displayedHeroStyle}
            template={template}
            data={{
              eventDateTime: event.eventDate
                ? `${event.eventDate}T${event.startTime ?? '00:00:00'}`
                : '',
              coverPath: event.coverImageUrl,
              description: eventDescription,
              locationLabel: siteData.location?.label,
              locationAddress: siteData.location?.address,
              programItems: siteData.programItems,
              galleryPhotos,
              guestBookEntries: siteData.guestBookEntries,
              ticketTypes: siteData.ticketTypes,
              gifts: siteData.gifts,
              seatingTables: siteData.seatingTables,
            }}
            uploading={uploading}
            onUploadBlockImage={handleUploadBlockImage}
            onUploadGalleryPhotos={handleUploadGalleryPhotos}
            onAddGuestBookEntry={handleAddGuestBookEntry}
            readOnly
          />
        ) : mobileView === 'blocks' ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <BlockLibrary
              pageBlocks={pageBlocks}
              selected={selectedBlock}
              onSelect={handleSelectBlock}
              className="w-full border-0 p-4"
            />
          </div>
        ) : mobileView === 'settings' ? (
          <StylePanel
            palette={palette}
            heroStyle={displayedHeroStyle}
            onChangeHeroStyle={handleChangeHeroStyle}
            selectedBlock={selectedBlock}
            blockContent={blockContent}
            onChangeBlockContent={updateBlockContent}
            templates={categoryTemplates}
            currentTemplate={template}
            categoryLabel={category?.label}
            onApplyTemplate={handleApplyTemplate}
            ticket={ticket}
            defaultTicketStyle={defaultTicketStyle(template?.theme)}
            onChangeTicket={handleChangeTicket}
            ticketEvent={event ? ticketEventInfo({ name: event.name, eventDate: event.eventDate, startTime: event.startTime, slug: event.slug }) : null}
            className="min-h-0 w-full flex-1 overflow-y-auto border-0 p-4 pb-8"
          />
        ) : (
          <BuilderCanvas
            slug={slug}
            blocks={pageBlocks}
            blockContent={blockContent}
            selectedBlock={selectedBlock}
            onSelectBlock={handleSelectBlock}
            onChangeBlockContent={updateBlockContent}
            onReorderBlock={handleReorderBlock}
            onRemoveBlock={handleRemoveBlock}
            device="mobile"
            heroStyle={displayedHeroStyle}
            template={template}
            data={{
              eventDateTime: event.eventDate
                ? `${event.eventDate}T${event.startTime ?? '00:00:00'}`
                : '',
              coverPath: event.coverImageUrl,
              description: eventDescription,
              locationLabel: siteData.location?.label,
              locationAddress: siteData.location?.address,
              programItems: siteData.programItems,
              galleryPhotos,
              guestBookEntries: siteData.guestBookEntries,
              ticketTypes: siteData.ticketTypes,
              gifts: siteData.gifts,
              seatingTables: siteData.seatingTables,
            }}
            uploading={uploading}
            onUploadBlockImage={handleUploadBlockImage}
            onUploadGalleryPhotos={handleUploadGalleryPhotos}
            onAddGuestBookEntry={handleAddGuestBookEntry}
          />
        )}

        {!previewMode && (
          <nav
            aria-label="Outils de personnalisation"
            className="grid shrink-0 grid-cols-3 border-t border-border-soft/70 bg-panel pb-[env(safe-area-inset-bottom)]"
          >
            {[
              { id: 'blocks', label: 'Blocs', Icon: LayoutPanelLeft },
              { id: 'preview', label: 'Aperçu', Icon: Eye },
              { id: 'settings', label: 'Modifier', Icon: SlidersHorizontal },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMobileView(id)}
                aria-current={mobileView === id ? 'page' : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                  mobileView === id ? 'text-brand-purple' : 'text-muted'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </nav>
        )}
      </div>}
    </div>
  )
}
