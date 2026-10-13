import TemplatePreview, { TemplateBadge } from '../templates/TemplatePreview'
import { Check, Plus } from 'lucide-react'
import { templatesForCategory } from '../../utils/templateTheme'

export default function TemplateStep ({
  categoryCode,
  categoryLabel,
  selected,
  onSelect
}) {
  const matches = templatesForCategory(categoryCode, categoryLabel)

  return (
    <div>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-ink'>
            Choisissez un point de départ
          </h2>
          <p className='mt-2 text-sm text-muted'>
            Un modèle prêt à publier, ou une page vierge à composer librement
            dans le Builder.
          </p>
        </div>
      </div>

      <div className='mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3'>
        {matches.map(tpl => {
          const isSelected = selected === tpl.name
          return (
            <button
              key={tpl.name}
              type='button'
              onClick={() => onSelect(tpl.name)}
              className={`relative overflow-hidden rounded-2xl text-left ${
                isSelected ? 'ring-2 ring-brand-purple' : ''
              }`}
            >
              <div className='relative aspect-4/5 bg-[linear-gradient(160deg,_var(--color-surface-2),_var(--color-panel))]'>
                <TemplatePreview preview={tpl.preview} minimal={tpl.minimal} template={tpl} />
                <TemplateBadge badge={tpl.badge} />
                {isSelected && (
                  <span className='absolute top-3 left-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-brand-purple text-white'>
                    <Check className='h-3.5 w-3.5' />
                  </span>
                )}
              </div>
              <div className='bg-surface px-3 py-3'>
                <p className='font-medium text-ink'>{tpl.name}</p>
                <p className='mt-0.5 text-xs text-faint'>{tpl.meta}</p>
              </div>
            </button>
          )
        })}

        <button
          type='button'
          onClick={() => onSelect('Page vierge')}
          className={`flex aspect-4/5 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-center transition ${
            selected === 'Page vierge'
              ? 'border-brand-purple bg-brand-purple/10'
              : 'border-border hover:border-faint'
          }`}
        >
          <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2'>
            <Plus className='h-4 w-4 text-muted' />
          </span>
          <span className='text-sm font-medium text-ink'>Page vierge</span>
          <span className='max-w-[9rem] text-xs text-faint'>
            Composer librement dans le Builder
          </span>
        </button>
      </div>

      {matches.length === 0 && (
        <p className='mt-4 text-xs text-faint'>
          Aucun modèle n'est encore associé à cette catégorie. Vous pouvez
          commencer avec une page vierge.
        </p>
      )}
    </div>
  )
}
