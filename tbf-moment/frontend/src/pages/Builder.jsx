import { LayoutPanelLeft, Monitor, Smartphone, X } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import BlockLibrary from '../components/builder/BlockLibrary'
import BuilderCanvas from '../components/builder/BuilderCanvas'
import StylePanel from '../components/builder/StylePanel'
import Toggle from '../components/builder/Toggle'
import Button from '../components/ui/Button'
import { BLOCK_CONTENT_DEFAULTS } from '../data/blockDefaults'
import { slugify } from '../utils/slugify'

const PALETTE = ['#6549e8', '#ec4ec2', '#ff7a3d', '#f6c945', '#c026d3']

const INITIAL_BLOCKS = ['Rebours', 'Histoire', 'Programme', 'RSVP', 'Galerie', 'Localisation']

const DEFAULT_EVENT = {
  name: 'Mariage Awa & Ibrahim',
  date: '14 mars 2027',
  time: '16:00',
}

function heroTitleFromName(name) {
  return name.split(' de ').pop() || name
}

export default function Builder() {
  const location = useLocation()
  const incomingEvent = location.state?.event

  const eventTitle = incomingEvent?.name ?? DEFAULT_EVENT.name
  const heroTitle = incomingEvent
    ? heroTitleFromName(incomingEvent.name)
    : heroTitleFromName(DEFAULT_EVENT.name)
  const heroSubtitle = incomingEvent
    ? [incomingEvent.date, incomingEvent.time, incomingEvent.location]
        .filter(Boolean)
        .join(' · ')
    : `${DEFAULT_EVENT.date} · ${DEFAULT_EVENT.time}`
  const slug = slugify(heroTitle)

  const [pageBlocks, setPageBlocks] = useState(INITIAL_BLOCKS)
  const [selectedBlock, setSelectedBlock] = useState('Hero')
  const [device, setDevice] = useState('desktop')
  const [published, setPublished] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [justPublished, setJustPublished] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [blockContent, setBlockContent] = useState(BLOCK_CONTENT_DEFAULTS)

  const [heroStyle, setHeroStyle] = useState(() => ({
    color: PALETTE[0],
    font: 'Plus Jakarta Sans + DM Sans',
    blockHeight: 72,
    darkOverlay: true,
    entryAnimation: false,
    title: heroTitle,
    subtitle: heroSubtitle,
  }))

  const handleSelectBlock = (block) => {
    if (block !== 'Hero') {
      setPageBlocks((prev) => (prev.includes(block) ? prev : [...prev, block]))
    }
    setSelectedBlock(block)
  }

  const updateBlockContent = (block, patch) =>
    setBlockContent((prev) => ({ ...prev, [block]: { ...prev[block], ...patch } }))

  const handlePublishClick = () => {
    if (published) {
      setPublished(false)
      return
    }
    setPublishing(true)
    setTimeout(() => {
      setPublished(true)
      setPublishing(false)
      setJustPublished(true)
      setTimeout(() => setJustPublished(false), 4000)
    }, 700)
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
              <span className="ml-2 hidden text-xs text-faint sm:inline">
                modifié il y a 2 min
              </span>
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
                <Toggle label="Publié" checked={published} onChange={setPublished} />
                <Button variant="outline" onClick={() => setPreviewMode(true)}>
                  Prévisualiser
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

      {justPublished && (
        <div className="flex items-center gap-3 border-b border-success/30 bg-success/10 px-4 py-2 text-sm sm:px-6">
          <span className="text-success">Événement publié —</span>
          <span className="font-mono text-ink">tbfmoment.com/{slug}</span>
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className="ml-auto text-brand-purple hover:underline"
          >
            Voir la page
          </button>
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
          device={device}
          heroStyle={heroStyle}
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
