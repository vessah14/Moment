import { LayoutPanelLeft, Monitor, Smartphone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BlockLibrary from '../components/builder/BlockLibrary'
import BuilderCanvas from '../components/builder/BuilderCanvas'
import StylePanel from '../components/builder/StylePanel'
import Toggle from '../components/builder/Toggle'
import Button from '../components/ui/Button'
import DashboardLayout from '../components/layout/DashboardLayout'
import { BLOCK_CONTENT_DEFAULTS } from '../data/blockDefaults'
import { getEvent, updateEvent as updateEventApi } from '../api/events'
import {
  createEventBlock,
  deleteEventBlock,
  listEventBlocks,
  updateEventBlock,
} from '../api/eventBlocks'
import { formatEventDate } from '../utils/eventStatus'

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

export default function Builder() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [event, setEvent] = useState(null)
  const [existingBlocks, setExistingBlocks] = useState([])

  const [pageBlocks, setPageBlocks] = useState([])
  const [selectedBlock, setSelectedBlock] = useState('Hero')
  const [device, setDevice] = useState('desktop')
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
  })

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [savedJustNow, setSavedJustNow] = useState(false)

  useEffect(() => {
    if (!eventId) {
      setLoadError('Aucun événement sélectionné.')
      setLoading(false)
      return
    }
    let cancelled = false
    Promise.all([getEvent(eventId), listEventBlocks(eventId)])
      .then(([eventData, blocks]) => {
        if (cancelled) return
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
        setHeroStyle({
          color: heroContent.color || PALETTE[0],
          font: heroContent.font || 'Plus Jakarta Sans + DM Sans',
          blockHeight: heroContent.blockHeight ?? 72,
          darkOverlay: heroContent.darkOverlay ?? true,
          entryAnimation: heroContent.entryAnimation ?? false,
          title: heroContent.title || heroTitleFromName(eventData.name),
          subtitle: heroContent.subtitle || heroSubtitleFromEvent(eventData),
        })

        const others = (blocks ?? [])
          .filter((b) => b.blockType !== 'Hero')
          .sort((a, b) => a.position - b.position)
        setPageBlocks(others.map((b) => b.blockType))

        const loadedContent = {}
        for (const b of others) {
          try {
            loadedContent[b.blockType] = JSON.parse(b.content || '{}')
          } catch {
            loadedContent[b.blockType] = {}
          }
        }
        setBlockContent({ ...BLOCK_CONTENT_DEFAULTS, ...loadedContent })
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

  const handleSelectBlock = (block) => {
    if (block !== 'Hero') {
      setPageBlocks((prev) => (prev.includes(block) ? prev : [...prev, block]))
    }
    setSelectedBlock(block)
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

  const handleSave = async () => {
    if (!eventId) return
    setSaving(true)
    setSaveError('')
    try {
      const existingByType = new Map(existingBlocks.map((b) => [b.blockType, b]))

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
      await updateEventApi(eventId, {
        name: event.name,
        categoryId: event.categoryId,
        status: nextPublished ? 'Publie' : 'Brouillon',
        eventDate: event.eventDate,
        startTime: event.startTime,
        coverImageUrl: event.coverImageUrl,
        themeColor: event.themeColor,
        themeFont: event.themeFont,
        customFields: event.customFields,
      })
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
    <div className="flex h-svh flex-col">
      <div className="flex items-center gap-4 border-b border-border-soft/60 px-4 py-3 sm:px-6">
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

            <div className="ml-auto flex items-center gap-4">
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
                variant="gradient"
                disabled={publishing}
                onClick={handlePublishClick}
                className="disabled:opacity-70"
              >
                {publishing ? 'Publication...' : published ? 'Publié ✓' : 'Publier'}
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

      <div className="hidden flex-1 overflow-hidden lg:flex">
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
          onSelectBlock={setSelectedBlock}
          onChangeBlockContent={updateBlockContent}
          onReorderBlock={handleReorderBlock}
          onRemoveBlock={handleRemoveBlock}
          device={device}
          heroStyle={heroStyle}
          eventDateTime={event.eventDate ? `${event.eventDate}T${event.startTime ?? '00:00:00'}` : ''}
          readOnly={previewMode}
        />
        {!previewMode && (
          <StylePanel
            palette={PALETTE}
            heroStyle={heroStyle}
            onChangeHeroStyle={setHeroStyle}
            selectedBlock={selectedBlock}
            blockContent={blockContent}
            onChangeBlockContent={updateBlockContent}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center lg:hidden">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2">
          <LayoutPanelLeft className="h-5 w-5 text-muted" />
        </span>
        <p className="font-semibold text-ink">
          L'Event Builder nécessite un écran plus large
        </p>
        <p className="max-w-xs text-sm text-faint">
          Utilisez une tablette ou un ordinateur pour composer les blocs de
          votre site d'événement.
        </p>
      </div>
    </div>
  )
}
