import { useEffect } from 'react'

const HERO_FONT_STACKS = {
  'Plus Jakarta Sans + DM Sans': 'var(--font-heading)',
  'Inter + Inter': 'var(--font-sans)',
  'Playfair Display + Inter': 'var(--font-display-premium)',
}

function blockDomId(block) {
  return `builder-block-${block.replace(/\s+/g, '-')}`
}

export default function BuilderCanvas({
  slug,
  blocks,
  blockContent,
  selectedBlock,
  onSelectBlock,
  device,
  heroStyle,
  readOnly = false,
}) {
  const HeroTag = readOnly ? 'div' : 'button'
  const BlockTag = readOnly ? 'div' : 'button'

  useEffect(() => {
    if (!selectedBlock) return
    const el = document.getElementById(blockDomId(selectedBlock))
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [selectedBlock])

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <p className="text-center font-mono text-xs text-faint">
        tbfmoment.com/{slug}
      </p>

      <div
        className={`mx-auto mt-4 transition-all ${
          device === 'mobile' ? 'max-w-xs' : 'max-w-xl'
        }`}
      >
        <HeroTag
          type={readOnly ? undefined : 'button'}
          id={blockDomId('Hero')}
          onClick={readOnly ? undefined : () => onSelectBlock('Hero')}
          className={`relative block w-full overflow-hidden rounded-xl text-left ${
            selectedBlock === 'Hero' ? 'ring-2 ring-brand-purple' : ''
          }`}
        >
          {selectedBlock === 'Hero' && (
            <span className="absolute top-3 left-3 z-10 rounded-full bg-brand-purple px-2.5 py-1 text-[11px] font-semibold text-white">
              Hero
            </span>
          )}
          <div
            className="flex items-center justify-center bg-[linear-gradient(160deg,_var(--color-surface-2),_var(--color-panel))] transition-all"
            style={{
              aspectRatio: device === 'mobile' ? '9 / 14' : '16 / 9',
              height: `${Math.min(heroStyle.blockHeight, 100) * 3}px`,
            }}
          >
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background: heroStyle.darkOverlay
                  ? `linear-gradient(0deg, rgba(0,0,0,0.45), rgba(0,0,0,0.15))`
                  : 'transparent',
              }}
            >
              <div className="text-center text-white">
                <p
                  className="text-2xl font-bold"
                  style={{
                    color: heroStyle.color,
                    fontFamily: HERO_FONT_STACKS[heroStyle.font],
                  }}
                >
                  {heroStyle.title}
                </p>
                <p className="mt-1 text-sm text-white/70">{heroStyle.subtitle}</p>
              </div>
            </div>
          </div>
        </HeroTag>

        <div className="mt-3 space-y-3">
          {blocks.map((block) => {
            const content = blockContent[block]
            return (
              <BlockTag
                key={block}
                type={readOnly ? undefined : 'button'}
                id={blockDomId(block)}
                onClick={readOnly ? undefined : () => onSelectBlock(block)}
                className={`w-full rounded-lg border bg-surface px-5 py-4 text-left transition ${
                  selectedBlock === block
                    ? 'border-brand-purple'
                    : `border-border-soft ${readOnly ? '' : 'hover:border-faint'}`
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    selectedBlock === block ? 'text-ink' : 'text-muted'
                  }`}
                >
                  {content?.heading ?? block}
                </p>
                {content?.body && (
                  <p className="mt-1 line-clamp-2 text-xs text-faint">
                    {content.body}
                  </p>
                )}
              </BlockTag>
            )
          })}
        </div>

        {blocks.length === 0 && (
          <p className="mt-6 text-center text-sm text-faint">
            Cliquez un bloc à gauche pour l'ajouter à votre page.
          </p>
        )}
      </div>
    </div>
  )
}
